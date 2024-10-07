import { Request, Response } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { BrandManagementService } from "../../services/v1/brandMangment.service";
import { localConstant } from "../../utils/constant";
import { UserRole } from "../../entities/Role/roleEntity";
import logger from "../../utils/logger";

const brandService = new BrandManagementService();

export class BrandMangmentController {
  async updateBrands(req: Request, res: Response) {
    const { brandId } = req.params;
    const { brandName, revenue, dealCloseValue } = req.body;

    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandId in params",
      });
    }
    if (
      !brandName &&
      brandName.trim() === "" &&
      typeof brandName !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandName in request body",
      });
    }
    if (typeof revenue !== "number" || isNaN(revenue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid revenue in request body",
      });
    }
    if (typeof dealCloseValue !== "number" || isNaN(dealCloseValue)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({});
    }
    try {
      const updateBrand = await brandService.updateBrand(
        brandId,
        brandName,
        revenue,
        dealCloseValue
      );
      return res.status(200).json({
        message: "Brand got upddated",
        brand: updateBrand,
      });
    } catch (error) {
      logger.error("Error while getting brand with owners", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_BRAND,
      });
    }
  }

  async addContactPerson(req: Request, res: Response) {
    const { brandId } = req.params;
    const contactPersonData = req.body;
    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandId in params",
      });
    }
    if (!contactPersonData) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid contactPerson in request body",
      });
    }
    try {
      const addContactPerson = await brandService.addContactPerson(
        brandId,
        contactPersonData
      );
      return res.status(201).json(addContactPerson);
    } catch (error) {
      logger.error("Error while adding contact person", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_CREATING_PERSON,
      });
    }
  }

  async updateContactPerson(req: Request, res: Response) {
    const { brandId, contactId } = req.params;
    const updateData = req.body;
    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid brandId in params",
      });
    }
    if (
      !contactId ||
      contactId.trim() === "" ||
      typeof contactId !== "string"
    ) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid contactId in params",
      });
    }
    if (!updateData) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid contactPerson in request body",
      });
    }
    try {
      const updateContactPerson = await brandService.updateContactPerson(
        brandId,
        contactId,
        updateData
      );
      return res.status(200).json({
        message: "Update the contact person",
        contactPerson: updateContactPerson,
      });
    } catch (error) {
      logger.error("Error while updating contact person", error);
      if (error instanceof APIError) {
        return res
          .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({
            message:
              error.message || localConstant.ERROR_UPDATING_CONTACT_PERSON,
          });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_UPDATING_CONTACT_PERSON,
      });
    }
  }
  async getBrandsList(req: Request, res: Response) {
    const { userId } = req.params;
    if (!userId || userId.trim() === "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in request body",
      });
    }
    try {
      const brands = await brandService.getBrands(userId);
      return res.status(200).json(brands);
    } catch (error) {
      logger.error("Error while getting brand with owners", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_BRANDS,
      });
    }
  }
  async getBrandDetails(req: Request, res: Response) {
    const { brandId } = req.params;
    const userRoles: UserRole[] = req.body.user.roles;

    console.log(brandId);
    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in request body",
      });
    }
    try {
      let brandDetails;
      if (
        userRoles.some((role) =>
          [UserRole.ADMIN, UserRole.BO, UserRole.PO_TO, UserRole.PO].includes(
            role
          )
        )
      ) {
        brandDetails = await brandService.getFullBrandDetails(brandId);
      } else if (userRoles.includes(UserRole.TO)) {
        brandDetails = await brandService.getLimitedBrandDetails(brandId);
      } else {
        throw new APIError(
          "FORBIDDEN",
          HttpStatusCode.FORBIDDEN,
          false,
          "Insufficient permissions to view brand details"
        );
      }
      res.status(HttpStatusCode.OK).json({
        message: "Brand details retrieved successfully",
        brand: brandDetails,
      });
    } catch (error) {
      logger.error("Error while getting brand details", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_GETTING_BRAND_DETAILS,
      });
    }
  }
}
