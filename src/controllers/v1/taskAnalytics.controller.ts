import { Request, Response } from "express";
import { TaskAnalyticsService } from "../../services/v1/taskAnalytics.service";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const taskAnalyticsService = new TaskAnalyticsService();

export class TaskAnalyticsController {
  async getTaskAnalytics(req: Request, res: Response): Promise<Response> {
    const { filter } = req.query;

    if (!filter || typeof filter !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing filter" });
    }

    try {
      const analyticsData = await taskAnalyticsService.getTaskAnalytics(filter);
      return res.status(200).json({
        message: "Task analytics retrieved successfully",
        data: analyticsData,
      });
    } catch (error) {
      logger.error("Error fetching task analytics", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching task analytics",
      });
    }
  }
}
