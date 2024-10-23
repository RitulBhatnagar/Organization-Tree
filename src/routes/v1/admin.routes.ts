import { Router } from "express";
import { AdminController } from "../../controllers/v1/admin.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
const router = Router();
const adminController = new AdminController();
router.post(
  "/admin/users",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.createUser
);

// update the user basic details
router.put(
  "/admin/user/:userId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateUser
);

// update the team basic details
router.put(
  "/admin/team/:teamId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateTeam
);

// shift user to different team
router.post(
  "/admin/user/:userId/team/:teamId/shiftTeam",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.shiftUserToDifferentTeam
);

router.post(
  "/admin/users/:userId/roles",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignRole
);
router.post(
  "/admin/user/:userId/team",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignUserToTeam
);
router.post(
  "/admin/brands",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.createBrand
);
router.put(
  "/admin/brands/:brandId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateBrand
);
router.post(
  "/admin/brands/:brandId/owners",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignBrandToBo
);
router.get(
  "/admin/brands",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.getBrandWithOwners
);
router.get(
  "/admin/users/:userId/hierarchy",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.getHierarchy
);

export default router;
