# Données fictives de démonstration

Ces exemples ont été inventés à la demande de l’utilisateur. Ils ne décrivent pas les équipements, capacités ou horaires réels de l’ensIIE.

Activation : **Favoris et réglages → Utiliser des exemples fictifs de démonstration**. Le réglage est désactivé par défaut et partagé entre plan et immersion. Le désactiver restitue immédiatement les valeurs originales. Aucune fiche source ni export de l’éditeur n’est modifié.

## Valeurs inventées

- **RDC-011** : capacité 6 ; deux imprimantes et un scanner ; lundi–vendredi 09:00–17:00.
- **RDC-028** : capacité 30 ; tables conviviales et micro-ondes ; lundi–vendredi 08:00–19:00.
- **RDC-Amphi002** : capacité 120 ; vidéoprojecteur et microphones ; accès sur réservation.
- **R+1-121** : capacité 24 ; 24 postes et tableau ; lundi–vendredi 08:00–18:00.
- **R+1-127** : capacité 12 ; postes de recherche et écran partagé ; accès sur autorisation.
- **R+2-216** : capacité 10 ; visioconférence et table de réunion ; accès sur rendez-vous.

Les libellés portent « DEMO ». Les fiches concernées affichent un avertissement et ne sont jamais marquées vérifiées par cette couche. Les exports de visite signalent également la fiction.

Aucune porte, liaison d’escalier, accessibilité physique, photo, ressource officielle ou information personnelle n’a été inventée. Les horaires sont de simples textes de démonstration : ils ne déclenchent pas de statut « ouvert maintenant ».

Source du jeu d’exemples : `src/demoRooms.js`.


## Journée simulée — 16 octobre 2026

Indépendante du réglage de fiches Démo, la vue **Simulation** annonce toujours sa fiction. Les périodes suivantes sont entièrement inventées : 08:00–09:00 arrivées/orientation ; 09:00–12:00 cours/travail encadré ; 12:00–14:00 pause/vie étudiante ; 14:00–17:00 projets/échanges ; 17:00–18:00 fin de journée.

Quatre agents synthétiques sont créés par trajet calculé disponible, avec des décalages et allers-retours illustratifs ; trois paires de salles sont proposées (RDC-011/028, RDC-003/Amphi002, R+1-131/148). Une paire impossible est exclue, pas remplacée par une ligne arbitraire. Les groupes, couleurs, rythmes et vitesses de 5/15/30 minutes fictives par seconde sont inventés. Aucune salle n’est déclarée occupée, aucune capacité réelle ni plage de présence n’est déduite. La simulation ne déplace pas le personnage ni la destination du Guide. Source : `src/simulation.js` et `src/components/SimulationView.jsx`.
