import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import ejs from "ejs";
import { promisify } from "util";
import now from '../utils/now.js'
import { getServicesAll } from '../data/DB.js'

export default class Report {
  service_id;
  report_nm;
  report_format;

  constructor(service_id, report_nm, report_format) {
    this.service_id = service_id;
    this.report_nm = report_nm
    this.report_format = report_format;
  }

  static renderFileAsync = promisify(ejs.renderFile);

  static async from(service_id) {
    try {
      const path = "./" + service_id + "/";
      const report_nm = (await getServicesAll()).get(service_id)
      const reportModule = await import(path + "report.js")
      const { makingReport }  = reportModule;
      return new Report(service_id, report_nm,  makingReport );
    } catch (err) {
      console.log("Report.from 에러", err);
    }
  }

  isPublisherable(data) {
    const cleanedName = data.data?.report_nm.replace(/\[.*?\]|\(.*?\)/g, '').trim();
    return (this.report_nm.replace(/\s+/g, '') === cleanedName)
  }

  async publish(input) {
    const result = {...input}
    const rcept_no = input.data.rcept_no;
    const url = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rcept_no}`
    try {
      result.data = await this.report_format(url)
      result.logs.push('[3]publish: ' + 'publish 성공'+ now())
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}
