import { Comment } from "../../entities/Commnets/commnetsEntity";
import { User } from "../../entities/user/userEntity";
import { Task } from "../../entities/Task/taskEntity";
import { AppDataSource } from "../../config/data-source";
import {
  FileTypeEnum,
  TaskAsset,
} from "../../entities/TaskAsset/taskAssetEntity";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { ErrorCommonStrings } from "../../utils/constant";
import { eventEmitter } from "../../utils/eventEmitter";
import {
  COMMENT_ADDED,
  COMMENT_DELETED,
  COMMENT_UPDATED,
} from "../../events/events";
import { PaginationParams } from "../../types";
import { In } from "typeorm";
import { CommentDto } from "../../dtos/commentDto";
import mime from "mime-types";
import { S3StorageService } from "./cloudServices/s3.service";
import logger from "../../utils/logger";
import { getIo } from "../../socket";

function determineFileType(url: string): FileTypeEnum {
  const mimeType = mime.lookup(url);
  if (!mimeType) {
    throw new Error("Unable to determine file type");
  }

  if (mimeType.startsWith("image/")) {
    return FileTypeEnum.IMAGE;
  } else if (mimeType.startsWith("audio/")) {
    return FileTypeEnum.AUDIO;
  } else if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("application/msword") ||
    mimeType.startsWith("application/vnd")
  ) {
    return FileTypeEnum.DOCUMENT;
  }

  throw new Error("Unsupported file type");
}

export class CommentService {
  private taskRepo = AppDataSource.getRepository(Task);
  private userRepo = AppDataSource.getRepository(User);
  private commentRepo = AppDataSource.getRepository(Comment);
  private taskAssetRepo = AppDataSource.getRepository(TaskAsset);

  async addComment(
    taskId: string,
    userId: string,
    message: string,
    taskAssets: string[]
  ) {
    try {
      // Fetch the task
      const task = await this.taskRepo.findOne({
        where: {
          taskId: taskId,
        },
      });

      if (!task) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Task not found"
        );
      }

      // Fetch the user
      const user = await this.userRepo.findOne({
        where: {
          userId: userId,
        },
      });

      if (!user) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "User not found"
        );
      }

      // Create a new comment
      const comment = new Comment();
      comment.task = task; // task is already a single entity
      comment.user = user;
      comment.message = message;

      const savedComment = await this.commentRepo.save(comment);

      // Handle task assets if they exist
      if (taskAssets.length > 0) {
        const savedAssets = await Promise.all(
          taskAssets.map(async (url) => {
            const taskAsset = new TaskAsset();
            taskAsset.fileLocation = url;
            taskAsset.fileType = determineFileType(url);
            taskAsset.comment = savedComment; // Corrected property name
            return this.taskAssetRepo.save(taskAsset);
          })
        );

        savedComment.taskAssets = savedAssets; // Assuming `taskAssets` is a property in Comment
        await this.commentRepo.save(savedComment);
      }

      // Save the comment
      await this.commentRepo.save(comment);
      logger.info(`Comment has been added to task ${task.taskId}`);
      // Emit the event after saving the comment
      eventEmitter.emit("COMMENT_ADDED", task, user);

      // Emit the Socket.IO event to all connected clients
      const io = getIo();
      io.emit("comment_added", {
        taskId: task.taskId,
        userId: user.userId,
        message: savedComment.message,
        taskAssets: savedComment.taskAssets,
      });

      return CommentDto.fromEntity(comment);
    } catch (error) {
      logger.error("Error while adding comment", error);

      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Error while adding comment"
      );
    }
  }

  async getCommentsFortask(taskId: string, paginationParams: PaginationParams) {
    try {
      const { page = 1, limit = 10 } = paginationParams;
      const skip = (page - 1) * limit;
      const [comments, total] = await this.commentRepo.findAndCount({
        where: {
          task: {
            taskId: taskId,
          },
        },
        relations: ["user", "taskAssets"],
        select: {
          message: true,
          createdAt: true,
          updatedAt: true,
          commentId: true,
          user: {
            userId: true,
            name: true,
          },
          taskAssets: {
            taskAssetId: true,
            fileType: true,
            fileLocation: true,
          },
        },
        order: {
          createdAt: "DESC",
        },
        take: limit,
        skip: skip,
      });
      return {
        data: comments,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error while getting the comments in the service", error);
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while fetching the comments for the task"
      );
    }
  }
  async deleteComment(commentId: string, userId: string) {
    try {
      const comment = await this.commentRepo.findOne({
        where: {
          commentId: commentId,
        },
        relations: ["user", "task"],
      });
      if (!comment) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Comment not found"
        );
      }

      //   check it is the user comment or not
      if (comment.user.userId !== userId) {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          false,
          "You can delete your comment only"
        );
      }

      await this.commentRepo.remove(comment);

      // fire the event of the comment deleted
      eventEmitter.emit(COMMENT_DELETED, comment.task, comment.user);

      return comment;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while deleting the comment"
      );
    }
  }
  async updateComment(
    commentId: string,
    userId: string,
    message: string,
    newTaskAssets: string[] = [], // URLs of new assets
    taskAssetsToRemove: string[] = [] // IDs of assets to remove
  ) {
    const s3StorageService = new S3StorageService();
    try {
      // Input validation
      if (!Array.isArray(newTaskAssets) || !Array.isArray(taskAssetsToRemove)) {
        throw new APIError(
          ErrorCommonStrings.BAD_INPUT,
          HttpStatusCode.BAD_REQUEST,
          false,
          "taskAssets and taskAssetsToRemove must be arrays"
        );
      }

      const comment = await this.commentRepo.findOne({
        where: {
          commentId: commentId,
        },
        relations: ["taskAssets", "user", "task"],
      });

      if (!comment) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Comment not found"
        );
      }

      if (comment.user.userId !== userId) {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          false,
          "You can update your comment only"
        );
      }

      comment.message = message;

      // Handle asset removal
      if (taskAssetsToRemove.length > 0) {
        const assetsToDelete = await this.taskAssetRepo.find({
          where: {
            taskAssetId: In(taskAssetsToRemove),
            comment: { commentId: comment.commentId }, // Ensure assets belong to this comment
          },
        });

        if (assetsToDelete.length > 0) {
          // Uncomment if you want to delete from cloud storage
          await Promise.all(
            assetsToDelete.map((asset) =>
              s3StorageService.deleteFileFromCloudStorage(asset.fileLocation)
            )
          );

          await this.taskAssetRepo.delete({
            taskAssetId: In(taskAssetsToRemove),
            comment: { commentId: comment.commentId },
          });

          comment.taskAssets = comment.taskAssets.filter(
            (asset) => !taskAssetsToRemove.includes(asset.taskAssetId)
          );
        }
      }

      // Handle new assets
      if (newTaskAssets.length > 0) {
        const savedAssets = await Promise.all(
          newTaskAssets.map(async (url) => {
            const taskAsset = new TaskAsset();
            taskAsset.fileLocation = url;
            taskAsset.fileType = determineFileType(url);
            taskAsset.comment = comment;
            return this.taskAssetRepo.save(taskAsset);
          })
        );

        comment.taskAssets = [...comment.taskAssets, ...savedAssets];
      }

      const updatedComment = await this.commentRepo.save(comment);
      eventEmitter.emit(COMMENT_UPDATED, comment.task, comment.user);

      return CommentDto.fromEntity(updatedComment);
    } catch (error) {
      logger.error("Error while updating comment", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while updating the comment"
      );
    }
  }
  async getComment(commentId: string) {
    try {
      const comment = await this.commentRepo.findOne({
        where: {
          commentId: commentId,
        },
        relations: ["user", "task"],
      });
      if (!comment) {
        throw new APIError(
          ErrorCommonStrings.NOT_FOUND,
          HttpStatusCode.NOT_FOUND,
          false,
          "Comment not found"
        );
      }
      return CommentDto.fromEntity(comment);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        ErrorCommonStrings.INTERNAL_SERVER_ERROR,
        HttpStatusCode.INTERNAL_ERROR,
        false,
        "Error while fetching the comment"
      );
    }
  }
}
