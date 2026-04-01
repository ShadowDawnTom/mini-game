import express from 'express';
import { getDB } from '../db/init.js';
import { getOrCreateUser, getUserData, performSpin, completeUserTask } from '../services/userService.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = getOrCreateUser(userId);
    const userData = getUserData(userId);
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:userId/spin', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = performSpin(userId);
    res.json(result);
  } catch (error) {
    console.error('Error performing spin:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:userId/tasks/:taskId/complete', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const taskId = parseInt(req.params.taskId);
    const userData = completeUserTask(userId, taskId);
    res.json(userData);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:userId/withdraw', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { amount } = req.body;
    const db = getDB();
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.unlock_wallet || !user.unlock_kyc || !user.unlock_card) {
      return res.status(400).json({ error: 'Complete all unlock steps first' });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(amount, userId);
    
    res.json({ success: true, newBalance: user.balance - amount });
  } catch (error) {
    console.error('Error withdrawing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
