import mongoose, { Schema, Model } from "mongoose";

export interface IProgram {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  prCounter: number;
  prCounterYear: number;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Program code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Program code must be at least 3 characters"],
      maxlength: [10, "Program code must be at most 10 characters"],
      match: [/^[A-Z0-9]+$/, "Program code must be alphanumeric"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    prCounter: {
      type: Number,
      default: 0,
      required: true,
    },
    prCounterYear: {
      type: Number,
      default: () => new Date().getFullYear(),
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
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
ProgramSchema.index({ isActive: 1 });

const Program: Model<IProgram> =
  mongoose.models.Program || mongoose.model<IProgram>("Program", ProgramSchema);

export default Program;
