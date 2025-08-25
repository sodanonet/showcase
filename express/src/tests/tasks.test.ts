import request from "supertest";
import app from "../app"; // or wherever your Express app is exported
import mongoose from "mongoose";
import Task from "../models/task.model";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe("Task API", () => {
  it("should create a new task", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Test Task",
      description: "This is a test task",
      status: "pending",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");
  });

  it("should fetch all tasks", async () => {
    await Task.create({
      title: "Task One",
      description: "Desc",
      status: "pending",
    });

    const res = await request(app).get("/api/tasks");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should fetch a task by ID", async () => {
    const task = await Task.create({
      title: "Find Me",
      description: "",
      status: "pending",
    });

    const res = await request(app).get(`/api/tasks/${task._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Find Me");
  });

  it("should update a task", async () => {
    const task = await Task.create({
      title: "Old Title",
      description: "",
      status: "pending",
    });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });

  it("should delete a task", async () => {
    const task = await Task.create({
      title: "Delete Me",
      description: "",
      status: "pending",
    });

    const res = await request(app).delete(`/api/tasks/${task._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted successfully.");
  });
});
