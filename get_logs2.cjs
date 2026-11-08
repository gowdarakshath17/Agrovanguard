const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  console.log("Clicking Demo Login...");
  const elements = await page.$x("//button[contains(., 'Demo Login')]");
  if (elements.length > 0) {
    await elements[0].click();
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log("Demo Login button not found");
  }
  
  await browser.close();
})();
