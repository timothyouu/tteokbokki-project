# Independent walking, pot and drink state

User wanted an unobstructed crosshair, the ability to stand up without carrying the pot, and a drink station matching the sauce station.

Changed App.tsx (parked pot independent of stage; resume meal; explicit nearby pickup; cup ownership/fill/sip/refill; contextual directions; crosshair only while walking), world.ts (parked pot rendering and pickup raycast, carried/tabletop cup and liquid level, sip animation, automatic return seating), restaurant.ts (matching cup cards, urns, taps, drip trays and cup rack), potPose.ts (pot below aiming dot). Updated AGENTS, README and framing/acceptance checks. No packages or commits.

Checks: strict TS/Vite build; desktop/mobile pose bounds including clear crosshair; live CUA full trip from cooking through standing, cup requirement, fill, three sips, refill and return. Original progress 66.84% before departure and 77.72% on return, with residual cooling rather than reset. Pot stayed at table and cup rendered at table on return. No browser errors. See scripts/DRINK_FLOW_CHECKS.md. Final small refinements hide seated/menu crosshair and inset the cup on mobile; full thermal/eating regression not rerun. Existing large JS chunk warning remains.
