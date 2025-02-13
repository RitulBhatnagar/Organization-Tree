import { NotificationService } from "../../../src/services";
import { AppDataSource } from "../../../src/config/data-source";
import { PaginationParams } from "../../../src/types";

describe("NotificationService", () => {
  let notificationService: NotificationService;

  const mockInboxRepo = {
    findAndCount: jest.fn(),
    save: jest.fn(),
  };

  const messageRepo = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };
  beforeAll(async () => {
    process.env.NODE_ENV = "dev";
  });

  beforeEach(() => {
    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity.name === "Inbox") {
        return mockInboxRepo;
      }
      if (entity.name === "Message") {
        return messageRepo;
      }
      return null; // or throw an error if needed
    });

    // Initialize the service
    notificationService = new NotificationService();
  });

  describe("Get Notifications", () => {
    it("it should get notifications", async () => {
      const page = 1;
      const limit = 10;
      const paginationParams: PaginationParams = { page, limit };
      const userId = "3d178ade-0a05-4539-9ae0-23b3153e9e2c"; // Using a sample user ID

      const sampleResponse = [
        [
          {
            messages: [
              {
                messageId: "sample-uuid",
                seen: true,
                createdAt: new Date(),
                message: "Sample message",
              },
            ],
          },
        ],
        1, // Total count of records for pagination
      ];

      // Mock findAndCount to return the sample inbox with a message
      mockInboxRepo.findAndCount.mockResolvedValueOnce(sampleResponse);

      // Call the service method
      const result = await notificationService.getNotifications(
        userId,
        paginationParams
      );

      // Assertions
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page, limit, totalPages: 1 });
      result.data.forEach((notification) => {
        expect(notification).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            message: expect.any(String),
            seen: expect.any(Boolean),
            createdAt: expect.any(Date),
          })
        );
      });
    });
  });

  describe("Mark notification as seen", () => {
    it("it should mark notification as seen", async () => {
      const messageId = "18efedbd-d3f5-4011-a64d-f4391cbc7cf8";
      const mockMessage = {
        messageId,
        seen: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        message: "Sample message",
      };

      messageRepo.findOneBy.mockResolvedValueOnce(mockMessage);

      messageRepo.save.mockResolvedValueOnce({
        ...mockMessage,
        seen: true,
      });

      const result = await notificationService.markAsSeen(messageId);
      // Assertions
      expect(messageRepo.findOneBy).toHaveBeenCalledWith({ messageId });
      expect(messageRepo.save).toHaveBeenCalledWith({
        ...mockMessage,
        seen: true,
      });
      expect(result).toEqual(
        expect.objectContaining({ messageId, seen: true })
      );
    });

    it("it should throw an error if message is not found", async () => {
      const messageId = "";
      messageRepo.findOneBy.mockResolvedValueOnce(null);
    });
  });
});
