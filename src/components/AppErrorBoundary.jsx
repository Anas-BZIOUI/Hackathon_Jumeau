import {Component} from 'react';
export default class AppErrorBoundary extends Component{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<main className="error" role="alert"><h1>EnsiiExplore</h1><p>Une erreur a interrompu l’affichage. Les données enregistrées sont conservées.<br/>An error interrupted the display. Saved data is preserved.</p><button className="primary" onClick={()=>location.reload()}>Recharger / Reload</button><a href="/">Revenir au plan / Return to plan</a></main>:this.props.children;}
}
