import { TaskService } from "../../../src/services";
import { Task } from "../../../src/entities/Task/taskEntity";
import { AppDataSource } from "../../../src/config/data-source";

describe("Task Service", () => {
  let taskService: TaskService;

  const mockTaskRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockUserRepo = {
    findOne: jest.fn(),
    findBy: jest.fn(),
  };

  const mockAssignedPersonRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockQuerryRunnerRepo = {
    manager: {
      save: jest.fn(),
    },
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "dev";
  });

  beforeEach(() => {
    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity.name === "Task") {
        return mockTaskRepo;
      }
      if (entity.name === "User") {
        return mockUserRepo;
      }
    });
    taskService = new TaskService(AppDataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("should create the task", () => {
    it("should create the task", async () => {});
  });
});
