import { User } from "../entities/user/userEntity";
import { Team } from "../entities/Team/teamEntity";
export class HierarchicalUserDTO {
  userId: string;
  name: string;
  department: string | null;
  email: string;
  subordinates: HierarchicalUserDTO[];

  constructor(user: User) {
    this.userId = user.userId;
    this.name = user.name;
    this.department = user.department;
    this.email = user.email;
    this.subordinates = [];
  }
}

export class HierarchicalTeamDTO {
  teamId: string;
  teamName: string;
  teamDescription: string | null;
  members: HierarchicalUserDTO;

  constructor(team: Team, hierarchicalStructure: HierarchicalUserDTO) {
    this.teamId = team.teamId;
    this.teamName = team.teamName;
    this.teamDescription = team.teamDescription;
    this.members = hierarchicalStructure;
  }
}
