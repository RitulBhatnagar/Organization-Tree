import { Request, Response } from "express";
import { CommentService } from "../../services";
import { StorageServiceFactory } from "../../services/v1/cloudServices/storageFactory.service";
import { S3 } from "aws-sdk";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const commentService = new CommentService();

export class CommentController {
  async addComment(req: Request, res: Response) {
    console.log("Incoming request body:", req.body);
    console.log("Uploaded files:", req.files);

    const userId = req.user?.userId;
    let taskId: string;
    let message: string;

    try {
      const parsedData = JSON.parse(req.body.data);
      taskId = parsedData.taskId;
      message = parsedData.message;
    } catch (error) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid JSON in data field" });
    }

    const files = req.files as Express.Multer.File[];
    const storageService = StorageServiceFactory.createStorageService();

    if (!taskId || typeof taskId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing taskId" });
    }

    if (!userId || typeof userId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing userId" });
    }

    if (!message || typeof message !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing message" });
    }

    try {
      let taskAssets: string[] = [];
      if (files && files.length > 0) {
        const uploadPromise = files.map((file) =>
          storageService.uploadFile(file)
        );

        const uploadResults = await Promise.all(uploadPromise);

        console.log("uploadResult", uploadResults);
        taskAssets = uploadResults;
      }

      const comment = await commentService.addComment(
        taskId,
        userId,
        message,
        taskAssets
      );

      return res
        .status(200)
        .json({ message: "Comment added successfully", comment });
    } catch (error) {
      logger.error("Error while adding comment", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error adding comment",
      });
    }
  }

  async getCommentsForTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const { page, limit } = req.query;

    if (!taskId || typeof taskId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing taskId" });
    }

    const paginationParams = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    try {
      const commentsData = await commentService.getCommentsFortask(
        taskId,
        paginationParams
      );

      return res.status(200).json({
        message: "Comments retrieved successfully",
        data: commentsData.data,
        meta: commentsData.meta,
      });
    } catch (error) {
      logger.error("Error while fetching comments for task", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching comments for task",
      });
    }
  }

  async deleteComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!commentId || typeof commentId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing commentId" });
    }

    if (!userId || typeof userId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing userId" });
    }

    try {
      const comment = await commentService.deleteComment(commentId, userId);

      return res.status(200).json({
        message: "Comment deleted successfully",
        comment,
      });
    } catch (error) {
      logger.error("Error while deleting comment", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting comment",
      });
    }
  }

  async updateComment(req: Request, res: Response) {
    const { commentId } = req.params;
    const userId = req.user?.userId;
    const { message, taskAssetsIds } = req.body; // taskAssetsIds is now optional
    const files = req.files as Express.Multer.File[]; // Assuming you're using multer for file uploads
    const storageService = StorageServiceFactory.createStorageService();

    // Check for missing or invalid parameters
    if (!commentId || typeof commentId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing commentId" });
    }

    if (!userId || typeof userId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing userId" });
    }

    if (!message || typeof message !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing message" });
    }

    // Log taskAssetsIds to see its value
    console.log("taskAssetsIds:", taskAssetsIds);

    // Ensure taskAssetsIds is either undefined or an array
    if (taskAssetsIds !== undefined && !Array.isArray(taskAssetsIds)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "taskAssetsIds must be an array if provided" });
    }

    try {
      // Upload files to storage
      let taskAssets: string[] = [];
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          storageService.uploadFile(file)
        );
        const uploadResults = await Promise.all(uploadPromises);

        taskAssets = uploadResults;
      }

      // Combine uploaded assets and provided task asset IDs
      const allTaskAssetsIds = [...taskAssets, ...(taskAssetsIds || [])];

      const updatedComment = await commentService.updateComment(
        commentId,
        userId,
        message,
        allTaskAssetsIds // Use combined task assets IDs
      );

      return res.status(200).json({
        message: "Comment updated successfully",
        updatedComment,
      });
    } catch (error) {
      logger.error("Error while updating comment", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error updating comment",
      });
    }
  }

  async getComment(req: Request, res: Response) {
    const { commentId } = req.params;

    if (!commentId || typeof commentId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing commentId" });
    }

    try {
      const comment = await commentService.getComment(commentId);

      return res.status(200).json({
        message: "Comment retrieved successfully",
        comment,
      });
    } catch (error) {
      logger.error("Error while fetching comment", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching comment",
      });
    }
  }
}
