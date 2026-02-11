import connect from "../lib/db";
import User from "../models/User";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await connect();
    console.log("Connected to MongoDB");

    // Clear existing users (optional)
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    });
    console.log("Created admin user: admin@example.com / admin123");

    // Create finance user
    const financePassword = await bcrypt.hash("finance123", 10);
    await User.create({
      email: "finance@example.com",
      password: financePassword,
      name: "Finance User",
      role: "finance",
    });
    console.log("Created finance user: finance@example.com / finance123");

    // Create regular user
    const userPassword = await bcrypt.hash("user123", 10);
    await User.create({
      email: "user@example.com",
      password: userPassword,
      name: "Regular User",
      role: "user",
    });
    console.log("Created regular user: user@example.com / user123");

    console.log("\n✅ Seed completed successfully!");
    console.log("\nYou can now login with:");
    console.log("- Admin: admin@example.com / admin123");
    console.log("- Finance: finance@example.com / finance123");
    console.log("- User: user@example.com / user123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
