// 程序化像素美术（原创）
'use strict';
const ART={cache:{}};
function hsh(x,y,s){let h=(x*374761393+y*668265263+(s||0)*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];}
function spr(key,w,h,fn){let c=ART.cache[key];if(c)return c;const [cv,x]=mk(w,h);fn(x,w,h);ART.cache[key]=cv;return cv;}
function px(x,a,b,c,w,h){x.fillStyle=c;x.fillRect(a,b,w||1,h||1);}
function shade(hex,f){let n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const m=v=>Math.max(0,Math.min(255,Math.round(f>0?v+(255-v)*f:v*(1+f))));return '#'+((1<<24)|(m(r)<<16)|(m(g)<<8)|m(b)).toString(16).slice(1);}
const SEASON_GRASS=['#6fbf4a','#5aaa3a','#c99a3a','#e8eef4'];
const SEASON_GRASS2=['#5aa83a','#4a962e','#b07a2a','#d0dce8'];
// ---------- 地块 ----------
function tileSpr(t,season,v){
 return spr('t'+t+season+v,16,16,(x)=>{
  const g=SEASON_GRASS[season],g2=SEASON_GRASS2[season];
  const speck=(base,c2,n,seed)=>{px(x,0,0,base,16,16);for(let i=0;i<n;i++){px(x,Math.floor(hsh(i,v,seed)*16),Math.floor(hsh(v,i,seed+1)*16),c2,1,1);}};
  switch(t){
   case 'G':speck(g,g2,14,1);if(v%5==0&&season<3){px(x,4,6,shade(g,.25));px(x,4,5,shade(g,.25));px(x,11,10,shade(g,.25));px(x,11,9,shade(g,.25));}break;
   case 'D':speck('#b08a5a','#9a7448',10,2);break;
   case 'S':speck('#ecd9a0','#d8c288',10,3);break;
   case 'P':speck('#c8b48a','#b09a70',8,4);px(x,0,0,'#d8c49a',16,1);break;
   case 'F':speck('#a07a50','#8a6640',4,5);for(let i=0;i<16;i+=4)px(x,0,i,'#8a6640',16,1);break;
   case 'C':speck('#5a5060','#4a4050',12,6);break; // 矿洞地面
   case 'K':speck('#3a3040','#2a2030',8,7);px(x,0,13,'#1a1020',16,3);break; // 矿洞墙
   case 'W':case 'L':case 'O':{const base=t=='O'?'#3a7ac8':t=='L'?'#3a8ab8':'#4a98c8';px(x,0,0,season==3&&t!='O'?'#bfe0f0':base,16,16);for(let i=0;i<4;i++){const a=Math.floor(hsh(i,v,8)*12),b=Math.floor(hsh(v,i,9)*15);px(x,a,b,season==3&&t!='O'?'#e8f6ff':shade(base,.35),4,1);}break;}
   case 'B':speck('#7a6a5a','#6a5a4a',6,10);break;
   case 'X':speck('#3a5a2a','#2a4a1a',10,11);break; // 深林地面（不可走）
   case 'R':speck('#9a8a7a','#8a7a6a',10,12);break; // 广场砖
  }});
}
function tilledSpr(wet){return spr('till'+wet,16,16,(x)=>{px(x,0,0,wet?'#5a3a22':'#8a5a32',16,16);for(let i=0;i<4;i++)px(x,1,2+i*4,wet?'#4a2e18':'#6a4426',14,1);px(x,0,0,wet?'#6a4a2a':'#9a6a3a',16,1);});}
// ---------- 物体 ----------
function treeSpr(kind,season,stage){return spr('tree'+kind+season+stage,32,48,(x)=>{
 if(stage<3){const s=stage;px(x,15,44-s*4,'#6b4423',2,4+s*4);const lc=season==3?'#7a9a8a':'#4caf50';px(x,12-s,38-s*6,lc,8+s*2,6+s*3);return;}
 px(x,13,30,'#6b4423',6,18);px(x,12,44,'#5a361a',8,4);px(x,14,32,'#8a5a32',2,12);
 let lc,lc2;if(kind=='pine'){lc=season==3?'#3a6a5a':'#2e6b3a';lc2=season==3?'#e8f0f4':'#3d8a4a';for(let i=0;i<4;i++){const w=8+i*6;px(x,16-w/2,4+i*8,lc,w,9);px(x,16-w/2+2,4+i*8,lc2,w-6,3);} if(season==3)for(let i=0;i<4;i++)px(x,16-(8+i*6)/2,4+i*8,'#f4f8fc',8+i*6,2);return;}
 lc=['#4caf50','#3d9a3d','#e0802a','#8a7a6a'][season];lc2=['#7ad06a','#5ab84a','#f0b040','#a89a8a'][season];
 if(season==3){px(x,8,10,'#6b4423',2,14);px(x,22,8,'#6b4423',2,16);px(x,6,10,'#f0f4f8',20,3);px(x,10,4,'#f0f4f8',12,3);return;}
 px(x,4,8,lc,24,22);px(x,8,2,lc,16,30);px(x,2,14,lc,28,12);
 for(let i=0;i<18;i++)px(x,4+Math.floor(hsh(i,1,kind.length)*22),4+Math.floor(hsh(1,i,3)*22),lc2,2,2);
 if(season==0)for(let i=0;i<6;i++)px(x,5+Math.floor(hsh(i,7,2)*22),5+Math.floor(hsh(7,i,2)*20),'#ffc0d8',2,2);});}
function stumpSpr(){return spr('stump',16,16,x=>{px(x,2,6,'#6b4423',12,9);px(x,3,5,'#a0703c',10,3);px(x,5,6,'#c9a063',6,1);});}
function rockSpr(kind,v){return spr('rock'+kind+v,16,16,x=>{
 const base=kind=='big'?'#8a8a8a':'#9a9a9a';const r=kind=='big'?0:2;
 px(x,2+r,4+r,base,12-r*2,10-r);px(x,3+r,3+r,shade(base,.2),10-r*2,3);px(x,2+r,12,shade(base,-.3),12-r*2,2);
 const ore={copper:'#e08a50',iron:'#e0e0f0',gold:'#ffd700',coal:'#1a1a1a',gem:'#c060ff',frost:'#bfe8ff'}[kind];
 if(ore){px(x,5,6,ore,2,2);px(x,9,8,ore,2,2);px(x,7,10,ore,1,1);px(x,10,5,ore,1,1);}});}
function weedSpr(season,v){return spr('weed'+season+v,16,16,x=>{const c=['#3d8a2a','#2e7a2a','#a07020','#7a8a7a'][season];for(let i=0;i<5;i++){const a=3+i*2+Math.floor(hsh(i,v,3)*2);px(x,a,7+(i%2)*2,c,1,8-(i%2)*2);px(x,a-1,8+(i%3),shade(c,.2),1,2);}});}
function twigSpr(){return spr('twig',16,16,x=>{px(x,3,10,'#7a4a22',10,2);px(x,9,8,'#7a4a22',2,2);px(x,4,9,'#a0703c',4,1);});}
function chestSpr(){return spr('chest',16,16,x=>{px(x,1,4,'#6b4423',14,11);px(x,2,5,'#b07a3a',12,4);px(x,2,10,'#a06a2a',12,4);px(x,7,8,'#ffd700',2,3);});}
function sprinklerSpr(q){return spr('spk'+q,16,16,x=>{px(x,5,8,q?'#c8a020':'#909098',6,6);px(x,6,5,q?'#ffd700':'#c0c0c8',4,4);px(x,7,3,'#5a9ad0',2,2);});}
function furnaceSpr(on){return spr('fur'+on,16,16,x=>{px(x,2,2,'#6a4a3a',12,13);px(x,3,3,'#8a5a3a',10,4);px(x,5,8,on?'#ff8030':'#2a1a1a',6,5);if(on)px(x,6,10,'#ffd040',4,2);});}
function pathSpr(){return spr('pathO',16,16,x=>{px(x,1,1,'#b0a890',14,14);px(x,2,2,'#c8c0a8',5,5);px(x,9,8,'#c8c0a8',5,5);});}
function ladderSpr(){return spr('ladder',16,16,x=>{px(x,2,2,'#1a1018',12,12);px(x,4,1,'#a0703c',2,14);px(x,10,1,'#a0703c',2,14);for(let i=3;i<15;i+=3)px(x,4,i,'#c9a063',8,1);});}
function binSpr(){return spr('bin',32,24,x=>{px(x,1,6,'#6b4423',30,17);px(x,2,7,'#a0703c',28,7);px(x,0,3,'#8a5a32',32,5);px(x,2,4,'#c9a063',28,1);px(x,13,14,'#ffd700',6,2);});}
// ---------- 作物 ----------
function cropSpr(id,stage,max,ready,dead){return spr('c'+id+stage+ready+dead,16,24,x=>{
 const C=CROPS[id];if(dead){px(x,7,14,'#6a5a3a',2,8);px(x,4,12,'#8a7a5a',8,2);return;}
 const g='#4caf50',g2='#2e7d32';
 if(stage==0){px(x,6,19,'#6a4426',4,2);px(x,7,18,'#8a6a3a',2,1);return;}
 const h=Math.min(16,4+stage*3);
 px(x,7,22-h,g2,2,h);for(let i=0;i<Math.min(stage+1,4);i++){const yy=22-h+2+i*3;px(x,i%2?9:3,yy,g,4,2);}
 if(ready){const big=['watermelon','pumpkin'].includes(id);
  if(big){px(x,1,13,C.c1,14,9);px(x,2,12,shade(C.c1,.2),12,2);px(x,3,15,C.c2,10,1);}
  else if(id=='sunflower'||id=='tulip'){px(x,4,3,C.c1,8,8);px(x,6,5,C.c2,4,4);}
  else if(id=='corn'){px(x,5,6,C.c1,3,9);px(x,9,8,C.c1,3,8);}
  else if(['potato','yam','beet','daikon','scallion','bokchoy','wintercab','asparagus'].includes(id)){px(x,4,4,C.c2=='#4caf50'?g:C.c2,8,5);px(x,5,16,C.c1,6,5);px(x,4,5,C.c1,3,2);}
  else{for(let i=0;i<5;i++)px(x,3+Math.floor(hsh(i,id.length,4)*9),6+Math.floor(hsh(id.length,i,5)*12),C.c1,3,3);}
 }});}
// ---------- 物品图标 ----------
function iconSpr(id){const it=ITEMS[id]||{shape:'box',c1:'#f0f',c2:'#000'};return spr('i'+id,16,16,x=>{
 const a=it.c1,b=it.c2,d=shade(a,-.35),l=shade(a,.35);
 switch(it.shape){
  case 'round':px(x,4,4,a,8,9);px(x,3,6,a,10,5);px(x,5,5,l,2,2);px(x,4,12,d,8,1);px(x,7,2,b,2,3);break;
  case 'big':px(x,2,4,a,12,10);px(x,1,6,a,14,6);px(x,4,5,l,3,2);px(x,7,1,'#6b4423',2,3);for(let i=3;i<13;i+=4)px(x,i,5,d,1,8);break;
  case 'leaf':px(x,4,3,a,8,11);px(x,3,5,a,10,6);px(x,7,3,b,2,11);px(x,5,4,l,2,3);break;
  case 'berry':px(x,3,6,a,4,4);px(x,8,5,a,4,4);px(x,5,9,a,5,5);px(x,4,6,l,1,1);px(x,9,5,l,1,1);px(x,7,2,b,3,3);break;
  case 'long':px(x,6,2,a,4,12);px(x,5,4,a,6,8);px(x,6,3,l,1,6);px(x,7,0,b,2,3);px(x,6,13,d,4,1);break;
  case 'flower':px(x,7,8,'#3d8a2a',2,7);px(x,4,2,a,8,7);px(x,3,4,a,10,3);px(x,6,4,b,4,3);break;
  case 'seed':px(x,3,4,'#e8d8b0',10,10);px(x,3,4,'#c8b890',10,1);px(x,5,7,a,2,2);px(x,9,9,a,2,2);px(x,7,11,a,2,2);break;
  case 'wood':px(x,2,5,a,12,7);px(x,2,5,b,2,7);px(x,12,6,l,2,5);px(x,4,7,d,7,1);break;
  case 'stone':px(x,3,5,a,10,8);px(x,4,4,l,6,2);px(x,3,12,d,10,1);break;
  case 'fiber':for(let i=0;i<5;i++)px(x,4+i*2,3+(i%2),a,1,11);px(x,3,8,b,10,1);break;
  case 'drop':px(x,6,3,a,4,3);px(x,4,6,a,8,7);px(x,5,7,l,2,2);px(x,5,13,d,6,1);break;
  case 'ore':px(x,3,5,'#8a8a8a',10,8);px(x,4,4,'#a0a0a0',7,2);px(x,5,7,a,3,3);px(x,9,9,a,2,2);px(x,9,5,b,2,2);break;
  case 'bar':px(x,2,6,a,12,6);px(x,3,5,l,10,2);px(x,2,11,d,12,1);break;
  case 'gem':px(x,5,3,l,6,2);px(x,3,5,a,10,4);px(x,5,9,a,6,3);px(x,7,12,d,2,2);px(x,5,5,'#fff',2,1);break;
  case 'artifact':px(x,3,4,a,10,9);px(x,4,5,shade(a,.2),4,3);px(x,6,8,b,5,1);px(x,9,5,b,1,4);break;
  case 'mushroom':px(x,3,4,a,10,5);px(x,5,3,l,6,2);px(x,6,9,'#f0e8d0',4,5);px(x,5,5,'#fff',1,1);break;
  case 'shell':px(x,3,5,a,10,8);px(x,5,4,a,6,1);for(let i=4;i<13;i+=2)px(x,i,6,b,1,6);break;
  case 'fish':px(x,2,6,a,10,5);px(x,3,5,a,8,7);px(x,12,4,shade(a,-.2),3,9);px(x,4,6,l,6,1);px(x,4,7,'#111',1,1);px(x,3,10,d,8,1);break;
  case 'egg':px(x,5,4,a,6,9);px(x,4,6,a,8,6);px(x,6,5,'#fff',2,2);px(x,5,12,b,6,1);break;
  case 'milk':px(x,5,2,'#ccc',6,2);px(x,4,4,a,8,10);px(x,4,8,b,8,3);break;
  case 'wool':px(x,3,5,a,10,7);px(x,4,4,a,3,2);px(x,8,4,a,4,2);px(x,4,11,b,8,2);px(x,6,7,b,2,1);break;
  case 'food':px(x,2,9,'#f4f4f4',12,4);px(x,3,12,'#c8c8c8',10,2);px(x,4,6,a,8,4);px(x,6,5,shade(a,.3),3,2);break;
  case 'box':px(x,2,4,a,12,10);px(x,3,5,l,10,3);px(x,7,8,b,2,3);px(x,2,13,d,12,1);break;
  case 'sprinkler':px(x,5,8,a,6,6);px(x,6,5,l,4,4);px(x,7,2,b,2,3);break;
  case 'furnace':px(x,3,3,a,10,11);px(x,5,8,b,6,4);break;
  default:px(x,3,3,a,10,10);
 }});}
function toolSpr(t,tier){return spr('tool'+t+tier,16,16,x=>{
 const m=['#9a9aa0','#e08a50','#d0d0e0','#ffd700'][tier];const h='#8a5a32';
 if(t=='hoe'){px(x,7,4,h,2,11);px(x,4,2,m,7,3);}
 else if(t=='can'){px(x,3,6,m,9,8);px(x,11,4,m,4,2);px(x,4,4,shade(m,-.3),6,2);px(x,5,8,'#5a9ad0',5,2);}
 else if(t=='axe'){px(x,7,3,h,2,12);px(x,8,2,m,5,6);px(x,12,3,shade(m,.3),1,4);}
 else if(t=='pick'){px(x,7,4,h,2,11);px(x,2,3,m,12,2);px(x,2,5,m,2,2);px(x,12,5,m,2,2);}
 else if(t=='rod'){px(x,3,13,h,2,2);for(let i=0;i<11;i++)px(x,4+i,12-i,i<3?h:m,1,1);px(x,14,2,'#ddd',1,9);px(x,13,11,'#e03030',2,2);}
 else if(t=='sword'){px(x,7,1,['#c9a063','#c0c0c8','#6ae0c0','#ffd700'][tier],2,10);px(x,4,11,'#6b4423',8,2);px(x,7,13,h,2,3);}
 });}
// ---------- 角色 ----------
function charSpr(look,dir,frame){frame=frame%2;const k='ch'+look.id+dir+frame;return spr(k,16,24,x=>{
 const sk=look.skin,hr=look.hair,sh=look.shirt,pa=look.pants;const step=frame%2;
 // 腿
 const lo=step?1:0;
 if(dir==1||dir==3){px(x,5,18,pa,3,5-lo);px(x,8,18,shade(pa,-.2),3,5-(1-lo));px(x,5,22-lo,'#3a2a1a',3,1);px(x,8,22-(1-lo),'#3a2a1a',3,1);}
 else{px(x,4,18,pa,3,5-lo);px(x,9,18,pa,3,4+lo);px(x,4,22-lo,'#3a2a1a',3,1);px(x,9,22+lo-1,'#3a2a1a',3,1);}
 // 身体
 px(x,3,11,sh,10,8);px(x,3,11,shade(sh,.2),10,1);px(x,3,18,shade(sh,-.3),10,1);
 if(dir==0||dir==2){px(x,1,12,sh,2,5);px(x,13,12,sh,2,5);px(x,1,17,sk,2,1);px(x,13,17,sk,2,1);}
 else{px(x,dir==1?10:4,12+step,sh,2,5);px(x,dir==1?10:4,17+step,sk,2,1);}
 // 头
 px(x,3,2,sk,10,9);px(x,3,10,shade(sk,-.15),10,1);
 px(x,2,1,hr,12,3);
 if(dir==0){px(x,2,3,hr,2,5);px(x,12,3,hr,2,5);px(x,5,6,'#1a1a2a',1,2);px(x,10,6,'#1a1a2a',1,2);px(x,7,9,shade(sk,-.3),2,1);px(x,4,8,'#f0a0a0',1,1);px(x,11,8,'#f0a0a0',1,1);}
 else if(dir==2){px(x,2,1,hr,12,8);}
 else if(dir==1){px(x,2,3,hr,4,6);px(x,10,6,'#1a1a2a',1,2);px(x,12,8,shade(sk,-.2),1,1);}
 else{px(x,10,3,hr,4,6);px(x,5,6,'#1a1a2a',1,2);px(x,3,8,shade(sk,-.2),1,1);}
 if(look.hat){px(x,1,0,look.hat,14,2);px(x,3,-1,look.hat,10,2);}
});}
function animalSpr(type,frame,hasProd){frame=frame%2;return spr('an'+type+frame,16,16,x=>{
 const st=frame%2;
 if(type=='chicken'){px(x,4,6,'#fff',8,7);px(x,9,3,'#fff',4,5);px(x,12,5,'#f0a020',2,1);px(x,10,2,'#e03030',2,1);px(x,11,4,'#111',1,1);px(x,5,13,'#f0a020',1,2+st);px(x,9,13,'#f0a020',1,3-st);px(x,4,8,'#e8e0d0',4,3);}
 else{const c=type=='cow'?'#f5f0e8':'#eae6dc';px(x,1,5,c,12,7);if(type=='cow'){px(x,3,6,'#4a3a2a',3,3);px(x,8,8,'#4a3a2a',3,2);}else{for(let i=0;i<6;i++)px(x,1+i*2,4,'#fff',2,2);}px(x,11,3,type=='cow'?c:'#3a3a3a',4,5);px(x,13,5,'#111',1,1);px(x,2,12,'#5a4a3a',2,3+st);px(x,10,12,'#5a4a3a',2,4-st);px(x,11,2,'#c8b090',1,2);}
});}
function monsterSpr(type,frame){frame=frame%2;return spr('mo'+type+frame,16,16,x=>{const st=frame%2;
 if(type=='slime'||type=='frostslime'||type=='redslime'){const c={slime:'#5ad05a',frostslime:'#6ac0f0',redslime:'#e05050'}[type];px(x,3,7-st,c,10,8+st);px(x,2,9,c,12,5);px(x,4,6-st,shade(c,.3),5,2);px(x,5,10,'#111',2,2);px(x,9,10,'#111',2,2);}
 else if(type=='bat'){px(x,6,6,'#5a3a6a',4,5);px(x,1,4+st*2,'#7a4a8a',5,3);px(x,10,4+st*2,'#7a4a8a',5,3);px(x,6,7,'#ff4040',1,1);px(x,9,7,'#ff4040',1,1);}
 else if(type=='golem'){px(x,3,3,'#7a7a6a',10,11);px(x,4,4,'#9a9a8a',8,3);px(x,5,7,'#ffcc30',2,2);px(x,9,7,'#ffcc30',2,2);px(x,2,13,'#5a5a4a',4,2+st);px(x,10,13,'#5a5a4a',4,3-st);}
});}
function buildingSpr(kind,season){return spr('b'+kind+season,kind=='house'?80:64,64,(x,w,h)=>{
 const roofs={house:'#b0402a',coop:'#c0703a',barn:'#a03030',general:'#3a7a5a',smith:'#4a4a5a',carpenter:'#8a6a3a',fish:'#3a6a9a',museum:'#7a5a8a',home:'#8a4a4a',home2:'#4a6a8a',home3:'#6a8a4a',mayor:'#5a3a7a'};
 const r=roofs[kind]||'#8a4a4a';const wall=kind=='smith'?'#8a8070':kind=='barn'?'#b04a3a':'#e8d8b8';
 px(x,4,26,wall,w-8,h-26);for(let i=30;i<h;i+=6)px(x,4,i,shade(wall,-.08),w-8,1);
 for(let i=0;i<14;i++)px(x,i,24-i,r,w-i*2,3);px(x,0,24,shade(r,-.3),w,3);
 if(season==3)for(let i=0;i<14;i++)px(x,i+1,23-i,'#f4f8fc',w-i*2-2,1);
 const dx=Math.floor(w/2)-6;px(x,dx,h-18,'#5a3a1a',12,18);px(x,dx+1,h-17,'#7a4a22',10,16);px(x,dx+8,h-9,'#ffd700',2,2);
 px(x,10,34,'#5a8ad0',10,8);px(x,w-20,34,'#5a8ad0',10,8);px(x,10,34,'#bde',3,3);px(x,w-20,34,'#bde',3,3);
 const sign={general:'#ffd700',smith:'#e08a50',carpenter:'#c9a063',fish:'#5ac0f0',museum:'#e0c0ff'}[kind];
 if(sign){px(x,dx-4,h-26,'#6b4423',20,6);px(x,dx-3,h-25,sign,18,4);}
});}
function mineEntranceSpr(){return spr('mineent',48,48,x=>{px(x,0,8,'#6a5a4a',48,40);px(x,4,4,'#7a6a5a',40,8);px(x,14,20,'#1a1018',20,28);px(x,12,18,'#8a5a32',24,3);px(x,12,18,'#8a5a32',3,30);px(x,33,18,'#8a5a32',3,30);});}
