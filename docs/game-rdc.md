# RDC game: drawn geometry

## Source of truth

`data-src/ensiie-walls-doors.json` is now the geometry source for the 2D game.
The old DXF contour approximation, door-swing cleanup and manually reshaped southwest rooms are no longer used by map generation.
Existing `public/data/rooms.json` supplies room names by spatial lookup; the export door roomId values are not trusted as a complete connectivity graph.
Original wall endpoints are preserved. Segments are subdivided at intersections only. Door centres are computed from wallId and t, and widths are preserved at 40 game pixels per metre.
Each drawn door is one simple door sprite. Neighbouring leaves remain separate doors. No swing arcs are rendered as wall corners.

## Generate and run

- `npm run data:dungeon`: regenerate game geometry and audit after editing the JSON.
- `npm run data`: regenerate shared data and the game map.
- `npm run dev` and `npm run build` both regenerate the game map automatically.
- `npm run test:rdc`: verify exact wall alignment and door widths/centres, collision-safe arrivals, physical routes inside every space, reciprocal links and arrival bounce protection.

Generated artifacts:
- `public/game/maps/rdc-dungeon.json`: runtime map.
- `public/game/maps/rdc-map-audit.json`: all junction repairs, inferred passages and exterior doors.
- `public/game/maps/rdc-authored-preview.svg`: review overview, separate from gameplay.

## Movement

Click the canvas, then use ZQSD, WASD or arrows. Walk toward a door to change rooms automatically. Only the current environment is displayed. The incoming door cannot immediately bounce the player back; move away before returning.
Six exterior doors stay visible but inactive. The game does not connect to the street or other floors.

## Resolved drawing gaps and limits

Planar faces are recovered by splitting wall intersections and traversing their boundaries. Small unfinished junctions of at most 0.40 m are bridged explicitly without moving the authored wall endpoints. Every added bridge is recorded in the audit.
Two enclosed spaces had no authored door: a passage for the bicycle room and a small annex are inferred on shared walls toward accessible neighbours. Both need review; no original door is moved or removed.
Current export: 125 authored walls, 61 authored doors, 55 indoor door links, 6 exterior doors, 2 inferred indoor passages and 51 navigable environments. These include corridors and small compartments, not 51 verified named rooms.
The overview is a useful review artifact; geometric fidelity is to the user's drawing, not a certified DWG survey. Source plans and derived maps remain within the hackathon.

## Door variants, stairs and elevator

`scripts/rdc-fixtures.mjs` applies stable game fixtures after geometry generation. Normal door variants use the supplied windowed/solid wooden fronts and sliding door images; service spaces prefer solid doors and the foyer uses sliding doors.
The circled second opening on the north wall of the main hall is `door-87b3e595-2d76-41c6-81dc-ee05621b63d7`. Its connected space is the elevator cabin. The lower frame of `Tiled_Photos/elevator.png` supplies the entrance; the upper-left frame supplies its interior. Automatic entry and return use the existing reciprocal door link.
Two horizontal stair flights are placed from the reference plan in the main hall: left x=21.65..26.85 m, right x=35.5..40.7 m, y=17.85..19.2 m. Their game footprints block walking upstairs. Approaching either flight displays the bilingual R+1-unavailable message. The elevator cabin and controls display the same destination limitation.
No new floor transition is introduced. Existing room and door reachability tests include the stair obstacles.

## Reception decorations

`scripts/rdc-decor.mjs` places furniture in the three annotated zones without changing the drawn walls or doors. Solid footprints participate in movement collisions and the full navigation test.
Green: front-facing noticeboard, bin and two potted plants. Red: three Wooden Bench (Back) sprites face north toward the elevator. Yellow: modular L-shaped wooden counter, monitor, stationery, north-facing swivel chair, bin and Amelia facing south. The east counter opening stays 44 px wide.
Depth sorting uses the feet of furniture and characters to handle walking behind the board and benches.
Assets copied to public/game/decor come from the supplied files: Wooden Bench (Back), Small Wooden Desk, Swivel Chair_1, Waste Basket 1 and persons/Amelia_idle_16x16 (four 16x32 frames, front frame 3).
Crops from Interiors_free_32x32.png: noticeboard (0,1344,96,64), plant (336,1424,48,64), computer (136,1152,24,24), stationery (96,1152,32,32). The source files are preserved.
The receptionist is decorative; no real person's identity or verified service information is implied.
