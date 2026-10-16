# TODO — Ajustements du RDC, dialogues et quêtes simultanées

> Statut : réalisé le 16 octobre 2026 après autorisation de l’utilisateur. Les modifications ont été vérifiées par compilation, tests de navigation, tests des quêtes et parcours dans un navigateur avec chacun des deux ordres de conclusion.
>
> **Langue obligatoire : toutes les conversations sont intégralement en français**, y compris les salutations, choix, réponses, discussions ordinaires, propositions de mission, indices et échanges après les quêtes. Les textes du journal et de l’inventaire restent également en français.

## 1. Déplacer les distributeurs du hall

- [x] Utiliser la première capture annotée comme référence : déplacer les deux distributeurs depuis la zone entourée en bas à gauche vers l’emplacement indiqué par la flèche bleue/violette, contre le mur supérieur du hall, à droite de l’ascenseur.
- [x] Placer les deux machines côte à côte, sans gêner les portes ni l’accès aux escaliers et aux autres pièces.
- [x] Adapter leurs collisions et leur ordre d’affichage à leur nouvelle position ; vérifier que le joueur peut s’en approcher normalement.

## 2. Aménager le bureau entouré en orange

- [x] Identifier la pièce accessible par la porte entourée en orange sur la première capture, à gauche de l’ascenseur. L’annotation désigne cette pièce, et non un nouveau bureau à poser dans le hall.
- [x] Aménager cette pièce comme un bureau : table de travail, ordinateur, rangements/armoires, tableaux ou peintures murales et autres décorations adaptées.
- [x] Ajouter une personne dans le bureau, accessible pour discuter, qui s’occupera de l’activation de la carte et proposera la seconde quête.
- [x] Donner à cette personne un nom, un rôle et une personnalité cohérents avec ses dialogues en français.
- [x] Conserver un passage libre entre la porte, le mobilier et cette personne.

## 3. Corriger les deux personnages assis du foyer

- [x] Corriger les deux personnes entourées en vert sur la seconde capture, assises sur le canapé en L : elles apparaissent actuellement tronquées ou masquées de façon incorrecte.
- [x] Vérifier les bonnes images et les bonnes frames de position assise, le cadrage des sprites, leur hauteur, leur position sur les coussins et leur ordre d’affichage par rapport au canapé.
- [x] Les montrer réellement assises, avec un corps correctement visible et une intégration naturelle au mobilier.
- [x] Vérifier que ces deux personnes restent accessibles pour parler et que le joueur peut circuler autour du canapé.

## 4. Diversifier les conversations et mémoriser les rencontres

- [x] Prévoir des dialogues propres à chaque personnage : manière de saluer, personnalité, sujets, choix de réponse et déroulement de l’échange. Éviter de répéter le même dialogue avec seulement un prénom différent.
- [x] Distinguer une première rencontre d’une visite ultérieure : présentation lors du premier échange, puis reconnaissance du joueur et salutations adaptées ensuite.
- [x] Mémoriser, pour chaque personnage, si le joueur lui a déjà parlé et les informations utiles déjà échangées.
- [x] Lors des retrouvailles, proposer des échanges naturels : demander comment va le joueur, s’il a besoin de quelque chose, ou discuter d’un sujet lié au lieu et à la personnalité du personnage.
- [x] Proposer des discussions ordinaires indépendantes des missions, notamment avec Oussama, la personne du bureau et les personnes du foyer.
- [x] Faire varier les réactions selon le contexte : avant une mission, pendant celle-ci et après sa fin, sans réinitialiser la présentation à chaque conversation.
- [x] Garder des transitions fluides entre discussion ordinaire, sujet de quête, question complémentaire et fin de conversation.

## 5. Fluidifier la première quête et les échanges après sa fin

- [x] Une fois le papier remis à Oussama, considérer la mission comme terminée : ne plus proposer sa remise, sa recherche ou sa récompense.
- [x] Permettre immédiatement des conversations normales avec Oussama et les autres personnes après cette conclusion.
- [x] Adapter les paroles d’Amélia et des personnes déjà rencontrées à leur souvenir du joueur et à la fin de la mission, sans les enfermer dans un remerciement ou un rappel de quête permanent.
- [x] Ne proposer les questions et indices propres à la recherche d’Oussama que lorsque cette quête a été acceptée et reste active.
- [x] Si la mission n’a pas été commencée ou a été refusée, conserver les conversations ordinaires sans afficher ses branches de quête.

## 6. Retirer réellement les objets remis de l’inventaire

- [x] Vérifier et corriger si nécessaire la disparition effective du papier de l’inventaire dès sa remise à Oussama, aussi bien dans les données que dans les cases affichées avec **I**.
- [x] Appliquer la même règle aux objets remis dans les prochaines quêtes, notamment à la liste de participants de la seconde mission.
- [x] Consommer uniquement l’objet concerné : remettre le papier ne doit pas supprimer la liste, et remettre la liste ne doit pas supprimer le papier d’une première quête encore active.
- [x] Empêcher toute remise multiple, duplication d’objet ou attribution répétée d’une récompense.

## 7. Seconde quête — Activation de la carte et participants à la soirée

### A. Rencontre dans le bureau

- [x] Le joueur entre dans le bureau entouré en orange et parle avec la personne qui y travaille.
- [x] Prévoir un échange où le joueur demande l’activation de sa carte étudiante, avec une réponse et un déroulement naturels.
- [x] Au cours de cette rencontre, la personne propose une mission : aller au foyer demander à toutes les personnes présentes si elles participeront à la soirée après les cours.
- [x] Proposer explicitement d’accepter ou de refuser la mission, en français. La demande d’activation de la carte ne doit pas accepter silencieusement cette quête.
- [x] En cas de refus, ne pas démarrer la mission, ne pas créer sa liste et ne pas activer ses questions auprès des personnes du foyer ; permettre de revenir accepter plus tard.
- [x] Après acceptation seulement, ajouter la mission et ses objectifs au journal accessible avec **P**, et la liste de collecte à l’inventaire accessible avec **I**.

### B. Interroger toutes les personnes du foyer

- [x] Inclure toutes les personnes présentes dans le foyer, y compris le barman et les personnes assises sur les canapés.
- [x] Proposer le sujet de la soirée uniquement lorsque cette quête a été acceptée et reste active ; il doit pouvoir coexister avec les sujets d’autres missions.
- [x] Écrire des échanges différents pour chaque personne : certaines acceptent, d’autres refusent, certaines posent des questions ou discutent davantage de la soirée avant de répondre.
- [x] Adapter le début de l’échange selon que le joueur connaît déjà la personne ou se présente pour la première fois.
- [x] Enregistrer une réponse par personne ; reparler à quelqu’un ne doit pas augmenter artificiellement le nombre de personnes interrogées ni dupliquer son nom.
- [x] Ajouter à la liste remise à l’organisateur uniquement les noms des personnes qui ont répondu oui.
- [x] Conserver également le suivi des réponses négatives pour savoir que toutes les personnes ont bien été interrogées.
- [x] Mettre à jour le journal avec les personnes déjà consultées, celles qui restent à voir et la progression totale.
- [x] Permettre de consulter les noms des personnes ayant accepté, depuis l’objet de liste ou le détail de la quête.

### C. Retour au bureau et conclusion

- [x] Lorsque toutes les personnes du foyer ont répondu, indiquer au joueur qu’il peut retourner voir la personne du bureau.
- [x] Avant cela, proposer un dialogue de suivi indiquant les réponses manquantes, sans permettre de terminer prématurément la mission.
- [x] Au retour, permettre de remettre la liste contenant tous les noms des personnes qui ont accepté de participer.
- [x] Retirer la liste de l’inventaire après sa remise et marquer cette seconde quête comme terminée dans le journal.
- [x] Prévoir un échange final cohérent avec les réponses recueillies et une récompense de quête attribuée une seule fois, selon le principe de la première mission.
- [x] Après la conclusion, permettre des conversations ordinaires avec la personne du bureau et les personnes du foyer, sans reproposer la collecte ou la remise de la liste.

## 8. Permettre les deux quêtes en parallèle, sans interférences

- [x] Donner à chaque quête son propre état, ses objectifs, ses objets, ses réponses enregistrées et son état de récompense.
- [x] Permettre d’accepter et de progresser dans les deux missions en même temps, dans l’ordre choisi par le joueur, sans obligation de terminer le papier avant de commencer la soirée.
- [x] Lorsqu’une personne peut aider pour les deux missions, proposer les sujets disponibles dans le dialogue : par exemple demander où trouver Oussama et poser la question de la soirée, sans qu’un sujet masque l’autre.
- [x] Afficher les deux missions dans le journal **P** avec leur progression respective ; pouvoir consulter chacune séparément.
- [x] Afficher simultanément le papier et la liste dans des cases distinctes de l’inventaire **I** lorsque les deux objets sont possédés.
- [x] Ne jamais faire apparaître un sujet propre à une quête non acceptée, refusée ou déjà terminée.
- [x] Terminer l’une des quêtes sans effacer, terminer, bloquer ou réinitialiser l’autre, ni perdre les souvenirs des conversations déjà tenues.
- [x] Gérer les retours vers les personnages après une interruption de dialogue ou un changement de pièce sans perte de progression ni double validation.

## 9. Ordre de réalisation et critères de validation

1. Déplacer les distributeurs et aménager le bureau selon la capture annotée.
2. Corriger l’affichage des deux personnes assises et vérifier les passages.
3. Prévoir les états séparés des quêtes, la gestion des objets et la mémoire des rencontres.
4. Réécrire les conversations variées en français, avec des branches conditionnées par les missions actives.
5. Corriger la conclusion du papier, puis ajouter le parcours complet de la soirée.
6. Vérifier les cas ci-dessous dans le jeu.

- [x] Distributeurs au nouvel emplacement ; bureau meublé et accessible ; deux personnes du canapé correctement visibles et interactives.
- [x] Chaque personne a des conversations distinctes et reconnaît le joueur après une première rencontre.
- [x] Avant acceptation d’une quête : aucun objet, objectif actif ou dialogue réservé à celle-ci.
- [x] Refus puis acceptation ultérieure possibles pour chacune des deux missions.
- [x] Papier remis à Oussama : objet retiré immédiatement, quête terminée, récompense unique et conversations ordinaires disponibles.
- [x] Soirée : toutes les personnes du foyer sont interrogées une seule fois dans le suivi ; réponses variées ; seuls les oui apparaissent sur la liste finale.
- [x] Liste incomplète : remise finale indisponible ; liste complète : remise possible, objet retiré et récompense unique.
- [x] Deux quêtes actives ensemble : les sujets de dialogue et les deux objets restent disponibles sans se remplacer.
- [x] Terminer le papier avant la soirée, puis vérifier le scénario inverse ; dans les deux cas, l’autre mission reste intacte.
- [x] Après les deux quêtes : aucune action de remise résiduelle et possibilité de discussions normales avec tous les personnages.
- [x] Vérifier le journal **P**, l’inventaire **I**, les collisions du mobilier, les affichages et l’intégralité des textes en français.

## 10. Livraison et vérifications

- Bureau de Nadia : porte à gauche de l’ascenseur. Demander l’activation de la carte, puis accepter ou refuser la mission de soirée.
- Les sept personnes du foyer ont des salutations et des échanges distincts. Les retrouvailles tiennent compte des rencontres précédentes pendant la session Aventure.
- Réponses de soirée : Karim, Lina, Mehdi et Sarah acceptent ; Alex, Adam et Jules refusent avec des raisons différentes.
- Deux quêtes simultanées : deux onglets dans **P**, deux objets distincts dans **I**, et un retrait indépendant de chaque objet lors de sa remise.
- Récompenses uniques : 10 points pour le papier, 15 pour la liste complète.
- Contrôles réussis : `npm run build`, `npm run test:rdc`, `npm run test:campus`, `npm run test:campus:browser` et `npm run test:campus:browser -- --party-first`.
- Captures : [distributeurs](docs/campus-previews/distributeurs.png), [bureau](docs/campus-previews/bureau.png), [foyer](docs/campus-previews/foyer.png), [conversation](docs/campus-previews/conversation.png) et [quêtes terminées](docs/campus-previews/quete-terminee.png).
- La mémoire et les quêtes durent pendant la session Aventure ; quitter cette vue ou recharger recommence la partie.
