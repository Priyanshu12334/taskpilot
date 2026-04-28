const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, admin, approved } = require('../middleware/authMiddleware');

const router = express.Router();

// The "protect" and "approved" middleware ensures no one can post or get tasks without permissions.
router.route('/').post(protect, admin, createTask).get(protect, approved, getTasks);

// Route parameters (like :id) handle standard modification/deletion loops attached to distinct task _id
router.route('/:id').put(protect, approved, updateTask).delete(protect, admin, deleteTask);

module.exports = router;
