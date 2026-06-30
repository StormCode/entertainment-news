# Plan: Admin Editor — Split Write / Preview Pages

**Feature:** 把 admin 編輯器的預覽欄位拆成獨立頁面（寫作頁＋預覽頁），寫作頁底部加「預覽」按鈕，發佈按鈕移到預覽頁。

**Status:** Design Review complete — ready to implement  
**Branch:** main  
**Reviewed:** 2026-06-30

---

## Context

Currently `EditEntryForm.tsx` uses a 3-column Ghost/Notion layout:
- Left (260px): film info, poster, metadata
- Center (1fr): Markdown editor, light bg #f5f2ed
- Right (300px): "Preview" — actually a `<pre>` of raw markdown, no real render value

DESIGN.md D3 (previously locked): "Admin UI = Ghost/Notion style (left context + center editor + right preview)"

**Motivation for this change:**
1. The right panel "preview" shows raw `<pre>` — not useful
2. Writer deserves more horizontal editor space
3. Preview page can show REAL rendered markdown → accurate WYSIWYG before publish

---

## Decisions (all locked in design review 2026-06-30)

| ID | Decision |
|----|----------|
| D-NAV | Navigation = client-side tab toggle (`useState<"write" \| "preview">`), no URL change, no re-render |
| D-RENDER | Preview renders Markdown → HTML client-side (react-markdown) |
| D-STYLES | Preview markdown styles = FULL alignment with actual article page (h2/h3/p/blockquote/li/hr/code) |
| D-UNPUBLISH | 取消發布 moves to article LIST page — editing page no longer has unpublish |
| D-MOBILE | Preview view action bar = `position: fixed; bottom: 0` on mobile |
| D-NO-UNSAVED | No "unsaved changes" indicator in preview view |
| D-PUBLISHED-PREVIEW | Preview view for published entry: action bar right side = "已發布 ✓" muted label (no button) |
| D3-SUPERSEDE | DESIGN.md D3 updated: 2-view toggle (see below) |

### DESIGN.md D3 — Updated

Old: "Admin UI = Ghost/Notion style (left context + center editor + right preview)"

New: "Admin UI = 2-view tab toggle. WRITE view: 260px left panel + 1fr editor (light bg #f5f2ed). PREVIEW view: 260px left panel + 1fr rendered article content (dark bg --paper). Toggle via `useState<'write'|'preview'>`, no URL change. Publish button in PREVIEW view. 取消發布 in admin list page."

---

## Screen Specifications

### Writing View (default)

```
┌─────────────────┬────────────────────────────────────────────┐
│  Left panel     │  Editor (light bg #f5f2ed)                 │
│  260px          │  padding: 40px 48px                        │
│  bg: #161310    │                                            │
│  ─────────────  │  [Message bar — gold tint, if any]         │
│  Film poster    │                                            │
│  (2:3 ratio)    │  ┌─ Title input ───────────────────────┐   │
│  [重新選擇]      │  │  28px serif, borderless bottom rule  │   │
│  Film title     │  └──────────────────────────────────────┘  │
│  Director       │                                            │
│  Runtime        │  ┌─ Body textarea ─────────────────────┐   │
│  Year           │  │  16px serif, line-height 1.9         │   │
│  ─────────────  │  │  min-height fills viewport           │   │
│  Genre grid     │  │                                      │   │
│  (2-col checks) │  └──────────────────────────────────────┘  │
│  ─────────────  │                                            │
│  Backdrop URL   │  ─────────────────────────────────────────  │
│  Image credit   │  Action bar (border-top 1px #d0cbc3):      │
│  ─────────────  │  right-aligned: [儲存]  [預覽 →]           │
│  Hero toggle    │    儲存 = outline, dark border              │
│  ─────────────  │    預覽 → = gold bg #c9a96e, dark text,    │
│  Meta: slug,    │    font-weight 700, border-radius 4px      │
│  status badge   │                                            │
└─────────────────┴────────────────────────────────────────────┘
```

**Applies to both draft AND published entries.** Action bar always: [儲存] [預覽 →].

### Preview View

```
┌─────────────────┬────────────────────────────────────────────┐
│  Left panel     │  Preview area (dark bg --paper #0c0a08)    │
│  (unchanged)    │  padding: 40px 48px                        │
│                 │                                            │
│                 │  "預覽" label (11px muted uppercase,        │
│                 │   letter-spacing 0.12em)                   │
│                 │  Hairline rule (--line)                    │
│                 │                                            │
│                 │  ┌─ Rendered article ──────────────────┐   │
│                 │  │  Title: serif 28px 900 (--ink-strong)│   │
│                 │  │  Body: rendered HTML, full article   │   │
│                 │  │  typography (see Markdown Styles)    │   │
│                 │  │  max-width 720px, margin 0 auto      │   │
│                 │  └──────────────────────────────────────┘  │
│                 │                                            │
│                 │  ─────────────────────────────────────────  │
│                 │  Action bar:                               │
│                 │    left: [← 返回編輯] (outline, muted)     │
│                 │    right: [發布] (gold) OR "已發布 ✓"      │
│                 │           (muted label, no button)         │
└─────────────────┴────────────────────────────────────────────┘
```

---

## Interaction State Coverage

| Feature | Loading | Empty | Error | Success |
|---------|---------|-------|-------|---------|
| Tab switch Write → Preview | Instant (client state, no network) | — | — | Preview renders in-memory content |
| Tab switch Preview → Write | Instant | — | — | Editor retains all content |
| Markdown render (preview) | — | Show "(無標題)" if title empty; "尚無內容" if body empty (14px muted italic) | Show raw `<pre>` fallback | Rendered HTML |
| 儲存 (write view) | "儲存中…" (button disabled) | — | Inline message gold border (error text) | "儲存成功" inline message |
| 發布 (preview view, draft) | "發布中…" (button disabled) | — | Inline message error | Redirect to /entries/[slug] |
| 預覽 → button | — | — | — | View toggles to preview |
| ← 返回編輯 | — | — | — | View toggles back to write |

---

## User Journey

| Step | User Does | User Feels | Specified |
|------|-----------|------------|-----------|
| 1 | Opens edit page | Focused — full-width editor, no distractions | ✓ 2-col, light bg |
| 2 | Writes article | Immersed | ✓ Wide editor, no right panel |
| 3 | Clicks 儲存 | Relieved | ✓ Save in writing view, stays there |
| 4 | Clicks 預覽 → | Curious — "will it look right?" | ✓ Instant client toggle |
| 5 | Reads rendered article | Confident or wants to fix | ✓ Full article typography, dark bg |
| 6A | Clicks ← 返回編輯 | Efficient | ✓ Instant toggle, no page load |
| 6B | Clicks 發布 | Satisfying — WYSIWYG publish | ✓ Publish on preview page |
| 7 | Redirects to /entries/[slug] | Proud | ✓ Existing redirect behavior |

---

## Information Architecture

### Navigation flow

```
EditEntryForm (Writing View — default)
  │
  ├─ [儲存] → saves draft/content, stays on writing view, shows "儲存成功"
  │
  └─ [預覽 →] → setView("preview")
                │
                ├─ [← 返回編輯] → setView("write")
                │
                └─ [發布] (draft only) → updateEntry(publish:true) → redirect /entries/slug
                   "已發布 ✓" (if already published — no button)
```

### Tab toggle mechanism

```tsx
const [view, setView] = useState<"write" | "preview">("write");

// Shell stays mounted — left panel + all state preserved
// Grid template changes based on view
```

---

## Design System Alignment

### Reused unchanged
- `.leftPanel`, `.panelHeading`, `.filmInfo`, `.poster`, `.posterMissing`
- `.btnChangePoster`, `.filmTitle`, `.hint`, `.r2Warning`, `.warningText`, `.btnRetry`
- `.genreSection`, `.genreGrid`, `.genreCheckLabel`, `.genreCheckbox`
- `.backdropOverride`, `.label`, `.input`, `.heroToggle`, `.metaSection`, `.metaRow`
- `.editor`, `.titleInput`, `.bodyTextarea` — unchanged
- `.btnSave`, `.inlineMessage` — reused
- `.btnPublish` — now called `.btnPreview` (identical style: gold bg, dark text, 700 weight)

### New styles needed

```css
/* Writing view — Preview button (same visual as existing .btnPublish) */
.btnPreview {
  padding: 10px 24px;
  background: var(--gold);
  border: none;
  border-radius: 4px;
  color: var(--paper);
  font-family: var(--font-sans-tc), sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Preview view — Back button */
.btnBack {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  color: var(--muted);
  font-family: var(--font-sans-tc), sans-serif;
  font-size: 14px;
  cursor: pointer;
}

/* Preview view — Published status label */
.publishedLabel {
  font-size: 13px;
  color: var(--muted);
  padding: 10px 0;
}

/* Preview view — Action bar (space-between) */
.actionBarPreview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  margin-top: 24px;
}

/* Preview panel wrapper */
.previewPanel {
  background: var(--paper);
  padding: 40px 48px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.previewLabel {
  font-family: var(--font-sans-tc), sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 12px;
}

.previewDivider {
  border: none;
  border-top: 1px solid var(--line);
  margin: 0 0 32px;
}

/* Markdown rendered content — full article page alignment */
.previewBody {
  color: var(--ink);
  font-family: var(--font-serif-tc), "Noto Serif TC", serif;
  font-size: 18px;
  line-height: 1.9;
  letter-spacing: 0.04em;
  max-width: 720px;
}

.previewBody h1 {
  font-size: 36px;
  font-weight: 900;
  color: var(--ink-strong);
  line-height: 1.4;
  margin: 0 0 8px;
}

.previewBody h2 {
  font-size: 24px;
  font-weight: 900;
  color: var(--ink-strong);
  line-height: 1.4;
  margin: 48px 0 16px;
}

.previewBody h3 {
  font-size: 20px;
  font-weight: 900;
  color: var(--ink-strong);
  line-height: 1.4;
  margin: 32px 0 12px;
}

.previewBody p { margin: 0 0 24px; }

.previewBody em { font-style: italic; }
.previewBody strong { font-weight: 900; color: var(--ink-strong); }

.previewBody blockquote {
  border-left: 3px solid var(--gold);
  padding: 4px 0 4px 20px;
  margin: 0 0 24px;
  color: var(--muted);
  font-style: italic;
}

.previewBody ul, .previewBody ol {
  padding-left: 24px;
  margin: 0 0 24px;
}

.previewBody li { margin-bottom: 8px; }

.previewBody hr {
  border: none;
  border-top: 1px solid var(--line);
  margin: 40px 0;
}

.previewBody code {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  background: var(--paper-2);
  padding: 2px 6px;
  border-radius: 2px;
  color: var(--gold);
}

.previewBody pre {
  background: var(--paper-2);
  padding: 16px 20px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0 0 24px;
}

.previewBody pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.previewBody a {
  color: var(--gold);
  text-decoration: underline;
}
```

---

## Responsive Behavior

### Desktop (≥ 900px)
- Writing view: `grid-template-columns: 260px 1fr`
- Preview view: `grid-template-columns: 260px 1fr`
- Action bars: normal flow at bottom of content area

### Tablet (600–899px)
- Writing view: `grid-template-columns: 1fr`, left panel stacks above editor (existing behavior)
- Preview view: same single-column stack

### Mobile (< 600px)
- Writing view: same as tablet, action bar at content bottom
- **Preview view: action bar `position: fixed; bottom: 0; left: 0; right: 0`** with padding and background blur/solid so it doesn't overlap content — content area needs `padding-bottom` to clear the bar
- Left panel on mobile: existing behavior (border-bottom, full width)

---

## Markdown Renderer

**Package:** `react-markdown`

```bash
npm install react-markdown
```

**Component:**
```tsx
// components/admin/PreviewPanel.tsx
"use client";
import ReactMarkdown from "react-markdown";
import styles from "@/app/admin/entries/[slug]/edit/edit.module.css";

interface Props {
  title: string;
  bodyMd: string;
}

export function PreviewPanel({ title, bodyMd }: Props) {
  return (
    <div className={styles.previewPanel}>
      <p className={styles.previewLabel}>預覽</p>
      <hr className={styles.previewDivider} />
      <div className={styles.previewBody}>
        {title && <h1>{title}</h1>}
        {bodyMd ? (
          <ReactMarkdown>{bodyMd}</ReactMarkdown>
        ) : (
          <p style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "14px" }}>
            尚無內容
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Implementation Tasks

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — EditEntryForm — Add `view` state, wire Preview/Back buttons, move Publish to preview action bar
  - Surfaced by: Pass 1 (IA) — 3-column → 2-view toggle; Pass 1 finding (取消發布 placement resolved)
  - Files: `app/admin/entries/[slug]/edit/EditEntryForm.tsx`
  - Verify: Switch Write↔Preview, save in write view, publish from preview view, published entry shows "已發布 ✓" label
- [ ] **T2 (P1, human: ~1h / CC: ~15min)** — edit.module.css — Add new CSS: `.btnPreview`, `.btnBack`, `.publishedLabel`, `.actionBarPreview`, `.previewPanel`, `.previewLabel`, `.previewDivider`, `.previewBody` (full article styles), mobile sticky action bar
  - Surfaced by: Pass 5 (Design System), Pass 6 (Responsive)
  - Files: `app/admin/entries/[slug]/edit/edit.module.css`
  - Verify: Both view action bars render correctly; mobile preview has sticky bar; previewBody h2/h3/blockquote/li/code match article page
- [ ] **T3 (P1, human: ~30min / CC: ~10min)** — Install react-markdown, create `PreviewPanel` component
  - Surfaced by: Pass 3 (Journey) — rendered preview for confident WYSIWYG experience
  - Files: `components/admin/PreviewPanel.tsx`, `package.json`
  - Verify: Renders h2, h3, em, strong, blockquote, lists; empty state shows "尚無內容"
- [ ] **T4 (P2, human: ~30min / CC: ~10min)** — Admin entries list — Add 取消發布 action to list page
  - Surfaced by: Pass 1 finding — 取消發布 moves out of edit page entirely
  - Files: `app/admin/entries/page.tsx` (or relevant list component)
  - Verify: Published entries in list have accessible unpublish action
- [ ] **T5 (P2, human: ~20min / CC: ~5min)** — Update DESIGN.md D3 to reflect new 2-view toggle pattern
  - Surfaced by: Pass 5 (Design System Alignment)
  - Files: `DESIGN.md`
  - Verify: D3 accurately describes the new toggle-based layout with correct CSS variable references
- [ ] **T6 (P3, human: ~15min / CC: ~3min)** — Remove `.rightPanel`, `.previewContent`, `.previewEmpty`, `.previewPre` CSS (dead code after migration)
  - Files: `app/admin/entries/[slug]/edit/edit.module.css`
  - Verify: No TypeScript/CSS lint errors, no visual regressions in writing view

---

## NOT in scope

- URL routing for write/preview (client-side toggle only)
- Auto-save (future)
- Full article page replication (backdrop, chips, masthead) in preview — just rendered body content
- NewEntryForm changes (separate, has no preview at all)
- Admin list page redesign (T4 is minimal: add unpublish action, no full redesign)
- Mobile left panel redesign (uses existing tablet behavior)

---

## What Already Exists (reuse these)

- All left panel CSS and JSX — unchanged
- `.editor`, `.titleInput`, `.bodyTextarea` — unchanged
- `.btnSave`, `.btnPublish` (rename to `.btnPreview` visually)
- `.inlineMessage` — reused for save/publish feedback
- `updateEntry(publish:true)` server action — unchanged
- All existing state: `bodyMd`, `entryTitle`, `selectedGenres`, etc. — unchanged

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 5 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR (PLAN) | score: 3/10 → 9/10, 8 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** ENG CLEARED — eng review passed (2026-06-13). Design review complete.

NO UNRESOLVED DECISIONS
