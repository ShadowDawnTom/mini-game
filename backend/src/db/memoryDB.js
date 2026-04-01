const users = new Map();
const tasks = [
  { id: 1, name: '关注频道', reward: '+1 次抽奖', spins_reward: 1, points_reward: 200, task_type: 'channel' },
  { id: 2, name: '邀请好友', reward: '+2 次抽奖', spins_reward: 2, points_reward: 800, task_type: 'invite' },
  { id: 3, name: '绑定钱包', reward: '+3 次抽奖', spins_reward: 3, points_reward: 500, task_type: 'wallet' },
  { id: 4, name: '每日签到', reward: '+1 次抽奖', spins_reward: 1, points_reward: 100, task_type: 'daily' },
];

const leaderboardData = [
  { name: 'Whale_X', points: 128500, fragments: 12 },
  { name: 'CryptoKing', points: 95200, fragments: 9 },
  { name: 'DiamondH', points: 82100, fragments: 8 },
  { name: 'MoonBoy', points: 65300, fragments: 6 },
  { name: 'SatoshiF', points: 51800, fragments: 5 },
];

export function initMemoryDB() {
  console.log('✅ Using in-memory database (for development without SQLite compilation)');
}

export function getOrCreateUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      username: `user_${userId}`,
      first_name: `User${userId}`,
      balance: 2.56,
      points: 3250,
      spins: 3,
      fragment_ticket: 2,
      fragment_gold: 1,
      selected_team: null,
      unlock_telegram: true,
      unlock_wallet: false,
      unlock_kyc: false,
      unlock_card: false,
      tasks: tasks.map(t => ({ ...t, completed: [1, 4].includes(t.id) })),
      pointsHistory: [
        { description: '转盘抽奖', value: 500, time: '2分钟前' },
        { description: '每日签到', value: 100, time: '1小时前' },
        { description: '邀请好友', value: 800, time: '3小时前' },
        { description: '关注频道', value: 200, time: '昨天' },
        { description: '转盘抽奖', value: 150, time: '昨天' },
      ],
      nfts: [{ id: 1, nft_type: 'mystery_box' }],
      invites: { count: 12, rewards: 3.60, spins: 24 }
    });
  }
  return users.get(userId);
}

export function getUserData(userId) {
  const user = getOrCreateUser(userId);
  return {
    balance: user.balance,
    points: user.points,
    spins: user.spins,
    fragments: {
      ticket: user.fragment_ticket,
      gold: user.fragment_gold
    },
    tasks: user.tasks,
    unlockSteps: {
      telegram: user.unlock_telegram,
      wallet: user.unlock_wallet,
      kyc: user.unlock_kyc,
      card: user.unlock_card
    },
    rewards: {
      total: user.balance * 5,
      unlocked: user.balance,
      pending: user.balance * 2.5,
      frozen: user.balance * 1.5
    },
    pointsHistory: user.pointsHistory,
    nfts: user.nfts,
    leaderboard: leaderboardData,
    invites: user.invites,
    selectedTeam: user.selected_team
  };
}

export function performSpin(userId) {
  const user = getOrCreateUser(userId);
  
  if (user.spins <= 0) {
    throw new Error('No spins left');
  }
  
  user.spins--;
  
  const prizes = [
    { id: 0, type: 'fragment_ticket', value: 1 },
    { id: 1, type: 'usdt', value: 0.5 },
    { id: 2, type: 'retry', value: 1 },
    { id: 3, type: 'fragment_gold', value: 1 },
    { id: 4, type: 'points', value: 500 },
    { id: 5, type: 'nft', value: 1 },
    { id: 6, type: 'usdt', value: 0.1 },
    { id: 7, type: 'fragment_ticket', value: 2 },
    { id: 8, type: 'spins', value: 2 },
    { id: 9, type: 'usdt', value: 1.0 },
  ];
  
  const prizeWeights = [8, 20, 25, 8, 20, 2, 25, 3, 15, 4];
  const totalWeight = prizeWeights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  let prizeId = 0;
  for (let i = 0; i < prizes.length; i++) {
    random -= prizeWeights[i];
    if (random <= 0) {
      prizeId = i;
      break;
    }
  }
  
  const prize = prizes[prizeId];
  
  switch (prize.type) {
    case 'usdt':
      user.balance += prize.value;
      break;
    case 'points':
      user.points += prize.value;
      user.pointsHistory.unshift({ description: '转盘抽奖', value: prize.value, time: '刚刚' });
      if (user.pointsHistory.length > 5) user.pointsHistory.pop();
      break;
    case 'fragment_ticket':
      user.fragment_ticket += prize.value;
      break;
    case 'fragment_gold':
      user.fragment_gold += prize.value;
      break;
    case 'retry':
      user.spins += prize.value;
      break;
    case 'spins':
      user.spins += prize.value;
      break;
    case 'nft':
      user.nfts.push({ id: user.nfts.length + 1, nft_type: 'mystery_box' });
      break;
  }
  
  return {
    prizeId,
    prize,
    userData: getUserData(userId)
  };
}

export function completeUserTask(userId, taskId) {
  const user = getOrCreateUser(userId);
  const task = user.tasks.find(t => t.id === taskId);
  
  if (!task) {
    throw new Error('Task not found');
  }
  
  if (task.completed) {
    throw new Error('Task already completed');
  }
  
  task.completed = true;
  user.spins += task.spins_reward;
  user.points += task.points_reward;
  
  if (task.points_reward > 0) {
    user.pointsHistory.unshift({ 
      description: task.name, 
      value: task.points_reward, 
      time: '刚刚' 
    });
    if (user.pointsHistory.length > 5) user.pointsHistory.pop();
  }
  
  return getUserData(userId);
}

export function getLeaderboard() {
  return leaderboardData;
}
