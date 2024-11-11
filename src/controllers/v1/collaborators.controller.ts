import { Request, Response } from "express";
import { CollaboratorsService } from "../../services/v1/collaborator.service";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const collaboratorsService = new CollaboratorsService();

export class CollaboratorsController {
  async addCollaborators(req: Request, res: Response) {
    const { taskId } = req.params;
    const { userIds } = req.body;
    const adminId = req.user?.userId;

    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid task id",
      });
    }

    if (!adminId || typeof adminId !== "string" || adminId.trim() === "") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "admin id is missing",
      });
    }
    if (
      !Array.isArray(userIds) ||
      userIds.some((id) => typeof id !== "string" || id.trim() === "")
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid user IDs",
      });
    }

    try {
      const newCollaborators = await collaboratorsService.addCollaborators(
        taskId,
        userIds,
        adminId
      );
      return res.status(HttpStatusCode.CREATED).json({
        message: "Collaborators added successfully",
      });
    } catch (error) {
      logger.error("Error adding collaborators", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error adding collaborators",
      });
    }
  }

  async removeCollaborators(req: Request, res: Response) {
    const { taskId } = req.params;
    const { userIds } = req.body;
    const adminId = req.user?.userId;

    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid task id",
      });
    }

    if (!adminId || typeof adminId !== "string" || adminId.trim() === "") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "admin id is missing",
      });
    }
    if (
      !Array.isArray(userIds) ||
      userIds.some((id) => typeof id !== "string" || id.trim() === "")
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid user IDs",
      });
    }

    try {
      const removeCollaborators =
        await collaboratorsService.removeCollaborators(
          taskId,
          userIds,
          adminId
        );
      return res.status(HttpStatusCode.OK).json({
        message: "collaborator removed successfully",
      });
    } catch (error) {
      logger.error("Error removing collaborators", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error removing collaborators",
      });
    }
  }

  async getCollaboratorsTasks(req: Request, res: Response) {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid user id",
      });
    }

    try {
      const collaboratorsTasks =
        await collaboratorsService.getCollaboratorsTasks(userId, {
          page,
          limit,
        });

      return res.status(HttpStatusCode.OK).json({
        message: "Collaborators tasks fetched successfully",
        ...collaboratorsTasks,
      });
    } catch (error) {
      logger.error("Error getting collaborators tasks", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error getting collaborators tasks",
      });
    }
  }
}
