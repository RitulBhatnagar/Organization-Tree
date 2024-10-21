import { Request, Response } from "express";
import { TaskService } from "../../services";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";
import { TaskTypeEnum } from "../../entities/Task/taskEntity";
import { AppDataSource } from "../../config/data-source";
import { PaginationUtil } from "../../utils/pagination/pagination";
import { PaginationParams } from "../../types";
const taskService = new TaskService(AppDataSource);
export class TaskController {
  async createTask(req: Request, res: Response) {
    const {
      name,
      description,
      taskType,
      dueDate,
      creatorId,
      assignPersonId,
      realtedEntityId,
    } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid task name" });
    }

    if (!taskType || !Object.values(TaskTypeEnum).includes(taskType)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid task type" });
    }

    if (!creatorId || typeof creatorId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid creator ID" });
    }

    try {
      const task = await taskService.createTask(
        name,
        description,
        taskType,
        new Date(dueDate),
        creatorId,
        assignPersonId,
        realtedEntityId
      );

      return res.status(201).json({
        message: "Task created successfully",
        task: task,
      });
    } catch (error) {
      logger.error("Error creating task", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error creating task",
      });
    }
  }

  async getTask(req: Request, res: Response) {
    const { taskId } = req.params;

    if (!taskId || typeof taskId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Invalid or missing taskId",
      });
    }

    try {
      const task = await taskService.getTask(taskId);

      return res.status(200).json({
        message: "Task retrieved successfully",
        task,
      });
    } catch (error) {
      logger.error("Error while retrieving task", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving task",
      });
    }
  }

  async updateTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const {
      name,
      description,
      taskType,
      dueDate,
      creatorId,
      assignPersonRemove,
      assignPersonAdd,
      realtedEntityId,
    } = req.body;

    if (!taskId || typeof taskId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing taskId" });
    }

    if (!name || typeof name !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid or missing task name" });
    }

    if (!taskType || !Object.values(TaskTypeEnum).includes(taskType)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid task type" });
    }

    if (!creatorId || typeof creatorId !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid creator ID" });
    }

    if (!Array.isArray(assignPersonRemove)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid assigned person IDs" });
    }

    if (!Array.isArray(assignPersonAdd)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid assigned person IDs" });
    }

    try {
      const updatedTask = await taskService.updateTask(
        taskId,
        name,
        description,
        taskType,
        new Date(dueDate), // Ensure dueDate is a valid date
        creatorId,
        assignPersonRemove,
        assignPersonAdd,
        realtedEntityId
      );

      return res.status(200).json({
        message: "Task updated successfully",
      });
    } catch (error) {
      logger.error("Error while updating task", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error updating task",
      });
    }
  }

  async markTaskCompleted(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user?.userId;

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

    try {
      const task = await taskService.markTaskCompleted(taskId, userId);

      return res.status(200).json({
        message: "Task marked as completed successfully",
      });
    } catch (error) {
      logger.error("Error while marking task as completed", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error marking task as completed",
      });
    }
  }
  async deleteTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user?.userId;

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

    try {
      await taskService.deleteTask(taskId, userId);

      return res.status(200).json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      logger.error("Error while deleting task", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting task",
      });
    }
  }
  async getTasks(req: Request, res: Response) {
    const filters = req.query;
    const paginationParams: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };

    try {
      const tasks = await taskService.getTasks(filters, paginationParams);

      return res.status(200).json({
        message: "Tasks retrieved successfully",
        tasks,
      });
    } catch (error) {
      logger.error("Error while retrieving tasks", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving tasks",
      });
    }
  }
}
