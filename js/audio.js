// 原创程序化音乐与音效
'use strict';
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state=='suspended')AC.resume();return AC;}
function tone(f,d,type,vol,slide,when){const a=ac();if(!a)return;const t=(when||a.currentTime);const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);g.gain.setValueAtTime(vol||.08,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(MUSIC.out||a.destination);o.start(t);o.stop(t+d+.02);}
function noise(d,vol,hp){const a=ac();if(!a)return;const b=a.createBuffer(1,a.sampleRate*d,a.sampleRate);const da=b.getChannelData(0);for(let i=0;i<da.length;i++)da[i]=(Math.random()*2-1)*(1-i/da.length);const s=a.createBufferSource();s.buffer=b;const g=a.createGain();g.gain.value=vol||.1;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=hp||800;s.connect(f);f.connect(g);g.connect(a.destination);s.start();}
const SFX={play(k){if(!S||!S.settings.sfx)return;const T={hoe:()=>noise(.12,.12,300),thud:()=>tone(90,.12,'triangle',.12,.6),water:()=>noise(.25,.06,1500),chop:()=>{tone(160,.08,'square',.06,.5);noise(.06,.08,600);},fall:()=>tone(200,.5,'triangle',.12,.3),
 pick:()=>tone(880,.08,'square',.05,1.5),pick2:()=>{tone(420,.05,'square',.05);noise(.05,.08,2000);},break:()=>noise(.18,.14,500),plant:()=>tone(520,.07,'triangle',.08,1.3),harvest:()=>{tone(660,.08,'square',.05);tone(990,.1,'square',.05,1,ac().currentTime+.07);},
 coin:()=>{tone(1200,.06,'square',.05);tone(1600,.1,'square',.05,1,ac().currentTime+.06);},ship:()=>tone(300,.1,'triangle',.08,.7),eat:()=>{noise(.08,.06,1200);tone(400,.08,'triangle',.06,.8);},gift:()=>{[660,880,1100].forEach((f,i)=>tone(f,.12,'square',.04,1,ac().currentTime+i*.08));},
 cast:()=>noise(.2,.06,2500),bite:()=>tone(1000,.15,'square',.07,.9),catch:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.05,1,ac().currentTime+i*.07));},swing:()=>noise(.08,.07,3000),hit:()=>tone(220,.08,'sawtooth',.06,.5),hurt:()=>tone(160,.2,'sawtooth',.08,.5),
 ladder:()=>tone(300,.2,'triangle',.08,.5),door:()=>tone(240,.12,'triangle',.08),place:()=>tone(330,.07,'triangle',.08),fire:()=>noise(.3,.05,400),animal:()=>tone(700,.15,'triangle',.06,1.4)};try{(T[k]||(()=>{}))();}catch(e){}}};
const SCALES=[[0,2,4,7,9,12,14,16],[0,2,4,5,7,9,11,12],[0,2,3,5,7,8,10,12],[0,3,5,7,10,12,15,17]];
const ROOTS=[60,62,57,55];const TEMPO=[0.21,0.19,0.24,0.28];
const MUSIC={on:false,timer:null,step:0,out:null,mel:[],
 compose(season){let s=(season+1)*9973+(S?S.year:1)*31;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};const sc=SCALES[season];const mel=[];let p=2;
  for(let bar=0;bar<4;bar++)for(let i=0;i<8;i++){if(r()<.25&&i%2){mel.push(-1);continue;}p=Math.max(0,Math.min(sc.length-1,p+Math.floor(r()*5)-2));mel.push(sc[p]);}
  // A A' B A 结构
  this.mel=mel.slice(0,16).concat(mel.slice(0,8),mel.slice(16,24),mel.slice(0,16));this.bass=[0,0,5,7,0,5,7,4].map(x=>x-12);},
 season(){if(!S)return;this.compose(S.season);},
 start(){if(this.timer)return;const a=ac();if(!a)return;this.out=a.createGain();this.out.gain.value=1;this.out.connect(a.destination);this.season();
  const tick=()=>{if(!this.on||!S)return;const sea=S.season;const root=ROOTS[sea];const mine=CUR&&CUR.id.startsWith('mine');const st=this.step++;const i=st%this.mel.length;const n=this.mel[i];
   const night=S.time>=20*60;const v=(night?.018:.028);
   if(n>=0&&!(mine&&st%2))tone(440*Math.pow(2,(root+n+(mine?-12:0)-69)/12),TEMPO[sea]*1.6,sea==3?'sine':'triangle',v);
   if(st%4==0){const b=this.bass[Math.floor(st/4)%8];tone(440*Math.pow(2,(root+b-12-69)/12),TEMPO[sea]*3.5,'triangle',.03);}
   if(st%8==4&&!night&&sea<3)noise(.03,.015,5000);
   this.timer=setTimeout(tick,TEMPO[sea]*1000*(mine?1.4:1));};tick();},
 toggle(on){this.on=on;if(on){this.timer=null;this.start();}else{clearTimeout(this.timer);this.timer=null;}}};
