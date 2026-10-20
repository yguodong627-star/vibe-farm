// 溪谷小农场 - 游戏数据（全部原创）
'use strict';
const SEASONS=['春','夏','秋','冬'];
const SEASON_KEYS=['spring','summer','fall','winter'];
const WEEK=['一','二','三','四','五','六','日'];
const ITEMS={};
function item(id,n,p,cat,shape,c1,c2,extra){ITEMS[id]=Object.assign({id,n,p,cat,shape,c1,c2:c2||c1},extra||{});}
// ---------- 作物 ----------
// [id,名称,季节,成熟天数,再生天数,种子价,售价,颜色1,颜色2,形状]
const CROP_LIST=[
 ['potato','土豆',[0],6,0,50,80,'#c9a063','#8a6a3a','round'],
 ['bokchoy','小白菜',[0],4,0,20,50,'#9fe07a','#e8f5d8','leaf'],
 ['strawberry','草莓',[0],8,4,100,120,'#e8364a','#4caf50','berry'],
 ['pea','豌豆',[0],7,3,60,45,'#7ccf4f','#3d8a2a','long'],
 ['tulip','郁金香',[0],6,0,20,60,'#ff6fa8','#4caf50','flower'],
 ['asparagus','芦笋',[0],10,0,110,190,'#6aa84f','#c5e0a5','long'],
 ['scallion','小葱',[0],5,0,30,70,'#d8f0c8','#3f9a3f','long'],
 ['tomato','番茄',[1],11,4,50,60,'#e8412c','#3f8a2a','round'],
 ['watermelon','西瓜',[1],12,0,80,250,'#2f8a3a','#9fe07a','big'],
 ['corn','玉米',[1,2],14,4,150,50,'#f4d03f','#7cb342','long'],
 ['chili','辣椒',[1],5,3,40,40,'#d62828','#2e7d32','long'],
 ['sunflower','向日葵',[1,2],8,0,125,80,'#ffcc00','#6b3e1e','flower'],
 ['blueberry','蓝莓',[1],13,4,80,50,'#4a5fd0','#2e3c8a','berry'],
 ['pumpkin','南瓜',[2],13,0,100,320,'#ef8a1e','#a65a10','big'],
 ['eggplant','茄子',[2],5,5,20,60,'#6a2c91','#3f8a2a','long'],
 ['yam','红薯',[2],10,0,60,160,'#c0504d','#7a2e2b','round'],
 ['grape','葡萄',[2],10,3,60,80,'#7b3fa0','#4caf50','berry'],
 ['cranberry','蔓越莓',[2],7,5,240,75,'#b5172f','#6e0e1d','berry'],
 ['daikon','白萝卜',[2],6,0,40,90,'#f3f3ea','#7cb342','long'],
 ['beet','甜菜',[2],6,0,20,100,'#8e1d4a','#4caf50','round'],
 ['wintercab','冬白菜',[3],8,0,70,150,'#e3f2d0','#9ccc65','leaf'],
];
const CROPS={};
CROP_LIST.forEach(([id,n,s,d,r,sp,p,c1,c2,sh])=>{
 CROPS[id]={id,n,seasons:s,days:d,regrow:r,seedPrice:sp,c1,c2};
 item(id,n,p,'crop',sh,c1,c2,{edible:Math.round(p/3)});
 item(id+'_seed',n+'种子',Math.floor(sp/2),'seed','seed',c1,'#d9c7a0',{crop:id,buy:sp});
});
// ---------- 资源 ----------
item('wood','木材',2,'res','wood','#a0703c','#6b4423');
item('hardwood','硬木',15,'res','wood','#7a4a2a','#4a2a14');
item('stone','石头',2,'res','stone','#9a9a9a','#666');
item('fiber','纤维',1,'res','fiber','#7cb342','#4e7d2a');
item('sap','树液',2,'res','drop','#d08a2a','#8a5a10');
item('coal','煤炭',15,'res','ore','#333','#111');
item('copper_ore','铜矿石',5,'ore','ore','#d8844a','#7a4a2a');
item('iron_ore','铁矿石',10,'ore','ore','#c8c8d8','#6a6a7a');
item('gold_ore','金矿石',25,'ore','ore','#f4d03f','#a88a10');
item('copper_bar','铜锭',60,'bar','bar','#e08a50','#9a5020');
item('iron_bar','铁锭',120,'bar','bar','#d0d0dc','#7a7a8a');
item('gold_bar','金锭',250,'bar','bar','#ffd700','#b8930a');
item('acorn','橡子',5,'seed','seed','#8a5a2a','#c9a063',{tree:'oak'});
item('pinecone','松果',5,'seed','seed','#7a5a3a','#5a3a1a',{tree:'pine'});
// ---------- 宝石与收藏 ----------
const MINERALS=[['quartz','石英',25,'#f0f0ff','#b8c8e8'],['amethyst','紫晶',100,'#a05ae0','#6a2aa0'],['topaz','黄玉',80,'#f0c040','#b08010'],['jade','青玉',200,'#4ac08a','#1a7a4a'],['ruby','赤玉',250,'#e02a4a','#8a0a2a'],['aquamarine','海蓝石',180,'#4ad0e0','#1a7a9a'],['diamond','星钻',750,'#e8fcff','#9ae0f0'],['frostgem','霜晶',90,'#bfe8ff','#6aaad0']];
MINERALS.forEach(([id,n,p,a,b])=>item(id,n,p,'gem','gem',a,b));
const ARTIFACTS=[['fossil','螺旋化石',150,'#c8b89a'],['potshard','古陶片',80,'#b0603a'],['amber','琥珀',120,'#e0901a'],['oldcoin','旧铜钱',100,'#b08a4a'],['bonefish','鱼骨化石',200,'#ddd5c0'],['stoneidol','石刻小像',250,'#8a8a7a']];
ARTIFACTS.forEach(([id,n,p,c])=>item(id,n,p,'artifact','artifact',c,'#6a5a4a'));
// ---------- 采集 ----------
const FORAGE={0:[['wildleek','野韭菜',40,'#8bc34a'],['dandelion','蒲公英',35,'#ffe14a'],['morel','羊肚菌',150,'#8a6a4a']],
 1:[['raspberry','树莓',30,'#e0405a'],['lilyflower','野百合',80,'#ffb0d0'],['mintleaf','薄荷叶',50,'#4ade80']],
 2:[['mushroom','野蘑菇',60,'#c8794a'],['hazelnut','榛子',70,'#a0703c'],['wildplum','野李子',80,'#7a3fa0']],
 3:[['snowberry','雪果',60,'#d0e8ff'],['winterroot','冬根',70,'#a07050'],['icecone','冰凌花',90,'#a0e0ff']]};
for(const s in FORAGE)FORAGE[s].forEach(([id,n,p,c])=>item(id,n,p,'forage',id.includes('mush')||id=='morel'?'mushroom':(id.includes('berry')||id=='wildplum'?'berry':(id.includes('flower')||id=='dandelion'||id=='icecone'?'flower':'leaf')),c,'#4e7d2a',{edible:Math.round(p/2.5)}));
const BEACH_FORAGE=[['shell','扇贝壳',40,'#f5d6c0'],['coral','红珊瑚',80,'#ff6a5a'],['conch','海螺',60,'#f0c0a0']];
BEACH_FORAGE.forEach(([id,n,p,c])=>item(id,n,p,'forage','shell',c,'#b08060'));
// ---------- 鱼 ----------
// [id,名称,水域,季节,时段[起,止](时),天气 any/rain/sun,难度1-100,行为,售价,颜色]
const FISH_LIST=[
 ['crucian','鲫鱼','river',[0,1,2,3],[6,26],'any',20,'smooth',30,'#9aa8a0'],
 ['carp','鲤鱼','lake',[0,1,2,3],[6,26],'any',15,'smooth',30,'#c0a060'],
 ['grasscarp','草鱼','river',[0,1],[6,20],'any',35,'mixed',60,'#7a9a5a'],
 ['mandarin','鳜鱼','river',[0,2],[6,19],'any',55,'dart',110,'#a08a40'],
 ['eel','黄鳝','river',[1,2],[16,26],'rain',65,'sinker',140,'#8a7020'],
 ['minnow','银鲦','river',[0,1,2],[6,19],'sun',25,'dart',40,'#d0d8e0'],
 ['bass','鲈鱼','lake',[0,1,2],[6,19],'any',40,'mixed',80,'#5a7a4a'],
 ['bighead','胖头鱼','lake',[1,2],[6,26],'any',45,'smooth',90,'#7a7a8a'],
 ['blackcarp','青鱼','lake',[2,3],[6,26],'any',50,'mixed',100,'#3a4a5a'],
 ['sunfish','太阳鱼','lake',[0,1],[6,19],'sun',20,'mixed',35,'#e0b040'],
 ['laketrout','湖鳟','lake',[0,2],[6,19],'rain',55,'dart',120,'#c07a8a'],
 ['hairtail','带鱼','ocean',[2,3],[6,26],'any',50,'smooth',90,'#d0d8e8'],
 ['pomfret','鲳鱼','ocean',[0,1],[6,19],'any',35,'mixed',70,'#c0c8d0'],
 ['croaker','黄花鱼','ocean',[0,2],[6,19],'any',45,'mixed',100,'#f0c040'],
 ['seabass','海鲈','ocean',[0,1,2,3],[6,26],'any',30,'smooth',60,'#8090a0'],
 ['octopus','章鱼','ocean',[1],[6,13],'any',80,'sinker',150,'#c05a7a'],
 ['seabream','真鲷','ocean',[1,2],[6,19],'sun',55,'dart',130,'#e07a6a'],
 ['squid','鱿鱼','ocean',[3],[18,26],'any',60,'sinker',110,'#e0c0d0'],
 ['puffer','河豚','ocean',[1],[12,16],'sun',75,'floater',200,'#e0d080'],
 ['icefish','冰鱼','lake',[3],[6,19],'any',40,'dart',90,'#c0e8f0'],
 ['goldscale','金鳞王','lake',[2],[6,19],'rain',95,'dart',1500,'#ffcc33'],
 ['cavefish','盲穴鱼','mine',[0,1,2,3],[6,26],'any',50,'mixed',120,'#d0c0e0'],
];
const FISH={};
FISH_LIST.forEach(([id,n,w,s,t,we,d,b,p,c])=>{FISH[id]={id,n,water:w,seasons:s,time:t,weather:we,diff:d,beh:b};item(id,n,p,'fish','fish',c,'#333',{edible:Math.round(p/3)});});
item('trash','破旧草鞋',0,'trash','box','#8a7a5a');
item('seaweed','海草',15,'forage','leaf','#2e7d32','#1b5e20',{edible:5});
// ---------- 动物产品 ----------
item('egg','鸡蛋',50,'animal','egg','#fff6e0','#e0d0b0',{edible:20});
item('bigegg','大鸡蛋',95,'animal','egg','#ffe8c0','#d0b080',{edible:30});
item('milk','牛奶',125,'animal','milk','#ffffff','#5a8ad0',{edible:30});
item('wool','羊毛',340,'animal','wool','#f4f0e8','#c8c0b0');
item('hay','干草',25,'res','fiber','#e0c060','#a08030');
// ---------- 料理 ----------
const RECIPES_COOK=[
 ['friedegg','煎蛋',{egg:1},80,50,'#fff6e0'],
 ['stirgreens','清炒小白菜',{bokchoy:2},120,70,'#7cb342'],
 ['potatocake','土豆饼',{potato:2,egg:1},220,100,'#d8b070'],
 ['tomatosoup','番茄蛋汤',{tomato:2,egg:1},200,110,'#e0602a'],
 ['grilledfish','烤鱼',{'@fish':1},150,90,'#c08050'],
 ['pumpkinporr','南瓜粥',{pumpkin:1,milk:1},450,180,'#ef9a3e'],
 ['mushsoup','蘑菇汤',{mushroom:2},200,120,'#a07050'],
 ['cornbread','玉米饼',{corn:2,egg:1},180,100,'#f0d050'],
 ['berrytart','莓果挞',{strawberry:1,'@berry':1,egg:1},360,150,'#e05a7a'],
 ['seafood','海鲜什锦',{'@fish':2,seaweed:1},400,200,'#5aa0c0'],
];
RECIPES_COOK.forEach(([id,n,ing,p,e,c])=>item(id,n,p,'food','food',c,'#fff',{edible:e,ing}));
// ---------- 可制作 ----------
item('chest','储物箱',50,'place','box','#b07a3a','#6b4423');
item('sprinkler','洒水器',100,'place','sprinkler','#c0c0c8','#5a9ad0');
item('qsprinkler','高级洒水器',250,'place','sprinkler','#ffd700','#5a9ad0');
item('furnace','熔炉',100,'place','furnace','#8a5a3a','#f08030');
item('fertilizer','基础肥料',2,'fert','drop','#8a6a4a','#5a3a1a');
item('qfert','优质肥料',10,'fert','drop','#a07a3a','#ffd700');
item('speedgro','催生剂',20,'fert','drop','#40c0a0','#1a7a6a');
item('bait','鱼饵',1,'misc','drop','#a05a4a','#6a3a2a');
item('stairs','矿井楼梯',0,'misc','box','#7a6a5a','#4a3a2a');
item('snack','能量饭团',30,'food','food','#f0f0e0','#2e4a2e',{edible:45});
item('path','石板路',1,'place','stone','#b0a890','#807860');
const CRAFT=[
 ['chest',{wood:50},1],['sprinkler',{copper_bar:1,iron_bar:1},1],['qsprinkler',{iron_bar:1,gold_bar:1,'@gem':1},1],
 ['furnace',{copper_ore:20,stone:25},1],['fertilizer',{fiber:10},5],['qfert',{fiber:10,'@fish':1},2],['speedgro',{sap:5,fiber:5},5],
 ['bait',{fiber:5},10],['stairs',{stone:99},1],['snack',{fiber:10,'@forage':1},1],['path',{stone:1},1],
];
// ---------- 工具 ----------
const TOOLS={hoe:'锄头',can:'洒水壶',axe:'斧头',pick:'镐子',rod:'钓竿',sword:'剑'};
const TIER_N=['基础','铜','铁','金'];
const UPGRADE_COST=[null,{money:2000,copper_bar:5},{money:5000,iron_bar:5},{money:10000,gold_bar:5}];
const ROD_SHOP=[[1,'玻璃纤维竿',1800],[2,'碳素竿',6000],[3,'金线竿',15000]];
const SWORDS=[[0,'木剑',3],[1,'铁刃',8],[2,'青锋剑',14],[3,'金纹剑',22]];
// ---------- 商店 ----------
const SHOP_HOURS={general:[9,20],smith:[9,16],carpenter:[9,17],fish:[9,17],museum:[8,18]};
// ---------- 建筑 / 动物 ----------
const BUILDINGS={coop:{n:'鸡舍',cost:{money:4000,wood:300,stone:100},cap:4,animals:['chicken']},barn:{n:'畜棚',cost:{money:6000,wood:350,stone:150},cap:4,animals:['cow','sheep']}};
const ANIMALS={chicken:{n:'鸡',price:800,prod:'egg',big:'bigegg',every:1,b:'coop',c:'#fff'},cow:{n:'奶牛',price:1500,prod:'milk',every:1,b:'barn',c:'#f5f0e8'},sheep:{n:'绵羊',price:4000,prod:'wool',every:3,b:'barn',c:'#eae6dc'}};
const HOUSE_UP=[null,{money:10000,wood:450,n:'厨房扩建（解锁烹饪，背包+12格）'},{money:50000,hardwood:150,n:'二楼加盖（最大体力+30）'}];
// ---------- 村民（原创） ----------
// pos: 工作日日程 [起始时,x,y]；loves/likes/hates
const NPCS=[
 {id:'linxia',n:'林夏',role:'杂货店老板',skin:'#f2c9a0',hair:'#3a2a1a',shirt:'#e07a5a',pants:'#4a4a6a',bd:[0,9],
  home:[8,6],sched:[[8,13,10],[12,24,15],[17,13,10],[20,8,7]],loves:['strawberry','tulip','berrytart'],likes:['@flower','egg','raspberry'],hates:['trash','coal'],
  lines:['今天店里新到了一批种子，记得来看看！','春天种草莓最划算，你试过吗？','我小时候也梦想有块自己的田。','溪谷的雨总是来得刚刚好。'],
  hi:['你送的东西我都收在柜台后面呢。','有你在，溪谷热闹多了。','下次关店后一起去河边散步吧？']},
 {id:'tieshan',n:'铁山',role:'铁匠',skin:'#c99a70',hair:'#1a1a1a',shirt:'#5a5a5a',pants:'#3a2a1a',bd:[1,3],
  home:[30,6],sched:[[8,31,10],[13,26,17],[16,31,10],[19,30,7]],loves:['gold_bar','ruby','diamond'],likes:['@bar','@ore','coal'],hates:['tulip','@flower'],
  lines:['工具要常磨，不然干活费劲。','矿井越往下，矿石越好。','铜、铁、金——一步一步来。','炉子的火今天特别旺。'],
  hi:['你挖来的矿，成色不错。','我给你的镐子多加了一道淬火。','嘿，常来坐坐。']},
 {id:'baimu',n:'柏木',role:'木匠',skin:'#e8b890',hair:'#8a5a2a',shirt:'#6a8a3a',pants:'#5a4a3a',bd:[2,21],
  home:[40,14],sched:[[8,40,17],[12,34,20],[15,40,17],[19,40,14]],loves:['hardwood','pumpkin','potatocake'],likes:['wood','@crop'],hates:['trash','seaweed'],
  lines:['想盖鸡舍？木材和石头备足了再来。','好木头闻起来有阳光的味道。','房子扩建后，你就能在家做饭了。','钉子要直，人要正。'],
  hi:['我在给你做一张小板凳，别说出去。','你的农场越来越像样了。','一起喝杯茶吗？']},
 {id:'haibo',n:'海伯',role:'渔夫',skin:'#b07a50',hair:'#d0d0d0',shirt:'#3a6a9a',pants:'#2a3a4a',bd:[1,19],
  home:[38,27],sched:[[7,36,30],[12,38,31],[18,36,29],[21,38,27]],loves:['croaker','octopus','seafood'],likes:['@fish','seaweed'],hates:['@flower','trash'],
  lines:['下雨天，鱼儿更爱咬钩。','别急着收线，看准了再动手。','海里的鱼，脾气都大。','据说湖里住着一条金鳞王。'],
  hi:['我那根老竿子，以后传给你。','你的手越来越稳了。','明早一起出海？']},
 {id:'xiaoman',n:'小满',role:'学生',skin:'#f8d8b8',hair:'#e0a040',shirt:'#f0c0e0',pants:'#5a7ab0',bd:[0,22],
  home:[18,6],sched:[[8,20,14],[12,24,16],[15,16,20],[19,18,7]],loves:['berrytart','raspberry','amethyst'],likes:['@forage','friedegg','@gem'],hates:['coal','trash','@ore'],
  lines:['今天的作业好难呀……','你知道河边能捡到好看的石头吗？','我长大想当画家！','咦，你身上有泥土的味道。'],
  hi:['给你看我新画的画！','你是我最好的朋友之一！','这个秘密只告诉你哦。']},
 {id:'guyuan',n:'顾远',role:'博物馆馆长',skin:'#f0d0b0',hair:'#5a4a3a',shirt:'#4a5a7a',pants:'#2a2a3a',bd:[2,7],
  home:[10,20],sched:[[8,9,23],[13,12,16],[17,9,23],[19,10,21]],loves:['diamond','fossil','stoneidol'],likes:['@artifact','@gem'],hates:['@crop','trash'],
  lines:['每一块化石都是时间写的信。','博物馆欢迎你的捐赠。','矿井深处藏着不少古物。','安静的午后最适合看书。'],
  hi:['你捐的展品，参观的人都夸。','我们一起整理新的展柜吧。','你对历史也有兴趣，真好。']},
 {id:'suqing',n:'苏晴',role:'画家',skin:'#f6d0c0',hair:'#202040',shirt:'#9a5ac0',pants:'#3a3a3a',bd:[3,12],
  home:[26,24],sched:[[9,22,28],[13,30,30],[17,22,28],[20,26,25]],loves:['sunflower','jade','lilyflower'],likes:['@flower','@gem','coral'],hates:['@ore','trash'],
  lines:['海边的光线最好看。','颜色和心情是相通的。','你今天看起来很有精神。','我想画一幅秋天的田野。'],
  hi:['这幅画里有你的农场哦。','你送的花，我画了三张。','和你聊天总有灵感。']},
 {id:'shitou',n:'石头',role:'冒险者',skin:'#d8a878',hair:'#a03a2a',shirt:'#8a3a2a',pants:'#3a3a2a',bd:[3,25],
  home:[22,2],sched:[[8,22,3],[12,26,17],[16,20,3],[20,22,2]],loves:['grilledfish','topaz','cornbread'],likes:['@food','@gem','coal'],hates:['@flower','tulip'],
  lines:['矿井里的史莱姆别小看。','每五层有电梯，记好了。','带够吃的再下井。','今天也要打怪！'],
  hi:['下次我们组队下矿吧！','你挥剑的样子越来越帅了。','这块石头送你，护身用。']},
 {id:'wangnai',n:'王奶奶',role:'老园丁',skin:'#e8c8a8',hair:'#e8e8e8',shirt:'#7a9a7a',pants:'#5a4a4a',bd:[1,8],
  home:[6,14],sched:[[7,6,17],[11,14,18],[15,6,17],[18,6,15]],loves:['pumpkinporr','yam','tulip'],likes:['@crop','@forage','milk'],hates:['coal','@ore'],
  lines:['种地呀，急不得。','浇水要浇透，庄稼才长得好。','年轻人，记得吃饭。','我年轻时也在那块地上种过瓜。'],
  hi:['你的菜比我当年种的还好。','来，奶奶给你留了点心。','有空常来看看我。']},
 {id:'zhoubo',n:'周伯',role:'镇长',skin:'#f0c8a0',hair:'#8a8a8a',shirt:'#2a4a7a',pants:'#2a2a2a',bd:[2,1],
  home:[16,24],sched:[[8,24,14],[12,16,26],[15,24,14],[19,16,25]],loves:['tomatosoup','watermelon','gold_bar'],likes:['@crop','@food'],hates:['trash','seaweed'],
  lines:['溪谷的节日，你可别错过。','农场交给你，我很放心。','镇上的大家都很友善。','广场上的公告栏记得常看。'],
  hi:['你是溪谷的骄傲。','明年的节日请你来致辞！','老了老了，还交了个好朋友。']},
];
const FESTIVALS={0:{day:13,id:'egg',n:'春日寻蛋会',desc:'在小镇各处找出藏起来的彩蛋！60秒内找到9个就能获奖。'},
 1:{day:11,id:'soup',n:'夏夜汤锅节',desc:'往大汤锅里加一样食材，大家会品评味道。'},
 2:{day:16,id:'fair',n:'秋收展览会',desc:'挑选最多6件物品参展，种类越多、价值越高，分数越高。'},
 3:{day:8,id:'icefish',n:'冰湖钓鱼赛',desc:'120秒内在冰湖钓到5条鱼就能夺冠！'}};
const WEATHER_N={sun:'晴',rain:'雨',storm:'雷雨',snow:'雪'};
const MUSEUM_REWARDS={3:{money:500},6:{item:'qsprinkler',n:2},10:{money:3000},14:{item:'speedgro',n:20}};
