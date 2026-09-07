# Tteok Table

A walkable evening tteokbokki restaurant built with React, TypeScript, Three.js and Vite. The enclosed room includes an entrance, host desk, waiting bench, six window booths, a communal table, Table 04, an 18-ingredient buffet, an open service kitchen, a four-sauce counter, and tea/water dispensers. Warm lighting, night windows, place settings, plants, and timber finishes surround the player.

## Run

Use the existing WSL worktree `/home/tim/projects/tteokbokki-buffet` in Ubuntu-22.04.

```sh
npm run dev -- --port 5173
npm run build
```

Open `http://localhost:5173/` at the buffet or `http://localhost:5173/?view=restaurant` for the entrance view. Dependencies are already installed. The worktree shares Git metadata with the original Windows directory; retain both directories and the worktree lock.

## Explore and eat

Hold WASD or the on-screen arrows to walk. Left-drag to look in any direction; right-drag to slide sideways. Furniture and walls block walking. Click objects or aim the center dot and press E. The recipe card provides accessible alternatives to picking ingredients and sauces.

Scoop ingredients from the buffet. Walk around its ends to the tea/water dispensers and sauce bowls, then click to fill a cup or choose a sauce. Click the held cup to sip. Carry at least one ingredient around Table 04 to its chair to sit automatically. Light the burner before stirring. Heat warms the broth gradually, a full pot takes longer, high power makes a stronger boil, and turning off the burner cools it gradually. Once cooked, click the chopsticks on the napkin, then click food to eat. Duplicate action buttons live under Your pot → Optional action buttons. Stand up to continue exploring or return for ingredients.

Kitchen appliances, entrance doors, and other dining tables are environmental scenery. Table 04 is the player's cooking seat. This is a stylized 3D experience, with no NPC service or checkout system.

## Verification

```sh
npm run build
node --experimental-strip-types scripts/verify-navigation.mjs
node --experimental-strip-types scripts/verify-thermal.mjs
```

Browser checks use an existing Playwright installation and Microsoft Edge. Set `PLAYWRIGHT_MODULE` to its absolute module directory and run the `.cjs` scripts with Node. On this machine Windows Node can run a copy of each script from a local Windows path against the WSL server. No new test packages are required.

- `verify-room.cjs`: full dining route, entrance, drinks and sauce interactions.
- `verify-walking.cjs`: chair approach, automatic seating, standing up, buffet return.
- `verify-heat-browser.cjs`: burner directions, boiling, heat reduction and cooling.
- `verify.cjs`: ingredient limits, cooking, eating and responsive controls.

## Architecture

`src/App.tsx` owns meal state. `src/world.ts` renders the buffet, food, camera and interactions. `src/restaurant.ts` builds the surrounding room and scene-based station targets. `src/navigation.ts` shares dining coordinates and body-clearance collision bounds. `src/thermal.ts` handles the heat simulation independently of rendering. `src/data.ts` defines ingredients and sauces.

Menu inspiration: [Dookki signature menu](https://www.dookkiny.com/signaturemenu) and [Maangchi tabletop tteokbokki](https://www.maangchi.com/recipe/jeukseok-tteokbokki).

## Handling and clearances

The carried pot is held close and checked against cached bounds from the rendered room. Walking now stops about 0.8 units from furniture. The aspect-aware carried pot remains fully visible inside the player clearance; it does not lift over counters or get pushed below the camera. `src/carry.ts` contains the pure clearance solver; `scripts/verify-carry.mjs` checks a dense grid of approaches. Walking uses physical furniture footprints with a rounded clearance radius and sliding around corners. Camera smoothing also respects collision. The communal table is offset from the central aisle. Sauce cards sit on stands beside their bowls, with open inserts and supported ladles.

## Leaving the table for a drink

Stand up leaves the pot on Table 04, turns the burner off, and preserves cooking progress. Walk to the cup rack, click to take a cup, and click a tea or water tap to fill it. Sip from the held cup or the optional button in Your pot; three sips empty it, and the tap refills it. Return to the chair to resume your meal and place the drink on the table. To add ingredients, explicitly pick up the pot while standing near the table. The aiming dot appears only while walking, and the carried pot stays below it.

See `scripts/DRINK_FLOW_CHECKS.md` for the verified full-trip acceptance sequence.
