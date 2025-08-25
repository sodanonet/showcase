import mongoose from "mongoose";
import dotenv from "dotenv";
import seedUsers from "./users.seed";
import seedTasks from "./tasks.seed";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/devboard";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await seedUsers();
    await seedTasks();

    console.log("🌱 Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
