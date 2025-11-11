# SmartCart Motion Performance & QA Checklist

## Quick Smoke (per deploy)
- Run `npm run build && npm run preview` and load `/dashboard-intro` in Chrome with DevTools throttled to "Mid-tier mobile" (4x CPU).
- Confirm hero entrance completes within 2.1 s by watching Performance panel > Screenshots.
- Toggle reduced motion in OS settings; reload to verify hero, CTA, and cards render instantly with no motion.

## Automated Metrics
- Execute `npm run analyze:bundle` (see `package.json`) to ensure CSS bundle < 180 KB gzip.
- From repo root run `npx lighthouse http://localhost:4173/dashboard-intro --view --preset=desktop` and record Performance/TBT > 90/0.
- Capture trace artifacts (`.lighthouseci`) and commit to `/docs/perf-snapshots/<date>/` when thresholds change.

## Interaction QA
- Hover each quick-action card; check lift + shine aligns with palette, and focus-visible ring persists.
- Click CTA; verify no double pulse and primary navigation occurs within 150 ms.
- Test keyboard navigation (Tab/Shift+Tab) to ensure animation states don’t trap focus.

## Regression Sweep
- Navigate to `Plan`, `Favorites`, `Pantry`, `Receipts`, `ShoppingListHistory` with `prefers-reduced-motion` enabled and disabled; ensure spinners, alerts, and slide-down panels follow new motion tokens.
- Run `npm run test -- --watch=false` and confirm no flakey animation-dependent tests.
- Check console logs for warnings about missing keyframes/animations.

Document findings in `/docs/perf-snapshots/README.md` along with date, environment, Lighthouse scores, and any follow-up tasks.




