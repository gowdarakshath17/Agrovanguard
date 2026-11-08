const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent.includes('Demo Login'));
    if (demoBtn) demoBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const scanBtn = buttons.find(b => b.textContent.includes('SCAN CROP'));
    if (scanBtn) scanBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const hasCameraBtn = await page.evaluate(() => {
    return document.body.innerHTML.includes('Capture with Camera');
  });
  console.log("Scanner widget visible?", hasCameraBtn);
  
  await browser.close();
})();
