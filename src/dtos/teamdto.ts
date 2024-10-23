// import { UserDTO } from "./userdto";

export class TeamDTO {
  teamId: string;
  teamOwner: UserTeamDto | null;
  members: UserTeamDto[];

  constructor(team: any) {
    this.teamId = team.teamId;
    this.teamOwner = team.teamOwner ? new UserTeamDto(team.teamOwner) : null;
    this.members = Array.isArray(team.members)
      ? team.members.map((member: any) => new UserTeamDto(member))
      : [];
  }

  static fromEntity(team: any): TeamDTO {
    return new TeamDTO(team);
  }
}
export class UserTeamDto {
  userId: string;
  name: string;
  department: string | null;
  email: string;

  constructor(user: any) {
    this.userId = user.userId;
    this.name = user.name;
    this.department = user.department;
    this.email = user.email;
  }

  static fromEntity(user: any): UserTeamDto {
    return new UserTeamDto(user);
  }
}
