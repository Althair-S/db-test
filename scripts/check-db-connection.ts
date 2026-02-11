/* eslint-disable */
import connect from "../lib/db";
import mongoose from "mongoose";

async function checkConnection() {
  console.log("🔮 Pre-flight: Checking Database Connection...");
  try {
    // Reuse the standardized connection logic from lib/db
    await connect();

    console.log("✅ Database connection successful!");

    // Disconnect to allow the script to exit cleanly
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed!");
    if (error instanceof Error) {
      console.error("❌ Connection Error:", error.message);
      console.error(error.stack);
    } else {
      console.error("❌ Unknown Error:", error);
    }

    // Non-blocking failure: warn but allow server to start
    // This is crucial for environments with strict network/DNS blocking
    console.warn(
      "\n⚠️  WARNING: Database connection failed during pre-flight check.",
    );
    console.warn(
      "   The application will attempt to connect again at runtime.",
    );
    console.warn(
      "   Please check your network/DNS settings if issues persist.",
    );
    process.exit(0);
  }
}

checkConnection();
