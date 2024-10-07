import logger from "../utils/logger";

export class ContactPersonDTO {
  contactId: string;
  name: string;
  phone: string;
  email: string;

  constructor(contactPerson: any) {
    try {
      this.contactId = contactPerson.contactId;
      this.name = contactPerson.name;
      this.phone = contactPerson.phone;
      this.email = contactPerson.email;
    } catch (error) {
      logger.error("Error in ContactPersonDTO constructor:", error);
      throw new Error(`Failed to create ContactPersonDTO: ${error}`);
    }
  }

  static fromEntity(contactPerson: any): ContactPersonDTO {
    try {
      return new ContactPersonDTO(contactPerson);
    } catch (error) {
      logger.error("Error in ContactPersonDTO.fromEntity:", error);
      throw new Error(
        `Failed to create ContactPersonDTO from entity: ${error}`
      );
    }
  }
}
