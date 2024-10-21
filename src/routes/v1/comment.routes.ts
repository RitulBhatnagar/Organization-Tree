import { Router } from "express";
import multer from "multer";
import { CommentController } from "../../controllers/v1/comment.controller";
import { authenticate } from "../../middleware/authentication";
import { checkRoles } from "../../middleware/rbca";
import { UserRole } from "../../entities/Role/roleEntity";
const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const commentController = new CommentController();
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

router.get("/comments/task/:taskId", commentController.getCommentsForTask);

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
