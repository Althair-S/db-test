import {
  ICashRequest as ICashRequestModel,
  ICRItem,
} from "@/models/CashRequest";

// Client-side type where dates are serialized as strings (from API JSON responses)
export type ICashRequest = Omit<
  ICashRequestModel,
  "createdAt" | "updatedAt" | "approvedAt"
> & {
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
};

// Re-export item type
export type { ICRItem };

// Re-export vendor type
export type { IVendor } from "@/models/Vendor";
