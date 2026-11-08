const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("Clicking Demo Login...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent.includes('Demo Login'));
    if (demoBtn) demoBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Also try clicking the Scan Crop button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const scanBtn = buttons.find(b => b.textContent.includes('SCAN CROP'));
    if (scanBtn) scanBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
