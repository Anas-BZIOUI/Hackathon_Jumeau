let context;
export function playCue(kind){
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  context??=new Audio();if(context.state==='suspended')context.resume().catch(()=>{});
  const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  oscillator.type='sine';oscillator.frequency.value=kind==='step'?95:kind==='floor'?440:660;
  gain.gain.setValueAtTime(.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.09);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(now);oscillator.stop(now+.1);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }catch{/* Sound is optional. */}
}
