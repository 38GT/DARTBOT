import express from "express";
import Queue from "./utils/Queue.js";
import { bootstrapping } from "./services/bootstrapping.js";
import { pollingDARTdata } from "./services/dartApiService.js";
import { reportPublishing } from "./services/publishingService.js";
import deliverReport from "./services/deliveryService.js";
const app = express();

const main = async () => {
  const dartQueue = new Queue();
  const reportQueue = new Queue();
  await bootstrapping();
  pollingDARTdata(dartQueue, 60000);
  reportPublishing(dartQueue, reportQueue);
  deliverReport(reportQueue);
};

main();

app.listen(3000, () => console.log("\x1b[31m", "DARTBOT SERVER START"));
