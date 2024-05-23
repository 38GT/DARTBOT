import express from "express";
import Queue from "./utils/Queue.js";
import { bootstrapping } from "./services/bootstrapping.js";
import { pollingDARTdata, testPolling } from "./services/dartApiService.js";
import { reportPublishing } from "./services/publishingService.js";
import deliverReport from "./services/deliveryService.js";

export const app = express();
const main = async () => {
  const dartQueue = new Queue();
  const reportQueue = new Queue();

  pollingDARTdata(dartQueue, 6000);
  // testPolling(dartQueue,60000)
  reportPublishing(dartQueue, reportQueue);
  deliverReport(reportQueue);
};

await bootstrapping();
main();

app.listen(3000, () => console.log("\x1b[31m", "DARTBOT SERVER START"));

