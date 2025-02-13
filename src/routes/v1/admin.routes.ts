import { Router } from "express";
import { AdminController } from "../../controllers/v1/admin.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * /api/v1/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new user
 *     description: Creates a new user in the system. Only accessible by admin users.
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
 *               - email
 *               - department
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: "john.doe@example.com"
 *               department:
 *                 type: string
 *                 description: Department the user belongs to
 *                 example: "Engineering"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "StrongPassword123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 department:
 *                   type: string
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with this email already exists"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the name"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the email"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the department"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the password"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authenticated."
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied. Admin privileges required."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating User"
 */
router.post(
  "/admin/users",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.createUser
);

// update the user basic details
/**
 * @swagger
 * /api/v1/admin/user/{userId}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a user
 *     description: Updates an existing user's information. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated full name of the user
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address of the user
 *                 example: "john.doe.updated@example.com"
 *               department:
 *                 type: string
 *                 description: Updated department of the user
 *                 example: "Engineering Department"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User successfully updated"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     department:
 *                       type: string
 *                     roles:
 *                        type: array
 *
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid userId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid name in request body"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid email in request body"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid department in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating user"
 */
router.put(
  "/admin/user/:userId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateUser
);

// update the team basic details
/**
 * @swagger
 * /api/v1/admin/team/{teamId}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update a team
 *     description: Updates an existing team's information. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the team to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *               - teamDescription
 *             properties:
 *               teamName:
 *                 type: string
 *                 description: Updated name of the team
 *                 example: "Engineering Team Alpha"
 *               teamDescription:
 *                 type: string
 *                 description: Updated description of the team
 *                 example: "Core engineering team responsible for backend development"
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:
 *                   type: string
 *                   format: uuid
 *                 teamName:
 *                   type: string
 *                 teamDescription:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid teamId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid teamName in request body"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid teammDescription in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating team"
 */
router.put(
  "/admin/team/:teamId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateTeam
);

// shift user to different team
/**
 * @swagger
 * /api/v1/admin/user/{userId}/team/{teamId}/shiftTeam:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Shift user to a different team
 *     description: Moves a user from their current team to a new team. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to be shifted
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user's current team
 *         example: "987fcdeb-51a2-43b7-91d8-3e5c928f1000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newTeamId
 *             properties:
 *               newTeamId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the team to shift the user to
 *                 example: "456bcdef-89a1-23c4-56d7-8e9f012345ab"
 *     responses:
 *       200:
 *         description: User successfully shifted to new team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User successfully shifted to new team"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid userId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid teamId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid newTeamId in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "User not found"
 *                 - properties:
 *                     message:
 *                       example: "Current team not found"
 *                 - properties:
 *                     message:
 *                       example: "New team not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error shifting user team"
 */
router.post(
  "/admin/user/:userId/team/:teamId/shiftTeam",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.shiftUserToDifferentTeam
);
/**
 * @swagger
 * /api/v1/admin/users/{userId}/roles:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Assign role to user
 *     description: Assigns a new role to an existing user. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to assign role to
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 description: Role to be assigned to the user
 *                 enum: [po, bo, to, po_to]
 *                 example: "po"
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role assigned successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [PO, BO, TO, PO_TO]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing params, Please provide the userId"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the role"
 *                 - properties:
 *                     message:
 *                       example: "Invalid role provided"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error assigning role to user"
 */
router.post(
  "/admin/users/:userId/roles",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignRole
);

/**
 * @swagger
 * /api/v1/admin/user/{userId}/team:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Assign user to team
 *     description: Assigns a user to a specific team. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to be assigned to a team
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the team to assign the user to
 *                 example: "987fcdeb-51a2-43b7-91d8-3e5c928f1000"
 *     responses:
 *       200:
 *         description: User successfully assigned to team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 teamId:
 *                   type: string
 *                   format: uuid
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing params, Please provide the userId"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the teamId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "User not found"
 *                 - properties:
 *                     message:
 *                       example: "Team not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error assigning role to user"
 */
router.post(
  "/admin/user/:userId/team",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignUserToTeam
);

/**
 * @swagger
 * /api/v1/admin/brands:
 *   post:
 *     tags:
 *       - Admin
 *       - Brands
 *     summary: Create a new brand
 *     description: Creates a new brand with revenue and deal close value details. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *               - revenue
 *               - dealCloseValue
 *             properties:
 *               brandName:
 *                 type: string
 *                 description: Name of the brand
 *                 example: "Nike"
 *               revenue:
 *                 type: number
 *                 format: float
 *                 description: Revenue value for the brand
 *                 example: 1000000.50
 *               dealCloseValue:
 *                 type: number
 *                 format: float
 *                 description: Deal close value for the brand
 *                 example: 50000.75
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brandId:
 *                   type: string
 *                   format: uuid
 *                 brandName:
 *                   type: string
 *                 revenue:
 *                   type: number
 *                   format: float
 *                 dealCloseValue:
 *                   type: number
 *                   format: float
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid brandName"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid revenue"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid dealCloseValue"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       409:
 *         description: Conflict - Brand name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand with this name already exists"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating brand"
 */
router.post(
  "/admin/brands",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.createBrand
);

/**
 * @swagger
 * /api/v1/admin/brands/{brandId}:
 *   put:
 *     tags:
 *       - Admin
 *       - Brands
 *     summary: Update a brand
 *     description: Updates an existing brand's information including name, revenue, and deal close value. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the brand to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *               - revenue
 *               - dealCloseValue
 *             properties:
 *               brandName:
 *                 type: string
 *                 description: Updated name of the brand
 *                 example: "Nike International"
 *               revenue:
 *                 type: number
 *                 format: float
 *                 description: Updated revenue value for the brand
 *                 example: 1500000.75
 *               dealCloseValue:
 *                 type: number
 *                 format: float
 *                 description: Updated deal close value for the brand
 *                 example: 75000.50
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand successfully updated"
 *                 brand:
 *                   type: object
 *                   properties:
 *                     brandId:
 *                       type: string
 *                       format: uuid
 *                     brandName:
 *                       type: string
 *                     revenue:
 *                       type: number
 *                       format: float
 *                     dealCloseValue:
 *                       type: number
 *                       format: float
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid brandId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid brandName in request body"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid revenue in request body"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid dealCloseValue in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand not found"
 *       409:
 *         description: Conflict - Brand name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand with this name already exists"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating brand"
 */
router.put(
  "/admin/brands/:brandId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.updateBrand
);
/**
 * @swagger
 * /api/v1/admin/brands/{brandId}/owners:
 *   post:
 *     tags:
 *       - Admin
 *       - Brands
 *     summary: Assign brand to Business Owner
 *     description: Assigns a brand to a Business Owner (BO). Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the brand to be assigned
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boId
 *             properties:
 *               boId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the Business Owner to assign the brand to
 *                 example: "987fcdeb-51a2-43b7-91d8-3e5c928f1000"
 *     responses:
 *       200:
 *         description: Brand successfully assigned to BO
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brandId:
 *                   type: string
 *                   format: uuid
 *                 brandName:
 *                   type: string
 *                 revenue:
 *                   type: number
 *                   format: float
 *                 dealCloseValue:
 *                   type: number
 *                   format: float
 *                 ownerId:
 *                   type: string
 *                   format: uuid
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid brandId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid boId in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Brand not found"
 *                 - properties:
 *                     message:
 *                       example: "Business Owner not found"
 *       409:
 *         description: Conflict - Brand already assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand is already assigned to a Business Owner"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error assigning brand to BO"
 */
router.post(
  "/admin/brands/:brandId/owners",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.assignBrandToBo
);
/**
 * @swagger
 * /api/v1/admin/brands:
 *   get:
 *     tags:
 *       - Admin
 *       - Brands
 *     summary: Get all brands with their owners
 *     description: Retrieves a paginated list of all brands with their assigned owners. Only accessible by admin users.
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
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Brands with owners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand with owners retrieved successfully"
 *                 brand:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           brandId:
 *                             type: string
 *                             format: uuid
 *                           brandName:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                             format: float
 *                           dealCloseValue:
 *                             type: number
 *                             format: float
 *                           owner:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                           example: false
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
 *                   example: "Error getting brand with owners"
 */
router.get(
  "/admin/brands",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.getBrandWithOwners
);
/**
 * @swagger
 * /api/v1/admin/users/{userId}/hierarchy:
 *   get:
 *     tags:
 *       - Admin
 *       - Users
 *     summary: Get user hierarchy
 *     description: Retrieves the hierarchical structure of teams and users under a specific user. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to get hierarchy for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: User hierarchy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User hierarchy retrieved successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                     teams:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           teamId:
 *                             type: string
 *                             format: uuid
 *                           teamName:
 *                             type: string
 *                           members:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 userId:
 *                                   type: string
 *                                   format: uuid
 *                                 name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                   format: email
 *                                 role:
 *                                   type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 50
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing or invalid userId in params"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting user hierarchy"
 */
router.get(
  "/admin/users/:userId/hierarchy",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  adminController.getHierarchy
);

export default router;
