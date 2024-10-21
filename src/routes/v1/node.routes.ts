import { Router } from "express";
import { NodeController } from "../../controllers/v1/node.controller";

const router = Router();

const nodeController = new NodeController();

/**
 * @openapi
 * /organization:
 *   post:
 *     summary: Create a new organization
 *     description: Creates a new organization with the specified name and color.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the organization.
 *               color:
 *                 type: string
 *                 description: The color of the organization.
 *     responses:
 *       201:
 *         description: Successfully created the organization.
 *       400:
 *         description: Bad request due to missing name or color.
 */
router.post("/node/organization", nodeController.createOrganization);

/**
 * @openapi
 * /department:
 *   post:
 *     summary: Create a new department
 *     description: Creates a new department within an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the department.
 *               color:
 *                 type: string
 *                 description: The color of the department.
 *               parentId:
 *                 type: string
 *                 description: The parent ID of the department.
 *               orgId:
 *                 type: string
 *                 description: The organization ID of the department.
 *     responses:
 *       201:
 *         description: Successfully created the department.
 *       400:
 *         description: Bad request due to missing required fields.
 */
router.post("/node/department", nodeController.createDepartment);

/**
 * @openapi
 * /location:
 *   post:
 *     summary: Create a new location
 *     description: Creates a new location within an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the location.
 *               color:
 *                 type: string
 *                 description: The color of the location.
 *               parentId:
 *                 type: string
 *                 description: The parent ID of the location.
 *               orgId:
 *                 type: string
 *                 description: The organization ID of the location.
 *     responses:
 *       201:
 *         description: Successfully created the location.
 *       400:
 *         description: Bad request due to missing required fields.
 */
router.post("/node/location", nodeController.createLocation);

/**
 * @openapi
 * /employee:
 *   post:
 *     summary: Create a new employee
 *     description: Creates a new employee under a specific department in an organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the employee.
 *               color:
 *                 type: string
 *                 description: The color of the employee.
 *               parentId:
 *                 type: string
 *                 description: The parent ID of the employee.
 *               orgId:
 *                 type: string
 *                 description: The organization ID of the employee.
 *     responses:
 *       201:
 *         description: Successfully created the employee.
 *       400:
 *         description: Bad request due to missing required fields.
 */
router.post("/node/employee", nodeController.createEmployee);

/**
 * @openapi
 * /{id}:
 *   get:
 *     summary: Get an organization by ID
 *     description: Retrieves an organization and its hierarchy by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the organization.
 *       400:
 *         description: Bad request due to missing ID.
 */
router.get("/node/:id", nodeController.getTree);

/**
 * @openapi
 * /{id}:
 *   patch:
 *     summary: Update an organization
 *     description: Updates the specified organization with new details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the organization.
 *               color:
 *                 type: string
 *                 description: The new color of the organization.
 *     responses:
 *       200:
 *         description: Successfully updated the organization.
 *       400:
 *         description: Bad request due to missing ID or fields.
 */
router.patch("/node/:id", nodeController.updateNode);

/**
 * @openapi
 * /{id}:
 *   delete:
 *     summary: Delete an organization
 *     description: Deletes the specified organization and optionally all its children.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the organization.
 *       400:
 *         description: Bad request due to missing ID.
 */
router.delete("/node/:id", nodeController.deleteNode);

export default router;
