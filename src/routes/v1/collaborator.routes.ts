import { Router } from "express";
import { CollaboratorsController } from "../../controllers";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const collaboratorController = new CollaboratorsController();

const router = Router();

router.post(
  "/collaborators/add/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.addCollaborators
);
router.post(
  "/collaborators/remove/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.removeCollaborators
);

router.get(
  "/collaborators/:userId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.getCollaboratorsTasks
);

export default router;
