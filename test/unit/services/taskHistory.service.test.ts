import { TaskHistory } from "../../../src/entities/TaskHistory/taskHistoryEntity";
import { TaskHistoryService } from "../../../src/services";
import { AppDataSource } from "../../../src/config/data-source";
import { PaginationParams } from "../../../src/types";

describe("TaskHistoryService", () => {
  let taskHistoryService: TaskHistoryService;

  const mockHistoryRepo = {
    findAndCount: jest.fn(),
    save: jest.fn(),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "dev";
  });

  beforeEach(() => {
    // Mocking getRepository to return the mock repository
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockHistoryRepo);

    // Initialize TaskHistoryService
    taskHistoryService = new TaskHistoryService();
  });

  describe("getTaskHistoryByTaskId", () => {
    it("should get task history", async () => {
      const taskId = "a19f13cb-c37a-4393-9438-d0b9ed9cd168";
      const page = 1;
      const limit = 10;
      const paginationParams: PaginationParams = { page, limit };

      // Mocking findAndCount to return a sample response
      mockHistoryRepo.findAndCount.mockResolvedValueOnce([
        [
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            historyId: "sample-history-id",
            action: "Sample action",
          },
        ],
        1,
      ]);

      // Calling the service method
      const result = await taskHistoryService.getTaskHistoryByTaskId(
        taskId,
        paginationParams
      );

      // Assertions
      expect(result.data).toHaveLength(1); // Mocked data length
      expect(result.meta).toEqual({
        total: 1,
        page,
        limit,
        totalPages: 1,
      });

      result.data.forEach((item) => {
        expect(item).toEqual(
          expect.objectContaining({
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            historyId: expect.any(String),
            action: expect.any(String),
          })
        );
      });
    });
  });
});
