import { Router } from "express";
import { UserLoginController } from "../../controllers/v1/userLogin.controller";

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate a user and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     department:
 *                       type: string
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid email or password format
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               name:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       200:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 department:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         description: Internal server error
 */

const router = Router();
const userLoginController = new UserLoginController();

router.post("/login", userLoginController.login);
router.post("/signup", userLoginController.signup);

export default router;
