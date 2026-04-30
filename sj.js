const { chromium } = require('playwright');
const chromiumPath = "/usr/bin/chromium-browser";

(async () => {

const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: true
   });
  const logFile = fs.createWriteStream('network_log.txt', { flags: 'a' });
  
  const page = await browser.newPage();


  page.on('request', request => {
    logFile.write(`\n>>> REQUEST: ${request.method()} ${request.url()}\n`);
    if (request.method() === 'POST') {
      logFile.write(`BODY: ${request.postData() || 'none'}\n`);
    }
  });

  page.on('response', async response => {
    logFile.write(`<<< RESPONSE: ${response.status()} ${response.url()}\n`);
  });

  await page.goto('https://streamable.com/ri37ps');

  await page.fill("#password", "gvc277");

  await page.click('button[type="submit"]');

  logFile.end();
  
  await page.waitForTimeout(500000);

  await browser.close();
})();
