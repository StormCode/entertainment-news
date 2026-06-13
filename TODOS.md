# TODOS — 散場之後

Deferred from plan reviews. Each item has enough context to be picked up cold.

---

## Engineering Review TODOs (from /plan-eng-review 2026-06-13)

### TODO-E1: /admin/health pipeline status page
**What:** Build a `/admin/health` page that shows `last_verified_at` per pipeline job (TMDB sync, backdrop fetch, hero feed compute, chip recompute, nightly backup).
**Why:** Design doc requires surfacing pipeline health when a cron hasn't run in 24h. Without this page the editor has no visibility into whether the data layer is functioning.
**Target:** v0.1 (not blocking v0 launch, but must exist before the first time a cron fails silently).
**Context:** GHA cron drift can skip jobs. The 24h alert threshold was agreed in the pipeline design.

### TODO-E2: scripts/verify-restore.sh
**What:** Write `scripts/verify-restore.sh` — spins up a local Docker Postgres, restores the latest `pg_dump` from R2, runs smoke queries asserting expected row counts (entries, films, streaming_availability), fails CI if restore breaks.
**Why:** "We have backups" is theater without a tested restore. An untested backup is worse than no backup — it creates false confidence.
**Target:** Day 6 (MANDATORY — do not launch without this).
**Context:** Locked in engineering review as a Day 6 hard requirement. Neon free tier has no PITR.
**Depends on:** Neon nightly pg_dump workflow (also Day 6).

---

## Design Review TODOs (from /plan-design-review 2026-06-13)

### TODO-D1: "New since last visit" marker on entry cards
**What:** Add a small 「新」badge to entry cards for articles published since the reader's last visit. Use `localStorage` to persist the last visit timestamp.
**Why:** Returning readers scan for new content first. A clear "new" marker removes the need to mentally compare dates.
**Target:** v0.1 (needs meaningful content volume to be useful — minimum ~10 entries).
**Context:** Requires localStorage; no server-side session needed. Badge uses `--gold` color, `6px × 6px` dot style, top-right of poster image.

### TODO-D2: OG card visual spec + implementation
**What:** Lock OG card layout in DESIGN.md and implement via `next/og`. Layout: full-bleed backdrop image, 《片名》title bottom-left (serif 32px white), director + streaming status below title, 「散場之後」wordmark bottom-right (gold, sans 14px).
**Why:** Shared links on Bluesky/Threads are the primary discovery channel. A generic "link preview" loses the editorial identity; a designed OG card signals the publication register.
**Target:** Day 8 (in v0 success criteria per design review recommendation — revise timeline if needed).
**Depends on:** `next/og` setup, entry `backdrop_url` working via R2 pipeline.

---

## Open Questions (unblocked, but note before launch)

- **Editor byline:** Real name / pseudonym / initials? Settle before launch (attribution accrues).
- **Domain wordmark:** 散場之後 confirmed? Candidates: 夜場, 銀幕後, 片尾字幕之後. Editor's call.
- **v0.1 comment strategy:** Webmentions vs Bluesky thread pull-on-demand. Defer until there is reader demand.
