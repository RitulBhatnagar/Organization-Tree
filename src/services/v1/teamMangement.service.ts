import { User } from "../../entities/user/userEntity";
import { Team } from "../../entities/Team/teamEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import logger from "../../utils/logger";
import {
  HierarchicalTeamDTO,
  HierarchicalUserDTO,
} from "../../dtos/hirerachyTeamdto";

export class TeamMangementService {
  async getHierarchicalTeamStructure(
    teamId: string
  ): Promise<HierarchicalTeamDTO> {
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

      const hierarchicalStructure = this.buildHierarchy(
        team.teamOwner,
        team.members
      );
      return new HierarchicalTeamDTO(team, hierarchicalStructure);
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

  private buildHierarchy(
    teamOwner: User,
    members: User[]
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
