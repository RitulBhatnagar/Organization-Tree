import { UserService } from "../../../src/services";
import APIError, {
  HttpStatusCode,
} from "../../../src/middleware/errorMiddlware";
import { SimplifiedUserDTO } from "../../../src/dtos/simplifieduserdto";

// Mock the repositories
const mockUserRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
};

jest.mock("../../../src/config/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockUserRepo),
  },
}));

describe("UserService", () => {
  let userService: UserService;

  beforeAll(() => {
    process.env.NODE_ENV = "dev";
  });
  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserDetails", () => {
    it("should return user details if user is found", async () => {
      const mockUser = { userId: "1", name: "John", roles: [] };
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userService.getUserDetails("1");

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: "1" },
        relations: ["roles"],
      });
    });

    it("should throw APIError if user not found", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(userService.getUserDetails("1")).rejects.toThrow(APIError);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: "1" },
        relations: ["roles"],
      });
    });
  });

  describe("searchUser", () => {
    it("should return paginated users", async () => {
      const mockUsers = [
        {
          userId: "3d178ade-0a05-4539-9ae0-23b3153e9e2c",
          name: "user3",
          email: "user3@gmail.com",
          department: "knowledge",
        },
        {
          userId: "404c42d8-a8df-4695-a646-9a96c38c522d",
          name: "boUser",
          email: "bouser@gmail.com",
          department: "knowlege",
        },
        {
          userId: "6f0b812d-5079-4252-8632-70e1e43bf776",
          name: "user5",
          email: "user5@gmail.com",
          department: "knowledge",
        },
        {
          userId: "e884e66f-a232-4ede-b37b-c3718581a06a",
          name: "boUser2",
          email: "bouser2@gmail.com",
          department: "knowlege",
        },
        {
          userId: "f4309fbc-a16e-4a14-82e7-401b9b9f4778",
          name: "user1",
          email: "user1@gmail.com",
          department: "knowledge",
        },
      ];
      mockUserRepo.findAndCount.mockResolvedValue([
        mockUsers,
        mockUsers.length,
      ]);

      const result = await userService.searchUser("user", {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: mockUsers.map((user) => expect.any(SimplifiedUserDTO)),
        meta: {
          total: mockUsers.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should throw APIError on failure", async () => {
      mockUserRepo.findAndCount.mockRejectedValue(new Error("Database error"));

      await expect(
        userService.searchUser("John", { page: 1, limit: 10 })
      ).rejects.toThrow(APIError);
    });
  });

  describe("getTeammates", () => {
    it("should return teammates if user is found", async () => {
      const mockTeammates = [
        {
          userId: "35071961-ec08-4b61-994b-54a5890d459f",
          name: "admin",
          email: "salesOrganization@gmail.com",
          department: null,
        },
        {
          userId: "404c42d8-a8df-4695-a646-9a96c38c522d",
          name: "boUser",
          email: "bouser@gmail.com",
          department: "knowlege",
        },
        {
          userId: "3d178ade-0a05-4539-9ae0-23b3153e9e2c",
          name: "user3",
          email: "user3@gmail.com",
          department: "knowledge",
        },
      ];
      const mockUser = {
        userId: "f4309fbc-a16e-4a14-82e7-401b9b9f4778",
        name: "TestUser",
        manager: mockTeammates[0],
        subordinates: [mockTeammates[1], mockTeammates[2]],
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userService.getTeammates(
        "f4309fbc-a16e-4a14-82e7-401b9b9f4778",
        {
          page: 1,
          limit: 10,
        }
      );

      expect(result).toEqual({
        data: mockTeammates,
        meta: {
          total: mockTeammates.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should throw APIError if user is not found", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        userService.getTeammates("1", { page: 1, limit: 10 })
      ).rejects.toThrow(APIError);
    });
  });
});
