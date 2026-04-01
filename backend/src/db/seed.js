import { getDB } from './init.js';

export function seedDatabase() {
  const db = getDB();
  
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (existingUsers.count > 0) {
    console.log('Database already seeded');
    return;
  }
  
  const mockUsers = [
    { id: 1001, username: 'Whale_X', first_name: 'Whale_X', points: 128500, fragment_ticket: 12, fragment_gold: 0 },
    { id: 1002, username: 'CryptoKing', first_name: 'CryptoKing', points: 95200, fragment_ticket: 9, fragment_gold: 0 },
    { id: 1003, username: 'DiamondH', first_name: 'DiamondH', points: 82100, fragment_ticket: 8, fragment_gold: 0 },
    { id: 1004, username: 'MoonBoy', first_name: 'MoonBoy', points: 65300, fragment_ticket: 6, fragment_gold: 0 },
    { id: 1005, username: 'SatoshiF', first_name: 'SatoshiF', points: 51800, fragment_ticket: 5, fragment_gold: 0 },
  ];
  
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, first_name, points, fragment_ticket, fragment_gold, balance, spins)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  mockUsers.forEach(user => {
    insertUser.run(
      user.id,
      user.username,
      user.first_name,
      user.points,
      user.fragment_ticket,
      user.fragment_gold,
      user.points * 0.01,
      3
    );
  });
  
  console.log('✅ Database seeded with mock users');
}
