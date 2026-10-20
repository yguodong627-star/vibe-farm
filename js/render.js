// 渲染
'use strict';
const R={cv:null,cx:null,Z:4,camX:0,camY:0,W:0,H:0,rain:[],t:0};
const PLAYER_LOOK={id:'player',skin:'#f2c9a0',hair:'#5a3a1a',shirt:'#3a8ad0',pants:'#5a4a3a',hat:'#d8b060'};
function resize(){const d=window.devicePixelRatio||1;R.W=R.cv.width=Math.floor(innerWidth*d);R.H=R.cv.height=Math.floor(innerHeight*d);R.cv.style.width=innerWidth+'px';R.cv.style.height=innerHeight+'px';R.Z=Math.max(2,Math.round(Math.min(R.W,R.H)/(16*(innerWidth<700?11:13))));R.cx.imageSmoothingEnabled=false;}
function draw(img,x,y,w,h){R.cx.drawImage(img,Math.round((x-R.camX)*R.Z),Math.round((y-R.camY)*R.Z),Math.round((w||img.width)*R.Z),Math.round((h||img.height)*R.Z));}
function rect(x,y,w,h,c){R.cx.fillStyle=c;R.cx.fillRect(Math.round((x-R.camX)*R.Z),Math.round((y-R.camY)*R.Z),Math.ceil(w*R.Z),Math.ceil(h*R.Z));}
function render(dt){R.t+=dt;const c=R.cx;const m=CUR;if(!m)return;const Z=R.Z;
 const vw=R.W/Z,vh=R.H/Z;R.camX=Math.max(0,Math.min(m.w*16-vw,P.x-vw/2));R.camY=Math.max(0,Math.min(m.h*16-vh,P.y-vh/2));if(m.w*16<vw)R.camX=(m.w*16-vw)/2;if(m.h*16<vh)R.camY=(m.h*16-vh)/2;
 c.fillStyle=m.id.startsWith('mine')?'#100c14':'#1a2a1a';c.fillRect(0,0,R.W,R.H);
 const x0=Math.max(0,Math.floor(R.camX/16)),y0=Math.max(0,Math.floor(R.camY/16)),x1=Math.min(m.w-1,Math.ceil((R.camX+vw)/16)),y1=Math.min(m.h-1,Math.ceil((R.camY+vh)/16));
 const sea=S.season;const fest=FEST&&FEST.active&&m.id=='town';
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let t=getT(m,x,y);const v=Math.floor(hsh(x,y,3)*12);
  if(t=='X'){draw(tileSpr('X',sea,v),x*16,y*16);if((x+y)%2==0)draw(treeSpr('pine',sea,3),x*16-8,y*16+16-48);continue;}
  draw(tileSpr(t,sea,v+(t=='W'||t=='O'||t=='L'?Math.floor(R.t*1.5+x*.3)%4*13:0)),x*16,y*16);
  const so=m.soil[K(x,y)];if(so){draw(tilledSpr(so.wet),x*16,y*16);if(so.fert)rect(x*16+1,y*16+1,2,2,so.fert=='speedgro'?'#40c0a0':so.fert=='qfert'?'#ffd700':'#a07a3a');}
  const o=m.obj[K(x,y)];if(o){if(o.t=='path')draw(pathSpr(),x*16,y*16);else if(o.t=='ladder')draw(ladderSpr(),x*16,y*16);else if(o.t=='exit'){draw(ladderSpr(),x*16,y*16);rect(x*16+5,y*16+2,6,3,'#ffd700');}}
 }
 // 可排序对象
 const L=[];
 for(let y=y0-3;y<=y1+3;y++)for(let x=x0-2;x<=x1+2;x++){const o=m.obj[K(x,y)];const so=m.soil[K(x,y)];
  if(so&&so.crop){const cr=so.crop;const C=CROPS[cr.id];const days=cropDays(cr,so);const st=Math.min(4,Math.floor(cr.age/days*4));L.push([y*16+15,()=>draw(cropSpr(cr.id,st,4,isReady(cr),cr.dead),x*16,y*16-8)]);}
  if(!o)continue;const by=y*16+16;
  switch(o.t){
   case 'tree':{const sh=o.shake>0?Math.sin(R.t*60)*1:0;if(o.shake>0)o.shake-=dt;L.push([by,()=>draw(treeSpr(o.kind,sea,o.stage),x*16-8+sh,y*16+16-48)]);break;}
   case 'stump':L.push([by,()=>draw(stumpSpr(),x*16,y*16)]);break;
   case 'sprout':L.push([by,()=>draw(treeSpr(o.kind,sea,1),x*16-8,y*16+16-48)]);break;
   case 'log':L.push([by,()=>{draw(stumpSpr(),x*16-2,y*16-2,20,20);}]);break;
   case 'rock':{const sh=o.shake>0?Math.sin(R.t*70):0;if(o.shake>0)o.shake-=dt;L.push([by,()=>draw(rockSpr(o.kind,o.v||0),x*16+sh,y*16)]);break;}
   case 'boulder':L.push([by,()=>draw(rockSpr('big',0),x*16-2,y*16-4,20,20)]);break;
   case 'weed':L.push([by,()=>draw(weedSpr(sea,o.v||0),x*16,y*16)]);break;
   case 'twig':L.push([by,()=>draw(twigSpr(),x*16,y*16)]);break;
   case 'chest':L.push([by,()=>draw(chestSpr(),x*16,y*16)]);break;
   case 'treasure':L.push([by,()=>{draw(chestSpr(),x*16,y*16);rect(x*16+3,y*16+3,10,2,'#ffd700');}]);break;
   case 'sprinkler':case 'qsprinkler':L.push([by,()=>draw(sprinklerSpr(o.t=='qsprinkler'),x*16,y*16)]);break;
   case 'furnace':L.push([by,()=>draw(furnaceSpr(o.input?1:0),x*16,y*16)]);break;
   case 'elevator':L.push([by,()=>{rect(x*16+1,y*16-8,14,24,'#5a4a3a');rect(x*16+3,y*16-6,10,18,'#2a2a3a');rect(x*16+7,y*16-12,2,4,'#ffd700');}]);break;
   case 'bin':if(!o.part)L.push([by,()=>draw(binSpr(),x*16,y*16-8)]);break;
   case 'forage':case 'drop':{const id=o.id;L.push([by-8,()=>draw(iconURLImg(id),x*16,y*16+Math.sin(R.t*3+x)*0.5)]);break;}
   case 'fegg':L.push([by-8,()=>draw(iconSpr('fegg'),x*16,y*16)]);break;
   case 'bld':break;
  }}
 for(const b of m.bld){if(b.x*16>R.camX+vw+40||(b.x+b.w)*16<R.camX-40)continue;L.push([(b.y+b.h)*16,()=>draw(buildingSpr(b.kind,sea),b.x*16,b.y*16,b.w*16,b.h*16)]);}
 if(m.id=='town'){L.push([48,()=>draw(mineEntranceSpr(),20*16,0)]);}
 // 角色
 L.push([P.y,()=>drawPlayer()]);
 if(m.id=='town')for(const n of NPCS){const r=NPCSYS.rt[n.id];if(!r||!r.vis)continue;L.push([r.y,()=>{draw(charSpr(NPCSYS.look(n),r.dir,r.moving?Math.floor(r.f):0),r.x-8,r.y-22);if(NPCSYS.isBday(n))rect(r.x-2,r.y-28,4,4,'#ff6ad0');}]);}
 if(m.id=='farm')for(const r of ANIM.rt){if(!r.vis)continue;L.push([r.y,()=>{const im=animalSpr(r.a.type,Math.floor(r.f));R.cx.save();if(r.dir==3){R.cx.translate(Math.round((r.x-R.camX)*Z)*2,0);R.cx.scale(-1,1);}draw(im,r.x-8,r.y-14);R.cx.restore();if(r.a.prod)rect(r.x-2,r.y-20,4,4,'#fff6a0');}]);}
 if(m.monsters)for(const mo of m.monsters){if(mo.hp<=0)continue;L.push([mo.y+6,()=>{draw(monsterSpr(mo.type,Math.floor(mo.f)),mo.x-8,mo.y-10);if(mo.hp<mo.maxhp){rect(mo.x-7,mo.y-13,14,2,'#300');rect(mo.x-7,mo.y-13,14*mo.hp/mo.maxhp,2,'#e33');}}]);}
 L.sort((a,b)=>a[0]-b[0]);for(const [,f] of L)f();
 if(fest){for(let i=0;i<10;i++){const fx=19*16+i*16;rect(fx,11*16,1,10,'#6b4423');rect(fx+1,11*16,7,5,['#ff6a6a','#ffd76a','#6ad0ff','#a0ff6a'][i%4]);}}
 // 目标格高亮
 if(!UI.open&&!FISHING&&selItem()){const [tx,ty]=targetTile();R.cx.strokeStyle='rgba(255,255,255,.55)';R.cx.lineWidth=Math.max(1,Z/2);R.cx.strokeRect(Math.round((tx*16-R.camX)*Z),Math.round((ty*16-R.camY)*Z),16*Z,16*Z);}
 // 钓鱼浮标
 if(FISHING&&FISHING.phase!='game'){const F=FISHING;R.cx.strokeStyle='#eee';R.cx.lineWidth=1;R.cx.beginPath();R.cx.moveTo((P.x+DX[P.dir]*8-R.camX)*Z,(P.y-18-R.camY)*Z);R.cx.lineTo((F.bx-R.camX)*Z,(F.by-R.camY)*Z);R.cx.stroke();
  rect(F.bx-2,F.by-2+Math.sin(R.t*4)*1+(F.phase=='bite'?2:0),4,4,'#e33');if(F.phase=='bite'){R.cx.fillStyle='#ffd700';R.cx.font=`bold ${10*Z}px sans-serif`;R.cx.fillText('!',(P.x-3-R.camX)*Z,(P.y-28-R.camY)*Z);}}
 // 粒子与飘字
 for(const p of FX.parts){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=80*dt;rect(p.x,p.y,1.5,1.5,p.c);}FX.parts=FX.parts.filter(p=>p.t>0);
 c.textAlign='center';for(const f of FX.floats){f.t-=dt;f.y-=14*dt;c.font=`bold ${Math.round(5*Z)}px sans-serif`;c.fillStyle='rgba(0,0,0,.6)';c.fillText(f.text,(f.x-R.camX)*Z+2,(f.y-R.camY)*Z+2);c.fillStyle=f.c;c.fillText(f.text,(f.x-R.camX)*Z,(f.y-R.camY)*Z);}FX.floats=FX.floats.filter(f=>f.t>0);c.textAlign='left';
 // 天气与夜晚
 const outdoor=!m.id.startsWith('mine');
 if(outdoor&&(S.weather=='rain'||S.weather=='storm')){c.strokeStyle='rgba(180,200,255,.5)';c.lineWidth=Math.max(1,Z/3);c.beginPath();for(let i=0;i<120;i++){const rx=(hsh(i,1,1)*R.W+R.t*200*Z*.3)%R.W,ry=(hsh(i,2,1)*R.H+R.t*600*Z*.3)%R.H;c.moveTo(rx,ry);c.lineTo(rx-2*Z,ry+6*Z);}c.stroke();c.fillStyle='rgba(30,40,80,.18)';c.fillRect(0,0,R.W,R.H);
  if(S.weather=='storm'&&Math.sin(R.t*.7)>.995){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,0,R.W,R.H);}}
 if(outdoor&&S.weather=='snow'){c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<100;i++){const rx=(hsh(i,3,1)*R.W+Math.sin(R.t+i)*20*Z)%R.W,ry=(hsh(i,4,1)*R.H+R.t*30*Z)%R.H;c.fillRect(rx,ry,Z,Z);}}
 let dark=0;if(outdoor){const t=S.time;if(t>=18*60)dark=Math.min(.55,(t-18*60)/(240)*.55);}else dark=.3;
 if(dark>0){c.fillStyle=`rgba(10,10,40,${dark})`;c.fillRect(0,0,R.W,R.H);if(!outdoor){const g=c.createRadialGradient((P.x-R.camX)*Z,(P.y-8-R.camY)*Z,10*Z,(P.x-R.camX)*Z,(P.y-8-R.camY)*Z,90*Z);g.addColorStop(0,'rgba(255,220,150,.18)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,R.W,R.H);}}
 if(FISHING&&FISHING.phase=='game')drawFishGame();
 if(FEST&&FEST.lock){c.fillStyle='rgba(0,0,0,.55)';c.fillRect(8*Z/2,8*Z/2,110*Z,14*Z);c.fillStyle='#ffd76a';c.font=`bold ${Math.round(6*Z)}px sans-serif`;c.fillText(`${FESTIVALS[S.season].n} 剩余${Math.ceil(FEST.timer)}秒 成绩：${FEST.score}`,8*Z,14*Z);c.textAlign='left';}
}
const _iconImg={};function iconURLImg(id){return iconSpr(id);}
function drawPlayer(){const fr=P.moving?Math.floor(P.anim):0;if(P.inv>0&&Math.floor(P.inv*10)%2)return;draw(charSpr(PLAYER_LOOK,P.dir,fr),P.x-8,P.y-22);
 if(P.toolT>0&&P.tool&&ITEMS[P.tool]){const it=ITEMS[P.tool];const img=it.cat=='tool'?toolSpr(P.tool,S.tools[P.tool]):iconSpr(P.tool);const ox=DX[P.dir]*10,oy=DY[P.dir]*8;R.cx.save();const cxp=(P.x+ox-R.camX)*R.Z,cyp=(P.y-12+oy-R.camY)*R.Z;R.cx.translate(cxp,cyp);R.cx.rotate((P.dir==3?-1:1)*(0.3-P.toolT*3));R.cx.drawImage(img,-8*R.Z,-12*R.Z,16*R.Z,16*R.Z);R.cx.restore();}
 if(FISHING&&FISHING.phase!='game'&&!(P.toolT>0)){const img=toolSpr('rod',S.tools.rod);draw(img,P.x+DX[P.dir]*6-8,P.y-26);}}
function drawFishGame(){const F=FISHING;const c=R.cx;const Z=R.Z;const H=Math.min(R.H*.7,150*Z),W=24*Z;const x=Math.min(R.W-W*3,(P.x-R.camX)*Z+24*Z),y=Math.max(10,(P.y-R.camY)*Z-H*.75);
 c.fillStyle='#5a3a1a';c.fillRect(x-4*Z,y-4*Z,W+16*Z,H+8*Z);c.fillStyle='#2a4a6a';c.fillRect(x,y,W,H);
 c.fillStyle=F.inside?'rgba(120,255,120,.75)':'rgba(120,220,120,.45)';c.fillRect(x+2,y+F.bar*H,W-4,F.size*H);
 const im=iconSpr(F.id);c.drawImage(im,x+W/2-8*Z*.8,y+F.fy*H-8*Z*.8,16*Z*.8,16*Z*.8);
 c.fillStyle='#222';c.fillRect(x+W+4*Z,y,6*Z,H);const pc=F.prog>.6?'#5ae05a':F.prog>.3?'#e0d05a':'#e05a5a';c.fillStyle=pc;c.fillRect(x+W+4*Z,y+H*(1-F.prog),6*Z,H*F.prog);
 c.fillStyle='#fff';c.font=`${Math.round(4*Z)}px sans-serif`;c.fillText('按住提竿',x,y+H+8*Z);}
