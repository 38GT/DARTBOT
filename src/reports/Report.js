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
  reportNames;
  reportFormat;
  service;

  constructor(service,  reportFormat, reportNames,reportName) {
    this.service = service;
    this.reportFormat = reportFormat;
    this.reportNames = reportNames;
    this.reportName = reportName;
  }

  static renderFileAsync = promisify(ejs.renderFile);

  static async from(service) {
    try {
      const path = "./reports/" + service + "/";
      const reportFormat = path + "report.ejs"
      const reportNames = JSON.parse(await fs.readFile(path + "report_nms.json", "utf-8")).data;
      const reportName = JSON.parse(await fs.readFile(path + "report_nms.json", "utf-8")).name;
      return new Report(service, reportFormat, reportNames, reportName);
    } catch (err) {
      console.log("Report.from 에러", err);
    }
  }

  isPublisherable(data) {
    // console.log('test3: ', data.data.report_nm);

    const cleanedName = data.data.report_nm.replace(/\[.*?\]|\(.*?\)/g, '').trim();
    return this.reportName === cleanedName
    return this.reportNames.some((report_nm) => report_nm === data[data.report_nm]);
  }

  async publish(data) {
    try {
      const response = await axios.get(`https://opendart.fss.or.kr/api/` + this.service + `.json?crtfc_key=${API_KEY}&corp_code=${data.corp_code}`);
      const result = data
      const list = response.data.list;
      
      if (list?.length && list[list.length - 1].rcept_dt === today) {
        const reportObject = list[list.length - 1];
        // const path = "./reports/" + this.service + "/";
        const html = await Report.renderFileAsync(this.reportFormat, { reportObject });
        result.data = html
        result.logs.push('[2]publish: ' + 'publish 성공'+ now())
        return result;
      } else {
        result.data = null
        result.logs.push('[2]publish: ' + 'publish 실패'+ now())
        console.log(result)
        return result;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

