const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const APP = path.join(__dirname, '..', 'index.html');
const FIX = path.join(__dirname, 'fixtures');
const OUT = process.env.OUT_DIR || os.tmpdir();

(async () => {
  const xlsx = fs.readFileSync(path.join(FIX,'xlsx-stub.js'),'utf8');
  const html = fs.readFileSync(APP,'utf8').replace(/<script src="https:[^"]+xlsx[^"]+"><\/script>/,'<script>'+xlsx+'</script>');
  const now = new Date().toISOString();
  const data = {
    agents:[{id:'a1',name:'Kiran Kumar',role:'Agent',phone:'9000000099'}],
    sellers:[{id:'s1',name:'Ramesh G',phone:'9000000011',village:'Shadnagar'}],
    properties:[{id:'p1',kind:'Plot',sellerId:'s1',plotNo:'5',location:'Shadnagar',length:30,breadth:60,areaUnit:'sq.yd',facing:'East',price:3800000,status:'Available',media:[]}],
    leads:[{id:'l1',name:'Test Lead',phone:'9000000001',interest:'Plot',budget:4000000,location:'Shadnagar',sizeWanted:'200 sq yd',facingPref:'East',timeline:'Within 1 month',stage:'Site Visit',assignedTo:'a1',nextFollowUp:'2026-10-31',createdAt:'2026-10-25T10:00:00Z',activities:[{t:now,type:'Call',text:'Wants east facing'},{t:now,type:'Site visit',text:'Visited plot 5'}]},
           {id:'l2',name:'Deal Guy',phone:'9000000002',interest:'Plot',budget:3000000,stage:'Token Paid',dealValue:3000000,commissionPct:2,propertyId:'p1',assignedTo:'a1',closedAt:now,createdAt:now,activities:[]}],
    ventures:[], templates:[], documents:[{id:'d1',title:'Sale deed',docType:'Sale deed',linkType:'property',linkId:'p1',assetId:'b'.repeat(32),fileName:'deed.pdf',contentType:'application/pdf',createdAt:now,expiry:'2026-11-10'}],
    settings:[{id:'main',brokerName:'Siva',reraNo:'A123',reraExpiry:'2026-12-01'}]
  };
  const mock = `<script>window.__saved=[];const D=${JSON.stringify(data)};
  const samp=async(input,o)=>{ const t="Namaste Test Lead ji, shall we meet?"; o&&o.onText&&o.onText({text:t,delta:t}); return {text:t}; };
  samp.json=async(input)=>{ if(/Extract a buyer lead/.test(input)) return {name:"Ravi Kumar",phone:"9848012345",source:"99acres",interest:"Plot",budgetLakhs:40,location:"Shadnagar",sizeWanted:"200 sq.yd",facingPref:"East",timeline:"Within 1 month",loan:false,notes:"Wants 200 sq yd plot"}; if(/Summarize/.test(input)) return {summary:["Wants east facing","Visited plot 5"],nextStep:"Call about price",followUpDate:"2026-11-03"}; return {band:"Hot",score:78,reason:"Visited recently",nextAction:"Call today"}; };
  window.claude={use:async n=>{ if(n==='db'){return {collection:c=>({onSnapshot(cb){setTimeout(()=>cb({docs:(D[c]||[]).map(d=>({id:d.id,data:()=>d})),metadata:{fromCache:false}}),10);return()=>{}},doc:id=>({set:async(b)=>{window.__saved.push([c,id,b])},delete:async()=>{}})})}}
   if(n==='assets') return {upload:async()=>({id:'a'.repeat(32)}),delete:async()=>({deleted:true})};
   if(n==='sample') return samp;
   if(n==='mcp') return {callTool:async(s,t,i)=>({payload:{range:"A1:Z5000",majorDimension:"ROWS",values:[["Timestamp","Full name","Mobile number","Budget","Area","Message"],["10/30/2026 10:00:00","Anil","9876500001","45 lakhs","Shadnagar","need east plot"],["10/30/2026 11:00:00","Test Lead","9000000001","40","x","dup"]]}})};
   if(n==='downloads') return {save:async()=>({status:'saved'})};
   return null;}};</script>`;
  const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await pg.setContent('<!doctype html><html><head><meta charset=utf8></head><body>'+mock+html+'</body></html>');
  await pg.waitForTimeout(500);
  const step = async (name, fn) => { try { await fn(); console.log('✓', name); } catch(e){ console.log('✗', name, e.message.split('\n')[0]); } };
  await step('today hot', async()=>{ const t=await pg.textContent('#app'); if(!/Hot leads/.test(t)) throw Error('no hot'); console.log('   hot section:', (await pg.textContent('.panel:has(h3:text("Hot leads"))')).slice(0,120)); });
  await pg.screenshot({path:path.join(OUT,'s-today.png')});
  await step('lead drawer + ai score', async()=>{ await pg.evaluate(()=>location.hash='#leads'); await pg.waitForTimeout(150); await pg.click('.card[data-lead="l1"]'); await pg.waitForTimeout(150); await pg.click('[data-act="aiScore"]'); await pg.waitForTimeout(200); console.log('   chip:', await pg.textContent('.scorebox')); });
  await step('ai draft', async()=>{ await pg.click('[data-act="aiDraft"]'); await pg.waitForTimeout(200); console.log('   draft:', await pg.inputValue('#dAiText')); });
  await step('ai summary', async()=>{ await pg.fill('#dActText','called, asked 5% discount'); await pg.click('[data-act="aiSummary"]'); await pg.waitForTimeout(200); await pg.click('[data-act="aiSaveSummary"]'); await pg.waitForTimeout(100); });
  await step('template + checklist area', async()=>{ await pg.selectOption('#dTpl','b2'); await pg.waitForTimeout(100); console.log('   tpl:', await pg.textContent('.tplprev')); });
  await pg.screenshot({path:path.join(OUT,'s-drawer.png')});
  await step('close + paste enquiry', async()=>{ await pg.keyboard.press('Escape'); await pg.click('[data-act="pasteEnq"]'); await pg.fill('#pasteText','New enquiry 99acres Ravi Kumar 9848012345 200 sq yd east facing plot Shadnagar budget 40 lakhs'); await pg.click('#pasteAI'); await pg.waitForTimeout(300); console.log('   form name/phone/budget:', await pg.inputValue('#f_name'), await pg.inputValue('#f_phone'), await pg.inputValue('#f_budget'), await pg.inputValue('#f_timeline')); await pg.click('#formSave'); await pg.waitForTimeout(100); });
  await step('team', async()=>{ await pg.evaluate(()=>location.hash='#team'); await pg.waitForTimeout(150); console.log('   ', (await pg.textContent('table tbody tr')).replace(/\s+/g,' ')); });
  await pg.screenshot({path:path.join(OUT,'s-team.png')});
  await step('documents', async()=>{ await pg.evaluate(()=>location.hash='#documents'); await pg.waitForTimeout(150); await pg.click('[data-viewdoc="d1"]'); await pg.waitForTimeout(100); if(!await pg.$('.lightbox iframe')) throw Error('no pdf viewer'); await pg.click('.lbbtn.close'); await pg.click('#addBtn'); await pg.waitForTimeout(100); await pg.selectOption('#d_linkType','lead'); await pg.click('[data-close]'); });
  await pg.screenshot({path:path.join(OUT,'s-docs.png')});
  await step('settings + sheet import', async()=>{ await pg.evaluate(()=>location.hash='#settings'); await pg.waitForTimeout(150); await pg.fill('#st_sheetUrl','https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/edit'); await pg.click('[data-act="sheetImport"]'); await pg.waitForTimeout(300); console.log('   import btn:', await pg.textContent('#impGo')); await pg.click('#impGo'); await pg.waitForTimeout(300); });
  await step('export', async()=>{ await pg.click('#exportBtn'); await pg.waitForTimeout(300); });
  console.log('saved collections:', JSON.stringify(await pg.evaluate(()=>window.__saved.map(x=>x[0]))));
  console.log('errors:', errs);
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
