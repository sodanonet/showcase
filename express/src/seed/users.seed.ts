import User from "../models/user.model";
import { hashPassword } from "../utils/password.util";

export default async function seedUsers() {
  try {
    await User.deleteMany({});
    console.log("🧹 Cleared existing users");

    const users = [
      {
        username: "Maria",
        email: "maria@example.com",
        password: "Maria123",
      },
      {
        username: "John",
        email: "john@example.com",
        password: "John123",
      },
      {
        username: "Charlie",
        email: "charlie@example.com",
        password: "Charlie123",
      },
    ];

    const usersWithHashedPassword = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return { ...user, password: hashedPassword };
      })
    );

    console.log("🧹 Hash all user passwords");

    await User.insertMany(usersWithHashedPassword);

    console.log("🌱 Users seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Users Seeding failed:", err);
    process.exit(1);
  }
}
