import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "finance" | "user";
  programAccess: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "finance", "user"],
      default: "user",
      required: true,
    },
    programAccess: {
      type: [Schema.Types.ObjectId],
      ref: "Program",
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
