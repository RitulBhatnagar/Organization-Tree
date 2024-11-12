import { Router } from "express";
import { CollaboratorsController } from "../../controllers";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const collaboratorController = new CollaboratorsController();

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Collaborators
 *   description: API endpoints for managing task collaborators
 */

/**
 * @swagger
 * /api/v1/collaborators/add/{taskId}:
 *   post:
 *     summary: Add collaborators to a task
 *     tags: [Collaborators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollaboratorRequest'
 *     responses:
 *       201:
 *         description: Collaborators added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Task or users not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/collaborators/add/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.addCollaborators
);

/**
 * @swagger
 * /api/v1/collaborators/remove/{taskId}:
 *   post:
 *     summary: Remove collaborators from a task
 *     tags: [Collaborators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollaboratorRequest'
 *     responses:
 *       200:
 *         description: Collaborators removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Task, users, or collaborators not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/collaborators/remove/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.removeCollaborators
);

/**
 * @swagger
 * /api/v1/collaborators/{userId}:
 *   get:
 *     summary: Get all tasks where user is a collaborator
 *     tags: [Collaborators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollaboratorTasksResponse'
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/collaborators/:userId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.TO, UserRole.PO]),
  collaboratorController.getCollaboratorsTasks
);

export default router;
