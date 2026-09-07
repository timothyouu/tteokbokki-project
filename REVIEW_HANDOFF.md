# Independent walking, pot and drink state

User wanted an unobstructed crosshair, the ability to stand up without carrying the pot, and a drink station matching the sauce station.

Changed App.tsx (parked pot independent of stage; resume meal; explicit nearby pickup; cup ownership/fill/sip/refill; contextual directions; crosshair only while walking), world.ts (parked pot rendering and pickup raycast, carried/tabletop cup and liquid level, sip animation, automatic return seating), restaurant.ts (matching cup cards, urns, taps, drip trays and cup rack), potPose.ts (pot below aiming dot). Updated AGENTS, README and framing/acceptance checks. No packages or commits.

Checks: strict TS/Vite build; desktop/mobile pose bounds including clear crosshair; live CUA full trip from cooking through standing, cup requirement, fill, three sips, refill and return. Original progress 66.84% before departure and 77.72% on return, with residual cooling rather than reset. Pot stayed at table and cup rendered at table on return. No browser errors. See scripts/DRINK_FLOW_CHECKS.md. Final small refinements hide seated/menu crosshair and inset the cup on mobile; full thermal/eating regression not rerun. Existing large JS chunk warning remains.


## Object interactions and readable guidance (2026-09-06)
Moved duplicate sip, pot pickup, burner, stir, chopstick and bite controls into Your pot > Optional action buttons; sauce selection remains in the recipe card and scene. Stand up, heat, movement and restart stay visible. Resting chopsticks now have a generous raycast target and disappear when picked up; the ready pot no longer enters eating mode. Enlarged contextual instructions, thermal status, notifications and recipe/help text with mobile overrides. Files: src/App.tsx, src/world.ts, src/thermal.ts, src/style.css, README.md. Build, thermal simulation and desktop/mobile pot-pose checks pass. Browser acceptance attempted via existing Playwright/Edge but stalled on the initial menu click; full scene click and visual layout checks remain unconfirmed. Existing browser scripts that expect bottom-bar action buttons need to open the optional controls or interact with scene objects. No packages installed.


## Mixing physics ownership handoff (2026-09-06)

Outcome: individual food bodies respond to direct spoon dragging, viscous current, contacts and damping. Existing food positions survive ingredient/bite changes. Broth responds to acceleration and relaxes to level; cup liquid counter-rotates within the rim. Hot-pot pickup preserves temperature and added cold food cools by relative heat capacity. No extra packages. Physics changes prepared for the codex/mixing-physics shipping branch.

Files: src/mixing.ts (new fixed-step shallow-broth model), src/world.ts (pointer-to-broth projection, stable food mesh mapping, spoon and surface animation), src/thermal.ts and src/App.ts (thermal continuity), scripts/verify-mixing.mjs and scripts/verify-mixing-browser.cjs (new), scripts/verify-thermal.mjs (cold ingredient check), README.md, AGENTS.md, this handoff.

Verification passed: production build; mixing direction, dissipation, 48-body contact/containment at 20/60/144 fps, fixed-step consistency, surface leveling; thermal, navigation, carry and pot-pose suites. Existing Playwright/Edge browser test passed actual walking to the chair, burner activation, optional stirring, direct pointer stirring and subsequent decay (speed 0.2183 to 0.0001), with no page errors. Desktop 960x720 and mobile 390x844 screenshots inspected. Build retains the existing bundle-size warning.

Limits for further review: this is a tuned shallow-broth approximation using disc contacts and visual float heights, not CFD, measured ingredient densities, deformable food or spilling. Cooking is intentionally accelerated. The seated mobile view remains tightly framed around the pot (existing framing), while carried-pot framing tests pass. Other legacy browser scripts still assume old always-visible action buttons. The active buffet worktree retains the implementation; the shipping worktree now carries the same physics changes on codex/mixing-physics.
