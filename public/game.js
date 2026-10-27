'use strict';
const $=id=>document.getElementById(id), KEY='eyo-spirit-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
let state={done:[],name:'Volunteer',colour:'#e3a854',difficulty:'easy',sound:false,motion:false,...saved};
state.done=Array.isArray(state.done)?[...new Set(state.done.filter(x=>Number.isInteger(x)&&x>=0&&x<6))]:[];
let current=0, session=0, rhythm=null, audio;
const places=[
['Festival Square','Baba Tunde','Welcome! I’m your fictional guide. Help our visitors prepare respectfully. What is the best first step?','Learn the local guidance','Assume every celebration has identical rules','Festival etiquette','Festival areas may have specific restrictions. Follow current guidance from organizers and cultural custodians.'],
['Island Market','Aunty Sade','The welcome desk needs supplies. Put the delivery steps in order.','Collect → check → deliver','Deliver → collect → check','Community preparation','This supply mission is fictional. Cooperation connects the adventure’s neighbourhoods.'],
['Artisan Courtyard','Dara','Our public space needs decorations. Choose a palette for your volunteer team.','Sunset gold','Lagoon green','The white garments','The project brief describes Eyo’s flowing white garments and broad-brimmed hats. Group details need cultural review.'],
['Rehearsal Corner','Tomi','Rehearse a simple invented rhythm. This synthesized exercise is not a traditional or sacred Eyo composition.','Start rehearsal','','Music and memory','This prototype uses synthesized tones. Recorded music and performer credits are planned.'],
['Waterfront Welcome','Kemi','A visitor asks whether Eyo happens on the same date every year. Which answer matches the project brief?','It follows traditional authorization','It has a fixed annual date','Remembering Lagos','The brief associates Eyo with important commemorations and traditional authorization, rather than a fixed annual date.'],
['Procession Route','Your community','Once all five neighbourhood tasks are ready, coordinate a fictional volunteer welcome along the route.','Begin the finale','','The opambata','The project brief calls the ceremonial staff an opambata. It is presented as a cultural object, never a weapon challenge.']
];
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{$('feedback').textContent='Browser storage is unavailable. Progress will last for this session.'}}
function count(){return state.done.length}
function render(){
 $('stars').textContent=count()*20;$('unity').textContent=Math.round(count()/6*100);$('meter').value=count()/6*100;
 $('places').replaceChildren(...places.map((p,i)=>{let b=document.createElement('button');b.textContent=(state.done.includes(i)?'✓ ':'')+p[0];b.setAttribute('aria-pressed',i===current);b.onclick=()=>visit(i);return b}));
 $('cards').replaceChildren(...places.map((p,i)=>{let card=document.createElement('article');let unlocked=state.done.includes(i);card.className='card'+(unlocked?'':' locked');let title=document.createElement('h3');title.textContent=unlocked?p[5]:'◇ Story still to discover';let desc=document.createElement('p');desc.textContent=unlocked?p[6]:'Help at '+p[0]+' to unlock this journal entry.';card.append(title,desc);return card}));draw();
}
function button(label,fn){let b=document.createElement('button');b.textContent=label;b.onclick=fn;$('challenge').append(b);return b}
function complete(i){if(!state.done.includes(i)){state.done.push(i);persist()}$('feedback').textContent=i===5?'Celebration ready! You earned the Community Spirit award.':'Task complete! +20 Heritage Stars. Your community grows stronger.';render();$('challenge').replaceChildren();button('Explore another neighbourhood',()=>visit((i+1)%6))}
function visit(i){session++;rhythm=null;current=i;let p=places[i];$('district').textContent=p[0].toUpperCase();$('location').textContent=p[1];$('story').textContent=p[2];$('feedback').textContent='';$('challenge').replaceChildren();render();
 if(state.done.includes(i)){button('Completed · revisit story',()=>{$('feedback').textContent=p[6]});return}
 if(i===5){if(state.done.filter(n=>n<5).length<5){$('feedback').textContent='Complete all five neighbourhood tasks first.';return}let step=0;button('Welcome visitors',function next(){step++;if(step===3){complete(5);return}this.textContent=step===1?'Check the volunteer meeting points':'Celebrate together';$('feedback').textContent=step===1?'Visitors welcomed. Coordinate your volunteer team.':'The route is ready. Bring your community together.'});return}
 if(i===3){button(p[3],startRhythm);return}
 [3,4].forEach(n=>button(p[n],()=>{if(n===3||i===2){if(i===2)state.colour=n===3?'#e3a854':'#5f9982';complete(i)}else $('feedback').textContent='Try again. Listen to your guide and consider the local context.'}));
}
function tone(){if(!state.sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(140,audio.currentTime);o.frequency.exponentialRampToValueAtTime(50,audio.currentTime+.13);g.gain.setValueAtTime(.2,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.17)}catch{}}
function startRhythm(){let token=++session;$('challenge').replaceChildren();let cue=document.createElement('div');cue.className='beat';cue.textContent='Get ready…';cue.setAttribute('role','status');$('challenge').append(cue);
 let tap=button('Tap / press Space',hit);tap.disabled=true;let start=performance.now()+2000,interval=state.difficulty==='easy'?1000:700;rhythm={start,interval,hits:0,index:0,token};let targets=4;
 function tick(){if(token!==session)return;let now=performance.now();let index=Math.floor((now-start)/interval);if(index>=targets){let hits=rhythm.hits;rhythm=null;tap.disabled=true;if(hits>=3)complete(3);else{$('feedback').textContent='You matched '+hits+' of 4 beats. Try for three matches.';button('Try again',startRhythm)}return}
 tap.disabled=now<start;if(index>=0&&index!==rhythm.index-1){cue.textContent='Beat '+(index+1)+' / 4';tone();rhythm.index=index+1}
 requestAnimationFrame(tick)}requestAnimationFrame(tick);
}
function hit(){if(!rhythm)return;let n=Math.round((performance.now()-rhythm.start)/rhythm.interval);let offset=Math.abs(performance.now()-(rhythm.start+n*rhythm.interval));if(n>=0&&n<4&&offset<(state.difficulty==='easy'?350:220)&&rhythm.last!==n){rhythm.hits++;rhythm.last=n;$('feedback').textContent='Good timing! '+rhythm.hits+' matched.'}else $('feedback').textContent='Follow the numbered beat and try again.'}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&rhythm&&!['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();hit()}});
function draw(){let c=$('map'),x=c.getContext('2d');x.fillStyle='#cfddc2';x.fillRect(0,0,960,600);x.fillStyle='#77aaa3';x.beginPath();x.moveTo(0,450);x.bezierCurveTo(320,390,590,610,960,420);x.lineTo(960,600);x.lineTo(0,600);x.fill();
 x.strokeStyle='#f5e9c9';x.lineWidth=56;x.beginPath();x.moveTo(50,280);x.lineTo(900,280);x.moveTo(470,50);x.lineTo(470,470);x.stroke();
 for(let row=0;row<3;row++)for(let col=0;col<7;col++){let px=50+col*130,py=45+row*143;if(col===3||row===1)continue;x.fillStyle=['#cf9b6e','#e3bf7e','#9cae81'][(row+col)%3];x.fillRect(px,py,85,66);x.fillStyle='#9b7753';x.beginPath();x.moveTo(px-7,py);x.lineTo(px+43,py-22);x.lineTo(px+92,py);x.fill()}
 const points=[[470,280],[210,220],[730,220],[210,370],[690,460],[470,100]];
 points.forEach(([px,py],i)=>{x.fillStyle=i===current?'#a65f2d':'#1b5145';x.beginPath();x.arc(px,py,21,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.font='bold 18px system-ui';x.textAlign='center';x.fillText(state.done.includes(i)?'✓':String(i+1),px,py+6);x.fillStyle='#163f36';x.font='bold 14px system-ui';x.fillText(places[i][0],px,py+42)});
 x.fillStyle=state.colour;x.beginPath();x.arc(points[current][0]+29,points[current][1]-26,9,0,Math.PI*2);x.fill();x.fillStyle='#264e47';x.font='italic 18px Georgia';x.fillText('Lagos Lagoon',150,545);
}
$('settings').onclick=()=>{session++;rhythm=null;['playerName','colour','difficulty','sound','motion'].forEach(id=>{let el=$(id),v=state[id==='playerName'?'name':id];if(el.type==='checkbox')el.checked=v;else el.value=v});$('options').showModal()};
$('close').onclick=()=>{state.name=$('playerName').value.trim()||'Volunteer';state.colour=$('colour').value;state.difficulty=$('difficulty').value;state.sound=$('sound').checked;state.motion=$('motion').checked;document.body.classList.toggle('reduce',state.motion);persist();$('options').close();visit(current);$('feedback').textContent='Welcome, '+state.name+'. Your settings are saved.'};
$('reset').onclick=()=>{if(confirm('Reset your saved adventure progress?')){state.done=[];persist();visit(0)}};
document.body.classList.toggle('reduce',state.motion);visit(0);
