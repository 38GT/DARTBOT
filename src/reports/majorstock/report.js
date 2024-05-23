import puppeteer from 'puppeteer';

const crawlingDART = async (url) => {
  const browser = await puppeteer.launch({ 
    headless: true,                 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 필요한 인자 추가 -> 나중에 필요할 수 있으니 테스트해보고 필요 없으면 제거
   });                                                                                                                                                                                
  const page = await browser.newPage();
  const crawledData = new Map();

  const moveToThePage = async (page,subReport) => {
    const reportLinkSelector = "a.jstree-anchor";
    try {
      await page.waitForSelector(reportLinkSelector, { timeout: 10000});
      const found = await page.evaluate((subReport) => {
        const anchors = Array.from(document.querySelectorAll("a.jstree-anchor"));
        const link = anchors.find((a) => a.textContent.includes(subReport));
        if (link) {
          link.click();
          return true;
        }
        return false;
      }, subReport);
      
      if (found) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("Could not find the report link.");
      }
    } catch (error) {
      console.error("An error occurred while navigating to the report:", error);
    }
  }

  const extractDataFromIframe = async (page) => {
  try {
    const iframeElement = await page.$('iframe');
    if (iframeElement) {
      const frame = await iframeElement.contentFrame();
      if (frame) {
        const data = await frame.evaluate(() => {
          const rows = Array.from(document.querySelectorAll("table tr"));
          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll("td"));
            return cells.map(cell => cell.innerText.trim());
          });
        });
        return data;
      } else {
        console.log("Failed to get iframe content frame.");
        return null;
      }
    } else {
      console.log("Iframe element not found.");
      return null;
    }
  } catch (error) {
    console.error("Failed to extract data from iframe:", error);
    return null;
  }
  }

  try {
  
    await page.goto(url, { waitUntil: "networkidle0" });
    const subPageTitles = await page.evaluate(() => {
      const pageTitles = Array.from(document.querySelectorAll("a.jstree-anchor")).map(a => a.textContent);
      return pageTitles;
    })

    for( let title of subPageTitles){
      await moveToThePage(page,title)
      crawledData.set(title,await extractDataFromIframe(page));
    }             

    return crawledData

  } catch (error) {
    console.error("crawlingDART error occurred:", error);
    return null;

  } finally {
    await browser.close();
  }
} 

export const makingReport = async (url) => {

  try{
    const data = (await crawlingDART(url)).get('주식등의 대량보유상황보고서');

    const diff = Math.round((data[10][2]-data[9][2]) * 100) / 100;
    const report = `대량보유상황보고 
    보고자명: ${data[6][3]}
    회사명: ${data[6][1]}
    보유량변화: ${data[9][2]}% → ${data[10][2]}% (${diff}%)
    보고사유: ${data[20][1]}
    `.trim();
    return report
  }catch(err){
    console.log(err)
  }

}