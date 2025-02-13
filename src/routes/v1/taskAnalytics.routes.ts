import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { TaskAnalyticsController } from "../../controllers";

const router = Router();

const taskAnalyticsController = new TaskAnalyticsController();

/**
 * @swagger
 * /api/v1/task-analytics/analytics:
 *   get:
 *     summary: Get task analytics data
 *     description: Retrieve analytics data for tasks based on a time filter
 *     tags:
 *       - Task Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - Today
 *             - Last 3 Days
 *             - Last 7 Days
 *             - Last 15 Days
 *             - Last Month
 *             - This Month
 *             - All Time
 *         description: Time filter for analytics data
 *     responses:
 *       200:
 *         description: Task analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task analytics retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       totalTasksCreated:
 *                         type: number
 *                         example: 100
 *                       completedTasks:
 *                         type: number
 *                         example: 75
 *                       openTasks:
 *                         type: number
 *                         example: 20
 *                       overdueTasks:
 *                         type: number
 *                         example: 5
 *                       generalServiceTasks:
 *                         type: number
 *                         example: 30
 *                       brandRelatedTasks:
 *                         type: number
 *                         example: 25
 *                       eventRelatedTasks:
 *                         type: number
 *                         example: 25
 *                       inventoryRelatedTasks:
 *                         type: number
 *                         example: 20
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid or missing filter parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or missing filter
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching task analytics
 */
router.get(
  "/analytics",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.MO]),
  taskAnalyticsController.getTaskAnalytics
);

export default router;
