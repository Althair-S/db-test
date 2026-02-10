import mongoose, { Schema, Model } from "mongoose";

export interface IPRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

export interface IPRComment {
  commentedBy: mongoose.Types.ObjectId;
  commentedByName: string;
  commentedByRole: string;
  comment: string;
  createdAt: Date;
}

export interface IPurchaseRequest {
  _id: string;
  // Program
  program: mongoose.Types.ObjectId;
  programName: string;
  programCode: string;

  // Section 1
  activityName: string;
  department: string;
  budgeted: boolean;
  costingTo: string;
  prNumber: string;

  // Section 2 - Items
  items: IPRItem[];

  // Status & Metadata
  status: "pending" | "approved" | "rejected";
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Comments & Revision
  comments: IPRComment[];
  revisionRequested: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PRItemSchema = new Schema<IPRItem>(
  {
    item: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be positive"],
    },
  },
  { _id: false },
);

const PRCommentSchema = new Schema<IPRComment>(
  {
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentedByName: {
      type: String,
      required: true,
    },
    commentedByRole: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const PurchaseRequestSchema = new Schema<IPurchaseRequest>(
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
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    budgeted: {
      type: Boolean,
      required: [true, "Budgeted field is required"],
      default: false,
    },
    costingTo: {
      type: String,
      required: [true, "Costing To is required"],
      trim: true,
    },
    prNumber: {
      type: String,
      required: [true, "PR Number is required"],
      unique: true,
      trim: true,
    },
    items: {
      type: [PRItemSchema],
      required: [true, "At least one item is required"],
      validate: {
        validator: function (items: IPRItem[]) {
          return items && items.length > 0;
        },
        message: "At least one item is required",
      },
    },
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
    comments: {
      type: [PRCommentSchema],
      default: [],
    },
    revisionRequested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
PurchaseRequestSchema.index({ status: 1, createdAt: -1 });
PurchaseRequestSchema.index({ createdBy: 1, createdAt: -1 });
// prNumber already has unique: true, no need for separate index
PurchaseRequestSchema.index({ program: 1, createdAt: -1 });
PurchaseRequestSchema.index({ program: 1, status: 1 });

const PurchaseRequest: Model<IPurchaseRequest> =
  mongoose.models.PurchaseRequest ||
  mongoose.model<IPurchaseRequest>("PurchaseRequest", PurchaseRequestSchema);

export default PurchaseRequest;
