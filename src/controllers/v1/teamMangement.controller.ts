import { Request, Response } from "express";
import { TeamMangementService } from "../../services/v1/teamMangement.service";
import logger from "../../utils/logger";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { localConstant } from "../../utils/constant";
const teamManagementService = new TeamMangementService();

export class TeamMangementController {
  async getTeamMembers(req: Request, res: Response) {
    const { teamId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    try {
      const paginationQuery = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string | undefined,
        sortOrder: sortOrder as "ASC" | "DESC" | undefined,
      };
      const teamMembers =
        await teamManagementService.getHierarchicalTeamStructure(teamId);
      return res.status(200).json(teamMembers);
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
