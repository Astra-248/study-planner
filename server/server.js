require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Task = require("./models/Task");

const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Study Planner API is running");
});

app.get("/api/tasks", async (req, res) => {
    try {
        const tasksFromDatabase = await Task.find();
        res.json(tasksFromDatabase);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
});

app.post("/api/tasks", async (req, res) => {
    const { title, subject, time, dueDate, priority } = req.body;

    if (!title || !subject || !time || !dueDate) {
        return res.status(400).json({
            message: "title, subject, time, and dueDate are required"
        });
    }

    try {
        const newTask = await Task.create({
            title,
            subject,
            time,
            dueDate,
            priority
        });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Failed to create task" });
    }
});

app.put("/api/tasks/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    const allowedFields = ["title", "subject", "time", "dueDate", "priority", "done"];
    const updates = Object.fromEntries(
        Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid task fields provided" });
    }

    if ("done" in updates && typeof updates.done !== "boolean") {
        return res.status(400).json({ message: "done must be true or false" });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to update task" });
    }
});
app.delete("/api/tasks/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete task" });
    }
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log("Server is running on port " + PORT);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });