import { Request, Response } from "express";
import { TaskHistoryService } from "../../services";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const taskHistoryService = new TaskHistoryService();
export class TaskHistoryController {
  async getTaskHistoryByTaskId(req: Request, res: Response): Promise<Response> {
    const { taskId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!taskId || typeof taskId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing taskId" });
    }

    const paginationParams = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    try {
      const taskHistory = await taskHistoryService.getTaskHistoryByTaskId(
        taskId,
        paginationParams
      );

      return res.status(200).json({
        message: "Task history retrieved successfully",
        data: taskHistory.data,
        meta: taskHistory.meta,
      });
    } catch (error) {
      logger.error(`Error fetching task history for taskId ${taskId}`, error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching task history",
      });
    }
  }
}
