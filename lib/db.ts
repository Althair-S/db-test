import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

const connect = async () => {
  try {
    // Log the connection string (masking the password) for debugging
    const maskedUrl = DATABASE_URL.replace(/:([^@]+)@/, ":****@");
    console.log(`Attempting to connect to MongoDB: ${maskedUrl}`);

    await mongoose.connect(DATABASE_URL, {
      dbName: "pr",
    });
    console.log("Database connected!");
    return Promise.resolve("Database connected!");
  } catch (error) {
    console.error("Database connection failed:", error);
    return Promise.reject(error);
  }
};

export default connect;
