import mongoose from "mongoose";
import { DATABASE_URL } from "./env";
import dns from "dns";

// Force Google DNS to resolve MongoDB Atlas hostnames
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore error if setServers fails
}

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "pr",
    });
    return Promise.resolve("Database connected!");
  } catch (error) {
    console.error("Database connection failed:", error);
    return Promise.reject(error);
  }
};

export default connect;
