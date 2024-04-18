import dotenv from "dotenv";
import delay from "../utils/delay.js";
import { reportPublisherModules } from "./bootstrapping.js";
dotenv.config({ path: "../.env" });
import axios from "axios";
const API_KEY = process.env.API_KEY;
import fs from "fs/promises";

export const reportPublishing = async (inputQueue, outputQueue) => {
  let dartData;
  let report_count = 0;
  while ((dartData = inputQueue.dequeue()) !== null) {
    report_count ++
    console.log('[2]보고서 만들기 전 리포트: ', dartData) //여기 리포트는 위에서 나왔던 리포트가 아니라 ejs다. 이런 걸 해결해야할 것 같다. DTO를 도입해서 데이터 포맷을 명시화 시키자.
    const promisedReports = reportPublisherModules.map((module) => {
      if (module.isPublisherable(dartData)) {
        console.log('[3]isPublisherable 통과한 리포트: ', dartData)
        const result = module.publish(dartData)
        console.log('[3.5] publish 메서드를 통해 만들어진 리포트',result)
        return result;
      }
      return Promise.resolve(null);
    });
    const resolvedReports = await Promise.all(promisedReports);
    console.log('[3.75] 리졸브된 리포트', resolvedReports)
    resolvedReports.forEach((report) => {
    if (report !== null){
      console.log('[4]퍼블리싱된 리포트: ', report) //여기 리포트는 위에서 나왔던 리포트가 아니라 ejs다. 이런 걸 해결해야할 것 같다. DTO를 도입해서 데이터 포맷을 명시화 시키자.
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
