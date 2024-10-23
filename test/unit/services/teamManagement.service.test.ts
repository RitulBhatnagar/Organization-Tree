import { TeamMangementService } from "../../../src/services";
import { Team } from "../../../src/entities/Team/teamEntity";
import { User } from "../../../src/entities/user/userEntity";
import { HierarchicalTeamDTO } from "../../../src/dtos/hirerachyTeamdto";
import APIError, {
  HttpStatusCode,
} from "../../../src/middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../../src/utils/constant";

// Mock repository methods
jest.mock("../../../src/entities/Team/teamEntity");
jest.mock("../../../src/entities/user/userEntity");

describe("TeamMangementService", () => {
  let service: TeamMangementService;

  beforeAll(() => {
    process.env.NODE_ENV = "dev";
  });

  beforeEach(() => {
    service = new TeamMangementService();
  });

  describe("getHierarchicalTeamStructure", () => {
    it("should return hierarchical team structure when team and members are found", async () => {
      const teamId = "team123";
      const paginationParams = { page: 1, limit: 10 };

      const mockTeam = {
        teamId: "team123",
        teamOwner: { userId: "owner123", name: "Owner Name" },
        members: [
          { userId: "user1", name: "User One" },
          { userId: "user2", name: "User Two" },
        ],
      } as Team;

      const mockMembers = [
        { userId: "user1", name: "User One" },
        { userId: "user2", name: "User Two" },
      ] as User[];

      (Team.findOne as jest.Mock).mockResolvedValue(mockTeam);
      (User.getRepository().findAndCount as jest.Mock).mockResolvedValue([
        mockMembers,
        mockMembers.length,
      ]);

      const result = await service.getHierarchicalTeamStructure(
        teamId,
        paginationParams
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(mockMembers.length);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.data[0]).toBeInstanceOf(HierarchicalTeamDTO);
    });

    it("should throw an APIError if the team is not found", async () => {
      const teamId = "team123";
      const paginationParams = { page: 1, limit: 10 };

      (Team.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getHierarchicalTeamStructure(teamId, paginationParams)
      ).rejects.toThrowError(
        new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        )
      );
    });

    it("should throw an APIError on internal server error", async () => {
      const teamId = "team123";
      const paginationParams = { page: 1, limit: 10 };

      (Team.findOne as jest.Mock).mockRejectedValue(
        new Error("Internal error")
      );

      await expect(
        service.getHierarchicalTeamStructure(teamId, paginationParams)
      ).rejects.toThrowError(
        new APIError(
          ErrorCommonStrings.INTERNAL_SERVER_ERROR,
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          "Error while getting hierarchical team structure"
        )
      );
    });
  });

  describe("getTeam", () => {
    it("should return team details when the team is found", async () => {
      const teamId = "team123";

      const mockTeam = {
        teamId: "team123",
        teamOwner: { userId: "owner123", name: "Owner Name" },
        members: [{ userId: "user1", name: "User One" }],
      } as Team;

      (Team.findOne as jest.Mock).mockResolvedValue(mockTeam);

      const result = await service.getTeam(teamId);

      expect(result.teamId).toBe(mockTeam.teamId);
      //   expect(result.teamOwner.userId).toBe(mockTeam.teamOwner.userId);
      expect(result.members).toHaveLength(1);
    });

    it("should throw an APIError if the team is not found", async () => {
      const teamId = "team123";

      (Team.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getTeam(teamId)).rejects.toThrowError(
        new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Team not found"
        )
      );
    });

    it("should throw an APIError on internal server error", async () => {
      const teamId = "team123";

      (Team.findOne as jest.Mock).mockRejectedValue(
        new Error("Internal error")
      );

      await expect(service.getTeam(teamId)).rejects.toThrowError(
        new APIError(
          ErrorCommonStrings.INTERNAL_SERVER_ERROR,
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          "Error while getting team"
        )
      );
    });
  });
});
