import fs from "fs/promises";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const API_KEY = process.env.API_KEY;
import today from "../utils/today.js";
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

  async publish(data) {
    try {
      const response = await axios.get(`https://opendart.fss.or.kr/api/` + this.service + `.json?crtfc_key=${API_KEY}&corp_code=${data.corp_code}`);
      const result = data
      const list = response.data.list;

      //여기에는 list?.length && list[list.length - 1].rcept_dt === today 같은 코드가 존재하면 안된다. 이것 전부 isPublishable 함수 안에 있어야 한다.

      // console.log('분기 확인: ', list?.length && list[list.length - 1].rcept_dt === today)
      // if (list?.length && list[list.length - 1].rcept_dt === today) {
        // const reportObject = list[list.length - 1];
        const reportObject = {
          rcept_no: '17561756',
          recept_dt: today,
          corp_code: '37341756',
          corp_name: 'test_corp',
          report_tp: '주식등의 대량보유상황 보고구분',
          repror: '최진혁',
          stkqy: '1000',
          stkqy_irds:	3,
          stkrt: 20,
          stkrt_irds: 4,
          ctr_stkqy: 5,
          ctr_stkrt: 6,
          report_resn: '테스트 보고사유'
        }

        // const path = "./reports/" + this.service + "/";
        const html = await Report.renderFileAsync(this.reportFormat, { reportObject });
        result.data = html
        result.logs.push('[3]publish: ' + 'publish 성공'+ now())
        return result;
      // } else {
        result.data = null
        result.logs.push('[3]publish: ' + 'publish 실패'+ now())
        console.log(result)
        return result;
      // }
    } catch (err) {
      console.log(err);
    }
  }
}

