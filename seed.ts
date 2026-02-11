import connect from "./lib/db";
import User from "./models/User";
import bcrypt from "bcryptjs";

const DEFAULT_USERS = [
  {
    email: "admin@system.local",
    password: "Admin123!@#",
    name: "System Administrator",
    role: "admin",
  },
  {
    email: "finance@system.local",
    password: "Finance123!@#",
    name: "Finance Manager",
    role: "finance",
  },
  {
    email: "user@system.local",
    password: "User123!@#",
    name: "Regular User",
    role: "user",
  },
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await connect();
    console.log("Connected to database.");

    for (const user of DEFAULT_USERS) {
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        console.log(`User ${user.email} already exists. Updating...`);
        // Optionally update other fields if needed, but keeping password same if exists might be safer unless intended reset
        // For seed, let's just ensure they exist. If you want to reset passwords, uncomment below:
        // const hashedPassword = await bcrypt.hash(user.password, 10);
        // existingUser.password = hashedPassword;
        // existingUser.name = user.name;
        // existingUser.role = user.role as any;
        // await existingUser.save();
        console.log(`User ${user.email} skipped (already exists).`);
      } else {
        console.log(`Creating user ${user.email}...`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.create({
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
        });
        console.log(`User ${user.email} created.`);
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
