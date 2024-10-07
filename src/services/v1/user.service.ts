import { InsertValuesMissingError, Like } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { UserDTO } from "../../dtos/userdto";
import { User } from "../../entities/user/userEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";
import { SimplifiedUserDTO } from "../../dtos/simplifieduserdto";
import { TeammateDTO } from "../../types";
export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private userToTeammateDTO(user: User): TeammateDTO {
    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      department: user.department,
    };
  }
  async getUserDetails(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          userId,
        },
        relations: ["roles"],
      });
      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }
      return UserDTO.fromEntity(user);
    } catch (error) {
      logger.error("Error in user found", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "User not found"
      );
    }
  }
  async searchUser(name: string) {
    try {
      const users = await this.userRepo.find({
        where: { name: Like(`%${name}%`) },
        relations: ["roles"],
      });
      return users.map((user) => SimplifiedUserDTO.fromEntity(user));
    } catch (error) {
      logger.error("Error while searching for users", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while searching for users"
      );
    }
  }
  async getTeammates(userId: string): Promise<TeammateDTO[]> {
    try {
      logger.info(`Fetching teammates for userId: ${userId}`);

      const user = await this.userRepo.findOne({
        where: { userId },
        relations: ["manager", "subordinates"],
      });

      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }

      const teammates: TeammateDTO[] = [];

      // Add manager if exists
      if (user.manager) {
        teammates.push(this.userToTeammateDTO(user.manager));
      }

      // Add subordinates
      if (user.subordinates && user.subordinates.length > 0) {
        user.subordinates.forEach((subordinate) => {
          teammates.push(this.userToTeammateDTO(subordinate));
        });
      }

      // If user has a manager, fetch siblings (other subordinates of the manager)
      if (user.manager) {
        const manager = await this.userRepo.findOne({
          where: { userId: user.manager.userId },
          relations: ["subordinates"],
        });

        if (manager && manager.subordinates) {
          manager.subordinates.forEach((sibling) => {
            if (sibling.userId !== userId) {
              // Exclude the user themselves
              teammates.push(this.userToTeammateDTO(sibling));
            }
          });
        }
      }

      logger.debug(`Found ${teammates.length} teammates for user ${userId}`);

      return teammates;
    } catch (error) {
      logger.error("Error while fetching teammates", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while fetching teammates"
      );
    }
  }
}
