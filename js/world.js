// 地图生成
'use strict';
const K=(x,y)=>x+','+y;
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function newMap(id,w,h,fill){return {id,w,h,t:new Array(w*h).fill(fill),obj:{},soil:{},bld:[],warps:[]};}
function setT(m,x,y,c){if(x>=0&&y>=0&&x<m.w&&y<m.h)m.t[y*m.w+x]=c;}
function getT(m,x,y){if(x<0||y<0||x>=m.w||y>=m.h)return 'K';return m.t[y*m.w+x];}
function rectT(m,x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)setT(m,i,j,c);}
function addBld(m,kind,x,y,w,h,act,doorDx){const b={kind,x,y,w,h,act,door:{x:x+(doorDx!=null?doorDx:Math.floor(w/2)),y:y+h-1}};m.bld.push(b);for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)m.obj[K(i,j)]={t:'bld',b:m.bld.length-1};return b;}
const SOLID_T=new Set(['W','L','O','K','X']);
const SOLID_O=new Set(['tree','stump','log','rock','boulder','chest','sprinkler','qsprinkler','furnace','bin','bld','weed','twig','wall']);
function isSolid(m,x,y){const t=getT(m,x,y);if(SOLID_T.has(t))return true;const o=m.obj[K(x,y)];if(o){if(o.t=='tree'&&o.stage<3)return false;if(SOLID_O.has(o.t))return true;}return false;}
function isWater(m,x,y){const t=getT(m,x,y);return t=='W'||t=='L'||t=='O';}
// ---------- 农场 ----------
function genFarm(){
 const W=60,H=44,m=newMap('farm',W,H,'G');const r=rng(20261020);
 rectT(m,0,0,W,2,'X');rectT(m,0,H-2,W,2,'X');rectT(m,0,0,2,H,'X');rectT(m,W-2,0,2,H,'X');
 rectT(m,W-2,19,2,3,'P');
 // 池塘
 for(let y=30;y<39;y++)for(let x=43;x<54;x++){const dx=(x-48.5)/5.5,dy=(y-34.5)/4.5;if(dx*dx+dy*dy<1)setT(m,x,y,'L');}
 // 小路
 rectT(m,10,7,1,4,'P');rectT(m,10,10,48,1,'P');rectT(m,57,10,1,10,'P');rectT(m,57,19,3,3,'P');
 addBld(m,'house',8,3,5,4,'house',2);
 m.obj[K(14,6)]={t:'bin'};m.obj[K(15,6)]={t:'bin',part:1};
 // 树木与杂物
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
  const t=getT(m,x,y);if(t!='G'||m.obj[K(x,y)])continue;
  const nearHouse=x>=5&&x<=34&&y>=2&&y<=12;if(nearHouse)continue;
  const edge=x<6||y<5||x>W-7||y>H-6;const v=r();
  if(edge&&v<.35&&x%2==0)m.obj[K(x,y)]={t:'tree',kind:r()<.5?'oak':'pine',stage:3,hp:10};
  else if(!edge&&v<.035)m.obj[K(x,y)]={t:'tree',kind:r()<.6?'oak':'pine',stage:3,hp:10};
  else if(!edge&&v<.10)m.obj[K(x,y)]={t:'weed',v:Math.floor(r()*9)};
  else if(!edge&&v<.14)m.obj[K(x,y)]={t:'rock',kind:'small',hp:1,v:0};
  else if(!edge&&v<.17)m.obj[K(x,y)]={t:'twig'};
  else if(!edge&&v<.175)m.obj[K(x,y)]={t:'log',hp:6};
  else if(!edge&&v<.18)m.obj[K(x,y)]={t:'boulder',hp:8};
 }
 m.warps.push({x:W-1,y:19,w:1,h:3,to:'town',tx:1,ty:19});
 return m;
}
// ---------- 小镇 ----------
function genTown(){
 const W=50,H=40,m=newMap('town',W,H,'G');
 rectT(m,0,0,W,1,'X');rectT(m,0,0,1,H,'X');rectT(m,W-1,0,1,H,'X');
 rectT(m,0,0,W,1,'X');
 rectT(m,0,31,W,3,'S');rectT(m,0,34,W,6,'O');
 rectT(m,34,0,2,31,'W');
 rectT(m,0,18,34,3,'P');rectT(m,36,18,13,3,'P');rectT(m,34,18,2,3,'B');rectT(m,34,9,2,2,'B');
 rectT(m,20,3,3,15,'P');rectT(m,11,10,23,1,'P');rectT(m,29,10,5,1,'P');rectT(m,36,9,8,2,'P');rectT(m,41,10,1,8,'P');rectT(m,24,21,2,10,'P');rectT(m,40,21,2,10,'P');
 rectT(m,19,12,10,6,'R');
 addBld(m,'general',11,6,4,4,'general',2);
 addBld(m,'smith',29,6,4,4,'smith',2);
 addBld(m,'carpenter',38,13,4,4,'carpenter',2);
 addBld(m,'fish',40,27,4,4,'fish',1);
 addBld(m,'museum',7,19,4,4,'museum',2);setT(m,9,23,'P');
 addBld(m,'home',4,11,4,4,'npchome',2);
 addBld(m,'home2',16,2,4,4,'npchome',2);
 addBld(m,'mayor',14,22,4,4,'npchome',2);
 addBld(m,'home3',26,21,4,4,'npchome',2);
 addBld(m,'home',6,26,4,4,'npchome',2);
 // 矿洞入口
 m.mine={x:21,y:0};for(let j=0;j<3;j++)for(let i=0;i<3;i++)m.obj[K(20+i,j)]={t:'bld',b:-1};
 m.warps.push({x:0,y:18,w:1,h:3,to:'farm',tx:58,ty:20});
 // 镇上树木（可再生）
 const r=rng(777);
 for(let y=1;y<31;y++)for(let x=1;x<W-1;x++){if(getT(m,x,y)!='G'||m.obj[K(x,y)])continue;if((x<3||x>45||y<2)&&r()<.4&&(x+y)%2==0)m.obj[K(x,y)]={t:'tree',kind:r()<.5?'oak':'pine',stage:3,hp:10,regrow:1};}
 return m;
}
// ---------- 矿井 ----------
function genMine(floor,seed){
 const W=30,H=22;const m=newMap('mine'+floor,W,H,'C');m.floor=floor;const r=rng(seed+floor*7919);
 rectT(m,0,0,W,1,'K');rectT(m,0,H-1,W,1,'K');rectT(m,0,0,1,H,'K');rectT(m,W-1,0,1,H,'K');
 if(floor==0){rectT(m,0,0,W,6,'K');rectT(m,0,14,W,8,'K');rectT(m,0,0,8,H,'K');rectT(m,22,0,8,H,'K');
  m.obj[K(15,8)]={t:'ladder'};m.obj[K(10,7)]={t:'elevator'};m.obj[K(12,13)]={t:'exit'};m.start=[12,12];return m;}
 for(let i=0;i<10;i++){const cx=2+Math.floor(r()*(W-4)),cy=2+Math.floor(r()*(H-4)),rad=1+r()*2.5;for(let y=0;y<H;y++)for(let x=0;x<W;x++){if((x-cx)**2+(y-cy)**2<rad*rad)setT(m,x,y,'K');}}
 m.start=[3,3];rectT(m,2,2,3,3,'C');rectT(m,3,2,1,10,'C');rectT(m,1,11,W-2,1,'C');rectT(m,15,1,1,H-2,'C');m.obj[K(3,2)]={t:'exit'};
 if(floor%10==0&&floor<40){for(let y=14;y<19;y++)for(let x=19;x<26;x++)if((x-22)**2/9+(y-16.5)**2/4<1)setT(m,x,y,'L');m.minewater=1;}
 const elev=floor%5==0;
 if(elev){m.obj[K(4,4)]={t:'elevator'};}
 const free=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(getT(m,x,y)=='C'&&!(x<6&&y<6))free.push([x,y]);
 // 连通性：从起点可达
 const reach=new Set();const q=[[3,3]];reach.add(K(3,3));while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=K(nx,ny);if(!reach.has(k)&&getT(m,nx,ny)=='C'){reach.add(k);q.push([nx,ny]);}}}
 const fr=free.filter(([x,y])=>reach.has(K(x,y)));if(fr.length<40)return genMine(floor,seed+1);
 for(const [x,y] of free)if(!reach.has(K(x,y)))setT(m,x,y,'K');
 if(floor==40){m.obj[K(15,11)]={t:'treasure'};m.monsters=[];return m;}
 const dens=.18+Math.min(.12,floor*.003);
 const oreKind=()=>{const v=r();if(v<.02+floor*.001)return 'gem';if(floor>=30&&v<.12)return 'gold';if(floor>=15&&v<.18)return 'iron';if(floor>=20&&floor<30&&v<.24)return 'frost';if(v<.26)return 'copper';if(v<.30)return 'coal';return 'stone';};
 for(const [x,y] of fr){if(r()<dens){const k=oreKind();m.obj[K(x,y)]={t:'rock',kind:k,hp:k=='stone'?1+Math.floor(floor/15):2+Math.floor(floor/15),v:Math.floor(r()*3)};}}
 if(elev){const [x,y]=fr[Math.floor(r()*fr.length)];m.obj[K(x,y)]={t:'ladder'};}
 m.monsters=[];if(!elev){const n=3+Math.floor(floor/6);for(let i=0;i<n;i++){const [x,y]=fr[Math.floor(r()*fr.length)];if(m.obj[K(x,y)])continue;
  let type='slime';if(floor>=10&&r()<.5)type='bat';if(floor>=20&&floor<30&&r()<.5)type='frostslime';if(floor>=30)type=r()<.4?'golem':(r()<.5?'redslime':'bat');
  const st={slime:[24,5,.9],bat:[18,6,1.6],frostslime:[40,8,1],golem:[70,12,.6],redslime:[55,10,1.1]}[type];
  m.monsters.push({type,x:x*16+8,y:y*16+8,hp:st[0]+floor,maxhp:st[0]+floor,dmg:st[1]+Math.floor(floor/8),spd:st[2],cd:0,kb:0,kx:0,ky:0,f:0});}}
 m.rocksLeft=Object.values(m.obj).filter(o=>o.t=='rock').length;
 return m;
}
