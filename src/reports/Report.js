import fs from "fs/promises";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
const API_KEY = process.env.API_KEY;
import today from "../utils/today.js";
import ejs from "ejs";
import { promisify } from "util";

export default class Report {
  reportNames;
  reportFormat;
  service;

  constructor(service,  reportFormat, reportNames) {
    this.service = service;
    this.reportFormat = reportFormat;
    this.reportNames = reportNames;
  }

  static renderFileAsync = promisify(ejs.renderFile);

  static async from(service) {
    try {
      const path = "./reports/" + service + "/";
      const reportNames = JSON.parse(await fs.readFile(path + "report_nms.json", "utf-8")).data;
      const reportFormat = path + "report.ejs"
      return new Report(service, reportFormat, reportNames);
    } catch (err) {
      console.log("Report.from 에러", err);
    }
  }

  isPublisherable(data) {
    return this.reportNames.some((report_nm) => report_nm === data.report_nm);
  }

  async publish(data) {
    try {
      const response = await axios.get(`https://opendart.fss.or.kr/api/` + this.service + `.json?crtfc_key=${API_KEY}&corp_code=${data.corp_code}`);
      const list = response.data.list;
      
      if (list?.length && list[list.length - 1].rcept_dt === today) {
        const reportObject = list[list.length - 1];
        const path = "./reports/" + this.service + "/";
        const html = await Report.renderFileAsync(this.reportFormat, { reportObject });
        return html;
      } else return null;
    } catch (err) {
      console.log(err);
    }
  }
}

