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

export interface FilterUser {
  userId: string;
  name: string;
  count: number; // Changed to number type
}

export interface FilterCounts {
  totalCount: number;
  taskTypes: { type: string; count: number }[];
  assignedBy: { userId: string; name: string; count: number }[];
  assignedTo: { userId: string; name: string; count: number }[];
  teamOwners: { userId: string; name: string; count: number }[];
  brands: { brandId: string; name: string; count: number }[];
  inventories: { inventoryId: string; name: string; count: number }[];
  events: { eventId: string; name: string; count: number }[];
  dueDates: { type: string; count: number }[];
}

export interface FilterParams {
  taskType?: string;
  assignedBy?: string | string[];
  assignedTo?: string | string[];
  teamOwnerId?: string | string[];
  brandId?: string | string[];
  inventoryId?: string | string[];
  eventId?: string | string[];
  dueDate?: "upcoming" | "overdue";
}
