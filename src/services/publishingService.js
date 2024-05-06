import dotenv from "dotenv";
import delay from "../utils/delay.js";
import { reportPublisherModules } from "./bootstrapping.js";
dotenv.config({ path: "../.env" });
import axios from "axios";
const API_KEY = process.env.API_KEY;
import fs from "fs/promises";
import now from '../utils/now.js'
import AdmZip from 'adm-zip'
import xml2js from 'xml2js'

export const reportPublishing = async (inputQueue, outputQueue) => {
  let queueData ;
  let dartData ; 
  while ((queueData = inputQueue.dequeue()) !== null && (dartData = queueData.data) !== null) {
    const new_data = {...queueData}
    const reports = reportPublisherModules.map(async (module) => {
      if (module.isPublisherable(queueData)) {
        queueData.logs.push('[2]isPublisherable: ' + 'isPublisherable 값 true ' + now())
        const copy = {... queueData}
        const result = await module.publish(copy)
        queueData = new_data
        return result
      }else{
        queueData.logs.push('[2]isPublisherable: ' + 'isPublisherable 값 false ' + now())
        queueData.data = null
        console.log(queueData);
        const result = queueData;
        queueData = new_data
        return result;
      }
    });

    const resolvedReports = await Promise.all(reports)
    resolvedReports.forEach((report) => {
      if (report.data !== null){
        outputQueue.enqueue(report);
      }
    });
  }
  await delay(0);
  reportPublishing(inputQueue, outputQueue);
};

//corp_codes.json 만들어주는 함수 안에는 corp_code를 담은 배열이 있다. 배열 사이즈는 대략 10^5
const getCorpCodesJson = async (url, path) => {
  try {
    const response = await axios.get(`	https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${API_KEY}`, {
      responseType: "arraybuffer",
    });

    //zip파일 다운로드
    const zipFilePath = "./corp_codes.zip";
    await fs.writeFile(zipFilePath, response.data);

    //압축 해제
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo("./", true);

    //xml -> json
    const parser = new xml2js.Parser();
    const xmlFilePath = "./CORPCODE.xml";
    const xml = await fs.readFile(xmlFilePath);
    const jsonFilePath = "./corp_codes.json";

    parser.parseString(xml, async (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      result.result = result.result.list;
      const corpsArray = result.result;
      const corpCordArray = corpsArray.map((corp) => corp.corp_code[0]);

      const json = JSON.stringify(corpCordArray, null, 2);
      await fs.writeFile(jsonFilePath, json);
    });
  } catch (err) {
    console.log(err);
  }
};

// getCorpCodesJson(`https://opendart.fss.or.kr/api/elestock.json?crtfc_key=${API_KEY}`)