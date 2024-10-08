import { User } from "../../entities/user/userEntity";
import { Team } from "../../entities/Team/teamEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";
import {
  HierarchicalTeamDTO,
  HierarchicalUserDTO,
} from "../../dtos/hirerachyTeamdto";
import { PaginationParams } from "../../types";

export class TeamMangementService {
  async getHierarchicalTeamStructure(
    teamId: string,
    paginationParams: PaginationParams
  ) {
    // Updated return type

    const { page = 1, limit = 10 } = paginationParams;
    const skip = (page - 1) * limit;
    try {
      const team = await Team.findOne({
        where: { teamId },
        relations: ["teamOwner", "members"],
      });

      if (!team) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        );
      }

      // Pagination logic for members (User[]).
      const [members, totalMembers] = await User.getRepository().findAndCount({
        where: { teamsMembers: { teamId } },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(totalMembers / limit);

      // Correctly pass 'members' as User[]
      const hierarchicalStructure = this.buildHierarchy(
        team.teamOwner,
        members
      );

      // Make sure DTO returns the correct format
      return {
        data: [new HierarchicalTeamDTO(team, hierarchicalStructure)],
        meta: {
          total: totalMembers,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      logger.error("Error while getting hierarchical team structure", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting hierarchical team structure"
      );
    }
  }

  // Build hierarchy based on User[]
  private buildHierarchy(
    teamOwner: User,
    members: User[] // Ensure this is User[]
  ): HierarchicalUserDTO {
    const ownerDTO = new HierarchicalUserDTO(teamOwner);

    // Filter out the owner from the members list
    const subordinates = members.filter(
      (member) => member.userId !== teamOwner.userId
    );

    // Create HierarchicalUserDTO objects for all subordinates
    ownerDTO.subordinates = subordinates.map(
      (member) => new HierarchicalUserDTO(member)
    );

    return ownerDTO;
  }
}
