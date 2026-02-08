import mongoose, { Schema, Model } from "mongoose";

export interface IPRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

export interface IPurchaseRequest {
  _id: string;
  // Section 1
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

const PurchaseRequestSchema = new Schema<IPurchaseRequest>(
  {
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
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
PurchaseRequestSchema.index({ status: 1, createdAt: -1 });
PurchaseRequestSchema.index({ createdBy: 1, createdAt: -1 });
PurchaseRequestSchema.index({ prNumber: 1 });

const PurchaseRequest: Model<IPurchaseRequest> =
  mongoose.models.PurchaseRequest ||
  mongoose.model<IPurchaseRequest>("PurchaseRequest", PurchaseRequestSchema);

export default PurchaseRequest;
