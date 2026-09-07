# Project: Tteok Table

## Purpose
An immersive first-person tteokbokki restaurant: serve yourself, carry a pot, cook, and eat with chopsticks.

## Build and Verification
Use Ubuntu-22.04 WSL at `/home/tim/projects/tteokbokki-buffet`.
- `npm run dev -- --port 5173`
- `npm run build`: strict TypeScript and Vite production build.
- `scripts/verify.cjs`: browser flow checks using an existing Playwright install and Microsoft Edge. See README for environment variables. Do not install testing packages without approval.

## Project Structure
`src/main.tsx` mounts React once. `src/App.tsx` owns state and UI. `src/world.ts` owns the Three.js restaurant and resource cleanup. `src/data.ts` defines typed ingredients and stations. `src/style.css` defines the interface.

## Architecture Notes
React selection is authoritative; mirror it into the world through `update`. Raycast actions flow back through callbacks. Dispose geometry, materials, textures, animation frames, and event handlers on replacement/unmount. Keep App separate from the root mount for hot reload.

## Active Constraints
The restaurant is the primary interface. Keep the recipe card closed by default, with only minimal contextual controls visible. Prefer tray picking, the carried pot, the burner dial, stirring, and chopsticks over overview panels. Preserve keyboard/button alternatives and mobile controls.
Maintain dark surroundings with warm localized lighting over food and tables. Preserve the first-person camera, carried-pot movement, and transition to the table.
The WSL worktree shares Git metadata with the original Windows repository and is locked against Windows pruning. Use WSL Git. Do not move or remove either directory independently.

## Last Updated
2026-09-06: scene-first interaction, 18-ingredient buffet, optional recipe card, and warm evening atmosphere.

Cooking directions and scene actions must agree with burner state. Heat simulation lives in `src/thermal.ts`; temperature drives cooking, power affects boil strength, and heat decays gradually after shutdown. Stirring animates mixing and must not grant instant cooking progress.

Travel must happen in the restaurant: keep Table 04 visible and allow walking to the chair, with proximity-based seating. Do not restore a teleport-style Take a seat button. Preserve right-drag sliding, WASD, held touch controls, collision, and standing-up/re-entry behavior.
When editing WSL files through Windows paths while Vite watches them, use atomic replacement (or touch the completed file afterward); truncating writes can leave Vite caching an empty module until another change event.

The surrounding complete interior lives in `src/restaurant.ts`. Keep furniture coordinates aligned with collision bounds in `src/navigation.ts`; dining table coordinates are shared. Use `?view=restaurant` for an entrance preview. Navigation integrates elapsed time with substeps so the larger scene does not slow walking on lower frame rates.

Carried pot geometry must clear actual room surfaces using `src/carry.ts`; never attach it at a fixed low camera offset without clearance. Keep walking collision footprints close to visible furniture, rounded at corners, with the central dining aisle open. Sauce labels belong on supported cards beside their own vessel; ladles must include a bowl and a handle that rests on the rim/rest.

Keep an approximately 0.8-unit walking standoff from furniture. The carried pot stays in free aisle space and must not automatically rise over tables/counters; `clearPot(..., false)` resolves horizontal clearance. Preserve the open chair approach and service-aisle access when changing those distances.

The carried pot must remain fully visible, including both handles. Use the aspect-aware compact pose in `src/potPose.ts`, sized to fit inside the player's existing 0.8-unit walking clearance; do not push the rendered pot down or behind the camera. Verify desktop and narrow mobile framing with `scripts/verify-pot-pose.mjs`.

Standing and pot ownership are independent: `parked` leaves the pot at Table 04 while the player walks. Preserve thermal progress on standing, turn the burner off, and require explicit pot pickup before more ingredients. Return to the chair resumes the meal. Drink flow is take a cup, fill at a tap, sip, refill; model the cup/liquid in the scene and keep the carried pot below the center aiming dot.

Mixing lives in `src/mixing.ts` and advances at fixed 1/120-second steps. Preserve per-piece positions across selection changes, pot-wall contacts, drag direction, bounded spoon speed, and gradual damping after release. `scripts/verify-mixing.mjs` checks these invariants. Thermal state must survive picking up the pot; adding a cold portion uses `addColdPortion` instead of resetting temperature. This is an accelerated shallow-broth approximation, not a volumetric fluid simulation.
