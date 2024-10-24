import { Request, Response } from "express";
import { TaskService } from "../../services";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";
import { TaskTypeEnum } from "../../entities/Task/taskEntity";
import { AppDataSource } from "../../config/data-source";
import { PaginationUtil } from "../../utils/pagination/pagination";
import { FilterParams, PaginationParams } from "../../types";
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
  async getFilterCounts(req: Request, res: Response) {
    const filterParams: FilterParams = req.query;

    try {
      const filterCounts = await taskService.getFilterCounts(filterParams);
      // return res.status(HttpStatusCode.OK).json({
      //   message: "Filters retrieved successfully",
      //   filters: {
      //     taskTypes: [
      //       { type: "All", count: filterCounts.totalCount },
      //       {
      //         type: "General Service",
      //         count:
      //           filterCounts.taskTypes.find((t) => t.type === "GENERAL")
      //             ?.count || 0,
      //       },
      //       {
      //         type: "Brand",
      //         count:
      //           filterCounts.taskTypes.find((t) => t.type === "BRAND")?.count ||
      //           0,
      //       },
      //       {
      //         type: "Event",
      //         count:
      //           filterCounts.taskTypes.find((t) => t.type === "EVENT")?.count ||
      //           0,
      //       },
      //       {
      //         type: "Inventory",
      //         count:
      //           filterCounts.taskTypes.find((t) => t.type === "INVENTORY")
      //             ?.count || 0,
      //       },
      //     ],
      //     assignedBy: filterCounts.assignedBy.map((user) => ({
      //       userId: user.userId,
      //       name: user.name,
      //       count: user.count,
      //     })),
      //     assignedTo: filterCounts.assignedTo.map((user) => ({
      //       userId: user.userId,
      //       name: user.name,
      //       count: user.count,
      //     })),
      //     teamOwners: filterCounts.teamOwners.map((owner) => ({
      //       userId: owner.userId,
      //       name: owner.name,
      //       count: owner.count,
      //     })),
      //     brands: filterCounts.brands.map((brand) => ({
      //       brandId: brand.brandId,
      //       name: brand.name,
      //       count: brand.count,
      //     })),
      //     inventories: filterCounts.inventories.map((inventory) => ({
      //       inventoryId: inventory.inventoryId,
      //       name: inventory.name,
      //       count: inventory.count,
      //     })),
      //     events: filterCounts.events.map((event) => ({
      //       eventId: event.eventId,
      //       name: event.name,
      //       count: event.count,
      //     })),
      //     dueDates: [
      //       { type: "All", count: filterCounts.totalCount },
      //       {
      //         type: "Upcoming",
      //         count:
      //           filterCounts.dueDates.find((d) => d.type === "upcoming")
      //             ?.count || 0,
      //       },
      //       {
      //         type: "Overdue",
      //         count:
      //           filterCounts.dueDates.find((d) => d.type === "overdue")
      //             ?.count || 0,
      //       },
      //     ],
      //   },
      // });

      return res.status(HttpStatusCode.OK).json({
        filterCounts,
      });
    } catch (error) {
      logger.error("Error while retrieving filters", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving filters",
      });
    }
  }
}
