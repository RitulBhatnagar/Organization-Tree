import { Router } from "express";
import { InventoryController } from "../../controllers";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";

const router = Router();

const inventoryController = new InventoryController();
/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Create a new inventory
 *     description: Creates a new inventory in the system. Only accessible by admin users.
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the inventory
 *                 example: "inv"
 *               description:
 *                 type: string
 *                 description: Description of the inventory
 *                 example: "desc"
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory created successfully"
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     inventoryId:
 *                       type: string
 *                       format: uuid
 *                       example: "1c9f3ba5-119e-454e-b695-e542b92aee52"
 *                     name:
 *                       type: string
 *                       example: "inv"
 *                     description:
 *                       type: string
 *                       example: "desc"
 *                     deletedAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-12T02:03:12.150Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-12T02:03:12.150Z"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing name"
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
 *                   example: "Error creating inventory"
 */
router.post(
  "/inventory",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.createInventory
);
/**
 * @swagger
 * /api/v1/inventory/{inventoryId}:
 *   put:
 *     tags:
 *       - Inventory
 *     summary: Update an inventory
 *     description: Updates an existing inventory by its ID. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the inventory to update
 *         example: "1c9f3ba5-119e-454e-b695-e542b92aee52"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the inventory
 *                 example: "Updated Inventory Name"
 *               description:
 *                 type: string
 *                 description: New description of the inventory
 *                 example: "Updated inventory description"
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory updated successfully"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing inventoryId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Inventory not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating inventory"
 */
router.put(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.updateInventory
);

/**
 * @swagger
 * /api/v1/inventory/{inventoryId}:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: Get an inventory by ID
 *     description: Retrieves a specific inventory by its ID. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the inventory to retrieve
 *         example: "1c9f3ba5-119e-454e-b695-e542b92aee52"
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory retrieved successfully"
 *                 inventory:
 *                   type: object
 *                   properties:
 *                     inventoryId:
 *                       type: string
 *                       format: uuid
 *                       example: "1c9f3ba5-119e-454e-b695-e542b92aee52"
 *                     name:
 *                       type: string
 *                       example: "inv"
 *                     description:
 *                       type: string
 *                       example: "desc"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing inventoryId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Inventory not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving inventory"
 */
router.get(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.getInventory
);
/**
 * @swagger
 * /api/v1/inventory/{inventoryId}:
 *   delete:
 *     tags:
 *       - Inventory
 *     summary: Delete an inventory
 *     description: Deletes an existing inventory by its ID. Only accessible by admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the inventory to delete
 *         example: "1c9f3ba5-119e-454e-b695-e542b92aee52"
 *     responses:
 *       200:
 *         description: Inventory deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory deleted successfully"
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing inventoryId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized (non-admin)
 *       404:
 *         description: Inventory not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inventory not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting inventory"
 */
router.delete(
  "/inventory/:inventoryId",
  authenticate,
  checkRoles([UserRole.ADMIN]),
  inventoryController.deleteInventory
);

export default router;
