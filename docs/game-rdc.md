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
Green: two classroom chalkboards with a table in front, a bin and two potted plants. Red: three Wooden Bench (Back) sprites face north toward the elevator. Yellow: modular L-shaped wooden counter, monitor, stationery, north-facing swivel chair, bin and Amelia facing south. The east counter opening stays 44 px wide.
Depth sorting uses the feet of furniture and characters to handle walking behind the board and benches.
Assets copied to public/game/decor come from the supplied files: Wooden Bench (Back), Small Wooden Desk, Swivel Chair_1, Waste Basket 1 and persons/Amelia_idle_16x16 (four 16x32 frames, front frame 3).
Crops from Interiors_free_32x32.png: noticeboard (0,1344,96,64), plant (336,1424,48,64), computer (136,1152,24,24), stationery (96,1152,32,32). The source files are preserved.
The receptionist now starts the fictional welcome quest described below.


## Campus, conversations et première quête

Le générateur `scripts/rdc-campus.mjs` complète les aménagements après les éléments de réception. Il conserve les murs, les portes et les coordonnées du dessin. Le hall utilise les dalles grises existantes ; les locaux de service utilisent des carreaux clairs et les espaces de vie, de lecture ou d’enseignement un parquet. Les façades orientées vers le joueur sont pleines, avec des ouvertures de même hauteur pour les portes.

Le foyer reprend le schéma fourni : bar en L au nord, buffet au sud-ouest, trois tables rondes avec des chaises au centre, canapé en L au sud-est et deux tables de jeux à droite. Sept personnages y sont présents, dont le barman et deux étudiants assis. La pièce `drawn-rdc-9`, directement au nord-est du foyer, devient « 030 · Bibliothèque », avec étagères, livre ouvert, table, chaises et Oussama. Des poubelles occupent les pièces disposant d’un emplacement sûr ; les petits compartiments de circulation et l’ascenseur restent dégagés.

**Toutes les conversations sont en français, même si la langue générale de l’application est changée.** Approcher un personnage puis appuyer sur **E**, ou utiliser le bouton « Parler », ouvre un dialogue. La caméra se rapproche progressivement et deux bandes noires encadrent la scène. Les mouvements sont suspendus pendant les dialogues et les fenêtres. **Échap** ferme la fenêtre et redonne le contrôle au joueur.

Amélia, à l’accueil, accueille le nouvel étudiant et lui propose de remettre un papier à Oussama. Refuser ne crée ni quête ni objet, et permet de revenir accepter ensuite. Accepter inscrit la mission dans le journal (**P**) et ajoute le papier à l’inventaire de seize cases (**I**). Certains étudiants du foyer ne savent pas où trouver Oussama ; d’autres indiquent la bibliothèque. Remettre le papier à Oussama le retire de l’inventaire, termine la mission et accorde une seule fois **10 points de respect**. Le module pur `src/game/quest.js` protège ces transitions, notamment contre une seconde récompense. L’icône du papier est extraite du sprite de papeterie déjà fourni, sans modifier la source.

La progression est conservée en mémoire pendant la session Aventure. Quitter cette vue ou recharger réinitialise la partie.

### Validation

- `npm run build` : régénération des données puis compilation de production.
- `npm run test:rdc` : préservation de la géométrie et parcours physiques des 51 espaces, y compris avec le mobilier.
- `npm run test:campus` : mobilier obligatoire, sols, accès physique à tous les personnages, refus, acceptation, indices, inventaire et récompense unique.
- `npm run test:campus:browser` : nécessite le serveur local (`npm run dev:client -- --host 127.0.0.1`) et Microsoft Edge. Le test utilise Playwright en mode sans fenêtre et vérifie les dialogues, les touches P/I, la marche réelle du hall au foyer puis à la bibliothèque, la remise et la récompense unique. Il commence à proximité de l’accueil grâce à une copie de la carte interceptée uniquement dans le navigateur de test ; le point de départ du jeu reste inchangé.

Les captures du parcours sont enregistrées dans `docs/campus-previews/`.


## Bureau, mémoire des rencontres et quêtes en parallèle

Les distributeurs sont désormais contre le mur au nord du hall, à droite de l’ascenseur, selon la capture annotée. La pièce située à gauche de l’ascenseur (`drawn-rdc-33`) est devenue le bureau de la vie étudiante : bureau, ordinateur, armoire, peinture murale, chaise et plante. Nadia y accueille le joueur. Les personnages assis Adam et Mehdi utilisent leurs sprites respectifs et sont dessinés après les coussins du canapé, pour éviter le masquage de leur corps.

Chaque personnage possède ses propres salutations, sujets et réponses. Le jeu mémorise les rencontres pendant la session Aventure : la présentation initiale laisse place aux retrouvailles. Les discussions ordinaires restent disponibles avant, pendant et après les missions. Les branches de recherche d’Oussama et de sondage de soirée apparaissent uniquement pendant la mission correspondante. Les retours au menu de conversation permettent d’aborder plusieurs sujets sans relancer l’interaction.

Nadia active la carte étudiante indépendamment de l’acceptation de la seconde quête. Elle propose ensuite de consulter les sept personnes du foyer, y compris Karim au bar et les deux personnes assises. Le joueur peut refuser puis revenir accepter. Chaque personne a un dialogue de soirée distinct, avec des raisons et des questions complémentaires. Une confirmation enregistre sa réponse une seule fois. Quatre personnes acceptent (Karim, Lina, Mehdi et Sarah) et trois refusent (Alex, Adam et Jules). Seuls les noms des volontaires figurent sur la liste, mais les refus comptent dans les sept réponses à recueillir.

Le journal **P** propose des onglets séparés pour les deux missions acceptées, leur état et leurs objectifs. La mission de soirée affiche le suivi nominatif des sept réponses et les participants. L’inventaire **I** peut contenir simultanément le papier d’Amélia et la liste de soirée ; cliquer sur un objet affiche ses détails. Remettre le papier consomme seulement le papier et accorde 10 points de respect. Remettre la liste, après toutes les réponses, consomme seulement la liste et accorde 15 points de respect. Chaque récompense est unique. Les deux quêtes peuvent être acceptées et terminées dans n’importe quel ordre, sans effacer la progression ou la mémoire des autres échanges.

Tests complémentaires :

- `npm run test:campus` vérifie le bureau, les positions des distributeurs, le tri des personnages assis, l’accès à tous les personnages, la diversité, la mémoire des rencontres, le filtrage des sujets et les deux ordres de conclusion des missions.
- `npm run test:campus:browser` réalise le parcours avec les deux quêtes actives et termine d’abord le papier.
- `npm run test:campus:browser -- --party-first` effectue le même parcours en remettant d’abord la liste de soirée.
- Les captures de contrôle incluent `docs/campus-previews/bureau.png`, `distributeurs.png`, `foyer.png`, `conversation.png` et `quete-terminee.png`.

La progression et la mémoire des rencontres restent conservées en mémoire pendant la session Aventure ; quitter cette vue ou recharger recommence une partie.


## Présentation rétro de la page Aventure

La page Aventure utilise désormais un cadre de jeu centré, un fond crème à points, une barre de fenêtre rétro, le logo EnsiiExplore et deux petites scènes décorées avec les sprites Tiled existants (personnages, plante, bibliothèque, bureau, ordinateur, chaise et papier). Le style est isolé dans `src/components/AdventureView.css` pour préserver les autres vues et le rendu interne du jeu. La taille de l’écran s’adapte à la hauteur disponible et conserve le ratio 4:3.

La barre latérale et le panneau inférieur ont été remplacés par le bouton « Carnet de découverte ». Cette fenêtre facultative conserve les missions de découverte, les badges, la liste des lieux, l’aperçu de démonstration et la remise à zéro avec annulation. Les quêtes et l’inventaire du jeu restent accessibles avec P et I.

`npm run test:adventure:layout` vérifie le centrage, le ratio, l’absence de débordement horizontal et des anciens panneaux sur quatre formats (1920×1080, 1440×900, 768×1024 et 390×844), ainsi que l’ouverture/fermeture du carnet et les commandes P/I. Le test utilise le serveur local et Microsoft Edge, comme le test de parcours du jeu. Les captures `docs/campus-previews/retro-*.png` montrent les quatre formats.
