import { Router } from "express";
import { TaskHistoryController } from "../../controllers";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
const router = Router();

const taskHistoryController = new TaskHistoryController();

router.get(
  "/history/task/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.MO, UserRole.PO, UserRole.BO]),
  taskHistoryController.getTaskHistoryByTaskId
);

export default router;
