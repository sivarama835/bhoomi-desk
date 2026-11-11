const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const APP = path.join(__dirname, '..', 'index.html');
const FIX = path.join(__dirname, 'fixtures');
const OUT = process.env.OUT_DIR || os.tmpdir();

(async () => {
  const html = fs.readFileSync(APP,'utf8').replace(/<script src="https:[^"]+xlsx[^"]+"><\/script>/,'');
  const data = {
    sellers:[{id:'s1',name:'Ramesh G',phone:'9000000011',village:'Shadnagar',sellerType:'Owner',address:'H.No 1-2, Shadnagar'}],
    properties:[{id:'p1',kind:'Plot',sellerId:'s1',plotNo:'5',location:'Shadnagar',mapLink:'https://www.google.com/maps/place/x/@17.0721,78.2054,17z',length:30,breadth:60,sideN:30,sideS:30,sideE:60,sideW:60,areaUnit:'sq.yd',facing:'East',price:3000000,status:'Available',media:[]}],
    leads:[{id:'l1',name:'Test Lead',phone:'9000000001',interest:'Plot',budget:3200000,location:'Shadnagar',stage:'Contacted',nextFollowUp:'2026-10-31',activities:[]}],
    ventures:[]
  };
  const mock = `<script>window.claude={use:async n=>{ if(n==='db'){const D=${JSON.stringify(data)};return {collection:c=>({onSnapshot(cb){setTimeout(()=>cb({docs:(D[c]||[]).map(d=>({id:d.id,data:()=>d})),metadata:{fromCache:false}}),10);return()=>{}},doc:id=>({set:async()=>{},delete:async()=>{}})})}} if(n==='assets') return {upload:async()=>({id:'a'.repeat(32)}),delete:async()=>({deleted:true})}; return null;}};</script>`;
  const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.setContent('<!doctype html><html><head><meta charset=utf8></head><body>'+mock+html+'</body></html>');
  await pg.waitForTimeout(400);
  await pg.evaluate(()=>location.hash='#sellers'); await pg.waitForTimeout(200);
  await pg.click('[data-openseller="s1"]'); await pg.waitForTimeout(200);
  await pg.click('[data-openprop="p1"]'); await pg.waitForTimeout(200);
  await pg.screenshot({path:path.join(OUT,'shot-prop.png')});
  await pg.click('[data-act="editProp"]'); await pg.waitForTimeout(200);
  await pg.selectOption('#f_sellerId','__new');
  await pg.screenshot({path:path.join(OUT,'shot-form.png'), fullPage:false});
  console.log('calc:', await pg.textContent('#dimCalc'), '| hint:', await pg.textContent('#mapHint'), '| newSeller hidden:', await pg.$eval('#newSeller',e=>e.hidden));
  console.log('errors:', errs);
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
