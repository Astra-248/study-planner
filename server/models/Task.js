const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    time: { type: String, required: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    done: { type: Boolean, default: false }
});

module.exports = mongoose.model("Task", taskSchema);