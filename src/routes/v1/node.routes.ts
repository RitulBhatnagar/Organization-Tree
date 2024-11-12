import { Router } from "express";
import { NodeController } from "../../controllers/v1/node.controller";

const router = Router();

const nodeController = new NodeController();

/**
 * @swagger
 * /api/v1/node/organization:
 *   post:
 *     tags:
 *       - Node
 *     summary: Create a new organization
 *     description: Creates a new organization node in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the organization
 *                 example: "Bank"
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                   example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                 nodename:
 *                   type: string
 *                   example: "Bank"
 *                 nodetype:
 *                   type: string
 *                   example: "organization"
 *                 organization:
 *                   type: object
 *                   properties:
 *                     orgName:
 *                       type: string
 *                       example: "Bank"
 *                     orgId:
 *                       type: string
 *                       format: uuid
 *                       example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                 nodeColour:
 *                   type: string
 *                   example: "white"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
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
 *                   example: "Missing body, Please provide the name"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating organization"
 */
router.post("/node/organization", nodeController.createOrganization);

/**
 * @swagger
 * /api/v1/node/department:
 *   post:
 *     tags:
 *       - Node
 *     summary: Create a new department
 *     description: Creates a new department node under a parent node within an organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - parentId
 *               - orgId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the department
 *                 example: "Audit"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent node
 *                 example: "c61672d2-6674-43d2-a4bc-dd11f640999c"
 *               orgId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the organization
 *                 example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                   example: "1768a018-d345-459a-9edb-1bf0bc3d372a"
 *                 nodename:
 *                   type: string
 *                   example: "Audit"
 *                 nodetype:
 *                   type: string
 *                   example: "departments"
 *                 organization:
 *                   type: object
 *                   properties:
 *                     orgId:
 *                       type: string
 *                       format: uuid
 *                       example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                     orgName:
 *                       type: string
 *                       example: "Bank"
 *                 nodeColour:
 *                   type: string
 *                   example: "#F6AF8E"
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *                   example: "c61672d2-6674-43d2-a4bc-dd11f640999c"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:49:31.604Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:49:31.604Z"
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
 *                       example: "Missing body, Please provide the parentId"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the organization ID"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating department"
 */
router.post("/node/department", nodeController.createDepartment);
/**
 * @swagger
 * /api/v1/node/location:
 *   post:
 *     tags:
 *       - Node
 *     summary: Create a new location
 *     description: Creates a new location node under a parent node within an organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - parentId
 *               - orgId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the location
 *                 example: "Delhi"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent node
 *                 example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *               orgId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the organization
 *                 example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                   example: "c61672d2-6674-43d2-a4bc-dd11f640999c"
 *                 nodename:
 *                   type: string
 *                   example: "Delhi"
 *                 nodetype:
 *                   type: string
 *                   example: "locations"
 *                 organization:
 *                   type: object
 *                   properties:
 *                     orgId:
 *                       type: string
 *                       format: uuid
 *                       example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                     orgName:
 *                       type: string
 *                       example: "Bank"
 *                 nodeColour:
 *                   type: string
 *                   example: "#F6AF8E"
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *                   example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:48:02.001Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:48:02.001Z"
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
 *                       example: "Missing body, Please provide the parentId"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the organization ID"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating location"
 */
router.post("/node/location", nodeController.createLocation);

/**
 * @swagger
 * /api/v1/node/employee:
 *   post:
 *     tags:
 *       - Node
 *     summary: Create a new employee
 *     description: Creates a new employee node under a parent node within an organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - parentId
 *               - orgId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the employee
 *                 example: "Akshay"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent node (department)
 *                 example: "1768a018-d345-459a-9edb-1bf0bc3d372a"
 *               orgId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the organization
 *                 example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                   example: "75b31663-80a8-4358-b0e4-101714106fc8"
 *                 nodename:
 *                   type: string
 *                   example: "Akshay"
 *                 nodetype:
 *                   type: string
 *                   example: "employees"
 *                 organization:
 *                   type: object
 *                   properties:
 *                     orgId:
 *                       type: string
 *                       format: uuid
 *                       example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                     orgName:
 *                       type: string
 *                       example: "Bank"
 *                 nodeColour:
 *                   type: string
 *                   example: "#F6AF8E"
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *                   example: "1768a018-d345-459a-9edb-1bf0bc3d372a"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:50:29.452Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:50:29.452Z"
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
 *                       example: "Missing body, Please provide the parentId"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the organization ID"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating employee"
 */
router.post("/node/employee", nodeController.createEmployee);

/**
 * @swagger
 * /api/v1/node/{id}:
 *   get:
 *     tags:
 *       - Node
 *     summary: Get organization tree
 *     description: Retrieves the entire organization tree structure by organization ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization ID
 *         example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *     responses:
 *       200:
 *         description: Organization tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                   example: "40e82b33-07eb-4e4b-b5cf-d61052a1b9c6"
 *                 nodename:
 *                   type: string
 *                   example: "Bank"
 *                 nodetype:
 *                   type: string
 *                   example: "organization"
 *                 nodeColour:
 *                   type: string
 *                   example: "white"
 *                 parentId:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 children:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nodeid:
 *                         type: string
 *                         format: uuid
 *                       nodename:
 *                         type: string
 *                       nodetype:
 *                         type: string
 *                       nodeColour:
 *                         type: string
 *                       parentId:
 *                         type: string
 *                         format: uuid
 *                       children:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Node'
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:47:14.596Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-25T07:47:14.596Z"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       400:
 *         description: Bad Request - Missing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing id in request"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting organization"
 */
router.get("/node/:id", nodeController.getTree);

/**
 * @swagger
 * /api/v1/node/{id}:
 *   patch:
 *     tags:
 *       - Node
 *     summary: Update a node
 *     description: Updates an existing node with new name, color, and/or parent ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the node to update
 *       - in: query
 *         name: shiftAllNodes
 *         schema:
 *           type: boolean
 *         description: Whether to shift all child nodes when updating parent
 *         example: "true"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *               - parentId
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the node
 *                 example: "Updated Node Name"
 *               color:
 *                 type: string
 *                 description: New color for the node
 *                 example: "#3498DB"
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: New parent ID for the node
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: Node updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodeid:
 *                   type: string
 *                   format: uuid
 *                 nodename:
 *                   type: string
 *                 nodeColour:
 *                   type: string
 *                 parentId:
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
 *                       example: "Missing body, Please provide the name"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the color"
 *                 - properties:
 *                     message:
 *                       example: "Missing body, Please provide the parentId"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating node"
 */
router.patch("/node/:id", nodeController.updateNode);

/**
 * @swagger
 * /api/v1/node/{id}:
 *   delete:
 *     tags:
 *       - Node
 *     summary: Delete a node
 *     description: Deletes a node and optionally all its children based on the deleteAllChildren parameter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the node to delete
 *         example: "1234"
 *       - in: query
 *         name: deleteAllChildren
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Whether to delete all child nodes
 *         example: "true"
 *     responses:
 *       200:
 *         description: Node deletion status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: ["Node deletion success", "Node deletion failed"]
 *                   example: "Node deletion success"
 *       400:
 *         description: Bad Request - Missing parameters
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
 *                       example: "Missing id in request"
 *                 - properties:
 *                     message:
 *                       example: "Missing query params"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting node"
 */
router.delete("/node/:id", nodeController.deleteNode);

export default router;
