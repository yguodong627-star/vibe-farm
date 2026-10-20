// 输入与主循环
'use strict';
const INPUT={keys:{},mouseTile:null,mouseFresh:false,mouseDown:false,joy:[0,0],aHeld:false,repeat:0,
 move(){let x=0,y=0;const k=this.keys;if(k.KeyA||k.ArrowLeft)x--;if(k.KeyD||k.ArrowRight)x++;if(k.KeyW||k.ArrowUp)y--;if(k.KeyS||k.ArrowDown)y++;if(!x&&!y){x=this.joy[0];y=this.joy[1];}return [x,y];},
 holdUse(){return !!(this.keys.Space||this.keys.KeyJ||this.mouseDown||this.aHeld);}};
let TITLE=true;
function screenToTile(cx,cy){const d=window.devicePixelRatio||1;const wx=cx*d/R.Z+R.camX,wy=cy*d/R.Z+R.camY;return [Math.floor(wx/16),Math.floor(wy/16)];}
function bindInput(){
 addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;INPUT.keys[e.code]=true;if(TITLE)return;
  if(['Space','ArrowUp','ArrowDown','Tab'].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code=='Escape'||e.code=='Tab'||e.code=='KeyI'){if(UI.open)UI.closeAll();else UI.menu();return;}
  if(UI.open=='dialog'&&(e.code=='Space'||e.code=='Enter')){const b=$('#dialog button');if(b)b.click();return;}
  if(UI.open)return;
  if(e.code=='Space'||e.code=='KeyJ'){doUse();INPUT.repeat=.4;}
  if(e.code=='KeyE'||e.code=='KeyK')doInteract();
  if(e.code=='KeyC')UI.menu('craft');
  const hk=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal'].indexOf(e.code);if(hk>=0){S.sel=hk;UI.hotbar();}});
 addEventListener('keyup',e=>{INPUT.keys[e.code]=false;});
 addEventListener('blur',()=>{INPUT.keys={};INPUT.mouseDown=false;INPUT.aHeld=false;});
 const cv=R.cv;
 cv.addEventListener('mousemove',e=>{INPUT.mouseTile=screenToTile(e.clientX,e.clientY);INPUT.mouseFresh=true;});
 cv.addEventListener('mousedown',e=>{if(TITLE)return;ac();INPUT.mouseTile=screenToTile(e.clientX,e.clientY);INPUT.mouseFresh=true;if(e.button==0){INPUT.mouseDown=true;doUse();INPUT.repeat=.4;}else if(e.button==2)doInteract();});
 addEventListener('mouseup',()=>INPUT.mouseDown=false);
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('wheel',e=>{if(UI.open||TITLE)return;S.sel=(S.sel+(e.deltaY>0?1:11))%12;UI.hotbar();},{passive:true});
 cv.addEventListener('touchstart',e=>{if(TITLE)return;ac();const t=e.changedTouches[0];INPUT.mouseTile=screenToTile(t.clientX,t.clientY);INPUT.mouseFresh=true;const [px_,py_]=tileAt(P.x,P.y);const [mx,my]=INPUT.mouseTile;if(Math.abs(mx-px_)<=1&&Math.abs(my-py_)<=1)doInteract();e.preventDefault();},{passive:false});
 // 摇杆
 const joy=$('#joy'),knob=$('#knob');let jid=null,jc=null;
 joy.addEventListener('pointerdown',e=>{jid=e.pointerId;const r=joy.getBoundingClientRect();jc=[r.left+r.width/2,r.top+r.height/2];joy.setPointerCapture(e.pointerId);jm(e);});
 const jm=e=>{if(e.pointerId!==jid)return;let dx=e.clientX-jc[0],dy=e.clientY-jc[1];const l=Math.hypot(dx,dy),mx=50;if(l>mx){dx=dx/l*mx;dy=dy/l*mx;}knob.style.transform=`translate(${dx}px,${dy}px)`;const n=l<10?0:1;INPUT.joy=[n*dx/mx,n*dy/mx];INPUT.mouseFresh=false;};
 joy.addEventListener('pointermove',jm);const je=e=>{if(e.pointerId!==jid)return;jid=null;INPUT.joy=[0,0];knob.style.transform='';};joy.addEventListener('pointerup',je);joy.addEventListener('pointercancel',je);
 const btn=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();ac();down();});if(up){b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);}};
 btn('#btnA',()=>{INPUT.aHeld=true;INPUT.mouseFresh=false;doUse();INPUT.repeat=.4;},()=>INPUT.aHeld=false);
 btn('#btnB',()=>{INPUT.mouseFresh=false;doInteract();});
 btn('#btnM',()=>{if(UI.open)UI.closeAll();else UI.menu();});
 btn('#btnE',()=>{const s=selItem();if(s&&ITEMS[s.id].edible)eat(s);else UI.toast('快捷栏选中食物后可食用');UI.hotbar();});
 $('#hud-menu').onclick=()=>{if(UI.open)UI.closeAll();else UI.menu();};
}
let last=performance.now(),hudAcc=0,hbSig='';
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!TITLE&&S){
  if(!UI.open){updatePlayer(dt);if(INPUT.holdUse()&&!FISHING){INPUT.repeat-=dt;if(INPUT.repeat<=0){INPUT.repeat=.35;const s=selItem();if(s&&['hoe','can','axe','pick','sword'].includes(s.id))doUse();}}}
  else P.moving=false;
  NPCSYS.update(dt);ANIM.update(dt);if(!UI.open)updateMonsters(dt);updateFishing(dt);updateClock(dt);updateFest(dt);
  hudAcc+=dt;if(hudAcc>.2){hudAcc=0;UI.hud();const sig=S.sel+'|'+S.inv.slice(0,12).map(s=>s?s.id+s.n+(s.q||0):'').join(',')+JSON.stringify(S.tools);if(sig!=hbSig){hbSig=sig;UI.hotbar();}}
 }
 if(CUR)render(dt);
 requestAnimationFrame(loop);}
function showTitle(){TITLE=true;$('#title').classList.remove('hide');$('#game-ui').classList.add('hide');$('#t-cont').style.display=localStorage.getItem(SAVE_KEY)?'':'none';
 if(!CUR){S={settings:{music:true,sfx:true,speed:1}};newGame();TITLE=true;}}
function hideTitle(){TITLE=false;$('#title').classList.add('hide');$('#game-ui').classList.remove('hide');UI.hotbar();UI.hud();if(S.settings.music){MUSIC.on=true;MUSIC.start();}}
function boot(){R.cv=$('#cv');R.cx=R.cv.getContext('2d');resize();addEventListener('resize',resize);bindInput();
 if('ontouchstart' in window||navigator.maxTouchPoints>0)document.body.classList.add('touch');
 $('#t-new').onclick=()=>{$('#t-newform').classList.remove('hide');$('#t-main').classList.add('hide');};
 $('#t-back').onclick=()=>{$('#t-newform').classList.add('hide');$('#t-main').classList.remove('hide');};
 $('#t-start').onclick=()=>{ac();const st=S&&S.settings;newGame($('#t-name').value.trim()||'农夫',$('#t-farm').value.trim()||'溪谷');if(st)S.settings=st;hideTitle();UI.dialog(null,`欢迎来到${S.farm}农场！爷爷留下的这片土地荒废已久。先用锄头开垦，种下小白菜种子，再用洒水壶浇水吧。出货箱在房子右边，东边小路通往溪谷镇。`);};
 $('#t-cont').onclick=()=>{ac();if(loadGame())hideTitle();};
 $('#t-imp').onclick=()=>importSave();
 $('#t-set').onclick=()=>{const st=S.settings;st.music=!st.music;$('#t-set').textContent='音乐：'+(st.music?'开':'关');};
 showTitle();requestAnimationFrame(loop);
 window.G={get S(){return S},P,MAPS,get CUR(){return CUR},get FISHING(){return FISHING},get FEST(){return FEST},set FEST(v){FEST=v},doUse,doInteract,enterMap,endDay,sleep,give,saveGame,loadGame,UI,NPCSYS,ANIM,updateFishing,startFestival,hideTitle,newGame,tryMove,isReady};
}
addEventListener('DOMContentLoaded',boot);
