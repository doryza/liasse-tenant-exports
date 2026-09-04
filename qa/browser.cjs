const assert=require('assert/strict');
const {chromium}=require('/home/liassetech/liasse.tech/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 for(const width of [1440,390,320])for(const variant of ['visible','gated'])for(const lang of ['fr','en']){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4798/pwa/vendvite/?vv_preview='+variant+'&lang='+lang,{waitUntil:'networkidle'});
  assert.equal(await page.locator('body').evaluate(b=>b.scrollWidth<=window.innerWidth),true,`overflow ${width} ${variant} ${lang}`);
  assert.equal((await page.locator('body').innerText()).includes('599'),variant==='visible');
  if(width!==320 && lang==='fr')await page.screenshot({path:`qa/homepage-${variant}-${width}.png`,fullPage:true});
  await page.locator('.hp-actions [data-home-cta]').click();assert.equal(await page.locator('#invName').evaluate(e=>e===document.activeElement),true);
  await page.locator('#invSubmit').click();assert.equal(await page.locator('#invError').isVisible(),true);
  await page.locator('#invName').fill('Preview Broker');await page.locator('#invAgency').fill('QA Agency');await page.locator('#invRegion').fill('Montreal');await page.locator('#invEmail').fill('preview@example.test');await page.locator('#invPhone').fill('5145550100');
  await page.locator('#invSubmit').click();await page.locator('#invDone').waitFor({state:'visible'});assert.equal(await page.locator('#hpReveal').isVisible(),true);assert.match(await page.locator('#hpReveal').innerText(),/599/);assert.equal(await page.locator('#invForm').isVisible(),false);
  if(width===390 && variant==='gated' && lang==='fr')await page.screenshot({path:'qa/homepage-reveal-mobile.png',fullPage:true});
  await context.close();
 }
 const page=await browser.newPage({extraHTTPHeaders:{'x-test-admin':'yes'}});await page.goto('http://127.0.0.1:4798/admin/conversions');assert.equal(await page.locator('tbody tr').count(),2);assert.match(await page.locator('body').innerText(),/Aucun gagnant démontré/);await page.screenshot({path:'qa/homepage-results.png',fullPage:true});
 assert.deepEqual(errors,[]);await browser.close();console.log('12 browser scenarios passed: 320/390/1440px, FR/EN, visible/gated; form validation, focus, reveal, dashboard; no JS errors or horizontal overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
