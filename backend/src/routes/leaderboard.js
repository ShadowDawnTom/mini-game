import express from 'express';
import { getDB } from '../db/init.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const topUsers = db.prepare(`
      SELECT 
        id,
        first_name as name,
        points,
        (fragment_ticket + fragment_gold) as fragments
      FROM users
      ORDER BY points DESC
      LIMIT 5
    `).all();
    
    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
