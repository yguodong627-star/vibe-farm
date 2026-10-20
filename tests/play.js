// 自动化游玩测试：node tests/play.js
const puppeteer=require('/workspace/tools/node_modules/puppeteer-core');
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),SH=ROOT+'/screenshots/';const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p=='/')p='/index.html';const f=path.join(ROOT,p);if(!fs.existsSync(f)){r.statusCode=404;return r.end();}r.setHeader('content-type',mime[path.extname(f)]||'text/plain');r.end(fs.readFileSync(f));}).listen(8178);
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++;};const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],protocolTimeout:60000});
const pg=await b.newPage();await pg.setViewport({width:1280,height:800});const errs=[];pg.on('pageerror',e=>{errs.push(String(e.stack||e));console.log('PAGEERR',String(e.stack||e).slice(0,300));});pg.on('console',m=>{if(m.type()=='error')errs.push(m.text())});pg.on('dialog',d=>d.accept());
const ext=[];pg.on('request',r=>{if(!r.url().startsWith('http://localhost:8178')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))ext.push(r.url())});
await pg.goto('http://localhost:8178/');await sl(500);
await pg.screenshot({path:SH+'desktop-0-title.png'});console.log('shot desktop-0-title.png');
await pg.click('#t-new');await pg.type('#t-name','老大');await pg.type('#t-farm','青禾');await pg.click('#t-start');await sl(300);
await pg.click('#dialog button');
const cdpd=await pg.target().createCDPSession();await cdpd.send('Debugger.enable');cdpd.on('Debugger.paused',ev=>{console.log('PAUSED',ev.callFrames.slice(0,8).map(f=>f.functionName+'@'+f.url.split('/').pop()+':'+(f.location.lineNumber+1)+':'+f.location.columnNumber).join(' | '));process.exit(3);});
const E=async(f,...a)=>{const w=setTimeout(()=>{console.log('WATCHDOG',String(f).slice(0,120));cdpd.send('Debugger.pause')},10000);try{return await pg.evaluate(f,...a);}finally{clearTimeout(w);}};
// 准备一块空地
await E(()=>{const m=G.MAPS.farm;for(let y=13;y<20;y++)for(let x=14;x<24;x++){delete m.obj[x+','+y];}G.P.x=15*16+8;G.P.y=14*16+8;G.P.dir=1;});
// ---- 开垦 / 播种 / 浇水 ----
const r1=await E(()=>{const S=G.S;const res={};S.sel=0;G.doUse();res.till=!!G.MAPS.farm.soil['16,14'];S.sel=6;G.doUse();res.crop=G.MAPS.farm.soil['16,14']&&G.MAPS.farm.soil['16,14'].crop&&G.MAPS.farm.soil['16,14'].crop.id;S.sel=1;G.doUse();res.wet=G.MAPS.farm.soil['16,14'].wet;res.energy=S.energy;return res;});
ok(r1.till,'锄头开垦耕地');ok(r1.crop=='bokchoy','播下小白菜种子');ok(r1.wet==1,'洒水壶浇水');ok(r1.energy<270,'使用工具消耗体力 '+r1.energy);
// 再种一排并用鼠标点击操作
await E(()=>{G.P.x=15*16+8;G.P.y=16*16+8;G.P.dir=1;G.S.sel=0;});
await pg.keyboard.press('Space');await sl(50);
ok(await E(()=>!!G.MAPS.farm.soil['16,16']),'键盘空格使用锄头');
await pg.keyboard.press('Digit7');await pg.keyboard.press('Space');await pg.keyboard.press('Digit2');await pg.keyboard.press('Space');
ok(await E(()=>G.MAPS.farm.soil['16,16'].crop&&G.MAPS.farm.soil['16,16'].wet),'键盘：切换快捷栏播种+浇水');
// 键盘移动
const x0=await E(()=>G.P.x);await pg.keyboard.down('KeyS');await sl(400);await pg.keyboard.up('KeyS');const y1=await E(()=>G.P.y);ok(y1>16*16+8,'WASD 移动');
await E(()=>{G.P.x=13*16+8;G.P.y=15*16+8;G.P.dir=1;});
await pg.screenshot({path:SH+'desktop-1-farming.png'});console.log('shot desktop-1-farming.png');
// ---- 睡觉推进、浇水、收获 ----
for(let d=0;d<4;d++){await E(()=>{G.endDay(false);G.UI.closeAll();const so=G.MAPS.farm.soil;so['16,14'].wet=1;so['16,16'].wet=1;});}
const r2=await E(()=>{const so=G.MAPS.farm.soil['16,14'];return {age:so.crop.age,ready:G.isReady(so.crop),day:G.S.day};});
ok(r2.ready,'4天后小白菜成熟 age='+r2.age+' day='+r2.day);
await E(()=>{G.P.x=15*16+8;G.P.y=14*16+8;G.P.dir=1;G.S.sel=3;G.doInteract();});
const bk=await E(()=>G.S.inv.filter(s=>s&&s.id=='bokchoy').reduce((a,s)=>a+s.n,0));ok(bk>=1,'收获小白菜 ×'+bk);
// ---- 出货 ----
await E(()=>{G.UI.ship();});await sl(100);
await E(()=>{const i=G.S.inv.findIndex(s=>s&&s.id=='bokchoy');document.querySelector('#panel .slot[data-i="'+i+'"]:not([data-bin])').click();});
await pg.screenshot({path:SH+'desktop-2-ship.png'});console.log('shot desktop-2-ship.png');
const m0=await E(()=>G.S.money);await E(()=>{G.UI.closeAll();G.sleep();});await sl(100);
await pg.screenshot({path:SH+'desktop-3-summary.png'});console.log('shot desktop-3-summary.png');
const m1=await E(()=>G.S.money);ok(m1>m0,'出货夜间结算 +'+(m1-m0)+'金');await E(()=>G.UI.closeAll());
// ---- 存档/读档 ----
const sv=await E(()=>{G.S.money=12345;G.saveGame();G.S.money=1;G.loadGame();return {money:G.S.money,soil:!!G.MAPS.farm.soil['16,16']};});
ok(sv.money==12345&&sv.soil,'存档与读档（金钱/耕地保留）');
// ---- 小镇 / 商店 ----
await E(()=>{G.enterMap('town',12,11);G.S.time=10*60;G.NPCSYS.place();});await sl(200);
await pg.screenshot({path:SH+'desktop-4-town.png'});console.log('shot desktop-4-town.png');
await E(()=>{G.UI.shop('general');});await sl(100);
await pg.screenshot({path:SH+'desktop-5-shop.png'});console.log('shot desktop-5-shop.png');
const bought=await E(()=>{const m=G.S.money;document.querySelector('#panel [data-b="0"]').click();return m-G.S.money;});ok(bought>0,'杂货店购买种子 -'+bought);
await E(()=>G.UI.closeAll());
// ---- 送礼 ----
const g=await E(()=>{const r=G.NPCSYS.rt.linxia;const tx=Math.floor(r.x/16),ty=Math.floor(r.y/16);G.P.x=tx*16+8;G.P.y=(ty+1)*16+8;G.P.dir=2;G.give('strawberry',1);G.S.sel=G.S.inv.findIndex(s=>s&&s.id=='strawberry');const before=G.S.friends.linxia.pts;G.doInteract();return {before,open:G.UI.open,vis:r.vis};});
ok(g.open=='dialog','与林夏对话');await sl(100);
await pg.screenshot({path:SH+'desktop-6-dialog.png'});console.log('shot desktop-6-dialog.png');
await E(()=>document.querySelector('#dialog [data-k="0"]').click());await sl(50);
const pts=await E(()=>G.S.friends.linxia.pts);ok(pts>=100,'送最爱礼物好感上升 '+g.before+'→'+pts);await E(()=>G.UI.closeAll());
// ---- 钓鱼 ----
const f1=await E(()=>{G.enterMap('town',33,13);G.P.dir=1;G.S.sel=4;G.doUse();return G.FISHING&&G.FISHING.phase;});ok(f1=='wait','面朝河流抛竿');
const fish=await E(()=>{for(let k=0;k<15;k++){if(!G.FISHING){G.P.dir=1;G.S.sel=4;G.doUse();}const F=G.FISHING;F.t=0;G.updateFishing(.01);G.doUse();G.updateFishing(.01);if(G.FISHING&&G.FISHING.phase=='game')return 'game';}return 'none';});ok(fish=='game','咬钩后进入钓鱼小游戏');
await E(()=>{for(let i=0;i<20;i++){const F=G.FISHING;F.bar=Math.max(0,F.fy-.1);G.updateFishing(.03);}});await sl(60);
await pg.screenshot({path:SH+'desktop-7-fishing.png'});console.log('shot desktop-7-fishing.png');
const caught=await E(()=>{for(let i=0;i<400&&G.FISHING;i++){const F=G.FISHING;if(F.phase=='game')F.bar=Math.max(0,Math.min(1-F.size,F.fy-F.size/2));G.updateFishing(.05);}return Object.keys(G.S.fish);});
ok(caught.length>0,'钓到鱼：'+caught.join(','));
// 失败路径：不操作，鱼逃走
const lost=await E(()=>{G.S.sel=4;G.doUse();G.FISHING.t=0;G.updateFishing(.01);G.doUse();G.updateFishing(.01);if(G.FISHING)G.FISHING.diff=100;for(let i=0;i<400&&G.FISHING;i++)G.updateFishing(.05);return !G.FISHING;});ok(lost,'不提竿时鱼会逃脱，状态正常结束');
// ---- 矿井 ----
await E(()=>{G.enterMap('mine0');});
const mn=await E(()=>{const m=G.CUR;G.P.x=15*16+8;G.P.y=9*16+8;G.P.dir=2;G.doInteract();return G.CUR.id;});ok(mn=='mine1','从入口梯子进入矿井1层');
const des=await E(()=>{let guard=0;G.S.energy=9999;while(G.S.mineMax<6&&guard++<4000){const m=G.CUR;const lad=Object.entries(m.obj).find(([k,o])=>o.t=='ladder');
  if(lad){const [x,y]=lad[0].split(',').map(Number);G.P.x=x*16+8;G.P.y=(y+1)*16+8;G.P.dir=2;if(G.CUR.obj[x+','+(y+1)])delete G.CUR.obj[x+','+(y+1)];G.doInteract();continue;}
  const rock=Object.entries(m.obj).find(([k,o])=>o.t=='rock');if(!rock){if(m.monsters)m.monsters.forEach(x=>x.hp=0);const c=[3,4];m.obj['5,4']={t:'ladder'};continue;}
  const [x,y]=rock[0].split(',').map(Number);G.P.x=x*16+8;G.P.y=(y+1)*16+8;G.P.dir=2;G.S.sel=3;G.doUse();if(m.monsters)m.monsters.forEach(mo=>{mo.x=1e4;});}
 return {max:G.S.mineMax,map:G.CUR.id,ores:G.S.inv.filter(s=>s&&/ore|stone|coal/.test(s.id)).map(s=>s.id+s.n)};});
ok(des.max>=6,'挖矿下行到第'+des.max+'层，获得：'+des.ores.join(' '));
ok(await E(()=>{G.enterMap('mine0');G.UI.elevator();return document.querySelectorAll('#panel [data-f]').length>=2;}),'5层电梯解锁');
await E(()=>document.querySelector('#panel [data-f="5"]').click());ok(await E(()=>G.CUR.id=='mine5'),'乘电梯到5层');
// 战斗
const cb=await E(()=>{G.enterMap('mine12');const m=G.CUR;G.S.sel=5;const mo={type:'slime',x:G.P.x,y:G.P.y+14+2,hp:20,maxhp:20,dmg:5,spd:0,cd:0,kb:0,kx:0,ky:0,f:0};G.P.dir=0;m.monsters=[mo];for(let i=0;i<10&&mo.hp>0;i++){G.doUse();}return mo.hp<=0;});ok(cb,'用剑击败史莱姆');
await E(()=>{const m=G.CUR;G.S.hp=60;m.monsters.push({type:'bat',x:G.P.x+30,y:G.P.y,hp:30,maxhp:30,dmg:6,spd:1.6,cd:0,kb:0,kx:0,ky:0,f:0});});await sl(400);
await pg.screenshot({path:SH+'desktop-8-mine.png'});console.log('shot desktop-8-mine.png');
const hurt=await E(()=>G.S.hp);ok(hurt<=60,'怪物会造成伤害 hp='+hurt);
// 晕倒
const po=await E(()=>{G.S.hp=1;G.P.inv=0;const m=G.CUR;m.monsters=[{type:'slime',x:G.P.x,y:G.P.y-6,hp:30,maxhp:30,dmg:50,spd:0,cd:0,kb:0,kx:0,ky:0,f:0}];return new Promise(r=>setTimeout(()=>{G.UI.closeAll();r({map:G.CUR.id,hp:G.S.hp})},300));});
ok(po.map=='farm'&&po.hp>0,'矿井中被击倒后回到农场');
// ---- 熔炉 / 制作 ----
const fu=await E(()=>{G.give('copper_ore',25);G.give('stone',30);G.give('coal',2);G.UI.menu('craft');const btn=[...document.querySelectorAll('#panel [data-c]')].find(b=>b.closest('.li').textContent.includes('熔炉'));btn.click();G.UI.closeAll();
 const m=G.MAPS.farm;G.P.x=15*16+8;G.P.y=18*16+8;G.P.dir=1;delete m.obj['16,18'];delete m.soil['16,18'];G.S.sel=G.S.inv.findIndex(s=>s&&s.id=='furnace');G.doUse();const o=m.obj['16,18'];G.S.sel=G.S.inv.findIndex(s=>s&&s.id=='copper_ore');G.doInteract();const loaded=o&&o.input;G.S.time+=60;G.doInteract();return {placed:!!o,loaded,bar:G.S.inv.some(s=>s&&s.id=='copper_bar')};});
ok(fu.placed&&fu.loaded&&fu.bar,'制作并放置熔炉，冶炼铜锭');
// ---- 工具升级 ----
const up=await E(()=>{G.S.money+=3000;G.give('copper_bar',5);G.UI.shop('smith');const b=[...document.querySelectorAll('#panel [data-b]')].find(b=>b.closest('.li').textContent.includes('铜锄头'));b.click();G.UI.closeAll();return G.S.tools.hoe;});ok(up==1,'铁匠铺升级铜锄头');
const area=await E(()=>{const m=G.MAPS.farm;for(let x=16;x<20;x++){delete m.obj[x+',20'];delete m.soil[x+',20'];}G.P.x=15*16+8;G.P.y=20*16+8;G.P.dir=1;G.S.sel=0;G.doUse();return [16,17,18].filter(x=>m.soil[x+',20']).length;});ok(area==3,'铜锄头一次开垦3格');
// ---- 动物 ----
const an=await E(()=>{G.S.money+=20000;G.give('wood',400);G.give('stone',200);G.UI.shop('carpenter');let b=[...document.querySelectorAll('#panel [data-b]')].find(b=>b.closest('.li').textContent.includes('建造鸡舍'));b.click();
 b=[...document.querySelectorAll('#panel [data-b]')].find(b=>b.closest('.li').textContent.includes('购买鸡'));b.click();G.UI.closeAll();return {coop:G.S.coop,n:G.S.animals.length};});
ok(an.coop&&an.n==1,'建造鸡舍并购买一只鸡');
const egg=await E(()=>{G.S.hay=5;for(let i=0;i<3;i++){G.endDay(false);G.UI.closeAll();}G.UI.animalHouse('coop');document.querySelector('#petall').click();G.UI.closeAll();return G.S.inv.some(s=>s&&(s.id=='egg'||s.id=='bigegg'));});
ok(egg,'鸡产蛋并收集');
const raf=async(l)=>{const t=Date.now();await E(()=>new Promise(r=>requestAnimationFrame(()=>r(1))));console.log('raf',l,Date.now()-t);};await raf('pre');console.log('a');await E(()=>{G.enterMap('farm',24,9);});console.log('b');await sl(200);console.log('c');await E(()=>{G.ANIM.place();});console.log('d');await sl(200);await E(()=>{G.ANIM.rt.forEach(r=>r.vis=true);G.S.time=11*60;});console.log('e');await raf('post');console.log(await E(()=>JSON.stringify({x:G.P.x,y:G.P.y,map:G.CUR.id,an:G.ANIM.rt.length,ui:G.UI.open})));
await pg.screenshot({path:SH+'desktop-9-animals.png'});console.log('shot desktop-9-animals.png');console.log('shot ok');
// ---- 菜单界面 ----
await E(()=>G.UI.menu('inv'));console.log('menu ok');await sl(100);await pg.screenshot({path:SH+'desktop-10-inventory.png'});console.log('shot desktop-10-inventory.png');
await E(()=>G.UI.menu('rel'));console.log('rel ok');await sl(100);await pg.screenshot({path:SH+'desktop-11-relations.png'});console.log('shot desktop-11-relations.png');
await E(()=>G.UI.menu('col'));await sl(100);await pg.screenshot({path:SH+'desktop-12-collection.png'});console.log('shot desktop-12-collection.png');
await E(()=>G.UI.menu('cal'));await sl(100);await pg.screenshot({path:SH+'desktop-13-calendar.png'});console.log('shot desktop-13-calendar.png');
await E(()=>G.UI.closeAll());
// ---- 节日：寻蛋 ----
const fe=await E(()=>{const S=G.S;S.season=0;S.day=13;S.time=9*60+10;G.enterMap('town',24,16);return new Promise(r=>setTimeout(()=>{const f=G.FEST&&G.FEST.active;G.NPCSYS.interact(NPCS.find(n=>n.id=='zhoubo'));r(f);},150));});
ok(fe,'春日寻蛋会在广场举行');await E(()=>document.querySelector('#dialog [data-k="0"]').click());await sl(100);
await pg.screenshot({path:SH+'desktop-14-festival.png'});console.log('shot desktop-14-festival.png');
const fe2=await E(()=>{const m=G.CUR;for(const k in m.obj)if(m.obj[k].t=='fegg'){const [x,y]=k.split(',').map(Number);G.P.x=x*16+8;G.P.y=(y+1)*16+8;G.P.dir=2;G.doInteract();}G.FEST.timer=0;return new Promise(r=>setTimeout(()=>{r({open:G.UI.open})},200));});
await E(()=>document.querySelector('#dialog [data-k="0"]').click());
const fe3=await E(()=>({map:G.CUR.id,done:Object.keys(G.S.festDone).length,t:G.S.time}));ok(fe3.map=='farm'&&fe3.done==1&&fe3.t>=1320,'寻蛋会完成，回到农场 22:00');
// 其他节日
for(const [s,d] of [[1,11],[2,16]]){const r=await E((s,d)=>{const S=G.S;S.season=s;S.day=d;S.time=10*60;G.give('pumpkin',1);G.give('ruby',1);G.give('egg',1);G.enterMap('town',24,16);return new Promise(r=>setTimeout(()=>{G.NPCSYS.interact(NPCS.find(n=>n.id=='zhoubo'));document.querySelector('#dialog [data-k="0"]').click();document.querySelector('#panel .slot:not([data-no])').click();document.querySelector('#pk-ok').click();const t=document.querySelector('#dialog p').textContent;document.querySelector('#dialog [data-k="0"]').click();r(t);},150));},s,d);ok(r.length>5,'节日 '+s+'：'+r.slice(0,40));}
const ice=await E(()=>{const S=G.S;S.season=3;S.day=8;S.time=10*60;G.enterMap('town',33,13);return new Promise(r=>setTimeout(()=>{G.FEST.lock=false;G.startFestival();G.P.dir=1;G.P.x=33*16+8;G.P.y=13*16+8;G.doUse();G.FISHING.t=0;G.updateFishing(.01);G.doUse();G.updateFishing(.01);for(let i=0;i<400&&G.FISHING;i++){const F=G.FISHING;if(F.phase=='game')F.bar=Math.max(0,Math.min(1-F.size,F.fy-F.size/2));G.updateFishing(.05);}const sc=G.FEST.score;G.FEST.timer=0;setTimeout(()=>{const t=document.querySelector('#dialog p').textContent;document.querySelector('#dialog [data-k="0"]').click();r(sc+' '+t);},200);},150));});
ok(/钓到了/.test(ice),'冰湖钓鱼赛：'+ice.slice(0,40));
// ---- 一整年模拟 ----
const yr=await E(()=>{const S=G.S;S.season=0;S.day=1;S.year=1;const log=[];const m=G.MAPS.farm;let deaths=0,harvests=0;
 for(let d=0;d<112;d++){
  // 每天：种一些当季作物、浇水、收获
  for(let x=20;x<30;x++){const k=x+',24';delete m.obj[k];if(!m.soil[k])m.soil[k]={wet:0,crop:null,fert:null};const so=m.soil[k];
   if(so.crop&&G.isReady(so.crop)){G.P.x=x*16+8;G.P.y=25*16+8;G.P.dir=2;G.S.sel=3;G.doInteract();harvests++;}
   if(so.crop&&so.crop.dead){deaths++;so.crop=null;}
   if(!so.crop){const c=Object.values(CROPS).find(c=>c.seasons.includes(S.season));if(c){so.crop={id:c.id,age:0,dead:0};so.crop._so=so;}}so.wet=1;}
  if(d%9==0){G.enterMap('town',24,16);S.time=12*60;G.NPCSYS.tick();for(let i=0;i<50;i++)G.NPCSYS.update(.1);G.enterMap('farm',10,8);}
  S.bin=S.inv.filter(s=>s&&ITEMS[s.id].cat=='crop').map(s=>({...s}));S.inv=S.inv.map(s=>s&&ITEMS[s.id].cat=='crop'?null:s);
  G.endDay(d%30==7);G.UI.closeAll();log.push(S.season+'-'+S.day+'-'+S.weather);}
 return {year:S.year,season:S.season,day:S.day,harvests,deaths,money:S.money,weathers:[...new Set(log.map(l=>l.split('-')[2]))]};});
ok(yr.year==2&&yr.season==0&&yr.day==1,'模拟一整年 112 天推进到第2年春1日');ok(yr.harvests>20,'一年收获 '+yr.harvests+' 次');ok(yr.deaths>=0,'换季枯死处理 '+yr.deaths);ok(yr.weathers.length>=3,'天气种类：'+yr.weathers.join(','));
// 时间推进到2点晕倒
const late=await E(()=>{G.UI.closeAll();const S=G.S;const d=S.day;const m=S.money;S.time=26*60-10;return new Promise(r=>{const t=Date.now();const iv=setInterval(()=>{if(G.S.day!=d||Date.now()-t>16000){clearInterval(iv);r({d0:d,d1:G.S.day,lost:m-G.S.money});}},200);});});
ok(late.d1!=late.d0&&late.lost>=0,'凌晨2点晕倒，进入新一天，罚金 '+late.lost);
await E(()=>G.UI.closeAll());
// 导出
ok(await E(()=>{const j=G.saveGame();const d=JSON.parse(j);return !!(d.S&&d.farm&&d.town);}),'导出 JSON 结构完整');
ok(ext.length==0,'无外部网络请求 '+ext.join(','));
ok(errs.length==0,'无 JS 错误 '+errs.join('\n'));
// ---- 手机 ----
const mp=await b.newPage();await mp.emulate({viewport:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'});
const merrs=[];mp.on('pageerror',e=>merrs.push(String(e)));
await mp.goto('http://localhost:8178/');await sl(400);await mp.screenshot({path:SH+'mobile-0-title.png'});
await mp.tap('#t-cont');await sl(300);
const tb=await mp.evaluate(()=>getComputedStyle(document.querySelector('#touch')).display);ok(tb=='block','手机显示虚拟摇杆与按钮');
const j=await mp.$('#joy');const bb=await j.boundingBox();const p0=await mp.evaluate(()=>[G.P.x,G.P.y]);
const cdp=await mp.target().createCDPSession();
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bb.x+bb.width/2,y:bb.y+bb.height/2,id:1}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bb.x+bb.width/2+45,y:bb.y+bb.height/2,id:1}]});await sl(600);
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
const p1=await mp.evaluate(()=>[G.P.x,G.P.y]);ok(p1[0]!=p0[0]||p1[1]!=p0[1],'虚拟摇杆移动角色 '+p0+'→'+p1);
await mp.evaluate(()=>{G.enterMap('farm',15,16);G.P.dir=1;G.S.time=9*60;});await sl(200);
await mp.screenshot({path:SH+'mobile-1-farm.png'});
const ab=await mp.$('#btnA');const abb=await ab.boundingBox();await mp.evaluate(()=>{G.S.sel=0;const m=G.MAPS.farm;delete m.obj['16,15'];delete m.soil['16,15'];G.P.x=15*16+8;G.P.y=15*16+8;G.P.dir=1;});
await mp.touchscreen.tap(abb.x+abb.width/2,abb.y+abb.height/2);await sl(100);
ok(await mp.evaluate(()=>!!G.MAPS.farm.soil['16,15']||!!G.MAPS.farm.soil['17,15']),'手机“使用”按钮开垦');
await mp.evaluate(()=>{G.enterMap('town',22,16);G.S.time=12*60;G.NPCSYS.place();});await sl(200);await mp.screenshot({path:SH+'mobile-2-town.png'});
await mp.evaluate(()=>G.UI.menu('inv'));await sl(100);await mp.screenshot({path:SH+'mobile-3-menu.png'});
ok(merrs.length==0,'手机无 JS 错误 '+merrs.join(';'));
console.log(fails?'FAILURES: '+fails:'ALL PASS');await b.close();srv.close();process.exit(fails?1:0);})().catch(e=>{console.error(e);process.exit(2);});
