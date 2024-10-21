import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { TaskAnalyticsController } from "../../controllers";

const router = Router();

const taskAnalyticsController = new TaskAnalyticsController();

router.get(
  "/analytics",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.MO]),
  taskAnalyticsController.getTaskAnalytics
);

export default router;
