import dotenv from "dotenv";
import delay from "../utils/delay.js";
import { reportPublisherModules } from "./bootstrapping.js";
dotenv.config({ path: "../.env" });
const API_KEY = process.env.API_KEY;
import now from '../utils/now.js'

export const reportPublishing = async (inputQueue, outputQueue) => {
  let queueData ;
  while ((queueData = inputQueue.dequeue()) !== null && queueData.data !== null) {
    const LOGS = [...queueData.logs]
    const reports = reportPublisherModules.map(async (module) => {
      const new_data = {
        ...queueData,
        logs: LOGS
      };
    
      if (module.isPublisherable(new_data)) {
        new_data.logs.push('[2]isPublisherable: ' + module.service_id + ' true ' + now());
        const result = await module.publish(new_data);
        return result;
      } else {
        new_data.logs.push('[2]isPublisherable: ' + module.service_id + ' false ' + now());
        new_data.data = null;
        return new_data;
      }
    });

    const resolvedReports = await Promise.all(reports)
    let nullCounter = 0;
    resolvedReports.forEach((report) => {
      if (report.data !== null){
        outputQueue.enqueue(report);
      }else{
        nullCounter++
        if(nullCounter === resolvedReports.length) console.log(report)
      }
    });
  }
  await delay(0);
  reportPublishing(inputQueue, outputQueue);
};
