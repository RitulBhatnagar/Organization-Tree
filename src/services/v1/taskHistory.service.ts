import { AppDataSource } from "../../config/data-source";
import { Task } from "../../entities/Task/taskEntity";
import { TaskHistory } from "../../entities/TaskHistory/taskHistoryEntity";
import { User } from "../../entities/user/userEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { PaginationParams } from "../../types";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";

export class TaskHistoryService {
  private taskHistoryrepo = AppDataSource.getRepository(TaskHistory);
  async createTaskHistory(task: Task, user: User, action: string) {
    const taskHistory = new TaskHistory();
    taskHistory.task = task;
    taskHistory.user = user;
    taskHistory.action = action;
    await taskHistory.save();
  }
  async getTaskHistoryByTaskId(
    taskId: string,
    paginationParams: PaginationParams
  ) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;
      const [taskHistory, total] = await this.taskHistoryrepo.findAndCount({
        where: {
          task: { taskId: taskId },
        },
        select: {
          action: true,
          createdAt: true,
          updatedAt: true,
          historyId: true,
        },
        order: { createdAt: "DESC" },
        take: limit,
        skip: skip,
      });
      if (!taskHistory) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task history not found for the task"
        );
      }

      return {
        data: taskHistory,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(
        `Error while finding the task histories for the task ${error}`
      );
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error finding the task histories for the task"
      );
    }
  }
}
