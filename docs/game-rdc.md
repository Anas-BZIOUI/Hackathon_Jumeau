# RDC : environnements de jeu separes

Le jeu charge public/game/maps/rdc-dungeon.json, genere par npm run data:dungeon.
Le fichier architectural rdc-layout.json sert uniquement de reference de structure et de connexions.
Chaque piece est reconstruite sur une grille de jeu de 16 px avec une echelle adaptee a ses dimensions.
Les details inferieurs a une tuile et fragments isoles sont retires ; ce n est pas un plan metrique.
Le sas est dessine explicitement : carre de 320 px avec deux portes laterales vers la circulation et deux vantaux rue decoratifs inactifs.
Les pieces sont rendues separement : aucun plan global, voisinage ou minimap.
Sol bois et portes proviennent des PNG fournis dans Tiled_Photos (copies dans public/game/tilesets).
Marcher vers une porte declenche le passage vers sa piece cible ; aucun bouton ni touche E.
La porte d arrivee est temporairement neutralisee jusqu a ce que le joueur s en eloigne, pour eviter les allers-retours automatiques.
ZQSD, WASD et fleches : deplacements.
Les 42 espaces restent connectes. Les liens architecturaux inferes restent a verifier sur site.
