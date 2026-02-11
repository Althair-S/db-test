import mongoose, { Schema, Model } from "mongoose";

export interface ICRItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ICashRequest {
  _id: string;
  // Program
  program: mongoose.Types.ObjectId;
  programName: string;
  programCode: string;

  // Request Details
  activityName: string; // New field for Activity Name

  // Vendor Information
  vendor?: mongoose.Types.ObjectId;
  vendorName: string;
  bankName: string;
  accountNumber: string;

  // Request Details - Itemized
  items: ICRItem[];

  // Totals
  // Totals
  totalAmount: number; // Grand total (Subtotal - Tax)
  taxAmount?: number; // Tax amount if applicable
  taxPercentage?: number; // Manual tax percentage (e.g. 2 for 2%)
  useTax: boolean; // Whether tax was applied

  // Deprecated/Legacy fields (kept for backward compatibility if needed, but we'll migrate)
  amount?: number;
  description?: string;

  // Status & Metadata
  status: "pending" | "approved" | "rejected";
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Serialized version for client-side use (dates are strings after JSON serialization)
export type SerializedCashRequest = Omit<
  ICashRequest,
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

const CRItemSchema = new Schema<ICRItem>(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
    },
  },
  { _id: false },
);

const CashRequestSchema = new Schema<ICashRequest>(
  {
    program: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Program is required"],
    },
    programName: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    programCode: {
      type: String,
      required: [true, "Program code is required"],
      uppercase: true,
      trim: true,
    },
    activityName: {
      type: String,
      required: [true, "Activity name is required"],
      trim: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      trim: true,
    },
    items: {
      type: [CRItemSchema],
      validate: {
        validator: function (items: ICRItem[]) {
          // Allow empty items ONLY if legacy description/amount exists (for migration safety)
          // But for new records, enforce items.
          return items && items.length > 0;
        },
        message: "At least one item is required",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be positive"],
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    taxPercentage: {
      type: Number,
      default: 0,
    },
    useTax: {
      type: Boolean,
      default: false,
    },
    // Legacy fields - optional now
    amount: { type: Number },
    description: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedByName: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
CashRequestSchema.index({ status: 1, createdAt: -1 });
CashRequestSchema.index({ createdBy: 1, createdAt: -1 });
CashRequestSchema.index({ vendor: 1, createdAt: -1 });
CashRequestSchema.index({ program: 1, createdAt: -1 });

const CashRequest: Model<ICashRequest> =
  mongoose.models.CashRequest ||
  mongoose.model<ICashRequest>("CashRequest", CashRequestSchema);

export default CashRequest;
