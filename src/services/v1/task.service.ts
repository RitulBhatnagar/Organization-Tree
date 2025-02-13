import { In, DataSource, Repository } from "typeorm";
import {
  CompletedStatusEnum,
  Task,
  TaskTypeEnum,
} from "../../entities/Task/taskEntity";
import { Brand } from "../../entities/Brand/brandEntity";
import { User } from "../../entities/user/userEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { AssignedPerson } from "../../entities/AssignedPerson/assignedPersonEntity";
import { Event } from "../../entities/Event/eventEntity";
import { Inventory } from "../../entities/Inventory/inventoryEntity";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";
import { eventEmitter } from "../../utils/eventEmitter";
import {
  TASK_COMPLETED,
  TASK_CREATED,
  TASK_DELETED,
  TASK_UPDATED,
} from "../../events/events";
import { TaskDTO } from "../../dtos/taskDto";
import {
  FilterCounts,
  FilterParams,
  PaginationParams,
  taskFilters,
} from "../../types";

export class TaskService {
  private taskRepo: Repository<Task>;
  private userRepo: Repository<User>;
  private assignPersonRepo: Repository<AssignedPerson>;
  private brandRepository: Repository<Brand>;
  private eventRepository: Repository<Event>;
  private inventoryRepository: Repository<Inventory>;

  constructor(private dataSource: DataSource) {
    this.taskRepo = dataSource.getRepository(Task);
    this.userRepo = dataSource.getRepository(User);
    this.assignPersonRepo = dataSource.getRepository(AssignedPerson);
    this.brandRepository = dataSource.getRepository(Brand);
    this.eventRepository = dataSource.getRepository(Event);
    this.inventoryRepository = dataSource.getRepository(Inventory);
  }
  async createTask(
    name: string,
    description: string,
    taskType: TaskTypeEnum,
    dueDate: Date,
    creatorId: string,
    assignPersonIds: string[],
    relatedEntityId?: string
  ) {
    const queryRunner = this.taskRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Fetch creator and assigned users in a single query
      const [creator, assignedUsers] = await Promise.all([
        this.userRepo.findOne({ where: { userId: creatorId } }),
        this.userRepo.findBy({
          userId: In(assignPersonIds),
        }),
      ]);

      if (!creator) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Creator not found"
        );
      }

      if (assignedUsers.length !== assignPersonIds.length) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "One or more assigned users not found"
        );
      }

      // Pre-check related entity before creating the task
      let relatedEntity = null;
      if (relatedEntityId && taskType !== TaskTypeEnum.GENERAL) {
        relatedEntity = await this.getRelatedEntity(taskType, relatedEntityId);
      }
      // Create task instance with optional related entity fields
      const task = this.taskRepo.create({
        name,
        description,
        dueDate,
        taskType,
        creator,
        relatedBrand: taskType === TaskTypeEnum.BRAND ? relatedEntity : null,
        relatedEvent: taskType === TaskTypeEnum.EVENT ? relatedEntity : null,
        relatedInventory:
          taskType === TaskTypeEnum.INVENTORY ? relatedEntity : null,
      });

      // Save the task
      const savedTask = await queryRunner.manager.save(task);

      // Batch insert assigned persons
      const assignedPersons = assignedUsers.map((user) =>
        this.assignPersonRepo.create({ user, task: savedTask })
      );
      await queryRunner.manager.save(assignedPersons);

      logger.info("Emitting TASK_CREATED event");
      eventEmitter.emit(TASK_CREATED, savedTask, creator, assignedUsers);

      await queryRunner.commitTransaction();
      // Emit event and return task
      logger.info("Task Created successfully");

      return savedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error("Error while creating the task", error);

      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while creating task"
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to fetch related entities
  private async getRelatedEntity(
    taskType: TaskTypeEnum,
    relatedEntityId: string
  ) {
    switch (taskType) {
      case TaskTypeEnum.BRAND:
        return this.brandRepository.findOne({
          where: { brandId: relatedEntityId },
        });
      case TaskTypeEnum.EVENT:
        return this.eventRepository.findOne({
          where: { eventId: relatedEntityId },
        });
      case TaskTypeEnum.INVENTORY:
        return this.inventoryRepository.findOne({
          where: { inventoryId: relatedEntityId },
        });
      default:
        throw new APIError(
          ErrorCommonStrings.BAD_REQUEST,
          HttpStatusCode.BAD_REQUEST,
          false,
          "Invalid task type for related entity"
        );
    }
  }

  async getTask(taskId: string) {
    try {
      const task = await this.taskRepo.findOne({
        where: { taskId },
        relations: [
          "assignedPersons",
          "assignedPersons.user",
          "creator",
          "relatedEvent",
          "relatedBrand",
          "relatedInventory",
        ],
      });
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }
      return TaskDTO.fromEntity(task);
    } catch (error) {
      logger.error("Error in getting tasks", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting task"
      );
    }
  }

  private sanitizeTask(task: Task): any {
    return {
      taskId: task.taskId,
      name: task.name,
      description: task.description,
      taskType: task.taskType,
      completedStatus: task.completedStatus,
      visibility: task.visibility,
      dueDate: task.dueDate,
      finishedDate: task.finishedDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      creator: task.creator
        ? {
            userId: task.creator.userId,
            name: task.creator.name,
          }
        : null,
      assignedPersons: task.assignedPersons
        ? task.assignedPersons.map((ap) => ({
            assignedPersonId: ap.assignedPersonId,
            user: {
              userId: ap.user.userId,
              name: ap.user.name,
            },
          }))
        : [],
      relatedBrand: task.relatedBrand
        ? {
            brandId: task.relatedBrand.brandId,
            brandName: task.relatedBrand.brandName,
          }
        : null,
      relatedEvent: task.relatedEvent
        ? {
            eventId: task.relatedEvent.eventId,
            name: task.relatedEvent.name,
          }
        : null,
      relatedInventory: task.relatedInventory
        ? {
            inventoryId: task.relatedInventory.inventoryId,
            name: task.relatedInventory.name,
          }
        : null,
    };
  }

  async updateTask(
    taskId: string,
    name: string,
    description: string,
    taskType: TaskTypeEnum,
    dueDate: Date,
    creatorId: string,
    assignPersonRemoveId: string[],
    assignPersonAddId: string[],
    relatedEntityId: string
  ) {
    const queryRunner = this.taskRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const task = await this.taskRepo.findOne({
        where: { taskId },
        relations: [
          "assignedPersons",
          "assignedPersons.user",
          "creator",
          "relatedBrand",
          "relatedEvent",
          "relatedInventory",
        ],
      });
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      const changes: Record<string, { oldValue: any; newValue: any }> = {};
      if (name !== task.name) {
        changes.name = { oldValue: task.name, newValue: name };
        task.name = name;
      }
      if (description !== task.description) {
        changes.description = {
          oldValue: task.description,
          newValue: description,
        };
        task.description = description;
      }
      if (dueDate.getTime() !== task.dueDate.getTime()) {
        changes.dueDate = { oldValue: task.dueDate, newValue: dueDate };
        task.dueDate = dueDate;
      }

      // Update task type and related entity
      if (taskType !== task.taskType || relatedEntityId) {
        changes.taskType = { oldValue: task.taskType, newValue: taskType };
        task.taskType = taskType;

        // Clear existing related entities
        task.relatedBrand = null;
        task.relatedEvent = null;
        task.relatedInventory = null;

        if (relatedEntityId) {
          const relatedEntity = await this.getRelatedEntity(
            taskType,
            relatedEntityId
          );
          if (!relatedEntity) {
            throw new APIError(
              ErrorCommonStrings.NOT_FOUND,
              HttpStatusCode.NOT_FOUND,
              false,
              `Related ${taskType.toLowerCase()} not found`
            );
          }

          switch (taskType) {
            case TaskTypeEnum.BRAND:
              if (relatedEntity instanceof Brand) {
                task.relatedBrand = relatedEntity;
              }
              break;
            case TaskTypeEnum.EVENT:
              if (relatedEntity instanceof Event) {
                task.relatedEvent = relatedEntity;
              }
              break;
            case TaskTypeEnum.INVENTORY:
              if (relatedEntity instanceof Inventory) {
                task.relatedInventory = relatedEntity;
              }
              break;
          }

          changes.relatedEntity = {
            oldValue: null, // You might want to store the old related entity here if needed
            newValue: relatedEntity,
          };
        }
      }

      // Update assigned persons

      let assignedPersonRemove: AssignedPerson[] = [];
      let assignedPersonAdd: AssignedPerson[] = [];

      if (assignPersonRemoveId.length > 0) {
        console.log("assignPersonRemoveId", assignPersonRemoveId);
        assignedPersonRemove = await this.assignPersonRepo.find({
          where: { assignedPersonId: In(assignPersonRemoveId) },
          relations: ["user"],
        });

        if (assignedPersonRemove.length !== assignPersonRemoveId.length) {
          throw new APIError(
            ErrorCommonStrings.NOT_FOUND,
            HttpStatusCode.NOT_FOUND,
            false,
            "Assigned person that you want to remove not found"
          );
        }

        task.assignedPersons = task.assignedPersons.filter(
          (ap) =>
            !assignedPersonRemove.some(
              (remove) => remove.assignedPersonId === ap.assignedPersonId
            )
        );

        await this.assignPersonRepo.remove(assignedPersonRemove);
      }

      if (assignPersonAddId.length > 0) {
        console.log("assignPersonAddId", assignPersonAddId);
        const assignedUsers = await this.userRepo.find({
          where: { userId: In(assignPersonAddId) },
        });

        console.log("assignedUsers", assignedUsers);
        for (const user of assignedUsers) {
          const newAssignedPerson = this.assignPersonRepo.create({
            user,
            task,
          });
          assignedPersonAdd.push(newAssignedPerson);
          task.assignedPersons.push(newAssignedPerson);
        }

        console.log("assignedPersonAdd", assignedPersonAdd);
        await this.assignPersonRepo.save(assignedPersonAdd);
      }

      task.assignedPersons = [...task.assignedPersons, ...assignedPersonAdd];

      const updatedTask = await this.taskRepo.save(task);

      const creator = await this.userRepo.findOne({
        where: { userId: creatorId },
      });

      if (!creator) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Creator not found"
        );
      }

      if (Object.keys(changes).length > 0) {
        const sanitizedTask = this.sanitizeTask(updatedTask);
        const sanitizedCreator = { userId: creator.userId, name: creator.name };
        const sanitizedAssignedPersonRemove = assignedPersonRemove.map(
          (ap) => ({
            assignedPersonId: ap.assignedPersonId,
            user: { userId: ap.user.userId, name: ap.user.name },
          })
        );
        const sanitizedAssignedPersonAdd = assignedPersonAdd.map((ap) => ({
          assignedPersonId: ap.assignedPersonId,
          user: { userId: ap.user.userId, name: ap.user.name },
        }));

        eventEmitter.emit(
          TASK_UPDATED,
          sanitizedTask,
          sanitizedCreator,
          sanitizedAssignedPersonRemove,
          sanitizedAssignedPersonAdd
        );
      }
      await queryRunner.commitTransaction();
      return this.sanitizeTask(updatedTask);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating task"
      );
    } finally {
      await queryRunner.release();
    }
  }

  async markTaskCompleted(taskId: string, userId: string) {
    try {
      const task = await this.taskRepo.findOne({
        where: { taskId },
        relations: ["assignedPersons", "assignedPersons.user", "creator"],
      });
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      const assignedPerson = await this.assignPersonRepo.findOne({
        where: { user: { userId } },
        relations: ["user"],
      });
      if (!assignedPerson) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "assigned person not found"
        );
      }

      const check = task.assignedPersons.some(
        (ap) => ap.user.userId === userId
      );

      if (!check) {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          false,
          "You are not allowed to change the task status"
        );
      }
      task.completedStatus = CompletedStatusEnum.COMPLETED;
      task.finishedDate = new Date();
      await this.taskRepo.save(task);

      eventEmitter.emit(TASK_COMPLETED, task, assignedPerson.user);

      return task;
    } catch (error) {
      logger.error("Error while marking the task completed", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while marking the task completed"
      );
    }
  }

  async deleteTask(taskId: string, userId: string) {
    try {
      const task = await this.taskRepo.findOne({
        where: { taskId },
        relations: ["creator", "assignedPersons", "assignedPersons.user"],
      });
      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      if (task.creator.userId !== userId) {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          false,
          "You are not allowed to delete the task"
        );
      }

      await this.taskRepo.delete({ taskId });

      eventEmitter.emit(TASK_DELETED, task, task.creator, task.assignedPersons);
      return task;
    } catch (error) {
      logger.error("Error in deleting task", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while deleting the task"
      );
    }
  }
  async getTasks(filters: taskFilters, paginationParams: PaginationParams) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;

      // First, let's make sure our join and count are correct
      const queryBuilder = this.taskRepo
        .createQueryBuilder("task")
        .leftJoinAndSelect("task.creator", "creator")
        .leftJoinAndSelect("task.assignedPersons", "assignedPersons")
        .leftJoinAndSelect("assignedPersons.user", "assignedUser")
        .leftJoinAndSelect("task.relatedBrand", "brand")
        .leftJoinAndSelect("task.relatedEvent", "event")
        .leftJoinAndSelect("task.relatedInventory", "inventory")
        .leftJoin("task.comments", "comments")
        .select([
          "task.taskId",
          "task.name",
          "task.description",
          "task.taskType",
          "task.finishedDate",
          "task.dueDate",
          "task.completedStatus",
          "creator.userId",
          "creator.name",
          "assignedPersons.assignedPersonId",
          "assignedUser.userId",
          "brand.brandId",
          "brand.brandName",
          "event.eventId",
          "event.name",
          "inventory.inventoryId",
          "inventory.name",
        ])
        // Let's try a simpler count expression
        .loadRelationCountAndMap("task.commentCount", "task.comments");

      // Apply filters
      if (filters.taskType) {
        queryBuilder.andWhere("task.taskType = :taskType", {
          taskType: filters.taskType,
        });
      }

      // ... rest of your filter conditions ...

      const totalCount = await queryBuilder.getCount();
      queryBuilder.skip(skip).take(limit);

      const tasks = await queryBuilder.getMany();

      return {
        data: tasks,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPage: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error("Error in getting tasks", error);
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while getting tasks"
      );
    }
  }

  async getFilterCounts(filterParams: FilterParams): Promise<FilterCounts> {
    try {
      const normalizedFilters = {
        ...filterParams,
        assignedTo: filterParams.assignedTo
          ? Array.isArray(filterParams.assignedTo)
            ? filterParams.assignedTo
            : [filterParams.assignedTo]
          : undefined,
        assignedBy: filterParams.assignedBy
          ? Array.isArray(filterParams.assignedBy)
            ? filterParams.assignedBy
            : [filterParams.assignedBy]
          : undefined,
        teamOwnerId: filterParams.teamOwnerId
          ? Array.isArray(filterParams.teamOwnerId)
            ? filterParams.teamOwnerId
            : [filterParams.teamOwnerId]
          : undefined,
        brandId: filterParams.brandId
          ? Array.isArray(filterParams.brandId)
            ? filterParams.brandId
            : [filterParams.brandId]
          : undefined,
        inventoryId: filterParams.inventoryId
          ? Array.isArray(filterParams.inventoryId)
            ? filterParams.inventoryId
            : [filterParams.inventoryId]
          : undefined,
        eventId: filterParams.eventId
          ? Array.isArray(filterParams.eventId)
            ? filterParams.eventId
            : [filterParams.eventId]
          : undefined,
      };
      // Base query builder without team join
      const baseQuery = this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.creator", "creator")
        .leftJoin("task.assignedPersons", "assignedPersons")
        .leftJoin("assignedPersons.user", "user") // Changed from assignedUser to user to match entity
        .leftJoin("task.relatedBrand", "brand")
        .leftJoin("task.relatedEvent", "event")
        .leftJoin("task.relatedInventory", "inventory");

      // Apply filters
      // Apply filters using normalized values
      if (normalizedFilters.taskType) {
        baseQuery.andWhere("task.taskType = :taskType", {
          taskType: normalizedFilters.taskType,
        });
      }

      if (normalizedFilters.assignedBy?.length) {
        baseQuery.andWhere("creator.userId IN (:...assignedBy)", {
          assignedBy: normalizedFilters.assignedBy,
        });
      }

      if (normalizedFilters.assignedTo?.length) {
        baseQuery.andWhere("user.userId IN (:...assignedTo)", {
          assignedTo: normalizedFilters.assignedTo,
        });
      }

      // For team owners, we need a separate query
      if (normalizedFilters.teamOwnerId?.length) {
        baseQuery.andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select("teamMember.userId")
            .from(User, "teamMember")
            .leftJoin("teamMember.teamsMembers", "team")
            .leftJoin("team.teamOwner", "teamOwner")
            .where("teamOwner.userId IN (:...teamOwnerIds)", {
              teamOwnerIds: normalizedFilters.teamOwnerId,
            })
            .getQuery();
          return "user.userId IN " + subQuery;
        });
      }

      // Get total count
      const totalCount = await baseQuery.getCount();

      // Get task type counts
      const taskTypeCounts = await this.taskRepo
        .createQueryBuilder("task")
        .select("task.taskType", "type")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .groupBy("task.taskType")
        .getRawMany();

      // Get assigned by counts
      const assignedByCounts = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.creator", "creator")
        .select("creator.userId", "userId")
        .addSelect("creator.name", "name")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .groupBy("creator.userId")
        .addGroupBy("creator.name")
        .getRawMany();

      // Get assigned to counts
      const assignedToCounts = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.assignedPersons", "assignedPersons")
        .leftJoin("assignedPersons.user", "user")
        .select("user.userId", "userId")
        .addSelect("user.name", "name")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .groupBy("user.userId")
        .addGroupBy("user.name")
        .getRawMany();

      // Get team owner counts
      const teamOwnerCounts = await this.userRepo
        .createQueryBuilder("user")
        .leftJoin("user.ownedTeams", "ownedTeams")
        .select("user.userId", "userId")
        .addSelect("user.name", "name")
        .addSelect("COUNT(DISTINCT ownedTeams.teamId)", "count")
        .where("ownedTeams.teamId IS NOT NULL")
        .groupBy("user.userId")
        .addGroupBy("user.name")
        .getRawMany();

      // Get brand counts
      const brandCounts = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.relatedBrand", "brand")
        .select("brand.brandId", "brandId")
        .addSelect("brand.brandName", "name")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .where("brand.brandId IS NOT NULL")
        .groupBy("brand.brandId")
        .addGroupBy("brand.brandName")
        .getRawMany();

      // Get inventory counts
      const inventoryCounts = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.relatedInventory", "inventory")
        .select("inventory.inventoryId", "inventoryId")
        .addSelect("inventory.name", "name")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .where("inventory.inventoryId IS NOT NULL")
        .groupBy("inventory.inventoryId")
        .addGroupBy("inventory.name")
        .getRawMany();

      // Get event counts
      const eventCounts = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoin("task.relatedEvent", "event")
        .select("event.eventId", "eventId")
        .addSelect("event.name", "name")
        .addSelect("COUNT(DISTINCT task.taskId)", "count")
        .where("event.eventId IS NOT NULL")
        .groupBy("event.eventId")
        .addGroupBy("event.name")
        .getRawMany();

      // Calculate due date counts
      const currentDate = new Date();
      const dueDateCounts = await this.taskRepo
        .createQueryBuilder("task")
        .select(
          "CASE WHEN task.dueDate > :currentDate THEN :upcoming ELSE :overdue END",
          "type"
        )
        .addSelect("COUNT(task.taskId)", "count")
        .setParameter("currentDate", currentDate)
        .setParameter("upcoming", "upcoming")
        .setParameter("overdue", "overdue")
        .groupBy("type")
        .getRawMany();
      return {
        totalCount,
        taskTypes: [
          { type: "All", count: totalCount },
          {
            type: "General Service",
            count: Number(
              taskTypeCounts.find((t) => t.type === "GENERAL").count || 0
            ),
          },
          {
            type: "Brand",
            count: Number(
              taskTypeCounts.find((t) => t.type === "BRAND").count || 0
            ),
          },
          {
            type: "Event",
            count: Number(
              taskTypeCounts.find((t) => t.type === "EVENT")?.count || 0
            ),
          },
          {
            type: "Inventory",
            count: Number(
              taskTypeCounts.find((t) => t.type === "INVENTORY")?.count || 0
            ),
          },
        ],
        assignedBy: assignedByCounts.map((user) => ({
          userId: user.userId,
          name: user.name,
          count: Number(user.count),
        })),
        assignedTo: assignedToCounts.map((user) => ({
          userId: user.userId,
          name: user.name,
          count: Number(user.count),
        })),
        teamOwners: teamOwnerCounts.map((owner) => ({
          userId: owner.userId,
          name: owner.name,
          count: Number(owner.count),
        })),
        brands: brandCounts.map((brand) => ({
          brandId: brand.brandId,
          name: brand.name,
          count: Number(brand.count),
        })),
        inventories: inventoryCounts.map((inventory) => ({
          inventoryId: inventory.inventoryId,
          name: inventory.name,
          count: Number(inventory.count),
        })),
        events: eventCounts.map((event) => ({
          eventId: event.eventId,
          name: event.name,
          count: Number(event.count),
        })),
        dueDates: [
          { type: "All", count: totalCount },
          {
            type: "Upcoming",
            count: Number(
              dueDateCounts.find((d) => d.type === "upcoming")?.count
            ),
          },
          {
            type: "Overdue",
            count: Number(
              dueDateCounts.find((d) => d.type === "overdue")?.count
            ),
          },
        ],
      };
    } catch (error) {
      logger.error("Error in getting filter counts", error);
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while getting filter counts"
      );
    }
  }
}
