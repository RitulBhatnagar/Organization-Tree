import { User } from "../entities/user/userEntity";

export class UserDTO {
  userId: string;
  name: string;
  email: string;
  department: string | null;
  roles: { roleId: string; roleName: User }[];

  constructor(user: any) {
    this.userId = user.userId;
    this.name = user.name;
    this.email = user.email;
    this.department = user.department;
    this.roles = user.roles.map((role: any) => ({
      roleId: role.roleId,
      roleName: role.roleName,
    }));
  }

  static fromEntity(user: any): UserDTO {
    return new UserDTO(user);
  }
}
