# TODOS — 散場之後

Deferred from plan reviews. Each item has enough context to be picked up cold.

---

## Engineering Review TODOs (from /plan-eng-review 2026-06-13)

### ~~TODO-E1: /admin/health pipeline status page~~ ✓ UPGRADED TO v0 (2026-06-14 CEO review)
**What:** Build a `/admin/health` page that shows pipeline status per job (nightly-backup, restore-test). Data from new `pipeline_health` table written by GHA via `/api/pipeline-health` POST route.
**Why:** Must exist before the first cron failure — upgraded from v0.1 to v0 mandatory in CEO review.
**Target:** v0 (before launch). See CEO plan: `~/.gstack/projects/StormCode-entertainment-news/ceo-plans/2026-06-14-v0-launch-and-genre.md`
**Spec:**
- `pipeline_health` table: `(name TEXT PK, last_run_at TIMESTAMPTZ, status TEXT)` — status: `'success' | 'failure'`
- `/api/pipeline-health` POST route: `Authorization: Bearer $PIPELINE_HEALTH_SECRET`; UPSERT on name; 401 if bad token
- `/admin/health` page: `export const dynamic = 'force-dynamic'`; shows red/orange/green per row; alert thresholds: nightly backup >48h, restore-test >14 days
- Admin auth: Vercel Deployment Protection (no code needed)
- Add `PIPELINE_HEALTH_SECRET=` to `.env.example`

### ~~TODO-E2: scripts/verify-restore.sh~~ ✓ DONE (Day 6)
Delivered: `scripts/verify-restore.sh`, `.github/workflows/nightly-backup.yml`,
`.github/workflows/restore-test.yml`. Backup runs nightly at 02:00 TST to R2
(14-day retention). Restore-test runs weekly (Sunday 03:00 TST) with a Postgres
service container. Script supports `--check-only` for CI and full Docker mode for
local testing. Required GHA secrets: `DATABASE_URL_DIRECT`, `R2_ENDPOINT`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

---

## Design Review TODOs (from /plan-design-review 2026-06-13)

### TODO-D3: GenreGrid — 重新啟用類別連結（v0.1 時）
**What:** 將 `components/genres/GenreGrid.tsx` 的 `<div>` 改回 `<Link href={/genres/${slug}}>`, 移除 `cardTooltip` span 和 disabled 相關 CSS（`.cardTooltip`, `cursor: default`, tooltip 邏輯）。
**Why:** v0 中 /genres/[slug] 頁面尚未實作，因此暫時禁用連結避免 404。v0.1 實作篩選頁面後需同步更新。
**Target:** v0.1（/genres/[genre] 頁面完成後）。
**Context:** 禁用邏輯在 GenreGrid.tsx 第 16-19 行有 v0.1 更新提示的 comment。

---

### TODO-D1: "New since last visit" marker on entry cards
**What:** Add a small 「新」badge to entry cards for articles published since the reader's last visit. Use `localStorage` to persist the last visit timestamp.
**Why:** Returning readers scan for new content first. A clear "new" marker removes the need to mentally compare dates.
**Target:** v0.1 (needs meaningful content volume to be useful — minimum ~10 entries).
**Context:** Requires localStorage; no server-side session needed. Badge uses `--gold` color, `6px × 6px` dot style, top-right of poster image.

### ~~TODO-D2: OG card visual spec + implementation~~ ✓ DONE
**What:** Lock OG card layout in DESIGN.md and implement via `next/og`. Layout: full-bleed backdrop image, 《片名》title bottom-left (serif 32px white), director + streaming status below title, 「散場之後」wordmark bottom-right (gold, sans 14px).
**Why:** Shared links on Bluesky/Threads are the primary discovery channel. A generic "link preview" loses the editorial identity; a designed OG card signals the publication register.
**Target:** Day 8 (in v0 success criteria per design review recommendation — revise timeline if needed).
**Depends on:** `next/og` setup, entry `backdrop_url` working via R2 pipeline.

---

## Open Questions (unblocked, but note before launch)

- **Editor byline:** Real name / pseudonym / initials? Settle before launch (attribution accrues).
- **Domain wordmark:** 散場之後 confirmed? Candidates: 夜場, 銀幕後, 片尾字幕之後. Editor's call.
- **v0.1 comment strategy:** Webmentions vs Bluesky thread pull-on-demand. Defer until there is reader demand.
