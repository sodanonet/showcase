import mongoose from "mongoose";
import User from "../models/user.model";
import Task from "../models/task.model";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateTask = (userId: mongoose.Types.ObjectId) => {
  const task = Math.random().toString(36).substring(7);
  return {
    title: `Task ${task}`,
    description: `Task ${task} description`,
    userId,
  };
};

export default async function seedTasks() {
  try {
    await Task.deleteMany({});
    console.log("🧹 Cleared existing tasks");

    const users = await User.find({});

    for (const user of users) {
      const taskCount = randomInt(100, 200);
      const tasks = Array.from({ length: taskCount }, () =>
        generateTask(user._id as mongoose.Types.ObjectId)
      );
      await Task.insertMany(tasks);
      console.log(`📌 Created ${taskCount} tasks for ${user.username}`);
    }

    console.log("🌱 Tasks seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Tasks seeding failed:", err);
    process.exit(1);
  }
}
