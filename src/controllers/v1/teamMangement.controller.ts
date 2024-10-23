import { Request, Response } from "express";
import { TeamMangementService } from "../../services/v1/teamMangement.service";
import logger from "../../utils/logger";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { localConstant } from "../../utils/constant";
const teamManagementService = new TeamMangementService();

export class TeamMangementController {
  async getTeamMembers(req: Request, res: Response) {
    const { teamId } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    try {
      const teamMembers =
        await teamManagementService.getHierarchicalTeamStructure(teamId, {
          page,
          limit,
        });
      return res.status(200).json({
        message: "Team members retrieved successfully",
        ...teamMembers,
      });
    } catch (error) {
      logger.error("Error while getting team members", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_TEAM_MEMBERS,
      });
    }
  }
}
