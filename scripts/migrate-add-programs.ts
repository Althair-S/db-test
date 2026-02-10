/**
 * Migration script to add program support to existing data
 *
 * This script will:
 * 1. Create a default "General" program
 * 2. Update all existing PRs to reference the default program
 * 3. Grant all existing users access to the default program
 *
 * Run this script ONCE after deploying the program-based PR system
 */

import dbConnect from "./lib/mongodb";
import Program from "./models/Program";
import PurchaseRequest from "./models/PurchaseRequest";
import User from "./models/User";

async function migrate() {
  console.log("Starting migration...");

  try {
    await dbConnect();

    // Step 1: Create default program
    console.log("\n1. Creating default program...");

    let defaultProgram = await Program.findOne({ code: "GENERAL" });

    if (!defaultProgram) {
      // Find an admin user to be the creator
      const adminUser = await User.findOne({ role: "admin" });

      if (!adminUser) {
        throw new Error(
          "No admin user found. Please create an admin user first.",
        );
      }

      defaultProgram = await Program.create({
        name: "General",
        code: "GENERAL",
        description: "Default program for existing purchase requests",
        isActive: true,
        prCounter: 0,
        prCounterYear: new Date().getFullYear(),
        createdBy: adminUser._id,
        createdByName: adminUser.name,
      });

      console.log(
        `✓ Created default program: ${defaultProgram.name} (${defaultProgram.code})`,
      );
    } else {
      console.log(
        `✓ Default program already exists: ${defaultProgram.name} (${defaultProgram.code})`,
      );
    }

    // Step 2: Update existing PRs
    console.log("\n2. Updating existing purchase requests...");

    const prsWithoutProgram = await PurchaseRequest.find({
      $or: [{ program: { $exists: false } }, { program: null }],
    });

    console.log(
      `Found ${prsWithoutProgram.length} PRs without program assignment`,
    );

    for (const pr of prsWithoutProgram) {
      pr.program = defaultProgram._id;
      pr.programName = defaultProgram.name;
      pr.programCode = defaultProgram.code;
      await pr.save();
    }

    console.log(`✓ Updated ${prsWithoutProgram.length} purchase requests`);

    // Step 3: Grant all users access to default program
    console.log("\n3. Granting users access to default program...");

    const usersWithoutAccess = await User.find({
      role: { $in: ["user", "finance"] },
      $or: [
        { programAccess: { $exists: false } },
        { programAccess: { $size: 0 } },
      ],
    });

    console.log(
      `Found ${usersWithoutAccess.length} users without program access`,
    );

    for (const user of usersWithoutAccess) {
      if (!user.programAccess) {
        user.programAccess = [];
      }
      user.programAccess.push(defaultProgram._id);
      await user.save();
      console.log(`✓ Granted access to ${user.name} (${user.email})`);
    }

    console.log(
      `✓ Granted ${usersWithoutAccess.length} users access to default program`,
    );

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("Migration completed successfully!");
    console.log("=".repeat(50));
    console.log(
      `Default Program: ${defaultProgram.name} (${defaultProgram.code})`,
    );
    console.log(`Updated PRs: ${prsWithoutProgram.length}`);
    console.log(`Updated Users: ${usersWithoutAccess.length}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log(
      "\nMigration script finished. You can now use the program-based PR system.",
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration script failed:", error);
    process.exit(1);
  });
