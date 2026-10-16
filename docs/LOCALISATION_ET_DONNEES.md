# Localisation et données : décision pour ce prototype

## Localisation automatique intérieure

Le dépôt ne fournit ni balises Bluetooth, ni points Wi-Fi calibrés, ni mesures de signal, ni repères visuels reconnus et positionnés. Une position GPS de navigateur ne permettrait pas de déterminer correctement une salle et un étage dans ces plans locaux. Décision : conserver la position déclarée par salle/QR et la position virtuelle du personnage, avec des libellés distincts. Ne pas afficher de précision métrique réelle ni demander une autorisation de localisation sans dispositif exploitable.

Une extension nécessiterait d'abord une infrastructure autorisée, un relevé de positions, un protocole de mesure, des tests de précision par étage et une politique de conservation des mesures. Le prototype ne réalise pas cette localisation automatique.

## Géoréférencement

Les trois plans utilisent des repères locaux en mètres, avec des origines distinctes. Le calibrage interne permet leur superposition, mais ne fournit pas des coordonnées géographiques. Il manque des points de contrôle relevés dans un référentiel géographique, leur précision et la transformation vers ce référentiel. Décision : conserver les coordonnées locales et ne pas les publier comme longitude/latitude.

## Export de cartographie intérieure

Un export interopérable exigerait de fixer un format cible, de qualifier étages, portes, passages et fonctions, puis de valider les coordonnées et connexions. Les GeoJSON fournis sont des contours reconstruits, pas une validation de circulation. Garder les exports de travail actuels et différer une publication dans un standard cartographique tant que ces prérequis et la permission de diffusion des plans ne sont pas établis.

## Données temps réel et horaires

Aucune source autorisée d'occupation, de réservation ou d'emploi du temps n'est disponible dans le dépôt. La simulation et les horaires du mode Démo sont fictifs. Ne pas les utiliser pour un statut réel « ouvert maintenant », un conseil d'accès ou une disponibilité de salle. Une connexion future devra préciser la source, sa fréquence de mise à jour, la durée de validité et le comportement en cas d'indisponibilité.
