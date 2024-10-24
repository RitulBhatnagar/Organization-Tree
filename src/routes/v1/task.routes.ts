import { Router } from "express";
import { TaskController } from "../../controllers/v1/task.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();
const taskController = new TaskController();
// console.log("requesting");
router.post(
  "/task/create",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.MO, UserRole.PO]),
  taskController.createTask
);
router.post(
  "/task/:taskId/complete",
  authenticate,
  checkRoles([UserRole.BO]),
  taskController.markTaskCompleted
);

router.put(
  "/task/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO, UserRole.MO]),
  taskController.updateTask
);

router.delete(
  "/task/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO, UserRole.MO]),
  taskController.deleteTask
);

router.get("/tasks", authenticate, taskController.getTasks);
router.get("/tasks/filters", authenticate, taskController.getFilterCounts);

router.get("/task/:taskId", authenticate, taskController.getTask);

export default router;
