import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { TeamMangementController } from "../../controllers/v1/teamMangement.controller";

const router = Router();
const teamManagementController = new TeamMangementController();

/**
 * @swagger
 * /api/v1/teams/{teamId}/users:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get team members hierarchy
 *     description: Retrieve hierarchical structure of team members (Requires ADMIN, PO_TO, TO, or PO role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the team
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
 *         description: Team members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team members retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HierarchicalTeam'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of team members
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/teams/:teamId/users",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO_TO, UserRole.TO, UserRole.PO]),
  teamManagementController.getTeamMembers
);
/**
 * @swagger
 * /api/v1/teams/{teamId}:
 *   get:
 *     tags:
 *       - Teams
 *     summary: Get team details
 *     description: Retrieve detailed information about a specific team (Requires ADMIN, PO_TO, TO, or PO role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the team
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team retrieved successfully"
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       403:
 *         description: Forbidden - User does not have required role
 *       404:
 *         description: Team not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/teams/:teamId",
  authenticate,
  checkRoles([UserRole.ADMIN, UserRole.PO_TO, UserRole.TO, UserRole.PO]),
  teamManagementController.getTeam
);

export default router;
