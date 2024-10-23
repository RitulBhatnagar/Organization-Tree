import { Router } from "express";
import { EventController } from "../../controllers/v1/event.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();

const eventController = new EventController();

router.post(
  "/event",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.createEvent
);

router.put(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.updateEvent
);

router.get(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.getEvent
);

router.delete(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.deleteEvent
);

export default router;
