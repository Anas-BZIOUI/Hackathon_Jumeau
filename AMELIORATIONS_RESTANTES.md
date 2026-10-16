# EnsiiExplore — améliorations et fonctionnalités restantes

État de référence : **16 octobre 2026**.

**Point de suivi : 69 tâches cochées sur 114.** Une case vide peut être partiellement réalisée : les notes sous chaque section précisent les limites. Ce bilan ne signifie pas que tout le backlog est terminé. Les contrôles terrain, les sources manquantes et les essais restant à exécuter ne sont pas cochés.

Ce document regroupe les idées évoquées pendant le développement, les fonctionnalités proposées dans `steps.md`, les demandes de l’énoncé `jumeau_numerique_ensIIE.md` et le cahier des charges `Cahier_charges/main.tex`. La référence utilisée pour la liste de fonctionnalités est `steps.md` : aucun fichier nommé `test.md` n’est présent à la racine.

Ce backlog décrit **ce qui manque ou reste incomplet**, sans présenter les propositions de simulation comme des obligations de l’énoncé officiel. Les cases seront cochées après implémentation **et vérification**.

## Comment utiliser cette liste

- **Case vide** : fonctionnalité absente, réalisation partielle ou validation encore manquante. Lire la note d’avancement avant de la développer pour éviter de refaire ce qui existe.
- **Case cochée** : élément déjà livré et vérifié, conservé pour suivre les progrès ; il ne fait plus partie du travail restant.
- **Source des idées** : nos échanges sur le personnage, la caméra, la fluidité, les repères, la mini-carte et le partage 2D/immersion ; `steps.md` pour les propositions de fonctionnalités ; `jumeau_numerique_ensIIE.md` pour les objectifs du projet.
- **À propos du fichier « test »** : `test.js` est un exemple Leaflet d’affichage des plans et des informations GeoJSON, pas une liste de fonctionnalités. Aucun `test.md` n’a été trouvé dans le dépôt ; les idées détaillées sont dans `steps.md`.
- **Dépendances humaines** : les usages réels des salles, les horaires, les équipements, les photos autorisées et les passages physiques doivent être confirmés par l’équipe. Les autres améliorations peuvent avancer avec les données disponibles, en indiquant leurs limites.

Les sections 1 à 12 constituent la liste détaillée. L’ordre proposé à la fin permet de choisir une amélioration à la fois ; chaque amélioration commune doit être disponible dans le plan 2D et dans la visite immersive.

## Règle commune aux prochains développements

- Une fonctionnalité utile doit être accessible depuis le **plan 2D et la visite immersive**, avec une présentation adaptée à chaque vue.
- Réutiliser les mêmes salles, informations, destinations, états de progression et données de navigation. Éviter deux implémentations indépendantes du même service.
- Conserver la position et la destination lors des changements de vue.
- Le plan 2D doit rester utilisable seul, sans imposer de déplacement avec le personnage.
- Le modèle éclaté « Stack 3D » reste une vue d’ensemble ; il est distinct de la visite immersive.
- Les plans restent dans le cadre privé du hackathon. Les informations non confirmées restent identifiées comme telles.

## Déjà disponible — ne pas reconstruire

Le socle comprend le plan architectural 2D, la sélection et la recherche de salles, les filtres, les fiches, la vue éclatée, les données de calibrage et de murs/portes déjà enregistrées, le personnage, les collisions, les portes animées et leurs panneaux, la première personne, le plan 2D intégré dans l’immersion, la position partagée et les changements de vue.

Les itinéraires fondés sur la géométrie dessinée, le passage automatique RDC ↔ R+1 et le calcul en arrière-plan existent. La couverture reste partielle. Un éditeur partagé des informations des salles existe également, avec sauvegarde locale, import/export JSON et restauration.

Les parcours guidés, les profils, la carte métro, la constellation et le tableau de qualité ont déjà une première version. Les tâches ci-dessous portent sur leur enrichissement et leur intégration.

Le mode **Aventure** (jeu 2D de type Zelda) est conservé dans sa version actuelle. Ses tâches sont retirées de ce backlog à la demande de l’utilisateur ; les améliorations du plan 2D et de la visite immersive 3D restent dans le périmètre.

## Priorités

- **P0 — fiabilité** : terminer les parcours essentiels et valider les données avant la démonstration.
- **P1 — valeur d’usage** : aider à découvrir l’école, ses activités et ses services.
- **P2 — confort** : améliorer les déplacements, la présentation et l’accessibilité de l’interface.
- **P3 — extensions** : simulations et intégrations futures, après stabilisation du socle.

## 1. Navigation et géométrie à fiabiliser — P0

### 1.1 Corriger les salles encore déconnectées

- [ ] Diagnostiquer les pièces non accessibles depuis le réseau testé : porte absente ou mal placée, mur fermé, passage trop étroit, mauvais point de référence ou contour estimé.
- [ ] Corriger les éléments identifiés avec l’éditeur, sans ouvrir artificiellement des passages qui n’existent pas.
- [ ] Vérifier chaque porte dans les deux sens et contrôler que le trajet arrive à la bonne salle.
- [x] Relancer l’audit après toute nouvelle version des murs ou du calibrage.

Dernier audit enregistré dans `data-src/routing-audit.json` :

- RDC : **23 salles sur 32** accessibles depuis `RDC-011`. Restent hors de ce réseau testé : `017`, `018`, `019`, `020`, `021`, `022`, `023`, `024`, `025`.
- R+1 : **35 salles sur 50** accessibles depuis `R+1-131`. Restent hors de ce réseau testé : `104`, `105`, `106`, `107`, `108`, `109`, `110`, `111`, `112`, `113`, `114`, `115`, `117`, `120`, `salle-des-enseignants`.

Ces chiffres décrivent une accessibilité depuis les origines de test ; ils ne constituent pas une validation exhaustive de toutes les paires de salles.

Diagnostic relancé le 16 octobre 2026 avec `npm run audit:routing` : mêmes couvertures, vérifiées à l'aller **et au retour**. Les liaisons de test RDC ↔ R+1 fonctionnent dans les deux sens. Le rapport JSON contient maintenant les points de référence, le nombre de portes, leur dégagement et les observations par salle déconnectée.

- Les neuf salles RDC et treize des salles R+1 disposent d'un point d'arrivée et de portes dégagés, mais aucun trajet complet n'est trouvé : examiner la continuité des passages et les murs sur les plans avant toute correction.
- `R+1-120` et `R+1-salle-des-enseignants` n'ont aucune porte associée dans le modèle de navigation. Leur point de référence reste disponible ; une association manquante ne prouve pas l'absence d'une porte physique.
- Ces observations sont des diagnostics du modèle, pas des causes physiques confirmées. Aucun passage n'a été créé pour contourner les blocages.
- Vérification automatique : les cinq tests de `scripts/geometryRouter.test.js` passent, dont les trajets inter-étages réciproques et l'absence de traversée de murs.

**Validation :** tous les trajets du secteur retenu passent par des ouvertures réelles ; les cas non résolus sont listés et expliqués dans les deux vues.

### 1.2 Valider les escaliers, ascenseurs et étages

- [ ] Vérifier sur place les entrées, sorties, directions et dimensions des escaliers RDC ↔ R+1.
- [ ] Corriger les repères de contrôle qui présentent encore un écart de superposition.
- [ ] Vérifier les liaisons d’ascenseur et leur accès réel avant de qualifier un trajet d’accessible.
- [ ] Compléter le dessin et la validation du R+2 avant d’y promettre la même couverture que sur RDC/R+1.
- [x] Tester les changements de vue pendant une montée, une descente ou un trajet automatique, ainsi que leur interruption et leur reprise.

**Validation :** les départs et arrivées correspondent aux mêmes paliers physiques dans le plan et dans l’immersion.

### 1.3 Rendre le guidage plus compréhensible

- [x] Ajouter des consignes de virage : gauche, droite, tout droit, arrivée à la porte.
- [x] Afficher la prochaine action, la distance restante et l’étape courante, plutôt que seulement un total indicatif.
- [x] Rendre les étapes d’un trajet multi-étage consultables : portion RDC, liaison, portion R+1.
- [x] Distinguer clairement « arrivée à la porte » et « entrée dans la salle ».
- [x] Recalculer le trajet lorsqu’on s’écarte du chemin, avec une commande de reprise explicite.
- [x] Proposer des points de départ dans un couloir ou à un repère, en plus des salles.
- [x] Enrichir « Je suis perdu » avec des repères reconnaissables, la position virtuelle courante et un retour vers un lieu vérifié.

**Partage :** mêmes étapes dans la carte et le HUD immersif ; même destination après un changement de vue.

**Avancement du 16 octobre — navigation :** audit du modèle terminé (58/82 salles accessibles dans les deux sens) ; causes physiques et corrections des 24 déconnexions encore à confirmer. Les consignes et la projection de la position sont testées dans `scripts/guidance.test.js`. Détection d’écart, recalcul différé et reprise manuelle sont codés ; un écart en immersion et les reprises automatique/manuelle ont ensuite été contrôlés dans le navigateur (lot ci-dessous). Le départ depuis un couloir utilise la **position virtuelle**, sans la présenter comme une localisation réelle. L’assistant propose des repères déjà marqués vérifiés dans les données. La restauration d’une position dans l’escalier est codée ; la campagne montée/descente et interruption reste ouverte.

## 2. Informations réelles sur les salles et services — P0 / P1

L’éditeur des fiches de salles est disponible ; **le contenu vérifié reste à collecter**.

- [ ] Confirmer sur place les numéros, usages et noms des salles du secteur choisi.
- [ ] Renseigner les équipements réellement présents et les capacités confirmées.
- [ ] Ajouter les horaires, conditions d’accès, descriptions des services et ressources officielles autorisées.
- [ ] Vérifier les services pratiques : impression, accueil, restauration, associations, administration et autres services effectivement présents.
- [ ] Documenter l’accessibilité des pièces et des passages : marches, rampes, portes, ascenseurs et éventuelles restrictions.
- [ ] Ajouter des photos autorisées et représentatives, avec leur source et leurs droits.
- [x] Améliorer le suivi de vérification : date structurée, provenance et champs confirmés, plutôt qu’un unique statut global pour toute la fiche.
- [ ] Vérifier les traductions FR/EN des informations enrichies.
- [x] Prévoir l’intégration des exports validés dans les données du projet, pour qu’ils deviennent les valeurs par défaut pour toute l’équipe.

**Validation :** une information inconnue reste inconnue ; une estimation reste explicitement estimée. Les fiches sont identiques dans leur contenu entre 2D et immersion.

**Avancement — fiches :** date structurée, provenance et liste des champs confirmés ajoutées à l’éditeur et à l’affichage partagé. Validation des dates et des imports testée. `npm run import:rooms -- export.json` prépare `data-src/room-details.json` ; `npm run data` applique ces valeurs par défaut. Aucune information terrain nouvelle n’a été inventée.

## 3. Découverte guidée des activités de l’école — P1

Cette partie répond directement à l’énoncé : relier les espaces à **l’enseignement, la recherche, la vie étudiante et les relations avec les entreprises**.

- [ ] Enrichir les parcours existants avec un objectif, une durée indicative et des étapes vérifiées.
- [x] Permettre de suivre le même parcours dans le plan ou avec le personnage.
- [x] Afficher une explication contextualisée à chaque étape : à quoi sert ce lieu, à qui il s’adresse et quelle activité il illustre.
- [x] Détecter l’arrivée à une étape et proposer la suivante ; permettre aussi une validation sans marcher dans le modèle.
- [x] Ajouter une progression conservée entre les vues et après réouverture du navigateur.
- [ ] Proposer des parcours réellement adaptés aux étudiants, visiteurs et entreprises ; étudier un profil personnel si pertinent.
- [x] Prévoir pause, reprise, passage d’une étape et abandon du parcours.
- [x] Relier la constellation existante à ces parcours et aux itinéraires.
- [x] Enrichir la carte métro existante : surlignage d’une ligne, légende cohérente, informations et accès au trajet depuis une station.

**Validation :** on peut découvrir un lieu, comprendre son lien avec une activité, consulter sa fiche et s’y rendre depuis les deux vues.

**Avancement — parcours :** panneau commun au plan et à l’immersion, état persistant, pause/reprise, précédent, validation, saut et abandon. Arrivée détectée près du centroïde virtuel (1,5 m), sans validation physique d’une entrée. Objectif générique et durée de **lecture** estimée ajoutés ; étapes, durées de déplacement et adaptation approfondie aux profils restent à vérifier. La constellation donne accès aux fiches et aux itinéraires ; son lien direct avec le lancement d’un parcours est maintenant intégré et contrôlé dans le navigateur.

**Ajout — parcours par activité :** quatre parcours générés à partir des associations présentes dans les fiches (enseignement, recherche, vie étudiante, entreprises), avec au maximum trois étapes chacun. La constellation propose leur lancement dans le plan ou en immersion ; ils utilisent le même état de progression que les parcours existants. Chaque étape présente la fonction et l’activité enregistrées, en FR/EN, sans les qualifier de vérifiées. Trois nouveaux tests contrôlent les associations, l’ordre, les limites et la prise en compte des données modifiées. Les 44 tests automatisés et les contrôles RDC (51 espaces) passent ; compilation Vite réussie. Contrôle navigateur effectué ensuite : lancement du parcours Recherche sur le plan, passage à l’étape 2/3, puis ouverture de l’immersion avec cette même étape. Aperçu imprimable contrôlé, dont le marquage des données fictives.

## 4. Localisation et accès rapide — P1

- [x] Générer de vrais QR codes de salles ; les liens directs existent déjà.
- [ ] Produire des fiches imprimables avec numéro, étage et QR code pour des points de repère autorisés.
- [x] Permettre « Je suis près de cette salle » pour définir un départ réel, distinct de la position virtuelle du personnage.
- [x] Ajouter un tutoriel court expliquant sélection, destination, guidage, position et changement de vue.
- [x] Ajouter favoris, destinations récentes et retour à un repère connu.
- [x] Étudier une localisation automatique intérieure seulement si une infrastructure et des données adaptées sont disponibles ; elle n’existe pas actuellement.

**Validation :** la localisation déclarée par une personne et le déplacement virtuel restent clairement distingués.

**Avancement — accès rapide :** QR PNG généré localement et vérifié dans le navigateur, aide rapide, favoris et destinations récentes ajoutés. La fiche d’impression est codée ; le rendu papier et la portée de l’adresse privée depuis un téléphone restent à valider. Aucune géolocalisation automatique n’a été ajoutée.

## 5. Personnage, déplacements et caméra — P2

Le personnage et son animation articulée existent ; les points suivants sont des améliorations.

- [x] Ajouter une accélération et un arrêt progressifs, avec des réglages adaptés à la précision nécessaire dans les couloirs.
- [ ] Ajouter une vraie animation d’escaliers, avec placement des pieds et flexion des jambes adaptés aux marches.
- [x] Améliorer les transitions entre repos, marche, course et montée/descente.
- [ ] Affiner les proportions, les vêtements et les expressions du personnage ; envisager un modèle animé léger si le gain visuel justifie son coût.
- [x] Proposer une personnalisation simple : tenue, couleurs et apparence, sans collecte de données personnelles.
- [x] Ajouter des réglages de sensibilité, vitesse de caméra, distance de suivi et inversion verticale.
- [x] Améliorer le comportement de la caméra près des murs et dans les petits espaces, où le personnage peut disparaître ou occuper trop de place.
- [x] Séparer plus clairement l’orientation de la caméra et celle du personnage lors des déplacements latéraux.
- [x] Ajouter un mode exploration plein écran et une réduction rapide des panneaux.
- [x] Ajouter des sons facultatifs et désactivables : pas, arrivée et changement d’étage.

**Partage :** les paramètres de déplacement et l’apparence concernent l’immersion ; le marqueur, l’orientation et les actions équivalentes restent cohérents dans le plan.

**Avancement — immersion :** inertie de déplacement, transitions de foulée et flexion accrue dans l’escalier ; cela ne constitue pas un placement des pieds sur les marches. Couleur de veste personnalisable, sensibilité, distance et inversion verticale disponibles. Vitesse de rotation séparée, couleurs supplémentaires et sac à dos sont désormais disponibles. Repli en première personne quand la caméra manque de place, plein écran, réduction des panneaux et sons facultatifs codés. Les tests avatar passent ; une validation visuelle complète près des murs et en escalier reste nécessaire.

## 6. Ambiance et repères visuels — P2

- [ ] Rendre les halls, couloirs, salles de cours, laboratoires et espaces de vie plus reconnaissables.
- [ ] Ajouter du mobilier léger dans un secteur représentatif, à partir des plans ou d’observations ; signaler les dispositions illustratives.
- [ ] Améliorer les matériaux des sols, murs, plafonds et portes sans dégrader les performances.
- [ ] Ajouter des fenêtres et éléments architecturaux seulement lorsqu’ils peuvent être positionnés correctement.
- [x] Améliorer l’éclairage et éviter les zones visuellement plates ou trop sombres.
- [ ] Ajouter des repères d’orientation vérifiés : noms de zones, indications de services, panneaux d’étage et directions.
- [x] Adapter les étiquettes et panneaux à la distance pour limiter les chevauchements et garder les noms lisibles.
- [ ] Faire apparaître les mêmes repères utiles dans la carte, les consignes et l’immersion.

## 7. Recherche, filtres et interface partagée — P1 / P2

- [ ] Valider la recherche par besoin sur les services réellement identifiés : imprimer, manger, trouver un service, etc.
- [x] Étendre les synonymes FR/EN et tester les fautes de frappe, accents et numéros ambigus.
- [x] Ajouter un accès direct à l’itinéraire depuis les résultats de recherche.
- [x] Améliorer les résultats vides avec des suggestions de filtres et de recherche.
- [ ] Terminer la traduction de tous les libellés encore écrits directement en français, notamment dans les panneaux et l’assistant.
- [x] Harmoniser les panneaux de fiche, de trajet et de visite pour éviter les superpositions ou les informations répétées.
- [x] Mémoriser les préférences utiles : langue, affichage et réglages de caméra.
- [x] Vérifier les liens directs et l’historique précédent/suivant du navigateur dans les deux vues.

**Avancement — interface :** recherche par numéro corrigée (étage explicite et absence de correspondance par simple suffixe), tolérance à une faute ajoutée et testée. Les synonymes existants sont conservés ; leur enrichissement et leur validation terrain ne sont pas terminés. Assistant, résumé du trajet et plusieurs panneaux traduits, mais la traduction exhaustive reste ouverte. L’historique des liens et les liens mal formés sont pris en charge ; sélection et fermeture de fiche, Précédent/Suivant en 2D et consultation en immersion ont été vérifiés dans le lot S30–S34. Cela ne clôt pas tous les tests d’intégration de navigation.

### Ressources ENSIIE — lot de cinq, 16 octobre 2026

- [x] Intégrer un catalogue bilingue de 28 ressources sélectionnées depuis `docs/RESSOURCES_ENSIIE.md`, généré dans les données du projet et accessible en 2D et immersion.
- [x] Rechercher une démarche par mots-clés FR/EN, avec filtres par profil et thème, résultats vides explicites et effacement des filtres.
- [x] Distinguer accès public, compte requis et accès mixte ; afficher organisme, provenance et limites, avec cinq contacts institutionnels sourcés.
- [x] Ajouter « Mes premiers jours » : six ressources, cases de consultation persistantes et remise à zéro, sans prétendre accomplir une démarche.
- [x] Ajouter un accès commun « Besoin d’aide » et la consultation des bureaux candidats 220/221 sur le plan, sans itinéraire ni vérification terrain implicites.

**Périmètre :** catalogue éditorial de ressources, pas connexion à Aurion/Moodle/JobTeaser, récupération de données personnelles ni test après authentification. Les sources ont été collectées le 16/10/2026 ; les liens n’ont pas tous été revérifiés pendant cette intégration. Les autres fiches candidates, les informations uniquement attestées par emails à valider, les campagnes et événements datés restent dans le document de ressources. Aucun horaire, capacité ou affectation physique n’est ajouté comme fait confirmé. Le texte des parcours ne présente plus C3 comme un Forum certain.

Les tâches plus larges de validation terrain, des horaires, des traductions et de la recherche de services physiques restent ouvertes. Recette : S25–S29 dans `docs/DEMONSTRATION.md` ; tests ciblés dans `scripts/schoolResources.test.js`.

## 8. Accessibilité de l’application et des parcours — P1 / P2

- [x] Ajouter une couche d’accessibilité indiquant les informations confirmées et celles qui restent inconnues.
- [x] Distinguer un trajet qui évite les escaliers d’un trajet dont l’accessibilité complète a réellement été vérifiée.
- [ ] Compléter la navigation au clavier : salles, carte, filtres, fiches, dialogues et parcours.
- [ ] Assurer des libellés accessibles et des annonces pertinentes lors d’un changement d’étage, d’une erreur ou d’une arrivée.
- [ ] Vérifier contrastes, taille de texte et lisibilité des panneaux dans les deux modes.
- [ ] Compléter les couleurs par des textes et pictogrammes.
- [x] Proposer un réglage explicite de réduction des mouvements ; certaines animations respectent déjà la préférence système.
- [x] Permettre de découvrir et consulter tous les contenus sans devoir piloter le personnage.

**Avancement — accessibilité :** couche distinguant données confirmées par champ, restrictions et inconnues ; mention explicite que « sans escalier » ne garantit pas l’accessibilité complète. Clavier ajouté au plan, aux salles et aux stations ; dialogues natifs et lien d’évitement. Audit complet clavier, contrastes et annonces encore à réaliser. Réduction des mouvements partagée entre CSS, immersion et Stack 3D.

## 9. Qualité des données, édition et travail d’équipe — P1 / P2

- [x] Relier le tableau de qualité existant au **nouveau routeur géométrique**, et non à la seule présence d’un identifiant dans l’ancien graphe.
- [x] Afficher les salles déconnectées, les champs manquants, les traductions absentes et les points de calibrage douteux.
- [x] Retirer la limitation actuelle du tableau aux premières salles et ajouter filtres, recherche et accès à la salle concernée.
- [x] Ajouter un export CSV des anomalies et des informations à vérifier sur place.
- [x] Afficher des statistiques utiles : surfaces par activité, étage et type, avec la méthode de calcul et les limites des données.
- [x] Ajouter un historique et un retour arrière pour les modifications de fiches.
- [x] Prévisualiser les différences d’un import avant d’appliquer plusieurs fiches.
- [x] Détecter les conflits entre deux exports de l’équipe.
- [ ] Prévoir une sauvegarde commune ou un serveur privé si plusieurs personnes doivent éditer simultanément ; actuellement les modifications restent locales avec échange de fichiers.
- [x] Faciliter l’association entre une porte dessinée et la bonne salle, avec contrôle visuel des incohérences.

**Avancement — qualité :** audit exécuté dans un worker séparé sur les murs, portes et repères **courants**, invalidé lors d’un changement de géométrie/calibrage. Résultat 58/82 reproduit dans le navigateur, filtre « déconnectée » : 24 salles. Plus de limite aux 80 premières salles ; export CSV, filtres, recherche et accès au plan ajoutés. Surfaces par étage/type/activité et écarts de calibrage affichés avec leurs limites. Historique local limité à 20 versions ; sauvegarde puis annulation vérifiées dans le navigateur, données temporaires retirées. Les conflits sont détectés par comparaison de champs existants, sans fusion à trois versions. Association porte/salle visualisée dans l’éditeur ; vérification terrain toujours nécessaire.

## 10. Performances, robustesse et tests — P0 / P2

Les optimisations de rendu et le calcul des itinéraires en arrière-plan existent déjà.

- [ ] Mesurer les performances sur le PC de démonstration : temps de chargement, fluidité en mouvement et durée des requêtes de trajet.
- [x] Ajouter des niveaux de qualité graphique et un ajustement automatique selon les performances.
- [x] Continuer à réduire les objets, textures et éléments lointains rendus inutilement.
- [x] Étudier le chargement différé de l’immersion pour alléger le démarrage du mode 2D.
- [ ] Vérifier les annulations de calcul, changements rapides de destination, sauvegardes et reprises de visite.
- [ ] Étendre les tests de parcours à toutes les salles du secteur validé, dans les deux sens et avec les différents profils de mobilité.
- [ ] Ajouter des tests d’intégration reproductibles : 2D → immersion → déplacement → retour 2D, édition partagée, import/export et trajet multi-étage.
- [ ] Vérifier le fonctionnement hors ligne dans les conditions réelles de démonstration ; décider ensuite si un cache applicatif est nécessaire.
- [ ] Vérifier le comportement en cas de plan, fichier de données, stockage local ou WebGL indisponible.

**Avancement — robustesse :** `npm test` : **41 tests réussis**, puis tests physiques du jeu : **51 espaces navigables**. Build complet avec génération des données réussi ; build final Vite réussi. Chargement différé de l’immersion **et** du Stack 3D : bundle principal final d’environ 383 ko (129 ko gzip), contre environ 914 ko avant découpage ; le chunk 3D partagé reste supérieur à 500 ko. Qualités basse/haute/auto et FPS ajoutés. `npm run benchmark:routing` mesure le routeur Node ; ces chiffres ne constituent pas une mesure FPS du PC de démonstration. Polices externes retirées, données servies localement ; essai hors connexion réelle encore ouvert. Écran de reprise sur erreur et garde-fous existants conservés ; fautes réseau/WebGL/stockage et tests d’intégration automatisés restent à compléter.

## 11. Idées complémentaires et futures — P3

- [ ] Parcours de portes ouvertes avec points de passage et QR codes.
- [ ] Ambiance selon l’heure et statut « ouvert maintenant », uniquement après collecte d’horaires fiables.
- [x] Simulation « une journée dans l’école » avec agents synthétiques et occupation fictive, toujours étiquetée **Simulation**.
- [ ] Estimation de capacité à partir des blocs de mobilier du R+1, avec validation sur quelques salles ; ne pas présenter une estimation par surface comme un comptage de sièges.
- [ ] Intégration éventuelle de disponibilités de salles, emplois du temps ou occupation réelle seulement avec une source autorisée et adaptée.
- [x] Étudier une localisation intérieure automatique avec une infrastructure appropriée.
- [x] Étudier le géoréférencement et un export vers un standard de cartographie intérieure si ces besoins sont retenus.
- [x] Prévoir une restitution imprimable du parcours ou du passeport de visite.

**Avancement — simulation :** journée fictive de 8 h à 18 h avec cinq phases inventées, lecture/pause, vitesse, curseur et remise à zéro. Douze agents au maximum, quatre par trajet disponible ; trajet impossible exclu et reprise proposée. Arrêt de lecture à 18 h, quand l’onglet est masqué ou en mode mouvements réduits. Les trois trajets, les deux étages, la lecture, pause, phase de midi, réinitialisation et mouvements réduits ont été contrôlés dans le navigateur. Pas d’occupation réelle, de planning connecté ni de données personnelles ; chiffres et phases documentés dans `docs/DONNEES_FICTIVES.md`. Les autres extensions restent ouvertes.

## 12. Livrables et présentation — P0

Le cahier des charges **existe déjà** dans `Cahier_charges/`.

- [x] Le mettre à jour pour refléter la visite immersive, l’édition des salles et des murs, le nouveau routeur et le partage entre vues.
- [x] Distinguer exigences de l’énoncé, choix de l’équipe, propositions et fonctionnalités non livrées.
- [x] Définir clairement le secteur démontré et les limites de couverture.
- [ ] Réaliser ou compléter les retours d’utilisateurs : étudiant, visiteur, personnel ou entreprise selon disponibilité.
- [x] Préparer un scénario court : rechercher un service, consulter sa fiche, tracer un trajet RDC ↔ R+1, le suivre, revenir au plan, puis découvrir une activité.
- [ ] Répéter ce scénario sur le PC de présentation avec une solution de secours si WebGL n’est pas disponible.
- [ ] Vérifier les crédits et licences des éléments réutilisés.
- [x] Préparer une liste transparente des données vérifiées, des approximations et des suites envisagées.

## Ordre proposé pour avancer une fonctionnalité à la fois

1. Corriger les connexions manquantes du secteur RDC/R+1 et compléter les données utiles sur place.
2. Enrichir la découverte guidée des quatre activités, partagée entre plan et immersion.
3. Ajouter les consignes de virage, les étapes et la progression du trajet.
4. Ajouter la localisation par salle/QR et améliorer « Je suis perdu ».
5. Finaliser FR/EN, accessibilité de l’interface et organisation des panneaux.
6. Améliorer les animations, la caméra et les repères visuels, avec mesures de performance.
7. Relier le tableau de qualité aux véritables contrôles de navigation et aux données enrichies.
8. Enrichir les simulations et les intégrations futures seulement si le socle et les livrables sont stabilisés.

Pour chaque étape : définir le résultat attendu, réutiliser l’état partagé, vérifier les deux vues, tester, puis mettre à jour ce document.

## Compléments livrés et limites après cette passe

- Personnage : couleurs de peau, cheveux, pantalon et tenue ; sac à dos désactivable ; vitesse de rotation clavier distincte de la sensibilité souris. Les réglages restent locaux. Le placement exact des pieds sur chaque marche reste à faire.
- Navigation : trois repères proches de la position virtuelle dans « Je suis perdu », distances à vol d’oiseau clairement indiquées et commande de trajet. Cela ne valide pas les repères sur place ; cette partie de la tâche reste ouverte.
- Partage : exports texte et aperçu imprimable de parcours/passeport depuis les outils communs. Prévisualisation contrôlée dans le navigateur ; impression papier et QR depuis téléphone encore à tester.
- Démonstration : six fiches peuvent recevoir des exemples fictifs via un réglage désactivé par défaut. Liste exhaustive dans `docs/DONNEES_FICTIVES.md`. Les valeurs réelles restent séparées, l’éditeur utilise les fiches originales et aucune accessibilité ni géométrie n’est inventée.
- Robustesse : chargement API limité dans le temps, repli sur JSON statiques, annulation au démontage et tests de stockage refusé/corrompu. Les défauts réseau testés automatiquement ne remplacent pas toute la campagne de panne WebGL/plan.
- Interface : sélection des contours et positions de salles au clavier Entrée/Espace, annonce d’étage, légende et libellés du plan complétés en anglais. Sélection clavier de R+1-131 contrôlée dans le navigateur. Audit exhaustif clavier/contrastes/traduction toujours ouvert.
- Rendu : géométries et matériaux de portes mutualisés, panneaux adaptés à la distance (lot détaillé ci-dessous) et portes masquées au-delà de 32 m. Ces changements ne constituent pas une mesure de FPS sur le PC du jury.
- Livrables : cahier des charges actualisé et compilation confirmée par le compilateur intégré. `docs/DEMONSTRATION.md` contient scénario, périmètre, limites et recette manuelle. Études de localisation, géoréférencement et données temps réel dans `docs/LOCALISATION_ET_DONNEES.md` : décision de différer ces intégrations faute de sources/infrastructure ; les études cochées ne signifient pas que ces fonctions sont disponibles.

**Travail encore ouvert :** les cases restantes conservent leur portée d’origine. En particulier : continuité réelle des portes, validation et dessin R+2, animation de pieds dans les escaliers, ambiance, audit complet d’accessibilité, tests d’intégration automatisés, partage d’édition sur serveur, photos et données réelles, collecte des retours utilisateurs et répétition de démonstration. Les exemples fictifs ne ferment pas les tâches de validation terrain.

**Hors ligne et escaliers — contrôles supplémentaires :** copie locale optionnelle du build (53 fichiers, environ 8 Mo), sans cache des réponses API ni de sites externes. Rechargement du plan, ouverture de l’immersion et lancement d’un parcours vérifiés après arrêt du serveur de prévisualisation. Le test dans les conditions exactes du jury reste ouvert. La sauvegarde d’une montée automatique conserve désormais sa liaison, sa progression et sa destination ; le double bloc de restauration a été retiré. Un test automatisé couvre la conservation du sens montée/descente. Les scénarios de changement de vue pendant la montée RDC → R+1 et la descente R+1 → RDC ont été exécutés jusqu’à leur arrivée. La liaison A a été testée ; cela ne valide pas les autres liaisons ni le terrain.

**Vérification historique de cette passe :** 55 tests automatisés et build complet avec génération des données et copie hors ligne.

## Suivi continu des modifications — 16 octobre 2026

Chaque fonctionnalité ou correction est désormais consignée dans ce fichier pendant sa réalisation, avec son état de vérification. Une implémentation partielle ne clôt pas une tâche plus large.

**Interface simplifiée — terminé :** retrait des commandes « Aligner les étages », « Dessiner murs / portes » et « Annuler le calibrage » du Stack 3D et de la visite immersive. Les panneaux d’édition de géométrie et de calibrage ne sont plus montés dans l’application. Les murs, portes et repères déjà enregistrés continuent à alimenter le modèle et les itinéraires. Cette suppression d’interface ne constitue pas une nouvelle validation de la géométrie.

**Vérification de cette suppression :** build de production réussi avec génération des données et copie hors ligne ; aucune référence aux commandes retirées ni aux panneaux correspondants dans `src/App.jsx`.

## Suivi coordonné — démonstration et guidage

**Règle de suivi :** toute fonctionnalité ou correction entraîne, dans la même passe, la mise à jour de ce backlog, de `docs/DEMONSTRATION.md` (actions concrètes, préconditions, résultat attendu et statut) et du cahier des charges. Les scénarios sont identifiés S01 à S14 ; une procédure écrite n’est pas une validation exécutée.

**Documentation livrée :** 14 scénarios reproductibles couvrent recherche, continuité 2D/immersion, itinéraire multi-étage, interruption d’escalier, parcours, passeport, fiction, personnage, récupération, édition, clavier/langue, diagnostic, hors ligne et retrait des outils techniques.

**Guidage partagé — correction implémentée :** le panneau de consignes utilise maintenant la même position virtuelle dans le plan et dans l’immersion. L’action d’arrivée ne revient plus au premier virage ; une liaison d’étage est annoncée à proximité du palier, les distances de prochaine action évoluent et une position hors trajet ne surligne pas une instruction sans rapport. Le libellé rappelle explicitement la nature virtuelle de cette position. Scénarios concernés : S02/S03 ; tests automatiques ciblés ajoutés, recette complète sur le PC du jury encore à exécuter. Cette correction ne clôt pas la campagne d’intégration ni les vérifications terrain.

**Vérification de cette passe :** 61 tests réussis, dont huit tests de guidage ; contrôles RDC sur 51 espaces ; build complet réussi. Contrôle navigateur limité de S02 : sur RDC-011 → R+1-127, même position virtuelle RDC, 25 m restants et virage à gauche à 1 m dans le plan, en immersion et au retour. Les distances courtes affichent « < 1 m » dans la liste et « maintenant » pour une action immédiate. Le cahier des charges compile. Les scénarios S01–S14 restent des procédures de recette, avec leurs limites, et non 14 nouvelles cases déclarées réussies.

## Lot de cinq — navigation et confort, 16 octobre 2026

Lot terminé et vérifié ; les cinq cases correspondantes sont clôturées :

1. Recalcul après écart : contrôle de la position la plus récente après 900 ms, exclusion des escaliers/calculs en cours, option de désactivation et commande explicite de recalcul/reprise dans les deux vues.
2. Assistant de récupération : retour depuis le personnage ou un départ déclaré vers une fiche déjà marquée vérifiée, classée par proximité sur le même étage. Fiction exclue ; provenance ou absence de provenance affichée, sans certifier le passage.
3. Caméra près des murs : rapprochement immédiat pour respecter les collisions, retour amorti, seuils distincts d’entrée/sortie de la vue rapprochée pour limiter les oscillations, explication visible.
4. Orientation : option de déplacement latéral conservant l’orientation de la vue ; les trajets automatiques et les escaliers gardent leur propre direction. La caméra n’est pas réorientée par le déplacement latéral.
5. Panneaux : détail complet proche, numéro/étage compact à moyenne distance, masquage lointain ; priorité à la destination et un seul panneau complet par salle pour réduire les doublons d’entrées.

Tests ciblés dans `scripts/comfortBatch.test.js` ; scénarios S15–S19 dans le guide.

**Lot de cinq tâches terminé.** Les études terrain, les nouvelles fonctions non retenues et les implémentations partielles restent ouvertes.

**Vérifications du lot :** 66 tests automatisés réussis et contrôles RDC sur 51 espaces. Navigateur : retour virtuel vers l’amphithéâtre marqué vérifié (13 m estimés) ; changement de position vers le foyer avec même destination et recalcul automatique (24 m), déplacement latéral hors trajet avec automatisme désactivé, puis reprise manuelle (27 m). Le plan affiche maintenant le départ « Position virtuelle » et son marqueur au bon point ; l’inversion est désactivée pour une origine virtuelle sans salle de retour définie. Caméra rapprochée observée près du mur à y ≈ 8 m, puis retour en vue personnage dans l’espace ouvert ; caméra et orientation stables pendant les déplacements latéraux. Panneaux compacts observés à distance et complets en approchant ; les doublons d’une salle sont compactés. Aucun accès physique ni statut terrain supplémentaire n’a été inventé. Les essais ne constituent pas une validation exhaustive de toutes les zones.

## Périmètre actualisé — 16 octobre 2026

14 tâches liées au jeu Aventure ont été retirées (terminées ou restantes), y compris les défis chronométrés et les découvertes cachées. La version actuelle du jeu reste inchangée.

**Total actuel : 114 tâches — 69 terminées et 45 non terminées.**


**Vérification du lot ressources :** 75 tests automatisés réussis, dont cinq tests du catalogue, et contrôles RDC sur 51 espaces. Build complet réussi, y compris les 28 ressources générées et la copie hors ligne. Compilation du cahier des charges confirmée. Contrôles navigateur : certificat → Aurion ; filtres Entreprise/Entreprises et projets → cinq ressources ; résultat vide et retour aux 28 ressources ; checklist 1/6 conservée après rechargement puis remise à zéro ; sélection du bureau candidat 220 sur R+2 sans trajet ; aide et recherche housing en immersion ; fermeture Échap avec retour du focus au déclencheur. La disponibilité externe, les démarches après connexion, le rendu mobile complet et les accès physiques ne sont pas validés par ces essais.


## Lot de cinq — immersion, confort et journée fictive, 16 octobre 2026

1. **Plein écran immersif corrigé :** bouton directement dans la scène, agrandissement de la scène seule, repli fenêtre si refus, sortie visible et Échap. La scène reste montée, même position et destination. Cette tâche était déjà cochée ; la version précédente agrandissait seulement la page entière depuis les réglages.
2. **Panneaux harmonisés :** Plan, Salle, Trajet, Étages et Commandes partagent une barre et un seul emplacement ; choix actif explicite et commande Tout masquer. Les fiches et consignes continuent à utiliser les mêmes données dans le plan.
3. **Historique vérifié et corrigé :** fermer une fiche ajoute un état consultable au lieu d’écraser l’entrée précédente. Précédent/Suivant, sélection 2D, consultation immersive sans téléportation et lien d’itinéraire après rechargement contrôlés.
4. **Éclairage amélioré :** ambiance, source chaude et remplissage froid avec compression des hautes lumières ; pas de passe d’ombres supplémentaire. Silhouette, murs, portes et plafond contrôlés au RDC ; ne représente pas une étude d’éclairage réel ni un benchmark du PC du jury.
5. **Journée fictive enrichie :** phases, lecture/pause/vitesse/remise à zéro, agents sur trajets calculés, erreurs et réduction des mouvements. Aucun planning ou effectif réel n’est inféré.

**Vérification :** 80 tests automatisés passent, dont cinq nouveaux tests plein écran/journée ; contrôles RDC sur 51 espaces et build de production réussi. Plein écran natif testé : coordonnées RDC x 23,9 m / y 23,8 m conservées, aucun panneau à l’entrée ; catalogue Services accessible au-dessus de la scène, fermeture du dialogue puis sortie plein écran par Échap ; sélection du panneau Étages sans carte superposée. Les trois trajets de simulation ont chargé : 8 agents fictifs RDC, 4 au R+1 ; lecture jusqu’à 09:41, pause, phase 12:00, réinitialisation et lecture désactivée avec mouvements réduits contrôlées. Le repli fenêtre et le refus de sortie natif sont couverts automatiquement ; compatibilité mobile et visite de toutes les salles restent à contrôler. Recette S30–S34 et limites dans le guide.

**Bilan :** cinq éléments traités, dont la correction d’une tâche déjà cochée ; quatre tâches précédemment ouvertes sont clôturées. Le nombre total ne change pas.

**Bilan actuel après ce lot : 69 terminées / 45 non terminées / 114 au total.**


### Correction suivante — commandes de l’ascenseur

Accès explicite Ascenseur dans la barre immersive et depuis le plan, choix direct de l’étage, indication de l’étage actuel, distance au repère choisi et placement virtuel identifié. Le choix d’ascenseur n’est plus remplacé par une liaison voisine. Les repères bleus deviennent cliquables et E ouvre l’ascenseur à proximité. Arrivée au point sûr sans le décalage utilisé pour quitter un escalier ; un palier bloqué reste signalé. Quatre tests ciblés couvrent sélection/proximité, états de reprise et suspension du recalcul en ascenseur. Recette S35 : accès depuis le plan, placement virtuel, RDC ↔ R+1 et RDC → R+2 vérifiés dans le navigateur. La reprise après changement de vue est codée et testée au niveau de son état ; le retour navigateur a été interrompu avant conclusion et reste à rejouer, de même que la commande d’arrêt. Les validations physiques de l’ascenseur restent ouvertes.


**Clôture de la passe demandée :** pas de nouveau développement engagé. Démonstration et cahier des charges actualisés ; l’ascenseur conserve sa liaison choisie, présente des boutons d’étage explicites et suspend le recalcul pendant le transfert. La correction d’interface ne coche pas la vérification physique de l’ascenseur. Le décompte reste **69 terminées / 45 restantes / 114 au total**.


**Contrôle final :** 84 tests automatisés réussis, contrôles RDC sur 51 espaces et build complet avec copie hors ligne réussi. Les limites de recette manuelle signalées ci-dessus restent ouvertes.
