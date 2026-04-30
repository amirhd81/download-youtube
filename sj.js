const { chromium } = require('playwright');
const chromiumPath = "/usr/bin/chromium-browser";
const fs = require('fs');

(async () => {

const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: true
   });
    

    let clicked = false;
  const logFile = fs.createWriteStream('network_log.txt', { flags: 'a' });
  
  const page = await browser.newPage();

    page.on('request', req => {
  
      logFile.write(` ${req.url()}\nBODY: ${req.postData()}\n\n`);
  
});


  page.on('response', async response => {
      
    logFile.write(`<<< RESPONSE: ${response.status()} ${response.url()}\n`);
      
  });

  await page.goto('https://streamable.com/ri37ps');

  await page.fill('form[name="video-password"] input[name="password"]', 'gvc277');

  await page.click('button[type="submit"]');

    clicked = true
    console.log(clicked, "buttong clicked")
    


  logFile.end();

    await page.waitForTimeout(10000);

await page.waitForTimeout(3000);

    const elementHandle = await page.$('iframe');
const frame = await elementHandle.contentFrame();

    if (!frame) {
  console.log("Frame not loaded yet");
} else {
  const html = await frame.content();
  console.log(html);
}

// Extract URL
const src = await frame.getAttribute("source", "src");

console.log("Final video src:", src);

    const html = await page.content();

//     const src = await page.locator('source').getAttribute('src');
// console.log(src); 

  // save to file
  fs.writeFileSync('page3.html', html);

  console.log('HTML saved');
  
  // await page.waitForTimeout(500000);

  await browser.close();
})();
