import express from 'express';
import cors from 'cors';
import { getOrCreateUser, getUserData, performSpin, completeUserTask, getLeaderboard, initMemoryDB } from './db/memoryDB.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initMemoryDB();

app.get('/api/users/:userId', async (req, res) => {
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

app.post('/api/users/:userId/spin', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = performSpin(userId);
    res.json(result);
  } catch (error) {
    console.error('Error performing spin:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/:userId/tasks/:taskId/complete', async (req, res) => {
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

app.post('/api/users/:userId/withdraw', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { amount } = req.body;
    res.json({ success: true, message: 'Withdraw feature (demo mode)' });
  } catch (error) {
    console.error('Error withdrawing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    res.json(getLeaderboard());
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using in-memory database (no SQLite compilation needed)`);
});
