# Agent prompt: build the ensIIE digital-twin frontend

Copy everything below the line into a new agent. Source of truth is only `jumeau_numerique_ensIIE.md` and `steps.md`. Do not invent school facts.

---

You are building the **interactive web prototype** for the hackathon project **« Un jumeau numérique de l'ensIIE »**.

## Before you code

1. Read `jumeau_numerique_ensIIE.md` (official brief + how the architect files work).
2. Read `steps.md` (product spec: architecture, Guide view, 3D stack, routing, search, i18n, adventure).
3. Audit the real files in `plans/` and `plans/derives/` (gitignored). Confirm GeoJSON property names, CSV columns, SVG ids, PNG sizes. The docs say `désignation` in one place and `libelle` / `numero` in the snippet — **verify before coding**. Write findings if useful.
4. Never publish plans, derived GeoJSON/PNG/SVG/CSV, or a public demo of them. Keep `plans/` gitignored. Run locally.

## What to ship

**One website, two skins on the same data.**

- **Guide view (must work; this satisfies the brief):** wayfinding for newcomers.
- **Adventure view (chrome only for now):** top-down adventure *interface* (HUD, quest log, dialog box, passport). **Do not implement walking, collisions, NPCs, quests, or fog.** Leave the map/stage empty with a short “not built yet” message. No Nintendo names, sprites, music, or logos.

Toggle Guide | Adventure in the top bar. Selected room and level must survive the toggle.

Stack: **Vite + React** (JS or TS). Static JSON data layer is preferred (`steps.md` §2.1). Add a small Express server only if you need it to serve private plan files locally. Desktop PC browser. FR/EN. No personal data.

## Data layer (do this first)

Do **not** read raw DXF/DWG at runtime. Build once into `public/data/`:

| File | Role |
|---|---|
| `rooms.json` | One record per space. Schema in `steps.md` §2.4. `id` = `<niveau>-<numéro>` (SVG convention). Unlabelled circulation gets synthetic ids e.g. `R+1-circ-01`. |
| `floors.json` | Per-level `offset`, `rotation_deg`, `z`, `size`. |
| `links.json` | Stairs and lifts across RDC / R+1 / R+2 (local coords per level). |
| `graph.json` | Routing nodes + edges. |
| `tours.json` `metro.json` `synonyms.json` | Tours, schematic metro, search synonyms. |

Merge `salles.csv` + `pieces_<niveau>.geojson`. Enrich `type` and `activities` from plan designations only, and mark **`verified_on_site: false`** unless the brief itself states it (C53 Platech 1, amphi 101 launch, amphi Cabanes). Never show guessed usage as fact.

**Coordinates (metres, origin bottom-left on derived files):**

| Level | Size (m) | Leaflet bounds `[[0,0],[height,width]]` |
|---|---|---|
| RDC | 60 × 35 | `[[0,0],[35,60]]` |
| R+1 | 60 × 60 | `[[0,0],[60,60]]` |
| R+2 | 135 × 125 | `[[0,0],[125,135]]` |

R+1 DXF header may say centimetres — derived files are already metres. Each level has its **own origin**; they are not stacked until you apply `floors.json` offsets (procedure B.3). RDC is only the school-occupied part. R+2 includes 2xx **and** the Cxx / sIIEnext wing.

PNG: 20 px/m, use as Leaflet `imageOverlay`. SVG: 1 unit = 1 m, `y_svg = height - y`, room paths `id="<niveau>-<numéro>"`. GeoJSON `[x,y]` is Leaflet `[lng,lat]` in `L.CRS.Simple`. Style `fiable` distinctly (unreliable / unlabelled corridors: low fill opacity).

## Guide UI (layout is decided — `steps.md` B.2)

Desktop:

- **Top bar:** logo/name, search (“Ask the building”), persona pills (Student, Visitor, Company), language FR | EN, Guide/Adventure toggle.
- **Left (~130–180 px):** activity filters with colour keys (**teaching blue, research purple, student life green, companies yellow**), floor selector (RDC, R+1, R+2), guided tours.
- **Centre:** map, **2D / 3D toggle**, floor switch, route summary bar at the bottom (origin, destination, distance, time, step-free badge).
- **Right (~170 px):** room sheet — name, subtitle, surface, capacity as “about N” if estimated else unknown, function, contour reliability, activity tags, deep link / QR, “Route from here”.

Personas (`steps.md` B.1): new student, visitor/open day, company, staff (secondary), reduced mobility (step-free + lifts).

Implement functional requirements **F1–F13** from B.2.

### 2D map (build first)

Leaflet `CRS.Simple` per `jumeau_numerique_ensIIE.md` §4 and `steps.md` §1.7. PNG background + GeoJSON rooms. Click room → sheet. Colour by `activities`. Floor switcher. Pan/zoom. Scale bar in focus. Preserve selection across views.

### 3D stack (B.4 — required)

Exploded isometric **superposition** of RDC, R+1, R+2.

- Display heights `z = 0, 60, 120` px.
- Projection from the spec (recompute `S`, `CX`, `CY` so R+2 fits):

```js
function stackProject(lx, ly, level, a) { // a = 0 raw, 1 aligned
  const off = floors[level].offset;
  const wx = lx + off[0]*a, wy = ly + off[1]*a;
  return [ (wx - wy) * 0.866 * S + CX,
           (wx + wy) * 0.5   * S - floors[level].z + CY ];
}
```

- Draw bottom to top; room fill opacity ~0.85.
- Vertical links from `links.json`: **dashed red if raw, solid green if aligned**. Stairs = circle “S”, lift = square “L”.
- Toggle **Raw origins / Aligned** (animate offsets).
- Click a floor → **focus** (top-down, labels); click 3D stack to return. Optional: three.js orbit + extruded polygons *after* Leaflet + isometric work.
- Alignment: rigid translation (maybe small rotation, **no scale**) using stairs/lift as control points (B.3). Placeholder offsets are OK if labelled as unverified.

### Search (B.5)

Need-based, offline, no LLM. Normalize (lower case, strip accents). Room-number pattern first (`C53`, `101`, `R+1 101`). Else match names, type, keywords, `designation_plan`, `synonyms.json` (print/imprimer, eat/manger, toilets/WC, lift/ascenseur, clubs/assos, admin/scolarité, … — **only services that exist in the data**). Rank: exact number > exact name > synonym > fuzzy. Top results with level + Route. Empty state must suggest filters.

### Routing (B.6)

Graph: room centres, doors, corridor samples, stair/lift nodes. Doors from DXF layers `0-porte`, `PORTE-A3` or fallback pseudo-doors (~0.6 m to circulation), mark `approx: true`. Polygons are probably **disconnected at doors** — do not route by adjacency alone. Dijkstra/A*. Walking ~1.2 m/s. **Step-free** excludes stairs. Multi-floor via `links.json`. Draw polyline per level + stepper (“walk to lift; arrive R+2”). “I'm lost” → landmark/entrance then route. Unreachable rooms go on the quality dashboard.

### Also build (Guide)

- Guided tours (`tours.json`) per persona, next/prev, fly to step, draw route (B.11).
- Metro schematic, ~10–15 hand-authored stations, one line per activity (B.7).
- Activity constellation: four activity nodes, rooms linked by `activities` (B.8) — this is how you show spaces ↔ teaching/research/student life/companies.
- Accessibility lens only with real flags; if unknown, say unknown (B.9). Never default to accessible.
- Deep links `#/room/<id>` and `#/route/<from>/<to>` (B.13).
- Data-quality dashboard: plan m² vs contour m², `fiable`, `verified_on_site`, missing fields, reachability (B.14).
- Official school link only if clearly official (e.g. ensiie.fr); other digital resources: placeholder “confirm with referent”.
- Capacity: “about N (estimated)” only if derived; otherwise unknown. Furniture-block counts are R+1-only (B.15).

Skip unless core is done: day-in-the-life simulation (must be labelled Simulation), back-office editor, QR print sheets.

## Adventure chrome (empty)

Match A.2 HUD language only: top strip (level / wing, step counter), empty stage, bottom dialog box, right quest log, empty passport stamps (four activity colours). Monospace is fine. No playable hero.

## Quality rules

- Bilingual UI dictionary; room `name_fr`/`name_en`, `description_fr`/`description_en`; fallback to the other language, never blank (B.12).
- Contrast, ≥11 px, search/route snappy, works from static files.
- Unreliable contours styled differently.
- If a GeoJSON/PNG/SVG is missing, degrade: points from `salles.csv` still searchable and plotted; say data is incomplete.

## Acceptance (from the md files)

Guide: search by number, name, and need (≥10 synonyms); routes on one level and across levels; step-free never uses stairs; 3D stack with aligned floors + vertical links + focus; room sheet never presents unverified data as real; FR/EN; local demo only.

Adventure: layout present, not playable.

## Order of work

1. Audit files + `rooms.json`.
2. Leaflet 2D + room sheet + search + activity colours.
3. Routing + `links.json` + step-free.
4. 3D stack Raw/Aligned + focus.
5. Tours, metro, constellation, quality dashboard, i18n polish.
6. Empty Adventure shell last.

Do not start from a blank aesthetic that ignores B.2. Ship a usable Guide even if 3D or metro is rough.
