import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/Role/roleEntity";
import { HttpStatusCode } from "./errorMiddlware";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user/userEntity";
import logger from "../utils/logger";
import { Brand } from "../entities/Brand/brandEntity";
import { access } from "fs";
import { AuthenticateRequest } from "./authentication";

export const checkRoles = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRepository = AppDataSource.getRepository(User);

    try {
      const userId = req.user?.userId;
      const { brandId } = req.params;

      if (!userId) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          message: "User not authenticated.",
        });
      }

      const user = await User.findOne({
        where: { userId: userId as string },
        relations: ["roles", "ownerBrands", "ownedTeams"],
      });

      if (!user) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          message: "User not found.",
        });
      }
      const userRoles = user.roles.map((role) => role.roleName as UserRole);

      if (userRoles.includes(UserRole.ADMIN)) {
        req.user = {
          ...req.user,
          roles: userRoles,
          accessLevel: "full",
        };
        return next();
      }

      if (brandId) {
        const brand = await Brand.findOne({
          where: { brandId },
          relations: ["owners"],
        });

        if (!brand) {
          return res.status(404).json({ message: "Brand not found" });
        }
        let brandOwner = false;
        brandOwner = brand.owners.some((ow) => ow.userId === user.userId);
        if (brandOwner) {
          req.user = {
            ...req.user,
            roles: userRoles,
            accessLevel: "full",
          };
          return next();
        } else if (
          userRoles.includes(UserRole.PO) ||
          userRoles.includes(UserRole.PO_TO)
        ) {
          req.user = {
            ...req.user,
            roles: userRoles,
            accessLevel: "full",
          };
        } else {
          req.user = {
            ...req.user,
            roles: userRoles,
            accessLevel: "limited",
          };
          return next();
        }
      }

      const hasAllowedRole = userRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (hasAllowedRole) {
        // Pass all the user's roles to the next middleware
        req.user = {
          ...req.user,
          roles: userRoles,
          accessLevel: "full",
        };
        return next();
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
