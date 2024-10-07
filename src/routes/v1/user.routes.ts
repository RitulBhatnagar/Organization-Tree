import { Router } from "express";
import { UserController } from "../../controllers/v1/user.controller";
import { UserRole } from "../../entities/Role/roleEntity";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
const router = Router();
const userController = new UserController();
router.get("/users/:userId", authenticate, userController.getUserDetails);
router.get(
  "/users",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  userController.searchUser
);
router.get(
  "/users/:userId/teammates",
  authenticate,
  userController.getTeammates
);

export default router;
