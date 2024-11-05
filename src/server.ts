import express from 'express';
import { db_tasks, TaskSchema } from './lib/db';

const app = express();
app.use(express.json());

// Get all tasks
app.get('/api/tasks', (_, res) => {
  const tasks = db_tasks.getAll();
  res.json(tasks);
});

// Create a task
app.post('/api/tasks', (req, res) => {
  try {
    const task = TaskSchema.parse(req.body);
    const newTask = db_tasks.create(task);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: 'Invalid task data' });
  }
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = TaskSchema.partial().parse(req.body);
    const updatedTask = db_tasks.update(id, task);
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Invalid task data' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db_tasks.delete(id);
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});