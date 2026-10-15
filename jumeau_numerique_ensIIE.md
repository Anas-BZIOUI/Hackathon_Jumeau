# Un jumeau numérique de l'ensIIE

Ce document réunit deux sources : l'**énoncé complet du projet** (partie 1) et le **mode d'emploi des plans d'architecte et fichiers dérivés** (partie 2).

---

# Partie 1 — Énoncé du projet

## 1. Présentation générale

Ce projet consiste à concevoir, en équipe de 3 à 5 personnes, un jumeau numérique de l'ensIIE permettant aux étudiants, personnels et visiteurs de :

- découvrir l'école ;
- se repérer dans ses espaces ;
- identifier facilement ses différents services.

## 2. Objectif

L'objectif est de proposer une représentation numérique interactive de l'établissement, permettant de naviguer virtuellement dans ses différents bâtiments et espaces :

- salles de cours ;
- laboratoires ;
- bureaux ;
- espaces de travail ;
- espaces de vie étudiante ;
- services administratifs ;
- espaces de restauration ;
- lieux dédiés aux activités associatives.

Cette représentation devra également mettre en évidence le lien entre ces espaces et les activités clés de l'école :

- l'enseignement ;
- la recherche ;
- la vie étudiante ;
- les relations avec les entreprises.

## 3. Déroulement du projet

### Phase 1 : analyse des besoins et définition des usages

- Identifier les différents profils d'utilisateurs et les fonctionnalités nécessaires à leur orientation.
- Cette analyse donne lieu à la rédaction d'un **cahier des charges fonctionnel** précisant notamment les fonctionnalités de :
  - navigation ;
  - recherche ;
  - localisation ;
  - accès aux informations associées aux différents lieux et services.

### Phase 2 : développement du prototype

À partir du cahier des charges, l'équipe développe un **prototype web consultable sur PC**. Celui-ci pourra proposer une carte ou une représentation interactive des locaux, permettant de :

- sélectionner un espace ;
- obtenir des informations sur celui-ci ;
- si pertinent, suivre un itinéraire pour s'y rendre.

Des fonctionnalités complémentaires pourront être envisagées :

- un moteur de recherche ;
- des filtres par type de service ou d'espace ;
- des informations pratiques ;
- des liens vers les ressources numériques de l'école.

## 4. Compétences mobilisées

- analyse fonctionnelle ;
- conception d'interfaces web ;
- modélisation numérique ;
- développement logiciel ;
- gestion de données ;
- expérience utilisateur.

## 5. Livrables

Les livrables principaux sont :

1. le **cahier des charges fonctionnel** ;
2. un **prototype web interactif**, démontrant les possibilités d'un jumeau numérique pour améliorer l'accueil, l'orientation et la découverte de l'ensIIE.

## 6. Données fournies

- **Plans du bâtiment** : rez-de-chaussée, premier et deuxième étage, en DXF, SVG et PNG, avec la liste des pièces et leurs contours en GeoJSON. Mot de passe donné sur place.
- **Mode d'emploi des fichiers**, même mot de passe (voir la partie 2 de ce document).
- **Choix d'un secteur** : des salles de cours, une partie du sIIEnext, les locaux des associations… À vous d'arbitrer entre l'étendue et le niveau de détail.
- La **liste des salles et de leur fonction est à construire par vous**. Représentez les espaces ouverts au public et aux élèves.
- Les plans restent dans le cadre du hackathon.

## 7. Pistes techniques

| Sujet | Piste |
|---|---|
| **Carte 2D** | Leaflet en `CRS.Simple` avec le PNG du niveau en fond et le GeoJSON des pièces par-dessus ; **ou** le SVG inséré dans la page, chaque pièce étant un `<path>` cliquable. |
| **Données** | `salles.csv` (numéro, désignation, surface) et `pieces_<niveau>.geojson` (contours, champ `fiable`) ; le mode d'emploi donne un exemple de code. |
| **Itinéraire** | Un graphe dont les nœuds sont les pièces et les portes, reliés par les couloirs ; Dijkstra ou A* suffisent (graphology, networkx). |
| **Fonction des salles** | Un tableur partagé rempli après un tour sur place, puis exporté en CSV ou JSON. |
| **Pour aller plus loin** | QGIS ou ezdxf pour relire les DXF ; les niveaux se calent à la main sur deux ou trois points communs (escaliers, ascenseur). |

## 8. Déroulé

### Jeudi 15 octobre

- **9 h** : lancement en amphi 101.
- **De 10 h à 16 h** : travail en salle.
- **16 h 30** : conférence sur la souveraineté numérique, en amphi Cabanes.

### Vendredi 16 octobre

- **De 9 h à 15 h 30** : travail en salle.
- **Puis** : présentations devant le jury.
  - **Projets 1, 2 et 3**, en amphi Cabanes : Imed Boughzala (directeur de l'école), Raphaël Jadot et Rokaya Benazzi.
  - **Projets 4 et 5**, en amphi 101 : Stefania Dumbrava, Abass Sagna et Nassim Khider.

### Lieu de travail

Votre salle : **salle C53 (Platech 1)**, au sIIEnext.

## 9. Référent

**Raphaël Jadot**, référent des projets 1, 2 et 3 (projet 4 : Abass Sagna ; projet 5 : Stefania Dumbrava). Il donne son numéro sur place et répond dès qu'il peut.

## 10. Versions

- **V1, jeudi 15 octobre, 0 h 30** : première publication.
- Toute modification sera notée ici, avec son heure et ce qui change, et annoncée dans chaque salle.

---

# Partie 2 — Plans d'architecte de l'ensIIE et fichiers dérivés

Les plans d'architecte de l'ensIIE sont dans `plans/` et ne sont pas versionnés (`.gitignore`). Cette partie décrit ce qu'ils contiennent et les fichiers dérivés qui en ont été tirés pour le hackathon, dans `plans/derives/`, eux aussi hors dépôt.

## 1. Sources

- Trois **DXF** couvrent le rez-de-chaussée, le R+1 et le R+2 ; des **DWG** les accompagnent.
- Le DWG `PLAN ENSIIE R+1 SUPERFICIE.dwg` n'a **pas d'équivalent DXF** : c'est un DWG AutoCAD 2018 (AC1032), illisible sans convertisseur. LibreDWG (`dwg2dxf`) ou l'ODA File Converter (gratuit, propriétaire) peuvent le convertir. Il n'est pas indispensable : le DXF du R+1 porte déjà un calque de surfaces.

### Unités et origines

- Les trois fichiers sont dessinés **en mètres**, y compris le R+1 dont l'en-tête annonce à tort des centimètres.
- Chaque niveau a **sa propre origine** : les plans ne sont pas superposables tels quels, et le passage d'un étage à l'autre (escaliers, ascenseurs) reste à caler à la main sur deux ou trois points communs.

### Périmètre de chaque niveau

- **RDC** : ne montre que la partie occupée par l'école (amphithéâtre, foyer, locaux associatifs).
- **R+2** : inclut, en plus des salles 2xx, l'aile dont les locaux sont numérotés Cxx.

## 2. Calques utiles

Les étiquettes de pièces sont rangées dans trois calques par niveau, sous forme de MTEXT : la désignation (« Salle de TD », « Bureau »…), le numéro et la surface en m².

| Niveau | Désignation | Numéro | Surface | Murs et cloisons |
|---|---|---|---|---|
| RDC | `0_Designation` | blocs d'étiquette sur `0_numéro des salles` (attribut CODE) | `0_superficie` | `0-mur`, `0-cloison`, `1-cloison`, `0-porte`, `0-cadre`, `1-menuiserie` |
| R+1 | `0_Désignation` | `0_Numéro de salle` | `0_Superficie` | `1-cloison`, `0-porte`, `PORTE-A3`, `1-menuiserie`, `04-pochage BATI 2` |
| R+2 | `Désignation` | `_numérotation salles` | `_ superficie` | `GEX_VOL_Archi` (tout le bâti sur un seul calque) |

### Remarques

- Au RDC, les numéros viennent de blocs d'étiquette hérités d'une étude de 2006 : ils sont plausibles mais **à vérifier sur place**, et le nom de programme qu'ils portent est indicatif.
- Au R+1, le mobilier est dessiné par blocs sur le calque des cloisons.
- Aucun niveau ne contient de contours de pièces fermés : **ils ont été reconstruits**.

## 3. Fichiers dérivés

### `plan_<niveau>.svg` et `plan_<niveau>.png`

Fond de plan lisible :

- murs en noir ;
- mobilier en gris ;
- pièces reconnues en bleu clair ;
- numéros et désignations.

Détails :

- Dans le SVG, **une unité vaut un mètre**.
- Chaque pièce est un `<path>` dont l'`id` vaut `<niveau>-<numéro>`, ce qui permet de la colorer ou de la rendre cliquable directement.
- Le PNG est à **20 pixels par mètre**.

### `salles.csv`

Une ligne par libellé repéré, avec :

- niveau ;
- désignation ;
- numéro ;
- surface lue sur le plan ;
- position du libellé ;
- surface du contour reconstruit ;
- qualité de ce contour (`oui`, `douteux`, `non`).

### `pieces_<niveau>.geojson`

Contient les contours de pièces.

- Les propriétés reprennent numéro, désignation et surfaces.
- `fiable` vaut `false` quand la surface du contour s'écarte de plus d'un quart de celle du plan, ou pour les espaces sans étiquette (couloirs, halls, paliers), conservés car utiles au calcul d'itinéraire.

### Repère commun

Tous les dérivés partagent le même **repère local, en mètres, origine en bas à gauche** :

| Niveau | Largeur × hauteur (m) | Origine dans le DXF |
|---|---|---|
| RDC | 60 × 35 | (10995, 4293) |
| R+1 | 60 × 60 | (105, 42) |
| R+2 | 135 × 125 | (495, −915) |

### Méthode de reconstruction des contours

- Les contours ont été obtenus en **épaississant les traits** de murs, de portes et de fenêtres, puis en prenant les vides qui restent.
- Les fragments créés par le mobilier ont été recollés en visant la surface indiquée sur le plan.
- Ils sont **un peu plus petits que la surface officielle**, car le débattement des portes est retiré.
- Sur les trois niveaux, environ **neuf libellés sur dix** ont un contour jugé fiable.

## 4. Exploitation

### Avec Leaflet

Le plus simple est `L.CRS.Simple`, où une unité vaut un mètre. Le PNG sert de fond, le GeoJSON se pose dessus sans conversion, car les coordonnées `[x, y]` du GeoJSON sont lues comme `[lng, lat]` :

```js
const map = L.map('carte', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 4 });
const bornes = [[0, 0], [60, 60]];               // [[0,0],[hauteur,largeur]] du niveau
L.imageOverlay('plan_R+1.png', bornes).addTo(map);
fetch('pieces_R+1.geojson').then(r => r.json()).then(g =>
  L.geoJSON(g, {
    style: f => ({ weight: 1, fillOpacity: f.properties.fiable ? 0.3 : 0.05 }),
    onEachFeature: (f, l) => l.bindPopup(`${f.properties.numero ?? ''} ${f.properties.libelle ?? ''}`)
  }).addTo(map));
map.fitBounds(bornes);
```

### Sans Leaflet

- Le SVG s'insère tel quel dans la page.
- L'axe vertical y est inversé : `y_svg = hauteur − y`.

### Pour un itinéraire

- Un graphe dont les nœuds sont les centres des pièces et des portes, reliés à travers les espaces de circulation, suffit à un prototype.
- Les liaisons entre étages se saisissent à la main.

## 5. Ce qui manque

- Il n'existe **aucun référentiel des salles** : les numéros, désignations et surfaces viennent des plans d'architecte et peuvent dater.
- La **capacité, l'équipement, l'usage réel et l'accessibilité** ne figurent nulle part.
- Les niveaux **ne sont pas calés entre eux**.
- Le DWG des superficies du R+1 **n'a pas été lu**.
