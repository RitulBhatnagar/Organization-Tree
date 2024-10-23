import { AdminService } from "../../../src/services/v1/admin.service"; // Path to your AdminService
import { AppDataSource } from "../../../src/config/data-source";
import { User } from "../../../src/entities/user/userEntity";
import { Role } from "../../../src/entities/Role/roleEntity";
import { UserRole } from "../../../src/entities/Role/roleEntity";
import * as argon2 from "argon2";
import APIError, {
  HttpStatusCode,
} from "../../../src/middleware/errorMiddlware";

// Mock repositories and any utility functions used in the service
jest.mock("../../../src/config/data-source");
jest.mock("argon2");
jest.mock("../../../src/utils/logger");

describe("AdminService", () => {
  let adminService: AdminService;
  let mockUserRepo: any;
  let mockRoleRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockRoleRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Mock repository methods using AppDataSource.getRepository
    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === User) {
        return mockUserRepo;
      }
      if (entity === Role) {
        return mockRoleRepo;
      }
    });

    // Create a new instance of AdminService
    adminService = new AdminService();
  });

  describe("createUser", () => {
    it("should create a new user and return limited user data", async () => {
      const adminUserId = "admin123";
      const newUser = {
        userId: "newUser123",
        email: "test@example.com",
        department: "Engineering",
      };
      const admin = { subordinates: [] };
      const hashedPassword = "hashedPassword";

      // Mock admin user lookup
      mockUserRepo.findOne.mockResolvedValueOnce(admin);
      mockUserRepo.findOne.mockResolvedValueOnce(null); // No existing user
      (argon2.hash as jest.Mock).mockResolvedValueOnce(hashedPassword); // Mock hashing

      mockUserRepo.create.mockReturnValue(newUser); // Mock creating the new user
      mockUserRepo.save.mockResolvedValue(newUser); // Mock saving user

      const result = await adminService.createUser(
        adminUserId,
        "John Doe",
        "test@example.com",
        "Engineering",
        "password123"
      );

      expect(result).toEqual({
        userId: newUser.userId,
        email: newUser.email,
        department: newUser.department,
      });
      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(2);
      expect(argon2.hash).toHaveBeenCalledWith("password123");
    });

    it("should throw an error if admin user is not found", async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null); // Admin user not found

      await expect(
        adminService.createUser(
          "invalidAdmin",
          "John Doe",
          "test@example.com",
          "Engineering",
          "password123"
        )
      ).rejects.toThrow(APIError);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: "invalidAdmin" },
        relations: ["subordinates"],
      });
    });

    it("should throw an error if user with same email exists", async () => {
      const admin = { subordinates: [] };
      mockUserRepo.findOne.mockResolvedValueOnce(admin); // Admin exists
      mockUserRepo.findOne.mockResolvedValueOnce({ email: "test@example.com" }); // User already exists

      await expect(
        adminService.createUser(
          "admin123",
          "John Doe",
          "test@example.com",
          "Engineering",
          "password123"
        )
      ).rejects.toThrow(APIError);

      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe("assignRole", () => {
    it("should assign a role to the user", async () => {
      const user = { userId: "user123", roles: [], ownedTeams: [] };
      const role = { roleName: "Admin" };

      mockUserRepo.findOne.mockResolvedValueOnce(user);
      mockRoleRepo.findOne.mockResolvedValueOnce(null);
      mockRoleRepo.create.mockReturnValue(role);

      const result = await adminService.assignRole("user123", UserRole.ADMIN);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: "user123" },
        relations: ["roles", "ownedTeams", "teamsMembers"],
      });
      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { roleName: "Admin" },
      });
      expect(mockRoleRepo.save).toHaveBeenCalledWith(role);
      expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    });

    it("should throw an error if user is not found", async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        adminService.assignRole("invalidUser", UserRole.ADMIN)
      ).rejects.toThrow(APIError);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { userId: "invalidUser" },
        relations: ["roles", "ownedTeams", "teamsMembers"],
      });
    });
  });

  describe("createBrand", () => {
    it("should create a new brand and return it", async () => {
      const newBrand = {
        brandId: "brand123",
        brandName: "Test Brand",
        revenue: 100000,
        dealCloseValue: 5000,
      };

      mockRoleRepo.create.mockReturnValue(newBrand);
      mockRoleRepo.save.mockResolvedValue(newBrand);

      const result = await adminService.createBrand("Test Brand", 100000, 5000);

      expect(mockRoleRepo.save).toHaveBeenCalledWith(newBrand);
      expect(result).toEqual(newBrand);
    });
  });
});
