// 核心逻辑
'use strict';
for(const t in TOOLS)ITEMS[t]={id:t,n:TOOLS[t],p:0,cat:'tool',shape:'tool'};
item('goo','史莱姆凝胶',5,'res','drop','#5ad05a','#2a8a2a');
item('batwing','蝠翼',15,'res','leaf','#5a3a6a','#3a2a4a');
item('fegg','彩蛋',0,'misc','egg','#ff9ad0','#9ad0ff');
const DX=[0,1,0,-1],DY=[1,0,-1,0];
const SAVE_KEY='vibefarm_save_v1';
let S=null;const MAPS={};let CUR=null;
const P={x:0,y:0,dir:0,moving:false,anim:0,tool:null,toolT:0,inv:0,bump:0};
const FX={parts:[],floats:[]};
let FISHING=null;let FEST=null;
function tod(){return S.time;}
function hour(){return Math.floor(S.time/60);}
function fmtTime(t){let h=Math.floor(t/60)%24,m=t%60;return (h<10?'0':'')+h+':'+(m<10?'0':'')+m;}
function weekday(){return (S.day-1)%7;}
function dateStr(){return `第${S.year}年 ${SEASONS[S.season]} ${S.day}日 周${WEEK[weekday()]}`;}
function toast(msg,c){UI.toast(msg,c);}
function addFloat(text,x,y,c){FX.floats.push({text,x,y,c:c||'#fff',t:1.2});}
// ---------- 新游戏 ----------
function newGame(name,farm){
 S={v:1,name:name||'农夫',farm:farm||'溪谷',day:1,season:0,year:1,time:360,weather:'sun',tomorrow:'sun',money:500,energy:270,maxEnergy:270,hp:100,maxHp:100,
  inv:new Array(36).fill(null),invSize:24,sel:0,tools:{hoe:0,can:0,axe:0,pick:0,rod:0,sword:0},water:40,
  map:'farm',px:10*16+8,py:8*16+8,dir:0,coop:false,barn:false,houseLv:0,animals:[],friends:{},shipped:{},fish:{},found:{},cooked:{},museum:{},museumRw:{},
  mineMax:0,hay:0,bin:[],festDone:{},stats:{days:0,earned:0,passout:0},lastSummary:null,settings:S&&S.settings||{music:true,sfx:true,speed:1},animalId:1,seed:Math.floor(Math.random()*1e9)};
 NPCS.forEach(n=>S.friends[n.id]={pts:0,talk:0,gift:0,week:0});
 ['hoe','can','axe','pick','rod','sword'].forEach((t,i)=>S.inv[i]={id:t,n:1});
 S.inv[6]={id:'bokchoy_seed',n:15};S.inv[7]={id:'snack',n:3};
 MAPS.farm=genFarm();MAPS.town=genTown();
 spawnForage(MAPS.town,12);spawnForage(MAPS.farm,5);
 enterMap('farm',10,8);
}
// ---------- 背包 ----------
function invFind(id,q){for(let i=0;i<S.invSize;i++){const s=S.inv[i];if(s&&s.id==id&&(s.q||0)==(q||0))return i;}return -1;}
function invAdd(id,n,q){n=n||1;q=q||0;const isTool=ITEMS[id]&&ITEMS[id].cat=='tool';
 if(!isTool){const i=invFind(id,q);if(i>=0){S.inv[i].n+=n;return true;}}
 for(let i=0;i<S.invSize;i++)if(!S.inv[i]){S.inv[i]={id,n,q};return true;}
 return false;}
function give(id,n,q,x,y){if(!S.found[id]&&ITEMS[id]&&ITEMS[id].cat!='tool'){S.found[id]=1;}
 if(invAdd(id,n,q)){if(x!=null)addFloat('+'+n+' '+ITEMS[id].n,x,y,q==2?'#ffd700':q==1?'#dde':'#fff');SFX.play('pick');return true;}
 // 背包满，掉落在地
 const m=CUR;const tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);
 toast('背包满了！'+ITEMS[id].n+'掉在了地上','warn');
 for(let r=0;r<4;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const k=K(tx+dx,ty+dy);if(!m.obj[k]&&!isSolid(m,tx+dx,ty+dy)){m.obj[k]={t:'drop',id,n,q};return false;}}
 return false;}
function countItem(id){let c=0;for(let i=0;i<S.invSize;i++){const s=S.inv[i];if(s&&matchIng(s.id,id))c+=s.n;}return c;}
function matchIng(sid,ing){if(ing[0]!='@')return sid==ing;const it=ITEMS[sid];const k=ing.slice(1);if(!it)return false;
 if(k=='berry')return it.shape=='berry';if(k=='flower')return it.shape=='flower';return it.cat==k;}
function removeItem(id,n){for(let i=0;i<S.invSize&&n>0;i++){const s=S.inv[i];if(s&&matchIng(s.id,id)){const t=Math.min(n,s.n);s.n-=t;n-=t;if(s.n<=0)S.inv[i]=null;}}}
function hasCost(c){for(const k in c){if(k=='money'){if(S.money<c[k])return false;}else if(countItem(k)<c[k])return false;}return true;}
function payCost(c){for(const k in c){if(k=='money')S.money-=c[k];else removeItem(k,c[k]);}}
function costStr(c){return Object.entries(c).filter(([k,v])=>v>0).map(([k,v])=>k=='money'?v+'金':(k[0]=='@'?{'@fish':'任意鱼','@gem':'任意宝石','@forage':'任意采集物','@berry':'任意浆果'}[k]:ITEMS[k].n)+'×'+v).join('，');}
function selItem(){return S.inv[S.sel];}
function consumeSel(n){const s=S.inv[S.sel];if(!s)return;s.n-=(n||1);if(s.n<=0)S.inv[S.sel]=null;}
function sellPrice(id,q){const it=ITEMS[id];return Math.floor((it.p||0)*(q==2?1.5:q==1?1.25:1));}
// ---------- 地图 ----------
function enterMap(id,tx,ty){
 if(id.startsWith('mine')){const f=parseInt(id.slice(4));MAPS[id]=genMine(f,S.seed+S.day*31+S.season*977+S.year*8191);if(f>S.mineMax){S.mineMax=f;}
  const st=MAPS[id].start;tx=st[0];ty=st[1];
  for(const k in MAPS)if(k.startsWith('mine')&&k!=id)delete MAPS[k];
  if(f>0)toast('矿井 第'+f+'层'+(f%5==0&&f<40?'（电梯已解锁）':''));}
 S.map=id;CUR=MAPS[id];P.x=tx*16+8;P.y=ty*16+8;FISHING=null;
 if(id=='town')NPCSYS.place();
 if(id=='farm')ANIM.place();
}
function tileAt(px,py){return [Math.floor(px/16),Math.floor(py/16)];}
function facingTile(){const [x,y]=tileAt(P.x,P.y);return [x+DX[P.dir],y+DY[P.dir]];}
function targetTile(){if(INPUT.mouseTile&&INPUT.mouseFresh){const [px_,py_]=tileAt(P.x,P.y);const [mx,my]=INPUT.mouseTile;if(Math.abs(mx-px_)<=1&&Math.abs(my-py_)<=1&&!(mx==px_&&my==py_)){const dx=mx-px_,dy=my-py_;if(Math.abs(dx)>=Math.abs(dy))P.dir=dx>0?1:3;else P.dir=dy>0?0:2;return [mx,my];}}return facingTile();}
function spawnForage(m,n){const r=Math.random;const list=FORAGE[S.season];let tries=0;
 while(n>0&&tries++<500){const x=1+Math.floor(r()*(m.w-2)),y=1+Math.floor(r()*(m.h-2));const t=getT(m,x,y);const k=K(x,y);if(m.obj[k]||m.soil[k])continue;
  if(t=='G'&&!(m.id=='farm'&&x>=5&&x<=40&&y<=12)){const f=list[Math.floor(r()*list.length)];m.obj[k]={t:'forage',id:f[0]};n--;}
  else if(t=='S'){const f=BEACH_FORAGE[Math.floor(r()*3)];m.obj[k]={t:'forage',id:r()<.2?'seaweed':f[0]};n--;}}}
// ---------- 能量 ----------
function useEnergy(n){if(S.energy<=0){toast('太累了……先吃点东西或回家睡觉吧','warn');return false;}S.energy=Math.max(0,S.energy-n);if(S.energy==0)toast('你已筋疲力尽！','warn');return true;}
// ---------- 工具使用 ----------
function toolArea(tool,tx,ty){const tier=S.tools[tool];const out=[[tx,ty]];if(tier==0)return out;
 if(tier==3){out.length=0;const cx=tx+DX[P.dir],cy=ty+DY[P.dir];for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)out.push([cx+i,cy+j]);return out;}
 const len=tier==1?3:5;for(let i=1;i<len;i++)out.push([tx+DX[P.dir]*i,ty+DY[P.dir]*i]);return out;}
function doUse(){
 if(UI.open)return;
 if(FISHING){FISHING.press=true;return;}
 const s=selItem();const [tx,ty]=targetTile();const m=CUR;const k=K(tx,ty);const o=m.obj[k];const soil=m.soil[k];
 // 收获优先
 if(soil&&soil.crop&&isReady(soil.crop)&&(!s||ITEMS[s.id].cat!='tool'||s.id=='hoe'||s.id=='can')){harvest(m,tx,ty);return;}
 if(o&&(o.t=='forage'||o.t=='drop'||o.t=='fegg')){pickObj(m,tx,ty);return;}
 if(!s){doInteract();return;}
 const it=ITEMS[s.id];P.tool=s.id;P.toolT=.25;
 if(it.cat=='tool'){
  if(s.id=='hoe'){if(!useEnergy(2))return;SFX.play('hoe');let did=0;for(const [x,y] of toolArea('hoe',tx,ty)){if(tillTile(m,x,y))did++;}if(!did)SFX.play('thud');}
  else if(s.id=='can'){if(isWater(m,tx,ty)||(m.id=='farm'&&getT(m,tx,ty)=='L')){S.water=40+15*S.tools.can;SFX.play('water');toast('洒水壶已装满');return;}
   if(S.water<=0){toast('洒水壶空了，去水边装水','warn');return;}if(!useEnergy(2))return;SFX.play('water');
   for(const [x,y] of toolArea('can',tx,ty)){const so=m.soil[K(x,y)];if(so&&S.water>0){so.wet=1;S.water--;for(let i=0;i<4;i++)FX.parts.push({x:x*16+8,y:y*16+8,vx:(Math.random()-.5)*30,vy:-Math.random()*30,c:'#7ac0f0',t:.4});}}}
  else if(s.id=='axe'){if(!useEnergy(2))return;chop(m,tx,ty);}
  else if(s.id=='pick'){if(!useEnergy(2))return;mineTile(m,tx,ty);}
  else if(s.id=='rod'){startCast();}
  else if(s.id=='sword'){swing();}
  return;}
 if(it.cat=='seed'){if(it.tree){plantTree(m,tx,ty,it.tree);return;}plantSeed(m,tx,ty,s);return;}
 if(it.cat=='fert'){if(soil&&!soil.fert&&(!soil.crop||soil.crop.age==0)){soil.fert=s.id;consumeSel();SFX.play('pick');toast('已施'+it.n);}else toast('只能施在空耕地或刚种下的地里','warn');return;}
 if(it.cat=='place'){placeObj(m,tx,ty,s);return;}
 if(s.id=='stairs'){if(m.id.startsWith('mine')&&!o&&!isSolid(m,tx,ty)){m.obj[k]={t:'ladder'};consumeSel();SFX.play('hoe');}else toast('只能在矿井空地使用','warn');return;}
 if(it.edible){eat(s);return;}
 doInteract();
}
function eat(s){const it=ITEMS[s.id];if(S.energy>=S.maxEnergy&&S.hp>=S.maxHp){toast('现在不饿');return;}
 S.energy=Math.min(S.maxEnergy,S.energy+it.edible);S.hp=Math.min(S.maxHp,S.hp+Math.round(it.edible*.45));consumeSel();SFX.play('eat');toast('吃下了'+it.n+'  体力+'+it.edible);}
function tillTile(m,x,y){if(m.id!='farm')return false;const k=K(x,y);const t=getT(m,x,y);if(m.obj[k]||m.soil[k])return false;if(t!='G'&&t!='D')return false;
 m.soil[k]={wet:S.weather=='rain'||S.weather=='storm'?1:0,crop:null,fert:null};
 if(Math.random()<.02){const a=ARTIFACTS[Math.floor(Math.random()*ARTIFACTS.length)][0];give(a,1,0,x*16,y*16);toast('挖到了古物：'+ITEMS[a].n+'！');}
 return true;}
function plantSeed(m,x,y,s){const so=m.soil[K(x,y)];const it=ITEMS[s.id];const C=CROPS[it.crop];
 if(!so){toast('需要先用锄头开垦耕地','warn');return;}if(so.crop){toast('这里已经种了东西','warn');return;}
 if(!C.seasons.includes(S.season)){toast(C.n+'不适合在'+SEASONS[S.season]+'季种植','warn');return;}
 so.crop={id:C.id,age:0,dead:0};so.crop._so=so;consumeSel();SFX.play('plant');}
function cropDays(c,so){const C=CROPS[c.id];return so&&so.fert=='speedgro'?Math.max(1,Math.round(C.days*.75)):C.days;}
function isReady(c){return c&&!c.dead&&c.age>=cropDays(c,c._so);}
function harvest(m,x,y){const so=m.soil[K(x,y)];const c=so.crop;const C=CROPS[c.id];
 const fl=so.fert=='qfert'?2:so.fert=='fertilizer'?1:0;const r=Math.random();const q=r<.02+fl*.12?2:r<.12+fl*.2?1:0;
 let n=1;if(['blueberry','cranberry','grape'].includes(c.id))n=2+(Math.random()<.3?1:0);if(c.id=='pea'||c.id=='tomato'||c.id=='chili')n=Math.random()<.2?2:1;
 if(!give(c.id,n,q,x*16,y*16-8))return;
 if(C.regrow){c.age=cropDays(c,so)-C.regrow;}else so.crop=null;
 SFX.play('harvest');}
function pickObj(m,x,y){const k=K(x,y);const o=m.obj[k];
 if(o.t=='fegg'){delete m.obj[k];if(FEST){FEST.score++;SFX.play('pick');addFloat('彩蛋 '+FEST.score,x*16,y*16,'#ff9ad0');}return;}
 if(o.t=='drop'){if(give(o.id,o.n,o.q,x*16,y*16))delete m.obj[k];return;}
 if(give(o.id,1,Math.random()<.1?1:0,x*16,y*16))delete m.obj[k];}
function chop(m,x,y){const k=K(x,y);const o=m.obj[k];SFX.play('chop');
 if(!o){return;}
 const pw=1+S.tools.axe;
 if(o.t=='tree'){if(o.stage<3){delete m.obj[k];give(o.kind=='pine'?'pinecone':'acorn',1,0,x*16,y*16);return;}
  o.hp-=pw;o.shake=.3;if(o.hp<=0){give('wood',8+Math.floor(Math.random()*5),0,x*16,y*16-16);if(Math.random()<.5)give('sap',1+Math.floor(Math.random()*3));if(Math.random()<.4)give(o.kind=='pine'?'pinecone':'acorn',1);
   m.obj[k]={t:'stump',hp:4,kind:o.kind,regrow:o.regrow?S.stats.days+10:0};SFX.play('fall');}return;}
 if(o.t=='stump'){o.hp-=pw;if(o.hp<=0){give('wood',3+Math.floor(Math.random()*3),0,x*16,y*16);if(o.regrow)m.obj[k]={t:'sprout',kind:o.kind,at:o.regrow};else delete m.obj[k];}return;}
 if(o.t=='log'){if(S.tools.axe<1){toast('需要铜斧头才能劈开大木桩','warn');return;}o.hp-=pw;if(o.hp<=0){delete m.obj[k];give('hardwood',2+Math.floor(Math.random()*2),0,x*16,y*16);}return;}
 if(o.t=='twig'){delete m.obj[k];give('wood',1+Math.floor(Math.random()*2),0,x*16,y*16);return;}
 if(o.t=='weed'){delete m.obj[k];if(Math.random()<.6)give('fiber',1,0,x*16,y*16);return;}
}
function mineTile(m,x,y){const k=K(x,y);const o=m.obj[k];SFX.play('pick2');const so=m.soil[k];
 if(!o){if(so&&!so.crop){delete m.soil[k];}return;}
 const pw=1+S.tools.pick;
 if(o.t=='rock'){o.hp-=pw;if(o.hp>0){o.shake=.2;return;}delete m.obj[k];SFX.play('break');
  const drop={stone:['stone',1+Math.floor(Math.random()*2)],small:['stone',1],copper:['copper_ore',1+Math.floor(Math.random()*3)],iron:['iron_ore',1+Math.floor(Math.random()*2)],gold:['gold_ore',1+Math.floor(Math.random()*2)],coal:['coal',1]};
  if(o.kind=='gem'){const fl=m.floor||0;const pool=fl<15?['quartz','amethyst','topaz']:fl<30?['amethyst','topaz','jade','aquamarine','frostgem']:['jade','ruby','aquamarine','diamond'];give(pool[Math.floor(Math.random()*pool.length)],1,0,x*16,y*16);}
  else if(o.kind=='frost'){give('frostgem',1,0,x*16,y*16);give('stone',1);}
  else{const d=drop[o.kind];give(d[0],d[1],0,x*16,y*16);}
  if(m.floor&&o.kind=='stone'&&Math.random()<.04)give('coal',1);
  if(m.floor&&Math.random()<.012){const a=ARTIFACTS[Math.floor(Math.random()*ARTIFACTS.length)][0];give(a,1,0,x*16,y*16);toast('发现古物：'+ITEMS[a].n);}
  if(m.floor){m.rocksLeft--;const hasL=Object.values(m.obj).some(o=>o.t=='ladder');if(!hasL&&(Math.random()<.05+1/(m.rocksLeft+3)||m.rocksLeft<4)){m.obj[k]={t:'ladder'};SFX.play('ladder');toast('发现了向下的梯子！');}}
  return;}
 if(o.t=='boulder'){if(S.tools.pick<1){toast('需要铜镐子才能敲碎大石头','warn');return;}o.hp-=pw;if(o.hp<=0){delete m.obj[k];give('stone',12,0,x*16,y*16);}return;}
 if(o.t=='weed'||o.t=='twig'){chop(m,x,y);return;}
 if(['chest','sprinkler','qsprinkler','furnace','path'].includes(o.t)){
  if(o.t=='chest'&&o.items.some(Boolean)){toast('箱子不是空的','warn');return;}
  if(o.t=='furnace'&&o.input){toast('熔炉正在工作','warn');return;}
  delete m.obj[k];give(o.t=='path'?'path':o.t,1,0,x*16,y*16);}
}
function plantTree(m,x,y,kind){const k=K(x,y);if(m.id!='farm'||m.obj[k]||m.soil[k]||getT(m,x,y)!='G'){toast('这里种不了树','warn');return;}m.obj[k]={t:'tree',kind,stage:0,hp:10,g:0};consumeSel();SFX.play('plant');}
function placeObj(m,x,y,s){const k=K(x,y);if(m.obj[k]||isSolid(m,x,y)||m.id.startsWith('mine')){toast('这里放不下','warn');return;}
 const so=m.soil[k];if(so&&so.crop){toast('这里有作物','warn');return;}
 if(s.id=='chest')m.obj[k]={t:'chest',items:new Array(24).fill(null)};
 else if(s.id=='path')m.obj[k]={t:'path'};
 else if(s.id=='furnace')m.obj[k]={t:'furnace',input:null,ready:0};
 else m.obj[k]={t:s.id};
 if(so)delete m.soil[k];consumeSel();SFX.play('place');}
// ---------- 互动 ----------
function doInteract(){
 if(UI.open)return;if(FISHING)return;
 const [tx,ty]=targetTile();const m=CUR;const k=K(tx,ty);const o=m.obj[k];const so=m.soil[k];
 // NPC
 const npc=NPCSYS.at(tx,ty);if(npc){NPCSYS.interact(npc);return;}
 const an=ANIM.at(tx,ty);if(an){ANIM.pet(an);return;}
 if(so&&so.crop&&isReady(so.crop)){harvest(m,tx,ty);return;}
 if(o){
  if(o.t=='forage'||o.t=='drop'||o.t=='fegg'){pickObj(m,tx,ty);return;}
  if(o.t=='chest'){UI.chest(o);return;}
  if(o.t=='bin'){UI.ship();return;}
  if(o.t=='furnace'){furnaceUse(o);return;}
  if(o.t=='ladder'){const f=(m.floor||0)+1;enterMap('mine'+f);SFX.play('ladder');return;}
  if(o.t=='exit'){enterMap('town',21,4);return;}
  if(o.t=='elevator'){UI.elevator();return;}
  if(o.t=='treasure'){delete m.obj[k];give('gold_bar',5);give('diamond',2);give('qsprinkler',2);S.money+=5000;toast('矿井最深处的宝箱！获得金锭×5、星钻×2、高级洒水器×2、5000金','gold');S.found.treasure=1;return;}
  if(o.t=='bld'){bldAction(m,o.b);return;}
 }
 if(isWater(m,tx,ty)&&selItem()&&selItem().id=='can'){doUse();return;}
}
function bldAction(m,bi){if(bi<0){if(FEST){toast('节日期间矿井关闭');return;}enterMap('mine0');SFX.play('door');return;}
 const b=m.bld[bi];const h=hour();
 if(b.act=='house'){UI.house();return;}
 if(b.act=='coop'||b.act=='barn'){UI.animalHouse(b.act);return;}
 if(b.act=='npchome'){toast('这是村民的家，门锁着。');return;}
 if(FEST){toast('今天是节日，店铺都关门了');return;}
 const hrs=SHOP_HOURS[b.act];if(hrs&&(h<hrs[0]||h>=hrs[1])){toast(`营业时间 ${hrs[0]}:00 - ${hrs[1]}:00`,'warn');return;}
 if(b.act=='museum'){UI.museum();return;}
 UI.shop(b.act);}
function furnaceUse(o){
 if(o.input){if(S.time+S.stats.days*1440>=o.ready){if(give(o.input,1)){toast('取出'+ITEMS[o.input].n);o.input=null;}}else toast('冶炼中…还需'+Math.ceil((o.ready-S.time-S.stats.days*1440)/60)+'小时');return;}
 const s=selItem();const map={copper_ore:'copper_bar',iron_ore:'iron_bar',gold_ore:'gold_bar'};
 if(!s||!map[s.id]){toast('手持5个矿石并有1块煤炭即可冶炼','warn');return;}
 if(s.n<5||countItem('coal')<1){toast('需要5个'+ITEMS[s.id].n+'和1块煤炭','warn');return;}
 consumeSel(5);removeItem('coal',1);o.input=map[s.id];o.ready=S.time+S.stats.days*1440+(s.id=='copper_ore'?30:s.id=='iron_ore'?120:300);SFX.play('fire');toast('开始冶炼'+ITEMS[o.input].n);}
// ---------- 战斗 ----------
function swing(){P.tool='sword';P.toolT=.3;SFX.play('swing');const m=CUR;const [tx,ty]=facingTile();const o=m.obj[K(tx,ty)];if(o&&o.t=='weed')chop(m,tx,ty);
 if(!m.monsters)return;const dmg=SWORDS[S.tools.sword][2]+Math.floor(Math.random()*4);
 const hx=P.x+DX[P.dir]*14,hy=P.y-6+DY[P.dir]*14;
 for(const mo of m.monsters){if(mo.hp<=0)continue;if(Math.hypot(mo.x-hx,mo.y-hy)<18){mo.hp-=dmg;mo.kb=.2;mo.kx=DX[P.dir]*120;mo.ky=DY[P.dir]*120;addFloat(dmg,mo.x,mo.y-10,'#ff6');SFX.play('hit');
  if(mo.hp<=0){const d={slime:'goo',frostslime:'goo',redslime:'goo',bat:'batwing',golem:'stone'}[mo.type];if(Math.random()<.7)give(d,1+(mo.type=='golem'?3:0),0,mo.x,mo.y);
   if(Math.random()<.15)give(m.floor>=30?'gold_ore':m.floor>=15?'iron_ore':'copper_ore',2);if(Math.random()<.04)give('coal',1);
   if(m.monsters.every(x=>x.hp<=0)&&!Object.values(m.obj).some(o=>o.t=='ladder')){const fx=Math.floor(mo.x/16),fy=Math.floor(mo.y/16);if(!m.obj[K(fx,fy)]&&getT(m,fx,fy)=='C'){m.obj[K(fx,fy)]={t:'ladder'};toast('怪物清空，梯子出现了！');}}}}}}
function updateMonsters(dt){const m=CUR;if(!m.monsters)return;
 for(const mo of m.monsters){if(mo.hp<=0)continue;mo.f+=dt*4;
  let vx=0,vy=0;if(mo.kb>0){mo.kb-=dt;vx=mo.kx;vy=mo.ky;}else{const dx=P.x-mo.x,dy=P.y-6-mo.y,d=Math.hypot(dx,dy);if(d<16*7&&d>1){vx=dx/d*mo.spd*28;vy=dy/d*mo.spd*28;if(mo.type=='bat'){vx+=Math.sin(mo.f*2)*20;}}}
  const nx=mo.x+vx*dt,ny=mo.y+vy*dt;const fly=mo.type=='bat';
  if(fly||!isSolid(m,Math.floor(nx/16),Math.floor(mo.y/16)))mo.x=nx;if(fly||!isSolid(m,Math.floor(mo.x/16),Math.floor(ny/16)))mo.y=ny;
  mo.x=Math.max(16,Math.min(m.w*16-16,mo.x));mo.y=Math.max(16,Math.min(m.h*16-16,mo.y));
  if(mo.cd>0)mo.cd-=dt;
  if(Math.hypot(P.x-mo.x,P.y-6-mo.y)<12&&P.inv<=0){S.hp-=mo.dmg;P.inv=1;SFX.play('hurt');addFloat('-'+mo.dmg,P.x,P.y-24,'#f55');const d=Math.hypot(P.x-mo.x,P.y-mo.y)||1;tryMove((P.x-mo.x)/d*10,(P.y-mo.y)/d*10);
   if(S.hp<=0){S.hp=0;passOut('mine');}}}
}
// ---------- 钓鱼 ----------
function startCast(){const m=CUR;let wx=null,wy=null;const [px_,py_]=tileAt(P.x,P.y);
 for(let d=1;d<=3;d++){const x=px_+DX[P.dir]*d,y=py_+DY[P.dir]*d;if(isWater(m,x,y)){wx=x;wy=y;if(d>=2)break;}}
 if(wx==null){toast('面朝水面才能抛竿','warn');return;}
 if(!useEnergy(4))return;
 const bait=countItem('bait')>0;if(bait)removeItem('bait',1);
 FISHING={phase:'wait',t:1.5+Math.random()*(bait?3:6),bx:wx*16+8,by:wy*16+8,water:m.id.startsWith('mine')?'mine':getT(m,wx,wy)=='O'?'ocean':getT(m,wx,wy)=='L'?'lake':'river'};SFX.play('cast');}
function pickFish(water){const h=hour();const wet=S.weather=='rain'||S.weather=='storm';
 const pool=FISH_LIST.map(f=>FISH[f[0]]).filter(f=>f.water==water&&f.seasons.includes(S.season)&&h>=f.time[0]&&h<f.time[1]&&(f.weather=='any'||(f.weather=='rain'?wet:!wet)));
 if(Math.random()<.08||!pool.length)return water=='ocean'&&Math.random()<.5?'seaweed':'trash';
 let tot=0;const w=pool.map(f=>{const v=(f.id=='goldscale'?.3:1)*(110-f.diff);tot+=v;return v;});let r=Math.random()*tot;for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i].id;}return pool[0].id;}
function updateFishing(dt){const F=FISHING;if(!F)return;
 if(F.phase=='wait'){F.t-=dt;if(F.press){F.press=false;FISHING=null;toast('收竿了');return;}if(F.t<=0){F.phase='bite';F.t=1.1;SFX.play('bite');}return;}
 if(F.phase=='bite'){F.t-=dt;if(F.press){F.press=false;const id=pickFish(F.water);const fi=FISH[id];
   if(!fi){FISHING=null;give(id,1,0,P.x,P.y-20);return;}
   F.phase='game';F.id=id;F.diff=fi.diff;F.beh=fi.beh;F.fy=.5;F.fv=0;F.target=.5;F.bar=.8;F.bv=0;F.prog=.3;F.perfect=true;F.tt=0;return;}
  if(F.t<=0){FISHING=null;toast('鱼跑掉了……');}return;}
 if(F.phase=='game'){F.tt+=dt;const D=F.diff/100;
  // 鱼的运动
  if(Math.random()<dt*(1+D*3)*(F.beh=='dart'?1.8:1)){F.target=Math.random();if(F.beh=='sinker')F.target=.5+Math.random()*.5;if(F.beh=='floater')F.target=Math.random()*.5;}
  const acc=(F.target-F.fy)*(2+D*8)*(F.beh=='smooth'?.6:1);F.fv+=acc*dt;F.fv*=Math.pow(.2,dt);F.fy=Math.max(0,Math.min(1,F.fy+F.fv*dt*(1+D)));
  // 玩家条
  const size=.24+.04*S.tools.rod;const hold=INPUT.holdUse();F.bv+=(hold?-2.4:2.0)*dt;F.bv=Math.max(-1.6,Math.min(1.6,F.bv));F.bar+=F.bv*dt;
  if(F.bar<0){F.bar=0;F.bv=Math.max(0,F.bv)*-.3;}if(F.bar>1-size){F.bar=1-size;F.bv=Math.min(0,F.bv)*-.3;}
  const inside=F.fy>=F.bar&&F.fy<=F.bar+size;F.inside=inside;F.size=size;
  F.prog+=(inside?.32:-(.18+D*.2))*dt;if(!inside)F.perfect=false;
  if(F.prog>=1){const q=F.perfect?2:F.diff<40&&Math.random()<.3?1:0;S.fish[F.id]=(S.fish[F.id]||0)+1;give(F.id,1,q,P.x,P.y-20);SFX.play('catch');toast('钓到了'+ITEMS[F.id].n+'！'+(F.perfect?'（完美！）':''),'gold');if(FEST&&FEST.id=='icefish')FEST.score++;FISHING=null;}
  else if(F.prog<=0){toast('鱼挣脱了……');FISHING=null;SFX.play('thud');}
 }}
// ---------- 移动 ----------
function canStand(x,y){const m=CUR;const pts=[[x-5,y-3],[x+5,y-3],[x-5,y+2],[x+5,y+2]];for(const [a,b] of pts){if(isSolid(m,Math.floor(a/16),Math.floor(b/16)))return false;}return true;}
function tryMove(dx,dy){let moved=false;if(dx&&canStand(P.x+dx,P.y)){P.x+=dx;moved=true;}if(dy&&canStand(P.x,P.y+dy)){P.y+=dy;moved=true;}
 P.x=Math.max(4,Math.min(CUR.w*16-4,P.x));P.y=Math.max(4,Math.min(CUR.h*16-2,P.y));return moved;}
function updatePlayer(dt){
 if(P.inv>0)P.inv-=dt;if(P.toolT>0)P.toolT-=dt;
 if(UI.open||FISHING&&FISHING.phase=='game'){P.moving=false;return;}
 let [mx,my]=INPUT.move();
 if(FISHING&&(mx||my)){FISHING=null;}
 if(mx||my){const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}const spd=(S.energy<=0?55:80)*dt;
  if(Math.abs(mx)>Math.abs(my))P.dir=mx>0?1:3;else P.dir=my>0?0:2;
  const moved=tryMove(mx*spd,my*spd);P.moving=true;P.anim+=dt*8;
  if(!moved){P.bump+=dt;if(P.bump>.15){P.bump=-1;const [tx,ty]=facingTile();const o=CUR.obj[K(tx,ty)];if(o&&o.t=='bld'){const b=o.b<0?null:CUR.bld[o.b];if(o.b<0||b&&b.door.x==tx&&b.door.y==ty)bldAction(CUR,o.b);}}}else P.bump=0;
  INPUT.mouseFresh=false;
 }else{P.moving=false;P.bump=0;}
 // 传送
 const [tx,ty]=tileAt(P.x,P.y);for(const w of CUR.warps){if(tx>=w.x&&tx<w.x+w.w&&ty>=w.y&&ty<w.y+w.h){if(FEST&&FEST.lock)return;enterMap(w.to,w.tx,w.ty+(ty-w.y));return;}}
 const o=CUR.obj[K(tx,ty)];if(o&&o.t=='fegg')pickObj(CUR,tx,ty);
 const tk=K(tx,ty);if(P.lastTile!==tk){const was=P.lastTile;P.lastTile=tk;if(was&&o&&P.moving){if(o.t=='ladder'){enterMap('mine'+((CUR.floor||0)+1));SFX.play('ladder');P.lastTile=null;}else if(o.t=='exit'){enterMap('town',21,4);P.lastTile=null;}}}
}
// ---------- 时间 ----------
let clockAcc=0;
function updateClock(dt){if(UI.open&&!UI.liveClock)return;if(FEST&&FEST.lock)return;clockAcc+=dt*(S.settings.speed||1);
 while(clockAcc>=7){clockAcc-=7;S.time+=10;onTick();if(S.time>=26*60){passOut('late');return;}}}
function onTick(){
 // 雨天/雷雨
 if(S.time%60==0){if(S.time==20*60)toast('天色渐晚了');if(S.time==24*60)toast('已经午夜了，该回家睡觉了','warn');if(S.time==25*60+30)toast('快凌晨2点了！再不睡会晕倒！','warn');}
 if(CUR.id=='town')NPCSYS.tick();
 if(FEST&&!FEST.lock&&S.time>=14*60){FEST=null;toast('节日结束了');}
 if(!FEST&&isFestDay()&&S.time>=9*60&&S.time<14*60&&!S.festDone[festKey()]){toast(FESTIVALS[S.season].n+'正在小镇广场举行！','gold');}
}
function isFestDay(){const f=FESTIVALS[S.season];return f&&f.day==S.day;}
function festKey(){return S.year+'-'+S.season;}
function passOut(why){
 const loss=Math.min(1000,Math.floor(S.money*.1));S.money-=loss;S.stats.passout++;
 UI.closeAll();FISHING=null;FEST=null;
 toast(why=='mine'?`你在矿井里晕倒了……被救回家，损失${loss}金`:`你累得晕倒了……醒来发现少了${loss}金`,'warn');
 endDay(true);}
function sleep(){endDay(false);}
// ---------- 日结 ----------
function endDay(passed){
 // 出货结算
 let total=0;const lines=[];
 for(const s of S.bin){const v=sellPrice(s.id,s.q)*s.n;total+=v;lines.push([s.id,s.n,s.q,v]);S.shipped[s.id]=(S.shipped[s.id]||0)+s.n;}
 S.bin=[];S.money+=total;S.stats.earned+=total;
 S.lastSummary={lines,total,passed};
 const prevSeason=S.season;
 S.stats.days++;S.day++;if(S.day>28){S.day=1;S.season=(S.season+1)%4;if(S.season==0)S.year++;}
 S.weather=S.tomorrow;S.tomorrow=rollWeather();if(S.day==1)S.weather='sun';if(isFestDay())S.weather='sun';
 S.time=360;const lack=passed?.5:(S.energy<=0?.6:1);S.energy=Math.round((S.maxEnergy)*lack);S.hp=S.maxHp;S.water=40+15*S.tools.can;
 // 农场作物
 const farm=MAPS.farm;const wetDay=S.weather=='rain'||S.weather=='storm';
 for(const k in farm.soil){const so=farm.soil[k];const c=so.crop;
  if(c){c._so=so;if(!c.dead&&so.wet)c.age=Math.min(c.age+1,cropDays(c,so));
   if(!c.dead&&S.season!=prevSeason&&!CROPS[c.id].seasons.includes(S.season))c.dead=1;}
  else if(!so.wet&&Math.random()<.1&&!so.fert){delete farm.soil[k];continue;}
  so.wet=0;if(S.season==3&&!c&&Math.random()<.5){}
 }
 for(const k in farm.obj){const o=farm.obj[k];if(o.t=='sprinkler'||o.t=='qsprinkler'){const [x,y]=k.split(',').map(Number);const r=o.t=='qsprinkler';for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!r&&i&&j)continue;const so=farm.soil[K(x+i,y+j)];if(so)so.wet=1;}}
  if(o.t=='tree'&&o.stage<3){o.g=(o.g||0)+1;if(o.g>=5){o.g=0;o.stage++;}}}
 if(wetDay||S.weather=='snow'&&false)for(const k in farm.soil)farm.soil[k].wet=1;
 // 冬季：耕地上的作物在户外无法生长（冬白菜除外）
 // 小镇树木再生
 for(const mp of [farm,MAPS.town])for(const k in mp.obj){const o=mp.obj[k];if(o.t=='sprout'&&S.stats.days>=o.at)mp.obj[k]={t:'tree',kind:o.kind,stage:3,hp:10,regrow:1};if(o.t=='forage'&&Math.random()<.3)delete mp.obj[k];}
 // 杂物与采集物
 const r=Math.random;let n=Object.values(farm.obj).filter(o=>o.t=='weed'||o.t=='twig'||(o.t=='rock'&&o.kind=='small')).length>150?6:0;for(let i=0;i<40&&n<6;i++){const x=6+Math.floor(r()*44),y=13+Math.floor(r()*27);const k=K(x,y);if(farm.obj[k]||farm.soil[k]||getT(farm,x,y)!='G')continue;farm.obj[k]=r()<.5?{t:'weed',v:Math.floor(r()*9)}:r()<.5?{t:'rock',kind:'small',hp:1,v:0}:{t:'twig'};n++;}
 spawnForage(MAPS.town,6);spawnForage(farm,2);
 // 动物
 ANIM.night();
 // 好感
 for(const id in S.friends){const f=S.friends[id];if(!f.talk&&f.pts>0&&f.pts<2500)f.pts=Math.max(0,f.pts-2);f.talk=0;f.gift=0;if(weekday()==0)f.week=0;}
 FEST=null;
 enterMap('farm',10,8);P.dir=0;
 saveGame();
 UI.summary(S.lastSummary);
}
function rollWeather(){const r=Math.random();const s=S.season;if(s==3)return r<.35?'snow':'sun';if(s==1)return r<.12?'storm':r<.25?'rain':'sun';return r<.22?'rain':'sun';}
// ---------- 存档 ----------
function packMap(m){return {obj:m.obj,soil:m.soil};}
function saveGame(){try{const crops=[];const data={S,farm:packMap(MAPS.farm),town:packMap(MAPS.town)};
 const json=JSON.stringify(data,(k,v)=>k=='_so'?undefined:v);localStorage.setItem(SAVE_KEY,json);return json;}catch(e){console.error(e);toast('存档失败：'+e.message,'warn');}}
function loadData(data){S=data.S;MAPS.farm=genFarm();MAPS.town=genTown();MAPS.farm.obj=data.farm.obj;MAPS.farm.soil=data.farm.soil;MAPS.town.obj=data.town.obj;MAPS.town.soil=data.town.soil||{};
 // 重建建筑引用
 for(const b of ['coop','barn'])if(S[b])buildFarmBld(b,true);
 for(const k in MAPS.farm.soil){const so=MAPS.farm.soil[k];if(so.crop)so.crop._so=so;}
 S.settings=Object.assign({music:true,sfx:true,speed:1},S.settings||{});
 enterMap('farm',10,8);}
function loadGame(){const j=localStorage.getItem(SAVE_KEY);if(!j)return false;loadData(JSON.parse(j));return true;}
function buildFarmBld(kind,reload){const m=MAPS.farm;const x=kind=='coop'?22:28,y=3;
 if(!reload)for(let j=y;j<y+4;j++)for(let i=x;i<x+4;i++){delete m.obj[K(i,j)];delete m.soil[K(i,j)];}
 m.bld=m.bld.filter(b=>b.kind!=kind);addBld(m,kind,x,y,4,4,kind,2);
 if(reload){}}
