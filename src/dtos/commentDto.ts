import { UserDTO } from "./userdto";
import { TaskDTO } from "./taskDto"; // Import the TaskDTO if you have one

export class CommentDto {
  commentId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserDTO;
  task: TaskDTO; // Add task property

  constructor(comment: any) {
    this.commentId = comment.commentId;
    this.message = comment.message;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.user = new UserDTO(comment.user);
    this.task = new TaskDTO(comment.task); // Initialize task
  }

  static fromEntity(comment: any): CommentDto {
    return new CommentDto({
      commentId: comment.commentId,
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        userId: comment.user.userId,
        name: comment.user.name,
        // Include other user properties if needed
      },
      task: {
        taskId: comment.task.taskId,
        name: comment.task.name,
        description: comment.task.description,
        createdAt: comment.task.createdAt,
        updatedAt: comment.task.updatedAt,
        // Include other task properties if needed
      },
    });
  }
}
