// 村民与动物
'use strict';
const NPCSYS={rt:{},
 look(n){return {id:n.id,skin:n.skin,hair:n.hair,shirt:n.shirt,pants:n.pants};},
 target(n){const h=hour();
  if(FEST&&FEST.active){const i=NPCS.indexOf(n);if(n.id=='zhoubo')return [24,12];const a=i/NPCS.length*Math.PI*2;return [Math.round(24+Math.cos(a)*4),Math.round(15+Math.sin(a)*2.5)];}
  if(h<7||h>=21)return null;let t=null;for(const e of n.sched)if(h>=e[0])t=[e[1],e[2]];
  if(t&&(S.weather=='rain'||S.weather=='storm')&&h>=12&&n.sched.length>1){t=[n.sched[0][1],n.sched[0][2]];}
  return t;},
 walkable(m,x,y){return !isSolid(m,x,y)||m.obj[K(x,y)]&&m.obj[K(x,y)].t=='forage';},
 nearest(m,t){if(!t)return null;let [x,y]=t;if(this.walkable(m,x,y))return [x,y];for(let r=1;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(this.walkable(m,x+dx,y+dy))return [x+dx,y+dy];return [x,y];},
 bfs(m,a,b){const key=(x,y)=>y*m.w+x;const prev=new Map();const q=[a];prev.set(key(...a),null);let found=false;
  while(q.length){const [x,y]=q.shift();if(x==b[0]&&y==b[1]){found=true;break;}for(let d=0;d<4;d++){const nx=x+DX[d],ny=y+DY[d];const k=key(nx,ny);if(nx<0||ny<0||nx>=m.w||ny>=m.h||prev.has(k)||!this.walkable(m,nx,ny))continue;prev.set(k,[x,y]);q.push([nx,ny]);}if(prev.size>3000)break;}
  if(!found)return [b];const path=[];let c=b;while(c){path.unshift(c);c=prev.get(key(...c));}return path;},
 place(){const m=MAPS.town;for(const n of NPCS){const t=this.nearest(m,this.target(n));const r=this.rt[n.id]||(this.rt[n.id]={dir:0,f:0,path:[]});r.vis=!!t;r.path=[];if(t){r.x=t[0]*16+8;r.y=t[1]*16+8;r.tgt=t;}}},
 tick(){const m=MAPS.town;for(const n of NPCS){const r=this.rt[n.id];if(!r)continue;const t=this.nearest(m,this.target(n));
  if(!t){if(r.vis){r.vis=false;}continue;}
  if(!r.vis){r.vis=true;r.x=t[0]*16+8;r.y=t[1]*16+8;r.tgt=t;r.path=[];continue;}
  if(!r.tgt||r.tgt[0]!=t[0]||r.tgt[1]!=t[1]){r.tgt=t;r.path=this.bfs(m,[Math.floor(r.x/16),Math.floor(r.y/16)],t);}
  else if(!r.path.length&&Math.random()<.25){const w=[t[0]+Math.floor(Math.random()*3)-1,t[1]+Math.floor(Math.random()*3)-1];if(this.walkable(m,...w))r.path=[w];}}},
 update(dt){if(CUR.id!='town')return;for(const n of NPCS){const r=this.rt[n.id];if(!r||!r.vis)continue;r.moving=false;
  if(UI.dlgNpc==n.id)continue;
  if(r.path.length){const [tx,ty]=r.path[0];const gx=tx*16+8,gy=ty*16+8;const dx=gx-r.x,dy=gy-r.y,d=Math.hypot(dx,dy);const sp=34*dt;
   if(d<=sp){r.x=gx;r.y=gy;r.path.shift();}else{r.x+=dx/d*sp;r.y+=dy/d*sp;r.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2);r.moving=true;r.f+=dt*6;}}}},
 at(x,y){if(CUR.id!='town')return null;for(const n of NPCS){const r=this.rt[n.id];if(r&&r.vis&&Math.floor(r.x/16)==x&&Math.abs(Math.floor(r.y/16)-y)<=1&&Math.floor((r.y-1)/16)>=y-1)return n;}
  for(const n of NPCS){const r=this.rt[n.id];if(r&&r.vis&&Math.hypot(r.x-(x*16+8),r.y-(y*16+8))<13)return n;}return null;},
 hearts(id){return Math.min(10,Math.floor(S.friends[id].pts/250));},
 isBday(n){return n.bd[0]==S.season&&n.bd[1]==S.day;},
 taste(n,id){const m=l=>l.some(x=>matchIng(id,x));if(m(n.loves))return 'love';if(m(n.hates))return 'hate';if(m(n.likes))return 'like';return 'neutral';},
 line(n){const f=S.friends[n.id];const h=this.hearts(n.id);const seed=S.day*7+S.season*31+n.id.length;
  if(this.isBday(n))return '今天是我的生日呢！'+(f.gift?'谢谢你的礼物。':'你会记得送我点什么吗？');
  if(FEST)return ['节日真热闹啊！','好久没这么开心了。','周伯准备了好久呢。','你也来参加啦？'][seed%4];
  const pool=h>=4?n.hi.concat(n.lines):n.lines.slice();
  if(S.weather=='rain'||S.weather=='storm')pool.push('下雨天，'+(n.id=='haibo'?'正是钓鱼的好时候。':'出门记得带伞。'));
  if(S.weather=='snow')pool.push('雪景真美，可是好冷呀。');
  pool.push(['春天到了，万物都醒了。','夏天的太阳真毒啊。','秋天是收获的季节。','冬天适合窝在家里。'][S.season]);
  return pool[seed%pool.length];},
 interact(n){if(FEST&&FEST.active&&n.id=='zhoubo'&&!FEST.lock){UI.festival();return;}const f=S.friends[n.id];const r=this.rt[n.id];r.dir=(P.dir+2)%4;
  let txt=this.line(n);if(!f.talk){f.talk=1;f.pts+=20;}
  const s=selItem();const can=s&&ITEMS[s.id].cat!='tool';
  UI.dialog(n,txt,can?[{t:'送出'+ITEMS[s.id].n,f:()=>this.gift(n)},{t:'再见',f:()=>{}}]:null);},
 gift(n){const f=S.friends[n.id];const s=selItem();if(!s)return;
  if(f.gift){UI.dialog(n,'今天已经收过你的礼物啦。');return;}
  const bd=this.isBday(n);if(f.week>=2&&!bd){UI.dialog(n,'这周你已经送了我两次礼物了，太破费了！');return;}
  const t=this.taste(n,s.id);const mult=bd?8:1;const pts={love:80,like:45,neutral:20,hate:-40}[t]*mult;
  f.pts=Math.max(0,Math.min(2600,f.pts+pts));f.gift=1;f.week++;S.found['gift_'+n.id+'_'+s.id]=t;const nm=ITEMS[s.id].n;consumeSel();SFX.play(t=='hate'?'thud':'gift');
  const txt={love:`哇！${nm}！这正是我最喜欢的！太谢谢你了！`,like:`${nm}？我很喜欢，谢谢！`,neutral:`谢谢你的${nm}。`,hate:`呃……${nm}……我不太想要这个。`}[t];
  UI.dialog(n,(bd?'（生日礼物）':'')+txt);}
};
const ANIM={rt:[],
 place(){this.rt=[];const out=S.weather=='sun'&&S.season!=3&&hour()<19;
  for(const a of S.animals){if(out)a.grazed=1;const b=ANIMALS[a.type].b;const bx=b=='coop'?22:28;
   this.rt.push({a,x:(bx+Math.random()*6)*16,y:(8+Math.random()*4)*16+8,vis:out,dir:0,f:0,vx:0,vy:0,t:0});}},
 update(dt){if(CUR.id!='farm')return;for(const r of this.rt){if(!r.vis)continue;r.t-=dt;if(r.t<=0){r.t=1+Math.random()*3;if(Math.random()<.5){r.vx=0;r.vy=0;}else{const a=Math.random()*6.28;r.vx=Math.cos(a)*12;r.vy=Math.sin(a)*12;}}
  const nx=r.x+r.vx*dt,ny=r.y+r.vy*dt;if(nx>19*16&&nx<35*16&&ny>7.5*16&&ny<13*16&&!isSolid(CUR,Math.floor(nx/16),Math.floor(ny/16))){r.x=nx;r.y=ny;if(r.vx)r.dir=r.vx>0?1:3;}else r.t=0;if(r.vx||r.vy)r.f+=dt*4;}
  if(hour()>=19)for(const r of this.rt)r.vis=false;},
 at(x,y){if(CUR.id!='farm')return null;for(const r of this.rt)if(r.vis&&Math.hypot(r.x-(x*16+8),r.y-(y*16+8))<14)return r;return null;},
 petOne(a){let msg='';if(!a.pet){a.pet=1;a.fr=Math.min(1000,a.fr+15);msg='抚摸了'+a.name+'，它很开心 ♥';}
  if(a.prod){if(give(a.prod,1,a.fr>700?1:0)){msg+=(msg?'，':'')+'收获了'+ITEMS[a.prod].n;a.prod=null;}}return msg;},
 pet(r){const m=this.petOne(r.a);SFX.play('animal');toast(m||r.a.name+'今天已经摸过了');},
 night(){const outside=S.weather=='sun'&&S.season!=3;
  for(const a of S.animals){let fed=a.grazed;if(!fed){if(S.hay>0){S.hay--;fed=true;}}
   if(!a.pet)a.fr=Math.max(0,a.fr-10);if(!fed)a.fr=Math.max(0,a.fr-20);
   a.days=(a.days||0)+1;const A=ANIMALS[a.type];
   if(fed&&!a.prod&&a.days%A.every==0&&a.days>=2){a.prod=A.big&&a.fr>500&&Math.random()<.35?A.big:A.prod;}
   a.pet=0;a.grazed=0;}
}
};
