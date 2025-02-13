// src/config/cron.ts
import cron from "node-cron";
import { taskSchedulerService } from "../services/v1/taskScheduler.service";
import logger from "../utils/logger";
export const startCronJobs = () => {
  // Schedule a job to run every hour
  cron.schedule("0 * * * *", async () => {
    logger.info(
      "Running cron job to check for task notifications and overdue tasks"
    );
    await taskSchedulerService.checkTasks();
  });
};

// export const startCronJobs = () => {
//   // Schedule a job to run every 30 seconds
//   cron.schedule("*/30 * * * * *", async () => {
//     logger.info(
//       "Running cron job to check for task notifications and overdue tasks"
//     );
//     try {
//       await taskSchedulerService.checkTasks();
//     } catch (error) {
//       logger.error("Error in cron job:", error);
//     }
//   });

//   logger.info("Cron jobs scheduled successfully");
// };
