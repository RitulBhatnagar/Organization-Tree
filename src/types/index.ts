import { CompletedStatusEnum, TaskTypeEnum } from "../entities/Task/taskEntity";

export interface contactPerson {
  name: string;
  phone: string;
  email: string;
}
export interface LimitedUserData {
  userId: string;
  email: string;
  department: string | null;
}
export interface SimplifiedBrand {
  brandId: string;
  brandName: string;
  ownerIds: string[];
}
export interface TeammateDTO {
  userId: string;
  name: string;
  email: string;
  department: string | null;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface taskFilters {
  taskType?: TaskTypeEnum;
  assignedBy?: string;
  assignedTo?: string;
  teamOwnerId?: string;
  dueDatePassed?: boolean;
  brandName?: string;
  inventoryName?: string;
  completedStatus?: CompletedStatusEnum;
  eventName?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface StorageService {
  uploadFile(file: Express.Multer.File): Promise<string>;
}
