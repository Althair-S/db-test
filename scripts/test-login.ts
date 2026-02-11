import connect from "../lib/db";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testLogin() {
  const email = "admin@system.local";
  const password = "Admin123!@#";

  console.log(`Testing login for ${email}...`);

  try {
    await connect();
    console.log("DB Connected.");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error("❌ User not found in database!");
      return;
    }

    console.log("User found:", user.email);
    console.log("Stored Password Hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log("✅ Password match! Login logic is correct.");
    } else {
      console.error("❌ Password DOES NOT match.");
      // Test hash generation to see if it matches expectations (conceptually)
      const newHash = await bcrypt.hash(password, 10);
      console.log("New hash of input would be:", newHash);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

testLogin();
