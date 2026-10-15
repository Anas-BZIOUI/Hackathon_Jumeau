# EnsiiExplore — améliorations et fonctionnalités restantes

État de référence : **16 octobre 2026**.

Ce document regroupe les idées évoquées pendant le développement, les fonctionnalités proposées dans `steps.md`, les demandes de l’énoncé `jumeau_numerique_ensIIE.md` et le cahier des charges `Cahier_charges/main.tex`. La référence utilisée pour la liste de fonctionnalités est `steps.md` : aucun fichier nommé `test.md` n’est présent à la racine.

Ce backlog décrit **ce qui manque ou reste incomplet**, sans présenter les propositions de jeu ou de simulation comme des obligations de l’énoncé officiel. Les cases seront cochées après implémentation **et vérification**.

## Règle commune aux prochains développements

- Une fonctionnalité utile doit être accessible depuis le **plan 2D et la visite immersive**, avec une présentation adaptée à chaque vue.
- Réutiliser les mêmes salles, informations, destinations, états de progression et données de navigation. Éviter deux implémentations indépendantes du même service.
- Conserver la position et la destination lors des changements de vue.
- Le plan 2D doit rester utilisable seul, sans imposer de déplacement avec le personnage.
- Le modèle éclaté « Stack 3D » reste une vue d’ensemble ; il est distinct de la visite immersive.
- Les plans restent dans le cadre privé du hackathon. Les informations non confirmées restent identifiées comme telles.

## Déjà disponible — ne pas reconstruire

Le socle comprend le plan architectural 2D, la sélection et la recherche de salles, les filtres, les fiches, la vue éclatée, le calibrage, le dessin manuel des murs et portes, le personnage, les collisions, les portes animées et leurs panneaux, la première personne, le plan 2D intégré dans l’immersion, la position partagée et les changements de vue.

Les itinéraires fondés sur la géométrie dessinée, le passage automatique RDC ↔ R+1 et le calcul en arrière-plan existent. La couverture reste partielle. Un éditeur partagé des informations des salles existe également, avec sauvegarde locale, import/export JSON et restauration.

Les parcours guidés, les profils, la carte métro, la constellation et le tableau de qualité ont déjà une première version. Les tâches ci-dessous portent sur leur enrichissement et leur intégration. Le mode **Aventure**, en revanche, reste une interface de démonstration sans jeu complet.

## Priorités

- **P0 — fiabilité** : terminer les parcours essentiels et valider les données avant la démonstration.
- **P1 — valeur d’usage** : aider à découvrir l’école, ses activités et ses services.
- **P2 — confort** : améliorer les déplacements, la présentation et l’accessibilité de l’interface.
- **P3 — extensions** : jeu, simulations et intégrations futures, après stabilisation du socle.

## 1. Navigation et géométrie à fiabiliser — P0

### 1.1 Corriger les salles encore déconnectées

- [ ] Diagnostiquer les pièces non accessibles depuis le réseau testé : porte absente ou mal placée, mur fermé, passage trop étroit, mauvais point de référence ou contour estimé.
- [ ] Corriger les éléments identifiés avec l’éditeur, sans ouvrir artificiellement des passages qui n’existent pas.
- [ ] Vérifier chaque porte dans les deux sens et contrôler que le trajet arrive à la bonne salle.
- [ ] Relancer l’audit après toute nouvelle version des murs ou du calibrage.

Dernier audit enregistré dans `data-src/routing-audit.json` :

- RDC : **23 salles sur 32** accessibles depuis `RDC-011`. Restent hors de ce réseau testé : `017`, `018`, `019`, `020`, `021`, `022`, `023`, `024`, `025`.
- R+1 : **35 salles sur 50** accessibles depuis `R+1-131`. Restent hors de ce réseau testé : `104`, `105`, `106`, `107`, `108`, `109`, `110`, `111`, `112`, `113`, `114`, `115`, `117`, `120`, `salle-des-enseignants`.

Ces chiffres décrivent une accessibilité depuis les origines de test ; ils ne constituent pas une validation exhaustive de toutes les paires de salles.

**Validation :** tous les trajets du secteur retenu passent par des ouvertures réelles ; les cas non résolus sont listés et expliqués dans les deux vues.

### 1.2 Valider les escaliers, ascenseurs et étages

- [ ] Vérifier sur place les entrées, sorties, directions et dimensions des escaliers RDC ↔ R+1.
- [ ] Corriger les repères de contrôle qui présentent encore un écart de superposition.
- [ ] Vérifier les liaisons d’ascenseur et leur accès réel avant de qualifier un trajet d’accessible.
- [ ] Compléter le dessin et la validation du R+2 avant d’y promettre la même couverture que sur RDC/R+1.
- [ ] Tester les changements de vue pendant une montée, une descente ou un trajet automatique, ainsi que leur interruption et leur reprise.

**Validation :** les départs et arrivées correspondent aux mêmes paliers physiques dans le plan et dans l’immersion.

### 1.3 Rendre le guidage plus compréhensible

- [ ] Ajouter des consignes de virage : gauche, droite, tout droit, arrivée à la porte.
- [ ] Afficher la prochaine action, la distance restante et l’étape courante, plutôt que seulement un total indicatif.
- [ ] Rendre les étapes d’un trajet multi-étage consultables : portion RDC, liaison, portion R+1.
- [ ] Distinguer clairement « arrivée à la porte » et « entrée dans la salle ».
- [ ] Recalculer le trajet lorsqu’on s’écarte du chemin, avec une commande de reprise explicite.
- [ ] Proposer des points de départ dans un couloir ou à un repère, en plus des salles.
- [ ] Enrichir « Je suis perdu » avec des repères reconnaissables, la position virtuelle courante et un retour vers un lieu vérifié.

**Partage :** mêmes étapes dans la carte et le HUD immersif ; même destination après un changement de vue.

## 2. Informations réelles sur les salles et services — P0 / P1

L’éditeur est disponible ; **le contenu vérifié reste à collecter**.

- [ ] Confirmer sur place les numéros, usages et noms des salles du secteur choisi.
- [ ] Renseigner les équipements réellement présents et les capacités confirmées.
- [ ] Ajouter les horaires, conditions d’accès, descriptions des services et ressources officielles autorisées.
- [ ] Vérifier les services pratiques : impression, accueil, restauration, associations, administration et autres services effectivement présents.
- [ ] Documenter l’accessibilité des pièces et des passages : marches, rampes, portes, ascenseurs et éventuelles restrictions.
- [ ] Ajouter des photos autorisées et représentatives, avec leur source et leurs droits.
- [ ] Améliorer le suivi de vérification : date structurée, provenance et champs confirmés, plutôt qu’un unique statut global pour toute la fiche.
- [ ] Vérifier les traductions FR/EN des informations enrichies.
- [ ] Prévoir l’intégration des exports validés dans les données du projet, pour qu’ils deviennent les valeurs par défaut pour toute l’équipe.

**Validation :** une information inconnue reste inconnue ; une estimation reste explicitement estimée. Les fiches sont identiques dans leur contenu entre 2D et immersion.

## 3. Découverte guidée des activités de l’école — P1

Cette partie répond directement à l’énoncé : relier les espaces à **l’enseignement, la recherche, la vie étudiante et les relations avec les entreprises**.

- [ ] Enrichir les parcours existants avec un objectif, une durée indicative et des étapes vérifiées.
- [ ] Permettre de suivre le même parcours dans le plan ou avec le personnage.
- [ ] Afficher une explication contextualisée à chaque étape : à quoi sert ce lieu, à qui il s’adresse et quelle activité il illustre.
- [ ] Détecter l’arrivée à une étape et proposer la suivante ; permettre aussi une validation sans marcher dans le modèle.
- [ ] Ajouter une progression conservée entre les vues et après réouverture du navigateur.
- [ ] Proposer des parcours réellement adaptés aux étudiants, visiteurs et entreprises ; étudier un profil personnel si pertinent.
- [ ] Prévoir pause, reprise, passage d’une étape et abandon du parcours.
- [ ] Relier la constellation existante à ces parcours et aux itinéraires.
- [ ] Enrichir la carte métro existante : surlignage d’une ligne, légende cohérente, informations et accès au trajet depuis une station.

**Validation :** on peut découvrir un lieu, comprendre son lien avec une activité, consulter sa fiche et s’y rendre depuis les deux vues.

## 4. Localisation et accès rapide — P1

- [ ] Générer de vrais QR codes de salles ; les liens directs existent déjà.
- [ ] Produire des fiches imprimables avec numéro, étage et QR code pour des points de repère autorisés.
- [ ] Permettre « Je suis près de cette salle » pour définir un départ réel, distinct de la position virtuelle du personnage.
- [ ] Ajouter un tutoriel court expliquant sélection, destination, guidage, position et changement de vue.
- [ ] Ajouter favoris, destinations récentes et retour à un repère connu.
- [ ] Étudier une localisation automatique intérieure seulement si une infrastructure et des données adaptées sont disponibles ; elle n’existe pas actuellement.

**Validation :** la localisation déclarée par une personne et le déplacement virtuel restent clairement distingués.

## 5. Personnage, déplacements et caméra — P2

Le personnage et son animation articulée existent ; les points suivants sont des améliorations.

- [ ] Ajouter une accélération et un arrêt progressifs, avec des réglages adaptés à la précision nécessaire dans les couloirs.
- [ ] Ajouter une vraie animation d’escaliers, avec placement des pieds et flexion des jambes adaptés aux marches.
- [ ] Améliorer les transitions entre repos, marche, course et montée/descente.
- [ ] Affiner les proportions, les vêtements et les expressions du personnage ; envisager un modèle animé léger si le gain visuel justifie son coût.
- [ ] Proposer une personnalisation simple : tenue, couleurs et apparence, sans collecte de données personnelles.
- [ ] Ajouter des réglages de sensibilité, vitesse de caméra, distance de suivi et inversion verticale.
- [ ] Améliorer le comportement de la caméra près des murs et dans les petits espaces, où le personnage peut disparaître ou occuper trop de place.
- [ ] Séparer plus clairement l’orientation de la caméra et celle du personnage lors des déplacements latéraux.
- [ ] Ajouter un mode exploration plein écran et une réduction rapide des panneaux.
- [ ] Ajouter des sons facultatifs et désactivables : pas, arrivée et changement d’étage.

**Partage :** les paramètres de déplacement et l’apparence concernent l’immersion ; le marqueur, l’orientation et les actions équivalentes restent cohérents dans le plan.

## 6. Ambiance et repères visuels — P2

- [ ] Rendre les halls, couloirs, salles de cours, laboratoires et espaces de vie plus reconnaissables.
- [ ] Ajouter du mobilier léger dans un secteur représentatif, à partir des plans ou d’observations ; signaler les dispositions illustratives.
- [ ] Améliorer les matériaux des sols, murs, plafonds et portes sans dégrader les performances.
- [ ] Ajouter des fenêtres et éléments architecturaux seulement lorsqu’ils peuvent être positionnés correctement.
- [ ] Améliorer l’éclairage et éviter les zones visuellement plates ou trop sombres.
- [ ] Ajouter des repères d’orientation vérifiés : noms de zones, indications de services, panneaux d’étage et directions.
- [ ] Adapter les étiquettes et panneaux à la distance pour limiter les chevauchements et garder les noms lisibles.
- [ ] Faire apparaître les mêmes repères utiles dans la carte, les consignes et l’immersion.

## 7. Recherche, filtres et interface partagée — P1 / P2

- [ ] Valider la recherche par besoin sur les services réellement identifiés : imprimer, manger, trouver un service, etc.
- [ ] Étendre les synonymes FR/EN et tester les fautes de frappe, accents et numéros ambigus.
- [ ] Ajouter un accès direct à l’itinéraire depuis les résultats de recherche.
- [ ] Améliorer les résultats vides avec des suggestions de filtres et de recherche.
- [ ] Terminer la traduction de tous les libellés encore écrits directement en français, notamment dans les panneaux et l’assistant.
- [ ] Harmoniser les panneaux de fiche, de trajet et de visite pour éviter les superpositions ou les informations répétées.
- [ ] Mémoriser les préférences utiles : langue, affichage et réglages de caméra.
- [ ] Vérifier les liens directs et l’historique précédent/suivant du navigateur dans les deux vues.

## 8. Accessibilité de l’application et des parcours — P1 / P2

- [ ] Ajouter une couche d’accessibilité indiquant les informations confirmées et celles qui restent inconnues.
- [ ] Distinguer un trajet qui évite les escaliers d’un trajet dont l’accessibilité complète a réellement été vérifiée.
- [ ] Compléter la navigation au clavier : salles, carte, filtres, fiches, dialogues et parcours.
- [ ] Assurer des libellés accessibles et des annonces pertinentes lors d’un changement d’étage, d’une erreur ou d’une arrivée.
- [ ] Vérifier contrastes, taille de texte et lisibilité des panneaux dans les deux modes.
- [ ] Compléter les couleurs par des textes et pictogrammes.
- [ ] Proposer un réglage explicite de réduction des mouvements ; certaines animations respectent déjà la préférence système.
- [ ] Permettre de découvrir et consulter tous les contenus sans devoir piloter le personnage.

## 9. Qualité des données, édition et travail d’équipe — P1 / P2

- [ ] Relier le tableau de qualité existant au **nouveau routeur géométrique**, et non à la seule présence d’un identifiant dans l’ancien graphe.
- [ ] Afficher les salles déconnectées, les champs manquants, les traductions absentes et les points de calibrage douteux.
- [ ] Retirer la limitation actuelle du tableau aux premières salles et ajouter filtres, recherche et accès à la salle concernée.
- [ ] Ajouter un export CSV des anomalies et des informations à vérifier sur place.
- [ ] Afficher des statistiques utiles : surfaces par activité, étage et type, avec la méthode de calcul et les limites des données.
- [ ] Ajouter un historique et un retour arrière pour les modifications de fiches.
- [ ] Prévisualiser les différences d’un import avant d’appliquer plusieurs fiches.
- [ ] Détecter les conflits entre deux exports de l’équipe.
- [ ] Prévoir une sauvegarde commune ou un serveur privé si plusieurs personnes doivent éditer simultanément ; actuellement les modifications restent locales avec échange de fichiers.
- [ ] Faciliter l’association entre une porte dessinée et la bonne salle, avec contrôle visuel des incohérences.

## 10. Performances, robustesse et tests — P0 / P2

Les optimisations de rendu et le calcul des itinéraires en arrière-plan existent déjà.

- [ ] Mesurer les performances sur le PC de démonstration : temps de chargement, fluidité en mouvement et durée des requêtes de trajet.
- [ ] Ajouter des niveaux de qualité graphique et un ajustement automatique selon les performances.
- [ ] Continuer à réduire les objets, textures et éléments lointains rendus inutilement.
- [ ] Étudier le chargement différé de l’immersion pour alléger le démarrage du mode 2D.
- [ ] Vérifier les annulations de calcul, changements rapides de destination, sauvegardes et reprises de visite.
- [ ] Étendre les tests de parcours à toutes les salles du secteur validé, dans les deux sens et avec les différents profils de mobilité.
- [ ] Ajouter des tests d’intégration reproductibles : 2D → immersion → déplacement → retour 2D, édition partagée, import/export et trajet multi-étage.
- [ ] Vérifier le fonctionnement hors ligne dans les conditions réelles de démonstration ; décider ensuite si un cache applicatif est nécessaire.
- [ ] Vérifier le comportement en cas de plan, fichier de données, stockage local ou WebGL indisponible.

## 11. Mode Aventure — P3, extension optionnelle

`steps.md` décrit un jeu plus ambitieux, tandis que `prompt-agent-frontend.md` limitait sa première livraison à une interface. Ces idées restent donc des **extensions à arbitrer**, pas des fonctionnalités déjà terminées ou toutes obligatoires pour le jury.

- [ ] Transformer l’interface Aventure actuelle en exploration jouable du même secteur, en réutilisant position, collisions et itinéraires.
- [ ] Ajouter une introduction par profil, avec des objectifs adaptés.
- [ ] Ajouter une mascotte originale et des guides aux services réellement identifiés.
- [ ] Ajouter des interactions de proximité et des dialogues bilingues avec choix et accès au trajet.
- [ ] Construire des missions utiles : atteindre un lieu, visiter une activité, trouver un service, parler à un guide.
- [ ] Prévoir au moins quatre missions complètes et trois guides si l’on retient les critères avancés de `steps.md`.
- [ ] Ajouter un carnet de progression et un passeport avec badges liés aux activités de l’école.
- [ ] Conserver la progression et permettre sa réinitialisation.
- [ ] Ajouter la découverte progressive des espaces et un pourcentage exploré.
- [ ] Réserver le brouillard de découverte au mode Aventure ; le plan d’orientation doit rester complet.
- [ ] Ajouter un bouton de révélation complète pour la démonstration.
- [ ] Proposer les équivalents non ludiques : liste d’étapes, fiches, itinéraires et validation de découverte depuis le plan.

## 12. Idées complémentaires et futures — P3

- [ ] Parcours de portes ouvertes avec points de passage et QR codes.
- [ ] Lieux à photographier, petites découvertes et messages cachés, sans dépendance pour accéder à un service.
- [ ] Défi chronométré local, facultatif, sans classement personnel public.
- [ ] Ambiance selon l’heure et statut « ouvert maintenant », uniquement après collecte d’horaires fiables.
- [ ] Simulation « une journée dans l’école » avec agents synthétiques et occupation fictive, toujours étiquetée **Simulation**.
- [ ] Estimation de capacité à partir des blocs de mobilier du R+1, avec validation sur quelques salles ; ne pas présenter une estimation par surface comme un comptage de sièges.
- [ ] Intégration éventuelle de disponibilités de salles, emplois du temps ou occupation réelle seulement avec une source autorisée et adaptée.
- [ ] Étudier une localisation intérieure automatique avec une infrastructure appropriée.
- [ ] Étudier le géoréférencement et un export vers un standard de cartographie intérieure si ces besoins sont retenus.
- [ ] Prévoir une restitution imprimable du parcours ou du passeport de visite.

## 13. Livrables et présentation — P0

Le cahier des charges **existe déjà** dans `Cahier_charges/`.

- [ ] Le mettre à jour pour refléter la visite immersive, l’édition des salles et des murs, le nouveau routeur et le partage entre vues.
- [ ] Distinguer exigences de l’énoncé, choix de l’équipe, propositions et fonctionnalités non livrées.
- [ ] Définir clairement le secteur démontré et les limites de couverture.
- [ ] Réaliser ou compléter les retours d’utilisateurs : étudiant, visiteur, personnel ou entreprise selon disponibilité.
- [ ] Préparer un scénario court : rechercher un service, consulter sa fiche, tracer un trajet RDC ↔ R+1, le suivre, revenir au plan, puis découvrir une activité.
- [ ] Répéter ce scénario sur le PC de présentation avec une solution de secours si WebGL n’est pas disponible.
- [ ] Vérifier les crédits et licences des éléments réutilisés.
- [ ] Préparer une liste transparente des données vérifiées, des approximations et des suites envisagées.

## Ordre proposé pour avancer une fonctionnalité à la fois

1. Corriger les connexions manquantes du secteur RDC/R+1 et compléter les données utiles sur place.
2. Enrichir la découverte guidée des quatre activités, partagée entre plan et immersion.
3. Ajouter les consignes de virage, les étapes et la progression du trajet.
4. Ajouter la localisation par salle/QR et améliorer « Je suis perdu ».
5. Finaliser FR/EN, accessibilité de l’interface et organisation des panneaux.
6. Améliorer les animations, la caméra et les repères visuels, avec mesures de performance.
7. Relier le tableau de qualité aux véritables contrôles de navigation et aux données enrichies.
8. Enrichir le jeu et les simulations seulement si le socle et les livrables sont stabilisés.

Pour chaque étape : définir le résultat attendu, réutiliser l’état partagé, vérifier les deux vues, tester, puis mettre à jour ce document.
