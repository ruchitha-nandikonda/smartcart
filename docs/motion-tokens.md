# Motion Tokens Reference

SmartCart defines its core animation primitives as CSS custom properties in `frontend/src/index.css`. Use these tokens instead of hard-coded durations or easings so interactions stay consistent across surfaces.

| Token | CSS Variable | Value | Usage | Tailwind/Utility Alias |
| --- | --- | --- | --- | --- |
| `duration.xs` | `--motion-duration-xs` | 0.18s | Micro lifts, badge drops | `transition-duration-150` |
| `duration.sm` | `--motion-duration-sm` | 0.36s | CTA pulse, quick pop | `transition-duration-300` |
| `duration.md` | `--motion-duration-md` | 0.60s | Hero headlines, fades | `duration-500` |
| `duration.lg` | `--motion-duration-lg` | 0.90s | Overlay sweeps, ripples | `duration-700` |
| `easing.outQuad` | `--motion-ease-out-quad` | cubic-bezier(0.215, 0.610, 0.355, 1.000) | Hero scale, global fades | `ease-out` |
| `easing.outCubic` | `--motion-ease-out-cubic` | cubic-bezier(0.215, 0.610, 0.355, 1.000) | Card lift, CTA hover | `ease-out` |
| `easing.outBack` | `--motion-ease-out-back` | cubic-bezier(0.175, 0.885, 0.320, 1.275) | Badge drop, icon bounce | `ease-out-back` (custom) |
| `easing.outExpo` | `--motion-ease-out-expo` | cubic-bezier(0.190, 1.000, 0.220, 1.000) | Count-up, modal intro | — |

## How to Consume in React

```tsx
import './index.css'

export function MotionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl bg-white/90 p-6 shadow-md"
      style={{
        transitionDuration: 'var(--motion-duration-sm)',
        transitionTimingFunction: 'var(--motion-ease-out-cubic)',
      }}
    >
      {children}
    </div>
  )
}
```

## Utility Classes

For quick iteration, use the shared classes already wired to the tokens:

- `.button-interactive` – Button hover/press choreography (`--motion-duration-sm`).
- `.card-interactive` – Card lift/shine plus ripple, tuned to `--motion-duration-lg`.
- `.animate-fade-up` / `.animate-fade-right` – Entrance utilities using `--motion-duration-md`.
- `.primary-cta--pulse` – Single-use CTA pulse that respects reduced motion.

## Reduced Motion Guidelines

Wrap motion-heavy components with the `usePrefersReducedMotion` hook (in `frontend/src/hooks/usePrefersReducedMotion.ts`). Avoid fallback timers; when `true`, switch to static states and drop CSS animation classes.

```tsx
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export function Spinner() {
  const reduceMotion = usePrefersReducedMotion()
  return (
    <span className={`inline-block text-teal-600 ${reduceMotion ? '' : 'animate-spin'}`}>⏳</span>
  )
}
```

Document updates to this table whenever token values or additional utilities change.




