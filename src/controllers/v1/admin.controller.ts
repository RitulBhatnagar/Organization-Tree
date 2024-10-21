// User and Brand Management
import { Request, Response, NextFunction } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { localConstant } from "../../utils/constant";
import logger from "../../utils/logger";
import { AdminService } from "../../services/v1/admin.service";
import { UserRole } from "../../entities/Role/roleEntity";
const adminService = new AdminService();
export class AdminController {
  async createUser(req: Request, res: Response) {
    const { name, email, department, password } = req.body;
    const userId = req.user?.userId;
    if (!req.user || !req.user.userId) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        message: "User not authenticated.",
      });
    }
    const accessLevel = req.user?.accessLevel;
    console.log("userId", userId);
    console.log("accessLevel", accessLevel);
    // Input validation
    if (!name || name.trim() === "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the name",
      });
    }

    if (!email || email.trim() === "" || typeof email !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the email",
      });
    }

    if (
      !department ||
      department.trim() === "" ||
      typeof department !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the department",
      });
    }

    if (!password || password.trim() === "" || typeof password !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the password",
      });
    }

    try {
      const user = await adminService.createUser(
        userId as string,
        name,
        email,
        department,
        password
      );
      return res.status(HttpStatusCode.CREATED).json(user);
    } catch (error) {
      logger.error("Error creating User", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || "Error creating User",
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error creating User",
      });
    }
  }

  async assignRole(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || userId.trim() == "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing params, Please provide the userId",
      });
    }

    if (!role || role.trim() == "" || typeof role !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the role",
      });
    }

    try {
      const userRole = mapStringToUserRole(role.toLowerCase());
      if (!userRole) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Invalid role provided",
        });
      }

      const user = await adminService.assignRole(userId, userRole);
      return res.status(HttpStatusCode.OK).json({
        message: "Role assigned successfully",
        user,
      });
    } catch (error) {
      logger.error("Error while assigning role to a User", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message:
              error.message || localConstant.ERROR_ASSIGNING_ROLE_TO_USER,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_ASSIGNING_ROLE_TO_USER,
      });
    }
  }

  async assignUserToTeam(req: Request, res: Response) {
    const { userId } = req.params;
    const { teamId } = req.body;

    if (!userId || userId.trim() == "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing params, Please provide the userId",
      });
    }
    if (!teamId || teamId.trim() == "" || typeof teamId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing body, Please provide the teamId",
      });
    }

    try {
      const user = await adminService.assignBoToTeam(userId, teamId);
      return res.status(HttpStatusCode.OK).json(user);
    } catch (error) {
      logger.error("Error while assigning role to a User", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message:
              error.message || localConstant.ERROR_ASSIGNING_ROLE_TO_USER,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_ASSIGNING_ROLE_TO_USER,
      });
    }
  }
  async createBrand(req: Request, res: Response) {
    const { brandName, revenue, dealCloseValue } = req.body;

    if (
      !brandName ||
      brandName.trim() === "" ||
      typeof brandName !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandName",
      });
    }

    if (typeof revenue !== "number" || isNaN(revenue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid revenue",
      });
    }

    if (typeof dealCloseValue !== "number" || isNaN(dealCloseValue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid dealCloseValue",
      });
    }

    try {
      const brand = await adminService.createBrand(
        brandName,
        revenue,
        dealCloseValue
      );
      return res.status(HttpStatusCode.CREATED).json(brand);
    } catch (error) {
      logger.error("Error while creating brand", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message: error.message || localConstant.ERROR_CREATING_BRAND,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_BRAND,
      });
    }
  }
  async assignBrandToBo(req: Request, res: Response) {
    const { brandId } = req.params;
    const { boId } = req.body;

    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandId in params",
      });
    }

    if (!boId || boId.trim() === "" || typeof boId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid boId in request body",
      });
    }

    try {
      const updatedBrand = await adminService.assignBrandToBo(brandId, boId);
      return res.status(HttpStatusCode.OK).json(updatedBrand);
    } catch (error) {
      logger.error("Error while assigning brand to BO", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_ASSIGNING_BRAND_TO_BO,
      });
    }
  }
  async updateBrand(req: Request, res: Response) {
    const { brandId } = req.params;
    const { brandName, revenue, dealCloseValue } = req.body;

    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandId in params",
      });
    }

    if (
      !brandName ||
      brandName.trim() === "" ||
      typeof brandName !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandName in request body",
      });
    }

    if (typeof revenue !== "number" || isNaN(revenue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid revenue in request body",
      });
    }

    if (typeof dealCloseValue !== "number" || isNaN(dealCloseValue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid dealCloseValue in request body",
      });
    }

    try {
      const updatedBrand = await adminService.updateBrand(
        brandId,
        brandName,
        revenue,
        dealCloseValue
      );
      return res.status(HttpStatusCode.OK).json({
        message: "Brand successfully updated",
        brand: updatedBrand,
      });
    } catch (error) {
      logger.error("Error while updating brand", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_BRAND,
      });
    }
  }
  async getBrandWithOwners(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    try {
      const brand = await adminService.getBrandswithOwners({ page, limit });
      return res.status(HttpStatusCode.OK).json({
        message: "Brand with owners retrieved successfully",
        brand: brand,
      });
    } catch (error) {
      logger.error("Error while getting brand with owners", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_BRAND_WITH_OWNERS,
      });
    }
  }
  async getHierarchy(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId || userId.trim() === "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in params",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const userHierarchy = await adminService.getHirechry(userId, {
        page,
        limit,
      });
      return res.status(HttpStatusCode.OK).json({
        message: "User hierarchy retrieved successfully",
        user: userHierarchy,
      });
    } catch (error) {
      logger.error("Error while getting hierarchy for the user", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_USER_HIERARCHY,
      });
    }
  }
  async updateTeam(req: Request, res: Response) {
    const { teamId } = req.params;
    const { teamName, teamDescription } = req.body;
    if (!teamId || teamId.trim() === "" || typeof teamId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid teamId in params",
      });
    }
    if (!teamName || teamName.trim() === "" || typeof teamName !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid teamName in request body",
      });
    }
    if (
      !teamDescription ||
      teamDescription.trim() === "" ||
      typeof teamDescription !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid teammDescription in request body",
      });
    }
    try {
      const team = await adminService.updateTeam(
        teamId,
        teamName,
        teamDescription
      );
      return res.status(200).json(team);
    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_TEAM,
      });
    }
  }
  async updateUserRoles(req: Request, res: Response) {}
  async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const { name, email, department } = req.body;

    if (!userId || userId.trim() === "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in params",
      });
    }

    if (!name || name.trim() === "" || typeof name !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid name in request body",
      });
    }
    if (!email || email.trim() === "" || typeof email !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid email in request body",
      });
    }

    if (
      !department ||
      department.trim() === "" ||
      typeof department !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid department in request body",
      });
    }

    try {
      const updatedUser = await adminService.updateUser(
        userId,
        name,
        email,
        department
      );
      return res.status(HttpStatusCode.OK).json({
        message: "User successfully updated",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_USER,
      });
    }
  }
  async shiftUserToDifferentTeam(req: Request, res: Response) {
    const { userId, teamId } = req.params;
    const { newTeamId } = req.body;

    if (!userId || userId.trim() === "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in params",
      });
    }
    if (!teamId || teamId.trim() === "" || typeof teamId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid teamId in params",
      });
    }
    if (
      !newTeamId ||
      newTeamId.trim() === "" ||
      typeof newTeamId !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid newTeamId in request body",
      });
    }
    try {
      const updateUserTeam = await adminService.shiftUserToTeam(
        userId,
        teamId,
        newTeamId
      );
      return res
        .status(200)
        .json({ message: "User successfully shifted to new team" });
    } catch (error) {
      logger.error("Error while shifting the team", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_SHIFTIING_USER_TEAM,
      });
    }
  }
}
function mapStringToUserRole(role: string): UserRole | undefined {
  const roleMap: { [key: string]: UserRole } = {
    po: UserRole.PO,
    bo: UserRole.BO,
    to: UserRole.TO,
    po_to: UserRole.PO_TO,
  };

  return roleMap[role];
}
