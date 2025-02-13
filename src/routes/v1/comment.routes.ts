import { Router } from "express";
import multer from "multer";
import { CommentController } from "../../controllers/v1/comment.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const commentController = new CommentController();

/**
 * @swagger
 * /api/v1/comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Add a new comment
 *     description: Creates a new comment with optional file attachments. Accessible by ADMIN, MO, PO, BO, and PO_TO roles.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing taskId and message
 *                 example: '{"taskId": "123e4567-e89b-12d3-a456-426614174000", "message": "This is a comment"}'
 *               files:
 *                 type: array
 *                 description: Optional files to attach to the comment (max 10 files)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment added successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       format: uuid
 *                     taskId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *                     taskAssets:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: URLs of uploaded files
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
 *                   example: "Invalid JSON in data field"
 *               oneOf:
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing taskId"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing userId"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing message"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authorized to perform this action"
 *       413:
 *         description: Payload Too Large - Files exceed size limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File size exceeds limit"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error adding comment"
 */
router.post(
  "/comment",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  upload.array("files", 10),
  commentController.addComment
);

/**
 * @swagger
 * /api/v1/comments/task/{taskId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments for a task
 *     description: Retrieves paginated comments for a specific task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the task to get comments for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comments retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: string
 *                         format: uuid
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       message:
 *                         type: string
 *                       taskAssets:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad Request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing taskId"
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
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching comments for task"
 */
router.get("/comments/task/:taskId", commentController.getCommentsForTask);

/**
 * @swagger
 * /api/v1/comment/{commentId}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     description: Updates an existing comment with optional file attachments. Accessible by ADMIN, MO, PO, BO, and PO_TO roles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the comment to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string containing message and optional taskAssetsToRemove
 *                 example: '{"message": "Updated comment text", "taskAssetsToRemove": ["asset1.jpg", "asset2.pdf"]}'
 *               files:
 *                 type: array
 *                 description: New files to attach to the comment (max 10 files)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment updated successfully"
 *                 updatedComment:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *                     taskAssets:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: URLs of attached files
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
 *                       example: "Invalid JSON in data field"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing commentId"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing userId"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing message"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized or not comment owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authorized to update this comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       413:
 *         description: Payload Too Large - Files exceed size limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File size exceeds limit"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating comment"
 */
router.put(
  "/comment/:commentId",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  upload.array("files", 10),
  commentController.updateComment
);
/**
 * @swagger
 * /api/v1/comment/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Deletes a specific comment. User must be the comment owner or an admin. Accessible by ADMIN, MO, PO, BO, and PO_TO roles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the comment to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     taskId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *                     taskAssets:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
 *                       example: "Invalid or missing commentId"
 *                 - properties:
 *                     message:
 *                       example: "Invalid or missing userId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized or not comment owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authorized to delete this comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting comment"
 */
router.delete(
  "/comment/:commentId",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  commentController.deleteComment
);
/**
 * @swagger
 * /api/v1/comment/{commentId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a specific comment
 *     description: Retrieves a specific comment by its ID. Accessible by ADMIN, MO, PO, BO, and PO_TO roles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the comment to retrieve
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment retrieved successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     taskId:
 *                       type: string
 *                       format: uuid
 *                     message:
 *                       type: string
 *                       example: "This is a comment message"
 *                     taskAssets:
 *                       type: array
 *                       items:
 *                         type: string
 *                         description: URLs of attached files
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
 *                   example: "Invalid or missing commentId"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authorized to view this comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching comment"
 */
router.get(
  "/comment/:commentId",
  authenticate,
  checkRoles([
    UserRole.ADMIN,
    UserRole.MO,
    UserRole.PO,
    UserRole.BO,
    UserRole.PO_TO,
  ]),
  commentController.getComment
);

export default router;
