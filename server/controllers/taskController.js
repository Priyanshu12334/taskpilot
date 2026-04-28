const taskService = require('../services/taskService');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to create and emit notification
const createNotification = async (req, userId, message, type = 'assignment') => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type
    });
    
    // Emit real-time if io is available
    const io = req.app.get('io');
    if (io) {
      io.emit(`notification_${userId}`, notification);
    }
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Logged in users only)
const createTask = async (req, res) => {
  try {
    console.log("--- Task Creation Debug ---");
    console.log("User:", req.user._id, "Role:", req.user.role);
    console.log("Body:", req.body);
    
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }

    // Create task using service layer
    const task = await taskService.createTask({
      user: req.user._id,
      title,
      description,
      status: status || 'Pending',
      assignedTo: assignedTo || null,
      dueDate,
      activityLog: [{ 
        action: 'Task created', 
        user: req.user.name, 
        timestamp: new Date() 
      }]
    });

    res.status(201).json(task);

    // Trigger notification if assigned
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification(
        req,
        assignedTo,
        `You have been assigned a new task: "${title}"`
      );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for the logged in user with filtering and pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', status = 'All', sort = 'latest' } = req.query;

    // --- Role-based visibility ---
    const role = req.user.role?.toLowerCase();
    const query = {};
    const isAdmin = role === 'admin';

    if (!isAdmin) {
      // Non-admins see tasks they created OR tasks assigned to them
      query.$or = [
        { user: req.user._id },
        { assignedTo: req.user._id }
      ];
    }
    // (Admin: no filter → sees all tasks)

    console.log(`[getTasks] User: ${req.user.name} | Role: ${req.user.role} | Base query:`, JSON.stringify(query));

    if (status && status !== 'All') {
      if (status === 'Overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.status = { $ne: 'Completed' };
        query.dueDate = { $lt: today };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOption = sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };
    const skip = (page - 1) * limit;

    // Use service layer for DB operations
    const totalMatchingTasks = await taskService.countTasks(query);
    const tasks = await taskService.getTasks(query, sortOption, skip, parseInt(limit));

    // Dashboard stats calculation via service using the SAME visibility query
    const statsData = await taskService.getTaskStats(query);
    
    // Add overdue count calculation
    const todayForStats = new Date();
    todayForStats.setHours(0, 0, 0, 0);
    const overdueQuery = {
      ...query,
      status: { $ne: 'Completed' },
      dueDate: { $lt: todayForStats }
    };
    const overdue = await taskService.countTasks(overdueQuery);
    
    let total = 0, pending = 0, completed = 0, inProgress = 0;
    statsData.forEach(s => {
      total += s.count;
      if (!s._id) return;
      const status = s._id.toString().trim().toLowerCase();
      if (status === 'pending') pending = s.count;
      if (status === 'completed') completed = s.count;
      if (status === 'in progress') inProgress = s.count;
    });

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(totalMatchingTasks / limit) || 1,
      currentPage: parseInt(page),
      stats: { total, pending, completed, inProgress, overdue }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await taskService.findTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, assignedTo, dueDate } = req.body;
    const userId = req.user._id.toString();
    const userRole = req.user.role?.toLowerCase();

    // assignedTo may be a populated object (has ._id) or a plain ObjectId string
    const assignedToId = task.assignedTo?._id
      ? task.assignedTo._id.toString()
      : task.assignedTo?.toString();

    const isAdmin = userRole === 'admin';
    const isAssignedUser = assignedToId && assignedToId === userId;

    console.log(`[updateTask] User: ${req.user.name} | Role: ${userRole} | assignedToId: ${assignedToId} | isAssigned: ${isAssignedUser}`);

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        message: 'Access denied. You can only update tasks assigned to you.'
      });
    }

    // Helper to log without duplicates and with limit
    const addLog = (message) => {
      const lastLog = task.activityLog[task.activityLog.length - 1];
      if (lastLog && lastLog.action === message) return; // Prevent duplicate
      
      task.activityLog.push({ action: message, user: req.user.name });
      
      // Limit to last 10 entries for performance
      if (task.activityLog.length > 10) {
        task.activityLog.shift();
      }
    };

    if (isAdmin) {
      // Logic for logging changes
      if (status && status !== task.status) {
        addLog(`Status changed to ${status}`);
        
        // Specialized alert for completions (Admin only notification)
        if (status === 'Completed' && task.status !== 'Completed') {
          const io = req.app.get('io');
          if (io) {
            io.emit('taskCompletedAlert', {
              user: req.user.name,
              userId: req.user._id,
              taskTitle: task.title,
              timestamp: new Date()
            });
          }
        }
      }
      if (dueDate && task.dueDate?.toISOString().split('T')[0] !== dueDate) {
        addLog(`Due date updated to ${dueDate}`);
      }
      if (assignedTo !== undefined) {
        const oldAssignedTo = task.assignedTo?.toString();
        const newAssignedTo = assignedTo || null;
        
        if (newAssignedTo !== oldAssignedTo) {
          let logAction = 'Task unassigned';
          if (newAssignedTo) {
            const assignedUser = await User.findById(newAssignedTo);
            logAction = `Assigned to ${assignedUser ? assignedUser.name : 'Unknown User'}`;
          }
          addLog(logAction);
        }

        task.assignedTo = newAssignedTo;

        // If assignment changed and not assigning to self
        if (newAssignedTo && newAssignedTo !== oldAssignedTo && newAssignedTo !== userId) {
          await createNotification(
            req,
            newAssignedTo,
            `You have been assigned to task: "${task.title}"`
          );
        }
      }

      // Admin can change everything
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.dueDate = dueDate || task.dueDate;
    } else {
      // Assigned member can only update status
      if (status && status !== task.status) {
        addLog(`Status changed to ${status}`);
      }
      task.status = status || task.status;
    }

    // Save and re-populate so frontend gets full user object back
    await task.save();
    const updatedTask = await taskService.findTaskById(task._id);

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('[updateTask] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await taskService.findTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role?.toLowerCase() !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete tasks' });
    }

    // Delete using service
    await taskService.deleteTask(task);
    
    res.status(200).json({ id: req.params.id, message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
