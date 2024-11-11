import { Collaborators } from "../../entities/Collaborators/collaboratorsEntity";
import { AppDataSource } from "../../config/data-source";
import { Task } from "../../entities/Task/taskEntity";
import { User } from "../../entities/user/userEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import { In, MetadataAlreadyExistsError } from "typeorm";
import logger from "../../utils/logger";
import { eventEmitter } from "../../utils/eventEmitter";
import { COLLABORATOR_ADDED, COLLABORATOR_REMOVED } from "../../events/events";
import { PaginationParams } from "../../types";
export class CollaboratorsService {
  private collaboratorsRepo = AppDataSource.getRepository(Collaborators);
  private taskRepo = AppDataSource.getRepository(Task);
  private userRepo = AppDataSource.getRepository(User);
  async addCollaborators(taskId: string, userIds: string[], adminId: string) {
    try {
      const task = await this.taskRepo.findOne({
        where: {
          taskId: taskId,
        },
        relations: ["collaborators"],
      });
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      const admin = await this.userRepo.findOne({
        where: { userId: adminId },
      });

      if (!admin) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Admin not found"
        );
      }

      const users = await this.userRepo.find({
        where: {
          userId: In(userIds),
        },
      });

      if (users.length === 0) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }

      // create a collaborator if not exists

      const newCollaborators = [];

      for (const user of users) {
        let collaborator = await this.collaboratorsRepo.findOne({
          where: {
            task: { taskId },
            user: { userId: user.userId },
          },
        });

        if (!collaborator) {
          collaborator = this.collaboratorsRepo.create({
            user: user,
            task: task,
          });

          await this.collaboratorsRepo.save(collaborator);
          newCollaborators.push(collaborator);
        }
      }

      let names: string[] = [];

      for (const collaborator of newCollaborators) {
        names.push(collaborator.user.name);
      }

      // add collaborator to task

      task.collaborators = [...task.collaborators, ...newCollaborators];

      await this.taskRepo.save(task);

      logger.info("Emitting COLLABORATOR_ADDED event");
      eventEmitter.emit(
        COLLABORATOR_ADDED,
        task,
        admin,
        names,
        newCollaborators
      );

      return newCollaborators;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error adding collaborators"
      );
    }
  }

  async removeCollaborators(
    taskId: string,
    userIds: string[],
    adminId: string
  ) {
    try {
      // Retrieve the task along with its collaborators
      const task = await this.taskRepo.findOne({
        where: { taskId },
        relations: ["collaborators", "collaborators.user"],
      });

      // Check if the task exists
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      const admin = await this.userRepo.findOne({
        where: { userId: adminId },
      });

      if (!admin) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Admin not found"
        );
      }

      // Retrieve the list of users to be removed
      const users = await this.userRepo.find({
        where: { userId: In(userIds) },
      });

      if (users.length === 0) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "No valid users found to remove"
        );
      }

      const names: string[] = [];
      for (const user of users) {
        const collaborator = await this.collaboratorsRepo.findOne({
          where: {
            task: { taskId },
            user: { userId: user.userId },
          },
          relations: ["user"],
        });

        // Ensure collaborator exists
        if (!collaborator) {
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            `Collaborator not found for userId ${user.userId}`
          );
        }

        // Delete the collaborator record
        await this.collaboratorsRepo.delete(collaborator.collaboratorId);

        // Remove the collaborator from the task's collaborators array
        task.collaborators = task.collaborators.filter(
          (collab) => collab.user?.userId !== user.userId
        );

        // Collect user names for logging or events
        names.push(user.name);
      }

      // Save the updated task entity
      await this.taskRepo.save(task);

      // Emit event after successful collaborator removal
      logger.info("Emitting COLLABORATOR_REMOVED event");
      eventEmitter.emit(COLLABORATOR_REMOVED, task, admin, names, users);

      return true;
    } catch (error) {
      logger.error("Error in removeCollaborators service", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error removing collaborators"
      );
    }
  }

  async getCollaboratorsTasks(
    userId: string,
    paginationParams: PaginationParams
  ) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;

      const [collaboratorsEntires, total] =
        await this.collaboratorsRepo.findAndCount({
          where: { user: { userId } },
          relations: ["task"],
          skip,
          take: limit,
        });

      const tasks = collaboratorsEntires.map(
        (collaborator) => collaborator.task
      );
      if (!tasks || tasks.length === 0) {
        return [];
      }

      return {
        data: tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error getting collaborators tasks"
      );
    }
  }
}
