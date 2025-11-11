# SmartCart Dashboard Motion Spec

## Overview
**Goal:** Deliver a welcoming, crisp hero experience that guides the user toward planning while keeping motion tasteful and performant.

- Entrance completes in ≈2.0 s on mid-range hardware.
- Primary hierarchy: hero greeting → CTA → quick actions → supporting stats.
- All motion uses GPU-friendly transforms (translate, scale, opacity) only.

---

## Motion Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `duration.xs` | 0.18 s | Micro hover lift/tilt, badge drop |
| `duration.sm` | 0.36 s | CTA pulse, quick-action pop |
| `duration.md` | 0.6 s | Headline slide/blur, subcopy dissolve |
| `duration.lg` | 0.9 s | Count-up, tip carousel transition |
| `easing.outQuad` | `cubic-bezier(0.215, 0.610, 0.355, 1.000)` | Hero scale-down, fades |
| `easing.outCubic` | `cubic-bezier(0.215, 0.610, 0.355, 1.000)` | Headline, subcopy |
| `easing.outBack` | `cubic-bezier(0.175, 0.885, 0.320, 1.275)` | Logo bounce, badge drop |
| `easing.outExpo` | `cubic-bezier(0.190, 1.000, 0.220, 1.000)` | Stat count-up |
| `stagger.short` | 0.09 s | Quick-action pop-in |
| `stagger.long` | 0.12 s | Hero stat tiles |

---

## Entrance Timeline (0–3000 ms)
1. **0–300 ms · Background + Scene**
   - Gradient tint opacity 0→100.
   - Whole hero container scales 1.04→1.00 (`duration.sm`, `easing.outQuad`).
2. **300–800 ms · Logo Mark**
   - Mask wipe left→right (`duration.sm`).
   - Finish with `translateY(6px→0)` + `easing.outBack` bounce.
3. **600–1200 ms · Headline**
   - Slides up 16px, opacity 0→1, blur 8px→0 (`duration.md`, `easing.outCubic`).
4. **900–1500 ms · Promise Text**
   - Letter stagger 40 ms each, opacity 0→1.
5. **1200–1800 ms · Quick Actions**
   - Each card: scale 0.92→1.00, opacity 0→1, shadow 0→md (`duration.sm`, `stagger.short`).
6. **1600–2100 ms · Primary CTA**
   - Single elevation: translateY(10px→0), glow pulse 400 ms (`duration.sm`). No repeat.
7. **2000–3000 ms · Background Garnish**
   - Floating grocery icons begin parallax loops (see looping section).

---

## Looping & Parallax
- **Layer A (foreground icons):** 8 px horizontal drift, 12 s loop, opacity 12%.
- **Layer B (background wash):** 12 px counter-drift, 18 s loop, opacity 8%.
- Pause motion entirely when `prefers-reduced-motion` is true.

---

## Micro-interactions
| Element | Idle → Hover | Press/Active | Notes |
| --- | --- | --- | --- |
| Quick-action cards | Lift 6 px, rotate 3°, shadow deepen over 160 ms (`easing.outCubic`) | Scale 0.98 for 80 ms, spring back using `easing.outBack` | Updates preview panel focus |
| CTA button | Shine sweep (600 ms) on hover entry, once per entry | Scale 0.97, release to 1.00 | Uses gradient overlay mask |
| Stats tiles | Count-up 0→value (800 ms, `easing.outExpo`); badge drops 10 px with `easing.outBack` when finished | — | Trigger confetti (10 particles) if savings ≥ $25 |
| Tip carousel | Auto-advance every 5 s: crossfade 250 ms + translateX 12 px; manual drag applies 4–6 px follow with elastic snap | — | Pause on hover/focus |

---

## Accessibility & Performance
- **Reduced Motion:** Switch all translates to simple fades, disable parallax, skip CTA pulse.
- **Focus States:** Ensure outline remains visible even when card lifts/tilts; use `outline-offset`.
- **FPS Budget:** Animations rely on transform/opacity only; drop heavy shadows during motion.
- **Asset Strategy:** Vector hero icons (SVG/Lottie). Lazy-load any large media after hero settles.

---

## Implementation Notes
- Use CSS custom properties for timing/easing tokens for theme reuse (`--motion-duration-sm`, etc.).
- Tokens now live in `frontend/src/index.css` so plan/favorites/pantry/receipts history reuse the same hover + entrance language without re-declaring timelines.
- Entrance sequence orchestrated via a parent timeline (GSAP/Framer Motion) or chained CSS animations with delays.
- Preview panel state managed in React; hover/focus updates description + stat counter with the same motion tokens.
- Confetti trigger should be rate-limited to once per session.

---

## Storyboard Checkpoints
1. **Frame 01 (0 ms):** Bare background, 104% scaled hero.
2. **Frame 02 (400 ms):** Logo fully drawn, bounce settling.
3. **Frame 03 (1.0 s):** Headline mid-slide, blur clearing.
4. **Frame 04 (1.6 s):** Quick-action cards landing, CTA mid-pulse.
5. **Frame 05 (2.4 s):** All elements static; parallax icons drifting.

Use this spec as a shared reference for design + engineering hand-off. Adjust timing/proportions only with partner teams to maintain consistency across SmartCart surfaces.
