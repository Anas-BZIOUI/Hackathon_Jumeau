# Démonstration et recette EnsiiExplore

Dernière mise à jour : **16 octobre 2026**. À chaque modification, mettre à jour ensemble ce guide, `AMELIORATIONS_RESTANTES.md` et `Cahier_charges/main.tex`. Un scénario documenté n’est pas automatiquement un test réussi : distinguer résultat attendu et résultat observé.

## Préparer l’essai

- Développement : `npm run dev`, puis ouvrir l’adresse affichée par Vite (habituellement `http://localhost:5173`).
- Version de démonstration : `npm run build`, puis `npx vite preview --host 127.0.0.1`. Utiliser l’adresse affichée ; conserver la même origine pendant les essais de sauvegarde.
- Commencer en français, mode Guide, données fictives désactivées. Éviter deux visites guidées simultanées : terminer le parcours courant avant un autre scénario.
- Ne pas effacer le stockage du navigateur : il peut contenir des fiches et découvertes importantes. Noter les valeurs initiales avant un essai d’édition et utiliser l’annulation.
- Pour rejouer les missions à zéro sans effacer vos acquis, utiliser un profil de navigateur réservé aux essais ou une origine locale de prévisualisation différente ; ne pas vider le stockage de votre session de travail.
- Les commandes « Aligner les étages », « Dessiner murs / portes » et « Annuler le calibrage » ont été retirées. Les données de géométrie et de calibrage existantes continuent à fonctionner.

## Démonstration courte — environ cinq minutes

1. **Recherche et information (45 s)** : chercher « RDC 011 », ouvrir sa fiche, montrer étage, provenance et inconnues (S01).
2. **Orientation (60 s)** : choisir RDC-011 comme départ et R+1-131 comme destination ; ouvrir « Consignes du trajet » et montrer la liaison d’étage (S03).
3. **Continuité 2D/immersion (60 s)** : entrer dans la visite, marcher, revenir au plan et montrer le marqueur et la destination. Les consignes utilisent maintenant la même position virtuelle dans les deux vues (S02).
4. **Découverte des activités (60 s)** : Constellation → Recherche → Démarrer sur le plan ; passer à 2/3 et ouvrir l’immersion ; pause/reprise (S05).
5. **Bilan (45 s)** : valider une découverte sans marcher, ouvrir la version imprimable et montrer les limites des données (S06). Si nécessaire, illustrer une fiche fictive puis désactiver immédiatement le mode Démo (S07).

Ne pas annoncer de temps de déplacement ou d’accessibilité comme une mesure terrain. Si un trajet échoue, expliquer la limite et montrer le diagnostic au lieu de prétendre qu’il est valide.

## Scénarios détaillés

### S01 — Rechercher et consulter une salle

**Précondition :** Guide → Plan 2D, aucune visite guidée en cours.

1. Saisir « R+1 131 » dans la recherche du haut et choisir le résultat correspondant.
2. Lire la fiche : numéro, étage, type, surface, capacité et qualité des données.
3. Ouvrir le lien direct vers cette salle ; essayer aussi « printing » et « toilettes ».
4. Passer en anglais puis revenir en français.

**Attendu :** la salle 131 du R+1 est sélectionnée ; le contenu ne transforme pas une estimation en valeur confirmée. Les recherches par besoin correspondent aux données enregistrées ; la présence réelle du service reste à confirmer. Les libellés d’interface basculent de langue ; les désignations historiques des plans peuvent conserver leur texte source.

### S02 — Même position et mêmes consignes entre plan et immersion

**Précondition :** choisir R+1-131 comme départ, puis R+1-139 comme destination, depuis leurs fiches. Conserver les données fictives désactivées.

1. Ouvrir « Visite immersive » et « Consignes du trajet ».
2. Cliquer dans la scène et marcher avec ZQSD/WASD ; glisser pour regarder.
3. Lire la prochaine action, sa distance et l’étage.
4. Cliquer « Sortir vers le plan 2D », rouvrir les consignes et comparer la position du marqueur avec la dernière position virtuelle.
5. Revenir dans la visite et poursuivre vers la destination, au besoin avec « Me guider depuis ma position ».

**Attendu :** destination conservée, marqueur cohérent, même progression de guidage dans les deux vues. La distance de la prochaine action évolue avec la position. Au point d’arrivée, le panneau indique l’arrivée plutôt que de recommencer au premier virage. « Arrivée à la porte » ne confirme pas l’entrée dans la pièce. Ce guidage est virtuel ; il ne localise pas physiquement la personne.

**Statut :** règles de virage, arrivée, changement d’étage et position hors trajet couvertes automatiquement ; refaire ce parcours manuel sur le PC de présentation.

### S03 — Itinéraire RDC ↔ R+1

1. Chercher RDC-011, ouvrir la fiche et cliquer « Départ ».
2. Chercher R+1-131 et cliquer « Arrivée ».
3. Déplier « Consignes du trajet » ; consulter les portions de chaque étage.
4. Inverser le trajet puis rétablir le sens initial.
5. Essayer « Sans marches » et lire les indications ou l’absence de chemin.

**Attendu :** les portions et l’escalier sont explicites. Un calcul impossible est indiqué ; aucune ligne ne doit être présentée comme un accès terrain vérifié. « Sans marches » ne signifie pas que portes, ascenseur et accès complet ont été contrôlés.

### S04 — Interrompre une montée et une descente en changeant de vue

**Précondition :** visite immersive, personnage au RDC, parcours guidé terminé.

1. Déplier « Changer d’étage », sélectionner « Escalier A », puis « Me placer au palier ».
2. Cliquer « Monter » ; immédiatement passer au Plan 2D puis revenir dans la visite.
3. Attendre la fin de la montée et vérifier R+1 dans le bandeau et le plan intégré.
4. Déplier à nouveau « Changer d’étage », cliquer « Descendre » et répéter le changement de vue.

**Attendu :** la progression et le sens de la liaison sont conservés ; arrivée R+1 à la montée et RDC au retour. Le personnage ne repart pas du sol inférieur après le changement de vue.

**Statut :** ces deux essais ont été exécutés sur la liaison A. Les autres liaisons et leurs correspondances physiques restent à contrôler.

### S05 — Parcours guidé par activité

1. Constellation → carte « Recherche » → « Démarrer sur le plan ».
2. Lire l’explication 1/3, cliquer « Valider / étape suivante ».
3. Ouvrir la visite immersive : vérifier 2/3 et la même salle cible.
4. Mettre en pause : les actions de progression sont désactivées. Reprendre, puis revenir à l’étape précédente.
5. Recharger la page pour vérifier la sauvegarde du parcours ; terminer le parcours avant le scénario suivant.

**Attendu :** même état entre vues ; explications issues des fiches, durée de lecture distincte du déplacement, validation possible sans marcher. Le rechargement peut rouvrir le plan ; il ne doit pas perdre l’étape enregistrée.

### S06 — Découverte, badge et document imprimable

1. Depuis Aventure, déplier « Missions de découverte », puis « Consulter le lieu » dans la mission Enseignement.
2. Dans le Guide, cliquer « Valider la découverte sans marcher ».
3. Ouvrir le guide Enseignement dans les missions, choisir une question et lire sa réponse ; revenir dans Aventure et observer le badge et la mission correspondante.
4. Dans le Guide, ouvrir « Version imprimable » ; télécharger aussi « Exporter mon passeport ».
5. Pour imprimer les étapes d’un parcours, démarrer un parcours puis utiliser sa version imprimable.

**Attendu :** découverte partagée sans obligation de pilotage, badge visible, texte imprimable lisible. Le bouton d’impression ouvre le dialogue du navigateur ; sélectionner PDF si souhaité. Une découverte déjà validée ne doit pas être comptée deux fois. La progression de la partie et les découvertes du Guide restent distinctes ; réinitialiser la partie ne supprime pas celles du Guide. Depuis le lot missions, une mission demande aussi la lecture d’une réponse du guide correspondant.

### S07 — Données fictives réversibles

1. Sélectionner R+1-127 ; noter la capacité initialement affichée.
2. Favoris et réglages → « Utiliser des exemples fictifs de démonstration ».
3. Vérifier « DEMO », capacité 12, équipements et accès fictifs.
4. Ouvrir « Modifier les informations » sans enregistrer : les valeurs proposées doivent provenir de la fiche originale, pas de la couche fictive. Fermer.
5. Désactiver le réglage ; vérifier le retour aux données initiales.

**Attendu :** avertissements dans les deux vues, fiction signalée dans les exports, aucune accessibilité ou vérification terrain inventée. La liste exhaustive des six exemples est dans `DONNEES_FICTIVES.md`.

### S08 — Personnage et caméra

1. Favoris et réglages : changer couleur de tenue, peau, cheveux et pantalon, masquer le sac à dos.
2. Ouvrir l’immersion ; comparer vue Personnage et Première personne.
3. Essayer sensibilité souris, vitesse de rotation clavier, distance et inversion verticale.
4. Revenir au plan puis en immersion ; recharger et contrôler la conservation des réglages.
5. Restaurer vos réglages habituels à la fin de l’essai.

**Attendu :** apparence et réglages conservés localement, orientation du marqueur cohérente. Les nouvelles couleurs n’altèrent pas collisions ou itinéraires. Le placement précis des pieds sur les marches reste incomplet.

### S09 — Retrouver son chemin

1. Ouvrir l’immersion et marcher un peu ; cliquer « Je suis perdu ».
2. Lire la position virtuelle et les trois repères proches, avec distances à vol d’oiseau.
3. Choisir un repère à rejoindre depuis le personnage.
4. Refaire l’assistant en déclarant explicitement une salle de départ puis une destination.

**Attendu :** départ virtuel et départ déclaré restent distincts. Une proximité à vol d’oiseau ne garantit pas un chemin direct. L’absence de trajet doit être affichée sans inventer un passage.

### S10 — Édition partagée et annulation

**Précondition :** données fictives désactivées ; noter le texte initial d’une description et conserver vos exports existants.

1. Modifier uniquement la description française d’une salle en ajoutant « TEST TEMPORAIRE » ; ne pas déclarer ce contenu vérifié.
2. Enregistrer, puis retrouver cette description dans le plan et dans les informations de la visite près de cette salle.
3. Utiliser « Annuler la dernière modification des fiches ».
4. Vérifier que le texte initial est revenu et recharger.
5. Pour l’import/export, travailler sur une copie de votre fichier ; contrôler l’aperçu des différences avant toute application.

**Attendu :** contenu commun aux vues, historique fonctionnel, restauration persistante. Cet essai ne valide pas une fusion simultanée de plusieurs utilisateurs sur serveur.

### S11 — Clavier et langue

1. Fermer les filtres ; naviguer avec Tab et vérifier que leurs commandes cachées ne sont pas atteintes.
2. Ouvrir les filtres avec leur bouton ; les parcourir au clavier puis les refermer.
3. Sur le plan, atteindre une salle avec Tab et l’ouvrir par Entrée ou Espace ; utiliser les flèches pour déplacer le plan lorsqu’il a le focus.
4. Ouvrir Aide rapide et la fermer avec Échap ; vérifier le retour du focus.
5. Passer en anglais, examiner fiche, légende, guidage et réglages, puis tester un zoom navigateur à 150 %.

**Attendu :** focus visible, ouverture clavier, fermeture des dialogues, libellés compréhensibles. Consigner tout débordement ou élément non accessible ; ce scénario ne constitue pas à lui seul un audit d’accessibilité complet.

### S12 — Diagnostic des trajets

1. Qualité des données → « Auditer les trajets actuels ».
2. Attendre la fin, filtrer les anomalies de connexion, chercher RDC-017.
3. Consulter la salle puis revenir au diagnostic ; exporter les anomalies CSV.

**Attendu :** résultats du modèle courant. La référence est 58/82 salles accessibles dans les deux sens depuis RDC-011 et R+1-131 ; R+2 n’est pas audité. Si le résultat diffère, noter géométrie/calibrage et ne pas remplacer le résultat par ce chiffre attendu.

### S13 — Préparer puis tester le fonctionnement hors ligne

**Précondition :** version compilée servie depuis localhost ou une origine HTTPS privée ; pas la version de développement.

1. Favoris et réglages → « Préparer une copie hors ligne » ; attendre « Copie locale prête ».
2. Recharger une fois, puis arrêter le serveur local de prévisualisation ou couper l’accès à cette origine dans les conditions prévues.
3. Recharger : ouvrir un autre étage, l’immersion, la constellation et un parcours.
4. Relancer le serveur après l’essai.

**Attendu :** fichiers locaux en cache utilisables ; aucune dépendance aux liens externes n’est promise. Le bouton est désactivé en développement. Après mise à jour du build, préparer à nouveau la copie et fermer les onglets de cette origine pour activer une version éventuellement en attente. Une copie peut devenir indisponible si le navigateur efface son stockage.

### S14 — Retrait des outils techniques

1. Ouvrir Stack 3D puis Visite immersive.
2. Examiner la barre d’outils et parcourir ses commandes au clavier.
3. Vérifier que les murs, portes et étages restent affichés et que S03 reste réalisable.

**Attendu :** absence de « Aligner les étages », « Dessiner murs / portes » et « Annuler le calibrage ». Les panneaux correspondants ne peuvent plus être ouverts depuis l’application.

## Fiche de résultat à recopier pour chaque essai

- Scénario : S__ ; version/branche : __ ; date : __.
- Machine et navigateur : __ ; origine utilisée : __ ; données fictives : oui/non.
- Résultat : réussi / échec / non exécuté.
- Observation et différence avec le résultat attendu : __.
- Capture ou fichier utile : __ ; action de remise en état effectuée : __.

## Limites et solution de secours

Le plan couvre RDC, R+1 et R+2 ; la navigation préparée concerne principalement RDC/R+1. Les contours sont reconstruits et les usages réels restent à vérifier. Les capacités estimées par surface ne sont pas des comptages de sièges. Les tests géométriques ne certifient pas les accès réels. Aucune localisation automatique, réservation ou occupation réelle n’est disponible.

Sans WebGL, utiliser le plan 2D, les fiches, les consignes et la validation des découvertes sans marche. Sans API, les JSON statiques sont utilisés. Tester le PC et le réseau de présentation, l’impression et le QR depuis un téléphone autorisé avant le jury.

## Essais effectivement exécutés le 16 octobre 2026

- Parcours Recherche : lancement depuis la constellation sur le plan, étape suivante, puis même étape 2/3 dans l’immersion.
- Exemples fictifs : activation, capacité fictive de R+1-127, avertissement et export marqués, puis désactivation et restitution de l’estimation originale.
- Aperçu imprimable du parcours : trois étapes et distinction entre fiction et données à vérifier.
- Clavier : sélection de R+1-131 par Entrée dans le SVG du plan. Le tiroir fermé est maintenant exclu de l’accès clavier/lecteur d’écran.
- Navigation : assistant avec trois repères proches, marche et rotation au clavier. Échantillons FPS entre 37 et 60 selon l’instant ; 58–60 pendant un court essai de marche/rotation. Pas de mesure statistique ni de validation sur une autre machine.
- Hors ligne : build préparé, copie locale installée, serveur de prévisualisation arrêté, rechargement réussi, plan architectural et immersion chargés, puis lancement du parcours Recherche depuis la constellation. Ce test ne remplace pas un essai sur le réseau et le PC du jury.

Pour préparer la copie hors ligne : compiler avec `npm run build`, servir `dist` depuis localhost ou une origine HTTPS privée, puis cliquer **Favoris et réglages → Préparer une copie hors ligne**. Le bouton est désactivé en développement. En cas de mise à jour du build, préparer à nouveau la copie ; fermer les onglets de cette origine et les rouvrir pour activer une éventuelle version en attente. Les liens externes ne sont pas mis en cache. Les données restent locales au navigateur ; aucune diffusion des plans n’est ajoutée.

- Escalier A : montée automatique RDC → R+1 interrompue par 2D puis reprise en immersion, arrivée R+1 ; descente avec la même interruption, arrivée RDC. Une correction conserve désormais la direction et la progression de la montée/descente automatique. Les autres liaisons et le terrain ne sont pas certifiés par cet essai.
- Passeport : découverte de l’amphithéâtre validée depuis le Guide puis badge/mission 1 sur 4 visibles dans Aventure. Ce contrôle utilise une découverte virtuelle et ne prétend pas constater une entrée réelle.

## Vérification du guidage partagé — 16 octobre 2026

Sur le trajet RDC-011 → R+1-127, panneau déplié dans le plan : position virtuelle RDC, 25 m restants et prochaine action « Tourner à gauche · 1 m ». Passage en immersion puis retour au plan : même guidage conservé sans déplacement. Les petites portions de la liste affichent « < 1 m » plutôt que « 0 m » ; une action immédiate peut afficher « maintenant ».

Contrôle effectué : continuité du panneau entre vues et absence des commandes techniques retirées. Les cas d’arrivée, de palier et de position hors trajet ont été contrôlés automatiquement. Cela ne remplace pas l’exécution complète de S02/S03 par le présentateur sur son poste.

Validation logicielle de cette passe : **61 tests réussis**, contrôles du jeu sur **51 espaces**, build complet réussi et compilation du cahier des charges confirmée.

## Lot navigation et confort — cinq scénarios supplémentaires

### S15 — S’écarter du chemin et reprendre

1. Conserver une destination au RDC et ouvrir les consignes.
2. Favoris et réglages : activer « Recalcul automatique en cas d’écart en immersion ».
3. Dans le plan, sélectionner une autre salle RDC éloignée du chemin puis « Explorer ici en immersion » ; cela déplace uniquement le personnage et conserve la destination.
4. Attendre au moins une seconde et observer le départ « position virtuelle » et le nouveau trajet.
5. Désactiver le recalcul automatique, refaire un écart puis utiliser « Recalculer / reprendre depuis mon personnage » dans les consignes. Essayer cette commande depuis le plan également.
6. Rétablir votre réglage habituel.

**Attendu :** calcul depuis le dernier point virtuel, destination inchangée, absence de boucle pendant un calcul ou un escalier. Un trajet impossible reste signalé. Le recalcul ne lance pas à lui seul la marche automatique : « Me guider depuis ma position » reste la commande de déplacement.

### S16 — Revenir vers une fiche marquée vérifiée

1. « Je suis perdu » : examiner « Repères marqués vérifiés dans les fiches » et lire la provenance.
2. Sans origine déclarée, utiliser « Rejoindre depuis mon personnage » pour l’amphithéâtre RDC si proposé.
3. Refaire l’assistant avec une salle de départ déclarée, puis choisir le même repère.
4. Avec les exemples fictifs activés, vérifier qu’une fiche fictive n’est pas proposée comme repère vérifié ; désactiver ensuite la fiction.

**Attendu :** origine virtuelle ou déclarée correctement choisie, numéro/nom/étage visibles, priorité aux repères du même étage. Un statut ancien sans source détaillée est identifié comme tel ; il ne garantit pas l’accès réel. Si aucune fiche vérifiée n’est disponible, un message le dit sans fabriquer de repère.

### S17 — Caméra dans un espace étroit

1. En vue Personnage, choisir une distance caméra longue, par exemple 5 m.
2. Se placer dans un couloir, tourner près d’un mur et approcher d’une porte avec le clavier.
3. Observer le rapprochement automatique et son message si la place manque.
4. Revenir dans une zone ouverte, tourner lentement et observer le retour de la caméra.
5. Essayer à nouveau avec « Réduire les mouvements », puis restaurer les réglages.

**Attendu :** pas de caméra derrière les murs ; rapprochement prioritaire sur le lissage ; recul progressif lorsque l’espace se libère, sans alternance incessante entre les vues autour d’un seuil. Le bouton Personnage reste le mode demandé, même si l’assistance adopte temporairement une vue rapprochée.

### S18 — Orientation et déplacement latéral

1. Activer « Déplacement latéral : garder l’orientation de la vue » dans les réglages.
2. Dans un espace ouvert en immersion, déplacer le personnage avec A/Q puis D, en gardant la souris immobile.
3. Tourner la caméra puis recommencer ; désactiver le réglage et comparer.
4. Tester un trajet automatique : le personnage doit suivre le trajet, même avec l’option activée.

**Attendu :** avec l’option, le personnage conserve la direction de la vue pendant ses pas latéraux ; sans l’option, il se tourne vers son déplacement. Le déplacement ne force pas la caméra à tourner. L’orientation du marqueur sur le plan reste cohérente avec les instantanés de position. Ne pas confondre cette option avec une nouvelle animation détaillée des pas latéraux.

### S19 — Panneaux à différentes distances

1. En immersion, regarder une série de portes depuis un couloir.
2. Approcher puis reculer : comparer le panneau complet proche et la version compacte numéro/étage à moyenne distance.
3. Choisir une destination : son panneau doit conserver le détail plus loin que les autres.
4. Chercher une salle avec plusieurs portes : une seule entrée conserve le panneau complet, les autres restent compactes.

**Attendu :** moins de texte concurrent lointain, noms lisibles près des portes, information numéro/étage conservée à moyenne distance, priorité à la destination. Les panneaux traversés par un mur restent soumis à la profondeur de la scène. Vérifier les cas particuliers de portes très proches sur le poste de démonstration.

## Résultats du lot S15–S19 — 16 octobre 2026

- **S15 :** constat du recalcul automatique en déplaçant le personnage de RDC-011 vers le foyer, destination Amphi 002 conservée, puis écart latéral avec automatisme désactivé et reprise manuelle. Distances estimées observées : 13 m avant déplacement, 24 m après recalcul automatique, 27 m après reprise manuelle. Le plan montre « Position virtuelle » et place D au départ recalculé. L’inversion reste indisponible tant qu’un départ dans une salle n’est pas choisi.
- **S16 :** fiches existantes marquées vérifiées proposées, priorité à l’amphithéâtre RDC depuis le RDC ; provenance détaillée absente explicitement indiquée. Le bouton depuis le personnage a déclenché le trajet vers Amphi 002. La variante de départ déclaré reste dans la recette à répéter par l’équipe ; aucune nouvelle vérification terrain n’est déclarée.
- **S17 :** distance demandée 6 m, approche du mur arrière dans le foyer jusqu’à y ≈ 8 m ; assistance rapprochée et message observés. Retour vers y ≈ 14,6 m : personnage et recul restaurés. Tests automatiques : limite de collision, amortissement, hystérésis et réduction des mouvements.
- **S18 :** option activée, déplacements latéraux et orientation de caméra conservée (rotation du marqueur inchangée). Les règles d’orientation pendant un trajet automatique sont couvertes par test ; les réglages de l’essai ont été restaurés.
- **S19 :** version compacte numéro/étage observée depuis le fond de la salle, puis panneaux complets lors de l’approche. Tests des seuils, priorité de destination et compactage des entrées secondaires. Les cas de signalétique particulièrement dense restent à examiner sur place.

Bilan du backlog après ce lot : **65 terminées, 58 restantes (123 au total)**. Validation logicielle : **66 tests réussis**, contrôles du jeu sur **51 espaces**. Les cinq scénarios ne certifient pas les plans ni tous les cas de navigateur.

## Scénarios S20–S24 — missions et Aventure

### S20 — Conversation à proximité et équivalent à distance

1. Ouvrir Aventure. Au sas d’entrée, approcher la balise « Guide virtuel » ; appuyer sur E ou cliquer « Parler au guide proche (E) ».
2. Choisir une question dans le dialogue, lire la réponse et essayer « Voir la fiche et le trajet ».
3. Dans le Guide, déplier « Missions de découverte » et ouvrir le même guide à distance.
4. Passer en anglais pour comparer titres, questions et réponses ; restaurer la langue.

**Attendu :** interaction limitée à une proximité libre de mur dans le jeu ; dialogue avec choix, bouton de trajet et statut fictif explicite. Une réponse lue est enregistrée ; ouvrir le dialogue seul ne suffit pas. L’équivalent à distance est accessible dans le plan et en immersion, sans imposer le pilotage du jeu. Les trois guides sont placés dans le sas, l’espace du jeu associé à l’amphithéâtre et celui du foyer.

### S21 — Mission en deux étapes

1. Déplier « Missions de découverte », choisir « Comprendre un lieu d’enseignement » et « Consulter le lieu ».
2. Valider la découverte depuis la fiche si elle ne l’était pas déjà.
3. Lire les deux indicateurs : lieu découvert et réponse du guide consultée.
4. Parler au guide Enseignement, choisir une question puis revenir au panneau.

**Attendu :** la mission n’est complète qu’avec les deux conditions. Une visite avant dialogue ou un dialogue avant visite fonctionnent ; répéter une action ne crée pas un deuxième badge. Une validation sans marcher reste une découverte virtuelle.

### S22 — Quatre missions, trois guides, état partagé

1. Compléter les missions Enseignement, Vie étudiante, Service du plan et Orientation avec les boutons de consultation et les réponses des guides.
2. Vérifier 4/4, passer du plan à l’immersion puis à Aventure.
3. Recharger, ouvrir à nouveau le panneau et vérifier les étapes sauvegardées.

**Attendu :** quatre missions et trois guides disponibles, même progression entre vues, aucun contenu fictif présenté comme un fait terrain. Les anciens lieux déjà découverts sont conservés ; les nouvelles étapes de dialogue doivent être complétées si elles ne l’étaient pas.

### S23 — Sauvegarde, remise à zéro et annulation de partie

1. Noter le nom de la pièce, le nombre de pas et le pourcentage dans Aventure ; marcher quelques pas puis recharger.
2. Vérifier la reprise de la partie.
3. Cliquer « Réinitialiser la partie uniquement » : le jeu revient au sas, avec remise à zéro des pas et de l’exploration du jeu. Le sas compte comme premier espace découvert.
4. Cliquer « Annuler la remise à zéro » et vérifier la restauration de l’état précédent.

**Attendu :** les découvertes et réponses communes du Guide restent conservées et ne sont pas effacées par la remise à zéro de partie. L’annulation est disponible tant que la vue courante n’a pas été quittée ; elle n’est pas une sauvegarde permanente supplémentaire. Ne pas confondre progression de partie et missions communes.

### S24 — Révéler la carte sans valider les découvertes

1. Dans Aventure, noter le pourcentage exploré et cliquer « Révéler les espaces pour la démonstration ».
2. Vérifier l’affichage du plan complet de la géométrie du jeu et de la liste des espaces non encore découverts.
3. Masquer à nouveau et comparer le pourcentage.

**Attendu :** plan et liste complets visibles sans modifier les découvertes ni valider des missions. La carte est celle du jeu RDC ; elle ne promet pas de passage extérieur ou d’accès R+1, et ses passages déduits restent à vérifier.

## Résultats du lot S20–S24 — 16 octobre 2026

- S20 : conversation de proximité ouverte par E au sas ; réponse Orientation consultée puis bouton fiche/trajet testé. Les trois placements ont été contrôlés automatiquement sur les points libres du jeu, sans modifier murs ou collisions.
- S21/S22 : quatre visites virtuelles validées depuis le plan et réponses des trois guides lues ; compteur 4/4, puis conservation après rechargement, dans l’immersion et dans Aventure.
- S23 : partie déplacée jusqu’à 2 pas ; reprise à 2 pas après rechargement, remise à zéro puis annulation avec retour à 2 pas. Le compteur commun reste 4/4. L’annulation a rétabli l’état d’essai ; aucune ancienne découverte n’a été effacée.
- S24 : plan complet chargé (largeur intrinsèque SVG 1440 px) et lien de pleine taille disponible ; révélation puis masquage sans augmentation de l’exploration.

Après dix tâches en deux lots : **70 terminées, 53 non terminées, total 123**. Suite automatisée : **70 tests réussis**, plus les contrôles RDC sur 51 espaces. Les guides et placements sont des éléments fictifs du jeu, pas un annuaire de personnes réelles. Le navigateur de démonstration conserve les quatre découvertes virtuelles et les trois réponses utilisées pour ces essais ; les nouvelles missions y sont donc déjà à 4/4.


## Ressources ENSIIE — recette S25 à S29

Préconditions communes : ouvrir le Guide, langue FR, profil Étudiant. Aucune connexion aux portails externes n’est nécessaire. Les liens sont ceux de la collecte du 16/10/2026 ; cette recette vérifie l’interface locale, pas les droits d’accès distants. Aventure reste dans sa version actuelle, hors des nouveaux développements.

### S25 — Trouver une démarche

1. Dans le plan 2D, ouvrir « Services et ressources ».
2. Saisir « certificat » : vérifier la carte Aurion et l’indication « Mes Documents ».
3. Effacer et chercher « convention », puis « housing » : vérifier les ressources correspondantes.
4. Saisir un terme inconnu puis utiliser « Effacer les filtres ».

**Attendu :** résultats FR/EN pertinents, compteur actualisé, résultat vide explicite, restauration des 28 ressources avec Tous les profils et Tous les thèmes. La recherche du catalogue est distincte de la recherche de salles.

### S26 — Profils, thèmes et accès

1. Choisir Tous les services, profil Entreprise et thème Entreprises et projets.
2. Vérifier recrutement, partenariats et Dièse ; Aurion n’appartient pas à ce résultat.
3. Choisir Étudiant et Outils étudiants ; vérifier Aurion et Moodle avec « Compte requis ».
4. Fermer, passer en anglais puis rouvrir le catalogue.

**Attendu :** titres, descriptions, filtres et badges bilingues. Les pages externes sont ouvertes dans un nouvel onglet sans formulaire d’identifiants dans le jumeau. Une page publique peut renvoyer vers une action nécessitant un compte.

### S27 — Mes premiers jours

1. Ouvrir « Mes premiers jours » et noter le compteur sur six ressources.
2. Cocher une ressource, fermer, recharger puis rouvrir cette rubrique.
3. Vérifier sa conservation ; cliquer « Tout décocher ».

**Attendu :** progression locale persistante et réinitialisable. Une case confirme seulement une consultation personnelle ; elle ne valide ni inscription, ni convention, ni accès physique. Le stockage indisponible doit laisser les cases utilisables pendant la session.

### S28 — Aide et contacts

1. Fermer le catalogue et ouvrir « Besoin d’aide » depuis la barre du plan.
2. Vérifier accompagnement, handicap/aménagements et helpdesk.
3. Dans le catalogue complet, rechercher logement, admissions ou mobilité.
4. Vérifier le lien de contact et sa source ; ne pas envoyer de message pour cette recette.
5. Fermer par Échap et vérifier le retour au bouton déclencheur.

**Attendu :** aide visible indépendamment du profil ; cinq adresses de fonction sourcées sont proposées dans les cartes concernées. Aucun témoignage ni mot de passe n’est collecté. Le contact handicap ne valide aucun itinéraire PMR.

### S29 — Bureaux candidats et continuité des vues

1. Depuis le catalogue, rechercher « Aurion » puis lire l’avertissement pour R+2-220.
2. Cliquer « Voir le bureau candidat sur le plan » : vérifier le passage au R+2 et la sélection 220.
3. Ouvrir l’immersion puis « Services et ressources » : rechercher international et vérifier les mêmes cartes.
4. Fermer puis rouvrir « Besoin d’aide » depuis l’immersion. Vérifier que position virtuelle et destination ne sont pas modifiées par l’ouverture/fermeture.

**Attendu :** un panneau partagé, pas une deuxième version des données. Le bouton du bureau bascule volontairement vers le plan et sélectionne la pièce ; il ne lance ni marche, ni téléportation, ni itinéraire. Les correspondances 220/221 restent candidates, sans renommage des pièces ni statut vérifié sur place.

**Vérifications automatiques :** recherche bilingue et accents, combinaison des filtres, intégrité du catalogue, badges de compte et séparation des bureaux candidats des affectations vérifiées. La campagne terrain et la validité des portails après connexion restent hors de cette recette.


### Résultats observés S25–S29 — 16 octobre 2026

- S25 : recherche « certificat » → une carte Aurion ; terme inconnu → zéro résultat avec explication ; effacement → 28 ressources. Synonymes convention/housing également couverts automatiquement ; housing contrôlé en anglais dans le navigateur.
- S26 : filtre Entreprise + Entreprises et projets → cinq ressources dont recrutement et partenariat ; carte logement contrôlée en anglais. Badges de compte vérifiés automatiquement. Tous les liens distants ne sont pas ouverts pendant cette recette.
- S27 : une case cochée → 1/6, conservée après rechargement et réouverture ; remise à zéro utilisée ensuite. Le contrôle de stockage refusé reste couvert par les tests du mécanisme commun, pas par un nouveau blocage navigateur spécifique à ce panneau.
- S28 : trois ressources d’aide visibles depuis l’immersion ; Échap ferme la fenêtre et rend le focus au bouton Besoin d’aide. Les liens de contact sont visibles ; aucun message n’a été envoyé.
- S29 : sélection du bureau candidat 220 sur le plan R+2, sans lancement de route ; accès à l’aide et au catalogue depuis l’immersion. Pas de nouvelle validation du bureau 221 ni de campagne d’interruption d’un trajet déjà en cours.

Suite : 75 tests réussis, contrôles RDC sur 51 espaces et build complet réussi. Le cahier des charges compile. Les scénarios restent à répéter sur le PC de présentation ; la recette ne certifie ni les portails externes ni les accès réels.
