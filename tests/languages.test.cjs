const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const i18n=fs.readFileSync(path.join(root,'public/i18n.js'),'utf8');
const game=fs.readFileSync(path.join(root,'public/game.js'),'utf8');
const dictionary=JSON.parse(i18n.match(/const dictionary=(.*);/)[1]);
function boot(savedLanguage, savedGame, blocked=false){
 class Element{
  constructor(){this.children=[];this.value='';this.type='';this.attrs={};this.classList={toggle(){}};}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){this.attrs[name]=value;}
  addEventListener(name,fn){this['on'+name]=fn;}
  getAttribute(name){return this.attrs[name]??null;}
  getContext(){return new Proxy({},{get:()=>()=>{}});}
  showModal(){}
  close(){}
 }
 const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element);return elements.get(id);};
 const nodes=['Adventure','Settings','Language'].map(nodeValue=>({nodeValue,parentElement:{closest:()=>null}}));
 let cursor=-1;
 const handlers={},storage=new Map;
 if(savedLanguage!==undefined)storage.set('eyo-language-v1',savedLanguage);
 if(savedGame)storage.set('eyo-spirit-v1',JSON.stringify(savedGame));
 const document={body:new Element,documentElement:{},activeElement:{tagName:'BODY'},getElementById:get,createElement:()=>new Element,
  createTreeWalker:()=>({nextNode(){return ++cursor<nodes.length;},get currentNode(){return nodes[cursor];}}),
  querySelectorAll:()=>[],addEventListener:(name,fn)=>(handlers[name]??=[]).push(fn),
  dispatchEvent:event=>(handlers[event.type]??[]).forEach(fn=>fn())};
 const context=vm.createContext({window:{},document,NodeFilter:{SHOW_TEXT:4},Event:class{constructor(type){this.type=type;}},
  localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return storage.get(key)??null;},setItem:(key,value)=>{if(blocked)throw Error('blocked');storage.set(key,value);}},
  performance:{now:()=>0},requestAnimationFrame(){},confirm:()=>true});
 vm.runInContext(i18n,context);vm.runInContext(game,context);
 return {api:context.window.EyoI18n,context,document,get,nodes,storage};
}
test('new and existing players without a language choice start in Nigerian Pidgin',()=>{
 for(const saved of [undefined,{done:[0,1],name:'Ada'}]){
  const b=boot(undefined,saved);
  assert.equal(b.api.language,'pcm');assert.equal(b.document.documentElement.lang,'pcm');
  assert.equal(b.nodes[0].nodeValue,'Play game');assert.equal(b.get('language').children.length,4);
  if(saved)assert.equal(b.get('stars').textContent,40);
 }
});
test('all languages update static UI and game dialogue without changing progress or location',()=>{
 const b=boot();vm.runInContext('complete(0);visit(1)',b.context);
 for(const code of ['fr','yo','en','pcm']){
  assert.equal(b.api.setLanguage(code),true);
  assert.equal(b.document.documentElement.lang,code);
  assert.equal(b.get('language').value,code);
  assert.equal(b.get('district').textContent,b.api.t('Island Market').toUpperCase());
  assert.equal(b.get('stars').textContent,20);
  assert.equal(b.storage.get('eyo-language-v1'),code);
 }
 assert.equal(b.api.setLanguage('unsupported'),false);
 assert.equal(b.api.language,'pcm');
});
test('saved language is restored and unsupported values fall back to Pidgin',()=>{
 assert.equal(boot('fr').api.language,'fr');
 assert.equal(boot('en').api.language,'en');
 assert.equal(boot('not-a-language').api.language,'pcm');
 assert.equal(boot(undefined,undefined,true).api.language,'pcm');
});
test('language changes cancel a rehearsal without awarding or losing progress',()=>{
 const b=boot();vm.runInContext('visit(3);startRhythm()',b.context);
 b.api.setLanguage('yo');assert.equal(vm.runInContext('rhythm',b.context),null);
 assert.equal(b.get('stars').textContent,0);
 assert.equal(b.get('challenge').children[0].textContent,b.api.t('Start rehearsal'));
});
test('all translated rows preserve interpolation fields and all quest text has translations',()=>{
 const b=boot();
 for(const [key,values] of Object.entries(dictionary)){
  assert.equal(values.length,3);
  const fields=text=>[...text.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
  for(const value of values){assert.ok(value.length);assert.deepEqual(fields(value),fields(key));}
 }
 const quests=vm.runInContext('JSON.stringify(basePlaces)',b.context);
 const names=new Set(['Baba Tunde','Aunty Sade','Dara','Tomi','Kemi','']);
 for(const row of JSON.parse(quests))for(const text of row)assert.ok(names.has(text)||dictionary[text],text);
 b.api.setLanguage('fr');
 assert.equal(b.api.t('Welcome, {name}. Your settings are saved.',{name:'Ada'}),'Bienvenue, Ada. Vos réglages sont enregistrés.');
 assert.equal(b.api.t('Unknown English fallback'),'Unknown English fallback');
});
