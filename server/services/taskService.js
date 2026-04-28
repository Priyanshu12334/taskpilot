const Task = require('../models/Task');
const mongoose = require('mongoose');

const createTask = async (taskData) => {
  const task = await Task.create(taskData);
  // Populate assignedTo so frontend card shows user name immediately
  return await Task.findById(task._id).populate('assignedTo', 'name email');
};

const countTasks = async (query) => {
  return await Task.countDocuments(query);
};

const getTasks = async (query, sortOption, skip, limit) => {
  return await Task.find(query)
    .populate('assignedTo', 'name email')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
};

const getTaskStats = async (matchQuery) => {
  const pipeline = [];
  
  // Robust casting for aggregation match stage
  if (matchQuery && Object.keys(matchQuery).length > 0) {
    const castMatch = (q) => {
      const result = { ...q };
      
      // Recursively cast fields that should be ObjectIds
      const keys = ['user', 'assignedTo', '_id'];
      keys.forEach(key => {
        if (result[key]) {
          if (typeof result[key] === 'string' && mongoose.Types.ObjectId.isValid(result[key])) {
            result[key] = new mongoose.Types.ObjectId(result[key]);
          } else if (result[key].$in && Array.isArray(result[key].$in)) {
             result[key].$in = result[key].$in.map(id => new mongoose.Types.ObjectId(id.toString()));
          }
        }
      });

      if (result.$or) {
        result.$or = result.$or.map(clause => castMatch(clause));
      }
      if (result.$and) {
        result.$and = result.$and.map(clause => castMatch(clause));
      }
      
      return result;
    };

    pipeline.push({ $match: castMatch(matchQuery) });
  }

  pipeline.push({ $group: { _id: "$status", count: { $sum: 1 } } });
  return await Task.aggregate(pipeline);
};

const findTaskById = async (id) => {
  return await Task.findById(id).populate('assignedTo', 'name email');
};

const updateTask = async (task) => {
  return await task.save();
};

const deleteTask = async (task) => {
  return await task.deleteOne();
};

module.exports = {
  createTask,
  countTasks,
  getTasks,
  getTaskStats,
  findTaskById,
  updateTask,
  deleteTask
};
