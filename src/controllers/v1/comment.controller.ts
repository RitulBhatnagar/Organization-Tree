import { Request, Response } from "express";
import { CommentService } from "../../services";
import { StorageServiceFactory } from "../../services/v1/cloudServices/storageFactory.service";
import { S3 } from "aws-sdk";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const commentService = new CommentService();

export class CommentController {
  async addComment(req: Request, res: Response) {
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
    const userId = req.user?.userId;
    const { commentId } = req.params;
    let message: string;
    let taskAssetsToRemove: string[] = [];

    try {
      const parsedData = JSON.parse(req.body.data);
      message = parsedData.message;
      taskAssetsToRemove = Array.isArray(parsedData.taskAssetsToRemove)
        ? parsedData.taskAssetsToRemove
        : [];
    } catch (error) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid JSON in data field" });
    }

    // Validation checks
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

    try {
      // Handle file uploads
      const files = req.files as Express.Multer.File[];
      const storageService = StorageServiceFactory.createStorageService();
      let newTaskAssets: string[] = [];

      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          storageService.uploadFile(file)
        );
        newTaskAssets = await Promise.all(uploadPromises);
        console.log("Uploaded new assets:", newTaskAssets);
      }

      const updatedComment = await commentService.updateComment(
        commentId,
        userId,
        message,
        newTaskAssets, // New assets to add (URLs)
        taskAssetsToRemove // Existing asset IDs to remove
      );

      return res.status(HttpStatusCode.OK).json({
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
