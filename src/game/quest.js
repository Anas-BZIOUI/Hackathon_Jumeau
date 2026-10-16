export const REWARD=10;
export const PARTY_REWARD=15;
export const PEOPLE={
 bartender:{name:'Karim',intro:'Salut ! Karim, derrière le bar. Un jus, un café, ou simplement un renseignement ?',again:'Te revoilà ! Le service est calme. Tu prends quelque chose ou tu as une question ?',small:'Je prépare le bar avant l’arrivée des associations. Le café, c’est surtout un prétexte pour discuter entre deux cours.',clue:'Oussama ? Il est parti vérifier du matériel dans la bibliothèque, en haut à droite du foyer.',yes:true,party:'Oui, compte sur moi ! Je tiendrai le bar au début de la soirée.',detail:'On prévoira aussi des boissons sans alcool. Tu peux dire à Nadia que je m’occupe de cette partie.'},
 'student-lina':{name:'Lina',intro:'Coucou ! Je m’appelle Lina. Tu découvres le campus ? Viens, on fait connaissance !',again:'Salut, ça fait plaisir de te revoir ! Comment se passe ton installation ? Tu as besoin d’un coup de main ?',small:'J’aime bien les projets en groupe. Si tu cherches des gens pour réviser, passe au foyer après les cours.',clue:'J’ai croisé Oussama près des étagères de la bibliothèque. C’est la pièce en haut à droite du foyer.',yes:true,party:'Avec plaisir ! Une soirée, c’est parfait pour rencontrer les nouveaux.',detail:'Je pourrai arriver après mon dernier cours. Si tu ne connais pas encore grand monde, on peut y aller ensemble.'},
 'student-alex':{name:'Alex',intro:'Tiens, une nouvelle tête ! Moi, c’est Alex. Tu joues au baby-foot ?',again:'Hé, salut ! Alors, les premiers cours ? Tu veux discuter ou tu cherches quelque chose ?',small:'Je défie Jules aux jeux dès que j’ai une pause. On n’est pas très forts, mais on y met de l’énergie !',clue:'Je ne sais pas où est Oussama. Karim voit passer tout le monde ; essaie de lui demander.',yes:false,party:'Pas cette fois, désolé. J’ai un entraînement après les cours.',detail:'Je joue dans un club à l’extérieur. Raconte-moi la soirée la prochaine fois, et je viendrai à la suivante !'},
 'student-adam':{name:'Adam',intro:'Salut… installe-toi si tu veux. Je suis Adam, je profite d’une petite pause.',again:'Ah, je te reconnais ! Ça va aujourd’hui ? Tu veux souffler un peu ou me demander quelque chose ?',small:'J’aime bien ce coin tranquille. Dix minutes sur le canapé, et je suis prêt à retourner travailler.',clue:'Je n’ai pas vu Oussama aujourd’hui. Lina aura peut-être une idée.',yes:false,party:'Je vais passer mon tour : j’ai besoin d’une soirée tranquille pour me reposer.',detail:'Les grandes soirées me fatiguent un peu. En revanche, un petit jeu au foyer un autre jour, volontiers.'},
 'student-bob':{name:'Mehdi',intro:'Bonjour ! Mehdi. Tu peux t’asseoir, il reste de la place. Tu es dans quelle promotion ?',again:'Content de te revoir ! Tu as trouvé tes repères ? Dis-moi si je peux t’aider.',small:'Je découvre des jeux de société avec les autres. Tu préfères les jeux de stratégie ou les jeux d’ambiance ?',clue:'Oussama travaille dans la bibliothèque, juste en haut à droite du foyer. Tu devrais le trouver là-bas.',yes:true,party:'Oui ! Je viendrai avec quelques jeux de société.',detail:'Je prendrai des jeux faciles à expliquer : comme ça, les nouveaux pourront rejoindre une partie à tout moment.'},
 'student-sarah':{name:'Sarah',intro:'Bonjour, je suis Sarah ! Je prépare quelques idées pour la vie associative. Et toi, tu viens d’arriver ?',again:'Salut ! Alors, comment vas-tu depuis la dernière fois ? Des questions sur les associations ?',small:'Il y a beaucoup d’associations ici : sport, culture, informatique… Tu trouveras sûrement quelque chose qui te plaît.',clue:'Pour Oussama, direction la bibliothèque au nord-est du foyer. Il y range les documents du matériel.',yes:true,party:'Oui, je participe ! Tu sais s’il faut apporter quelque chose ?',detail:'Je peux apporter un gâteau à partager. Je demanderai à Nadia où le déposer en arrivant.'},
 'student-jules':{name:'Jules',intro:'Salut ! Jules, amateur de jeux et spécialiste des pauses un peu trop longues. Bienvenue !',again:'Hé, on se retrouve ! Tout roule ? Tu as besoin d’un renseignement ou d’un partenaire de jeu ?',small:'Alex pense gagner la prochaine partie. Je te laisse juger quand tu nous verras jouer !',clue:'Oussama ? Aucune idée, je viens d’arriver. Demande à Sarah, elle connaît bien les lieux.',yes:false,party:'J’aurais aimé, mais je prends le train juste après les cours.',detail:'Ma famille m’attend ce soir. Je donnerai un coup de main pour installer avant de partir, si besoin.'}
};
export const FOYER_IDS=Object.keys(PEOPLE);
export const initialQuest=()=>({status:'available',paper:false,respect:0,clue:false,cardActive:false,met:{},party:{status:'available',answers:{}}});
export const partyComplete=q=>FOYER_IDS.every(id=>Object.hasOwn(q.party.answers,id));
export const attendees=q=>FOYER_IDS.filter(id=>q.party.answers[id]===true).map(id=>PEOPLE[id].name);
export function questAction(state,action,npc){
 if(action==='meet'&&npc)return {...state,met:{...state.met,[npc.id]:(state.met[npc.id]||0)+1}};
 if(action==='activate-card')return {...state,cardActive:true};
 if(action==='accept'&&state.status==='available')return {...state,status:'active',paper:true};
 if(action==='clue'&&state.status==='active')return {...state,clue:true};
 if(action==='deliver'&&state.status==='active'&&state.paper)return {...state,status:'completed',paper:false,respect:state.respect+REWARD};
 if(action==='party-accept'&&state.cardActive&&state.party.status==='available')return {...state,party:{status:'active',answers:{}}};
 if(action==='party-answer'&&state.party.status==='active'&&PEOPLE[npc?.id]&&!Object.hasOwn(state.party.answers,npc.id))return {...state,party:{...state.party,answers:{...state.party.answers,[npc.id]:PEOPLE[npc.id].yes}}};
 if(action==='party-deliver'&&state.party.status==='active'&&partyComplete(state))return {...state,party:{...state.party,status:'completed'},respect:state.respect+PARTY_REWARD};
 return state;
}
const choice=(label,action)=>({label,action});
export function dialogueFor(npc,q){
 const known=!!q.met[npc.id],p=PEOPLE[npc.id],choices=[];let text;
 if(p){
  text=known?p.again:p.intro;
  choices.push(choice('Comment se passe ta journée ?','chat'),choice('Parlons un peu de la vie au foyer.','small'));
  if(q.status==='active')choices.push(choice('Je cherche Oussama pour lui remettre un papier.','ask-oussama'));
  if(q.party.status==='active')choices.push(choice(Object.hasOwn(q.party.answers,npc.id)?'À propos de ta réponse pour la soirée…':'Est-ce que tu participeras à la soirée après les cours ?','party-talk'));
 }else if(npc.id==='reception-amelia'){
  text=known?'Bonjour ! Comment vas-tu ? Tu prends tes marques sur le campus ? Dis-moi ce dont tu as besoin.':'Bienvenue à l’ENSIIE ! Je suis Amélia, à l’accueil. Tu es notre nouvel étudiant ? Je peux te renseigner.';
  choices.push(choice('Comment bien commencer mon année ici ?','small'));
  if(q.status==='available')choices.push(choice('Avez-vous besoin d’aide ?','paper-offer'));
  if(q.status==='active')choices.push(choice('Je voulais faire le point sur le papier.','paper-progress'));
 }else if(npc.id==='oussama'){
  text=known?'Salut, content de te revoir ! Comment ça va ? Tu as besoin de matériel ou simplement envie de discuter ?':'Bonjour ! Moi, c’est Oussama. Je m’occupe des équipements. Tu peux aussi t’installer ici pour lire ou travailler.';
  choices.push(choice('Quel matériel peut-on emprunter ?','small'),choice('Comment se passe votre journée ?','chat'));
  if(q.status==='active'&&q.paper)choices.push(choice('Oui, voici le papier d’Amélia.','deliver'));
 }else if(npc.id==='office-nadia'){
  text=known?'Bonjour ! Ravie de te revoir. Comment se passe ta journée ? Que puis-je faire pour toi ?':'Bonjour, je suis Nadia. Je m’occupe des cartes étudiantes et de l’organisation des événements. Bienvenue dans mon bureau !';
  choices.push(choice(q.cardActive?'Ma carte est-elle bien activée ?':'Je voudrais activer ma carte étudiante.','activate-card'),choice('Comment se prépare la vie étudiante ?','small'));
  if(q.cardActive&&q.party.status==='available')choices.push(choice('Vous aviez une mission à me proposer ?','party-offer'));
  if(q.party.status==='active')choices.push(choice(partyComplete(q)?'Voici la liste des participants à la soirée.':'Où en suis-je dans les réponses pour la soirée ?',partyComplete(q)?'party-deliver':'party-progress'));
 }else{text=known?'Content de te revoir ! Comment vas-tu ?':'Bonjour ! Bienvenue sur le campus.';choices.push(choice('Comment se passe votre journée ?','chat'));}
 choices.push(choice('À bientôt !','close'));
 return {text,choices};
}
export function dialogueStep(npc,q,action){
 const p=PEOPLE[npc.id],back=choice('Parlons d’autre chose.','menu');
 const response=text=>({text,choices:[back]});
 if(action==='menu')return dialogueFor(npc,q);
 if(action==='paper-offer'&&q.status==='available')return {text:'Pourrais-tu apporter ce papier à Oussama, le responsable des équipements ? Les étudiants du foyer pourront te guider. Tu es libre de refuser.',choices:[choice('Oui, je vais lui apporter le papier.','accept'),choice('Non, pas pour le moment.','decline')]};
 if(action==='accept')return response('Merci ! Voici le papier pour Oussama. Tu peux le consulter dans ton inventaire avec I et suivre la mission avec P.');
 if(action==='decline'||action==='party-decline')return response('Aucun souci, tu es libre de revenir me voir plus tard. De quoi aimerais-tu parler ?');
 if(action==='paper-progress')return response('Le papier est destiné à Oussama. Demande aux personnes du foyer où le trouver. Tu peux consulter ton journal avec P.');
 if(action==='deliver')return response('Parfait, c’est le document dont j’avais besoin ! Merci pour le coup de main. Tu gagnes 10 points de respect. Maintenant, si tu as des questions sur le matériel, je suis disponible.');
 if(action==='ask-oussama'&&q.status==='active')return response(p?.clue||'Demande aux étudiants du foyer, ils pourront peut-être te guider.');
 if(action==='activate-card')return {text:q.party.status==='available'?'Ta carte étudiante est bien activée ! Tu peux maintenant l’utiliser sur le campus. Au fait, nous préparons une soirée après les cours. Accepterais-tu de m’aider à recueillir les réponses des personnes du foyer ?':'Ta carte est bien activée, tout est en ordre. Si tu rencontres un souci, reviens me voir !',choices:q.party.status==='available'?[choice('En quoi consiste la mission ?','party-offer'),back]:[back]};
 if(action==='party-offer'&&q.cardActive&&q.party.status==='available')return {text:'Va demander à toutes les personnes du foyer, y compris le barman et les personnes sur le canapé, si elles participeront à la soirée après les cours. Note uniquement les noms des volontaires sur cette liste, puis rapporte-la-moi une fois tout le monde consulté. Tu acceptes ?',choices:[choice('Oui, je vais demander à tout le monde.','party-accept'),choice('Non, pas pour le moment.','party-decline')]};
 if(action==='party-accept')return response('Super ! Voici la liste. Les réponses positives et ta progression apparaîtront dans le journal P. La liste se trouve dans ton inventaire I. Prends le temps de discuter avec chacun !');
 if(action==='party-talk'&&p&&q.party.status==='active')return {text:Object.hasOwn(q.party.answers,npc.id)?`Tu as déjà noté ma réponse : ${p.yes?'oui':'non'}. ${p.detail}`:p.party,choices:Object.hasOwn(q.party.answers,npc.id)?[back]:[choice(p.yes?'Merci, je note ton nom sur la liste !':'D’accord, je note que tu ne participes pas.','party-answer'),choice(p.yes?'Tu as des idées pour la soirée ?':'Tu avais autre chose de prévu ?','party-detail'),back]};
 if(action==='party-detail'&&p&&q.party.status==='active')return {text:p.detail,choices:[choice(p.yes?'C’est noté, je confirme ta participation.':'Je comprends, je confirme ton absence.','party-answer'),back]};
 if(action==='party-answer')return response(p?.yes?`C’est noté pour ${p.name} ! ${p.detail}`:`Merci pour ta réponse, ${p?.name}. Tu ne figures pas sur la liste des participants. On se retrouve une autre fois !`);
 if(action==='party-progress')return response(`Il reste à interroger : ${FOYER_IDS.filter(id=>!Object.hasOwn(q.party.answers,id)).map(id=>PEOPLE[id].name).join(', ')}. Pense à consulter aussi les personnes assises et le barman.`);
 if(action==='party-deliver')return response(`Merci ! J’ai bien reçu la liste : ${attendees(q).join(', ')||'aucun participant'}. Tout le monde a été consulté. Mission terminée : tu gagnes 15 points de respect. On peut maintenant discuter tranquillement !`);
 if(action==='small')return response(p?.small||({'reception-amelia':'Commence par rencontrer les autres étudiants et découvrir les associations. N’hésite pas à revenir à l’accueil si tu te sens perdu.','oussama':'Pour emprunter un équipement, viens me voir avec le nom du matériel et la durée souhaitée. Je vérifierai sa disponibilité avec toi.','office-nadia':'On essaie d’organiser des activités où chacun trouve sa place. La carte étudiante et les rencontres au foyer sont de bons premiers pas !'}[npc.id])||'Le campus est un endroit agréable pour faire connaissance.');
 if(action==='chat')return response(p?`${p.small} Et toi, j’espère que ta journée se passe bien !`:npc.id==='oussama'?'Très bien, merci ! Je range les équipements et je profite du calme de la bibliothèque. Et toi, tu trouves tes marques ?':'Très bien, merci de demander ! J’espère que tes premiers jours ici se passent bien. Reviens quand tu as besoin d’un renseignement.');
 return dialogueFor(npc,q);
}
