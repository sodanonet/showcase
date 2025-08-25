import { Request, Response } from "express";
import Task from "../models/task.model";

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const task = new Task({ title, description, status });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ error: "Failed to create task." });
  }
};

// Get all tasks
export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
};

// Get a single task by ID
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.status(200).json(task);
  } catch (error) {
    console.error("Get Task Error:", error);
    res.status(500).json({ error: "Failed to fetch task." });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) return res.status(404).json({ error: "Task not found." });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: "Task not found." });
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ error: "Failed to delete task." });
  }
};
