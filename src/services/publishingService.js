import dotenv from "dotenv";
import delay from "../utils/delay.js";
import { reportPublisherModules } from "./bootstrapping.js";
dotenv.config({ path: "../.env" });
import axios from "axios";
const API_KEY = process.env.API_KEY;
import fs from "fs/promises";

export const reportPublishing = async (inputQueue, outputQueue) => {
  let dartData;
  while ((dartData = inputQueue.dequeue()) !== null) {
    // console.log("퍼블리싱 전 데이타", dartData);
    const promisedReports = reportPublisherModules.map((module) => {
      if (module.isPublisherable(dartData)) {
        return module.publish(dartData);
      }
      return Promise.resolve(null);
    });
    const resolvedReports = await Promise.all(promisedReports);
    // console.log(resolvedReports);
    resolvedReports.forEach((report) => {
      if (report !== null) outputQueue.enqueue(report);
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
