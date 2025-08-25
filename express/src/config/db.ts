import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
