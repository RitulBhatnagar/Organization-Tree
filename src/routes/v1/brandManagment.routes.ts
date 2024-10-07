import { Router } from "express";
import { BrandMangmentController } from "../../controllers/v1/brandMangment.controller";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { User } from "../../entities/user/userEntity";
import { authenticate } from "../../middleware/authentication";
const router = Router();
const brandMangmentController = new BrandMangmentController();
router.put(
  "/brands/:brandId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.updateBrands
);

router.post(
  "/brands/:brandId/contacts",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.addContactPerson
);

router.put(
  "/brands/:brandId/contacts/:contactId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.updateContactPerson
);

// list of brands ownned by bo
router.get(
  "/brands/users/:userId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.getBrandsList
);

router.get(
  "/brands/:brandId",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.BO,
    UserRole.PO,
    UserRole.PO_TO,
    UserRole.TO,
  ]),
  brandMangmentController.getBrandDetails
);

export default router;
