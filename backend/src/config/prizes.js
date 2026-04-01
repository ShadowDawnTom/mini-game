export const prizes = [
  { id: 0, icon: '🎟️', name: '门票碎片×1', type: 'fragment_ticket', value: 1, weight: 8 },
  { id: 1, icon: '🪙', name: '0.5 USDT', type: 'usdt', value: 0.5, weight: 20 },
  { id: 2, icon: '🔄', name: '再来一次', type: 'retry', value: 1, weight: 25 },
  { id: 3, icon: '🏅', name: '金条碎片×1', type: 'fragment_gold', value: 1, weight: 8 },
  { id: 4, icon: '⭐', name: '500 积分', type: 'points', value: 500, weight: 20 },
  { id: 5, icon: '🎁', name: 'NFT 盲盒', type: 'nft', value: 1, weight: 2 },
  { id: 6, icon: '🪙', name: '0.1 USDT', type: 'usdt', value: 0.1, weight: 25 },
  { id: 7, icon: '🎟️', name: '门票碎片×2', type: 'fragment_ticket', value: 2, weight: 3 },
  { id: 8, icon: '🔄', name: '次数+2', type: 'spins', value: 2, weight: 15 },
  { id: 9, icon: '💎', name: '1.0 USDT', type: 'usdt', value: 1.0, weight: 4 },
];

export const prizeWeights = prizes.map(p => p.weight);
