# Ressources ENSIIE pour enrichir le jumeau numérique

Collecte du **16 octobre 2026** (Europe/Paris). Document de travail destiné à l’équipe de développement. Les fiches sont rédigées en français avec un intitulé anglais pour préparer l’interface bilingue.

## 1. Ce que cette collecte apporte au projet

Le sujet `jumeau_numerique_ensIIE.md` demande de découvrir l’école, se repérer et identifier les services, en reliant les espaces à l’enseignement, la recherche, la vie étudiante et les entreprises. `steps.md` prévoit déjà des profils Étudiant, Visiteur et Entreprise, une recherche par besoin et des liens de ressources.

Pour les personnes extérieures, la meilleure extension est un **annuaire de besoins relié aux lieux** : « Je viens à un rendez-vous », « Je veux candidater », « Je cherche un interlocuteur », « Je souhaite recruter », « Je découvre les associations ». Les portails étudiants restent utiles, mais doivent annoncer leurs conditions d’accès avant le clic.

Au moment de la collecte, `public/data/resources.json` ne contenait que le site officiel et une note de validation. Ce document fournit **46 fiches candidates** pour son enrichissement, ainsi que des contacts, des indications de lieux et des exemples d’actualités. La collecte initiale ne modifiait aucun fichier de l’application. Voir le suivi d’intégration ci-dessous.

### Priorités proposées

- **P0 — première intégration** : contact général, admissions, logement, RI, scolarité, stages/JobTeaser, Moodle/Aurion/helpdesk, associations, Dièse, recrutement et accompagnement.
- **P1 — deuxième intégration** : laboratoires, alumni, entrepreneuriat, dépannage, DD&RS et documents de mobilité.
- **P2 — enrichissement** : outils associatifs, doctorat et événements.

Ces priorités et les usages d’interface sont des propositions de conception, pas des informations publiées par l’école.

## 2. Périmètre réel et méthode

### Sources projet lues

- `jumeau_numerique_ensIIE.md` : énoncé et limites des données de plans.
- `steps.md` : contexte, utilisateurs et contraintes.
- `prompt-agent-frontend.md` : absence de faits inventés et vérification des usages.
- `public/data/resources.json` et les pièces pertinentes de `public/data/rooms.json`.

### Web

Recherche internet, consultation des rubriques officielles ENSIIE et suivi des liens vers les ressources associatives, professionnelles et ministérielles pertinentes. Chaque fiche indique son lien et son niveau de vérification. Une page consultée confirme son contenu au moment de la collecte ; elle ne prouve ni l’actualité de tous ses champs ni la disponibilité après authentification.

Les pages d’accueil protégées ont été ouvertes sans authentification. Aurion, Moodle, la plaquette BdE et status.iiens.net n’étaient pas consultables avec l’outil : **cela n’est pas un diagnostic de panne pour leurs utilisateurs**. Les services cités seulement par email restent explicitement identifiés comme tels.

### Messagerie

- Dossiers disponibles : **INBOX, Sent, Drafts**.
- **1 345 messages reçus**, **25 envoyés**, **1 brouillon** : **1 371 messages au total**.
- Métadonnées de tous les messages inventoriées ; corps texte/HTML de tous ces messages récupérés et passés au crible pour les liens et thèmes utiles. Le contenu de la boîte reçue s’étend du **4 septembre 2025 au 15 octobre 2026**.
- Recherche paginée par dates, avec reprise des jours de frontière et déduplication par UID : **1 345 UID INBOX distincts**. Les deux lots dépassant la limite de réponse ont été relus en plus petits lots ; aucun échec de récupération restant.
- Lecture avec `markSeen: false` ; aucun envoi, déplacement ou suppression.
- Les pièces jointes ont été **inventoriées par leurs métadonnées**, mais **pas téléchargées ni lues**. Une offre ou une consigne uniquement en pièce jointe peut donc contenir d’autres informations.
- Les messages envoyés et le brouillon n’ont pas fourni de ressource générale supplémentaire retenue. Les échanges individuels, résultats, justificatifs et candidatures personnelles sont exclus de ce document.

Il s’agit d’une sélection utile au projet, pas d’un export de la messagerie. Les URL de suivi, pixels, désinscription, formulaires personnels avec jetons, invitations de visioconférence et documents nominatifs n’ont pas été reproduits.

### Légende des fiches

- **public** : contenu d’information public.
- **compte** : portail ou action qui nécessite normalement une authentification.
- **mixte** : site public avec espaces réservés.
- **associatif** : ressource de la communauté étudiante ; accès variable.
- **institutionnel-email** : information attestée dans une communication de l’école, sans recoupement public dans cette collecte.
- Une référence **E1305** désigne un message du dossier INBOX, UID 1305. Le registre en fin de fichier permet de le retrouver par objet et date. Ces références sont destinées à l’équipe, pas à l’interface publique.
- Les fiches issues seulement d’emails sont des candidates à validation éditoriale avant diffusion au grand public.

## 3. Catalogue des ressources

### 3.1 Visiter, découvrir et candidater

#### V01 — Accueil et découverte / Visit the school

- **Lien** : [Accueil et découverte](https://www.ensiie.fr/)
- **Public / accès / priorité** : visiteur, candidat, famille · public · P0.
- **Information utile** : École publique centrée sur l’informatique, les mathématiques appliquées et l’entreprise. Présenter les quatre activités du jumeau : enseignement, recherche, vie étudiante, entreprises.
- **Preuve** : Page d’accueil consultée.
- **Usage dans l’app (proposition)** : Carte « Découvrir l’école » et départ de visite.
- **Vérification / limite** : Ne pas reprendre les statistiques commerciales sans millésime.

#### V02 — Contacter un service / Contact a department

- **Lien** : [Contacter un service](https://www.ensiie.fr/contact)
- **Public / accès / priorité** : tous · public · P0.
- **Information utile** : Formulaire officiel permettant de sélectionner un destinataire et d’expliquer sa demande.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Bouton transversal « Je ne sais pas qui contacter ».
- **Vérification / limite** : Le formulaire nécessite JavaScript ; ne pas prétendre avoir envoyé une demande.

#### V03 — Admissions / Apply

- **Lien** : [Admissions](https://www.ensiie.fr/formation/concours-et-admission)
- **Public / accès / priorité** : candidat, famille · public · P0.
- **Information utile** : Entrées concours Mines-Télécom et admissions sur titres ; renvoyer vers les modalités de la campagne pertinente.
- **Preuve** : Page consultée ; FAQ officielle.
- **Usage dans l’app (proposition)** : Parcours candidat/JPO : découvrir, formation, candidature, contact.
- **Vérification / limite** : Ne pas afficher « inscriptions ouvertes » en permanence ; dates annuelles à relire.

#### V04 — Formations / Programmes

- **Lien** : [Formations](https://www.ensiie.fr/formation)
- **Public / accès / priorité** : candidat, entreprise · public · P1.
- **Information utile** : Point d’entrée formations et stages.
- **Preuve** : Page repérée dans la recherche officielle.
- **Usage dans l’app (proposition)** : Relier les espaces pédagogiques aux formations, sans attribuer un parcours à une salle sans preuve.
- **Vérification / limite** : Brochures de la FAQ parfois millésimées 2025-2026.

#### V05 — FAQ de l’école / School FAQ

- **Lien** : [FAQ de l’école](https://www.ensiie.fr/faq)
- **Public / accès / priorité** : nouvel arrivant, candidat · public · P0.
- **Information utile** : Questions sur intégration, logement, mobilité, cursus et admissions. Contact admissions publié : concours@listes.ensiie.fr.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Recherche par besoin : admission, logement, diplôme, international.
- **Vérification / limite** : La FAQ contient des montants et anciens liens annuels : utiliser les pages de campagne pour les chiffres.

### 3.2 Stages, conventions et carrière

#### S01 — Trouver un stage / Find an internship

- **Lien** : [Trouver un stage](https://ensiie-evry.jobteaser.com/)
- **Public / accès / priorité** : étudiant · compte · P0.
- **Information utile** : Career Center ENSIIE : offres de stage, alternance, emploi, événements et préparation aux candidatures. L’email demande une inscription avec l’adresse @ensiie.eu via ce portail pour accéder aux offres réservées.
- **Preuve** : E1305 ; page de connexion ENSIIE consultée ; page entreprises officielle.
- **Usage dans l’app (proposition)** : Carte carrière avec badge « Compte requis », distincte de la gestion des conventions.
- **Vérification / limite** : Conserver cette URL stable, pas l’URL OAuth de redirection ni les liens suivis des newsletters.

#### S02 — Comprendre les stages / Internship guide

- **Lien** : [Comprendre les stages](https://stages.ensiie.fr/docs/)
- **Public / accès / priorité** : étudiant, tuteur, entreprise · public · P0.
- **Information utile** : Documentation centrale : conventions, rédaction du sujet, contacts, livret, validation, rapports et soutenances.
- **Preuve** : Page consultée ; E1261.
- **Usage dans l’app (proposition)** : Hub « Mon stage » avec étapes et raccourcis.
- **Vérification / limite** : Distinguer consignes permanentes et campagne annuelle.

#### S03 — Demander une convention / Request an agreement

- **Lien** : [Demander une convention](https://stages.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P0.
- **Information utile** : Interface de demande de convention. La documentation décrit demande, validations pédagogique et administrative, tuteur, édition et signature.
- **Preuve** : Documentation officielle generalites_convention.html ; notifications de stage repérées.
- **Usage dans l’app (proposition)** : Bouton « Créer/suivre ma convention » dans le hub stages.
- **Vérification / limite** : Ne jamais exposer de convention personnelle ou identifiant de dossier.

#### S04 — Questions sur une convention / Agreement help

- **Lien** : [Questions sur une convention](https://stages.ensiie.fr/docs/generalites_convention.html)
- **Public / accès / priorité** : étudiant, entreprise · public · P0.
- **Information utile** : Procédure et contacts selon l’année ; cas bicursus à orienter vers le correspondant master. La page conseille de prévoir trois semaines pour la procédure.
- **Preuve** : Page consultée ; E458.
- **Usage dans l’app (proposition)** : FAQ « Qui valide ? », « À qui écrire ? », « Je suis en bicursus ».
- **Vérification / limite** : Le délai est indicatif, aucune garantie de traitement. La page utilise aussi des alias sans listes. ; conserver les alias exacts de chaque source.

#### S05 — Valider le stage / Complete your internship

- **Lien** : [Valider le stage](https://stages.ensiie.fr/docs/validation_stage.html)
- **Public / accès / priorité** : étudiant, maître de stage · public · P0.
- **Information utile** : Documents de validation, rapport et soutenance. Le mail de septembre 2026 donne des consignes spécifiques 1A/2A et le dépôt exam.
- **Preuve** : Page consultée ; E1261.
- **Usage dans l’app (proposition)** : Checklist avec documents et lien dépôt, chaque règle rattachée à son année.
- **Vérification / limite** : La date de rendu du 10 septembre 2026 est passée ; ne pas la réutiliser en 2027.

#### S06 — Dépôt des travaux / Submit coursework

- **Lien** : [Dépôt des travaux](https://exam.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P1.
- **Information utile** : Serveur de dépôt cité pour les rapports de stage 1A/2A 2026 et d’autres travaux.
- **Preuve** : E1261 ; E1066/E1069.
- **Usage dans l’app (proposition)** : Raccourci étudiant ; préciser de vérifier le dépôt demandé par l’enseignant.
- **Vérification / limite** : URL attestée par email ; pas de session authentifiée testée. Le format tar.gz est une consigne 2026, pas une règle universelle.

#### S07 — Dépanner l’application stages / Troubleshoot

- **Lien** : [Dépanner l’application stages](https://stages.ensiie.fr/docs/faq-appli.html)
- **Public / accès / priorité** : étudiant · public · P1.
- **Information utile** : La FAQ explique les inscriptions pédagogiques Aurion, coordonnées et saisie des établissements ; elle renvoie au helpdesk pour certaines anomalies.
- **Preuve** : Page officielle consultée via recherche.
- **Usage dans l’app (proposition)** : Aide contextuelle avant de contacter un service.
- **Vérification / limite** : Ne pas proposer de contourner une validation.

### 3.3 Entreprises, projets et alumni

#### C01 — Déposer une offre / Recruit students

- **Lien** : [Déposer une offre](https://www.ensiie.fr/entreprise/deposer-une-offre-de-stage)
- **Public / accès / priorité** : entreprise, recruteur · public · P0.
- **Information utile** : Page officielle pour transmettre des offres via JobTeaser, avec ressources stages.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Action principale du profil Entreprise : « Proposer un stage / emploi ».
- **Vérification / limite** : Le dépôt lui-même peut demander un compte employeur ; ne pas envoyer l’entreprise dans le parcours étudiant.

#### C02 — Partenariats / Become a partner

- **Lien** : [Partenariats](https://www.ensiie.fr/entreprise/devenir-partenaire)
- **Public / accès / priorité** : entreprise · public · P0.
- **Information utile** : Entrée officielle pour les relations avec les entreprises ; contact institutionnel récurrent : com_re@listes.ensiie.fr.
- **Preuve** : Page consultée ; E1300 ; page Reveal Week.
- **Usage dans l’app (proposition)** : Carte « Collaborer avec l’école » ; lien contact depuis le parcours entreprises.
- **Vérification / limite** : Localisation du service à confirmer avant itinéraire.

#### C03 — Dièse Junior Conseil / Student consulting

- **Lien** : [Dièse Junior Conseil](https://www.diese.org/)
- **Public / accès / priorité** : entreprise, association, étudiant · public · P0.
- **Information utile** : Prestations numériques par les étudiants : IA, développement, digitalisation et sécurité. L’école référence Dièse dans sa rubrique entreprises.
- **Preuve** : Site Dièse et page ENSIIE consultés ; E213/E197.
- **Usage dans l’app (proposition)** : Action « Faire réaliser un projet » et fiche découverte Dièse.
- **Vérification / limite** : Ne pas publier les numéros personnels ni les formulaires internes de compétences issus des emails.

#### C04 — C-19 et entrepreneuriat / Innovation

- **Lien** : [C-19 et entrepreneuriat](https://www.ensiie.fr/entreprise/entrepreneuriat)
- **Public / accès / priorité** : entreprise, porteur de projet, visiteur · public · P1.
- **Information utile** : La page présente C-19, ses équipements numériques, des espaces de travail et l’accompagnement entrepreneurial ; elle référence IMT Starter.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Étape de visite « Innover » reliée aux activités recherche/entreprises.
- **Vérification / limite** : Équipements décrits au niveau de l’espace ; aucune pièce précise ni disponibilité publique déduite.

#### C05 — IMT Starter / Startup support

- **Lien** : [IMT Starter](https://www.imt-starter.fr/)
- **Public / accès / priorité** : étudiant entrepreneur, entreprise · public · P1.
- **Information utile** : Incubateur commun aux écoles partenaires, référencé par ENSIIE ; les emails annoncent portes ouvertes et Start-up Shaker.
- **Preuve** : Page entrepreneuriat ENSIIE ; E30/E580/E445.
- **Usage dans l’app (proposition)** : Lien d’accompagnement et événements entrepreneuriaux.
- **Vérification / limite** : Site référencé, contenu direct non vérifié pendant cette collecte ; anciennes dates à archiver.

#### C06 — Challenge Projets d’Entreprendre / Entrepreneurship challenge

- **Lien** : [Challenge Projets d’Entreprendre](https://challenges.imt-bs.eu/)
- **Public / accès / priorité** : étudiant · compte · P2.
- **Information utile** : Plateforme citée pour trouver une équipe et accéder aux informations du Challenge.
- **Preuve** : E30 ; présentation du Challenge sur la page entrepreneuriat ENSIIE.
- **Usage dans l’app (proposition)** : Rubrique projets/entrepreneuriat.
- **Vérification / limite** : Email de campagne 2025 ; vérifier la plateforme de la prochaine édition.

#### C07 — Formation tout au long de la vie / Lifelong learning

- **Lien** : [Formation tout au long de la vie](https://www.ensiie.fr/entreprise)
- **Public / accès / priorité** : professionnel, entreprise · public · P1.
- **Information utile** : Le menu entreprises référence la FTLV. Contact communiqué dans la newsletter septembre 2026 : formationtlv@ensiie.fr.
- **Preuve** : Page entreprises ; E1300.
- **Usage dans l’app (proposition)** : Action « Former mes équipes / me reconvertir ».
- **Vérification / limite** : Le lien FTLV n’a pas pu être ouvert par l’outil ; garder l’entrée entreprises en repli.

#### C08 — Réseau alumni / Alumni network

- **Lien** : [Réseau alumni](https://ensiie-alumni.org/en)
- **Public / accès / priorité** : étudiant, diplômé, recruteur · mixte · P1.
- **Information utile** : Le site historique a3ie.org redirige vers ENSIIE Alumni ; rubrique carrière et réseau. Le groupe LinkedIn est ouvert aux étudiants selon les emails.
- **Preuve** : Site consulté ; E259/E361.
- **Usage dans l’app (proposition)** : Réseau et recherche de contacts professionnels.
- **Vérification / limite** : Lien complémentaire : https://www.linkedin.com/groups/1037/ ; accès groupe non testé.

### 3.4 International

#### I01 — Venir étudier / Incoming students

- **Lien** : [Venir étudier](https://www.ensiie.fr/international/venir-etudier-lensiie)
- **Public / accès / priorité** : étudiant international, famille · public · P0.
- **Information utile** : Guide de mobilité entrante et contacts pédagogiques/administratifs. Le bureau des RI n°221 est publié ; la page indique les langues d’accueil.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Parcours « I’m new here » : RI, logement, scolarité, vie étudiante.
- **Vérification / limite** : Lien candidat de pièce : R+2-221 ; confirmer sur place. Les horaires publiés 8h30–17h ne prouvent pas une permanence sans rendez-vous.

#### I02 — Partir à l’étranger / Study abroad

- **Lien** : [Partir à l’étranger](https://www.ensiie.fr/international/mobilite-internationale)
- **Public / accès / priorité** : étudiant · public · P0.
- **Information utile** : Échanges, stages, doubles diplômes et aides ; contact rel-int@listes.ensiie.fr. La page propose des aides 2026-2027.
- **Preuve** : Page consultée ; E74/E458.
- **Usage dans l’app (proposition)** : Fiche RI et lien aides ; recherche « Erasmus », « bourse », « mobilité ».
- **Vérification / limite** : Montants et critères à lire dans la campagne courante plutôt que les copier dans l’app.

#### I03 — Universités partenaires / Partner universities

- **Lien** : [Universités partenaires](https://www.ensiie.fr/international/universites-partenaires)
- **Public / accès / priorité** : candidat, étudiant international · public · P1.
- **Information utile** : Liste organisée par pays avec types de partenariats et parcours concernés.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Exploration des possibilités internationales.
- **Vérification / limite** : Ne pas transformer un partenariat listé en garantie d’admission.

#### I04 — Documents de mobilité / Mobility documents

- **Lien** : [Documents de mobilité](https://aurionweb.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P1.
- **Information utile** : WebAurion → Documents → Relations Internationales → Aides à la mobilité ; les décisions de commission sont également annoncées dans Documents.
- **Preuve** : E74/E62.
- **Usage dans l’app (proposition)** : Instructions de navigation textuelles après ouverture du portail.
- **Vérification / limite** : Campagne historique 2025/2026 ; aucun PV nominatif ni document personnel à intégrer.

### 3.5 Vie étudiante et accompagnement

#### L01 — Trouver un logement / Housing

- **Lien** : [Trouver un logement](https://www.ensiie.fr/vie-etudiante/logements)
- **Public / accès / priorité** : nouvel étudiant, international, famille · public · P0.
- **Information utile** : Solutions de logement et circuits de demande. Pour le contingent école, l’adresse publiée est logements@listes.ensiie.fr ; pour le DSE, la page renvoie vers MesServices étudiant.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Carte « Se loger » dans l’accueil des nouveaux arrivants.
- **Vérification / limite** : Pas de promesse de place ni de loyer garanti ; vérifier disponibilité auprès des gestionnaires.

#### L02 — ResIIE / Student housing help

- **Lien** : [ResIIE](https://resiie.iiens.net/)
- **Public / accès / priorité** : étudiant · associatif · P1.
- **Information utile** : Association d’accompagnement logement explicitement recommandée sur la page ENSIIE.
- **Preuve** : Page logements ENSIIE.
- **Usage dans l’app (proposition)** : Contact complémentaire au service logement.
- **Vérification / limite** : Site référencé par l’école, non ouvert directement pendant la collecte.

#### L03 — Associations / Student societies

- **Lien** : [Associations](https://www.ensiie.fr/vie-etudiante/vie-associative)
- **Public / accès / priorité** : visiteur, nouvel étudiant · public · P0.
- **Information utile** : Présentation de la vie associative : sport, musique, jeux, culture, solidarité, robotique et réalité virtuelle ; lien BdE.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Découverte par centres d’intérêt et future liaison aux locaux associatifs.
- **Vérification / limite** : Présence d’une association ne suffit pas à déduire son local, ses horaires ou son bureau actuel.

#### L04 — BdE et annuaire des associations / Student union

- **Lien** : [BdE et annuaire des associations](https://bde.iiens.net/plaquette)
- **Public / accès / priorité** : étudiant · associatif · P0.
- **Information utile** : Annuaire recommandé dans la newsletter de rentrée. Portail BdE : https://bde.iiens.net/ ; lien Discord stable : https://bde.iiens.net/discord.
- **Preuve** : E1297 ; page vie associative ENSIIE.
- **Usage dans l’app (proposition)** : Catalogue des associations ; liens « Découvrir / Rejoindre ».
- **Vérification / limite** : Accès direct à la plaquette non vérifiable avec l’outil ; ne pas conserver les invitations Discord temporaires.

#### L05 — Portail IIEns / Student portal

- **Lien** : [Portail IIEns](https://iiens.net/)
- **Public / accès / priorité** : étudiant · compte · P1.
- **Information utile** : Portail communautaire et ressources étudiantes gérés par ARISE, cité dans les emails.
- **Preuve** : E1297/E1199/E1298.
- **Usage dans l’app (proposition)** : Distinguer portail associatif et services administratifs officiels.
- **Vérification / limite** : Ne pas reprendre les promesses informelles des newsletters comme des règles pédagogiques.

#### L06 — ARISE / Student IT association

- **Lien** : [ARISE](https://iiens.net/)
- **Public / accès / priorité** : étudiant · associatif · P1.
- **Information utile** : ARISE présente les services et la formation informatique d’accueil ; contact associatif : arise@iiens.net.
- **Preuve** : E1199/E24.
- **Usage dans l’app (proposition)** : Fiche association + aide numérique étudiant.
- **Vérification / limite** : La réunion en salle 139 en septembre 2025 ne prouve pas que 139 est le local permanent d’ARISE.

#### L07 — État des services ARISE / Service status

- **Lien** : [État des services ARISE](https://status.iiens.net/)
- **Public / accès / priorité** : étudiant · public · P1.
- **Information utile** : Page d’état annoncée pour les services associatifs.
- **Preuve** : E527.
- **Usage dans l’app (proposition)** : Lien de dépannage depuis les ressources numériques.
- **Vérification / limite** : Accès direct non vérifiable par l’outil ; cela ne démontre pas une panne générale.

#### L08 — Rédaction LaTeX / Collaborative writing

- **Lien** : [Rédaction LaTeX](https://overleaf.iiens.net/)
- **Public / accès / priorité** : étudiant · compte · P2.
- **Information utile** : Service Overleaf associatif annoncé et mentionné pour la rédaction des rapports de stage.
- **Preuve** : E509/E1108.
- **Usage dans l’app (proposition)** : Outils utiles à la rédaction.
- **Vérification / limite** : Disponibilité en direct non testée ; ne pas y importer automatiquement des documents privés.

#### L09 — Outils PDF / PDF tools

- **Lien** : [Outils PDF](https://pdf.iiens.net/)
- **Public / accès / priorité** : étudiant · associatif · P2.
- **Information utile** : Installation BentoPDF annoncée par ARISE dans la newsletter BdE.
- **Preuve** : E509.
- **Usage dans l’app (proposition)** : Ressource de préparation de documents.
- **Vérification / limite** : Service et garanties techniques actuelles à vérifier ; pas de promesse de confidentialité extrapolée.

#### L10 — Solidarité et DD&RS / Sustainability

- **Lien** : [Solidarité et DD&RS](https://www.ensiie.fr/lecole/developpement-durable)
- **Public / accès / priorité** : tous · public · P1.
- **Information utile** : Politique DD&RS, initiatives de campus et newsletters. Contacts emails récurrents : ddrs@listes.ensiie.fr ; ecologiie@listes.iiens.net.
- **Preuve** : Page consultée ; E936/E1156.
- **Usage dans l’app (proposition)** : Filtre solidarité/durable et fiche initiative.
- **Vérification / limite** : E1156 signale une boîte de dons près de l’accueil : emplacement à confirmer avant création du point sur la carte.

#### L11 — Accompagnement et anti-harcèlement / Support

- **Lien** : [Accompagnement et anti-harcèlement](https://www.ensiie.fr/lutte-anti-harcelement)
- **Public / accès / priorité** : étudiant, personnel · public · P0.
- **Information utile** : Page de ressources d’accompagnement, avec partenariat FILIGRANE et organismes locaux.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Lien discret et permanent « Besoin d’aide ».
- **Vérification / limite** : Renvoyer vers la page officielle ; ne pas figer des horaires médicaux anciens ni collecter de témoignages dans ce prototype.

#### L12 — Handicap et aménagements / Accessibility support

- **Lien** : [Handicap et aménagements](https://www.etudiant.gouv.fr/fr/trouvez-le-referent-handicap-de-votre-etablissement-3319)
- **Public / accès / priorité** : visiteur, étudiant · public · P0.
- **Information utile** : L’annuaire ministériel liste dirscol@listes.ensiie.fr pour ENSIIE.
- **Preuve** : Annuaire ministériel consulté via recherche.
- **Usage dans l’app (proposition)** : Contact pour préparer une visite et demander un accompagnement.
- **Vérification / limite** : Ce contact ne valide aucun itinéraire PMR. Accessibilité des portes, ascenseurs et sanitaires à vérifier sur place.

### 3.6 Scolarité et services numériques

#### N01 — Emploi du temps et scolarité / Timetable

- **Lien** : [Emploi du temps et scolarité](https://aurionweb.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P0.
- **Information utile** : WebAurion sert aux documents, inscriptions et emploi du temps. La communication d’alternance rappelle qu’Aurion reste la référence de planning.
- **Preuve** : E1130/E1260/E1266/E363.
- **Usage dans l’app (proposition)** : Boutons « Mon emploi du temps », « Mes documents » dans le profil étudiant.
- **Vérification / limite** : L’ouverture publique a échoué dans l’outil ; pas de test après connexion. Ne pas exposer les notes/absences.

#### N02 — Certificat de scolarité / Enrolment certificate

- **Lien** : [Certificat de scolarité](https://aurionweb.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P0.
- **Information utile** : La notification de validation d’inscription indique la rubrique « Mes Documents » pour éditer le certificat.
- **Preuve** : E1260 ; E4 confirme le même usage l’année précédente.
- **Usage dans l’app (proposition)** : Résultat de recherche « certificat », « attestation », « inscription ».
- **Vérification / limite** : Disponibilité conditionnée à la validation du dossier ; aucune donnée du dossier personnel n’est reprise.

#### N03 — Moodle / Course materials

- **Lien** : [Moodle](https://cours.ensiie.fr/)
- **Public / accès / priorité** : étudiant · compte · P0.
- **Information utile** : Moodle avec connexion CAS, utilisé pour l’inscription aux projets du hackathon.
- **Preuve** : E1339.
- **Usage dans l’app (proposition)** : Raccourci « Cours / Moodle ».
- **Vérification / limite** : URL confirmée par email ; accès direct non vérifiable avec l’outil.

#### N04 — Assistance informatique / IT helpdesk

- **Lien** : [Assistance informatique](https://helpdesk.ensiie.fr/)
- **Public / accès / priorité** : étudiant, personnel · compte · P0.
- **Information utile** : Outil de tickets, également référencé dans la FAQ officielle de l’application stages.
- **Preuve** : Page de connexion consultée ; FAQ stages.
- **Usage dans l’app (proposition)** : Action « Signaler un problème technique ».
- **Vérification / limite** : Distinguer SI de l’école et support des services associatifs ARISE.

#### N05 — Compte et mot de passe / Account recovery

- **Lien** : [Compte et mot de passe](https://ssp.ensiie.fr/)
- **Public / accès / priorité** : étudiant, personnel · compte · P1.
- **Information utile** : Portail de réinitialisation indiqué dans le message de réinscription. https://auth.ensiie.fr/ est le portail d’authentification institutionnel cité dans l’alerte SI.
- **Preuve** : E1130/E16 ; portail auth repéré sur le web.
- **Usage dans l’app (proposition)** : Aide « Je n’arrive pas à me connecter ».
- **Vérification / limite** : Ne pas embarquer de formulaire de mot de passe dans le jumeau.

#### N06 — Signaler un phishing / Report suspicious email

- **Lien** : [Signaler un phishing](mailto:secops@ensiie.fr)
- **Public / accès / priorité** : étudiant, personnel · institutionnel-email · P1.
- **Information utile** : L’équipe SI demande de transmettre les messages suspects à secops@ensiie.fr pour analyse.
- **Preuve** : E15/E16/E1314.
- **Usage dans l’app (proposition)** : Ressource de dépannage et sensibilisation.
- **Vérification / limite** : Alias attesté par emails institutionnels, non recoupé sur page publique.

### 3.7 Recherche

#### R01 — Recherche et laboratoires / Research

- **Lien** : [Recherche et laboratoires](https://www.ensiie.fr/recherche-innovation)
- **Public / accès / priorité** : visiteur, candidat, entreprise · public · P0.
- **Information utile** : Point d’entrée activités de recherche, laboratoires, annuaire et publications.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Visite recherche et recherche par thématique.
- **Vérification / limite** : Une affiliation de chercheur n’implique pas que tout le laboratoire se trouve dans le bâtiment.

#### R02 — Laboratoires associés / Associated laboratories

- **Lien** : [Laboratoires associés](https://www.ensiie.fr/recherche-innovation/les-laboratoires-associes)
- **Public / accès / priorité** : candidat, entreprise · public · P1.
- **Information utile** : La page décrit notamment LaMME, SAMOVAR, IBISC et LISN selon les domaines.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Fiches thématiques reliées à des bureaux uniquement après vérification.
- **Vérification / limite** : La même page conserve aussi une ancienne mention LIMSI : ne pas traiter toutes les mentions historiques comme des affiliations actuelles.

#### R03 — Trouver un enseignant-chercheur / Research directory

- **Lien** : [Trouver un enseignant-chercheur](https://www.ensiie.fr/recherche-innovation/annuaire-des-enseignants-chercheurs)
- **Public / accès / priorité** : visiteur académique, entreprise · public · P1.
- **Information utile** : Annuaire public depuis la rubrique recherche.
- **Preuve** : Page consultée.
- **Usage dans l’app (proposition)** : Contact scientifique et préparation d’un rendez-vous.
- **Vérification / limite** : Pas de localisation de bureau inférée à partir d’un nom.

#### R04 — Découvrir le doctorat et CIFRE / PhD pathways

- **Lien** : [Découvrir le doctorat et CIFRE](https://www.enseignementsup-recherche.gouv.fr/fr/doctorat-51898)
- **Public / accès / priorité** : étudiant, entreprise · public · P2.
- **Information utile** : Le mail recherche recommande les ressources ministérielles doctorat, CIFRE et financement doctoral.
- **Preuve** : E1332.
- **Usage dans l’app (proposition)** : Complément « Après le diplôme » dans le parcours recherche.
- **Vérification / limite** : Liens également cités : https://www.enseignementsup-recherche.gouv.fr/fr/les-cifre-46510 et https://www.enseignementsup-recherche.gouv.fr/fr/le-financement-doctoral-46472 ; pages non ouvertes directement pendant la collecte.

## 4. Contacts à transformer en recherche par besoin

Privilégier les adresses de fonction plutôt que les noms de personnes, susceptibles de changer. Les alias tirés d’emails nécessitent une validation avant publication externe.

- **Scolarité FISE 1A** : `scolarite1@listes.ensiie.fr` — E363, E458.
- **Scolarité FISE 2A** : `scolarite2@listes.ensiie.fr` — E363, E458.
- **Scolarité FISE 3A** : `scolarite3@listes.ensiie.fr` — E363, E458.
- **Stages 1A/2A** : `stages1a2a@listes.ensiie.fr` — E458, E1261.
- **Stages 3A** : `stages3a@listes.ensiie.fr` — E458.
- **Relations internationales** : `rel-int@listes.ensiie.fr` — E458 et [page mobilité](https://www.ensiie.fr/international/mobilite-internationale).
- **Logement** : `logements@listes.ensiie.fr` — [page logements](https://www.ensiie.fr/vie-etudiante/logements).
- **Contrat de professionnalisation, pédagogie** : `dirfip@listes.ensiie.fr` — E458.
- **Contrat de professionnalisation, administration** : `secfip@listes.ensiie.fr` — E458, E1335.
- **Développement / relations entreprises** : `com_re@listes.ensiie.fr` — [Reveal Week officielle](https://www.ensiie.fr/ecole/actualites-et-evenements/inscriptions-reveal-week-semaine-entreprises-2026), E1300.
- **Job Fair 2026** : `forum@ensiie.org` — même page officielle ; ne pas « corriger » le domaine .org en .fr.
- **Admissions** : `concours@listes.ensiie.fr` — [FAQ officielle](https://www.ensiie.fr/faq).
- **Handicap / aménagements** : `dirscol@listes.ensiie.fr` — [annuaire ministériel](https://www.etudiant.gouv.fr/fr/trouvez-le-referent-handicap-de-votre-etablissement-3319).
- **Difficultés de titre de séjour** : même alias dirscol, proposé dans E105 ; orientation vers le service, sans recopier une liste de justificatifs personnels dans le prototype.
- **FTLV** : `formationtlv@ensiie.fr` — E1300.
- **Sécurité informatique** : `secops@ensiie.fr` — E15/E16.
- **ARISE** : `arise@iiens.net` — E1199.
- **DD&RS** : `ddrs@listes.ensiie.fr` ; **EcologIIE** : `ecologiie@listes.iiens.net` — E1156/E936.

La documentation publique stages affiche aussi `stages1a2a@ensiie.fr` et `stages3a@ensiie.fr`. Les emails utilisent les variantes `@listes.ensiie.fr`. Les deux graphies sont sourcées ; leur équivalence technique n’a pas été testée. Voir [contacts stages](https://stages.ensiie.fr/docs/generalites_convention.html).

## 5. Informations de lieux exploitables avec prudence

### Scolarité : bureau 220, candidat R+2-220

- E363 du **19 décembre 2025** annonce une réorganisation par année et place les gestionnaires FISE 1A, 2A et 3A au **bureau 220**.
- E1311 du **29 septembre 2026** indique que les feuilles de présence des contrats de professionnalisation sont disponibles au **bureau 220 de la scolarité**.
- Le fichier `rooms.json` contient `R+2-220`, désigné « Bureau ».
- Proposition : fiche « Scolarité / Student administration », avec les trois alias par année et le lien Aurion.
- **Statut** : localisation attestée par emails, correspondance de numéro avec le plan ; validation sur place encore nécessaire. Ne pas définir `verified_on_site: true`.

### Relations internationales : bureau 221, candidat R+2-221

- La [page de mobilité entrante](https://www.ensiie.fr/international/venir-etudier-lensiie) indique le bureau **221** pour les contacts RI.
- La pièce `R+2-221` existe dans les données.
- Proposition : fiche « International office » avec mobilité entrante/sortante et logement.
- **Statut** : information web publique ; étage déduit du référentiel des pièces, non vérifié physiquement.

### Accueil, hall et Forum du sIIEnext

- E1335 du **9 octobre 2026** situe la Job Fair au **Forum du sIIEnext** et demande aux étudiants de se présenter au **hall d’entrée, RDC**, avant leur créneau.
- La [page publique Reveal Week](https://www.ensiie.fr/ecole/actualites-et-evenements/inscriptions-reveal-week-semaine-entreprises-2026) confirme l’événement ensIIE–sIIEnext, du 12 au 16 octobre 2026.
- Proposition : « J’ai un rendez-vous / Je viens au forum » avec point de rassemblement validé.
- **Statut** : usage événementiel daté. Ne pas déduire qu’un visiteur peut entrer librement ou rejoindre n’importe quel espace sans accompagnement.
- Ne pas attribuer arbitrairement « Forum » à une pièce Cxx ; identification de terrain nécessaire.

### Boîte de dons près de l’accueil

- E1156 du **12 juillet 2026** signale une boîte de collecte de vêtements, objets et fournitures scolaires **à côté de l’accueil**.
- Proposition : point d’intérêt « Donner / Solidarité », lié à EcologIIE et DD&RS.
- **Statut** : fait communiqué par email ; vérifier maintien, position et objets acceptés.

### Lieux du hackathon et noms d’amphithéâtres

- Le sujet fourni identifie **C53 (Platech 1), au sIIEnext**, comme salle de travail ; la pièce `R+2-C53` existe.
- L’amphi **101**, utilisé au lancement, correspond à `R+1-101` dans les données.
- E24 situe une présentation ARISE en **139** ; la pièce `R+1-139` existe. **Ce n’est pas la preuve d’un local associatif permanent.**
- E7 évoque l’amphi **123** pour un accueil en 2025 ; `R+1-123` existe. Ne pas assimiler automatiquement 123 à Cabanes ou Ivan Augé : les emails distinguent des noms d’amphis, sans fournir ici un référentiel complet.

### Données anciennes à ne pas généraliser

E44 du **7 octobre 2025** répartissait la remise des cartes entre bureaux 218, 220 et 221 selon l’alphabet. La réorganisation E363 est plus récente. Ne pas utiliser cette ancienne répartition comme annuaire actuel.

Le BdE rappelle dans E1297 une fermeture à **22 h hors soirées**. C’est une consigne étudiante ; ce n’est ni l’horaire d’accueil du public ni une autorisation d’accès pour les visiteurs.

## 6. Carte étudiante : correction importante pour l’accueil

E1293 du **17 septembre 2026** indique :

- Le renouvellement 2026-2027 passe par une **carte numérique ISIC**, après finalisation de la réinscription.
- Elle **complète la carte physique**.
- La carte physique reste utilisée pour le **contrôle d’accès aux bâtiments**, la **restauration CROUS** et d’autres prestations CROUS.
- Il faut donc conserver sa carte physique pendant la scolarité.
- Le mail prévoyait un circuit alternatif sans application mobile ; la date du 25 septembre 2026 est passée.

Usage proposé : fiche « Ma carte / My student card » dans le parcours nouvel étudiant. Éviter le message trompeur « votre téléphone remplace votre badge d’accès ». La procédure est millésimée et doit être revalidée chaque rentrée.

## 7. Actualités, stages et événements : contenus datés

### 7.1 Reveal Week 2026 : événement en cours à la date de collecte

- **Dates** : 12–16 octobre 2026.
- **Publics** : étudiants et entreprises, avec modalités propres à chaque activité.
- **Lieux** : ensIIE/sIIEnext ; Job Fair au Forum selon E1335.
- **Source publique** : [Reveal Week 2026](https://www.ensiie.fr/ecole/actualites-et-evenements/inscriptions-reveal-week-semaine-entreprises-2026).
- **Sources email** : E1335, E1339, E1300.
- Les liens de programme Pydio existent dans E1335 ; ils n’ont pas été ouverts ni reproduits ici car ce sont des documents de campagne pouvant contenir des consignes internes.
- **App** : agenda avec expiration automatique après l’événement, distinct des fiches permanentes.

### 7.2 Opportunités repérées dans les emails

Ce sont des **pistes à vérifier chez l’émetteur**, pas des offres garanties ouvertes. Ne pas afficher « postuler maintenant » avant vérification de la page de recrutement.

- **Médiateur européen — Java/Web, OMB/T/2027/1** : E1324, 1er octobre 2026. Mail : Strasbourg, début mars 2027, durée 4 à 12 mois, limite annoncée **5 novembre 2026 à 13 h, heure de Bruxelles**. [Annonce officielle citée](https://www.ombudsman.europa.eu/fr/joboffer-document/fr/234273). **Lien non ouvert dans cette collecte** ; vérifier critères et validité avant publication.
- **Naval Group — campagne stages 2027** : E1325, 1er octobre 2026. [Portail candidats cité](https://www.naval-group.com/fr/candidat). Pas de date de clôture générale fournie. Contenu direct non vérifié.
- **Renault — Knowledge Management, Digital Workplace & Data Gouvernance** : E1326, 2 octobre 2026. Mail : Guyancourt, six mois, identifiant **JOBREQ_50279574**. Le lien reçu est un lien de suivi ; rechercher cet identifiant sur le portail officiel avant intégration.
- **Mentorat Entract pour futures ingénieures diplômées en 2027** : E1141, 10 juillet 2026. Accompagnement annoncé d’octobre à décembre, places limitées. Ne pas réutiliser un formulaire de recrutement sans vérifier la campagne ; ressource de veille plutôt que contenu permanent.
- **Stages recherche / logiciel / IA** : plusieurs offres ENSIIE/SAMOVAR et entreprises sont présentes, par exemple E293. Conserver la catégorie « stage en recherche » ; les offres 2025/2026 ne sont pas des opportunités actuelles par défaut.

La valeur durable est le hub JobTeaser, les contacts carrière, le réseau alumni et la procédure de convention. Une éventuelle liste d’offres doit avoir `published_at`, `expires_at`, `last_checked_at` et `status`.

### 7.3 Événement extérieur à venir explicitement annoncé

**Séminaire ESSI — mutations de la publication scientifique** : E1341 du 13 octobre 2026.

- **Date annoncée** : 25 novembre 2026, 14 h 30–16 h 30, accueil à 14 h.
- **Lieu annoncé** : BU d’Évry, salle des Lumières, 2 rue André Lalande.
- **Accès annoncé** : ouvert à toutes et tous, gratuit, inscription obligatoire.
- [Inscription citée dans le mail](https://www.eventbrite.fr/e/seminaire-essi-les-mutations-de-la-publication-scientifique-tickets-2002995469368).
- **État de vérification** : email institutionnel transférant l’annonce ; page de réservation non ouverte.
- **App** : agenda « Autour de l’école » ; lieu extérieur au plan intérieur, pas d’itinéraire artificiel à travers les pièces ENSIIE.

### 7.4 Historique : ne pas annoncer comme prochainement disponible

- Recherche, demi-journée du **14 octobre 2026** : passée à la date de collecte, E1332. Les liens doctorat restent utiles.
- Partners Day du **4 juin 2026**, E968 ; intérêt pour le parcours entreprises, pas pour un agenda futur.
- JPO 2026 : E229/E230 contiennent un correctif de date ; ne pas conserver la première date sans suivre la correction.
- Aides mobilité S4 2026 : échéance de candidature en **novembre 2025**, E74, passée.
- Formations PSSM octobre/novembre **2025**, E32 : ne pas afficher comme sessions 2026.
- Fermeture estivale **27 juillet–23 août 2026**, E1167 : passée ; ne pas l’assimiler aux horaires courants de l’école.

## 8. Parcours concrets proposés pour l’app

### Visiteur et famille

1. « Découvrir l’ENSIIE » : présentation courte → quatre activités → visite.
2. « Préparer ma venue » : adresse + contact de l’hôte + conditions d’accès confirmées.
3. « Je cherche un service » : recherche par besoin → fiche service → contact → itinéraire si localisation vérifiée.
4. « Candidater » : formations → admissions → FAQ/contact.

Adresse institutionnelle récurrente dans les communications : **1 place de la Résistance, 91000 Évry-Courcouronnes** (E1300/E1156). Les signatures postales comportent aussi « 91025 Cedex » : distinguer adresse de visite et adresse postale. Les indications RER trouvées sur le web provenaient notamment d’anciens documents ; vérifier un itinéraire actuel auprès du transporteur avant d’afficher sortie de gare, durée, travaux ou accessibilité.

### Nouvel étudiant et étudiant international

1. « Mes premiers jours » : scolarité → carte physique/numérique → RI/logement → associations.
2. « Mes outils » : Aurion / Moodle / Exam / aide connexion ; badges « compte requis ».
3. « Mon stage » : rechercher → convention → validation → documents/soutenance.
4. « Besoin d’aide » : accompagnement, aménagements, support technique.

### Entreprise et partenaire

1. « Recruter » : dépôt d’offre officiel → Job Fair/relations entreprises.
2. « Faire réaliser un projet » : Dièse.
3. « Innover » : recherche → annuaire → C-19/IMT Starter.
4. « Préparer un rendez-vous » : contact institutionnel puis accueil confirmé.

## 9. Modèle de données recommandé

Garder les pièces, services, ressources et événements comme des entités distinctes. Un service peut avoir plusieurs ressources ; une ressource peut être utile à plusieurs profils et ne pas avoir de salle.

Exemple de fiche à adapter au format du projet :

```json
{
  "id": "career-center",
  "label_fr": "Trouver un stage ou une alternance",
  "label_en": "Find an internship or apprenticeship",
  "href": "https://ensiie-evry.jobteaser.com/",
  "category": "career",
  "audiences": ["student"],
  "access": "account_required",
  "publisher_type": "school_partner",
  "publication_status": "candidate",
  "summary_fr": "Career Center ENSIIE : offres et événements carrière.",
  "summary_en": "ENSIIE Career Center: opportunities and career events.",
  "service_id": "careers",
  "room_id": null,
  "source_refs": ["E1305", "https://www.ensiie.fr/entreprise/deposer-une-offre-de-stage"],
  "last_checked_at": "2026-10-16",
  "verification": {
    "email_evidence": true,
    "public_page_checked": true,
    "authenticated_functionality_tested": false,
    "verified_on_site": false
  },
  "valid_from": null,
  "expires_at": null,
  "keywords_fr": ["stage", "alternance", "emploi", "carriere"],
  "keywords_en": ["internship", "apprenticeship", "job", "career"]
}
```

- Conserver les champs existants `id`, `label_fr`, `label_en`, `href` ; faire évoluer les lecteurs de données avant d’ajouter des champs structurants.
- Ne pas réduire « officiel » à « sous-domaine ENSIIE » : JobTeaser, Dièse et les ressources associatives ont des statuts éditoriaux différents.
- Mettre `room_id: null` en l’absence de rattachement validé. Pour 220/221, conserver d’abord une `candidate_room_id` et l’explication de preuve.
- Déclencher « Itinéraire » seulement après vérification du rattachement au graphe et de l’accès du public concerné.
- Conserver séparément date de l’email, date de consultation et validité du fait.
- Distinguer « horaires d’accueil », « horaires d’accès bâtiment », « présence d’un agent » et « horaire d’un événement ».
- Prévoir les champs bilingues de description, pas seulement de titre.
- N’exporter vers les données publiques que les fiches validées, jamais les messages ni le registre de provenance privée.

### Exemples de recherche par besoin

- « convention », « internship agreement » → S03/S04.
- « stage », « alternance », « emploi », « career » → S01.
- « certificat », « attestation », « enrolment certificate » → N02.
- « emploi du temps », « timetable » → N01.
- « cours », « Moodle » → N03.
- « logement », « housing », « résidence » → L01/L02.
- « Erasmus », « international », « mobilité » → I01/I02.
- « recruter », « proposer un stage », « hire » → C01.
- « projet web », « prestation », « consulting » → C03.
- « association », « sport », « club », « student society » → L03/L04.
- « compte », « connexion », « password » → N04/N05.
- « handicap », « aménagement », « accessibility » → L12.

## 10. Points à valider avant intégration

- Les salles d’accueil, bureaux de services, point visiteurs et entrée autorisée sur place.
- L’itinéraire sans marches, l’état des ascenseurs et les conditions d’accès ; aucune source consultée ne fournit une carte PMR complète.
- Les horaires de l’accueil et de chaque service ; pas de déduction à partir d’une newsletter étudiante.
- Les restaurants, cafétérias, imprimantes, Wi-Fi et salles de travail accessibles aux visiteurs : **pas de référentiel assez précis dans cette collecte**. Le C-19 décrit une cafétéria, ce qui ne prouve pas son ouverture publique.
- La disponibilité des portails privés et les droits des comptes étudiants, personnels et externes.
- Les modalités actuelles du badge/carte et de la réinscription.
- Les liens associatifs, qui peuvent changer de bureau et de campagne.
- Les offres et événements datés, ainsi que les pages officielles qui conservent des informations d’années précédentes.
- L’autorisation éditoriale de publier des consignes connues seulement par email.
- Le maintien de la contrainte du sujet : **plans et dérivés restent dans le cadre du hackathon**, même si le futur public visé inclut des visiteurs extérieurs.

### Informations volontairement exclues

Aucune convention personnelle, note, absence, justificatif, document de séjour, adresse privée, CV, candidature, liste d’étudiants, jeton de formulaire ou mot de passe ne figure ici. Le fichier de stages 2025 annoncé dans E361 est décrit comme non librement diffusable pour certains contacts : ses personnes et coordonnées ne sont pas reprises. Les liens de désinscription et de suivi ne servent pas de liens d’app.

## 11. Registre des emails retenus

Références de travail pour retrouver les messages dans la boîte connectée. Dossier **INBOX**, `UIDVALIDITY = 1756996428`. Les UID sont propres à cette boîte ; ils ne constituent pas des URL publiques. Si le serveur change UIDVALIDITY, retrouver le message par date et objet.

- **E4** — 2025-09-05 — Validation finale de votre dossier d' inscription à l'ensIIE.
- **E7** — 2025-09-15 — Accueil par le directeur de l'ensIIE - mardi 16/09 à 17h50 amphi 123.
- **E15** — 2025-09-23 — Tentatives de phishing en cours.
- **E16** — 2025-09-24 — Re: Tentatives de phishing en cours.
- **E24** — 2025-09-29 — [ARISE] Mardi 30/09 - Présentation de l'association.
- **E30** — 2025-10-02 — Challenge Projets d'Entreprendre : connectez vous sur la plateforme et constituez vos équipes.
- **E32** — 2025-10-03 — Formez-vous aux Premiers Secours en Santé Mentale – deux sessions gratuites à Grand Paris Sud.
- **E39** — 2025-10-06 — Reveal Week | semaine entreprises de l'ensIIE.
- **E44** — 2025-10-07 — Distribution cartes d'étudiant.
- **E56** — 2025-10-13 — INFORMATION IMPORTANTE : Forum Horizons Informatiques du 14 octobre 2025.
- **E62** — 2025-10-14 — PV du 25/09/25 Commission de sélection des demandes de départs à l'étranger - disponible dans Aurion.
- **E74** — 2025-10-16 — APPEL A CANDIDATURE : BOURSES DE MOBILITÉ INTERNATIONALE SÉJOURS D'ÉTUDES S4 2026 OU STAGE DE FIN D'ETUDES.
- **E105** — 2025-10-22 — Difficultés administratives liées au titre de séjour.
- **E197** — 2025-11-13 — Questionnaire Dièse – Vos préférences et compétences.
- **E213** — 2025-11-17 — [#-RECHERCHE] - Migration et sécurisation d'application en PHP.
- **E229** — 2025-11-20 — Save The Date JPO 2026 - 7 fév.
- **E230** — 2025-11-20 — Save The Date JPO 2026 - 17 fév.
- **E259** — 2025-11-27 — groupe ensiie alumin sur linkedin ouvert aux élèves.
- **E293** — 2025-12-02 — 4 offres de stages (3 mois OU 6 mois) ensIIE Samovar - EVRY.
- **E361** — 2025-12-18 — fichier stages entreprises Annee 2025.
- **E363** — 2025-12-19 — Informations concernant le déroulement de la fin du semestre 3.
- **E458** — 2026-02-03 — Fin de mes fonctions à la direction des formations.
- **E509** — 2026-02-23 — [BdE] Newsletter du 23 février 2026.
- **E527** — 2026-03-01 — [BdE] Newsletter du 1er Mars 2026.
- **E564** — 2026-03-09 — Journée de l'orientation : présentations disponibles.
- **E655** — 2026-03-19 — Présentation masters 2 : diapositives disponibles sur WebAurion.
- **E968** — 2026-05-15 — PARTNERS DAY de l’ensIIE - 4 juin 2026 -10h.
- **E1037** — 2026-06-08 — Alternance FISE 3A en contrat de professionnalisation.
- **E1066** — 2026-06-15 — Re: Liste des autorisations Masters en bicursus.
- **E1069** — 2026-06-16 — Re: Liste des autorisations Masters en bicursus.
- **E1108** — 2026-07-01 — [ARISE] Services interrompus ce soir et demain.
- **E1130** — 2026-07-08 — Votre réinscription à l'ensIIE.
- **E1141** — 2026-07-10 — Accompagnement recherche stage de fin d’études.
- **E1156** — 2026-07-12 — Newsletter DDRS - EcologIIE mai et juin 2026.
- **E1167** — 2026-07-16 — Réinscriptions administratives 2026-2027 et fermeture estivale.
- **E1199** — 2026-08-04 — Formation ARISE d'inté.
- **E1260** — 2026-09-04 — Validation finale de votre dossier d' inscription à l'ensIIE.
- **E1261** — 2026-09-04 — Consignes pour les stages 1A/2A.
- **E1266** — 2026-09-07 — Calendrier d'alternance de l'ENSIIE.
- **E1293** — 2026-09-17 — Renouvellement carte d'étudiant pour l'année universitaire 2026-2027.
- **E1297** — 2026-09-21 — [BdE] Newsletter du 21 septembre 2026.
- **E1298** — 2026-09-21 — [ARISE] Changements de Mailing Liste.
- **E1300** — 2026-09-22 — ensIIE Newsletter | Septembre 2026.
- **E1305** — 2026-09-24 — Jobteaser : inscription sur le career center ensIIE.
- **E1311** — 2026-09-29 — Feuilles de présence "contrats de professionnalisation".
- **E1314** — 2026-09-29 — Faux message du directeur général.
- **E1324** — 2026-10-01 — Stage informatique 2027 - Stagiaire développeur Java/Web - Mediateur europeen.
- **E1325** — 2026-10-01 — offres de stage NAVAL GROUP.
- **E1326** — 2026-10-02 — Offre de stage de 6 mois - RENAULT - Ingénieur Knowledge Management, Digital Workplace & Data Gouvernance.
- **E1332** — 2026-10-07 — Research event October 14th 2:00 pm.
- **E1335** — 2026-10-09 — Reveal Week, 12 au 16 octobre.
- **E1336** — 2026-10-09 — Consignes - Projet de fin d'études.
- **E1339** — 2026-10-12 — Hackathon du 15 et 16 octobre (UE JEIH35) : Inscription obligatoire sur Moodle.
- **E1341** — 2026-10-13 — [Invitation] Séminaire ESSI - Publication scientifique : quelles évolutions, quels enjeux pour les chercheurs?.

- **E445** — 2026-01-29 — Start-up Shaker 2026 : pitchs, échanges et rencontres le 2 février ! by IMT Starter.
- **E580** — 2026-03-09 — IMT Starter – 26 mars | E-commerce, SEO & moteurs IA.
- **E936** — 2026-05-07 — Newsletter EcologIIE - DDRS (en français).

### Pièces jointes à approfondir si nécessaire

Métadonnées repérées uniquement ; contenu non analysé :

- E1339 : `Sujets_Hackathon_Oct2026.pdf` — projets du hackathon, dont le sujet du jumeau déjà disponible localement.
- E1336 : `CONSIGNES_PFE_2026_2027.pdf` — consignes PFE ; potentiel complément pour la rubrique alternance, pas de règles déduites de son seul titre.
- E361 : `Stages_1A_2A_2425_v16dec25.xlsx` — historique utile au réseau carrière, à conserver dans son cadre de diffusion ; ne pas importer les personnes dans l’app.

## 12. Suite de travail proposée

1. Valider sur place les services 220/221 et le point d’accueil visiteurs.
2. Intégrer les liens P0 dans un catalogue bilingue, filtrable par profil, avec les badges d’accès.
3. Ajouter les contacts par besoin et le parcours « première visite ».
4. Relier les fiches aux pièces validées et aux quatre activités du projet.
5. Ajouter un agenda seulement avec expiration et responsable de mise à jour.

Ce document est une base de contenu et de traçabilité. Il ne modifie ni les salles ni les parcours existants.



## 13. Première intégration dans l’interface — 16 octobre 2026

Un catalogue de **28 cartes bilingues** sélectionnées dans cette collecte est disponible dans le plan 2D et l’immersion via « Services et ressources ». Certaines fiches documentaires sont regroupées, notamment les usages Aurion emploi du temps/documents/certificat. Le catalogue comporte recherche par besoin, filtres profil/thème, badges d’accès, provenance, cinq contacts de fonction sourcés et onglets « Mes premiers jours » et « Besoin d’aide ».

Les bureaux 220/221 restent des correspondances candidates : affichage sur le plan uniquement, sans renommage, statut terrain ou trajet garanti. Les textes de parcours nuancent l’appellation Forum pour C3. Les références privées aux emails, événements datés et autres ressources candidates ne sont pas exportés avec le catalogue ; l’intégration ne constitue pas une revérification de tous les liens ni un test des portails après connexion.

Suivi des cinq tâches et limites dans `AMELIORATIONS_RESTANTES.md` ; recette S25–S29 et résultats observés dans `docs/DEMONSTRATION.md` ; exigences actualisées dans `Cahier_charges/main.tex`. La version Aventure n’est pas modifiée.
