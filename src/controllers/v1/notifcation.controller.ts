import { Request, Response } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { PaginationParams } from "../../types";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";
import { NotificationService } from "../../services"; // Assuming you have a service for handling notifications

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing user id" });
    }
    const paginationParams: PaginationParams = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 10,
    };

    try {
      const notifications = await notificationService.getNotifications(
        userId,
        paginationParams
      );

      return res.status(200).json({
        message: "Notifications retrieved successfully",
        data: notifications.data,
        meta: notifications.meta,
      });
    } catch (error) {
      logger.error("Error while fetching notifications", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching notifications",
      });
    }
  }
  async markAsSeen(req: Request, res: Response): Promise<Response> {
    const { messageId } = req.params;

    if (!messageId || typeof messageId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing messageId" });
    }

    try {
      const messageIncoming = await notificationService.markAsSeen(messageId);

      return res.status(200).json({
        message: "Message marked as seen successfully",
        messageIncoming,
      });
    } catch (error) {
      logger.error("Error while marking message as seen", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error marking message as seen",
      });
    }
  }
}
