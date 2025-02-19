const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  verifyTaskOnChain,
} = require('../controllers/taskController');

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/complete', completeTask);
router.post('/verify', verifyTaskOnChain);

module.exports = router;
