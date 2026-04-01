import { getDB } from '../db/init.js';
import { prizes, prizeWeights } from '../config/prizes.js';

export function getOrCreateUser(userId) {
  const db = getDB();
  
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    db.prepare(`
      INSERT INTO users (id, username, first_name, spins) 
      VALUES (?, ?, ?, ?)
    `).run(userId, `user_${userId}`, `User${userId}`, 3);
    
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    const tasks = db.prepare('SELECT id FROM tasks').all();
    const insertUserTask = db.prepare('INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)');
    tasks.forEach(task => {
      insertUserTask.run(userId, task.id);
    });
  }
  
  return user;
}

export function getUserData(userId) {
  const db = getDB();
  const user = getOrCreateUser(userId);
  
  const tasks = db.prepare(`
    SELECT t.id, t.name, t.reward, ut.completed
    FROM tasks t
    LEFT JOIN user_tasks ut ON t.id = ut.task_id AND ut.user_id = ?
    ORDER BY t.id
  `).all(userId);
  
  const pointsHistory = db.prepare(`
    SELECT description, value, 
      CASE 
        WHEN created_at >= datetime('now', '-1 hour') THEN 
          CAST((julianday('now') - julianday(created_at)) * 24 * 60 AS INTEGER) || '分钟前'
        WHEN created_at >= datetime('now', '-1 day') THEN
          CAST((julianday('now') - julianday(created_at)) * 24 AS INTEGER) || '小时前'
        ELSE '昨天'
      END as time
    FROM points_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(userId);
  
  const nfts = db.prepare('SELECT * FROM nfts WHERE user_id = ?').all(userId);
  
  const leaderboard = db.prepare(`
    SELECT 
      first_name as name,
      points,
      (fragment_ticket + fragment_gold) as fragments
    FROM users
    ORDER BY points DESC
    LIMIT 5
  `).all();
  
  const invitesStats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(rewards_given), 0) as rewards,
      COALESCE(SUM(spins_given), 0) as spins
    FROM invites
    WHERE inviter_id = ?
  `).get(userId);
  
  return {
    balance: user.balance,
    points: user.points,
    spins: user.spins,
    fragments: {
      ticket: user.fragment_ticket,
      gold: user.fragment_gold
    },
    tasks: tasks.map(t => ({
      id: t.id,
      name: t.name,
      reward: t.reward,
      completed: Boolean(t.completed)
    })),
    unlockSteps: {
      telegram: Boolean(user.unlock_telegram),
      wallet: Boolean(user.unlock_wallet),
      kyc: Boolean(user.unlock_kyc),
      card: Boolean(user.unlock_card)
    },
    rewards: {
      total: user.balance * 5,
      unlocked: user.balance,
      pending: user.balance * 2.5,
      frozen: user.balance * 1.5
    },
    pointsHistory,
    nfts,
    leaderboard,
    invites: invitesStats,
    selectedTeam: user.selected_team
  };
}

function getRandomPrize() {
  const totalWeight = prizeWeights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < prizes.length; i++) {
    random -= prizeWeights[i];
    if (random <= 0) {
      return prizes[i];
    }
  }
  
  return prizes[0];
}

export function performSpin(userId) {
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.spins <= 0) {
    throw new Error('No spins left');
  }
  
  const prize = getRandomPrize();
  
  db.prepare('UPDATE users SET spins = spins - 1 WHERE id = ?').run(userId);
  
  db.prepare(`
    INSERT INTO spins_history (user_id, prize_id, prize_type, prize_value)
    VALUES (?, ?, ?, ?)
  `).run(userId, prize.id, prize.type, prize.value);
  
  switch (prize.type) {
    case 'usdt':
      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(prize.value, userId);
      break;
    case 'points':
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(prize.value, userId);
      db.prepare(`
        INSERT INTO points_history (user_id, description, value)
        VALUES (?, ?, ?)
      `).run(userId, '转盘抽奖', prize.value);
      break;
    case 'fragment_ticket':
      db.prepare('UPDATE users SET fragment_ticket = fragment_ticket + ? WHERE id = ?').run(prize.value, userId);
      break;
    case 'fragment_gold':
      db.prepare('UPDATE users SET fragment_gold = fragment_gold + ? WHERE id = ?').run(prize.value, userId);
      break;
    case 'retry':
      db.prepare('UPDATE users SET spins = spins + ? WHERE id = ?').run(prize.value, userId);
      break;
    case 'spins':
      db.prepare('UPDATE users SET spins = spins + ? WHERE id = ?').run(prize.value, userId);
      break;
    case 'nft':
      db.prepare('INSERT INTO nfts (user_id, nft_type) VALUES (?, ?)').run(userId, 'mystery_box');
      break;
  }
  
  const userData = getUserData(userId);
  
  return {
    prizeId: prize.id,
    prize,
    userData
  };
}

export function completeUserTask(userId, taskId) {
  const db = getDB();
  
  const userTask = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?').get(userId, taskId);
  
  if (!userTask) {
    throw new Error('Task not found');
  }
  
  if (userTask.completed) {
    throw new Error('Task already completed');
  }
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  
  db.prepare(`
    UPDATE user_tasks 
    SET completed = 1, completed_at = CURRENT_TIMESTAMP 
    WHERE user_id = ? AND task_id = ?
  `).run(userId, taskId);
  
  db.prepare('UPDATE users SET spins = spins + ?, points = points + ? WHERE id = ?')
    .run(task.spins_reward, task.points_reward, userId);
  
  if (task.points_reward > 0) {
    db.prepare(`
      INSERT INTO points_history (user_id, description, value)
      VALUES (?, ?, ?)
    `).run(userId, task.name, task.points_reward);
  }
  
  return getUserData(userId);
}
