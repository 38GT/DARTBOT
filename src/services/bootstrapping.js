import axios from "axios";
import fs from "fs/promises";
import dotenv from "dotenv";
import Report from "../reports/Report.js";
dotenv.config({ path: "../../.env" });

export const reportPublisherModules = [];
const API_KEY = process.env.API_KEY;

const uploadReportPublisherModules = async () => {
  try {
    const services = (await fs.readdir("./reports")).filter((file) => !file.endsWith(".js"));
    const reports = [];

    for (let service of services) {
      reports.push(Report.from(service));
    }
    reportPublisherModules.push(...(await Promise.all(reports)));

  } catch (err) {
    console.error("report 파일 업로드 에러", err);
  }
};

export const bootstrapping = async () => {
  await uploadReportPublisherModules();
  console.log('리포트 업로드 완료: ',reportPublisherModules)
};

const getReportNamesJson = async (url) => {
  const corpCodesPath = "../data/corp_codes.json";
  const corpCodes = JSON.parse(await fs.readFile(corpCodesPath, "utf-8"));

  let { count, data, errors } = JSON.parse(await fs.readFile("../data/report_nms.json", "utf-8"));

  for (let i = count; i < corpCodes.length; i++) {
    try {
      await fs.writeFile("../data/report_nms.json", JSON.stringify({ count, data, errors }));
      console.log(i);
      const majorstockResponse = await axios(`${url}?crtfc_key=${API_KEY}&corp_code=${corpCodes[i]}&bgn_de=19941210`);
      const listResponse = await axios(`https://opendart.fss.or.kr/api/list.json?crtfc_key=${API_KEY}&corp_code=${corpCodes[i]}&bgn_de=19941210`);

      if (listResponse.data.status === "020" || majorstockResponse.data.status === "020") {
        console.log("요청 한도 초과");
        return;
      }
      count++;
      if (listResponse.data.status === "000" && majorstockResponse.data.status === "000") {
        const filteredList = listResponse.data.list.filter((x) => majorstockResponse.data.list.some((y) => y.rcept_no === x.rcept_no));
        for (let item of filteredList) {
          try {
            console.log(item);
            //받아온 데이터에 추가해주고 report_nms.json 업데이트 하는 로직 만들기
            data.push(item.report_nm);
            data = Array.from(new Set(data));
            console.log(count, data);
            await fs.writeFile("../data/report_nms.json", JSON.stringify({ count, data, errors }));
            console.log("추가 완료: ", item.report_nm);
          } catch (err) {
            errors.push(`${item.report_nm}+${count}`);
            await fs.writeFile("../data/report_nms.json", JSON.stringify({ count, data, errors }));
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};

/*
  퀘스트: URL마다 가능한 보고서 제목 리스트 뽑아주는 자동화 코드 짜기 
  세부사항:
    (1) URL,파일 저장 위치 string을 파라미터로 받는 함수
    (2) 실행시키면 리스트 json 파일 생성

  구현 아이디어: 등록된 회사 전체 corp_code를 해당 URL에 전체 기간으로 요청을 해서 가능한 모든 이름들을 받아온다.
  순서:
    (1) corpCode Zip파일 압축 해제 후 XML -> JSON으로 변환 저장 (v)
    (2) 변환된 JSON파일 바탕으로 corp_code만 모아놓은 corp_codes.json 파일 만들기 
    (3) corp_codes.json에 나온 copr_code 마다 https://opendart.fss.or.kr/api/list.json 에 corp_code 파라미터와 함께 최대 기간 요청
*/
