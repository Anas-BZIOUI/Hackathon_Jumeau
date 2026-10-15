/**
 * EnsiiExplore — Navigation R+1
 *
 * Salles : 131, 132, 138, 139
 *
 * Coordonnées : origine en bas à gauche.
 * Graphe pilote à valider sur le plan architectural.
 */

export const navigationGraph = {
  nodes: [
    // === PORTES 131 ET 132 ===
    { id: "porte-131", level: "R+1", x: 31.32, y: 41.65 },
    { id: "couloir-131", level: "R+1", x: 32.1, y: 41.65 },
    { id: "couloir-132", level: "R+1", x: 32.1, y: 42.95 },
    { id: "porte-132", level: "R+1", x: 31.32, y: 42.95 },

    // === COULOIR CENTRAL ===
    { id: "couloir-central-1", level: "R+1", x: 32.1, y: 36.0 },
    { id: "couloir-central-2", level: "R+1", x: 32.1, y: 30.0 },

    // === ACCÈS SUPÉRIEUR DE 138 ===
    { id: "intersection-138", level: "R+1", x: 33.0, y: 28.0 },
    { id: "couloir-devant-138", level: "R+1", x: 34.4, y: 27.6 },
    { id: "porte-138", level: "R+1", x: 34.8, y: 27.6 },

    // === PASSAGE INFÉRIEUR DE 138 ===
    { id: "passage-bas-138-gauche", level: "R+1", x: 32.1, y: 22.5 },
    { id: "passage-bas-138-droite", level: "R+1", x: 43.5, y: 22.5 },

    // === COULOIR ET PORTE 139 ===
    { id: "couloir-139", level: "R+1", x: 43.5, y: 25.5 },
    {
      id: "porte-139",
      level: "R+1",
      x: 46.067,
      y: 26.155,
    },

    {
      id: "porte-138-droite",
      level: "R+1",
      x: 43.721,
      y: 27.915,
    },

    // === COULOIR ENTRE 136 ET 140 ===
    // Passage autour du local sanitaire 137

    {
      id: "couloir-136-140-1",
      level: "R+1",
      x: 32.57,
      y: 36.404,
    },
    {
      id: "couloir-136-140-2",
      level: "R+1",
      x: 33.654,
      y: 29.307,
    },
    {
      id: "couloir-136-140-3",
      level: "R+1",
      x: 44.412,
      y: 29.551,
    },
    {
      id: "couloir-136-140-4",
      level: "R+1",
      x: 45.685,
      y: 32.244,
    },
    {
      id: "porte-136-gauche",
      level: "R+1",
      x: 35.049,
      y: 36.675,
    },
    {
      id: "porte-136-droite",
      level: "R+1",
      x: 46.106,
      y: 36.65,
    },
    {
      id: "porte-136-gauche",
      level: "R+1",
      x: 35.049,
      y: 36.675,
    },
    {
      id: "couloir-devant-136",
      level: "R+1",
      x: 32.922,
      y: 36.644,
    },
    // === NOUVELLES PORTES R+1 ===

    // Salle 136 — deux portes
    {
      id: "porte-136-1",
      level: "R+1",
      x: 35.049,
      y: 36.675,
    },
    {
      id: "porte-136-2",
      level: "R+1",
      x: 46.106,
      y: 36.65,
    },
    {
      id: "porte-140",
      level: "R+1",
      x: 46.823,
      y: 31.769,
    },
    {
      id: "porte-141-1",
      level: "R+1",
      x: 49.771,
      y: 33.633,
    },
    {
      id: "porte-141-2",
      level: "R+1",
      x: 55.078,
      y: 28.868,
    },

    // === AMPHITHÉÂTRE 123 ===

    {
      id: "porte-123-1",
      level: "R+1",
      x: 19.669,
      y: 45.859,
    },
    {
      id: "porte-123-2",
      level: "R+1",
      x: 15.267,
      y: 49.688,
    },
    {
      id: "couloir-123",
      level: "R+1",
      x: 21.643,
      y: 45.181,
    },
    // === COULOIR DE 123 VERS 132 ===

    {
      id: "couloir-123-1",
      level: "R+1",
      x: 24.623,
      y: 45.393,
    },
    {
      id: "couloir-123-2",
      level: "R+1",
      x: 26.878,
      y: 45.286,
    },
    {
      id: "couloir-123-3",
      level: "R+1",
      x: 29.848,
      y: 45.036,
    },
    {
      id: "couloir-123-4",
      level: "R+1",
      x: 32.067,
      y: 44.964,
    },
    {
      id: "couloir-123-5",
      level: "R+1",
      x: 32.425,
      y: 43.855,
    },
    {
      id: "couloir-123-6",
      level: "R+1",
      x: 32.353,
      y: 43.032,
    },
    // === RACCOURCI VERS 139 DEVANT LE BLOC 137 ===

    {
      id: "raccourci-139-1",
      level: "R+1",
      x: 33.484,
      y: 29.622,
    },
    {
      id: "raccourci-139-2",
      level: "R+1",
      x: 38.945,
      y: 29.296,
    },
    {
      id: "raccourci-139-3",
      level: "R+1",
      x: 44.65,
      y: 29.459,
    },
    {
      id: "raccourci-139-4",
      level: "R+1",
      x: 44.976,
      y: 27.625,
    },

    // === BRANCHE SUPÉRIEURE : CONTOUR DU BLOC SANITAIRE ===
    // Points à ajuster en fonction des murs et des ouvertures.
    { id: "haut-137-gauche", level: "R+1", x: 33.4, y: 35.0 },
    { id: "haut-137-bas", level: "R+1", x: 33.4, y: 32.5 },
    { id: "haut-137-dessous", level: "R+1", x: 38.5, y: 32.5 },
    { id: "haut-137-droite", level: "R+1", x: 40.5, y: 30.0 },
    { id: "devant-140", level: "R+1", x: 42.0, y: 28.0 },
  ],

  edges: [
    // 131 <-> 132
    ["porte-131", "couloir-131"],
    ["couloir-131", "couloir-132"],
    ["couloir-132", "porte-132"],

    // Couloir central vers 138
    ["couloir-131", "couloir-central-1"],
    ["couloir-central-1", "couloir-central-2"],
    ["couloir-central-2", "intersection-138"],
    ["intersection-138", "couloir-devant-138"],
    ["couloir-devant-138", "porte-138"],

    // Passage inférieur vers 139
    ["couloir-central-2", "passage-bas-138-gauche"],
    ["passage-bas-138-gauche", "passage-bas-138-droite"],
    ["passage-bas-138-droite", "couloir-139"],
    ["couloir-139", "porte-139"],

    ["porte-138-droite", "couloir-139"],

    // === PASSAGE VERS LA SALLE 140 ===

    ["couloir-central-1", "couloir-136-140-1"],

    ["couloir-136-140-1", "couloir-136-140-2"],

    ["couloir-136-140-2", "couloir-136-140-3"],

    ["couloir-136-140-3", "couloir-136-140-4"],

    ["couloir-136-140-4", "porte-140"],

    ["porte-136-gauche", "couloir-devant-136"],
    ["couloir-devant-136", "couloir-central-1"],

    ["porte-123-1", "couloir-123"],

    // === CONNEXION 123 → RÉSEAU CENTRAL ===

    ["couloir-123", "couloir-123-1"],
    ["couloir-123-1", "couloir-123-2"],
    ["couloir-123-2", "couloir-123-3"],
    ["couloir-123-3", "couloir-123-4"],
    ["couloir-123-4", "couloir-123-5"],
    ["couloir-123-5", "couloir-123-6"],

    // Raccordement au réseau existant devant 132
    ["couloir-123-6", "couloir-132"],

    // === NOUVEAU TRAJET ALTERNATIF VERS 139 ===

    // Raccordement au couloir existant
    ["couloir-136-140-2", "raccourci-139-1"],

    // Passage horizontal devant 137
    ["raccourci-139-1", "raccourci-139-2"],
    ["raccourci-139-2", "raccourci-139-3"],

    // Descente vers la salle 139
    ["raccourci-139-3", "raccourci-139-4"],

    // Raccordement à la porte de 139
    ["raccourci-139-4", "porte-139"],
  ],

  roomAccess: {
    "R+1-131": "porte-131",
    "R+1-132": "porte-132",
    "R+1-138": ["porte-138", "porte-138-droite"],
    "R+1-139": "porte-139",
    "R+1-136": ["porte-136-1", "porte-136-2"],
    "R+1-140": "porte-140",
    "R+1-141": ["porte-141-1", "porte-141-2"],
    "R+1-136": "porte-136-gauche",
    "R+1-123": "porte-123-1",
  },
};
