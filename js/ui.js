// 界面（DOM）
'use strict';
const $=s=>document.querySelector(s);
const ICON_URL={};
function iconURL(id){const it=ITEMS[id];const key=it&&it.cat=='tool'?id+S.tools[id]:id;if(!ICON_URL[key])ICON_URL[key]=(it&&it.cat=='tool'?toolSpr(id,S.tools[id]):iconSpr(id)).toDataURL();return ICON_URL[key];}
function itemName(s){const it=ITEMS[s.id];if(it.cat=='tool'){if(s.id=='rod')return [ '竹钓竿','玻璃纤维竿','碳素竿','金线竿'][S.tools.rod];if(s.id=='sword')return SWORDS[S.tools.sword][1];return TIER_N[S.tools[s.id]]+it.n;}return it.n+(s.q==2?'（金星）':s.q==1?'（银星）':'');}
function slotHTML(s,i,extra){if(!s)return `<div class="slot empty" data-i="${i}" ${extra||''}></div>`;return `<div class="slot" data-i="${i}" title="${itemName(s)}" ${extra||''}><img src="${iconURL(s.id)}">${s.n>1?'<b>'+s.n+'</b>':''}${s.q?'<i class="q'+s.q+'"></i>':''}</div>`;}
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const UI={open:null,dlgNpc:null,liveClock:false,pick:-1,
 toast(msg,c){const d=document.createElement('div');d.className='toast '+(c||'');d.textContent=msg;$('#toasts').appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3200);while($('#toasts').children.length>5)$('#toasts').firstChild.remove();},
 closeAll(){this.open=null;this.dlgNpc=null;$('#panel').classList.add('hide');$('#dialog').classList.add('hide');this.pick=-1;},
 panel(title,html,onBind,cls){this.open='panel';const p=$('#panel');p.className='panel '+(cls||'');p.innerHTML=`<div class="ph"><h2>${title}</h2><button class="x" data-close>✕</button></div><div class="pb">${html}</div>`;p.querySelector('[data-close]').onclick=()=>this.closeAll();if(onBind)onBind(p);},
 // ---------- HUD ----------
 hud(){if(!S)return;$('#hud-date').textContent=dateStr();$('#hud-time').textContent=fmtTime(S.time)+'  '+WEATHER_N[S.weather];$('#hud-money').textContent=S.money.toLocaleString()+' 金';
  $('#bar-e').style.height=(S.energy/S.maxEnergy*100)+'%';$('#bar-h').style.height=(S.hp/S.maxHp*100)+'%';$('#hud-hp').style.display=CUR&&CUR.id.startsWith('mine')||S.hp<S.maxHp?'':'none';
  const s=selItem();$('#hud-sel').textContent=s?itemName(s)+(s.id=='can'?' 水量'+S.water+'/'+(40+15*S.tools.can):''):'';
  $('#hud-loc').textContent={farm:S.farm+'农场',town:'溪谷镇'}[CUR.id]||(CUR.floor?'矿井 '+CUR.floor+'层':'矿井入口');},
 hotbar(){const h=$('#hotbar');let html='';for(let i=0;i<12;i++)html+=slotHTML(S.inv[i],i,i==S.sel?'data-sel="1"':'');h.innerHTML=html;
  h.querySelectorAll('.slot').forEach(e=>e.onpointerdown=ev=>{ev.stopPropagation();S.sel=+e.dataset.i;this.hotbar();});},
 // ---------- 主菜单 ----------
 menu(tab){tab=tab||'inv';const tabs=[['inv','背包'],['craft','制作'],['rel','好感'],['col','收藏'],['cal','日历'],['sys','系统']];
  const head='<div class="tabs">'+tabs.map(([k,n])=>`<button data-tab="${k}" class="${k==tab?'on':''}">${n}</button>`).join('')+'</div>';
  this.panel('菜单',head+'<div id="tabbody"></div>',p=>{p.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>this.menu(b.dataset.tab));this['tab_'+tab]($('#tabbody'));},'big');},
 tab_inv(el){const info=s=>{if(!s)return '点击两个格子可交换位置';const it=ITEMS[s.id];return `<b>${itemName(s)}</b> · ${({crop:'作物',seed:'种子',fish:'鱼',ore:'矿石',bar:'金属锭',gem:'宝石',artifact:'古物',forage:'采集品',res:'材料',food:'料理',tool:'工具',animal:'畜产品',place:'可放置',fert:'肥料',misc:'杂项',trash:'垃圾'})[it.cat]||''}${it.p?' · 售价 '+sellPrice(s.id,s.q)+'金':''}${it.edible?' · 食用体力+'+it.edible:''}${it.crop?' · 季节：'+CROPS[it.crop].seasons.map(x=>SEASONS[x]).join('/')+' · '+CROPS[it.crop].days+'天成熟'+(CROPS[it.crop].regrow?'，可重复收获':''):''}`;};
  const draw=()=>{let h='<div class="grid">';for(let i=0;i<S.invSize;i++)h+=slotHTML(S.inv[i],i,(i==this.pick?'data-sel="1"':'')+(i<12?' data-hb="1"':''));h+='</div>';
   h+=`<div class="info">${info(S.inv[this.pick])}</div><div class="row"><button id="b-trash">丢弃选中</button><button id="b-eat">食用选中</button><button id="b-sort">整理</button><span class="mut">背包 ${S.invSize} 格 · 第一行为快捷栏</span></div>`;el.innerHTML=h;
   el.querySelectorAll('.slot').forEach(e=>e.onclick=()=>{const i=+e.dataset.i;if(this.pick>=0&&this.pick!=i){const t=S.inv[i];S.inv[i]=S.inv[this.pick];S.inv[this.pick]=t;this.pick=-1;}else this.pick=this.pick==i?-1:i;draw();this.hotbar();});
   $('#b-trash').onclick=()=>{const s=S.inv[this.pick];if(!s||ITEMS[s.id].cat=='tool')return;if(confirm('确定丢弃 '+itemName(s)+'×'+s.n+'？')){S.inv[this.pick]=null;this.pick=-1;draw();this.hotbar();}};
   $('#b-eat').onclick=()=>{const s=S.inv[this.pick];if(!s||!ITEMS[s.id].edible)return;const o=S.sel;S.sel=this.pick;eat(s);S.sel=o;draw();this.hotbar();};
   $('#b-sort').onclick=()=>{const tools=[],rest=[];for(let i=0;i<S.invSize;i++){const s=S.inv[i];if(!s)continue;(ITEMS[s.id].cat=='tool'?tools:rest).push(s);}rest.sort((a,b)=>(ITEMS[a.id].cat+a.id).localeCompare(ITEMS[b.id].cat+b.id));const all=tools.concat(rest);for(let i=0;i<S.invSize;i++)S.inv[i]=all[i]||null;draw();this.hotbar();};};
  draw();},
 tab_craft(el,cook){const list=cook?RECIPES_COOK.map(r=>[r[0],r[2],1]):CRAFT;
  const draw=()=>{el.innerHTML='<div class="list">'+list.map(([id,cost,n],i)=>{const ok=hasCost(cost);return `<div class="li ${ok?'':'dim'}"><img src="${iconURL(id)}"><div class="grow"><b>${ITEMS[id].n}${n>1?' ×'+n:''}</b><small>${costStr(cost)}${ITEMS[id].edible?' · 体力+'+ITEMS[id].edible:''}</small></div><button data-c="${i}" ${ok?'':'disabled'}>${cook?'烹饪':'制作'}</button></div>`;}).join('')+'</div>';
   el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const [id,cost,n]=list[+b.dataset.c];if(!hasCost(cost))return;payCost(cost);give(id,n);if(cook)S.cooked[id]=(S.cooked[id]||0)+1;SFX.play(cook?'eat':'place');this.toast((cook?'做好了':'制作了')+ITEMS[id].n);draw();this.hotbar();});};draw();},
 tab_rel(el){el.innerHTML='<div class="list">'+NPCS.map(n=>{const f=S.friends[n.id];const h=NPCSYS.hearts(n.id);const known=Object.keys(S.found).filter(k=>k.startsWith('gift_'+n.id+'_')).map(k=>[k.split('_').slice(2).join('_'),S.found[k]]);
   return `<div class="li"><img class="por" src="${charSpr(NPCSYS.look(n),0,0).toDataURL()}"><div class="grow"><b>${n.n}</b> <small>${n.role} · 生日 ${SEASONS[n.bd[0]]}${n.bd[1]}日</small><div class="hearts">${'♥'.repeat(h)}<span>${'♥'.repeat(10-h)}</span></div><small>${f.talk?'今天聊过 ':''}${f.gift?'今天已送礼 ':''}本周送礼 ${f.week}/2</small>${known.length?'<small>已知喜好：'+known.map(([id,t])=>ITEMS[id]?ITEMS[id].n+({love:'❤',like:'👍',neutral:'·',hate:'✗'}[t]):'').join(' ')+'</small>':''}</div></div>`;}).join('')+'</div>';},
 tab_col(el,sub){sub=sub||'ship';const groups={ship:['出货',Object.values(ITEMS).filter(i=>['crop','forage','animal'].includes(i.cat)),S.shipped],fish:['鱼类',FISH_LIST.map(f=>ITEMS[f[0]]),S.fish],min:['矿物与古物（博物馆）',Object.values(ITEMS).filter(i=>i.cat=='gem'||i.cat=='artifact'),S.museum],cook:['料理',RECIPES_COOK.map(r=>ITEMS[r[0]]),S.cooked]};
  const g=groups[sub];const got=g[1].filter(i=>g[2][i.id]).length;
  el.innerHTML='<div class="tabs sm">'+Object.entries(groups).map(([k,v])=>`<button data-s="${k}" class="${k==sub?'on':''}">${v[0]}</button>`).join('')+`</div><p class="mut">已收集 ${got}/${g[1].length}${sub=='min'?'（在博物馆捐赠后记录）':''}</p><div class="grid col">`+g[1].map(i=>g[2][i.id]?`<div class="slot" title="${i.n}"><img src="${iconURL(i.id)}"><b>${typeof g[2][i.id]=='number'?g[2][i.id]:''}</b></div>`:`<div class="slot empty unk" title="？？？">?</div>`).join('')+'</div>';
  el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>this.tab_col(el,b.dataset.s));},
 tab_cal(el){let h=`<h3>${SEASONS[S.season]}季 · 第${S.year}年</h3><div class="cal">`+WEEK.map(w=>`<div class="wk">周${w}</div>`).join('');
  for(let d=1;d<=28;d++){const f=FESTIVALS[S.season].day==d?FESTIVALS[S.season].n:'';const b=NPCS.filter(n=>n.bd[0]==S.season&&n.bd[1]==d).map(n=>n.n+'生日').join(' ');h+=`<div class="day ${d==S.day?'now':''} ${f?'fest':''}"><b>${d}</b><small>${f}${b}</small></div>`;}
  h+='</div><p class="mut">每季28天。季节交替时，不属于新季节的作物会枯死。</p>';el.innerHTML=h;},
 tab_sys(el){const st=S.settings;el.innerHTML=`<div class="list"><div class="li"><div class="grow"><b>背景音乐</b></div><button id="s-mus">${st.music?'开':'关'}</button></div>
  <div class="li"><div class="grow"><b>音效</b></div><button id="s-sfx">${st.sfx?'开':'关'}</button></div>
  <div class="li"><div class="grow"><b>时间流速</b><small>默认1倍：现实7秒=游戏10分钟</small></div><button id="s-spd">${st.speed}×</button></div>
  <div class="li"><div class="grow"><b>存档</b><small>每晚睡觉时自动保存到本机浏览器（localStorage）。</small></div><button id="s-exp">导出 JSON 备份</button><button id="s-imp">导入备份</button></div>
  <div class="li"><div class="grow"><b>操作说明</b><small>WASD/方向键移动 · 左键/空格/J 使用工具 · 右键/E/K 互动(对话/收获/开箱/送礼) · 1-9,0,-,= 或滚轮切换快捷栏 · Tab/I/Esc 菜单 · 手机：左下摇杆，右下按钮</small></div></div>
  <div class="li"><div class="grow"><b>返回标题画面</b><small>未睡觉的当天进度不会保存</small></div><button id="s-title">返回标题</button></div></div>
  <p class="mut">溪谷小农场 · 非商业同人致敬作品，玩法灵感来自《星露谷物语》，全部美术、音乐、角色与文本均为原创。</p>`;
  $('#s-mus').onclick=()=>{st.music=!st.music;MUSIC.toggle(st.music);this.tab_sys(el);};$('#s-sfx').onclick=()=>{st.sfx=!st.sfx;this.tab_sys(el);};
  $('#s-spd').onclick=()=>{st.speed={1:1.5,1.5:2,2:.5,.5:1}[st.speed]||1;this.tab_sys(el);};
  $('#s-exp').onclick=()=>exportSave();$('#s-imp').onclick=()=>importSave();$('#s-title').onclick=()=>{this.closeAll();showTitle();};},
 // ---------- 对话 ----------
 dialog(n,txt,choices){this.open='dialog';this.dlgNpc=n?n.id:null;const d=$('#dialog');const nm=n?n.n:'';const por=n?`<img class="por" src="${charSpr(NPCSYS.look(n),0,0).toDataURL()}">`:'';
  const h=n?NPCSYS.hearts(n.id):0;
  d.innerHTML=`<div class="dl">${por}<div class="grow">${nm?`<b>${nm}</b> <span class="hearts sm">${'♥'.repeat(h)}</span>`:''}<p>${esc(txt)}</p><div class="row">${(choices||[{t:'好的'}]).map((c,i)=>`<button data-k="${i}">${c.t}</button>`).join('')}</div></div></div>`;
  d.classList.remove('hide');d.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const c=(choices||[{}])[+b.dataset.k];this.closeAll();if(c.f)c.f();this.hotbar();});},
 confirm(txt,yes){this.dialog(null,txt,[{t:'确定',f:yes},{t:'取消'}]);},
 // ---------- 房屋 ----------
 house(){const ch=[{t:'睡觉（保存）',f:()=>sleep()}];if(S.houseLv>=1)ch.push({t:'厨房烹饪',f:()=>this.panel('厨房',"<div id='ck'></div>",()=>this.tab_craft($('#ck'),true))});ch.push({t:'离开'});
  this.dialog(null,S.houseLv>=1?'温暖的小屋。要做什么？':'温暖的小屋。（升级房屋后可以在厨房烹饪）',ch);},
 animalHouse(kind){const B=BUILDINGS[kind];const list=S.animals.filter(a=>ANIMALS[a.type].b==kind);
  const draw=()=>{this.panel(B.n,`<p>饲料槽干草：<b>${S.hay}</b>（晴天户外吃草，否则每只每晚吃1份干草）</p><div class="row"><button id="hay">放入背包里的全部干草（${countItem('hay')}）</button><button id="petall">抚摸全部并收集产品</button></div>
   <div class="list">${list.map(a=>`<div class="li"><img src="${animalSpr(a.type,0).toDataURL()}" class="por"><div class="grow"><b>${a.name}</b> <small>${ANIMALS[a.type].n} · 好感 ${Math.floor(a.fr/200)}/5 ${a.pet?'· 今天摸过':''} ${a.prod?'· 有产品：'+ITEMS[a.prod].n:''}</small></div></div>`).join('')||'<p class="mut">还没有动物。去木匠铺购买吧。</p>'}</div>`,()=>{
    $('#hay').onclick=()=>{const n=countItem('hay');removeItem('hay',n);S.hay+=n;draw();this.hotbar();};
    $('#petall').onclick=()=>{let msgs=list.map(a=>ANIM.petOne(a)).filter(Boolean);SFX.play('animal');this.toast(msgs.length?'照顾好了'+list.length+'只动物':'今天都照顾过了');draw();this.hotbar();};});};draw();},
 // ---------- 出货 ----------
 ship(){const draw=()=>{const est=S.bin.reduce((a,s)=>a+sellPrice(s.id,s.q)*s.n,0);let h='<p>点击背包物品放入出货箱（整组）。物品会在夜里卖出。</p><div class="grid">';
   for(let i=0;i<S.invSize;i++){const s=S.inv[i];const ok=s&&ITEMS[s.id].cat!='tool'&&ITEMS[s.id].p>0;h+=slotHTML(s,i,ok?'':'data-no="1"');}
   h+=`</div><h3>出货箱（预计 ${est} 金）</h3><div class="grid">`+S.bin.map((s,i)=>slotHTML(s,i,'data-bin="1"')).join('')+'</div><p class="mut">点击出货箱中的物品可取回</p>';
   this.panel('出货箱',h,p=>{p.querySelectorAll('.slot:not([data-bin])').forEach(e=>e.onclick=()=>{if(e.dataset.no)return;const i=+e.dataset.i;const s=S.inv[i];if(!s)return;const b=S.bin.find(x=>x.id==s.id&&(x.q||0)==(s.q||0));if(b)b.n+=s.n;else S.bin.push({id:s.id,n:s.n,q:s.q||0});S.inv[i]=null;SFX.play('ship');draw();this.hotbar();});
    p.querySelectorAll('[data-bin]').forEach(e=>e.onclick=()=>{const i=+e.dataset.i;const s=S.bin[i];if(s&&invAdd(s.id,s.n,s.q)){S.bin.splice(i,1);draw();this.hotbar();}});});};draw();},
 chest(o){const draw=()=>{let h='<h3>箱子</h3><div class="grid">'+o.items.map((s,i)=>slotHTML(s,i,'data-c="1"')).join('')+'</div><h3>背包</h3><div class="grid">';for(let i=0;i<S.invSize;i++)h+=slotHTML(S.inv[i],i);h+='</div>';
   this.panel('储物箱',h,p=>{p.querySelectorAll('.slot').forEach(e=>e.onclick=()=>{const i=+e.dataset.i;if(e.dataset.c){const s=o.items[i];if(s&&invAdd(s.id,s.n,s.q))o.items[i]=null;}else{const s=S.inv[i];if(!s||ITEMS[s.id].cat=='tool')return;let j=o.items.findIndex(x=>x&&x.id==s.id&&(x.q||0)==(s.q||0));if(j>=0)o.items[j].n+=s.n;else{j=o.items.indexOf(null);if(j<0)return;o.items[j]=s;}S.inv[i]=null;}draw();this.hotbar();});});};draw();},
 // ---------- 商店 ----------
 shop(kind){const goods=shopGoods(kind);const titles={general:'杂货店 · 林夏',smith:'铁匠铺 · 铁山',carpenter:'木匠铺 · 柏木',fish:'渔具店 · 海伯'};
  const draw=()=>{this.panel(titles[kind],`<p class="mut">持有 ${S.money.toLocaleString()} 金</p><div class="list">`+goods().map((g,i)=>{const ok=g.ok!==false&&hasCost(g.cost);return `<div class="li ${ok?'':'dim'}"><img src="${g.icon}"><div class="grow"><b>${g.n}</b><small>${costStr(g.cost)}${g.d?' · '+g.d:''}</small></div><button data-b="${i}" ${ok?'':'disabled'}>${g.btn||'购买'}</button>${g.stack?`<button data-b5="${i}" ${hasCost(mulCost(g.cost,5))?'':'disabled'}>×5</button>`:''}</div>`;}).join('')+'</div>',p=>{
   p.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const g=goods()[+b.dataset.b];if(!hasCost(g.cost))return;if(g.buy()!==false){payCost(g.cost);SFX.play('coin');}draw();this.hotbar();});
   p.querySelectorAll('[data-b5]').forEach(b=>b.onclick=()=>{const g=goods()[+b.dataset.b5];const c=mulCost(g.cost,5);if(!hasCost(c))return;for(let k=0;k<5;k++)g.buy();payCost(c);SFX.play('coin');draw();this.hotbar();});});};draw();},
 museum(){const draw=()=>{const cand=[];for(let i=0;i<S.invSize;i++){const s=S.inv[i];if(s&&(ITEMS[s.id].cat=='gem'||ITEMS[s.id].cat=='artifact')&&!S.museum[s.id])cand.push(i);}
   const total=MINERALS.length+ARTIFACTS.length;const n=Object.keys(S.museum).length;
   this.panel('溪谷博物馆 · 顾远',`<p>已捐赠 <b>${n}/${total}</b>。奖励：${Object.entries(MUSEUM_REWARDS).map(([k,v])=>k+'件→'+(v.money?v.money+'金':ITEMS[v.item].n+'×'+v.n)+(S.museumRw[k]?'✔':'')).join('，')}</p><div class="list">${cand.map(i=>`<div class="li"><img src="${iconURL(S.inv[i].id)}"><div class="grow"><b>${ITEMS[S.inv[i].id].n}</b></div><button data-d="${i}">捐赠</button></div>`).join('')||'<p class="mut">背包里没有可捐赠的新宝石或古物。</p>'}</div>`,p=>{
    p.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const i=+b.dataset.d;const s=S.inv[i];S.museum[s.id]=1;s.n--;if(s.n<=0)S.inv[i]=null;SFX.play('gift');const c=Object.keys(S.museum).length;const rw=MUSEUM_REWARDS[c];if(rw&&!S.museumRw[c]){S.museumRw[c]=1;if(rw.money)S.money+=rw.money;else give(rw.item,rw.n);this.toast('博物馆奖励：'+(rw.money?rw.money+'金':ITEMS[rw.item].n+'×'+rw.n),'gold');}
     S.friends.guyuan.pts+=30;draw();this.hotbar();});});};draw();},
 elevator(){const max=Math.min(40,Math.floor(S.mineMax/5)*5);let fl=[];for(let f=0;f<=max;f+=5)fl.push(f);
  this.panel('矿井电梯',`<div class="elev">${fl.map(f=>`<button data-f="${f}">${f==0?'入口':f+'层'}</button>`).join('')}</div><p class="mut">每到达5的倍数层即可解锁电梯</p>`,p=>p.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{this.closeAll();enterMap('mine'+b.dataset.f);SFX.play('ladder');}));},
 summary(sm){const L=sm.lines;this.panel(`${dateStr()} 的早晨`,`${sm.passed?'<p class="warn">昨晚你没能按时回家……</p>':''}<h3>昨日出货</h3><div class="list">${L.map(([id,n,q,v])=>`<div class="li"><img src="${iconURL(id)}"><div class="grow">${ITEMS[id].n}${q?(q==2?'★金':'★银'):''} ×${n}</div><b>${v}金</b></div>`).join('')||'<p class="mut">没有出货。</p>'}</div><h3>合计 ${sm.total} 金 · 当前 ${S.money.toLocaleString()} 金</h3>
   <p>今日天气：${WEATHER_N[S.weather]}　明日预报：${WEATHER_N[S.tomorrow]}${isFestDay()?'<br><b>今天是'+FESTIVALS[S.season].n+'！9:00-14:00 在小镇广场。</b>':''}${NPCS.filter(n=>NPCSYS.isBday(n)).map(n=>'<br>今天是'+n.n+'的生日。').join('')}${S.day==1?'<br><b>'+SEASONS[S.season]+'季开始了！</b>':''}</p><div class="row"><button data-close2>开始新的一天</button></div>`,p=>{p.querySelector('[data-close2]').onclick=()=>this.closeAll();});MUSIC.season();},
 festival(){const F=FESTIVALS[S.season];const done=S.festDone[festKey()];
  this.dialog(NPCS.find(n=>n.id=='zhoubo'),done?'今年的'+F.n+'已经结束啦，谢谢你的参与！':F.n+'开始啦！'+F.desc+' 准备好了吗？',done?null:[{t:'开始！',f:()=>startFestival()},{t:'再逛逛'}]);},
 pickItems(title,max,cb){const sel=new Set();const draw=()=>{let h=`<p>选择最多 ${max} 件物品</p><div class="grid">`;for(let i=0;i<S.invSize;i++){const s=S.inv[i];const ok=s&&ITEMS[s.id].cat!='tool';h+=slotHTML(s,i,(sel.has(i)?'data-sel="1"':'')+(ok?'':' data-no="1"'));}h+=`</div><div class="row"><button id="pk-ok">确定（${sel.size}）</button></div>`;
  this.panel(title,h,p=>{p.querySelectorAll('.slot').forEach(e=>e.onclick=()=>{if(e.dataset.no)return;const i=+e.dataset.i;if(sel.has(i))sel.delete(i);else if(sel.size<max)sel.add(i);draw();});$('#pk-ok').onclick=()=>{if(!sel.size)return;this.closeAll();cb([...sel]);};});};draw();},
};
function mulCost(c,n){const o={};for(const k in c)o[k]=c[k]*n;return o;}
function shopGoods(kind){return ()=>{const g=[];const add=(id,price,d)=>g.push({n:ITEMS[id].n,icon:iconURL(id),cost:{money:price},d,stack:true,buy:()=>{if(!invAdd(id,1)){UI.toast('背包满了','warn');return false;}S.found[id]=S.found[id]||0;}});
 if(kind=='general'){CROP_LIST.filter(c=>c[2].includes(S.season)).forEach(c=>add(c[0]+'_seed',c[5],c[3]+'天'+(c[4]?'，再生'+c[4]+'天':'')));
  add('fertilizer',100,'提高作物品质');add('qfert',150,'大幅提高品质');add('speedgro',100,'生长时间-25%');add('acorn',100,'种下长成橡树');
  if(S.invSize<36)g.push({n:'大背包（+12格）',icon:iconURL('chest'),cost:{money:S.invSize==24?2000:10000},buy:()=>{S.invSize+=12;UI.toast('背包扩容了！');}});}
 if(kind=='smith'){add('copper_ore',75);add('iron_ore',150);add('gold_ore',400);add('coal',150);
  ['hoe','can','axe','pick'].forEach(t=>{const tier=S.tools[t];if(tier<3)g.push({n:TIER_N[tier+1]+TOOLS[t],icon:toolSpr(t,tier+1).toDataURL(),cost:UPGRADE_COST[tier+1],d:{hoe:'一次开垦更多土地',can:'容量更大，一次浇更多地',axe:'砍伐更快，可劈大木桩',pick:'敲击更强，可碎大石'}[t],buy:()=>{S.tools[t]++;UI.toast(TOOLS[t]+'升级完成！','gold');}});});
  const sw=S.tools.sword;if(sw<3)g.push({n:SWORDS[sw+1][1],icon:toolSpr('sword',sw+1).toDataURL(),cost:{money:[0,1500,5000,12000][sw+1],iron_bar:sw>=1?3:0},d:'攻击力 '+SWORDS[sw+1][2],buy:()=>{S.tools.sword++;UI.toast('获得了'+SWORDS[S.tools.sword][1]+'！','gold');}});}
 if(kind=='carpenter'){add('wood',10);add('stone',20);add('hay',50,'动物饲料');
  for(const b of ['coop','barn']){if(!S[b])g.push({n:'建造'+BUILDINGS[b].n,icon:iconURL(b=='coop'?'egg':'milk'),cost:BUILDINGS[b].cost,d:'立即建在农场房屋东侧',buy:()=>{S[b]=true;buildFarmBld(b);UI.toast(BUILDINGS[b].n+'建好了！','gold');}});}
  for(const t in ANIMALS){const A=ANIMALS[t];const cnt=S.animals.filter(a=>ANIMALS[a.type].b==A.b).length;g.push({n:'购买'+A.n,icon:animalSpr(t,0).toDataURL(),cost:{money:A.price},ok:S[A.b]&&cnt<BUILDINGS[A.b].cap,d:S[A.b]?(cnt<BUILDINGS[A.b].cap?'产出'+ITEMS[A.prod].n:'已满'):'需要先建造'+BUILDINGS[A.b].n,buy:()=>{const nm=prompt('给你的'+A.n+'起个名字：',A.n+(S.animalId))||A.n+S.animalId;S.animals.push({id:S.animalId++,type:t,name:nm.slice(0,8),fr:100,pet:0,prod:null,days:0});ANIM.place();UI.toast(nm+'来到了农场！');}});}
  const hl=S.houseLv+1;if(HOUSE_UP[hl])g.push({n:'房屋升级',icon:iconURL('chest'),cost:Object.fromEntries(Object.entries(HOUSE_UP[hl]).filter(([k])=>k!='n')),d:HOUSE_UP[hl].n,buy:()=>{S.houseLv=hl;if(hl==2){S.maxEnergy+=30;}UI.toast('房屋升级完成！','gold');}});}
 if(kind=='fish'){add('bait',5,'缩短咬钩等待');const r=S.tools.rod;const nx=ROD_SHOP.find(x=>x[0]==r+1);if(nx)g.push({n:nx[1],icon:toolSpr('rod',nx[0]).toDataURL(),cost:{money:nx[2]},d:'钓鱼条更宽',buy:()=>{S.tools.rod=nx[0];UI.toast('换上了'+nx[1]+'！','gold');}});}
 return g;};}
// ---------- 节日 ----------
function startFestival(){const F=FESTIVALS[S.season];const m=MAPS.town;
 if(F.id=='egg'){FEST.lock=true;FEST.id='egg';FEST.score=0;FEST.timer=60;let n=0,tries=0;while(n<20&&tries++<2000){const x=3+Math.floor(Math.random()*44),y=3+Math.floor(Math.random()*27);const k=K(x,y);if(!m.obj[k]&&!isSolid(m,x,y)&&Math.hypot(x-24,y-15)<18){m.obj[k]={t:'fegg'};n++;}}UI.toast('寻蛋开始！60秒！','gold');}
 else if(F.id=='icefish'){FEST.lock=true;FEST.id='icefish';FEST.score=0;FEST.timer=120;if(!S.inv.some(s=>s&&s.id=='rod'))invAdd('rod',1);S.sel=Math.max(0,S.inv.findIndex(s=>s&&s.id=='rod'));UI.hotbar();UI.toast('冰钓赛开始！去河边或海边钓鱼！','gold');}
 else if(F.id=='soup'){UI.pickItems('往汤锅里加一样食材',1,([i])=>{const s=S.inv[i];const it=ITEMS[s.id];const sc=it.cat=='trash'||it.cat=='ore'||it.cat=='res'?-1:it.p*(1+(s.q||0)*.3)>=200?2:it.p>=60?1:0;removeAt(i,1);
   for(const id in S.friends)S.friends[id].pts=Math.max(0,S.friends[id].pts+[-30,0,30,80][sc+1]);
   endFestival(['呸呸……这汤是什么味道！大家脸都绿了。','汤的味道……还行吧。','嗯！好鲜的汤，大家都很满意！','太美味了！这是溪谷有史以来最好喝的汤！'][sc+1]);});}
 else if(F.id=='fair'){UI.pickItems('挑选参展物品',6,(arr)=>{const cats=new Set();let val=0;for(const i of arr){const s=S.inv[i];cats.add(ITEMS[s.id].cat);val+=sellPrice(s.id,s.q);}
   const score=cats.size*6+Math.floor(val/40)+arr.length*2;const prize=score>=60?3000:score>=40?1500:score>=20?700:200;S.money+=prize;
   endFestival(`评委打分：${score}分！${score>=60?'一等奖':score>=40?'二等奖':score>=20?'三等奖':'参与奖'}，奖金${prize}金。展品已归还。`);});}
}
function removeAt(i,n){const s=S.inv[i];s.n-=n;if(s.n<=0)S.inv[i]=null;}
function endFestival(msg){S.festDone[festKey()]=1;const m=MAPS.town;for(const k in m.obj)if(m.obj[k].t=='fegg')delete m.obj[k];
 UI.dialog(NPCS.find(n=>n.id=='zhoubo'),msg+' 今天的节日到此结束，大家晚安！',[{t:'回家',f:()=>{FEST=null;S.time=Math.max(S.time,22*60);enterMap('farm',10,8);}}]);}
function updateFest(dt){
 if(!FEST&&CUR.id=='town'&&isFestDay()&&S.time>=9*60&&S.time<14*60){FEST={active:true};NPCSYS.place();}
 if(FEST&&FEST.lock){FEST.timer-=dt;if(FEST.timer<=0){FEST.lock=false;FISHING=null;const F=FESTIVALS[S.season];
  if(F.id=='egg'){const win=FEST.score>=9;if(win){S.money+=1000;give('qfert',10);}endFestival(`你找到了${FEST.score}个彩蛋！${win?'冠军！奖励1000金和优质肥料×10。':'差一点点，明年再来！'}`);}
  if(F.id=='icefish'){const win=FEST.score>=5;if(win){S.money+=2000;give('diamond',1);}endFestival(`你钓到了${FEST.score}条鱼！${win?'夺冠！奖励2000金和星钻。':'海伯赢了这一届，明年加油！'}`);}}}}
// ---------- 存档导入导出 ----------
function exportSave(){const j=saveGame();const blob=new Blob([j],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`溪谷小农场存档_第${S.year}年${SEASONS[S.season]}${S.day}日.json`;document.body.appendChild(a);a.click();a.remove();UI.toast('已导出存档（当前进度）');}
function importSave(){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!d.S||!d.farm)throw new Error('格式不对');loadData(d);saveGame();UI.closeAll();hideTitle();UI.toast('存档导入成功！');}catch(e){alert('导入失败：'+e.message);}});};i.click();}
