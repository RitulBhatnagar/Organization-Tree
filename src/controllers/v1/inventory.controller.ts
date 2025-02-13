import { Request, Response } from "express";
import { InventoryService } from "../../services/v1/inventory.service";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import logger from "../../utils/logger";

const inventoryService = new InventoryService();

export class InventoryController {
  async createInventory(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing name" });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing description" });
      }

      const inventory = await inventoryService.createInventory(
        name,
        description
      );

      return res.status(HttpStatusCode.CREATED).json({
        message: "Inventory created successfully",
        inventory,
      });
    } catch (error) {
      logger.error("Error in createInventory controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error creating inventory",
      });
    }
  }

  async updateInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;
      const { name, description } = req.body;

      // Validate required fields
      if (!inventoryId || typeof inventoryId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing inventoryId" });
      }

      if (!name || typeof name !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing name" });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing description" });
      }

      const inventory = await inventoryService.updateInventory(
        inventoryId,
        name,
        description
      );

      return res.status(HttpStatusCode.OK).json({
        message: "Inventory updated successfully",
      });
    } catch (error) {
      logger.error("Error in updateInventory controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error updating inventory",
      });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      // Validate required fields
      if (!inventoryId || typeof inventoryId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing inventoryId" });
      }

      const inventory = await inventoryService.getInventory(inventoryId);

      return res.status(HttpStatusCode.OK).json({
        message: "Inventory retrieved successfully",
        inventory,
      });
    } catch (error) {
      logger.error("Error in getInventory controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving inventory",
      });
    }
  }

  async deleteInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      // Validate required fields
      if (!inventoryId || typeof inventoryId !== "string") {
        return res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ message: "Invalid or missing inventoryId" });
      }

      await inventoryService.deleteInventory(inventoryId);

      return res.status(HttpStatusCode.OK).json({
        message: "Inventory deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteInventory controller:", error);

      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting inventory",
      });
    }
  }
}
