import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { NotificationController } from "../../controllers";

const router = Router();

const notificationController = new NotificationController();

router.get(
  "/notifications",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  notificationController.getNotifications
);

router.post(
  "/notifications/message/:messageId/seen",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  notificationController.markAsSeen
);

export default router;
