# Démonstration et recette EnsiiExplore

## Périmètre présenté

Le plan couvre RDC, R+1 et R+2. La visite immersive et le routeur géométrique sont principalement préparés sur RDC/R+1. Le dernier audit ne valide que 58 salles sur 82 depuis ses deux origines de référence, dans les deux sens ; il ne valide pas toutes les paires possibles. Le R+2 et les accès physiques restent incomplets.

## Scénario de cinq minutes

1. Ouvrir le Guide, rechercher « RDC 011 », sélectionner la fiche. Montrer provenance, inconnues et lien direct.
2. Choisir RDC-011 comme départ et R+1-131 comme destination. Expliquer les distances estimées et lire les consignes d’escalier. Si aucun chemin géométrique n’est disponible, montrer le diagnostic plutôt que prétendre qu’un chemin est validé.
3. Ouvrir l’immersion, parcourir une portion, puis revenir au plan. Vérifier que position virtuelle, destination et étage sont conservés. Ne pas présenter le personnage comme une localisation réelle du visiteur.
4. Ouvrir Constellation, lancer « Recherche » sur le plan, passer à l’étape suivante puis en immersion. Montrer le même numéro d’étape, la pause et la reprise.
5. Valider une découverte sans marcher, consulter le passeport, ouvrir sa version imprimable. Afficher la qualité des données et expliquer les limites.
6. Si utile, activer les exemples fictifs, montrer l’avertissement et les désactiver. Ne pas confondre ce jeu d’exemples avec des données collectées.

## Solution de secours

En cas d’indisponibilité WebGL, utiliser le plan 2D, les fiches, les consignes et la validation des découvertes sans marche. En cas de panne du serveur API, les JSON statiques sont utilisés. Préparer une copie compilée avec `npm run build` avant la présentation. Tester hors connexion sur le PC prévu ; l’existence de fichiers locaux ne suffit pas à prouver une disponibilité hors ligne.

## Recette manuelle à consigner

Pour chaque essai, noter date, machine, navigateur, résultat et anomalie. Les essais ci-dessous ne sont pas déclarés exécutés par ce document.

- Monter et descendre RDC/R+1 ; changer de vue au milieu ; interrompre et reprendre.
- Tester précédent/suivant du navigateur depuis un lien de salle et de trajet.
- Tester clavier seul, zoom navigateur, contrastes, noms longs et langue anglaise.
- Tester perte de WebGL, fichiers manquants, stockage refusé et changement rapide de destination.
- Tester impression salle/passeport, QR depuis un téléphone autorisé et absence de réseau.
- Mesurer chargement, FPS en déplacement/rotation et durée de calcul sur le PC de présentation.
- Faire essayer à un étudiant et un visiteur ; consigner leurs difficultés sans inventer de retours.

## État des informations

Les numéros, désignations et surfaces viennent des plans d’architecte. Les contours sont reconstruits. Les usages réels, équipements, capacités et accessibilités exigent une collecte terrain. Les capacités estimées par surface ne sont pas des comptages de sièges. Les données fictives optionnelles sont détaillées dans DONNEES_FICTIVES.md. Les contrôles géométriques ne constituent pas une validation physique des accès.

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
