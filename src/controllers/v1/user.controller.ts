import { Request, Response } from "express";
import { UserService } from "../../services/v1/user.service";
import logger from "../../utils/logger";
const userService = new UserService();
export class UserController {
  async getUserDetails(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const user = await userService.getUserDetails(userId);
      return res.status(200).json(user);
    } catch (error) {
      logger.error("Error while getting user details", error);
      return res
        .status(500)
        .json({ message: "Error while getting user details" });
    }
  }
  async searchUser(req: Request, res: Response) {
    const { name } = req.query;
    try {
      const users = await userService.searchUser(name as string);
      return res.status(200).json(users);
    } catch (error) {
      logger.error("Error while searching users", error);
      return res.status(500).json({ message: "Error while searching users" });
    }
  }

  async getTeammates(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const teamMembers = await userService.getTeammates(userId);
      return res.status(200).json(teamMembers);
    } catch (error) {
      logger.error("Error while getting team members", error);
      return res
        .status(500)
        .json({ message: "Error while getting team members" });
    }
  }
}
