import * as argon2 from "argon2";
import { User } from "../../entities/user/userEntity";
import { Role } from "../../entities/Role/roleEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import jwt from "jsonwebtoken";
import { UserRole } from "../../entities/Role/roleEntity";
import { ENV } from "../../config/env";
import { AppDataSource } from "../../config/data-source";
import logger from "../../utils/logger";

export class UserLoginService {
  private userRepo = AppDataSource.getRepository(User);
  private roleRepo = AppDataSource.getRepository(Role);
  async signup(email: string, password: string, name: string) {
    try {
      const existingUser = await this.userRepo.findOne({ where: { email } });
      if (existingUser) {
        throw new APIError(
          ErrorCommonStrings.ALREADY_EXIST,
          HttpStatusCode.ALREADY_EXISTS,
          false,
          "User already exists"
        );
      }

      const hashedPassword = await argon2.hash(password);

      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.name = name;

      // Check if ADMIN role exists, if not create it
      let adminRole = await this.roleRepo.findOne({
        where: { roleName: UserRole.ADMIN },
      });
      if (!adminRole) {
        adminRole = new Role();
        adminRole.roleName = UserRole.ADMIN;
        await this.roleRepo.save(adminRole);
      }

      user.roles = [adminRole];

      await this.userRepo.save(user);

      return user;
    } catch (error) {
      logger.error("Error while signup", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while signup"
      );
    }
  }
  async login(email: string, password: string) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.INVALID_USER,
          HttpStatusCode.UNAUTHORIZED,
          false,
          "Invalid User"
        );
      }
      if (!(await argon2.verify(user.password, password))) {
        throw new APIError(
          ErrorCommonStrings.INVALID_PASSWORD,
          HttpStatusCode.UNAUTHORIZED,
          false,
          "Invalid Password"
        );
      }

      const token = jwt.sign({ userId: user.userId }, ENV.JWT_SECRET!, {
        expiresIn: ENV.JWT_EXPIRATION,
      });
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while login"
      );
    }
  }
}
