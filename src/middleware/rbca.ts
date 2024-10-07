import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/Role/roleEntity";
import { HttpStatusCode } from "./errorMiddlware";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user/userEntity";
import logger from "../utils/logger";

export const checkRoles = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRepository = AppDataSource.getRepository(User);

    try {
      const { userId } = req.body.user;

      if (!userId) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          message: "User not authenticated.",
        });
      }

      const user = await User.findOne({
        where: { userId },
        relations: ["roles"],
      });

      if (!user) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          message: "User not found.",
        });
      }

      const userRoles = user.roles.map((role) => role.roleName as UserRole);
      const hasAllowedRole = userRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (hasAllowedRole) {
        // Pass all the user's roles to the next middleware
        req.body.user = {
          ...req.body.user,
          roles: userRoles,
        };
        next();
      } else {
        res.status(HttpStatusCode.FORBIDDEN).json({
          message: "Access denied. Insufficient permissions.",
        });
      }
    } catch (error) {
      logger.error("Error in checkRoles middleware:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while checking user permissions.",
      });
    }
  };
};
