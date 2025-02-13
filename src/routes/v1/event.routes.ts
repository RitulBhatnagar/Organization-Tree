import { Router } from "express";
import { EventController } from "../../controllers/v1/event.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();

const eventController = new EventController();

/**
 * @swagger
 * /api/v1/event:
 *   post:
 *     tags:
 *       - Events
 *     summary: Create a new event
 *     description: Creates a new event in the system. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the event
 *                 example: "event 1"
 *               description:
 *                 type: string
 *                 description: Description of the event
 *                 example: "event 1 has some description"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event created successfully"
 *                 event:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       format: uuid
 *                       example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *                     name:
 *                       type: string
 *                       example: "event 1"
 *                     description:
 *                       type: string
 *                       example: "event 1 has some description"
 *                     deletedAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:10:25.308Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:10:25.308Z"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing name"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating event"
 */
router.post(
  "/event",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.createEvent
);
/**
 * @swagger
 * /api/v1/event/{eventId}:
 *   put:
 *     tags:
 *       - Events
 *     summary: Update an existing event
 *     description: Updates an existing event in the system. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event to update
 *         example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the event
 *                 example: "event1 updated"
 *               description:
 *                 type: string
 *                 description: New description of the event
 *                 example: "nothing much"
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event updated successfully"
 *                 event:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       format: uuid
 *                       example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *                     name:
 *                       type: string
 *                       example: "event1 updated"
 *                     description:
 *                       type: string
 *                       example: "nothing much"
 *                     deletedAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:10:25.308Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T12:14:53.000Z"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing eventId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating event"
 */
router.put(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.updateEvent
);
/**
 * @swagger
 * /api/v1/event/{eventId}:
 *   get:
 *     tags:
 *       - Events
 *     summary: Get an event by ID
 *     description: Retrieves a specific event by its ID. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event to retrieve
 *         example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event retrieved successfully"
 *                 event:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       format: uuid
 *                       example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *                     name:
 *                       type: string
 *                       example: "event1 updated"
 *                     description:
 *                       type: string
 *                       example: "nothing much"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing eventId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving event"
 */
router.get(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.getEvent
);
/**
 * @swagger
 * /api/v1/event/{eventId}:
 *   delete:
 *     tags:
 *       - Events
 *     summary: Delete an event
 *     description: Deletes a specific event by its ID. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the event to delete
 *         example: "fa0d91c4-a5f9-4d6c-a023-4f5e960970dc"
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing eventId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting event"
 */
router.delete(
  "/event/:eventId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  eventController.deleteEvent
);

export default router;
