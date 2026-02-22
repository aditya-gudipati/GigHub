import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  assignTask,
  deleteTask,
} from '../controllers/taskController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', authMiddleware, updateTask);
router.post('/:id/assign', authMiddleware, assignTask);
router.delete('/:id', authMiddleware, deleteTask);

export default router;
