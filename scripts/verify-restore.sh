#!/usr/bin/env bash
# verify-restore.sh — smoke-test a Postgres backup restore
#
# Modes:
#   --check-only           Skip download & restore; run SQL checks only
#                          Requires RESTORE_TEST_URL to be set.
#
#   [dump-file]            Restore this file, then run checks.
#                          Uses RESTORE_TEST_URL if set, else spins up Docker.
#
#   (no args)              Download latest backup from R2, then restore + check.
#                          Requires R2_* env vars. Spins up Docker if no RESTORE_TEST_URL.
#
# Examples:
#   # Local full run (Docker + latest R2 backup):
#   R2_ENDPOINT=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=... \
#     ./scripts/verify-restore.sh
#
#   # CI: DB already restored, just check:
#   RESTORE_TEST_URL=postgresql://postgres:pass@localhost/restore_test \
#     ./scripts/verify-restore.sh --check-only
#
#   # Test a specific dump against an existing DB:
#   RESTORE_TEST_URL=... ./scripts/verify-restore.sh /tmp/backup.sql.gz
#
# Exit codes: 0 = all checks passed, 1 = one or more checks failed

set -euo pipefail

CHECK_ONLY=0
DUMP_FILE=""
CONTAINER=""
PASS=0
FAIL=0

# Parse args
for arg in "$@"; do
  case "$arg" in
    --check-only) CHECK_ONLY=1 ;;
    *)            DUMP_FILE="$arg" ;;
  esac
done

# ── Helpers ──────────────────────────────────────────────────────────────────

log()  { echo "[verify-restore] $*"; }
ok()   { echo "  ✓ $*"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $*" >&2; FAIL=$((FAIL + 1)); }

run_sql() {
  local label="$1"
  local query="$2"
  local result
  if result=$(psql "$RESTORE_TEST_URL" -t -A -c "$query" 2>&1); then
    ok "$label → $result"
  else
    fail "$label — $result"
  fi
}

cleanup() {
  if [[ -n "$CONTAINER" ]]; then
    log "Removing Docker container $CONTAINER"
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  fi
}

# ── Check-only mode ───────────────────────────────────────────────────────────

if [[ $CHECK_ONLY -eq 1 ]]; then
  : "${RESTORE_TEST_URL:?RESTORE_TEST_URL must be set in --check-only mode}"
  log "Check-only mode — skipping download and restore"
  # Jump straight to smoke checks below
else

  # ── Download dump if not provided ─────────────────────────────────────────

  if [[ -z "$DUMP_FILE" ]]; then
    log "No dump file given — downloading latest from R2"
    : "${R2_ENDPOINT:?R2_ENDPOINT not set}"
    : "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID not set}"
    : "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY not set}"
    : "${R2_BUCKET:?R2_BUCKET not set}"

    DUMP_FILE="/tmp/afterhours-restore-$$.sql.gz"
    LATEST_KEY=$(
      AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
      AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
      aws s3 ls "s3://${R2_BUCKET}/backups/" \
        --endpoint-url "$R2_ENDPOINT" \
        --region auto \
      | sort | tail -1 | awk '{print $4}'
    )
    if [[ -z "$LATEST_KEY" ]]; then
      echo "ERROR: No backup files found in s3://${R2_BUCKET}/backups/" >&2
      exit 1
    fi
    log "Downloading s3://${R2_BUCKET}/backups/${LATEST_KEY}"
    AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
    aws s3 cp "s3://${R2_BUCKET}/backups/${LATEST_KEY}" "$DUMP_FILE" \
      --endpoint-url "$R2_ENDPOINT" \
      --region auto
  fi

  log "Using dump: $DUMP_FILE"

  # ── Spin up Docker Postgres if no RESTORE_TEST_URL ────────────────────────

  if [[ -z "${RESTORE_TEST_URL:-}" ]]; then
    log "RESTORE_TEST_URL not set — starting local Docker Postgres"
    command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found" >&2; exit 1; }

    CONTAINER="afterhours-restore-$$"
    PG_PORT=54320
    trap cleanup EXIT

    docker run -d --name "$CONTAINER" \
      -p "${PG_PORT}:5432" \
      -e POSTGRES_PASSWORD=test \
      -e POSTGRES_DB=restore_test \
      postgres:16-alpine >/dev/null

    RESTORE_TEST_URL="postgresql://postgres:test@localhost:${PG_PORT}/restore_test"
    log "Waiting for Postgres to be ready..."
    for i in $(seq 1 30); do
      if psql "$RESTORE_TEST_URL" -c "SELECT 1" >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
    log "Postgres ready"
  fi

  # ── Restore ───────────────────────────────────────────────────────────────

  log "Restoring dump into Postgres..."
  if [[ "$DUMP_FILE" == *.gz ]]; then
    gunzip -c "$DUMP_FILE" | psql "$RESTORE_TEST_URL" -q
  else
    psql "$RESTORE_TEST_URL" -q < "$DUMP_FILE"
  fi
  log "Restore complete"

fi  # end non-check-only block

# ── Smoke checks ─────────────────────────────────────────────────────────────

log "Running smoke checks against: ${RESTORE_TEST_URL%%@*}@..."

# Row counts — tables must exist; zero rows is OK (empty DB), error is not
run_sql "entries table"                "SELECT COUNT(*) FROM entries"
run_sql "films table"                  "SELECT COUNT(*) FROM films"
run_sql "entry_chips table"            "SELECT COUNT(*) FROM entry_chips"
run_sql "streaming_availability table" "SELECT COUNT(*) FROM streaming_availability"

# Schema sanity
run_sql "no null body_md"              "SELECT COUNT(*) FROM entries WHERE body_md IS NULL"
run_sql "no orphaned chips (expect 0)" \
  "SELECT COUNT(*) FROM entry_chips ec LEFT JOIN entries e ON ec.entry_id = e.id WHERE e.id IS NULL"
run_sql "slug duplicates (expect 0)"   \
  "SELECT COUNT(*) FROM (SELECT slug FROM entries GROUP BY slug HAVING COUNT(*) > 1) t"

# ── Result ────────────────────────────────────────────────────────────────────

echo ""
log "═══ Results: ${PASS} passed, ${FAIL} failed ═══"

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
