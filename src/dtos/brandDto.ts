import { SimplifiedUserDTO } from "./simplifieduserdto";
import { ContactPersonDTO } from "./contactPersondto";
import logger from "../utils/logger";

export class BrandDTO {
  brandId: string;
  brandName: string;
  revenue: string;
  dealCloseValue: string;
  owners: SimplifiedUserDTO[];
  contactPersons: ContactPersonDTO[];

  constructor(brand: any) {
    try {
      this.brandId = brand.brandId;
      this.brandName = brand.brandName;
      this.revenue = brand.revenue?.toString() || "0";
      this.dealCloseValue = brand.dealCloseValue?.toString() || "0";

      this.owners = Array.isArray(brand.owners)
        ? brand.owners.map((owner: any) => new SimplifiedUserDTO(owner))
        : [];

      this.contactPersons = Array.isArray(brand.contactPersons)
        ? brand.contactPersons.map((cp: any) => new ContactPersonDTO(cp))
        : [];
    } catch (error) {
      logger.error("Error in BrandDTO constructor:", error);
      throw new Error(`Failed to create BrandDTO: ${error}`);
    }
  }

  static fromEntity(brand: any): BrandDTO {
    try {
      return new BrandDTO(brand);
    } catch (error) {
      logger.error("Error in BrandDTO.fromEntity:", error);
      throw new Error(`Failed to create BrandDTO from entity: ${error}`);
    }
  }
}
