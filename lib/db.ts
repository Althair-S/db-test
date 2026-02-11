import dns from "dns";
import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

// Force Google DNS to resolve MongoDB Atlas hostnames
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("✅ DNS servers set to 8.8.8.8, 1.1.1.1");
} catch (e) {
  // Ignore error if setServers fails (e.g. valid IP check)
  console.log("DNS setting skipped/failed, using system defaults");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const connect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "pr",
    };

    cached.promise = mongoose.connect(DATABASE_URL, opts).then((mongoose) => {
      console.log("✅ Database connected!");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connect;
