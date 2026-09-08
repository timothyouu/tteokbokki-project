# Drink-trip acceptance check

Verified live through CUA on the local app:

1. Add rice cakes and walk to the chair. Automatic seating places the pot on Table 04.
2. Light burner on high. Cooking reached 66.84% before standing.
3. Stand up: burner turns off, pot stays at Table 04, ingredient count is retained, optional Carry pot to buffet is offered only nearby.
4. Walk back along the aisle to the drinks counter. No carried pot obscures the station.
5. Click water before taking a cup: message requests a clean cup.
6. Click cup rack: empty cup appears, sip is disabled.
7. Click water tap: cup fills, sip count is 3.
8. Sip three times: counts 2, 1, then disabled empty-cup state.
9. Click water tap again: refill restores 3 sips.
10. Return to the chair: automatic seating resumes the original pot at 77.72%, with the cup on the table. Residual heat explains the small progress increase. Burner remains off.
11. No browser console errors recorded.

Automated framing check: `node --experimental-strip-types scripts/verify-pot-pose.mjs` verifies the carried pot stays fully visible below the aiming dot, clear of bottom controls, and inside the walking clearance across desktop/mobile aspects and camera angles.

The final UI refinement hides the aiming dot while seated or in menus. Normal walking still supports E under the aiming dot and direct mouse picking.
