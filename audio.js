'use strict';
// Original, gently plucked travel melody. Audio starts only after interaction.
(() => {
 let context, musicBus, effectsBus, timer, nextTime, step=0, music=false, sounds=true, pending=false;
 const musicButton=document.querySelector('#music-toggle'), soundButton=document.querySelector('#sound-toggle');
 const AudioContext=window.AudioContext||window.webkitAudioContext;
 const melody=[72,76,79,76,74,77,81,77,76,79,84,79,74,77,79,77,72,76,79,84,81,79,76,74,77,81,84,81,79,76,74,72];
 const bass=[48,53,45,55];
 function update(){musicButton.textContent=music?'♫ Music: On':'♫ Music: Off';musicButton.setAttribute('aria-pressed',String(music));soundButton.textContent=sounds?'♪ Sounds: On':'♪ Sounds: Off';soundButton.setAttribute('aria-pressed',String(sounds));}
 async function ready(){
  if(!AudioContext)return false;
  try{if(!context){context=new AudioContext();musicBus=context.createGain();effectsBus=context.createGain();musicBus.gain.value=0;effectsBus.gain.value=.22;musicBus.connect(context.destination);effectsBus.connect(context.destination);}if(context.state==='suspended')await context.resume();return context.state==='running';}catch(e){return false;}
 }
 function note(midi,time,duration,bus,volume=.3,type='sine'){
  const oscillator=context.createOscillator(), gain=context.createGain();oscillator.type=type;oscillator.frequency.value=440*Math.pow(2,(midi-69)/12);
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  oscillator.connect(gain);gain.connect(bus);oscillator.start(time);oscillator.stop(time+duration+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 function schedule(){
  if(!music||document.hidden||context.state!=='running')return;
  if(nextTime<context.currentTime)nextTime=context.currentTime+.05;
  while(nextTime<context.currentTime+.16){note(melody[step%32],nextTime,.65,musicBus,.25,'triangle');if(step%4===0){const root=bass[Math.floor(step/8)%4];note(root,nextTime,1.5,musicBus,.23);note(root+7,nextTime,1.2,musicBus,.1);}nextTime+=.42;step++;}
 }
 function stop(){music=false;clearInterval(timer);timer=null;if(context){musicBus.gain.cancelScheduledValues(context.currentTime);musicBus.gain.setTargetAtTime(0,context.currentTime,.025);}update();}
 musicButton.onclick=async()=>{if(pending)return;if(music){stop();return;}pending=true;const ok=await ready();pending=false;if(!ok)return;music=true;nextTime=context.currentTime+.05;musicBus.gain.setTargetAtTime(.2,context.currentTime,.08);timer=setInterval(schedule,50);schedule();update();};
 soundButton.onclick=()=>{sounds=!sounds;if(context){effectsBus.gain.cancelScheduledValues(context.currentTime);effectsBus.gain.setTargetAtTime(sounds?.22:0,context.currentTime,.015);}update();};
 window.UKAudio={play:async kind=>{if(!sounds||document.hidden||!await ready()||!sounds)return;const time=context.currentTime+.01;const notes=kind==='win'?[72,76,79,84]:kind==='correct'?[84,91]:[55,52];notes.forEach((n,i)=>note(n,time+i*(kind==='win'?.15:.09),kind==='wrong'?.16:.6,effectsBus,kind==='wrong'?.16:.35));}};
 document.addEventListener('pointerdown',()=>{if(sounds)void ready();},{once:true});
 document.addEventListener('keydown',()=>{if(sounds)void ready();},{once:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(timer);timer=null;if(context)void context.suspend().catch(()=>{});}else if(music){stop();}});
 window.addEventListener('pagehide',()=>{stop();if(context)void context.suspend().catch(()=>{});});
 if(!AudioContext){musicButton.disabled=true;soundButton.disabled=true;musicButton.title=soundButton.title='Audio is not available in this browser';}
 update();
})();
