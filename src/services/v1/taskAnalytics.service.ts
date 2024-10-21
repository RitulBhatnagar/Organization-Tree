import { start } from "repl";
import { AppDataSource } from "../../config/data-source";
import {
  Task,
  TaskTypeEnum,
  CompletedStatusEnum,
} from "../../entities/Task/taskEntity";
import { TaskAnalytics } from "../../entities/TaskAnalytics/taskAnaylticsEntity";
import { Between, MoreThan } from "typeorm";
export class TaskAnalyticsService {
  private taskAnalyticsRepo = AppDataSource.getRepository(TaskAnalytics);
  private taskRepo = AppDataSource.getRepository(Task);
  async updateTaskAnalytics() {
    const taskAnalytics = await this.taskAnalyticsRepo.find({
      order: { createdAt: "DESC" },
      take: 1,
    });
    const [tasks, total] = await Task.findAndCount();

    const tasksGroupedByTypeAndStatus = await this.taskRepo
      .createQueryBuilder("task")
      .select([
        "task.taskType",
        "task.completedStatus",
        "COUNT(task.taskId) as count",
      ])
      .groupBy("task.taskType, task.completedStatus")
      .getRawMany();

    const brandRelatedTasks = tasksGroupedByTypeAndStatus.filter(
      (t) => t.taskType === TaskTypeEnum.BRAND
    ).length;
    const eventRelatedTasks = tasksGroupedByTypeAndStatus.filter(
      (t) => t.taskType === TaskTypeEnum.EVENT
    ).length;
    const generalServiceTasks = tasksGroupedByTypeAndStatus.filter(
      (t) => t.taskType === TaskTypeEnum.GENERAL
    ).length;
    const inventoryRelatedTasks = tasksGroupedByTypeAndStatus.filter(
      (t) => t.taskType === TaskTypeEnum.INVENTORY
    ).length;
    const completedTasks = tasksGroupedByTypeAndStatus.filter(
      (t: Task) => t.completedStatus === CompletedStatusEnum.COMPLETED
    ).length;
    const overdueTasks = tasksGroupedByTypeAndStatus.filter(
      (t: Task) => t.completedStatus === CompletedStatusEnum.OVERDUE
    ).length;
    const openTasks = tasksGroupedByTypeAndStatus.filter(
      (t: Task) => t.completedStatus === CompletedStatusEnum.OPEN
    ).length;

    console.log("openTasks:", openTasks);

    if (taskAnalytics.length === 0) {
      const newTaskAnalytics = this.taskAnalyticsRepo.create({
        totalTasksCreated: tasks.length,
        completedTasks,
        openTasks,
        overdueTasks,
        generalServiceTasks,
        brandRelatedTasks,
        eventRelatedTasks,
        inventoryRelatedTasks,
      });
      await this.taskAnalyticsRepo.save(newTaskAnalytics);
      return newTaskAnalytics;
    }

    const latestAnalytics = taskAnalytics[0]; // Get the first item from the array
    latestAnalytics.totalTasksCreated = tasks.length;
    latestAnalytics.completedTasks = completedTasks;
    latestAnalytics.openTasks = openTasks;
    latestAnalytics.overdueTasks = overdueTasks;
    latestAnalytics.generalServiceTasks = generalServiceTasks;
    latestAnalytics.brandRelatedTasks = brandRelatedTasks;
    latestAnalytics.eventRelatedTasks = eventRelatedTasks;
    latestAnalytics.inventoryRelatedTasks = inventoryRelatedTasks;

    await this.taskAnalyticsRepo.save(latestAnalytics); // Save the updated latestAnalytics instead of taskAnalytics
    return latestAnalytics;
  }

  async getTaskAnalytics(filter: string) {
    const { startDate, endDate } = this.calculateDateRange(filter);

    const whereClause = endDate
      ? {
          createdAt: Between(startDate, endDate),
        }
      : { createdAt: MoreThan(startDate) };

    return this.taskAnalyticsRepo.find({
      where: whereClause,
      order: { createdAt: "DESC" },
    });
  }

  private calculateDateRange(filter: string): {
    startDate: Date;
    endDate?: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date | undefined = undefined;

    switch (filter) {
      case "Today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "Last 3 Days":
        startDate = new Date(now.setDate(now.getDate() - 2));
        break;
      case "Last 7 Days":
        startDate = new Date(now.setDate(now.getDate() - 6));
        break;
      case "Last 15 Days":
        startDate = new Date(now.setDate(now.getDate() - 14));
        break;
      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "All Time":
        startDate = new Date(0);
        break;
      default:
        throw new Error("Invalid filter");
    }

    return { startDate, endDate };
  }
}
