import { Router } from "express";
import { UserController } from "../../controllers/v1/user.controller";
import { UserRole } from "../../entities/Role/roleEntity";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
const router = Router();
const userController = new UserController();
/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user details
 *     description: Retrieve detailed information about a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: Unique identifier of the user
 *                 name:
 *                   type: string
 *                   description: User's full name
 *                 email:
 *                   type: string
 *                   description: User's email address
 *                 department:
 *                   type: string
 *                   nullable: true
 *                   description: User's department
 *                 roles:
 *                   type: array
 *                   description: List of roles assigned to the user
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleId:
 *                         type: string
 *                         description: Unique identifier of the role
 *                       roleName:
 *                         type: string
 *                         description: Name of the role
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/:userId", authenticate, userController.getUserDetails);
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search users
 *     description: Search users by name (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name to search for (partial match)
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
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SimplifiedUser'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of users matching the search
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
 *         description: Forbidden - User does not have admin role
 *       500:
 *         description: Internal server error
 */

router.get(
  "/users",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  userController.searchUser
);

/**
 * @swagger
 * /api/v1/users/{userId}/teammates:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user's teammates
 *     description: Retrieve a list of teammates including manager, subordinates, and siblings (other team members under the same manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
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
 *         description: Team members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team members fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teammate'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of teammates
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/users/:userId/teammates",
  authenticate,
  userController.getTeammates
);

export default router;
