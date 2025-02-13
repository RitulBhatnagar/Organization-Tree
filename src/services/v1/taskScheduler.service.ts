import {
  CompletedStatusEnum,
  Task,
  TaskTypeEnum,
} from "../../entities/Task/taskEntity";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/user/userEntity";
import { NotificationService } from "./notification.service";
import logger from "../../utils/logger"; // Make sure to import your logger

const notificationService = new NotificationService();

export const taskSchedulerService = {
  async checkTasks() {
    logger.info("Starting checkTasks process");

    const taskRepo = AppDataSource.getRepository(Task);
    const userRepo = AppDataSource.getRepository(User);

    // Get current date
    const currentDate = new Date();
    logger.info(`Current date: ${currentDate}`);

    // Find tasks with due date in the next 12 hours
    logger.info("Fetching upcoming tasks for the next 12 hours");
    const upcomingTasks = await taskRepo
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignedPersons", "assignedPersons")
      .where("task.dueDate BETWEEN :start AND :end", {
        start: currentDate,
        end: new Date(currentDate.getTime() + 12 * 60 * 60 * 1000), // 12 hours later
      })
      .getMany();

    logger.info(`Found ${upcomingTasks.length} upcoming tasks`);

    for (const task of upcomingTasks) {
      logger.info(
        `Processing upcoming task: ${task.name} (ID: ${task.taskId})`
      );
      for (const assigned of task.assignedPersons) {
        logger.debug(
          `Fetching user for assigned person: ${assigned.assignedPersonId}`
        );
        const user = await userRepo.findOneBy({ userId: assigned.user.userId });

        if (user) {
          logger.info(`Sending notification to user: ${user.userId}`);
          try {
            await notificationService.sendNotification(
              `Reminder: The task "${task.name}" is due in less than 12 hours.`,
              user
            );
            logger.info(
              `Notification sent successfully to user: ${user.userId}`
            );
          } catch (error) {
            logger.error(
              `Failed to send notification to user: ${user.userId}`,
              error
            );
          }
        } else {
          logger.warn(
            `User not found for assigned person: ${assigned.assignedPersonId}`
          );
        }
      }
    }

    // Mark tasks as overdue
    logger.info("Fetching overdue tasks");
    const overdueTasks = await taskRepo
      .createQueryBuilder("task")
      .where("task.dueDate < :currentDate", { currentDate })
      .andWhere("task.completedStatus != :overdueStatus", {
        overdueStatus: CompletedStatusEnum.OVERDUE,
      })
      .getMany();

    logger.info(`Found ${overdueTasks.length} overdue tasks`);

    for (const task of overdueTasks) {
      logger.info(`Marking task as overdue: ${task.name} (ID: ${task.taskId})`);
      task.completedStatus = CompletedStatusEnum.OVERDUE;
      try {
        await taskRepo.save(task);
        logger.info(`Successfully marked task as overdue: ${task.taskId}`);
      } catch (error) {
        logger.error(`Failed to mark task as overdue: ${task.taskId}`, error);
      }
    }

    logger.info("Completed checkTasks process");
  },
};
