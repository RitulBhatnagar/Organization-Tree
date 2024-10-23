import { Comment } from "../entities/Commnets/commnetsEntity";
import { TaskAsset } from "../entities/TaskAsset/taskAssetEntity";
// commentDto.ts
export class CommentDto {
  commentId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  taskAssets: TaskAssetDto[];

  static fromEntity(comment: Comment): CommentDto {
    return {
      commentId: comment.commentId,
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      taskAssets: Array.isArray(comment.taskAssets)
        ? comment.taskAssets.map(TaskAssetDto.fromEntity)
        : [],
    };
  }
}

// taskAssetDto.ts
export class TaskAssetDto {
  taskAssetId: string;
  fileType: string;
  fileLocation: string;

  static fromEntity(taskAsset: TaskAsset): TaskAssetDto {
    return {
      taskAssetId: taskAsset.taskAssetId,
      fileType: taskAsset.fileType,
      fileLocation: taskAsset.fileLocation,
    };
  }
}
