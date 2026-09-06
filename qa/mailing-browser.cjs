const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {create,root}=require('./harness.cjs');
const {chromium}=require('/home/liassetech/courtier-outreach/node_modules/playwright-core');
const out='/home/liassetech/previews/vendvite-mailing-service';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const h=await create();h.services.qrcode=require('/home/liassetech/liasse.tech/node_modules/qrcode');
 const browser=await chromium.launch({executablePath:'/home/liassetech/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
 try{
  const publicHtml=await (await fetch('https://liasse.tech/pwa/vendvite/richard-tremblay?lang=fr')).text();
  const key=publicHtml.match(/maps\.googleapis\.com\/maps\/api\/js\?key=([^&"\s]+)/);if(key)h.services.google={mapsApiKey:key[1]};
  const page=await browser.newPage({viewport:{width:1440,height:1100}});await page.setExtraHTTPHeaders({'x-test-admin':'yes'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(h.url+'/pwa/vendvite/admin/sollicitations');
  await page.fill('#campaignName','Exemple — Courtiers de Laval');
  await page.fill('#mailingAddresses','Marie Tremblay {Agence Exemple, Courtier immobilier résidentiel, 514 555-0100, https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80}\n1234 RUE DES ÉRABLES\nLAVAL QC H7W 4Y4');
  await page.click('#previewAddresses');await page.waitForFunction(()=>document.getElementById('solCount').textContent==='1 agents');
  await page.screenshot({path:path.join(out,'admin-import.png'),fullPage:true});
  await page.click('#saveCampaign');await page.waitForURL(/admin\/sollicitations\/\d+$/);
  const agent=await h.db.get('SELECT * FROM solicitation_agents LIMIT 1');
  await page.goto(h.url+'/pwa/vendvite/admin/sollicitations/1/imprimer');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
  const geometry=await page.locator('.sheet').evaluateAll(sheets=>sheets.map(s=>{const top=s.getBoundingClientRect().top;function rect(sel){const r=s.querySelector(sel).getBoundingClientRect();return{top:(r.top-top)/96,bottom:(r.bottom-top)/96};}return {lang:s.lang,message:rect('.message'),action:rect('.action'),footer:rect('.tag'),address:rect('.address')};}));
  for(const g of geometry){assert.ok(g.message.bottom<7.375,JSON.stringify(g));assert.ok(g.action.bottom<g.footer.top,JSON.stringify(g));}
  await page.pdf({path:path.join(out,'vendvite-agent-solicitation-fr-en.pdf'),preferCSSPageSize:true,printBackground:true});
  await page.locator('.sheet').first().screenshot({path:path.join(out,'solicitation-fr.png')});
  const homeowner=await h.db.get("INSERT INTO brokers(slug,full_name,email,status,published,access_plan,profile) VALUES('qa-print','Marie Tremblay','print@example.test','invited',1,'mailing',$1) RETURNING *",[JSON.stringify({agent_name:'Marie Tremblay',agency:'Agence Exemple',agent_phone:'5145550100'})]);
  const paid=await h.db.get("INSERT INTO broker_campaigns(broker_id,kind,status,payment_status,addresses) VALUES($1,'paid','confirmed','paid',$2) RETURNING *",[homeowner.id,JSON.stringify([{numero:'1234',rue:'RUE DES ÉRABLES',ville:'LAVAL',postal:'H7W 4Y4'}])]);
  await page.goto(h.url+'/pwa/vendvite/admin/campagnes/'+paid.id+'/lettres');
  const homeownerGeometry=await page.locator('.letter').evaluateAll(pages=>pages.map(p=>{const y=p.getBoundingClientRect().top;return{lang:p.lang,middleBottom:(p.querySelector('.middle-panel').getBoundingClientRect().bottom-y)/96,bottom:(p.querySelector('.bottom-panel').getBoundingClientRect().bottom-y)/96,footer:(p.querySelector('.fine').getBoundingClientRect().top-y)/96};}));
  for(const g of homeownerGeometry){assert.ok(g.middleBottom<7.375,JSON.stringify(g));assert.ok(g.bottom<g.footer,JSON.stringify(g));}
  await page.pdf({path:path.join(out,'vendvite-homeowner-fr-en.pdf'),preferCSSPageSize:true,printBackground:true});
  await page.goto(h.url+'/pwa/vendvite/?lang=fr');assert.doesNotMatch(await page.locator('body').innerText(),/599|adhésion/);await page.screenshot({path:path.join(out,'homepage-mailing.png'),fullPage:true});
  await page.goto(h.url+'/pwa/vendvite/demarrer/'+agent.tag+'?lang=fr');await page.screenshot({path:path.join(out,'onboarding-mailing.png'),fullPage:true});
  // Check real Maps using the production origin, with only the requested tenant
  // HTML/assets replaced by local preview code. No live write requests occur.
  await page.setExtraHTTPHeaders({});
  const demoPath='/pwa/vendvite/invitation/'+agent.tag+'?lang=fr';
  const demoHtml=await(await fetch(h.url+demoPath)).text();
  await page.route('https://liasse.tech/pwa/vendvite/invitation/**',route=>route.fulfill({status:200,contentType:'text/html',body:demoHtml}));
  await page.route('https://liasse.tech/pwa/vendvite/public/**',async route=>{const rel=new URL(route.request().url()).pathname.replace('/pwa/vendvite/','');const file=path.join(root,rel);if(!fs.existsSync(file))return route.abort();const ext=path.extname(file);await route.fulfill({path:file,contentType:ext==='.js'?'application/javascript':ext==='.css'?'text/css':undefined});});
  await page.goto('https://liasse.tech'+demoPath,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.getElementById('addressInput').value.includes('4410'));
  let streetView=false;try{await page.waitForFunction(()=>document.getElementById('fichePhoto').dataset.view==='streetview',{},{timeout:30000});streetView=true;}catch(_){}
  await page.locator('#streetview').scrollIntoViewIfNeeded();await page.waitForTimeout(4000);
  await page.screenshot({path:path.join(out,'personalized-demo-desktop.png'),fullPage:true});
  const colors=await page.locator('#leadName').evaluate(el=>({input:getComputedStyle(el).color,placeholder:getComputedStyle(el,'::placeholder').color,label:getComputedStyle(document.querySelector('label[for="leadName"]')).color,reference:getComputedStyle(document.getElementById('ficheRef')).color}));
  await page.setViewportSize({width:390,height:844});await page.locator('#streetview').scrollIntoViewIfNeeded();await page.waitForTimeout(2000);await page.screenshot({path:path.join(out,'personalized-demo-mobile.png'),fullPage:true});
  assert.equal(await page.locator('#leadForm').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  const report={geometry,homeownerGeometry,streetView,googleKeyPresent:!!key,colors,errors};fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();await h.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
