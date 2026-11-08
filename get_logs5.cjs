const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find(b => b.textContent.includes('Demo Login'));
    if (demoBtn) demoBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const hasScanCrop = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(b => b.textContent.includes('SCAN CROP'));
  });
  console.log("Has SCAN CROP button?", hasScanCrop);
  
  await browser.close();
})();
