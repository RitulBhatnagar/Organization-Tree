import { AppDataSource } from "../../config/data-source";
import { Inventory } from "../../entities/Inventory/inventoryEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";

export class InventoryService {
  private inventoryRepo = AppDataSource.getRepository(Inventory);
  async createInventory(name: string, description: string) {
    try {
      const inventory = new Inventory();
      inventory.name = name;
      inventory.description = description;
      await this.inventoryRepo.save(inventory);
      return inventory;
    } catch (error) {
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while creating inventory"
      );
    }
  }
  async updateInventory(
    inventoryId: string,
    name: string,
    description: string
  ) {
    try {
      const inventory = await this.inventoryRepo.findOne({
        where: { inventoryId },
      });
      if (!inventory) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Inventory not found"
        );
      }
      inventory.name = name;
      inventory.description = description;
      await this.inventoryRepo.save(inventory);
      return inventory;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while updating inventory"
      );
    }
  }

  async getInventory(inventoryId: string) {
    try {
      const inventory = await this.inventoryRepo.findOne({
        where: { inventoryId },
        relations: ["task"],
        select: {
          inventoryId: true,
          name: true,
          description: true,
          task: {
            taskId: true,
            taskType: true,
            name: true,
          },
        },
      });
      if (!inventory) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Inventory not found"
        );
      }
      return inventory;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while getting inventory"
      );
    }
  }

  async deleteInventory(inventoryId: string) {
    try {
      const inventory = await this.inventoryRepo.findOne({
        where: { inventoryId },
      });
      if (!inventory) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Inventory not found"
        );
      }
      await this.inventoryRepo.remove(inventory);
      return inventory;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while deleting inventory"
      );
    }
  }
}
