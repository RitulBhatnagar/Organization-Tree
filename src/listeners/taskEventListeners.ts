import { TaskHistoryService } from "../services/v1/taskHistory.service";
import {
  TASK_CREATED,
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_UPDATED,
  COMMENT_ADDED,
  COMMENT_DELETED,
  COMMENT_UPDATED,
  COLLABORATOR_ADDED,
  COLLABORATOR_REMOVED,
} from "../events/events";

import { eventEmitter } from "../utils/eventEmitter";
import { Task } from "../entities/Task/taskEntity";
import { User } from "../entities/user/userEntity";
import logger from "../utils/logger";
import { TaskAnalyticsService } from "../services/v1/taskAnalytics.service";
import { NotificationService } from "../services/v1/notification.service";
import { AssignedPerson } from "../entities/AssignedPerson/assignedPersonEntity";
import { Collaborators } from "../entities/Collaborators/collaboratorsEntity";

const notificationService = new NotificationService();
const taskHistoryService = new TaskHistoryService();
const taskAnalyticsService = new TaskAnalyticsService();

eventEmitter.on(
  "TASK_CREATED",
  async (task: Task, creator: User, assignedPersons: User[]) => {
    logger.info(
      `TASK_CREATED event triggered for task ${task.taskId} by ${creator.name}`
    );
    // CREATE TASK HISTORY
    try {
      await taskHistoryService.createTaskHistory(
        task,
        creator,
        `${creator.name} has created the task`
      );
      logger.info(
        `Task ${task.taskId} has been created by user ${creator.name}`
      );
    } catch (error) {
      logger.error(`Error handling TASK_UPDATED event`, error);
    }

    // UPDATE TASK ANALYTICS
    try {
      await taskAnalyticsService.updateTaskAnalytics();
      logger.info(`TaskAnalytics has been updated`);
    } catch (error) {
      logger.error(`Error handling taskAnalytics`, error);
    }

    // SEND NOTIFICATIONS TO ASSIGNED USERS
    try {
      await Promise.all(
        assignedPersons.map((person) =>
          notificationService.sendNotification(
            `${creator.name} has assigned you the task ${task.name}, taskId is ${task.taskId}`,
            person
          )
        )
      );
      logger.info(
        `Notifications sent for task ${task.taskId} to assigned users.`
      );
    } catch (error) {
      logger.error(
        `Error sending notifications for task ${task.taskId}`,
        error
      );
    }
  }
);

eventEmitter.on(
  TASK_UPDATED,
  async (
    task: Task,
    updatedBy: User,
    assignedPersonRemove: AssignedPerson[],
    assignedPersonAdd: AssignedPerson[]
  ) => {
    try {
      await taskHistoryService.createTaskHistory(
        task,
        updatedBy,
        `${updatedBy.name} has updated the task`
      );
      logger.info(
        `Task ${task.taskId} has been updated by user ${updatedBy.name}`
      );
    } catch (error) {
      logger.error(`Error handling TASK_UPDATED event`, error);
    }

    try {
      await taskAnalyticsService.updateTaskAnalytics();
      logger.info(`TaskAnalytics has been updated`);
    } catch (error) {
      logger.error(`Error handling taskAnalytics`, error);
    }

    try {
      await Promise.all(
        assignedPersonRemove.map((person) =>
          notificationService.sendNotification(
            `${updatedBy.name} has removed you from the task ${task.name}, taskId is ${task.taskId}`,
            person.user
          )
        )
      );
      logger.info(
        `Notifications sent for task ${task.taskId} to removed users.`
      );
    } catch (error) {
      logger.error(
        `Error sending notifications for task ${task.taskId}`,
        error
      );
    }

    try {
      await Promise.all(
        assignedPersonAdd.map((person) =>
          notificationService.sendNotification(
            `${updatedBy.name} has added in the task ${task.name}, taskId is ${task.taskId}`,
            person.user
          )
        )
      );
      logger.info(`Notifications sent for task ${task.taskId} to added users.`);
    } catch (error) {
      logger.error(
        `Error sending notifications for task ${task.taskId}`,
        error
      );
    }
  }
);

eventEmitter.on(TASK_COMPLETED, async (task: Task, completedBy: User) => {
  logger.info("TASK_COMPLETED event triggered for task " + task.taskId);
  try {
    await taskHistoryService.createTaskHistory(
      task,
      completedBy,
      `${completedBy.name} has changed the status to completed`
    );
    logger.info(
      `Task ${task.taskId} marked as completed by user ${completedBy.userId}`
    );
  } catch (error) {
    logger.error("Error handling TASK_COMPLETED event:", error);
  }

  try {
    await taskAnalyticsService.updateTaskAnalytics();
    logger.info(`TaskAnalytics has been updated`);
  } catch (error) {
    logger.error(`Error handling taskAnalytics`, error);
  }

  try {
    await notificationService.sendNotification(
      `${completedBy.name} has completed the task ${task.name}, taskId is ${task.taskId}`,
      task.creator
    );
  } catch (error) {
    logger.error(`Error sending notifications for task ${task.taskId}`, error);
  }
});

eventEmitter.on(
  TASK_DELETED,
  async (task: Task, deletedBy: User, assignedPersons: AssignedPerson[]) => {
    logger.info(
      `Task ${task.taskId} has been deleted by user ${deletedBy.name}`
    );
    try {
      await taskAnalyticsService.updateTaskAnalytics();
      logger.info(`TaskAnalytics has been updated after task deletion`);
    } catch (error) {
      logger.error(`Error updating task analytics after deletion`, error);
    }

    try {
      if (assignedPersons.length === 0) return;
      await Promise.all(
        assignedPersons.map((person) =>
          notificationService.sendNotification(
            `${deletedBy.name} has deleted the task ${task.name}, taskId is ${task.taskId}`,
            person.user
          )
        )
      );
      logger.info(
        `Notifications sent for task ${task.taskId} to assigned users.`
      );
    } catch (error) {
      logger.error(
        `Error sending notifications for task ${task.taskId}`,
        error
      );
    }
  }
);

eventEmitter.on("COMMENT_ADDED", async (task: Task, addedBy: User) => {
  logger.info("Comment added event has been triggered");

  try {
    await taskHistoryService.createTaskHistory(
      task,
      addedBy,
      `${addedBy.name} has added a comment`
    );
    logger.info("Task history has been added for the comment");
  } catch (error) {
    logger.error("Error handling COMMENT_ADDED event:", error);
  }
});
eventEmitter.on(COMMENT_DELETED, async (task: Task, deleteBy: User) => {
  try {
    await taskHistoryService.createTaskHistory(
      task,
      deleteBy,
      `${deleteBy.name} has deleted the comment`
    );
  } catch (error) {
    logger.error("Error handling COMMENT_ADDED event:", error);
  }
});

eventEmitter.on(COMMENT_UPDATED, async (task: Task, updatedBy: User) => {
  logger.info("Comment updated event has been triggered");

  try {
    await taskHistoryService.createTaskHistory(
      task,
      updatedBy,
      `comment got updated by ${updatedBy.name}`
    );
    logger.info("Task history has been added for the COMMENT_UPDATED event");
  } catch (error) {
    logger.error("Error handling COMMENT_ADDED event:", error);
  }
});

eventEmitter.on(
  COLLABORATOR_ADDED,
  async (
    task: Task,
    addedBy: User,
    names: string[],
    collaborators: Collaborators[]
  ) => {
    logger.info("Collaborator added event has been triggered");

    try {
      await taskHistoryService.createTaskHistory(
        task,
        addedBy,
        `${addedBy.name} has added ${names} as collaborators

    }`
      );
      logger.info(
        "Task history has been added for the COLLABORATOR_ADDED event"
      );
    } catch (error) {
      logger.error("Error handling COLLABORATOR_ADDED event:", error);
    }

    try {
      await Promise.all(
        collaborators.map((collaborator) =>
          notificationService.sendNotification(
            `${addedBy.name} has added you as a collaborator to the task ${task.name}, taskId is ${task.taskId}`,
            collaborator.user
          )
        )
      );
      logger.info(
        `Notifications sent for task ${task.taskId} to added collaborators.`
      );
    } catch (error) {
      logger.error(
        "Error sending notifications for COLLABORATOR_ADDED event",
        error
      );
    }
  }
);

eventEmitter.emit(
  COLLABORATOR_REMOVED,
  async (
    task: Task,
    removedBy: User,
    names: string[],
    removedUsers: User[]
  ) => {
    logger.info("Collaborator removed event has been triggered");

    try {
      await taskHistoryService.createTaskHistory(
        task,
        removedBy,
        `${removedBy.name} has removed ${names} as collaborators`
      );
      logger.info(
        "Task history has been added for the COLLABORATOR_REMOVED event"
      );
    } catch (error) {
      logger.error("Error handling COLLABORATOR_REMOVED event:", error);
    }

    try {
      await Promise.all(
        removedUsers.map((user) =>
          notificationService.sendNotification(
            `${removedBy.name} has removed you as a collaborator to the task ${task.name}, taskId is ${task.taskId}`,
            user
          )
        )
      );
      logger.info(
        `Notifications sent for task ${task.taskId} to removed collaborators.`
      );
    } catch (error) {
      logger.error(
        "Error sending notifications for COLLABORATOR_REMOVED event",
        error
      );
    }
  }
);
