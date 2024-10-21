import { Request, Response } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { BrandManagementService } from "../../services/v1/brandMangment.service";
import { ErrorCommonStrings, localConstant } from "../../utils/constant";
import { UserRole } from "../../entities/Role/roleEntity";
import logger from "../../utils/logger";
import { access } from "fs/promises";

const brandService = new BrandManagementService();

export class BrandMangmentController {
  async updateBrands(req: Request, res: Response) {
    const { brandId } = req.params;
    const accessLevel = req.user?.accessLevel;
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
      if (accessLevel === "full") {
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
      } else {
        throw new APIError(
          ErrorCommonStrings.UNAUTHORIZED_REQUEST,
          HttpStatusCode.UNAUTHORIZED,
          false,
          "You are not authorized to update this brand"
        );
      }
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
    const accessLevel = req.user?.accessLevel;
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
      if (accessLevel === "full") {
        const addContactPerson = await brandService.addContactPerson(
          brandId,
          contactPersonData
        );
        return res.status(201).json(addContactPerson);
      }

      throw new APIError(
        ErrorCommonStrings.UNAUTHORIZED_REQUEST,
        HttpStatusCode.UNAUTHORIZED,
        false,
        "You are not authorized to add contact person to this brand"
      );
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
    const accessLevel = req.user?.accessLevel;
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
      if (accessLevel === "full") {
        const updateContactPerson = await brandService.updateContactPerson(
          brandId,
          contactId,
          updateData
        );
        return res.status(200).json(updateContactPerson);
      }

      throw new APIError(
        ErrorCommonStrings.UNAUTHORIZED_REQUEST,
        HttpStatusCode.UNAUTHORIZED,
        false,
        "You are not authorized to update contact person"
      );
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
    const accessLevel = req.user?.accessLevel;
    if (!userId || userId.trim() === "" || typeof userId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in request body",
      });
    }
    try {
      if (accessLevel === "full") {
        const brands = await brandService.getBrands(userId);
        return res.status(200).json(brands);
      }
      throw new APIError(
        ErrorCommonStrings.UNAUTHORIZED_REQUEST,
        HttpStatusCode.UNAUTHORIZED,
        false,
        "You are not authorized to get brands list"
      );
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
    const accessLevel = req.user?.accessLevel;
    if (!brandId || brandId.trim() === "" || typeof brandId !== "string") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        message: "Missing or invalid userId in request body",
      });
    }
    try {
      let brandDetails;
      if (accessLevel === "limited") {
        brandDetails = await brandService.getLimitedBrandDetails(brandId);
      } else if (accessLevel === "full") {
        brandDetails = await brandService.getFullBrandDetails(brandId);
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
