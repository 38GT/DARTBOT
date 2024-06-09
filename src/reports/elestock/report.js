import puppeteer from "puppeteer";

const crawlingDART = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // 필요한 인자 추가 -> 나중에 필요할 수 있으니 테스트해보고 필요 없으면 제거
  });
  const page = await browser.newPage();
  const crawledData = new Map();

  const moveToThePage = async (page, subReport) => {
    const reportLinkSelector = "a.jstree-anchor";
    try {
      await page.waitForSelector(reportLinkSelector, { timeout: 60000 });
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
        // 링크 클릭 후 일정 시간 대기 (예: 0.05초)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log("Could not find the report link.");
      }
    } catch (error) {
      console.error("An error occurred while navigating to the report:", error);
    }
  };

  const extractDataFromIframe = async (page) => {
    try {
      const iframeElement = await page.$("iframe");
      if (iframeElement) {
        const frame = await iframeElement.contentFrame();
        if (frame) {
          const data = await frame.evaluate(() => {
            const rows = Array.from(document.querySelectorAll("table tr"));
            return rows.map((row) => {
              const cells = Array.from(row.querySelectorAll("td"));
              return cells.map((cell) => cell.innerText.trim());
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
  };

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    const subPageTitles = await page.evaluate(() => {
      const pageTitles = Array.from(document.querySelectorAll("a.jstree-anchor")).map((a) => a.textContent);
      return pageTitles;
    });

    for (let title of subPageTitles) {
      await moveToThePage(page, title);
      crawledData.set(title, await extractDataFromIframe(page));
    }

    return crawledData;
  } catch (error) {
    console.error("crawlingDART error occurred:", error);
    return null;
  } finally {
    await browser.close();
  }
};

export const makingReport = async (url) => {
  const data = await crawlingDART(url);
  const name = data.get("2. 보고자에 관한 사항")[1][2];
  const relation = data.get("2. 보고자에 관한 사항")[4][4];
  const corp_name = data.get("1. 발행회사에 관한 사항")[0][1];
  const before_rate = isNaN(data.get("3. 특정증권등의 소유상황")[2][5]) ? 0 : data.get("3. 특정증권등의 소유상황")[2][5];
  const after_rate = isNaN(data.get("3. 특정증권등의 소유상황")[3][5]) ? 0 : data.get("3. 특정증권등의 소유상황")[3][5];
  const diff = Math.round((after_rate - before_rate) * 100) / 100;
  const report = `임원ㆍ주요주주 특정증권등 소유상황보고서
  보고자명: ${name}[${relation}]
  회사명: ${corp_name}
  보유량변화: ${before_rate}% → ${after_rate}% (${diff}%)
  `;
  return report;
};
