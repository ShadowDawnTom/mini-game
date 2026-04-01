import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Gift, Trophy, User, Wallet, Shield, CreditCard, ChevronRight, X, Lock } from 'lucide-react';
import { useTelegram } from './hooks/useTelegram';
import { apiService } from './services/api';
import WheelSVG from './components/WheelSVG';

const LEADERBOARD_FALLBACK = [
  { name: 'Whale_X', points: '128,500', fragments: 12 },
  { name: 'CryptoKing', points: '95,200', fragments: 9 },
  { name: 'DiamondH', points: '82,100', fragments: 8 },
  { name: 'MoonBoy', points: '65,300', fragments: 6 },
  { name: 'SatoshiF', points: '51,800', fragments: 5 },
];

const DEMO_USER_DATA = {
  balance: 2.56,
  points: 3250,
  spins: 3,
  fragments: { ticket: 2, gold: 1 },
  tasks: [
    { id: 1, name: '关注频道', reward: '+1 次抽奖', completed: true },
    { id: 2, name: '邀请好友', reward: '+2 次抽奖', completed: false },
    { id: 3, name: '绑定钱包', reward: '+3 次抽奖', completed: false },
    { id: 4, name: '每日签到', reward: '+1 次抽奖', completed: true },
  ],
  unlockSteps: { telegram: true, wallet: false, kyc: false, card: false },
  rewards: { total: 12.8, unlocked: 2.56, pending: 6.24, frozen: 4.0 },
  pointsHistory: [
    { description: '转盘抽奖', value: 500, time: '2分钟前' },
    { description: '每日签到', value: 100, time: '1小时前' },
    { description: '邀请好友', value: 800, time: '3小时前' },
    { description: '关注频道', value: 200, time: '昨天' },
    { description: '转盘抽奖', value: 150, time: '昨天' },
  ],
  nfts: [{ id: 1, nft_type: 'mystery_box' }],
  leaderboard: LEADERBOARD_FALLBACK,
  invites: { count: 12, rewards: 3.6, spins: 24 },
  selectedTeam: null,
};

const PRIZE_WEIGHTS = [8, 20, 25, 8, 20, 2, 25, 3, 15, 4];

function pickPrizeIndex() {
  const total = PRIZE_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZE_WEIGHTS.length; i++) {
    r -= PRIZE_WEIGHTS[i];
    if (r <= 0) return i;
  }
  return 0;
}

const prizes = [
  { id: 0, icon: '🎟️', name: '门票碎片×1', rarity: 'rare', color: '#f59e0b', type: 'fragment_ticket', value: 1 },
  { id: 1, icon: '🪙', name: '0.5 USDT', rarity: 'common', color: '#3b82f6', type: 'usdt', value: 0.5 },
  { id: 2, icon: '🔄', name: '再来一次', rarity: 'common', color: '#10b981', type: 'retry', value: 1 },
  { id: 3, icon: '🏅', name: '金条碎片×1', rarity: 'rare', color: '#eab308', type: 'fragment_gold', value: 1 },
  { id: 4, icon: '⭐', name: '500 积分', rarity: 'common', color: '#6366f1', type: 'points', value: 500 },
  { id: 5, icon: '🎁', name: 'NFT 盲盒', rarity: 'epic', color: '#ec4899', type: 'nft', value: 1 },
  { id: 6, icon: '🪙', name: '0.1 USDT', rarity: 'common', color: '#60a5fa', type: 'usdt', value: 0.1 },
  { id: 7, icon: '🎟️', name: '门票碎片×2', rarity: 'legendary', color: '#8b5cf6', type: 'fragment_ticket', value: 2 },
  { id: 8, icon: '🔄', name: '次数+2', rarity: 'common', color: '#34d399', type: 'spins', value: 2 },
  { id: 9, icon: '💎', name: '1.0 USDT', rarity: 'grand', color: '#ef4444', type: 'usdt', value: 1.0 },
];

function applyPrizeLocal(prev, prizeIdx) {
  const p = prizes[prizeIdx];
  const next = {
    ...prev,
    spins: prev.spins,
    balance: prev.balance,
    points: prev.points,
    fragments: { ...prev.fragments },
    nfts: [...(prev.nfts || [])],
    pointsHistory: [...(prev.pointsHistory || [])],
  };
  switch (p.type) {
    case 'usdt':
      next.balance += p.value;
      break;
    case 'points':
      next.points += p.value;
      next.pointsHistory.unshift({ description: '转盘抽奖', value: p.value, time: '刚刚' });
      if (next.pointsHistory.length > 5) next.pointsHistory.pop();
      break;
    case 'fragment_ticket':
      next.fragments.ticket += p.value;
      break;
    case 'fragment_gold':
      next.fragments.gold += p.value;
      break;
    case 'retry':
      next.spins += p.value;
      break;
    case 'spins':
      next.spins += p.value;
      break;
    case 'nft':
      next.nfts.push({ id: next.nfts.length + 1, nft_type: 'mystery_box' });
      break;
    default:
      break;
  }
  next.rewards = {
    total: next.balance * 5,
    unlocked: next.balance,
    pending: next.balance * 2.5,
    frozen: next.balance * 1.5,
  };
  return next;
}

export default function CodeCoinApp() {
  const { user, webApp } = useTelegram();
  const [tab, setTab] = useState('home');
  const [userData, setUserData] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rot, setRot] = useState(0);
  const [modal, setModal] = useState(null);
  const [wdModal, setWdModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  }, [webApp]);

  useEffect(() => {
    const initUser = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiService.getUserData(user.id);
        setUserData(data);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setUserData({ ...DEMO_USER_DATA });
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, [user]);

  const runSpinAnimation = useCallback((prizeIdx) => {
    const extra = (3 + Math.floor(Math.random() * 3)) * 360;
    const target = extra + (360 - prizeIdx * 36 - 18);
    setRot((prev) => prev + target);
  }, []);

  const spin = useCallback(async () => {
    if (spinning || !user?.id) return;
    const base = userData ?? DEMO_USER_DATA;
    if (base.spins <= 0) return;

    setSpinning(true);

    const finish = (prizeIdx, nextUserData) => {
      runSpinAnimation(prizeIdx);
      setTimeout(() => {
        setSpinning(false);
        setModal(prizes[prizeIdx]);
        setUserData(nextUserData);
      }, 4000);
    };

    try {
      const result = await apiService.spin(user.id);
      const prizeIdx = Number(result.prizeId);
      if (Number.isNaN(prizeIdx) || prizeIdx < 0 || prizeIdx > 9) {
        throw new Error('Invalid prize');
      }
      finish(prizeIdx, result.userData);
    } catch (error) {
      console.warn('Spin API failed, using local demo:', error);
      const prev = userData ?? DEMO_USER_DATA;
      const prizeIdx = pickPrizeIndex();
      const afterOneSpin = { ...prev, spins: prev.spins - 1 };
      const nextUserData = applyPrizeLocal(afterOneSpin, prizeIdx);
      finish(prizeIdx, nextUserData);
    }
  }, [spinning, userData, user, runSpinAnimation]);

  const completeTask = async (taskId) => {
    try {
      const result = await apiService.completeTask(user.id, taskId);
      setUserData(result);
      if (webApp) {
        webApp.showAlert('任务完成！');
      }
    } catch (error) {
      console.error('Task completion failed:', error);
      if (webApp) {
        webApp.showAlert('任务完成失败');
      }
    }
  };

  const tabs = [
    { id: 'home', label: '首页', Icon: Home },
    { id: 'rewards', label: '奖励', Icon: Gift },
    { id: 'activity', label: '活动', Icon: Trophy },
    { id: 'profile', label: '我的', Icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  const Dots = ({ have, total }) => (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${i < have ? 'border-amber-400 bg-amber-900 text-amber-400' : 'border-slate-600 bg-slate-700 text-slate-600'}`}>
          {i < have ? '✓' : ''}
        </div>
      ))}
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col items-center px-3 pb-24 pt-2">
      <div className="w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.first_name?.[0] || 'U'}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user?.first_name || 'User'}</p>
            <p className="text-slate-400 text-xs">⭐ {userData?.points || 0} 积分</p>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg px-3 py-1.5">
          <p className="text-amber-400 text-xs font-bold">💰 {userData?.balance?.toFixed(2) || '0.00'} USDT</p>
        </div>
      </div>

      <div className="relative my-2">
        <div className="absolute top-0 left-1/2 z-20" style={{ transform: 'translateX(-50%) translateY(-2px)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '18px solid #f59e0b' }} />
        <motion.div
          animate={{ rotate: rot }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
          style={{ width: 280, height: 280, transformOrigin: '50% 50%' }}
          className={
            !spinning && (userData ?? DEMO_USER_DATA).spins > 0
              ? 'cursor-pointer touch-manipulation'
              : 'pointer-events-none'
          }
          onClick={() => {
            if (!spinning && (userData ?? DEMO_USER_DATA).spins > 0) spin();
          }}
          role="presentation"
        >
          <svg width="280" height="280" viewBox="0 0 300 300">
            <defs>
              <radialGradient id="glow"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" /><stop offset="100%" stopColor="transparent" /></radialGradient>
            </defs>
            <circle cx="150" cy="150" r="149" fill="url(#glow)" stroke="#f59e0b" strokeWidth="2.5" />
            <WheelSVG prizes={prizes} />
          </svg>
        </motion.div>
        <button
          type="button"
          onClick={spin}
          disabled={spinning || (userData ?? DEMO_USER_DATA).spins <= 0}
          className="absolute top-1/2 left-1/2 z-10 w-14 h-14 rounded-full font-bold text-white text-xs"
          style={{
            transform: 'translate(-50%,-50%)',
            background:
              spinning || (userData ?? DEMO_USER_DATA).spins <= 0
                ? '#475569'
                : 'linear-gradient(135deg,#f59e0b,#d97706)',
            boxShadow: spinning ? 'none' : '0 0 24px rgba(245,158,11,0.5)',
          }}
        >
          {spinning ? '...' : 'SPIN'}
        </button>
      </div>

      <div className="flex items-center gap-3 my-1">
        <p className="text-slate-300 text-sm">🎫 剩余次数: <span className="text-amber-400 font-bold">{(userData ?? DEMO_USER_DATA).spins}</span></p>
        <button onClick={() => setTab('activity')} className="text-amber-400 text-xs underline">获取更多 &gt;</button>
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">🧩 碎片收集</p>
        <div className="mb-2">
          <p className="text-xs text-slate-400 mb-1">🎟️ 世界杯门票 {userData?.fragments?.ticket || 0}/6</p>
          <Dots have={userData?.fragments?.ticket || 0} total={6} />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">🏅 黄金产品 {userData?.fragments?.gold || 0}/5</p>
          <Dots have={userData?.fragments?.gold || 0} total={5} />
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">📋 快捷任务</p>
        {userData?.tasks?.map((t, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
            <div><p className="text-white text-xs">{t.name}</p><p className="text-amber-400 text-xs">{t.reward}</p></div>
            <button 
              onClick={() => !t.completed && completeTask(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${t.completed ? 'bg-slate-600 text-slate-400' : 'bg-amber-500 text-white'}`}
            >
              {t.completed ? '已完成' : '去完成'}
            </button>
          </div>
        ))}
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-1">💰 可提现进度</p>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{userData?.balance?.toFixed(2) || '0.00'} USDT</span>
          <span>10.00 USDT</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full" style={{ width: `${Math.min((userData?.balance || 0) / 10 * 100, 100)}%` }} />
        </div>
        <p className="text-slate-500 text-xs mt-1">完成 KYC + 绑定钱包即可提现</p>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="px-3 pb-24 pt-2">
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 my-2 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">奖励总值</p>
        <p className="text-2xl font-bold text-amber-400">{userData?.rewards?.total?.toFixed(2) || '0.00'} <span className="text-base">USDT</span></p>
        <div className="flex gap-4 mt-2">
          <div><p className="text-green-400 text-xs">已解锁</p><p className="text-white text-sm font-bold">{userData?.rewards?.unlocked?.toFixed(2) || '0.00'}</p></div>
          <div><p className="text-amber-400 text-xs">待解锁</p><p className="text-white text-sm font-bold">{userData?.rewards?.pending?.toFixed(2) || '0.00'}</p></div>
          <div><p className="text-slate-500 text-xs">冻结</p><p className="text-white text-sm font-bold">{userData?.rewards?.frozen?.toFixed(2) || '0.00'}</p></div>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-3">🔓 解锁进度</p>
        {[
          { n: '授权 Telegram', p: '+20%', d: userData?.unlockSteps?.telegram || false },
          { n: '绑定 Wallet', p: '+20%', d: userData?.unlockSteps?.wallet || false },
          { n: 'KYC 认证', p: '+30%', d: userData?.unlockSteps?.kyc || false },
          { n: 'CC Card 开卡', p: '+30%', d: userData?.unlockSteps?.card || false }
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${s.d ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
              {s.d ? '✓' : i + 1}
            </div>
            <p className={`flex-1 text-xs ${s.d ? 'text-green-400' : 'text-white'}`}>{s.n}</p>
            <span className="text-amber-400 text-xs font-bold">{s.p}</span>
            {!s.d && <ChevronRight size={14} className="text-slate-500" />}
          </div>
        ))}
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">🧩 碎片合成</p>
        <div className="mb-3 p-2 rounded-lg border border-amber-500/30">
          <div className="flex justify-between items-center mb-2">
            <p className="text-amber-400 text-xs font-bold">🎟️ 世界杯门票碎片</p>
            <p className="text-slate-400 text-xs">{userData?.fragments?.ticket || 0}/6 → 门票抽奖资格</p>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-base ${i <= (userData?.fragments?.ticket || 0) ? 'bg-amber-900 border border-amber-400' : 'bg-slate-700 border border-slate-600'}`}>
                {i <= (userData?.fragments?.ticket || 0) ? '⚽' : <Lock size={10} className="text-slate-500" />}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-3 p-2 rounded-lg border border-yellow-600/30">
          <div className="flex justify-between items-center mb-2">
            <p className="text-yellow-500 text-xs font-bold">🏅 黄金产品碎片</p>
            <p className="text-slate-400 text-xs">{userData?.fragments?.gold || 0}/5 → 1g 联名金条</p>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-base ${i <= (userData?.fragments?.gold || 0) ? 'bg-yellow-900 border border-yellow-500' : 'bg-slate-700 border border-slate-600'}`}>
                {i <= (userData?.fragments?.gold || 0) ? '🪙' : <Lock size={10} className="text-slate-500" />}
              </div>
            ))}
          </div>
        </div>
        <div className="p-2 rounded-lg border border-pink-500/30">
          <p className="text-pink-400 text-xs font-bold mb-2">🎁 NFT 收藏</p>
          <div className="flex gap-2">
            {(userData?.nfts || []).map((nft, i) => (
              <div key={i} className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                🎨
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - (userData?.nfts?.length || 0)) }, (_, i) => (
              <div key={`empty-${i}`} className="w-12 h-12 rounded-lg bg-slate-700 border border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs">?</div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">📊 积分明细</p>
        {(userData?.pointsHistory || []).map((r, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-slate-700 last:border-0">
            <div><p className="text-white text-xs">{r.description}</p><p className="text-slate-500 text-xs">{r.time}</p></div>
            <p className="text-green-400 text-xs font-bold">{r.value > 0 ? '+' : ''}{r.value}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setWdModal(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm my-2">💳 提现</button>
    </div>
  );

  const renderActivity = () => (
    <div className="px-3 pb-24 pt-2">
      <div className="w-full h-32 rounded-xl my-2 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,white 10px,white 11px)' }} />
        <p className="text-4xl mb-1">⚽🏆</p>
        <p className="text-white font-black text-lg">2026 世界杯专题活动</p>
        <p className="text-amber-100 text-xs">CodeCoin × FIFA World Cup 2026</p>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-4 my-2 border border-amber-500/20">
        <div className="flex justify-between items-center mb-3">
          <p className="text-white text-sm font-bold">🏆 限时奖池</p>
          <div className="bg-red-500/20 rounded-full px-2 py-0.5"><p className="text-red-400 text-xs font-mono">23:45:12</p></div>
        </div>
        <div className="flex justify-around text-center">
          <div><p className="text-amber-400 font-bold text-lg">50,000</p><p className="text-slate-400 text-xs">USDT</p></div>
          <div><p className="text-amber-400 font-bold text-lg">10</p><p className="text-slate-400 text-xs">世界杯门票</p></div>
          <div><p className="text-amber-400 font-bold text-lg">100g</p><p className="text-slate-400 text-xs">黄金</p></div>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">🏅 排行榜 TOP 5</p>
        {(userData?.leaderboard || []).map((u, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-700 last:border-0">
            <span className="w-6 text-center text-sm">{['🥇', '🥈', '🥉', '4', '5'][i]}</span>
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">{u.name[0]}</div>
            <p className="flex-1 text-white text-xs font-semibold">{u.name}</p>
            <div className="text-right">
              <p className="text-amber-400 text-xs font-bold">{u.points}</p>
              <p className="text-slate-500 text-xs">{u.fragments} 碎片</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-1">⚔️ 阵营选择</p>
        <p className="text-slate-400 text-xs mb-3">支持球队获胜，全员瓜分额外奖池！</p>
        <div className="grid grid-cols-3 gap-2">
          {['🇧🇷 巴西', '🇦🇷 阿根廷', '🇫🇷 法国', '🇩🇪 德国', '🇪🇸 西班牙', '🏴󠁧󠁢󠁥󠁮󠁧󠁿 英格兰'].map((t, i) => (
            <button key={i} className={`rounded-lg p-2 text-center text-xs text-white border transition-colors ${userData?.selectedTeam === i ? 'bg-amber-600 border-amber-400' : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-amber-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="px-3 pb-24 pt-2">
      <div className="flex flex-col items-center py-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
          {user?.first_name?.[0] || 'U'}
        </div>
        <p className="text-white font-bold">{user?.username || user?.first_name || 'User'}</p>
        <p className="text-slate-400 text-xs">UID: {user?.id || '00000000'}</p>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-3">📍 账户状态</p>
        <div className="flex items-center justify-between mb-2">
          {[
            { label: '授权', done: true },
            { label: '绑定', done: userData?.unlockSteps?.wallet || false },
            { label: 'KYC', done: userData?.unlockSteps?.kyc || false },
            { label: '开卡', done: userData?.unlockSteps?.card || false }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${s.done ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                {s.done ? '✓' : i + 1}
              </div>
              <p className={`text-xs ${s.done ? 'text-green-400' : 'text-slate-400'}`}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5">
          <div className="flex-1 h-1 bg-green-500 rounded-full" />
          <div className={`flex-1 h-1 rounded-full ${userData?.unlockSteps?.wallet ? 'bg-green-500' : 'bg-slate-700'}`} />
          <div className={`flex-1 h-1 rounded-full ${userData?.unlockSteps?.kyc ? 'bg-green-500' : 'bg-slate-700'}`} />
        </div>
      </div>
      {[
        { icon: <Wallet size={16} />, n: '绑定钱包', d: '连接 Web3 钱包获取更多奖励', c: 'text-blue-400', b: userData?.unlockSteps?.wallet ? '已绑定' : '未绑定' },
        { icon: <Shield size={16} />, n: 'KYC 认证', d: '完成身份认证解锁提现', c: 'text-purple-400', b: userData?.unlockSteps?.kyc ? '已认证' : '未认证' },
        { icon: <CreditCard size={16} />, n: 'CC Card 开卡', d: '开通联名卡享受专属权益', c: 'text-amber-400', b: userData?.unlockSteps?.card ? '已开卡' : '未开卡' }
      ].map((m, i) => (
        <div key={i} className="w-full bg-slate-800 rounded-xl p-3 my-2 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center ${m.c}`}>{m.icon}</div>
          <div className="flex-1"><p className="text-white text-sm font-semibold">{m.n}</p><p className="text-slate-400 text-xs">{m.d}</p></div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${m.b.startsWith('已') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{m.b}</span>
          <ChevronRight size={14} className="text-slate-500" />
        </div>
      ))}
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">💳 CC Card 权益对比</p>
        <div className="grid grid-cols-3 gap-px text-xs">
          {[
            ['权益', '普通用户', '开卡用户'],
            ['提现额度', '10 USDT', '无限制'],
            ['合成加速', '—', '2x'],
            ['专属NFT', '—', '✓'],
            ['每日抽奖', '3次', '10次']
          ].map((row, i) => (
            <React.Fragment key={i}>
              <div className={`p-1.5 ${i === 0 ? 'text-slate-400' : 'text-slate-300'} ${i % 2 === 0 ? 'bg-slate-700/50' : ''}`}>{row[0]}</div>
              <div className={`p-1.5 text-center ${i === 0 ? 'text-slate-400' : 'text-slate-400'} ${i % 2 === 0 ? 'bg-slate-700/50' : ''}`}>{row[1]}</div>
              <div className={`p-1.5 text-center ${i === 0 ? 'text-amber-400 font-bold' : 'text-green-400'} ${i % 2 === 0 ? 'bg-slate-700/50' : ''}`}>{row[2]}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">👥 邀请记录</p>
        <div className="flex justify-around text-center mb-3">
          <div><p className="text-amber-400 font-bold text-xl">{userData?.invites?.count || 0}</p><p className="text-slate-400 text-xs">已邀请</p></div>
          <div><p className="text-green-400 font-bold text-xl">{userData?.invites?.rewards?.toFixed(2) || '0.00'}</p><p className="text-slate-400 text-xs">USDT奖励</p></div>
          <div><p className="text-purple-400 font-bold text-xl">{userData?.invites?.spins || 0}</p><p className="text-slate-400 text-xs">抽奖次数</p></div>
        </div>
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold">📤 邀请好友</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-sm relative" style={{ background: '#0f172a', minHeight: '100vh' }}>
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
          {tab === 'home' && renderHome()}
          {tab === 'rewards' && renderRewards()}
          {tab === 'activity' && renderActivity()}
          {tab === 'profile' && renderProfile()}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-30">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-0.5">
              <t.Icon size={20} className={tab === t.id ? 'text-amber-400' : 'text-slate-500'} />
              <span className={`text-xs ${tab === t.id ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setModal(null)}>
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="bg-slate-800 rounded-2xl p-6 mx-6 w-64 text-center border-2 relative" style={{ borderColor: modal.color }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setModal(null)} className="absolute top-3 right-3 text-slate-400"><X size={16} /></button>
                <p className="text-5xl mb-2">{modal.icon}</p>
                <p className="text-white font-bold text-lg mb-1">🎉 恭喜获得</p>
                <p className="font-bold text-lg mb-2" style={{ color: modal.color }}>{modal.name}</p>
                <p className="text-slate-400 text-xs mb-4">已存入奖励账户</p>
                <button onClick={() => setModal(null)} className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm mb-2">继续抽奖</button>
                <button onClick={() => { setModal(null); setTab('rewards'); }} className="text-amber-400 text-xs underline">查看我的奖励 &gt;</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wdModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setWdModal(false)}>
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-slate-800 rounded-2xl p-5 mx-6 w-64 border border-slate-700" onClick={e => e.stopPropagation()}>
                <p className="text-white font-bold text-center mb-3">💳 提现校验</p>
                {[
                  { n: '绑定 Wallet', d: userData?.unlockSteps?.wallet || false },
                  { n: 'KYC 认证', d: userData?.unlockSteps?.kyc || false },
                  { n: 'CC Card 开卡', d: userData?.unlockSteps?.card || false }
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${s.d ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    {s.d ? <div className="text-green-400 text-xs">✓</div> : <X size={14} className="text-red-400" />}
                    <span className={`text-sm flex-1 ${s.d ? 'text-green-400' : 'text-red-400'}`}>{s.n}</span>
                    {!s.d && <button className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">去完成</button>}
                  </div>
                ))}
                <p className="text-slate-400 text-xs text-center mt-2 mb-3">
                  {userData?.unlockSteps?.wallet && userData?.unlockSteps?.kyc && userData?.unlockSteps?.card 
                    ? '满足提现条件！' 
                    : '请完成以上步骤后再提现'}
                </p>
                <button onClick={() => setWdModal(false)} className="w-full py-2 rounded-lg bg-slate-700 text-slate-300 text-sm">关闭</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
