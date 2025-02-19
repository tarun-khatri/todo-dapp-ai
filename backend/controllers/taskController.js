const Task = require('../models/Task');
const taskManagerContract = require('../config/blockchain');

// Get all tasks for the authenticated user
exports.getTasks = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const tasks = await Task.find({ walletAddress });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single task by ID (only if it belongs to the user)
exports.getTask = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const task = await Task.findOne({ _id: req.params.id, walletAddress });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const { title, description, deadline, priority } = req.body;
    const task = new Task({
      walletAddress,
      title,
      description,
      deadline,
      priority,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing task
exports.updateTask = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const { title, description, deadline, priority, completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, walletAddress },
      { title, description, deadline, priority, completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const task = await Task.findOneAndDelete({ _id: req.params.id, walletAddress });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a task as complete and record its blockchain hash
exports.completeTask = async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress;
    const { taskId, blockchainTaskHash } = req.body;

    // Update the task in the database
    const task = await Task.findOneAndUpdate(
      { _id: taskId, walletAddress },
      { completed: true, blockchainTaskHash },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify task completion on-chain using the smart contract
exports.verifyTaskOnChain = async (req, res) => {
  try {
    const { walletAddress, taskHash } = req.body;
    // Call the smart contract function isTaskCompleted (this is a read-only call)
    const isCompleted = await taskManagerContract.isTaskCompleted(walletAddress, taskHash);
    res.json({ isCompleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying task on blockchain' });
  }
};
