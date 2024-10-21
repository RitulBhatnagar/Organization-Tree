import { TaskTypeEnum, CompletedStatusEnum } from "../entities/Task/taskEntity";

export class AssignedPersonDTO {
  assignedPersonId: string;
  userId?: string;
  name?: string;

  constructor(assignedPerson: any) {
    this.assignedPersonId = assignedPerson.assignedPersonId;
    this.userId = assignedPerson.userId;
    this.name = assignedPerson.name;
  }

  static fromEntity(assignedPerson: any): AssignedPersonDTO {
    return new AssignedPersonDTO({
      assignedPersonId: assignedPerson.assignedPersonId,
      userId: assignedPerson.user?.userId,
      name: assignedPerson.user?.name,
    });
  }
}

export class TaskDTO {
  taskId: string;
  name: string;
  description: string;
  status: CompletedStatusEnum;
  taskType: TaskTypeEnum;
  creatorName: string;
  dueDate: Date;
  createdAt: Date;
  finishedDate: Date | null;
  timeToComplete: string | null;
  lateBy: string | null;
  relatedTaskName: string | null;
  assignedPersons: AssignedPersonDTO[];

  constructor(task: any) {
    this.taskId = task.taskId;
    this.name = task.name;
    this.description = task.description;
    this.status = task.status;
    this.taskType = task.taskType;
    this.creatorName = task.creatorName;
    this.dueDate = task.dueDate;
    this.createdAt = task.createdAt;
    this.finishedDate = task.finishedDate;
    this.timeToComplete = task.timeToComplete;
    this.lateBy = task.lateBy;
    this.relatedTaskName = task.relatedTaskName;
    this.assignedPersons = task.assignedPersons;
  }

  static fromEntity(task: any): TaskDTO {
    let relatedTaskName: string | null = null;

    if (task.taskType === TaskTypeEnum.BRAND && task.relatedBrand) {
      relatedTaskName = task.relatedBrand.brandName;
    } else if (task.taskType === TaskTypeEnum.EVENT && task.relatedEvent) {
      relatedTaskName = task.relatedEvent.name;
    } else if (
      task.taskType === TaskTypeEnum.INVENTORY &&
      task.relatedInventory
    ) {
      relatedTaskName = task.relatedInventory.name;
    }

    const finishedDate =
      task.completedStatus === CompletedStatusEnum.COMPLETED
        ? task.finishedDate || task.updatedAt
        : null;

    let timeToComplete: string | null = null;
    let lateBy: string | null = null;

    if (finishedDate) {
      const duration = finishedDate.getTime() - task.createdAt.getTime();
      timeToComplete = TaskDTO.formatDuration(duration);

      if (finishedDate > task.dueDate) {
        const lateDuration = finishedDate.getTime() - task.dueDate.getTime();
        lateBy = TaskDTO.formatDuration(lateDuration);
      }
    } else if (
      task.completedStatus === CompletedStatusEnum.OPEN &&
      new Date() > task.dueDate
    ) {
      const lateDuration = new Date().getTime() - task.dueDate.getTime();
      lateBy = TaskDTO.formatDuration(lateDuration);
    }

    const assignedPersons = task.assignedPersons
      ? task.assignedPersons.map((ap: any) => AssignedPersonDTO.fromEntity(ap))
      : [];

    return new TaskDTO({
      taskId: task.taskId,
      name: task.name,
      description: task.description,
      status: task.completedStatus,
      taskType: task.taskType,
      creatorName: task.creator?.name || "Unknown",
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      finishedDate: finishedDate,
      lateBy: lateBy,
      timeToComplete: timeToComplete,
      relatedTaskName: relatedTaskName,
      assignedPersons: assignedPersons,
    });
  }

  private static formatDuration(duration: number): string {
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim();
  }
}
