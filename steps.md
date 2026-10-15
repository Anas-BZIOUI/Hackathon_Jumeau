# ensIIE digital twin: handoff specification

Purpose of this file: let a new agent or teammate start building immediately, without re-reading the whole conversation. It is split into a shared foundation (sections 0 to 3), **Part A: the adventure game view**, **Part B: the application (Guide view, 3D floor stack, metro map, routing, and more)**, and delivery sections (4 to 7).

Language note: the working conversation was in English, source documents are in French. Data field names, file names, and room labels stay in French where they come from the plans. The UI must be bilingual FR/EN (see B.12).

Status legend used below:
- **[Given]**: stated in the brief or the plans documentation.
- **[Decided]**: agreed during our discussion.
- **[Proposal]**: my suggestion, not yet validated by the team.
- **[Placeholder]**: example value that must be replaced by a measured or collected value.
- **[Verify]**: assumption that must be checked against the real files before relying on it.

---

## 0. Project context

### 0.1 The brief [Given]
- Project: "Un jumeau numérique de l'ensIIE". Team of 3 to 5 people.
- Goal: an interactive digital representation of the school so students, staff, and visitors can discover it, find their way, and identify services. Spaces to cover: classrooms, labs, offices, work areas, student-life areas, admin services, catering, association spaces.
- The representation must show the link between spaces and the school's four key activities: **teaching, research, student life, relations with companies**.
- Deliverables: (1) a **functional specification** (cahier des charges fonctionnel), (2) an **interactive web prototype, usable on PC**.
- The cahier des charges must cover: navigation, search, localization, access to information about places and services. It starts from an analysis of needs and user profiles.
- Optional extras named in the brief: search engine, filters by service or space type, practical info, links to the school's digital resources, itinerary to a place.
- Scoring skills: functional analysis, web interface design, digital modelling, software development, data management, UX.

### 0.2 Scope rule [Given]
Choose **one sector** (classrooms, part of the sIIEnext, association premises...). Arbitrate between breadth and level of detail. Represent spaces open to the public and to students. **The list of rooms and their function must be built by the team**, via an on-site tour and a shared spreadsheet exported to CSV or JSON.

### 0.3 Schedule [Given]
| When | What |
|---|---|
| Thu 15 Oct, 9:00 | Launch in amphi 101 |
| Thu 10:00 to 16:00 | Work in room |
| Thu 16:30 | Conference on digital sovereignty, amphi Cabanes |
| Fri 16 Oct, 9:00 to 15:30 | Work in room |
| Fri after 15:30 | Presentations to the jury |

- Work room: **C53 (Platech 1), at the sIIEnext**.
- Jury for projects 1, 2, 3 (amphi Cabanes): Imed Boughzala (school director), Raphaël Jadot, Rokaya Benazzi. Projects 4 and 5 (amphi 101): Stefania Dumbrava, Abass Sagna, Nassim Khider.
- Referent for projects 1, 2, 3: Raphaël Jadot (project 4: Abass Sagna; project 5: Stefania Dumbrava). His number is given on site.
- The brief had a V1 published Thu 15 Oct at 0:30. Further changes will be logged with time and announced in each room: **re-read the brief for updates**.

### 0.4 Hard constraints
- **Plans stay within the hackathon [Given]**: do not publish the plans or derived files publicly, do not push them to a public repository, and do not deploy a public demo that serves them. The `plans/` folder is gitignored. Run the demo locally or on a private host.
- **No Nintendo assets, characters, names, music, or logos** [Decided]. The game style is inspired by top-down adventure games only. All art, sprites, and sounds are original or explicitly CC0/own-made (record the licence of anything reused).
- **No fabricated room information shown as real** [Decided]. Anything not verified on site must be flagged as unverified or labelled as a simulation or placeholder.
- Web prototype for PC (desktop browser). Mobile is not required.
- Realistic working time: about 11 hours (Thu 13:40 to 16:00 is about 2h20 plus any extra evening time; Fri 9:00 to 15:30 is 6.5 h). Do not plan for two full days.

### 0.5 Product vision [Decided]
**One website, two views on the same data.**
- **Guide view**: a clear, serious wayfinding site for newcomers (search, filters, room sheets, routes).
- **Adventure view**: a top-down, adventure-game skin of the same map (walk an avatar, talk to guides, complete quests, fog of war, passport).
- A toggle at the top switches between them. Both read the same rooms, the same routing graph, the same quests data. Only the skin changes.
- The Guide view must stand on its own (it satisfies the brief). The Adventure view is the differentiator and must never be the only way to reach a feature.

---

## 1. Source data reference [Given unless marked]

**Important:** none of these files has been inspected by me. They are distributed on site, with a password. First task of any agent: open them and confirm everything marked [Verify].

### 1.1 Files
- `plans/` (not versioned): three **DXF** (RDC, R+1, R+2) plus matching **DWG**.
  - `PLAN ENSIIE R+1 SUPERFICIE.dwg` has no DXF twin. AutoCAD 2018 (AC1032). Needs LibreDWG `dwg2dxf` or the ODA File Converter. Not essential: the R+1 DXF already has a surfaces layer.
- `plans/derives/` (derived, outside the repo):
  - `plan_<niveau>.svg` and `plan_<niveau>.png`
  - `salles.csv`
  - `pieces_<niveau>.geojson` (one per level)

### 1.2 File formats, in plain words
| Format | What it is | Use here |
|---|---|---|
| DWG | AutoCAD's proprietary native drawing | Master source. Convert only if needed (R+1 surfaces) |
| DXF | Open exchange version of a drawing: lines, text, blocks, layers. No concept of a "room" | Extract doors, walls, furniture blocks with `ezdxf` or QGIS |
| SVG | Vector XML graphics, each shape has an `id` | Embed in the page; each room is a clickable `<path id="<niveau>-<numéro>">`. 1 unit = 1 m. Vertical axis inverted: `y_svg = height - y` |
| PNG | Raster at **20 px per metre** | Background image for Leaflet |
| GeoJSON | Room polygons plus properties | The smart layer: number, designation, areas, `fiable` flag |
| CSV (`salles.csv`) | One row per label found: level, designation, number, area read on the plan, label position, reconstructed contour area, contour quality (`oui`, `douteux`, `non`) | Search, filters, stats, join to GeoJSON |

### 1.3 Coordinate system and extents
- All three DXF are drawn **in metres**, including R+1 whose header wrongly says centimetres. **Trap:** a tool trusting the R+1 header will be 100 times off. The derived files are already in metres.
- Each level has **its own origin**. Plans are not superimposable as-is. Stairs and lifts must be aligned by hand on 2 or 3 common points (see B.3).
- All derived files share a **local frame in metres, origin bottom-left**.

| Level | Width x height (m) | Origin in the DXF | PNG size at 20 px/m [derived by me, verify] |
|---|---|---|---|
| RDC | 60 x 35 | (10995, 4293) | 1200 x 700 |
| R+1 | 60 x 60 | (105, 42) | 1200 x 1200 |
| R+2 | 135 x 125 | (495, -915) | 2700 x 2500 |

- **RDC** shows only the part occupied by the school (amphitheatre, foyer, association premises).
- **R+2** includes the 2xx rooms and also the **wing numbered Cxx**.

### 1.4 DXF layers (useful ones)
Room labels are MTEXT on three layers per level: designation ("Salle de TD", "Bureau"...), number, area in m².

| Level | Designation | Number | Area | Walls and partitions |
|---|---|---|---|---|
| RDC | `0_Designation` | label blocks on `0_numéro des salles` (attribute CODE) | `0_superficie` | `0-mur`, `0-cloison`, `1-cloison`, `0-porte`, `0-cadre`, `1-menuiserie` |
| R+1 | `0_Désignation` | `0_Numéro de salle` | `0_Superficie` | `1-cloison`, `0-porte`, `PORTE-A3`, `1-menuiserie`, `04-pochage BATI 2` |
| R+2 | `Désignation` | `_numérotation salles` | `_ superficie` | `GEX_VOL_Archi` (all the building on one layer) |

Notes:
- RDC numbers come from label blocks inherited from a **2006 study**: plausible but **must be checked on site**. The programme name they carry is indicative only.
- R+1 **furniture is drawn as blocks on the partition layer** (usable for capacity estimates).
- **No level contains closed room outlines**: they were reconstructed.

### 1.5 How the GeoJSON contours were made (affects design)
- Obtained by thickening the strokes of walls, **doors**, and windows, then taking the voids that remain. Fragments created by furniture were glued back, aiming at the plan's stated area.
- Contours are slightly **smaller than official areas** (door swing removed).
- About **9 labels in 10 have a reliable contour** over the three levels.
- Properties: number, designation, areas, and `fiable`. `fiable = false` when the contour area differs from the plan area by more than a quarter, **or** for unlabelled spaces (corridors, halls, landings), which are kept because they are useful for routing.
- **Consequence [Proposal, important]:** because doors were treated as thick lines when computing voids, **adjacent polygons are probably separated at the doors**. Walking and routing cannot simply rely on polygon adjacency. Doors must be recovered from the DXF (`0-porte`, `PORTE-A3`) or approximated (see A.6 and B.4).

### 1.6 What does not exist [Given]
- No room reference list: numbers, designations, areas come from architect plans and may be outdated.
- No capacity, equipment, real usage, accessibility data anywhere.
- Levels are not aligned with each other.
- The R+1 surface DWG was not read.

### 1.7 Usage snippet given in the docs [Given]
Leaflet in `L.CRS.Simple` where 1 unit = 1 metre. GeoJSON `[x, y]` is read as `[lng, lat]`, so no conversion is needed.

```js
const map = L.map('carte', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 4 });
const bornes = [[0, 0], [60, 60]];               // [[0,0],[height,width]] of the level
L.imageOverlay('plan_R+1.png', bornes).addTo(map);
fetch('pieces_R+1.geojson').then(r => r.json()).then(g =>
  L.geoJSON(g, {
    style: f => ({ weight: 1, fillOpacity: f.properties.fiable ? 0.3 : 0.05 }),
    onEachFeature: (f, l) => l.bindPopup(`${f.properties.numero ?? ''} ${f.properties.libelle ?? ''}`)
  }).addTo(map));
map.fitBounds(bornes);
```

**[Verify]** The text of the docs says "désignation" while the snippet reads `libelle` and `numero`. Open one GeoJSON file and write down the real property names before coding. Bounds per level: RDC `[[0,0],[35,60]]`, R+1 `[[0,0],[60,60]]`, R+2 `[[0,0],[125,135]]`.

---

## 2. Shared architecture

### 2.1 Principle [Decided]
A **data layer** built once (static JSON, no backend), consumed by two skins. No feature should read raw plan files at runtime other than through this layer.

```
plans/ (DXF, SVG, PNG, GeoJSON, CSV)   <- given, private
        |
   build scripts (Python: ezdxf, shapely, networkx)      [Proposal]
        |
 public/data/  (private deploy only)
   rooms.json        merged room table + our enrichment
   floors.json       per-level transform + z + size
   links.json        stairs and lifts across levels
   graph.json        routing graph
   quests.json  npcs.json  tours.json  metro.json  synonyms.json
        |
   +-----------------------+--------------------------+
   |  Guide view (Part B)  |  Adventure view (Part A) |
   +-----------------------+--------------------------+
```

### 2.2 Suggested stack [Proposal]
- Front end: Vite + TypeScript (or plain JS if the team prefers), Leaflet, `graphology` + `graphology-shortest-path` (or `ngraph.path`) for routing, `fuse.js` for search (optional), `qrcode` for QR generation.
- Adventure view: plain canvas (fastest) or Phaser (more game features, more setup). Leaflet marker with keyboard control is the quickest fallback.
- 3D stack: custom SVG projection (spec in B.4, working reference exists) or three.js for a true orbit view (stretch).
- Data build: Python with `ezdxf`, `shapely`, `networkx`; output static JSON. QGIS is useful to inspect.
- State persistence: `localStorage` for per-viewer progress (visited rooms, quests, passport). Always wrap in try/catch; page must work without it.

### 2.3 Suggested repository layout [Proposal]
```
/plans/                 (gitignored, never public)
/data-src/              hand-edited sources: rooms_enrichment.csv, quests.json, npcs.json, tours.json, metro.json, synonyms.json, control_points.json
/scripts/               build_rooms.py, build_graph.py, extract_doors.py, extract_furniture.py, compute_alignment.py
/public/data/           generated JSON (private deploy only)
/src/core/              data loading, coordinate helpers, graph, search
/src/guide/             Guide view
/src/adventure/         Adventure view
/src/stack/             3D floor stack + metro map
/docs/                  cahier des charges, demo script
```

### 2.4 Core data schemas [Proposal]

**rooms.json** (one record per room or space)
```json
{
  "id": "R+1-101",
  "level": "R+1",
  "number": "101",
  "designation_plan": "Salle de TD",
  "area_plan_m2": 48.0,
  "area_contour_m2": 44.9,
  "reliable": true,
  "centroid": [30.2, 41.0],
  "type": "classroom",
  "activities": ["teaching"],
  "audience": "students",
  "name_fr": "", "name_en": "",
  "description_fr": "", "description_en": "",
  "capacity": null,
  "capacity_estimated": null,
  "equipment": [],
  "accessible": null,
  "opening_hours": null,
  "keywords": [],
  "photo": null,
  "verified_on_site": false
}
```
- `id` follows the SVG convention `<niveau>-<numéro>`. Unlabelled spaces (corridors, halls, landings) need **synthetic ids**, for example `R+1-circ-01`; type `circulation`.
- `type` values (start list, extend on site): `classroom`, `amphitheatre`, `lab`, `office`, `admin`, `association`, `student_life`, `restaurant`, `circulation`, `stairs`, `lift`, `toilets`, `other`.
- `activities` is an array drawn from `teaching`, `research`, `student_life`, `companies`. This single column powers the activity colours, filters, constellation, and metro lines.
- `capacity_estimated` is only filled from furniture-block counts (R+1) and is labelled as an estimate.

**floors.json**
```json
{
  "reference": "RDC",
  "levels": {
    "RDC": { "offset": [0,0],  "rotation_deg": 0, "z": 0,   "size": [60,35] },
    "R+1": { "offset": [24,0], "rotation_deg": 0, "z": 60,  "size": [60,60] },
    "R+2": { "offset": [30,-4],"rotation_deg": 0, "z": 120, "size": [135,125] }
  },
  "control_points": ["stairs-main", "lift-1"],
  "residual_m": null
}
```
**[Placeholder]** all offsets above are the made-up values from our illustration. Real offsets come from B.3. `z` is a display height in px for the stack view, not a real height.

**links.json** (vertical links we create ourselves)
```json
[
  { "id": "stairs-main", "type": "stairs", "accessible": false, "cost_s_per_level": 20,
    "points": [ {"level":"RDC","x":36,"y":27}, {"level":"R+1","x":12,"y":27}, {"level":"R+2","x":6,"y":31} ] },
  { "id": "lift-1", "type": "lift", "accessible": true, "cost_s_wait": 15, "cost_s_per_level": 8,
    "points": [ {"level":"RDC","x":54,"y":27}, {"level":"R+1","x":30,"y":27}, {"level":"R+2","x":24,"y":31} ] }
]
```
**[Placeholder]** coordinates are the illustration's invented values. Points are in each level's **local** frame (not aligned world coordinates). Treat multi-flight staircases as a single link with a cost, not as drawn flights.

**graph.json**
```json
{
  "nodes": [ {"id":"R+1-101","type":"room","level":"R+1","x":30.2,"y":41.0},
             {"id":"door-R+1-101-a","type":"door","level":"R+1","x":28.0,"y":33.5},
             {"id":"R+1-circ-01-n3","type":"corridor","level":"R+1","x":28.0,"y":27.0} ],
  "edges": [ {"a":"R+1-101","b":"door-R+1-101-a","w":3.1,"accessible":true,"kind":"walk"},
             {"a":"stairs-main@R+1","b":"stairs-main@R+2","w":20,"accessible":false,"kind":"stairs"} ]
}
```
Weights are metres for walking edges and seconds-equivalent for vertical edges; convert to a single time unit at query time (walking speed about 1.2 m/s [Proposal]).

---

## 3. Build order and parallel workstreams [Proposal]

Shared prerequisites (do first, in this order; they unblock everything):
1. **Audit the files** (30 min): confirm GeoJSON property names, CSV columns, SVG ids, PNG sizes, whether doors are visible in the GeoJSON. Write findings at the top of `/docs/data-audit.md`.
2. **On-site tour sheet** (start immediately, runs in parallel): shared spreadsheet with one row per room of the chosen sector, columns matching `rooms.json` (type, activities, audience, function, capacity, equipment, accessible, hours, keywords, photo, verified). Export to CSV/JSON.
3. **Pick the sector** and the levels it spans.
4. **Merge** `salles.csv` + GeoJSON + enrichment into `rooms.json`.

Workstreams (can run in parallel once step 1 to 4 are done):
| WS | Owner profile | Deliverable | Depends on |
|---|---|---|---|
| WS1 Data and doors | data / scripting | `rooms.json`, doors, furniture counts, `graph.json` | audit |
| WS2 Guide app | front end | map, search, filters, room sheet, route UI | `rooms.json` |
| WS3 Routing and alignment | algorithms | `floors.json`, `links.json`, shortest path, directions | `graph.json`, control points |
| WS4 Stack and metro views | front end / viz | 3D stack, focus view, metro map | `floors.json`, `links.json` |
| WS5 Adventure view | front end / game | walkable map, dialogs, quests, fog | `rooms.json`, `graph.json` |
| WS6 Specification and demo | analysis / UX | cahier des charges, personas, demo script | none (start now) |

Priority tiers (cut from the bottom if time runs out):
1. **Must**: base map per level, room sheet, search ("Ask the building"), activity colours and filters, route on one level, cahier des charges.
2. **Should**: multi-floor routes with stairs/lift, step-free route, adventure view core (walk, dialogs, quests, passport), characters at services.
3. **Pick one or two**: activity constellation, metro-style map, 3D stack view, fog of war.
4. **Only if time remains**: accessibility lens layer, day in the life simulation, QR sheet, back-office, sound, easter eggs.

Time budget guide (my estimates, assume base map, rooms data and graph exist): fog of war about 1 h, quest board and passport 1.5 h, characters 1 h, ask the building 1.5 h, accessibility lens 1 h, constellation 2 h, metro map 2 h, day in the life 3 h.

Suggested calendar [Proposal]:
- Thu 13:40 to 16:00: steps 1 to 4, base Leaflet map per level, room sheet, first search. Start alignment control points.
- Thu evening (optional): routing graph and multi-floor links.
- Fri 9:00 to 12:00: Guide view complete, routes, step-free, adventure core.
- Fri 12:00 to 14:00: one or two "wow" features, polish, FR/EN.
- Fri 14:00 to 15:30: **feature freeze at 14:00**, bug fixes, demo rehearsal, cahier des charges final.

---

# PART A: Adventure game view (the "Zelda-like" skin)

## A.1 Concept [Decided]
A **top-down adventure game** layered on the same map. The newcomer walks an avatar through the building, talks to guide characters stationed at real services, completes quests that double as a real first-week orientation, and reveals the map by exploring. Each fun feature must also deliver a real, useful fact (for example "bring your ID and ask for the green form").

Why it matters: most teams submit a plain map; this is memorable. Risk: looking like a toy. Mitigation: a visible **Classic map mode** toggle, and every quest and dialogue carries true practical info.

## A.2 Visual style [Decided, details Proposal]
Reference: the interactive mockup we built (illustrative layout, 340 x 220 viewBox).

- Top-down view of the real plan, **restyled**: flat colours, thick dark walls (3 px outline), no photo-realism.
- Room fill by activity: teaching = blue (accent), research = purple, student life = green, companies = yellow, neutral/office = grey, corridors = lightest surface. Use CSS variables so dark mode works.
- Hero: small original character (accent-coloured body, round head, backpack in the secondary colour). NPC guides: same silhouette in other colours (warning yellow for the main guide).
- **Quest marker**: a diamond (danger/red) above the target, bobbing about 3 px with a 1.2 s ease loop.
- **Route trail**: accent-coloured dots (r about 2.5) along the path, 25 px spacing in the mock.
- HUD: top strip with level and wing name (monospace, small) and a step counter; bottom **dialog box** in monospace with a coloured speaker line and body text; right **quest log** panel.
- Typography: monospace for the game layer. Minimum 11 px.
- **Originality rule:** do not copy Nintendo visuals, UI, sprites, sounds, or names. Draw sprites in SVG/canvas yourselves. If a tileset or sound pack is used, only CC0 or own work (for example Kenney assets are CC0, but [Verify] the licence before use) and note it in `/docs/credits.md`.

## A.3 Rendering and controls [Proposal]
- Render options: (1) plain `<canvas>` over the level PNG/SVG (recommended), (2) Phaser, (3) Leaflet `L.CRS.Simple` with a keyboard-driven marker (quickest, fewer game features).
- Units: world units are **metres**, same as the plans. Convert to pixels with a zoom factor; at 20 px/m the PNG is 1:1.
- Camera follows the hero; zoom fixed at a level where a room is about 25 % of the screen width.
- Controls: **arrow keys and WASD** to walk; **click on a room or a quest marker to auto-walk** (follow the A* path from the routing graph); `E` or `Space` to talk or advance a dialog; `M` for the map/minimap; `Esc` for the menu.
- Speed: about 4 to 6 m/s in game units (faster than real walking, for feel), hero radius about 0.4 m.
- Every game action must have a **non-game equivalent** in the Guide view.

## A.4 Walkable area and collisions [Proposal, key technical risk]
Do **not** use the PNG's dark pixels as walls: label text and numbers on the PNG may also be dark, creating false walls [Verify]. Instead:

1. Build a **walkability raster** at load: draw all room and circulation polygons from the GeoJSON in white on an offscreen canvas (10 to 20 px per metre), black elsewhere.
2. Because doors were treated as thick lines when the polygons were computed, **adjacent polygons are likely disconnected**. Add **door gates**: for each door (from DXF door layers, or approximated, see below), draw a small white rectangle (about 1 m wide, wall-thickness deep) joining the two sides.
3. At runtime, a candidate position is walkable if the raster pixel is white. Use axis-separated checks so the hero slides along walls.
4. **Fallback if doors cannot be extracted:** for each room polygon, find the nearest circulation polygon within about 0.6 m, and place a gate at the closest boundary point. Mark these doors `approx: true`.
5. Treat the **non-reliable** (`fiable: false`) rooms as walkable only if they are circulation spaces; for unreliable labelled rooms, use the polygon anyway but flag it in the quality dashboard.

Acceptance: the hero cannot leave the building, cannot cross a wall, and can enter and leave every room in the chosen sector through a door.

## A.5 Zones and triggers [Proposal]
- Each room polygon is a **zone** with `id` = room id. Entering fires `onEnter(roomId)`: reveal fog, check quests, show the room name banner.
- Test with point-in-polygon, accelerated by a coarse grid or `rbush`.
- NPCs have an **interaction radius** (about 1.5 m). `E` opens the dialog.

## A.6 Dialog system [Proposal]
- Dialog box at the bottom: speaker name line (coloured), body text with a typewriter effect (skip on key), advance on `Space`, `Enter`, or click.
- Up to **3 choices** (for example "Show me the route", "What else is here?", "Bye"). A "Show me the route" choice draws the trail from the hero to the target using the shared router.
- Text comes from `npcs.json` and `rooms.json` descriptions, **bilingual**.
- Dialog lines must carry **verified practical info**; unverified lines are tagged `verified: false` and shown with a subtle marker in debug mode.

## A.7 Characters at services (NPCs) [Decided]
One guide per real service in the sector (administration desk, library, canteen, clubs, labs...). Each NPC:
```json
{
  "id": "npc-admin",
  "name": "Admin guide",
  "roomId": "RDC-xxx",
  "position": [x, y],
  "color": "warning",
  "role": "quest_giver",
  "lines": [
    { "id": "greet", "text_fr": "...", "text_en": "...", "source": "on-site tour", "verified": false },
    { "id": "help",  "text_fr": "...", "text_en": "...", "source": "on-site tour", "verified": false }
  ],
  "gives_quests": ["q-student-card"]
}
```
- Overhead icon: `!` (offers a quest), `?` (has info), none (ambient).
- **[Placeholder]** the example "Bring your ID, and ask for the green form" from our mockup is invented. Real lines come only from the on-site tour.
- A single **mascot guide** (original design) can tutorialise the first minute and appear as a hint-giver everywhere.

## A.8 Quest system [Decided, schema Proposal]
Quests turn orientation into a first-week checklist.

```json
{
  "id": "q-find-lift",
  "title_fr": "...", "title_en": "Find the lift",
  "persona": ["student", "visitor"],
  "type": "visit",
  "target": { "roomId": "RDC-lift" },
  "prereq": [],
  "hint": { "text_en": "Look near the main hall.", "marker": true },
  "on_complete": { "dialog": "npc-guide:lift-done", "badge": "badge-lift" }
}
```
Quest types:
- `reach` (get to a place; the route is shown on request),
- `visit` (enter a zone),
- `talk` (speak to an NPC),
- `find` (discover something with no marker; revealed by proximity),
- `collect` (gather N stamps or items).

Starter quests, all to be confirmed against what really exists on site:
- Reach the sector's headline room (for our hackathon room, C53 is the natural example),
- Meet the clubs at the foyer (student life),
- Peek into a research lab (research),
- Find the lift (accessibility),
- Collect your student card (administration),
- Print your first page (practical service),
- Meet a company contact or partners space (companies).

Quest log UI: checkbox list, ticks when done (green), progress "Explored x %" bar. Quest state is stored per viewer.

## A.9 Passport and badges [Decided]
- A **passport** with up to 3 to 8 stamps/badges, earned by quests or exploring a category (one stamp for each of the four activities is a good scheme).
- Badge UI: round tokens; earned = filled with the activity colour, unearned = dashed outline.
- Optional: a printable or shareable summary at the end ("Quest complete").

## A.10 Fog of war [Decided]
- Rooms are hidden (dashed outline, "?" mark) until visited. Reveal rules:
  - Entering a room polygon reveals it permanently.
  - Corridors reveal within about 6 m of the hero.
  - Quest target rooms may show as `?` silhouettes with a marker until entered.
- "Explored %" = revealed rooms in the sector / total rooms in the sector.
- Persisted in `localStorage`. A **"Reveal all"** developer/demo switch is needed for the jury.
- Fog applies only in the Adventure view; the Guide view always shows everything.

## A.11 Extra game features (parked, in priority order) [Decided as ideas]
1. **"I'm lost" button**: one tap sets the hero to the nearest landmark and draws the route to the main hall or foyer. Real newcomer value.
2. **Time-aware world**: night palette in the evening; "open now" bubbles on services.
3. **Easter eggs**: a hidden spot or message that rewards exploration.
4. **Speedrun mode**: time from entrance to a target room, simple best-time list (local only).
5. **Photo spots**: mark scenic spots for open-day visitors.
6. **Sound**: footsteps and a quest-complete chime using WebAudio synth beeps (no audio files, no licensing).
7. **Open-day treasure hunt**: checkpoints with QR codes at real doors; each checkpoint is a real service.

## A.12 Multi-floor in the game [Proposal]
- Stairs and lifts are **zones that change level** (fade, brief transition, hero appears at the matching point of the next level via `links.json`).
- The lift is the step-free option; stairs are hidden from the "accessible" path.
- Optional visual: the level name flashes on arrival.

## A.13 Persona starts [Proposal]
A start screen asks "Who are you?" (student, visitor, company). Each persona sets the starting point (for example the main entrance), the quest list, and the NPC greeting tone. Same personas as the Guide view (see B.1).

## A.14 Accessibility of the game itself [Proposal]
- Fully keyboard-operable; visible focus.
- "Reduce motion" setting (disables bobbing and typewriter).
- Colour is never the only carrier of meaning: add icons and text labels to activity colours.
- Classic map mode toggle always visible.

## A.15 Acceptance criteria (Part A)
- Hero walks through every room of the chosen sector, never through walls.
- At least **4 quests** playable end to end, with correct completion and persisted state.
- At least **3 NPCs** with bilingual dialogue containing verified info.
- Fog of war reveals correctly and "Explored %" matches visited rooms.
- A quest's **"show me the route"** draws the same path as the Guide view router.
- Toggle to Guide view keeps the selected room and level.
- Works offline on a PC browser, no external assets required.

## A.16 Risks (Part A)
- Door connectivity (A.4): if unsolved, the hero is trapped in rooms. Do this first.
- Art time: keep sprites minimal; spend time on dialogue content instead.
- Jury perception: keep the Guide view reachable in one click.
- Unverified content: never present placeholder dialogue as real; mark or remove it before the demo.

---

# PART B: The application (Guide view, 3D floor stack, metro map, routing, and more)

## B.1 Users and needs (feeds the cahier des charges) [Proposal]
Personas (confirm via the needs analysis):
- **New student**: finds classrooms, services, clubs; wants a first-week checklist and the simplest route.
- **Visitor or applicant (open day)**: wants a guided overview, key places, a short tour.
- **Company representative**: wants to find the relations-with-companies space, meeting rooms, how to reach them.
- **Staff or teacher** (secondary): quick room lookup.
- **Person with reduced mobility**: step-free routes and lift locations.

Core user tasks: find a room by number or by need; see what a place is and who it is for; get a route from A to B (possibly across floors); explore by activity (teaching, research, student life, companies); learn the school's structure at a glance.

## B.2 Guide view: layout and features [Decided, from the first mockup]
Layout (desktop):
- **Top bar**: logo, search field, persona pills (Student, Visitor, Company), language switch FR | EN.
- **Left panel (about 130 to 180 px)**: activity filters with colour keys (Teaching, Research, Student life, Companies), floor selector (Ground, Level 1, Level 2), guided tours list.
- **Centre**: the map, with a **2D / 3D toggle**, floor switch, and a route summary bar at the bottom (for example "Hall to C53, 142 m, 2 min, step-free"). Numbers in the mockup are illustrative.
- **Right panel (about 170 px)**: room sheet: name, subtitle, surface, capacity (with "about" when estimated), function, outline reliability badge, activity tags, QR code, "Route from here" button.

Functional requirements (draft IDs for the cahier des charges):
- F1 Select a room by click on the map or from search; open its sheet.
- F2 Search (B.5).
- F3 Filter by activity, space type, level.
- F4 Route from A to B on one level.
- F5 Route across levels via stairs or lift.
- F6 Step-free route option.
- F7 Colour rooms by activity; legend.
- F8 Floor switcher; 2D / 3D toggle.
- F9 Guided tours by persona.
- F10 FR/EN interface.
- F11 Practical info and links to the school's digital resources (to be provided; check with the referent which links are official).
- F12 Deep link to a room (`#/room/<id>`), used for QR codes.
- F13 Data-quality indicators (B.14).

Non-functional: PC browser, loads offline from static files, clear contrast, readable at 11 px minimum, responds within about 100 ms for search and route, no personal data collected.

## B.3 Multi-floor alignment [Decided, procedure Proposal]

Because everything is in metres, a rigid transform suffices (translation, possibly a small rotation, **no scaling**).

Procedure:
1. Choose a **reference level** (RDC is natural).
2. Pick **two or three points that physically coincide across levels**: the main stairs, the lift, optionally a structural column or stair core corner.
3. Read each point's **local coordinates** on every level. Use a temporary click helper:
   ```js
   // CRS.Simple: latlng = [y, x] in metres
   map.on('click', e => console.log(e.latlng.lng.toFixed(2), e.latlng.lat.toFixed(2)));
   ```
4. For each non-reference level, compute `offset = reference_point - level_point` from the first point.
5. Use the second point as a check: `residual = |(lift_ref) - (lift_level + offset)|`. If under about 1 m, treat as translation only. If larger, estimate the small rotation from the vector between the two points and apply it before the shift.
6. Verify visually: overlay two levels at 50 % opacity and compare outer walls and stair cores.
7. Store the result in `floors.json` (with `residual_m`) and `links.json`.

Helper script to write: `compute_alignment.py` taking `control_points.json` (`{ "stairs-main": {"RDC":[x,y],"R+1":[x,y],"R+2":[x,y]}, ... }`) and outputting `floors.json` offsets and residuals.

Cautions:
- R+2 is much larger (135 x 125 m) and includes the Cxx wing; it may not overlap the others in plan. Align on the part they share.
- RDC shows only the school-occupied part: expect gaps.
- Click precision limits accuracy; zoom in when reading points.
- Do the R+1 header trap check (centimetres) first.

## B.4 3D stack view and focus view [Decided]

Reference: the interactive illustration we built (stack with raw/aligned toggle and per-floor focus). Layouts there were fake; real data replaces them.

### Stack view (exploded isometric)
- Floors are stacked at heights `z = 0, 60, 120` (display px) for RDC, R+1, R+2.
- Projection from the reference implementation:
```js
const S = 2.4, CX = 305, CY = 119;            // scale and centring for a 680 x 440 viewBox
function stackProject(lx, ly, level, a) {      // a = 0 raw, 1 aligned
  const off = floors[level].offset;
  const wx = lx + off[0]*a, wy = ly + off[1]*a;
  return [ (wx - wy) * 0.866 * S + CX,
           (wx + wy) * 0.5   * S - floors[level].z + CY ];
}
```
  (Recompute `S`, `CX`, `CY` so the real extents fit; R+2 is large.)
- Draw order bottom to top, rooms as polygons with fill opacity about 0.85 so lower floors stay faintly visible.
- **Vertical links** from `links.json`: a line from each link point on level *i* to level *i+1*. Colour semantic: **dashed red when plans are not aligned, solid green when aligned**. Stairs marker = circle labelled S; lift marker = square labelled L.
- A **Raw origins / Aligned** toggle animates offsets from 0 to their real values. This is both a UX story ("this is why alignment matters") and a debugging tool.
- Floor labels at the left vertex of each floor, "RDC", "R+1", "R+2".

### Focus view (one floor, top-down, more detail)
- Blend from the isometric projection to a flat top-down projection (`t` from 0 to 1) while non-focused floors fade out.
- Focus scale and centring: `fs = min(640 / w, 350 / h)`, `fox = (680 - w*fs)/2`, `foy = 40 + (350 - h*fs)/2`. Smoothly interpolate (about 0.15 per frame).
- Extra detail visible only in focus: room labels, **furniture blocks** (from DXF for R+1; capacity estimate source), **doors**, stair and lift markers with link text (for example "Stairs up R+1, down RDC"), a **scale bar** (10 m), room reliability styling.
- In production, the focus view can simply be the **Leaflet per-floor map** (zoom and click for free) while the stack view remains an overview. Recommended order: **build the Leaflet per-floor view first**, then the stack as overview.

### Optional true 3D
- three.js with extruded room polygons (walls from DXF), orbit camera, floors lifted apart. Highest effort. Only after everything else works.

Acceptance (B.4): toggling Raw/Aligned moves floors smoothly and link colour flips; clicking a floor focuses it with labels; clicking 3D stack returns; selected room is preserved across views.

## B.5 Search: "Ask the building" [Decided, details Proposal]
Goal: type a need, not just a room number.
- Normalise input: lowercase, strip accents and punctuation.
- Detect a **room number pattern** first (for example `C53`, `101`, `R+1 101`) and resolve directly.
- Otherwise match against `rooms.json` fields: `name_fr/en`, `type`, `keywords`, `designation_plan`, plus a **synonyms dictionary** (`synonyms.json`), FR and EN, for example print / imprimer / photocopie; eat / manger / restaurant / cafet; toilets / WC / toilettes; lift / ascenseur; clubs / associations / assos; admin / scolarité / secrétariat. **Only index services that really exist** (check on the tour).
- Rank: exact number > exact name > keyword/synonym > fuzzy (`fuse.js`). Return the top 3 with level, short description, and a **"Route"** button.
- Empty state: suggest filters; no dead ends.
- Pure keyword matching, no LLM needed; works offline.

## B.6 Routing: paths to places [Decided, details Proposal]

### Graph construction
- Nodes: room centres, door midpoints, corridor sample nodes, stair nodes, lift nodes, optional points of interest.
- **Doors:** extract from the DXF door layers (`0-porte`, `PORTE-A3`, `1-menuiserie`) with `ezdxf` (midpoint and orientation). **Fallback:** a pseudo-door at the closest boundary point between a room polygon and a neighbouring circulation polygon (within about 0.6 m); mark `approx: true`.
- Edges: room centre to its doors; door to adjacent corridor nodes; corridor nodes along centrelines (sample the circulation polygon medial axis, or a regular grid clipped to the polygon, connected to neighbours within about 3 m if the straight segment stays inside the polygon).
- **Vertical edges**: from `links.json`, connect the stair node on level *i* to level *i+1* (cost in seconds per level), same for lifts (wait time plus ride time). Mark stairs `accessible: false`, lifts `accessible: true`.
- Because the GeoJSON has no explicit connectivity, **validate** the graph: run a connectivity check and list rooms not reachable from the main entrance; fix by adding doors manually.

### Algorithm
- Dijkstra or A* (`graphology-shortest-path`, or NetworkX in Python for pre-validation).
- Two cost profiles: **default** (fastest) and **step-free** (stairs edges excluded or heavily penalised).
- Time estimate: distance / 1.2 m/s plus vertical costs.

### Route presentation
- Polyline drawn on the map, level by level, with a **mini-stepper** when crossing levels ("Level 1: walk to the lift; Level 2: arrive").
- Route summary bar: origin, destination, distance, time, step-free badge.
- **Step-by-step directions** generated from the path: detect turns at corridor nodes (left/right/straight from the heading change), mention landmark rooms nearby, stairs or lift usage. Keep text bilingual.
- "Click a start room, click a destination" and "use my current room" options; "I'm lost" shortcut (A.11).

Acceptance: A to B returns a valid path for every pair of reachable rooms in the sector; step-free path never uses stairs; multi-level path passes through a link; unreachable rooms are reported in the data-quality dashboard.

## B.7 Metro-style map [Decided as an idea, spec Proposal]
A schematic "subway map" of the building for fast understanding.
- **One line per activity**: Teaching (blue), Research (purple), Student life (green), Companies (yellow). Rooms or room groups become **stations**; a place serving several activities becomes an **interchange** (larger circle).
- Geometry: octilinear (horizontal, vertical, 45-degree segments), rounded joins, 5 px line weight; stations r = 5, interchanges r = 7; short labels.
- Multi-level: either one panel per level, or a unified map where stairs and lifts are drawn as short vertical connectors.
- **Authoring approach [Proposal]:** hand-author `metro.json` for the chosen sector (about 10 to 15 stations): station id, linked `roomId`, schematic `x,y`, which lines it belongs to, label. Do not try to auto-layout octilinear maps in the hackathon (stretch only).
- Interaction: hover or click a station opens the room sheet; click a line highlights all its stations; "Route" from any station.
- Acceptance: every station links to a real room id; every line colour matches the activity colour key.

## B.8 Activity constellation [Decided as an idea]
- Graph view with four **activity nodes** (pills) at the corners and **room nodes** in the middle, edges from each room to the activities it serves (`rooms.json.activities`).
- Click an activity: its connected rooms light up on the map and in the list; click a room: its activity links highlight.
- Directly answers the brief's request to show the link between spaces and key activities. Cheap if `activities` is filled.

## B.9 Accessibility lens [Decided as an idea]
- A map layer toggle showing: lifts (L), stairs (S), step-free route, quiet rooms, toilets and other data you can verify on site.
- Requires `accessible` flags on rooms and links and a tour of lifts and ramps. If data is missing, say so in the UI (never default to "accessible").

## B.10 Day in the life [Decided as an idea, highest risk]
- A **time slider** (8:00 to 18:00) animating simulated people moving between rooms: lunch peak at the canteen, class blocks in classrooms, club activity late afternoon.
- Must be **clearly labelled "Simulation"**; there is no real occupancy or timetable data. Use only synthetic, aggregate agents; no personal data.
- Implementation: a few archetype schedules; agents walk along graph paths; show as dots, or as a per-room density heat tint.
- Only attempt after core features are done (about 3 h).

## B.11 Guided tours and persona stories [Proposal]
- `tours.json`: ordered steps `{ roomId | poi, level, text_fr, text_en, camera }` per persona (new student, open day visitor, company visitor).
- Tour UI: step list, next/previous, the map flies to each step and draws the connecting route.
- Same content powers the Adventure quest chains (A.8).

## B.12 Bilingual FR/EN [Decided]
- All UI strings in a dictionary (`i18n/fr.json`, `en.json`); all room names and descriptions have `_fr` and `_en` fields. Missing translation falls back to the other language, never to an empty string.

## B.13 QR codes and deep links [Decided as an idea]
- URL scheme: `#/room/<id>` and `#/route/<fromId>/<toId>`.
- Script generates one QR per room (`qrcode`); optionally an A4 print sheet. Handy for the open day and the treasure hunt.

## B.14 Data-quality dashboard and back-office [Decided as ideas]
- **Dashboard**: table of rooms with plan area vs reconstructed area, `fiable` flag, `verified_on_site`, missing function or translation, graph reachability; counts per level and type; downloadable CSV.
- **Back-office (stretch)**: small form to edit a room's function, activities, description, capacity, accessibility; saves to browser storage and exports JSON/CSV. No server.
- Statistics view: m² per activity, per level, per type.

## B.15 Capacity from furniture blocks [Decided as an idea]
- R+1 furniture is drawn as blocks on the partition layer. With `ezdxf`, count seat-like blocks per room polygon (point-in-polygon on block insert points). Convert to `capacity_estimated` using block type rules (for example one chair block = one seat), validated on two or three rooms by counting on site.
- Always display as "about N (estimated)". Only R+1 has this data; other levels show "capacity unknown".

## B.16 Cahier des charges (deliverable 1) [Proposal outline]
1. Context and objectives
2. Stakeholders and user profiles (B.1)
3. Use cases and user stories per profile
4. Functional requirements (F1 to F13 and extensions), prioritised (must / should / could)
5. Data requirements: sources, quality, enrichment process (on-site tour), known gaps (section 1.6)
6. Non-functional requirements
7. Information architecture and screens (Guide view, Adventure view, stack, metro)
8. Technical approach and data model (section 2)
9. Risks and mitigations
10. Planning and scope decisions (chosen sector, what was cut)
11. Acceptance tests

Write it in parallel with development (WS6), not at the end.

## B.17 Demo script (about 5 minutes) [Proposal]
1. Guide view: search "print" (or the real service), see highlighted room and sheet (30 s).
2. Route from the entrance to the target room, cross a level, toggle step-free (60 s).
3. Switch to 3D stack, toggle Raw/Aligned, focus a floor (45 s).
4. Show activity filter or constellation: "space linked to activity" (30 s).
5. Switch to Adventure view: walk, talk to a guide, complete a quest, show passport and fog (90 s).
6. Data-quality dashboard and on-site data collection story (30 s).
7. Close with what a real twin could add (live data), clearly marked as future work (15 s).

## B.18 Acceptance criteria (Part B)
- Search finds a room by number, by name, and by need (at least 10 synonyms covered).
- Route works within and across levels; step-free option excludes stairs.
- Stack view shows aligned floors with vertical links; focus works for each floor.
- Room sheet shows only verified data or clear "unknown" markers.
- FR/EN toggle covers all UI and room text of the sector.
- No plan data served publicly; demo runs locally or on a private host.

## B.19 Risks (Part B)
- Door connectivity for routing (1.5): validate the graph early.
- Alignment accuracy and R+2 extents (B.3).
- Property name mismatches between docs and files (1.7).
- Unreliable contours (about 1 in 10): style them distinctly and keep them out of routing where possible.
- Scope creep: freeze features at Fri 14:00; cut tier 4 first.
- Data gaps (no capacity, equipment, usage, accessibility): collect on site, or label as unknown.

---

## 4. Open questions to resolve with the team or the referent
1. Which sector is chosen, and which levels does it span?
2. Real GeoJSON property names and the exact SVG id format (1.7).
3. Are doors visible in the DXF layers as clean geometry, or only as arcs and lines needing interpretation?
4. Which services really exist and where (printing, library, canteen, clubs, administration)? Confirm on the tour.
5. Which official links or digital resources of the school may be linked from the site (F11)?
6. Are there branding or logo guidelines for the school we must respect (or avoid)?
7. Is a private hosting option available for the demo, given the plans must stay within the hackathon?
8. Which control points (stairs, lift) are the most reliably identifiable on all three plans?

## 5. Parked ideas (not planned, kept for the pitch)
- Isometric board-game look for the whole building.
- Open-day treasure hunt with printed QR codes (partly covered by A.11).
- Georeferencing onto a real-world map (needs known coordinates).
- Export to an open indoor-mapping standard (for example OpenStreetMap indoor tagging).
- Live occupancy and room schedules (only as a clearly labelled mock).
- First-person walk-through in the extruded model.

## 6. Definition of done (whole project)
- Cahier des charges delivered and consistent with what was built (cut items listed as "out of scope").
- Prototype runs on a PC browser from static files; Guide view complete for the chosen sector; Adventure view playable with at least the A.15 criteria.
- Room data enriched on site, with `verified_on_site` set truthfully.
- Credits and licences file present; no Nintendo material; no public deployment of plans.
- Demo script rehearsed at least once before the jury slot.

## 7. Quick-start checklist for a new agent
1. Read sections 0 to 3.
2. Do the file audit (section 3, step 1) and update [Verify] items.
3. Pick your workstream (WS1 to WS6) and check its dependencies.
4. Use the schemas in 2.4; if you must change one, change it in this file and tell the others.
5. Ship small and often: a working single-level map with room sheets before any fancy view.