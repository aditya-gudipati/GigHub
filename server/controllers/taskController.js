import Task from '../models/Task.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, category, budget, deadline, commitment, minTrustScore, urgent } = req.body;

    const task = new Task({
      title,
      description,
      category,
      budget,
      deadline,
      commitment: commitment || 'flexible',
      minTrustScore: minTrustScore || 0,
      urgent: urgent || false,
      creatorId: req.userId,
      selectedApplicantId: null,
      applicants: [],
      updates: [],
      status: 'open',
      approved: false,
      cancelled: false,
      completedAt: null,
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.creatorId !== req.userId && task.selectedApplicantId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    Object.assign(task, req.body);
    task.updatedAt = new Date();
    
    await task.save();
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only task creator can assign it' });
    }

    task.assignedTo = assignedTo;
    task.status = 'in-progress';
    await task.save();
    
    res.json({ message: 'Task assigned successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign task', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only task creator can delete it' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};
