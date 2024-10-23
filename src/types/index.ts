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
