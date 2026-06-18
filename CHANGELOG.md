# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1.1] - 2026-06-18

### Added

- **Scroll-triggered visual reveal** (`LazyReveal`): New `components/ui/LazyReveal.tsx` client component using IntersectionObserver. Sections below the fold fade in with opacity + translateY transition when scrolled into view. CSS nth-child stagger creates cascade effect on cards (delays: 0ms → 40ms → 80ms → 120ms → 160ms → 200ms cap). Applied to homepage entry grid, homepage genre grid, article page related entries, and genre page entry grid.
- **`LazyReveal.module.css`**: JS-gated hide strategy prevents FOUC — `ready` class (opacity: 0) only added after `useEffect` confirms element is below the viewport. `prefers-reduced-motion` media query disables all transitions. `IntersectionObserver` polyfill fallback for legacy browsers.

### Changed

- `app/page.tsx`: Wrap `<Suspense><EntryGrid /></Suspense>` and `<GenreGrid />` in `<LazyReveal>`.
- `app/entries/[slug]/page.tsx`: Wrap related entries section in `<LazyReveal>`.
- `app/genres/[slug]/page.tsx`: Wrap entry grid in `<LazyReveal>`.

---

## [0.0.1.0] - 2026-06-13

### Added

- **Design System Reference** (`DESIGN.md`): Complete CSS token reference covering colour palette, typography, breakpoints, page layouts (front page, article, admin), component specs (hero gradient, entry cards, chips, pagination, skeleton screens, toast, mobile nav drawer), font loading, and accessibility checklist. Generated from `/plan-design-review` session — 13 design decisions locked.
- **Project task tracker** (`TODOS.md`): Consolidated deferred tasks from engineering and design review sessions, with priority, context, and dependencies.
- **Project `.gitignore`**: Standard Next.js ignore patterns; excludes `.env*` variants, `.gstack/` local state, build artefacts, editor files.

### Changed

- `.claude/CLAUDE.md`: Add Traditional Chinese (繁體中文) reply rule and file renamed to lowercase for Linux compatibility.

---

_散場之後 — Personal Arthouse Film Diary_
