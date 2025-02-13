import { Router } from "express";
import { BrandMangmentController } from "../../controllers/v1/brandMangment.controller";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
import { User } from "../../entities/user/userEntity";
import { authenticate } from "../../middleware/authentication";
const router = Router();
const brandMangmentController = new BrandMangmentController();

/**
 * @swagger
 * /api/v1/brands/{brandId}:
 *   put:
 *     tags:
 *       - Brand Management
 *     summary: Update brand details
 *     description: Updates a brand's information. Accessible by Business Owners (BO) and Admins with full access level.
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
 *                   example: "Brand got upddated"
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
 *         description: Forbidden - User not authorized or insufficient access level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update this brand"
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
  "/brands/:brandId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.updateBrands
);
/**
 * @swagger
 * /api/v1/brands/{brandId}/contacts:
 *   post:
 *     tags:
 *       - Brand Management
 *       - Contacts
 *     summary: Add contact person to brand
 *     description: Adds a new contact person to a specific brand. Accessible by Business Owners (BO) and Admins with full access level.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the brand to add contact person to
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
 *               - phoneNumber
 *               - designation
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the contact person
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the contact person
 *                 example: "john.doe@company.com"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the contact person
 *                 example: "+1-234-567-8900"
 *               designation:
 *                 type: string
 *                 description: Job title or designation of the contact person
 *                 example: "Sales Manager"
 *               department:
 *                 type: string
 *                 description: Department of the contact person
 *                 example: "Sales"
 *     responses:
 *       201:
 *         description: Contact person added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contactId:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 phoneNumber:
 *                   type: string
 *                 designation:
 *                   type: string
 *                 department:
 *                   type: string
 *                 brandId:
 *                   type: string
 *                   format: uuid
 *                 createdAt:
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
 *                       example: "Missing or invalid contactPerson in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized or insufficient access level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to add contact person to this brand"
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating contact person"
 */
router.post(
  "/brands/:brandId/contacts",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.addContactPerson
);
/**
 * @swagger
 * /api/v1/brands/{brandId}/contacts/{contactId}:
 *   put:
 *     tags:
 *       - Brand Management
 *       - Contacts
 *     summary: Update contact person details
 *     description: Updates an existing contact person's information for a specific brand. Accessible by Business Owners (BO) and Admins with full access level.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the brand containing the contact person
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the contact person to update
 *         example: "987fcdeb-51a2-43b7-91d8-3e5c928f1000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated full name of the contact person
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address of the contact person
 *                 example: "john.doe.updated@company.com"
 *               phoneNumber:
 *                 type: string
 *                 description: Updated phone number of the contact person
 *                 example: "+1-234-567-8901"
 *               designation:
 *                 type: string
 *                 description: Updated job title or designation of the contact person
 *                 example: "Senior Sales Manager"
 *               department:
 *                 type: string
 *                 description: Updated department of the contact person
 *                 example: "Sales Operations"
 *     responses:
 *       200:
 *         description: Contact person updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contactId:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 phoneNumber:
 *                   type: string
 *                 designation:
 *                   type: string
 *                 department:
 *                   type: string
 *                 brandId:
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
 *                       example: "Missing or invalid contactId in params"
 *                 - properties:
 *                     message:
 *                       example: "Missing or invalid contactPerson in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized or insufficient access level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update contact person"
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
 *                       example: "Contact person not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating contact person"
 */
router.put(
  "/brands/:brandId/contacts/:contactId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.updateContactPerson
);

// list of brands ownned by bo
/**
 * @swagger
 * /api/v1/brands/users/{userId}:
 *   get:
 *     tags:
 *       - Brand Management
 *     summary: Get list of brands for a user
 *     description: Retrieves all brands associated with a specific user. Accessible by Business Owners (BO) and Admins with full access level.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to get brands for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Brands list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   brandId:
 *                     type: string
 *                     format: uuid
 *                   brandName:
 *                     type: string
 *                     example: "Nike"
 *                   revenue:
 *                     type: number
 *                     format: float
 *                     example: 1500000.75
 *                   dealCloseValue:
 *                     type: number
 *                     format: float
 *                     example: 75000.50
 *                   contacts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         contactId:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                           format: email
 *                         phoneNumber:
 *                           type: string
 *                         designation:
 *                           type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing or invalid userId in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized or insufficient access level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to get brands list"
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
 *                   example: "Error getting brands"
 */
router.get(
  "/brands/users/:userId",
  authenticate,
  checkRoles([UserRole.BO, UserRole.ADMIN]),
  brandMangmentController.getBrandsList
);
/**
 * @swagger
 * /api/v1/brands/{brandId}:
 *   get:
 *     tags:
 *       - Brand Management
 *     summary: Get brand details
 *     description: Retrieves details of a specific brand. Access level determines the amount of information returned. Admin and BO get full access, while PO, PO_TO, and TO get limited access.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the brand to retrieve details for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Brand details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Brand details retrieved successfully"
 *                 brand:
 *                   type: object
 *                   oneOf:
 *                     - description: Full access response (Admin, BO)
 *                       properties:
 *                         brandId:
 *                           type: string
 *                           format: uuid
 *                         brandName:
 *                           type: string
 *                           example: "Nike"
 *                         revenue:
 *                           type: number
 *                           format: float
 *                           example: 1500000.75
 *                         dealCloseValue:
 *                           type: number
 *                           format: float
 *                           example: 75000.50
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               contactId:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                               phoneNumber:
 *                                 type: string
 *                               designation:
 *                                 type: string
 *                               department:
 *                                 type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     - description: Limited access response (PO, PO_TO, TO)
 *                       properties:
 *                         brandId:
 *                           type: string
 *                           format: uuid
 *                         brandName:
 *                           type: string
 *                           example: "Nike"
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                               phoneNumber:
 *                                 type: string
 *                               designation:
 *                                 type: string
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing or invalid userId in request body"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Insufficient permissions to view brand details"
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting brand details"
 */
router.get(
  "/brands/:brandId",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.BO,
    UserRole.PO,
    UserRole.PO_TO,
    UserRole.TO,
  ]),
  brandMangmentController.getBrandDetails
);

export default router;
