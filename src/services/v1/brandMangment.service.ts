import { Brand } from "../../entities/Brand/brandEntity";
import APIError from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import { HttpStatusCode } from "../../middleware/errorMiddlware";
import { AppDataSource } from "../../config/data-source";
import { contactPerson } from "../../types";
import { ContactPerson } from "../../entities/ContactPerson/contactPersonEntity";
import { User } from "../../entities/user/userEntity";
import logger from "../../utils/logger";
import { ContactPersonDTO } from "../../dtos/contactPersondto";
import { UserRole } from "../../entities/Role/roleEntity";
import { BrandDTO } from "../../dtos/brandDto";
import { BrandLimitedDTO } from "../../dtos/brandLimiteddto";
export class BrandManagementService {
  private contactPersonRepo = AppDataSource.getRepository(ContactPerson);
  private brandRepo = AppDataSource.getRepository(Brand);
  private brandRepository = AppDataSource.getRepository(Brand);
  async updateBrand(
    brandId: string,
    brandName: string,
    revenue: number,
    dealCloseValue: number
  ) {
    try {
      const brand = await Brand.findOne({ where: { brandId } });
      if (!brand) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }
      brand.brandName = brandName;
      brand.revenue = revenue;
      brand.dealCloseValue = dealCloseValue;
      await brand.save();
      return brand;
    } catch (error) {
      logger.error("Error while updating brand in service", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating brand"
      );
    }
  }

  async addContactPerson(
    brandId: string,
    contactPersonData: Omit<ContactPerson, "contactId" | "brand">
  ) {
    try {
      const brand = await this.brandRepository.findOne({
        where: { brandId },
        relations: ["contactPersons"],
      });

      if (!brand) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }

      const newContactPerson = this.contactPersonRepo.create({
        ...contactPersonData,
        brand: brand,
      });

      await this.contactPersonRepo.save(newContactPerson);

      return newContactPerson;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while adding contact person"
      );
    }
  }
  async updateContactPerson(
    brandId: string,
    contactId: string,
    updateData: Partial<Omit<ContactPerson, "contactId" | "brand">>
  ) {
    try {
      const contactPerson = await this.contactPersonRepo.findOne({
        where: { contactId, brand: { brandId } },
        relations: ["brand"],
      });

      if (!contactPerson) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Contact Person not found or does not belong to the specified brand"
        );
      }

      // Update the contact person properties
      Object.assign(contactPerson, updateData);

      // Save the updated contact person
      await this.contactPersonRepo.save(contactPerson);

      return ContactPersonDTO.fromEntity(contactPerson);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while updating contact person"
      );
    }
  }

  async getBrands(userId: string) {
    try {
      const bo = await User.findOne({
        where: { userId },
        relations: ["ownerBrands"],
      });
      if (!bo) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "BO not found"
        );
      }

      return bo.ownerBrands;
    } catch (error) {
      logger.error("Error while getting brands owned by bo", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting the list of brands"
      );
    }
  }
  async getFullBrandDetails(brandId: string) {
    try {
      logger.info(`Fetching full brand details for brandId: ${brandId}`);

      const brand = await this.brandRepo.findOne({
        where: { brandId },
        relations: ["contactPersons", "owners"],
      });

      logger.debug(`Brand query result: ${JSON.stringify(brand, null, 2)}`);

      if (!brand) {
        logger.warn(`Brand not found for brandId: ${brandId}`);
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }
      const brandDTO = BrandDTO.fromEntity(brand);
      logger.debug(`BrandDTO created: ${JSON.stringify(brandDTO, null, 2)}`);

      return brandDTO;
    } catch (error) {
      logger.error("Error while getting the brand details", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting brand details"
      );
    }
  }

  async getLimitedBrandDetails(brandId: string) {
    try {
      logger.info(`Fetching limited brand details for brandId: ${brandId}`);

      const brand = await this.brandRepo.findOne({
        where: { brandId },
        select: ["brandId", "brandName"], // Only select the fields we need
      });

      logger.debug(`Brand query result: ${JSON.stringify(brand, null, 2)}`);

      if (!brand) {
        logger.warn(`Brand not found for brandId: ${brandId}`);
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Brand not found"
        );
      }

      const brandLimitedDTO = BrandLimitedDTO.fromEntity(brand);
      logger.debug(
        `BrandLimitedDTO created: ${JSON.stringify(brandLimitedDTO, null, 2)}`
      );

      return brandLimitedDTO;
    } catch (error) {
      logger.error("Error while getting the brand details", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while getting brand details"
      );
    }
  }
}
