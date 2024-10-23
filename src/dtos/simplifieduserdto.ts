import logger from "../utils/logger";

export class SimplifiedUserDTO {
  userId: string;
  name: string;
  email: string;
  department: string | null;

  constructor(user: any) {
    try {
      this.userId = user.userId;
      this.name = user.name;
      this.email = user.email;
      this.department = user.department || null;
    } catch (error) {
      logger.error("Error in SimplifiedUserDTO constructor:", error);
      throw new Error(`Failed to create SimplifiedUserDTO: ${error}`);
    }
  }

  static fromEntity(user: any): SimplifiedUserDTO {
    try {
      return new SimplifiedUserDTO(user);
    } catch (error) {
      logger.error("Error in SimplifiedUserDTO.fromEntity:", error);
      throw new Error(
        `Failed to create SimplifiedUserDTO from entity: ${error}`
      );
    }
  }
}
