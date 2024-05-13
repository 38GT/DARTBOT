import fs from "fs/promises";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
dotenv.config({ path: "../.env" });
import ejs from "ejs";
import { promisify } from "util";
import now from '../utils/now.js'

export default class Report {
  reportName;
  reportFormat;
  service;

  constructor(service,  reportFormat, reportName) {
    this.service = service;
    this.reportFormat = reportFormat;
    this.reportName = reportName;
  }

  static renderFileAsync = promisify(ejs.renderFile);

  static async from(service) {
    try {
      const path = "./reports/" + service + "/";
      const reportFormat = path + "report.ejs"
      const reportName = JSON.parse(await fs.readFile(path + "report_nms.json", "utf-8")).name;
      return new Report(service, reportFormat, reportName);
    } catch (err) {
      console.log("Report.from 에러", err);
    }
  }

  isPublisherable(data) {

    const cleanedName = data.data?.report_nm.replace(/\[.*?\]|\(.*?\)/g, '').trim();
    return this.reportName === cleanedName

  }

  async publish(input) {
    try {
      const rcept_no = input.data.rcept_no;
      const url = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcept_no}`
      input.data = await extractIframeContentWithStructure(url)
      input.logs.push('[3]publish: ' + 'publish 성공'+ now())
      return input;
    } catch (err) {
      console.log(err);
    }
  }
}

async function extractIframeContentWithStructure(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  let result;
  const elementHandles = await page.$$("iframe");
  for (const handle of elementHandles) {
    const frame = await handle.contentFrame();
    if (frame) {
      // iframe 내부의 모든 요소 순회
      const tdTexts = await frame.evaluate(() => {
        const tds = Array.from(document.querySelectorAll("td"));
        return tds.map((td) => td.innerText);
      });
      /*
      보고자명 tdTests[10]
      회사명 tdTests[13]\
      전 주식 보유 비율 tdTests[24]
      현재 주식 보유 비율 tdTests[27]
      보고 사유 tdTests[59]
      */
      const report = `
        대량보유상황보고
        보고자명: ${tdTexts[10]}
        회사명: ${tdTexts[13]}
        보유량변화: ${tdTexts[24]}% → ${tdTexts[27]}% (${tdTexts[27]-tdTexts[24]}%)
        보고사유: ${tdTexts[59]}
        `;
      result = report;
    }
  }
  await browser.close();
  return result;
}
