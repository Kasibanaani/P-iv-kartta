const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(new URL('../index.html', 'file://' + __filename), 'utf8');
const engine = html.match(/<script id="engine">([\s\S]+?)<\/script>/)[1];
const game = vm.createContext({assert, console});
vm.runInContext(engine + `
const movement = newGame(0,'normal',3,false);
const p = movement.player;
const idle = {x:0,y:0,aim:null};
p.x=114; p.y=175; p.energy=100;
movePlayer(movement,{x:.35,y:0,aim:null},1/60);
const slow=p.speed;
movePlayer(movement,{x:.59,y:0,aim:null},1/60);
assert(p.speed>slow && p.energy===100);
movePlayer(movement,{x:1,y:0,aim:null},1/60);
assert(p.speed>160 && p.energy<100);
p.energy=.001;
movePlayer(movement,{x:1,y:0,aim:null},1/60);
assert.equal(p.exhausted,true);
movePlayer(movement,{x:1,y:0,aim:null},1/60);
assert(p.speed>0 && p.speed<=32 && p.energy>0);
for (let i=0;i<180;i++) movePlayer(movement,idle,1/60);
assert(!p.exhausted && p.energy>=18);

const indoor = newGame(0,'normal',11,false);
const southern = indoor.doors.find(d=>d.cx===787&&d.cy===835);
assert(southern.open);
assert(!solid(indoor,787,835,PLAYER_R));
indoor.player.x=787; indoor.player.y=856;
assert.equal(interact(indoor),'door');
assert(!southern.open && solid(indoor,787,835,PLAYER_R));
const hiding = zombie(indoor,787,807);
hiding.angle=Math.PI/2;
indoor.events=[];
watch(indoor,hiding);
assert.equal(hiding.state,'roam');
indoor.zombies.push(hiding);
assert(fire(indoor,-Math.PI/2));
assert.equal(indoor.stats.hits,0);
watch(indoor,hiding);
assert.equal(hiding.state,'listen');
assert.equal(interact(indoor),'door');
watch(indoor,hiding);
assert.equal(hiding.state,'chase');
indoor.time+=.3;
assert(fire(indoor,-Math.PI/2));
assert.equal(indoor.stats.hits,1);

const siege = newGame(0,'normal',9,false);
for (const d of siege.doors) d.open=false;
siege.player.x=1164; siege.player.y=1094;
const attacker=zombie(siege,1020,1112);
attacker.angle=0;
siege.zombies.push(attacker);
const shelterDoor=siege.doors.find(d=>d.cx===1066&&d.cy===1112);
for (let i=0;i<15*60;i++) {
  if (i%120===0) noise(siege,siege.player.x,siege.player.y,650,'shot');
  tick(siege,idle,1/60);
  if (shelterDoor.open) break;
}
assert(shelterDoor.open,'unreachable sound leads to a door that can be broken');

const hunt=newGame(0,'normal',16,false);
hunt.player.x=615;hunt.player.y=945;
const walker=zombie(hunt,703,945);walker.angle=0;
hunt.zombies.push(walker);
watch(hunt,walker);
assert.equal(walker.state,'roam');
for (let i=0;i<60;i++) tick(hunt,{x:0,y:1,aim:null},1/60);
assert.notEqual(walker.state,'roam');
assert(hunt.player.speed>walker.base+15);
wave(hunt);
assert(hunt.waveCount===1&&hunt.zombies.length>1);

const campaign=newGame(0,'normal',21,false);
const traversable=newGame(0,'normal',21,false);
traversable.doors.forEach(d=>d.open=true);
for (let i=0;i<3;i++) {
  const start=CHECKPOINTS[i], item=MISSIONS[i].item, end=CHECKPOINTS[i+1];
  for (const p of [start,item,end]) assert(!solid(traversable,p.x,p.y,PLAYER_R));
  const field=flowFor(traversable,item);
  assert(field[nearestCell(traversable,start)]>=0,'item reachable for mission '+(i+1));
  assert(field[nearestCell(traversable,end)]>=0,'checkpoint reachable for mission '+(i+1));
  assert.equal(targetFor(campaign),item);
  Object.assign(campaign.player,item);
  assert.equal(interact(campaign),'item');
  assert.equal(targetFor(campaign),end);
  Object.assign(campaign.player,end);
  assert.equal(interact(campaign),'checkpoint');
  assert.equal(campaign.phase,i<2?'checkpoint':'won');
  campaign.phase='play';
}
assert.equal(targetFor(campaign),null);
assert(safeAt(3,CHECKPOINTS[3]));
for (const level of Object.keys(LEVELS)) {
  const loaded=newGame(1,level,9);
  assert(loaded.zombies.length>=LEVELS[level].initial-1);
  assert(loaded.zombies.every(z=>!solid(loaded,z.x,z.y,8)));
}
console.log('Liike, väsymys, tähtäys, seinät, ovet, aistit, laumat ja kolme tehtävää: OK');
`, game);
