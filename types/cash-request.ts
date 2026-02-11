import {
  ICashRequest as ICashRequestModel,
  ICRItem,
} from "@/models/CashRequest";

// Client-side type where dates and ObjectIds are serialized as strings (from API JSON responses)
export type ICashRequest = Omit<
  ICashRequestModel,
  | "createdAt"
  | "updatedAt"
  | "approvedAt"
  | "program"
  | "vendor"
  | "createdBy"
  | "approvedBy"
> & {
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  program: string;
  vendor?: string;
  createdBy: string;
  approvedBy?: string;
};

// Re-export item type
export type { ICRItem };

// Re-export vendor type
export type { IVendor } from "@/models/Vendor";
