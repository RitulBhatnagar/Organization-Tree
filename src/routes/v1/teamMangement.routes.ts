import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { TeamMangementController } from "../../controllers/v1/teamMangement.controller";

const router = Router();
const teamManagementController = new TeamMangementController();

router.get(
  "/teams/:teamId/users",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO_TO, UserRole.TO, UserRole.PO]),
  teamManagementController.getTeamMembers
);

router.get(
  "/teams/:teamId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO_TO, UserRole.TO, UserRole.PO]),
  teamManagementController.getTeam
);

export default router;
