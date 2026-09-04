const assert=require('node:assert/strict');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];
 try{
 for(const width of [1440,390,320])for(const variant of ['visible','gated'])for(const lang of ['fr','en']){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto((process.env.PREVIEW_BASE||'http://127.0.0.1:4808/pwa/vendvite/')+'?vv_preview='+variant+'&lang='+lang,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);assert.match(response.headers()['cache-control'],/no-store/);
  const text=await page.locator('body').innerText();assert.equal(text.includes('599'),variant==='visible');
  assert.match(text,lang==='fr'?/Des centaines de lettres/:/Hundreds of letters/);
  assert.match(text,lang==='fr'?/Vous ne léchez ni ne remplissez jamais une enveloppe/:/Never lick or stuff an envelope/);
  assert.equal(await page.locator('.hp-products article').count(),2);
  assert.equal(await page.locator('.hp-shipping-steps li').count(),5);
  assert.match(await page.locator('.hp-studio figcaption').innerText(),/300/);
  assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=innerWidth),true,`overflow ${width} ${lang} ${variant}`);
  await page.locator('.hp-text-link').click();await page.waitForFunction(()=>Math.abs(document.querySelector('#builder').getBoundingClientRect().top)<100);
  if(width!==320&&variant==='visible'){
    await page.screenshot({path:`qa/campaign-homepage-${lang}-${width}.png`,fullPage:true});
    if(width===1440)await page.locator('#builder').screenshot({path:`qa/campaign-homepage-builder-${lang}.png`});
  }
  await page.locator('.hp-actions [data-home-cta]').click();assert.equal(await page.locator('#invName').evaluate(e=>e===document.activeElement),true);
  await page.locator('#invSubmit').click();assert.equal(await page.locator('#invError').isVisible(),true);
  for(const [selector,value] of Object.entries({'#invName':'Preview only','#invAgency':'QA','#invRegion':'Montreal','#invEmail':'preview@example.test','#invPhone':'5145550100'}))await page.locator(selector).fill(value);
  assert.equal(await page.locator('main.hp').getAttribute('data-preview'),'1');
  const submitted=page.waitForRequest(r=>r.url().includes('/api/courtier/candidature'));
  await page.locator('#invSubmit').click();assert.equal((await submitted).postDataJSON().homepage_preview,true);await page.locator('#invDone').waitFor({state:'visible'});
  assert.match(await page.locator('#hpReveal').innerText(),/599/);
  assert.match(await page.locator('#hpRevealIncludes').innerText(),lang==='fr'?/créateur de campagnes/:/campaign builder/);
  assert.match(await page.locator('#invDoneText').innerText(),lang==='fr'?/Aucune demande/:/No request/);
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('12 preview scenarios passed: both A/B variants, FR/EN, 320/390/1440px; builder, shipping, equal product cards, price gating/reveal, CTA focus and form validation. No overflow or page errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
