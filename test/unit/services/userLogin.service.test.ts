import { UserLoginService } from "../../../src/services";
import { User } from "../../../src/entities/user/userEntity";
import { Role } from "../../../src/entities/Role/roleEntity";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../../src/config/data-source";
import APIError from "../../../src/middleware/errorMiddlware";

jest.mock("argon2");
jest.mock("jsonwebtoken");
jest.mock("../../../src/config/data-source");

describe("UserLoginService", () => {
  let userLoginService: UserLoginService;

  const mockUserRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockRoleRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  beforeAll(() => {
    process.env.NODE_ENV = "dev";
  });
  beforeEach(() => {
    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === User) return mockUserRepo;
      if (entity === Role) return mockRoleRepo;
    });
    userLoginService = new UserLoginService();
  });

  describe("signup", () => {
    it("should throw an error if user already exsists", async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ email: "test@example.com" });

      await expect(
        userLoginService.signup("test@example.com", "password", "Test User")
      ).rejects.toThrow(APIError);
    });

    it("should create a new user if not exists", async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null); // User doesn't exist
      mockRoleRepo.findOne.mockResolvedValueOnce(null); // Role doesn't exist
      mockRoleRepo.save.mockResolvedValueOnce({ roleName: "ADMIN" });
      mockUserRepo.save.mockResolvedValueOnce({ email: "test@example.com" });

      // Mock password hashing
      (argon2.hash as jest.Mock).mockResolvedValueOnce("hashedPassword");

      const result = await userLoginService.signup(
        "test@example.com",
        "password",
        "Test User"
      );

      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.any(User));
      expect(result.email).toEqual("test@example.com");
    });
  });

  describe("login", () => {
    it("should throw an error if the user does not exist", async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        userLoginService.login("test@example.com", "password")
      ).rejects.toThrow(APIError);
    });

    it("should throw an error if the password is invalid", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
      };
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        userLoginService.login("test@example.com", "wrongPassword")
      ).rejects.toThrow(APIError);
    });

    it("should return a token and user without password if login is successful", async () => {
      const mockUser = {
        userId: 1,
        email: "test@example.com",
        password: "hashedPassword",
      };
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      const result = await userLoginService.login(
        "test@example.com",
        "password"
      );

      expect(result).toEqual({
        user: { userId: 1, email: "test@example.com" },
        token: "fakeToken",
      });
    });
  });
});
