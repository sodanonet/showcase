import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { logger } from "./middleware/logger.middleware";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/error.middleware";
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(logger);

// Swagger docs
setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

export default app;
