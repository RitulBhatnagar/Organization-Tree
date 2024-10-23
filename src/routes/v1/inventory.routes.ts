import { Router } from "express";
import { InventoryController } from "../../controllers";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();

const inventoryController = new InventoryController();

router.post(
  "/inventory",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.createInventory
);

router.put(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.updateInventory
);

router.get(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.getInventory
);

router.delete(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.deleteInventory
);

export default router;
