import { Router } from "express";
import { TaskController } from "../../controllers/v1/task.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * /api/v1/task/create:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task with assigned users and optional related entity
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTaskResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid task name"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User does not have required roles [ADMIN, MO, PO]
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Creator not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating task"
 */
router.post(
  "/task/create",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.MO, UserRole.PO]),
  taskController.createTask
);

/**
 * @swagger
 * components:
 *   schemas:
 *     CompletedStatus:
 *       type: string
 *       enum: [PENDING, COMPLETED, OVERDUE]
 *     MarkTaskCompletedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Task marked as completed successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/task/{taskId}/complete:
 *   post:
 *     summary: Mark a task as completed
 *     description: Allows an assigned user to mark their task as completed. Only users assigned to the task can mark it as completed.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to be marked as completed
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Task successfully marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarkTaskCompletedResponse'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidTaskId:
 *                 value:
 *                   message: "Invalid or missing taskId"
 *               invalidUserId:
 *                 value:
 *                   message: "Invalid or missing userId"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User is not allowed to complete this task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not allowed to change the task status"
 *       404:
 *         description: Task or assigned person not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               taskNotFound:
 *                 value:
 *                   message: "Task not found"
 *               assignedPersonNotFound:
 *                 value:
 *                   message: "assigned person not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Error while marking the task completed"
 */
router.post(
  "/task/:taskId/complete",
  authenticate,
  checkRoles([UserRole.BO]),
  taskController.markTaskCompleted
);

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTaskRequest:
 *       type: object
 *       required:
 *         - name
 *         - taskType
 *         - dueDate
 *         - creatorId
 *         - assignPersonRemove
 *         - assignPersonAdd
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the task
 *           example: "Updated task name"
 *         description:
 *           type: string
 *           description: Updated description of the task
 *           example: "Updated task description"
 *         taskType:
 *           $ref: '#/components/schemas/TaskType'
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Updated due date for the task
 *           example: "2024-12-31T23:59:59Z"
 *         creatorId:
 *           type: string
 *           format: uuid
 *           description: ID of the task creator
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         assignPersonRemove:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of assigned person IDs to remove from the task
 *           example: ["123e4567-e89b-12d3-a456-426614174001"]
 *         assignPersonAdd:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Array of user IDs to add as assigned persons
 *           example: ["123e4567-e89b-12d3-a456-426614174002"]
 *         realtedEntityId:
 *           type: string
 *           format: uuid
 *           description: ID of the related entity (brand, event, or inventory)
 *           example: "123e4567-e89b-12d3-a456-426614174003"
 *     UpdateTaskResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Task updated successfully"
 */

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   put:
 *     summary: Update an existing task
 *     description: Update task details including name, description, type, due date, and assigned persons. Only ADMIN, PO, and MO roles can perform this action.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTaskResponse'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               invalidTaskId:
 *                 value:
 *                   message: "Invalid or missing taskId"
 *               invalidName:
 *                 value:
 *                   message: "Invalid or missing task name"
 *               invalidTaskType:
 *                 value:
 *                   message: "Invalid task type"
 *               invalidCreatorId:
 *                 value:
 *                   message: "Invalid creator ID"
 *               invalidAssignPersons:
 *                 value:
 *                   message: "Invalid assigned person IDs"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User does not have required roles [ADMIN, PO, MO]
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               taskNotFound:
 *                 value:
 *                   message: "Task not found"
 *               creatorNotFound:
 *                 value:
 *                   message: "Creator not found"
 *               assignedPersonNotFound:
 *                 value:
 *                   message: "Assigned person that you want to remove not found"
 *               relatedEntityNotFound:
 *                 value:
 *                   message: "Related entity not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Error while updating task"
 */
router.put(
  "/task/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO, UserRole.MO]),
  taskController.updateTask
);

/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteTaskResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Task deleted successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task. Only the task creator with appropriate roles (ADMIN, PO, MO) can delete the task.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Task successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteTaskResponse'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidTaskId:
 *                 value:
 *                   message: "Invalid or missing taskId"
 *               invalidUserId:
 *                 value:
 *                   message: "Invalid or missing userId"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User is not allowed to delete this task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not allowed to delete the task"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Task not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Error while deleting the task"
 */
router.delete(
  "/task/:taskId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO, UserRole.MO]),
  taskController.deleteTask
);

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskList:
 *       type: object
 *       properties:
 *         taskId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         taskType:
 *           $ref: '#/components/schemas/TaskType'
 *         finishedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *         completedStatus:
 *           $ref: '#/components/schemas/CompletedStatus'
 *         creator:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             name:
 *               type: string
 *         assignedPersons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               assignedPersonId:
 *                 type: string
 *               user:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *         relatedBrand:
 *           type: object
 *           nullable: true
 *           properties:
 *             brandId:
 *               type: string
 *             brandName:
 *               type: string
 *         relatedEvent:
 *           type: object
 *           nullable: true
 *           properties:
 *             eventId:
 *               type: string
 *             name:
 *               type: string
 *         relatedInventory:
 *           type: object
 *           nullable: true
 *           properties:
 *             inventoryId:
 *               type: string
 *             name:
 *               type: string
 *         commentCount:
 *           type: number
 *     TaskListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Tasks retrieved successfully"
 *         tasks:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskList'
 *             meta:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 100
 *                 page:
 *                   type: number
 *                   example: 1
 *                 limit:
 *                   type: number
 *                   example: 10
 *                 totalPage:
 *                   type: number
 *                   example: 10
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get paginated list of tasks with filters
 *     description: Retrieves a list of tasks with optional filters and pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: taskType
 *         schema:
 *           $ref: '#/components/schemas/TaskType'
 *         description: Filter tasks by type
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error while getting tasks"
 */
router.get("/tasks", authenticate, taskController.getTasks);

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskDetail:
 *       type: object
 *       properties:
 *         taskId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         taskType:
 *           $ref: '#/components/schemas/TaskType'
 *         completedStatus:
 *           $ref: '#/components/schemas/CompletedStatus'
 *         dueDate:
 *           type: string
 *           format: date-time
 *         finishedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         creator:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         assignedPersons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               assignedPersonId:
 *                 type: string
 *                 format: uuid
 *               user:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *         relatedBrand:
 *           type: object
 *           nullable: true
 *           properties:
 *             brandId:
 *               type: string
 *               format: uuid
 *             brandName:
 *               type: string
 *         relatedEvent:
 *           type: object
 *           nullable: true
 *           properties:
 *             eventId:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         relatedInventory:
 *           type: object
 *           nullable: true
 *           properties:
 *             inventoryId:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *     SingleTaskResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Task retrieved successfully"
 *         task:
 *           $ref: '#/components/schemas/TaskDetail'
 */

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     description: Retrieves detailed information about a specific task including creator, assigned persons, and related entities
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to retrieve
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Task successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleTaskResponse'
 *       400:
 *         description: Invalid task ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing taskId"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error while getting task"
 */
router.get("/task/:taskId", authenticate, taskController.getTask);

export default router;
