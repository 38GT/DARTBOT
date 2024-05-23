import dotenv from "dotenv";
import Report from "../reports/Report.js";
import { subscriptionController } from '../services/subscriptionService.js'
import { app } from '../app.js'
import { getServicesAll } from '../data/DB.js';
dotenv.config({ path: "../../.env" });

export const reportPublisherModules = [];

const uploadReportPublisherModules = async () => {
  try {
    const services = [...(app.get('allServices')).keys()]
    const reports = [];

    for (let service of services) {
      reports.push(Report.from(service));
    }

    reportPublisherModules.push(...(await Promise.all(reports)));
    console.log("퍼블리셔 모듈 업로드 성공",reportPublisherModules)

  } catch (err) {
    console.error("퍼블리셔 모듈 업로드 에러", err);
    await uploadReportPublisherModules()
  } 
};

export const bootstrapping = async () => {
  app.set('allServices', await getServicesAll());
  await uploadReportPublisherModules();
  subscriptionController()
  //서비스 업데이트 로직 await updateServices()
};

