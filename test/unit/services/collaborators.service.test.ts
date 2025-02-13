import { CollaboratorsService } from "../../../src/services/v1/collaborator.service";
import { User } from "../../../src/entities/user/userEntity";
import { Collaborators } from "../../../src/entities/Collaborators/collaboratorsEntity";
import { Task } from "../../../src/entities/Task/taskEntity";
import { AppDataSource } from "../../../src/config/data-source";
import { PaginationParams } from "../../../src/types";
import { In } from "typeorm";

type MockRepository<T> = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  findAndCount: jest.Mock;
  delete: jest.Mock;
};

const createMockRepository = (): MockRepository<any> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  delete: jest.fn(),
});

describe("CollaboratorsService Test", () => {
  let collaboratorsService: CollaboratorsService;
  let mockTaskRepo: MockRepository<Task>;
  let mockUserRepo: MockRepository<User>;
  let mockCollaboratorsRepo: MockRepository<Collaborators>;

  beforeEach(() => {
    // Create mock repositories
    mockTaskRepo = createMockRepository();
    mockUserRepo = createMockRepository();
    mockCollaboratorsRepo = createMockRepository();

    // Mock AppDataSource.getRepository calls
    jest.spyOn(AppDataSource, "getRepository").mockImplementation((entity) => {
      if (entity === Task) return mockTaskRepo as any;
      if (entity === User) return mockUserRepo as any;
      if (entity === Collaborators) return mockCollaboratorsRepo as any;
      return {} as any;
    });

    // Create service instance
    collaboratorsService = new CollaboratorsService();
  });

  describe("get collaborators tasks", () => {
    it("should get collaborators tasks", async () => {
      const userId = "6f0b812d-5079-4252-8632-70e1e43bf776";
      const paginationParams: PaginationParams = { page: 1, limit: 1 };

      // Mock user first
      const mockUser = {
        userId,
        name: "Test User",
      };

      // Mock user repository to return the user
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      // Mock task data
      const mockTaskData = {
        createdAt: new Date("2024-10-20T07:08:01.944Z"),
        updatedAt: new Date("2024-10-23T06:30:00.000Z"),
        deletedAt: null,
        taskId: "041017b5-eef1-496f-ae7d-b286a56f0dd3",
        name: "task*",
        description: "task* this has brand entity has desc",
        taskType: "BRAND",
        completedStatus: "OVERDUE",
        visibility: "ALL_TASKS",
        dueDate: new Date("2024-10-22T23:59:59.000Z"),
        finishedDate: null,
      };

      // Mock collaborator data with task relation
      const mockCollaboratorData = [
        {
          task: mockTaskData,
          user: mockUser,
          // Add any other collaborator fields your entity has
        },
      ];

      mockCollaboratorsRepo.findAndCount.mockResolvedValue([
        mockCollaboratorData,
        1,
      ]);

      const result = await collaboratorsService.getCollaboratorsTasks(
        userId,
        paginationParams
      );

      // Adjust expectation to match the actual service response
      expect(result).toEqual({
        // message: "Collaborators tasks fetched successfully",
        data: [mockTaskData], // Expecting array of tasks
        meta: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
      });

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockCollaboratorsRepo.findAndCount).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user is not found", async () => {
      const userId = "6f0b812d-5079-4252-8632-70e1e43bf776";
      const paginationParams: PaginationParams = { page: 1, limit: 10 };

      // Mock user repository to return null (user not found)
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        collaboratorsService.getCollaboratorsTasks(userId, paginationParams)
      ).rejects.toThrow("User not found");

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      // Collaborators repo should not be called if user is not found
      expect(mockCollaboratorsRepo.findAndCount).not.toHaveBeenCalled();
    });

    it("should throw error when getting collaborators tasks fails", async () => {
      const userId = "6f0b812d-5079-4252-8632-70e1e43bf776";
      const paginationParams: PaginationParams = { page: 1, limit: 10 };

      // Mock user exists
      mockUserRepo.findOne.mockResolvedValue({ userId, name: "Test User" });

      // Mock collaborators repo to throw error
      mockCollaboratorsRepo.findAndCount.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        collaboratorsService.getCollaboratorsTasks(userId, paginationParams)
      ).rejects.toThrow("Error getting collaborators tasks");

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockCollaboratorsRepo.findAndCount).toHaveBeenCalledTimes(1);
    });
  });

  describe("add collaborators", () => {
    it("should add collaborators", async () => {
      const taskId = "041017b5-eef1-496f-ae7d-b286a56f0dd3";
      const userIds = ["6f0b812d-5079-4252-8632-70e1e43bf776"];
      const adminId = "6f0b812d-5079-4252-8632-70e1e43bf776";

      // Mock task
      const mockTask = {
        taskId,
        collaborators: [],
      };

      // Mock admin
      const mockAdmin = {
        userId: adminId,
        name: "Admin User",
      };

      // Mock users
      const mockUsers = [
        { userId: "user1", name: "User 1" },
        { userId: "user2", name: "User 2" },
      ];

      // Mock collaborators
      const mockNewCollaborators = mockUsers.map((user) => ({
        user,
        task: mockTask,
      }));

      // Setup mocks
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);
      mockUserRepo.find.mockResolvedValue(mockUsers);
      mockCollaboratorsRepo.findOne.mockResolvedValue(null);
      mockCollaboratorsRepo.create.mockImplementation((entity) => entity);
      mockCollaboratorsRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity)
      );
      mockTaskRepo.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await collaboratorsService.addCollaborators(
        taskId,
        userIds,
        adminId
      );

      // Verify repository calls
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { taskId },
        relations: ["collaborators"],
      });

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: adminId },
      });

      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { userId: In(userIds) },
      });

      // Verify result
      expect(result).toEqual(mockNewCollaborators);
    });
  });

  describe("remove collaborators", () => {
    it("should remove collaborators", async () => {
      const taskId = "041017b5-eef1-496f-ae7d-b286a56f0dd3";
      const userIds = ["6f0b812d-5079-4252-8632-70e1e43bf776"];
      const adminId = "6f0b812d-5079-4252-8632-70e1e43bf776";

      // mock task with collaborators
      const mockTask = {
        taskId,
        collaborators: [
          {
            collaboratorId: "collab1",
            user: { userId: "user1", name: "User 1" },
          },
          {
            collaboratorId: "collab2",
            user: { userId: "user2", name: "User 2" },
          },
        ],
      };

      // mock admin
      const mockAdmin = {
        userId: adminId,
        name: "Admin User",
      };

      // mock users to be removed
      const mockUsers = [
        { userId: "user1", name: "user 1" },
        { userId: "user2", name: "user 2" },
      ];

      // Mock collaborators
      const mockCollaborators = mockUsers.map((user, index) => ({
        collaboratorId: `collab${index + 1}`,
        user,
        task: mockTask,
      }));

      // setup mocks
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);
      mockUserRepo.find.mockResolvedValue(mockUsers);

      mockCollaboratorsRepo.findOne.mockImplementation((options) => {
        const userId = options.where.user.userId;
        return Promise.resolve(
          mockCollaborators.find(
            (collaborator) => collaborator.user.userId === userId
          )
        );
      });

      mockCollaboratorsRepo.delete.mockResolvedValue({ affected: 1 });
      mockTaskRepo.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await collaboratorsService.removeCollaborators(
        taskId,
        userIds,
        adminId
      );

      // Verify result
      expect(result).toBe(true);

      // Verify repository calls
      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { taskId },
        relations: ["collaborators", "collaborators.user"],
      });

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: adminId },
      });

      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { userId: In(userIds) },
      });

      expect(mockCollaboratorsRepo.findOne).toHaveBeenCalledWith({
        where: {
          task: { taskId },
          user: { userId: expect.any(String) },
        },
        relations: ["user"],
      });

      expect(mockCollaboratorsRepo.delete).toHaveBeenCalled();
      expect(mockTaskRepo.save).toHaveBeenCalled();
    });

    it("should throw error when task is not found", async () => {
      const taskId = "invalid-task";
      const userIds = ["user1"];
      const adminId = "admin1";

      mockTaskRepo.findOne.mockResolvedValue(null);

      await expect(
        collaboratorsService.removeCollaborators(taskId, userIds, adminId)
      ).rejects.toThrow("Task not found");

      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { taskId },
        relations: ["collaborators", "collaborators.user"],
      });
    });

    it("should throw error when admin is not found", async () => {
      const taskId = "task1";
      const userIds = ["user1"];
      const adminId = "invalid-admin";

      const mockTask = { taskId, collaborators: [] };
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        collaboratorsService.removeCollaborators(taskId, userIds, adminId)
      ).rejects.toThrow("Admin not found");

      expect(mockTaskRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: adminId },
      });
    });

    it("should throw error when users are not found", async () => {
      const taskId = "task1";
      const userIds = ["invalid-user"];
      const adminId = "admin1";

      const mockTask = { taskId, collaborators: [] };
      const mockAdmin = { userId: adminId, name: "Admin" };

      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);
      mockUserRepo.find.mockResolvedValue([]);

      await expect(
        collaboratorsService.removeCollaborators(taskId, userIds, adminId)
      ).rejects.toThrow("No valid users found to remove");

      expect(mockTaskRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { userId: In(userIds) },
      });
    });

    it("should throw error when collaborator is not found", async () => {
      const taskId = "task1";
      const userIds = ["user1"];
      const adminId = "admin1";

      const mockTask = { taskId, collaborators: [] };
      const mockAdmin = { userId: adminId, name: "Admin" };
      const mockUsers = [{ userId: "user1", name: "User 1" }];

      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockUserRepo.findOne.mockResolvedValue(mockAdmin);
      mockUserRepo.find.mockResolvedValue(mockUsers);
      mockCollaboratorsRepo.findOne.mockResolvedValue(null);

      await expect(
        collaboratorsService.removeCollaborators(taskId, userIds, adminId)
      ).rejects.toThrow("Collaborator not found for userId user1");

      expect(mockTaskRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.find).toHaveBeenCalled();
      expect(mockCollaboratorsRepo.findOne).toHaveBeenCalled();
    });
  });
});
