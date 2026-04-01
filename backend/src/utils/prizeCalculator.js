const prizeWeights = [8, 20, 25, 8, 20, 2, 25, 3, 15, 4];

export function calculateProbabilities() {
  const total = prizeWeights.reduce((sum, w) => sum + w, 0);
  return prizeWeights.map(w => (w / total * 100).toFixed(2));
}

export function analyzeCost(prizes, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let totalCost = 0;
  
  prizes.forEach((prize, i) => {
    const probability = weights[i] / total;
    if (prize.type === 'usdt') {
      totalCost += prize.value * probability;
    }
  });
  
  return totalCost;
}

export function getExpectedValue(plays = 100) {
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
  
  const avgCost = analyzeCost(prizes, prizeWeights);
  const total = prizeWeights.reduce((sum, w) => sum + w, 0);
  
  const retryProb = prizeWeights[2] / total;
  const spinsProb = prizeWeights[8] / total;
  const avgExtraSpins = retryProb * 1 + spinsProb * 2;
  
  const effectivePlays = plays * (1 + avgExtraSpins);
  const totalUSDT = avgCost * effectivePlays;
  
  return {
    avgCostPerSpin: avgCost.toFixed(4),
    expectedUSDTFor100Spins: totalUSDT.toFixed(2),
    avgExtraSpinsPerPlay: avgExtraSpins.toFixed(2),
    effectivePlays: effectivePlays.toFixed(0)
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎲 奖品概率分析\n');
  console.log('各奖品中奖概率:');
  calculateProbabilities().forEach((prob, i) => {
    console.log(`  位置${i}: ${prob}%`);
  });
  
  console.log('\n💰 成本分析:');
  const analysis = getExpectedValue(100);
  console.log(`  平均每次抽奖成本: ${analysis.avgCostPerSpin} USDT`);
  console.log(`  100次抽奖预期成本: ${analysis.expectedUSDTFor100Spins} USDT`);
  console.log(`  平均额外抽奖次数: ${analysis.avgExtraSpinsPerPlay} 次/抽`);
  console.log(`  100次实际变成: ${analysis.effectivePlays} 次抽奖机会`);
}
