export interface IVendor {
  _id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICRItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ICashRequest {
  _id: string;
  program: string;
  programName: string;
  programCode: string;

  vendor?: string;
  vendorName: string;
  bankName: string;
  accountNumber: string;

  items?: ICRItem[]; // Optional for legacy support in types
  totalAmount: number;
  taxAmount?: number;
  useTax: boolean;

  // Legacy fields
  amount?: number;
  description?: string;

  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
