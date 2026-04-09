import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Gift, Trophy, User, Wallet, CreditCard, ChevronRight, Check, X, Lock, Target, Clock, Users, TrendingUp, Share2, ShoppingCart } from 'lucide-react';

const prizes = [
  { id:0, icon:'💫', name:'再接再厉', lines:['再接再厉'], type:'miss', color:'#64748b' },
  { id:1, icon:'🪙', name:'0.5 USDC', lines:['0.5','USDC'], detail:'≈ 0.5 USDC', type:'usdc', value:0.5, color:'#3b82f6' },
  { id:2, icon:'💫', name:'再接再厉', lines:['再接再厉'], type:'miss', color:'#64748b' },
  { id:3, icon:'🔄', name:'次数×1', lines:['次数×1'], type:'spin', value:1, color:'#10b981' },
  { id:4, icon:'💫', name:'再接再厉', lines:['再接再厉'], type:'miss', color:'#64748b' },
  { id:5, icon:'🏅', name:'金条碎片', lines:['金条','碎片'], type:'fragment', color:'#eab308' },
  { id:6, icon:'💫', name:'再接再厉', lines:['再接再厉'], type:'miss', color:'#64748b' },
  { id:7, icon:'💎', name:'1 USDC', lines:['1','USDC'], detail:'≈ 1.0 USDC', type:'usdc', value:1.0, color:'#ef4444' },
  { id:8, icon:'💫', name:'再接再厉', lines:['再接再厉'], type:'miss', color:'#64748b' },
  { id:9, icon:'🔄', name:'次数×2', lines:['次数×2'], type:'spin', value:2, color:'#34d399' },
  { id:10, icon:'🎟️', name:'门票碎片', lines:['门票','碎片'], type:'fragment', color:'#f59e0b' },
  { id:11, icon:'🎁', name:'NFT球星卡', lines:['NFT','球星卡'], fullName:'限量赛事球星卡 NFT', type:'nft', color:'#ec4899' },
];

const ENCOURAGEMENTS = [
  '下次一定！世界杯还在等你 ⚽','差一点就中了！再试一次吧 🍀',
  '运气正在积攒中… 💪','好运即将降临！继续加油 🌟','冠军都是坚持到最后的人 🏆',
];
const PACKAGES = [
  { qty:10, price:6, perSpin:0.6, discount:10 },
  { qty:50, price:24, perSpin:0.48, discount:20 },
  { qty:100, price:45, perSpin:0.45, discount:25 },
];
const TEAMS = {
  ARG:{name:'阿根廷',flag:'🇦🇷'},BRA:{name:'巴西',flag:'🇧🇷'},
  FRA:{name:'法国',flag:'🇫🇷'},GER:{name:'德国',flag:'🇩🇪'},
  ESP:{name:'西班牙',flag:'🇪🇸'},ENG:{name:'英格兰',flag:'🏴'},
  POR:{name:'葡萄牙',flag:'🇵🇹'},NED:{name:'荷兰',flag:'🇳🇱'},
  USA:{name:'美国',flag:'🇺🇸'},MEX:{name:'墨西哥',flag:'🇲🇽'},
  JPN:{name:'日本',flag:'🇯🇵'},KOR:{name:'韩国',flag:'🇰🇷'},
};
const MATCHES = [
  { id:1, home:'ARG', away:'USA', time:'06/12 21:00', pool:12580, participants:834, stage:'小组赛 A组' },
  { id:2, home:'BRA', away:'JPN', time:'06/12 00:00', pool:8920, participants:567, stage:'小组赛 B组' },
  { id:3, home:'FRA', away:'KOR', time:'06/13 03:00', pool:6340, participants:423, stage:'小组赛 C组' },
  { id:4, home:'GER', away:'MEX', time:'06/13 21:00', pool:9100, participants:612, stage:'小组赛 D组' },
];
const STAGES = [
  { id:'r16', name:'十六强', deadline:'06/28', inv:'5-20', status:'open', pool:45200 },
  { id:'qf', name:'八强', deadline:'07/04', inv:'5-20', status:'open', pool:32800 },
  { id:'sf', name:'四强', deadline:'07/09', inv:'10-30', status:'upcoming', pool:0 },
  { id:'final', name:'决赛队伍', deadline:'07/13', inv:'10-50', status:'upcoming', pool:0 },
];

const WheelSVG = () => {
  const cx=150,cy=150,r=140,n=12;
  const segs=[];
  for(let i=0;i<n;i++){
    const ang=360/n,s=i*ang-90,e=s+ang;
    const sr=(s*Math.PI)/180,er=(e*Math.PI)/180;
    const x1=cx+r*Math.cos(sr),y1=cy+r*Math.sin(sr);
    const x2=cx+r*Math.cos(er),y2=cy+r*Math.sin(er);
    const path=`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
    const mid=(s+e)/2,ma=(mid*Math.PI)/180,ta=mid+90;
    const fill=i%2===0?'#1e293b':'#2d3a4f';
    const p=prizes[i];
    const id_r=r*0.70,ix=cx+id_r*Math.cos(ma),iy=cy+id_r*Math.sin(ma);
    const tEls=[];
    if(p.lines.length===1){
      const td=r*0.42,tx=cx+td*Math.cos(ma),ty=cy+td*Math.sin(ma);
      tEls.push(<text key={`t${i}`} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill={p.color} fontWeight="bold" transform={`rotate(${ta},${tx},${ty})`}>{p.lines[0]}</text>);
    } else {
      const td1=r*0.50,td2=r*0.35;
      const tx1=cx+td1*Math.cos(ma),ty1=cy+td1*Math.sin(ma);
      const tx2=cx+td2*Math.cos(ma),ty2=cy+td2*Math.sin(ma);
      tEls.push(<text key={`t${i}a`} x={tx1} y={ty1} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill={p.color} fontWeight="bold" transform={`rotate(${ta},${tx1},${ty1})`}>{p.lines[0]}</text>);
      tEls.push(<text key={`t${i}b`} x={tx2} y={ty2} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill={p.color} fontWeight="bold" opacity="0.75" transform={`rotate(${ta},${tx2},${ty2})`}>{p.lines[1]}</text>);
    }
    segs.push(
      <g key={i}>
        <path d={path} fill={fill} stroke="#475569" strokeWidth="0.5"/>
        <text x={ix} y={iy} textAnchor="middle" dominantBaseline="middle" fontSize="14" transform={`rotate(${ta},${ix},${iy})`}>{p.icon}</text>
        {tEls}
      </g>
    );
  }
  return segs;
};

export default function CodeCoinApp(){
  const [tab,setTab]=useState('home');
  const [spins,setSpins]=useState(3);
  const [spinning,setSpinning]=useState(false);
  const [rot,setRot]=useState(0);
  const [modal,setModal]=useState(null);
  const [wdModal,setWdModal]=useState(false);
  const [cardModal,setCardModal]=useState(false);
  const [buyModal,setBuyModal]=useState(false);
  const [balance,setBalance]=useState(2.56);
  const [encourageMsg,setEncourageMsg]=useState('');
  const [selectedPkg,setSelectedPkg]=useState(0);
  const [customQty,setCustomQty]=useState(5);
  const [predictTab,setPredictTab]=useState('daily');
  const [selMatch,setSelMatch]=useState(null);
  const [betAmt,setBetAmt]=useState(5);
  const [betChoice,setBetChoice]=useState(null);
  const [betModal,setBetModal]=useState(false);
  const [toast,setToast]=useState(null);
  const [myBets,setMyBets]=useState([]);
  const [champPick,setChampPick]=useState(null);
  const [champAmt,setChampAmt]=useState(20);

  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),2500);return()=>clearTimeout(t);}},[toast]);

  const spin=useCallback(()=>{
    if(spinning||spins<=0) return;
    setSpinning(true);
    setSpins(s=>s-1);
    const idx=Math.floor(Math.random()*12);
    const targetAngle=((345-idx*30)%360+360)%360;
    const extraSpins=(3+Math.floor(Math.random()*3))*360;
    setRot(prev=>{
      const cur=((prev%360)+360)%360;
      let diff=targetAngle-cur;
      if(diff<=0) diff+=360;
      return prev+extraSpins+diff;
    });
    setTimeout(()=>{
      setSpinning(false);
      const prize=prizes[idx];
      setModal(prize);
      if(prize.type==='spin') setSpins(s=>s+prize.value);
      if(prize.type==='usdc') setBalance(b=>+(b+prize.value).toFixed(2));
      if(prize.type==='miss') setEncourageMsg(ENCOURAGEMENTS[Math.floor(Math.random()*ENCOURAGEMENTS.length)]);
    },4000);
  },[spinning,spins]);

  const getBuyInfo=()=>{
    if(selectedPkg==='custom') return {qty:customQty,cost:+(customQty*0.67).toFixed(2)};
    const pkg=PACKAGES[selectedPkg];
    return pkg?{qty:pkg.qty,cost:pkg.price}:{qty:0,cost:0};
  };
  const handleBuySpins=()=>{
    const{qty,cost}=getBuyInfo();
    if(qty===0||cost>balance) return;
    setBalance(b=>+(b-cost).toFixed(2));
    setSpins(s=>s+qty);
    setBuyModal(false);
    setToast({type:'buy',msg:`成功购买 ${qty} 次抽奖！`});
  };
  const placeBet=()=>{
    if(!selMatch||!betChoice||betAmt>balance) return;
    setMyBets(b=>[...b,{matchId:selMatch.id,match:selMatch,choice:betChoice,amount:betAmt}]);
    setBalance(b=>+(b-betAmt).toFixed(2));
    setBetModal(false); setBetChoice(null);
    setToast({type:'bet',msg:'投注成功!'});
  };

  const tabs_nav=[
    {id:'home',label:'首页',Icon:Home},{id:'rewards',label:'奖励',Icon:Gift},
    {id:'predict',label:'竞猜',Icon:Target},{id:'profile',label:'我的',Icon:User},
  ];

  const renderHome=()=>(
    <div className="flex flex-col items-center px-3 pb-24 pt-2">
      <div className="w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">CC</div>
          <p className="text-white text-sm font-semibold">CryptoUser_88</p>
        </div>
        <div className="bg-slate-800 rounded-lg px-3 py-1.5"><p className="text-amber-400 text-xs font-bold">💰 {balance.toFixed(2)} USDC</p></div>
      </div>

      <div className="relative my-2 mx-auto h-[300px] w-[300px] max-w-full shrink-0">
        <div className="absolute top-0 left-1/2 z-20" style={{transform:'translateX(-50%) translateY(-2px)',width:0,height:0,borderLeft:'10px solid transparent',borderRight:'10px solid transparent',borderTop:'18px solid #f59e0b'}}/>
        <div className="h-full w-full overflow-hidden rounded-full">
          <motion.div
            animate={{rotate:rot}}
            transition={{duration:4,ease:[0.17,0.67,0.12,0.99]}}
            style={{width:300,height:300,transformOrigin:'50% 50%'}}
            className="will-change-transform"
          >
            <svg width="300" height="300" viewBox="0 0 300 300" className="block max-w-full">
              <defs><radialGradient id="glow"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
              <circle cx="150" cy="150" r="149" fill="url(#glow)" stroke="#f59e0b" strokeWidth="2.5"/>
              <WheelSVG/>
            </svg>
          </motion.div>
        </div>
        <button onClick={spin} disabled={spinning||spins<=0} className="absolute top-1/2 left-1/2 z-10 w-16 h-16 rounded-full font-bold text-white text-xs" style={{transform:'translate(-50%,-50%)',background:spinning||spins<=0?'#475569':'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:spinning?'none':'0 0 24px rgba(245,158,11,0.5)'}}>
          {spinning?'...':'SPIN'}
        </button>
      </div>

      <div className="flex items-center gap-3 my-1">
        <p className="text-slate-300 text-sm">🎫 剩余次数: <span className="text-amber-400 font-bold">{spins}</span></p>
        <button onClick={()=>{setBuyModal(true);setSelectedPkg(0);}} className="text-amber-400 text-xs font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/30">
          <ShoppingCart size={11}/> 购买次数（CC Wallet）
        </button>
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-3">🧩 碎片收集 &amp; 合成</p>
        <div className="mb-3 p-2 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-amber-400 text-xs font-bold">🎟️ 世界杯门票碎片</p>
            <p className="text-slate-400 text-xs">2/6 → 门票赠送或等值USDC</p>
          </div>
          <div className="flex gap-1.5">{[1,2,3,4,5,6].map(i=>(
            <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-sm ${i<=2?'bg-amber-900 border border-amber-400':'bg-slate-700 border border-slate-600'}`}>{i<=2?'⚽':<Lock size={8} className="text-slate-500"/>}</div>
          ))}</div>
        </div>
        <div className="mb-3 p-2 rounded-lg border border-yellow-600/30 bg-yellow-600/5">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-yellow-500 text-xs font-bold">🏅 金条碎片</p>
            <p className="text-slate-400 text-xs">1/5 → 1g 联名金条</p>
          </div>
          <div className="flex gap-1.5">{[1,2,3,4,5].map(i=>(
            <div key={i} className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-sm ${i<=1?'bg-yellow-900 border border-yellow-500':'bg-slate-700 border border-slate-600'}`}>{i<=1?'🪙':<Lock size={8} className="text-slate-500"/>}</div>
          ))}</div>
        </div>
        <div className="p-2 rounded-lg border border-pink-500/30 bg-pink-500/5">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-pink-400 text-xs font-bold">⭐ 限量赛事球星卡 NFT</p>
            <p className="text-slate-400 text-xs">1/3 → 最低价值 300 USDC</p>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">🎨</div>
            <div className="w-12 h-12 rounded-lg bg-slate-700 border border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs">?</div>
            <div className="w-12 h-12 rounded-lg bg-slate-700 border border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs">?</div>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">📋 快捷任务</p>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-700 bg-amber-500/5 rounded-lg px-2 mb-1">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-white text-xs font-bold">💳 开通 CC Card</p>
            <p className="text-amber-400 font-bold whitespace-nowrap truncate" style={{fontSize:'9px'}}>+10 Spins +5 USDC + 🎫×1 + 🏅×2 + ⭐×1</p>
          </div>
          <button onClick={()=>setCardModal(true)} className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex-shrink-0">去开卡</button>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-700">
          <div><p className="text-white text-xs">绑定钱包</p><p className="text-amber-400 text-xs">+3 次抽奖</p></div>
          <button className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">去完成</button>
        </div>
        {[{n:'关注频道',r:'+1 次抽奖',d:true},{n:'每日签到',r:'+1 次抽奖',d:true},{n:'邀请好友',r:'+2 次抽奖/人',d:false}].map((t,i)=>(
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
            <div><p className="text-white text-xs">{t.n}</p><p className="text-amber-400 text-xs">{t.r}</p></div>
            <button className={`px-3 py-1 rounded-full text-xs font-semibold ${t.d?'bg-slate-600 text-slate-400':'bg-amber-500 text-white'}`}>{t.d?'已完成':'去完成'}</button>
          </div>
        ))}
      </div>

      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-1">💰 可提现进度</p>
        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{balance.toFixed(2)} USDC</span><span>10.00 USDC</span></div>
        <div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full" style={{width:`${Math.min(balance/10*100,100)}%`}}/></div>
        <p className="text-amber-400 text-xs mt-1">💳 完成开卡任务即可 0 手续费提现</p>
      </div>
    </div>
  );

  const renderRewards=()=>(
    <div className="px-3 pb-24 pt-2">
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 my-2 border border-slate-700">
        <p className="text-slate-400 text-xs mb-1">奖励总值 <span className="text-slate-500">USDC（1:1）</span></p>
        <p className="text-2xl font-bold text-amber-400">12.80 <span className="text-base">USDC</span></p>
        <div className="flex gap-4 mt-2">
          <div><p className="text-green-400 text-xs">已解锁</p><p className="text-white text-sm font-bold">{balance.toFixed(2)}</p></div>
          <div><p className="text-amber-400 text-xs">待解锁</p><p className="text-white text-sm font-bold">6.24</p></div>
          <div><p className="text-slate-500 text-xs">冻结</p><p className="text-white text-sm font-bold">4.00</p></div>
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2 border border-slate-700">
        <p className="text-white text-sm font-semibold mb-2">🔓 提现解锁进度</p>
        <div className="space-y-2.5">
          {[
            {label:'绑定钱包',done:false,icon:<Wallet size={14}/>},
            {label:'CC Card 开卡（含身份认证）',done:false,icon:<CreditCard size={14}/>},
            {label:'余额 ≥ 10 USDC',done:false,icon:<TrendingUp size={14}/>},
          ].map((step,i)=>(
            <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${step.done?'bg-green-500/10 border border-green-500/20':'bg-slate-700/50 border border-slate-600/50'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done?'bg-green-500 text-white':'bg-slate-600 text-slate-400'}`}>{step.done?<Check size={12}/>:step.icon}</div>
              <span className={`text-xs flex-1 ${step.done?'text-green-400':'text-slate-300'}`}>{step.label}</span>
              {step.done?<span className="text-xs text-green-400 font-bold">✓ 已完成</span>:<button onClick={()=>{if(i===1) setCardModal(true);}} className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">去完成</button>}
            </div>
          ))}
        </div>
        <div className="mt-2.5 bg-slate-700/50 rounded-lg p-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{balance.toFixed(2)} / 10.00 USDC</span><span>{Math.min(Math.round(balance/10*100),100)}%</span></div>
          <div className="w-full bg-slate-600 rounded-full h-1.5"><div className="bg-gradient-to-r from-amber-500 to-green-500 h-1.5 rounded-full transition-all" style={{width:`${Math.min(balance/10*100,100)}%`}}/></div>
        </div>
        <p className="text-amber-400 text-xs mt-2 text-center">💳 完成开卡即可 0 手续费提现 · USDC（1:1）</p>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">🏅 竞猜排行榜 TOP 5</p>
        {[{r:'🥇',n:'Whale_X',p:'128,500',f:12},{r:'🥈',n:'CryptoKing',p:'95,200',f:9},{r:'🥉',n:'DiamondH',p:'82,100',f:8},{r:'4',n:'MoonBoy',p:'65,300',f:6},{r:'5',n:'SatoshiF',p:'51,800',f:5}].map((u,i)=>(
          <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-700 last:border-0">
            <span className="w-6 text-center text-sm">{u.r}</span>
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">{u.n[0]}</div>
            <p className="flex-1 text-white text-xs font-semibold">{u.n}</p>
            <div className="text-right"><p className="text-amber-400 text-xs font-bold">{u.p} USDC</p><p className="text-slate-500 text-xs">{u.f} 碎片</p></div>
          </div>
        ))}
      </div>
      <button onClick={()=>setWdModal(true)} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm my-2">💳 提现</button>
    </div>
  );

  const renderPredict=()=>(
    <div className="px-3 pb-24 pt-2">
      <div className="w-full h-28 rounded-xl my-2 bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 10px,white 10px,white 11px)'}}/>
        <p className="text-3xl mb-1">⚽🏆</p>
        <p className="text-white font-black text-base">2026 世界杯专题活动</p>
        <p className="text-amber-100 text-xs">CodeCoin × FIFA World Cup 2026</p>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2 border border-amber-500/20">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white text-sm font-bold">🏆 限时奖池</p>
          <div className="bg-red-500/20 rounded-full px-2 py-0.5"><p className="text-red-400 text-xs font-mono">23:45:12</p></div>
        </div>
        <div className="flex justify-around text-center">
          <div><p className="text-amber-400 font-bold text-base">50,000</p><p className="text-slate-400 text-xs">USDC</p></div>
          <div><p className="text-amber-400 font-bold text-base">10</p><p className="text-slate-400 text-xs">世界杯门票</p></div>
          <div><p className="text-amber-400 font-bold text-base">100g</p><p className="text-slate-400 text-xs">黄金</p></div>
        </div>
      </div>
      <div className="flex justify-between items-center py-2 mb-1">
        <div><p className="text-white text-base font-bold">⚽ 世界杯竞猜</p><p className="text-slate-500 text-xs">FIFA 2026 · 预测赢奖池 · USDC（1:1）</p></div>
        <div className="bg-slate-800 rounded-lg px-3 py-1.5"><p className="text-green-400 text-xs font-bold">💰 {balance.toFixed(2)} USDC</p></div>
      </div>
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 mb-3">
        {[{k:'daily',l:'⚡ 单场'},{k:'stage',l:'🏆 阶段'},{k:'champion',l:'👑 冠军/阵营'}].map(t=>(
          <button key={t.k} onClick={()=>setPredictTab(t.k)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${predictTab===t.k?'bg-amber-500 text-white':'text-slate-400'}`}>{t.l}</button>
        ))}
      </div>
      {predictTab==='daily' && (
        <div className="space-y-3">
          {MATCHES.map((m,idx)=>{
            const h=TEAMS[m.home],a=TEAMS[m.away];
            const bet=myBets.find(b=>b.matchId===m.id);
            return (
              <motion.div key={m.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">{m.stage}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={10}/>{m.time}</div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1"><span className="text-xl">{h.flag}</span><span className="text-white font-bold text-sm">{h.name}</span></div>
                  <span className="text-slate-500 font-bold mx-2">VS</span>
                  <div className="flex items-center gap-2 flex-1 justify-end"><span className="text-white font-bold text-sm">{a.name}</span><span className="text-xl">{a.flag}</span></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1"><Users size={10}/>{m.participants}人</span>
                  <span className="flex items-center gap-1 text-green-400 font-bold"><TrendingUp size={10}/>{m.pool.toLocaleString()} USDC</span>
                </div>
                {bet?(
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                    <span className="text-green-400 text-xs font-bold">✅ 已投 {bet.amount} USDC — {bet.choice==='home'?`${h.name}胜`:bet.choice==='draw'?'平局':`${a.name}胜`}</span>
                  </div>
                ):(
                  <button onClick={()=>{setSelMatch(m);setBetChoice(null);setBetAmt(5);setBetModal(true);}} className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold text-xs">参与竞猜</button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      {predictTab==='stage' && (
        <div className="space-y-3">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
            <p className="text-purple-300 text-xs">🏅 预测晋级队伍，猜对瓜分奖池 + 赢取 <span className="text-yellow-400 font-bold">黄金兑换券</span></p>
          </div>
          {STAGES.map(s=>(
            <div key={s.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2"><Trophy size={16} className="text-amber-400"/><span className="text-white font-bold text-sm">{s.name}预测</span></div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.status==='open'?'bg-green-500/20 text-green-400':'bg-slate-700 text-slate-500'}`}>{s.status==='open'?'进行中':'即将开放'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>截止: {s.deadline}</span><span>投入: {s.inv} USDC</span>{s.pool>0&&<span className="text-green-400 font-bold">{s.pool.toLocaleString()}</span>}
              </div>
              <button disabled={s.status!=='open'} className={`w-full py-2 rounded-lg text-xs font-bold ${s.status==='open'?'bg-amber-500 text-white':'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>{s.status==='open'?'选择队伍 →':'暂未开放'}</button>
            </div>
          ))}
        </div>
      )}
      {predictTab==='champion' && (
        <div>
          <div className="bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
            <p className="text-amber-400 font-bold text-sm mb-1">👑 冠军竞猜 / ⚔️ 阵营选择</p>
            <p className="text-slate-300 text-xs mb-1">选择你心中的冠军，加入阵营，夺冠后全员瓜分超级奖池</p>
            <p className="text-amber-300 text-xs mb-2">💳 CC Card 用户额外 +25% 奖池加成</p>
            <div className="flex gap-4">
              <div><p className="text-green-400 font-bold text-sm">156,280</p><p className="text-slate-500 text-xs">奖池 USDC</p></div>
              <div><p className="text-blue-400 font-bold text-sm">4,238</p><p className="text-slate-500 text-xs">参与人数</p></div>
              <div><p className="text-amber-400 font-bold text-sm">🥇×10</p><p className="text-slate-500 text-xs">1g 金条</p></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.entries(TEAMS).map(([code,team])=>(
              <motion.button key={code} whileTap={{scale:0.95}} onClick={()=>setChampPick(code)} className={`p-2.5 rounded-xl text-center border transition-all ${champPick===code?'bg-amber-500/20 border-amber-400':'bg-slate-800 border-slate-700'}`}>
                <span className="text-xl block mb-0.5">{team.flag}</span>
                <span className={`text-xs font-bold ${champPick===code?'text-amber-400':'text-slate-300'}`}>{team.name}</span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {champPick && (
              <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-slate-800 rounded-xl p-3 border border-amber-500/30">
                <p className="text-white font-bold text-sm mb-2 text-center">{TEAMS[champPick].flag} {TEAMS[champPick].name}</p>
                <div className="flex gap-2 mb-2">
                  {[10,20,30,50].map(a=>(
                    <button key={a} onClick={()=>setChampAmt(a)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${champAmt===a?'bg-amber-500 text-white':'bg-slate-700 text-slate-300'}`}>{a}</button>
                  ))}
                </div>
                <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm">确认投入 {champAmt} USDC</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {myBets.length>0 && (
        <div className="mt-4">
          <p className="text-white text-sm font-semibold mb-2">📋 我的竞猜</p>
          {myBets.map((bet,i)=>{
            const h=TEAMS[bet.match.home],a=TEAMS[bet.match.away];
            return (
              <div key={i} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700 mb-2 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm"><span>{h.flag}</span><span className="text-slate-500 text-xs">vs</span><span>{a.flag}</span></div>
                <span className="text-slate-400 text-xs">{bet.choice==='home'?`${h.name}胜`:bet.choice==='draw'?'平局':`${a.name}胜`}</span>
                <span className="text-amber-400 text-xs font-bold">{bet.amount} USDC</span>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">等待</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProfile=()=>(
    <div className="px-3 pb-24 pt-2">
      <div className="flex flex-col items-center py-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold mb-2">CC</div>
        <p className="text-white font-bold">CryptoUser_88</p>
        <p className="text-slate-400 text-xs">UID: 88888888</p>
        <div className="bg-slate-800 rounded-lg px-4 py-1.5 mt-2"><p className="text-amber-400 text-sm font-bold">💰 {balance.toFixed(2)} USDC</p></div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-3">📍 账户状态</p>
        <div className="flex items-center justify-around mb-2">
          {['授权','绑定钱包','开卡(含认证)'].map((s,i)=>(
            <div key={i} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${i===0?'bg-green-500 text-white':'bg-slate-700 text-slate-400 border border-slate-600'}`}>{i===0?'✓':i+1}</div>
              <p className={`text-xs ${i===0?'text-green-400':'text-slate-400'}`}>{s}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5"><div className="flex-1 h-1 bg-green-500 rounded-full"/><div className="flex-1 h-1 bg-slate-700 rounded-full"/></div>
      </div>
      {[
        {icon:<Wallet size={16}/>,n:'绑定钱包',d:'连接 Web3 钱包',c:'text-blue-400',b:'未绑定'},
        {icon:<CreditCard size={16}/>,n:'CC Card 开卡',d:'含身份认证 · 0 手续费提现',c:'text-amber-400',b:'未开卡',action:()=>setCardModal(true)},
      ].map((m,i)=>(
        <div key={i} onClick={m.action} className="w-full bg-slate-800 rounded-xl p-3 my-2 flex items-center gap-3 cursor-pointer">
          <div className={`w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center ${m.c}`}>{m.icon}</div>
          <div className="flex-1"><p className="text-white text-sm font-semibold">{m.n}</p><p className="text-slate-400 text-xs">{m.d}</p></div>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{m.b}</span>
          <ChevronRight size={14} className="text-slate-500"/>
        </div>
      ))}
      <div className="w-full bg-gradient-to-br from-amber-900/30 to-yellow-900/20 rounded-xl p-3 my-2 border border-amber-500/20">
        <p className="text-amber-400 text-sm font-bold mb-2">🎁 开卡即送礼包</p>
        <div className="flex justify-around text-center mb-2">
          <div><p className="text-amber-400 font-bold">10</p><p className="text-slate-400 text-xs">Spins</p></div>
          <div><p className="text-amber-400 font-bold">5</p><p className="text-slate-400 text-xs">USDC</p></div>
          <div><p className="text-amber-400 font-bold">4</p><p className="text-slate-400 text-xs">碎片</p></div>
        </div>
        <p className="text-slate-500 text-xs text-center mb-2">🎫×1 + 🏅×2 + ⭐×1 (NFT球星卡碎片)</p>
        <button onClick={()=>setCardModal(true)} className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm">立即开卡 →</button>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">💳 CC Card 权益对比</p>
        <div className="grid grid-cols-3 gap-px text-xs">
          {[['权益','普通用户','CC Card'],['冠军/阵营加成','标准','+25% 奖池'],['黄金/NFT优先权','无','优先+空投'],['每日抽奖','3次','10次'],['邀请返利','5%','15%']].map((row,i)=>(
            <React.Fragment key={i}>
              <div className={`p-1.5 ${i===0?'text-slate-400':'text-slate-300'} ${i%2===0?'bg-slate-700/50':''}`}>{row[0]}</div>
              <div className={`p-1.5 text-center ${i===0?'text-slate-400':'text-slate-400'} ${i%2===0?'bg-slate-700/50':''}`}>{row[1]}</div>
              <div className={`p-1.5 text-center ${i===0?'text-amber-400 font-bold':'text-green-400'} ${i%2===0?'bg-slate-700/50':''}`}>{row[2]}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="w-full bg-slate-800 rounded-xl p-3 my-2">
        <p className="text-white text-sm font-semibold mb-2">👥 邀请记录</p>
        <div className="flex justify-around text-center mb-3">
          <div><p className="text-amber-400 font-bold text-xl">12</p><p className="text-slate-400 text-xs">已邀请</p></div>
          <div><p className="text-green-400 font-bold text-xl">3.60</p><p className="text-slate-400 text-xs">USDC奖励</p></div>
          <div><p className="text-purple-400 font-bold text-xl">24</p><p className="text-slate-400 text-xs">抽奖次数</p></div>
        </div>
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold">📤 邀请好友</button>
      </div>
    </div>
  );

  const buyInfo=getBuyInfo();

  return (
    <div className="min-h-screen bg-black flex justify-center overflow-x-hidden">
      <div className="w-full max-w-sm relative min-w-0 overflow-x-hidden" style={{background:'#0f172a',minHeight:'100vh'}}>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-x-none" style={{height:'calc(100vh - 56px)'}}>
          {tab==='home' && renderHome()}
          {tab==='rewards' && renderRewards()}
          {tab==='predict' && renderPredict()}
          {tab==='profile' && renderProfile()}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 z-30">
          {tabs_nav.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="flex flex-col items-center gap-0.5">
              <t.Icon size={18} className={tab===t.id?'text-amber-400':'text-slate-500'}/>
              <span className={`text-xs ${tab===t.id?'text-amber-400 font-bold':'text-slate-500'}`}>{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {modal && modal.type==='miss' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={()=>setModal(null)}>
              <motion.div initial={{scale:0.5}} animate={{scale:1}} exit={{scale:0.5}} className="bg-slate-800 rounded-2xl p-6 mx-6 w-72 text-center border border-slate-600 relative" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setModal(null)} className="absolute top-3 right-3 text-slate-400"><X size={16}/></button>
                <p className="text-5xl mb-2">💫</p>
                <p className="text-white font-bold text-lg mb-1">再接再厉</p>
                <p className="text-slate-300 text-sm mb-4">{encourageMsg}</p>
                <button onClick={()=>setModal(null)} className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm mb-3">{spins>0?'再来一次！':'获取更多次数'}</button>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Share2 size={18} className="text-blue-400 mt-0.5 flex-shrink-0"/>
                  <div className="text-left flex-1">
                    <p className="text-blue-400 text-xs font-bold mb-0.5">邀请好友一起玩</p>
                    <p className="text-slate-400 text-xs">每成功邀请 1 位好友 +2 次抽奖</p>
                  </div>
                  <button className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0">去分享</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal && modal.type!=='miss' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={()=>setModal(null)}>
              <motion.div initial={{scale:0.5}} animate={{scale:1}} exit={{scale:0.5}} className="bg-slate-800 rounded-2xl p-6 mx-6 w-64 text-center border-2 relative" style={{borderColor:modal.color}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setModal(null)} className="absolute top-3 right-3 text-slate-400"><X size={16}/></button>
                <p className="text-5xl mb-2">{modal.icon}</p>
                <p className="text-white font-bold text-lg mb-1">🎉 恭喜获得</p>
                <p className="font-bold text-lg mb-1" style={{color:modal.color}}>{modal.fullName||modal.name}</p>
                {modal.detail && <p className="text-slate-400 text-xs mb-1">{modal.detail}</p>}
                <p className="text-slate-400 text-xs mb-4">已存入奖励账户</p>
                <button onClick={()=>setModal(null)} className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm mb-2">继续抽奖</button>
                <button onClick={()=>{setModal(null);setTab('rewards');}} className="text-amber-400 text-xs underline">查看我的奖励 &gt;</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {cardModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={()=>setCardModal(false)}>
              <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 mx-4 w-72 border border-amber-500/40 relative" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setCardModal(false)} className="absolute top-3 right-3 text-slate-400"><X size={16}/></button>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💳</span>
                  <div><p className="text-amber-400 font-bold text-base">CC Card 开卡礼包</p><p className="text-amber-200/60 text-xs">开卡即送，立即到账</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-black/30 rounded-xl p-3 text-center border border-amber-500/10"><p className="text-amber-400 font-bold text-2xl">10</p><p className="text-amber-200/60 text-xs">Spins 次数</p></div>
                  <div className="bg-black/30 rounded-xl p-3 text-center border border-amber-500/10"><p className="text-amber-400 font-bold text-2xl">5</p><p className="text-amber-200/60 text-xs">USDC</p></div>
                </div>
                <div className="bg-black/30 rounded-xl p-3 mb-4 border border-amber-500/10">
                  <p className="text-amber-200/60 text-xs text-center mb-2">碎片奖励 ×4</p>
                  <div className="flex justify-center gap-5 text-sm">
                    <div className="text-center"><span className="text-lg block">🎟️</span><span className="text-slate-300 text-xs">×1</span></div>
                    <div className="text-center"><span className="text-lg block">🏅</span><span className="text-slate-300 text-xs">×2</span></div>
                    <div className="text-center"><span className="text-lg block">⭐</span><span className="text-slate-300 text-xs">×1</span></div>
                  </div>
                  <p className="text-slate-500 text-xs text-center mt-1.5">门票碎片×1 + 金条碎片×2 + NFT球星卡碎片×1</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mb-3"><p className="text-green-400 text-xs text-center">✅ 开卡后即享 0 手续费提现 · USDC（1:1）</p></div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-sm">立即开卡，领取礼包 →</button>
                <p className="text-slate-500 text-xs text-center mt-2">需完成身份认证 · 约 2 分钟</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {buyModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={()=>setBuyModal(false)}>
              <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="bg-slate-800 rounded-2xl p-5 mx-4 w-72 border border-slate-700 relative" onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setBuyModal(false)} className="absolute top-3 right-3 text-slate-400"><X size={16}/></button>
                <div className="flex items-center gap-2 mb-1"><ShoppingCart size={18} className="text-amber-400"/><p className="text-white font-bold text-base">购买抽奖次数</p></div>
                <p className="text-slate-400 text-xs mb-3">使用 CC Wallet 余额支付 · USDC（1:1）</p>
                <div className="space-y-2 mb-3">
                  {PACKAGES.map((pkg,i)=>(
                    <div key={i} onClick={()=>setSelectedPkg(i)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPkg===i?'border-amber-400 bg-amber-500/10':'border-slate-600 bg-slate-700/50'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPkg===i?'border-amber-400':'border-slate-500'}`}>{selectedPkg===i&&<div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>}</div>
                          <span className="text-white text-sm font-bold">{pkg.qty} 次</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">省{pkg.discount}%</span>
                        </div>
                        <div className="text-right"><p className="text-amber-400 font-bold text-sm">{pkg.price} USDC</p><p className="text-slate-500 text-xs">{pkg.perSpin} / 次</p></div>
                      </div>
                    </div>
                  ))}
                  <div onClick={()=>setSelectedPkg('custom')} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPkg==='custom'?'border-amber-400 bg-amber-500/10':'border-slate-600 bg-slate-700/50'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPkg==='custom'?'border-amber-400':'border-slate-500'}`}>{selectedPkg==='custom'&&<div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>}</div>
                        <span className="text-white text-sm font-bold">自定义</span>
                        <span className="text-slate-500 text-xs">（最少 5 次）</span>
                      </div>
                      <span className="text-slate-500 text-xs">0.67 / 次</span>
                    </div>
                    {selectedPkg==='custom' && (
                      <div className="mt-2.5 flex items-center gap-2 pl-7">
                        <input type="number" min={5} value={customQty} onChange={e=>{const v=parseInt(e.target.value);setCustomQty(isNaN(v)?5:Math.max(5,v));}} className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm text-center outline-none focus:border-amber-400"/>
                        <span className="text-slate-400 text-xs">次 =</span>
                        <span className="text-amber-400 text-sm font-bold">{(customQty*0.67).toFixed(2)} USDC</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-2.5 px-1"><span>CC Wallet 余额</span><span className="text-amber-400 font-bold">{balance.toFixed(2)} USDC</span></div>
                {buyInfo.cost>balance&&<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-2.5"><p className="text-red-400 text-xs text-center">余额不足，请先充值或完成任务获取 USDC</p></div>}
                <button onClick={handleBuySpins} disabled={buyInfo.cost>balance||buyInfo.qty===0} className={`w-full py-2.5 rounded-xl font-bold text-sm ${buyInfo.cost<=balance&&buyInfo.qty>0?'bg-gradient-to-r from-amber-500 to-amber-600 text-white':'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>确认购买 {buyInfo.qty} 次 · {buyInfo.cost} USDC</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wdModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70" onClick={()=>setWdModal(false)}>
              <motion.div initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}} className="bg-slate-800 rounded-2xl p-5 mx-6 w-64 border border-slate-700" onClick={e=>e.stopPropagation()}>
                <p className="text-white font-bold text-center mb-3">💳 提现校验</p>
                {[{n:'绑定 Wallet',d:false},{n:'CC Card 开卡（含身份认证）',d:false}].map((s,i)=>(
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg mb-2 bg-red-500/10 border border-red-500/30">
                    <X size={14} className="text-red-400"/>
                    <span className="text-sm flex-1 text-red-400">{s.n}</span>
                    <button onClick={()=>{if(i===1){setWdModal(false);setCardModal(true);}}} className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">去完成</button>
                  </div>
                ))}
                <p className="text-amber-400 text-xs text-center mt-2 mb-3">💳 完成开卡即可 0 手续费提现 · USDC（1:1）</p>
                <button onClick={()=>setWdModal(false)} className="w-full py-2 rounded-lg bg-slate-700 text-slate-300 text-sm">关闭</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {betModal && selMatch && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 flex items-end bg-black/70" onClick={()=>setBetModal(false)}>
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} className="w-full bg-slate-800 rounded-t-2xl p-4 border-t border-slate-700" onClick={e=>e.stopPropagation()}>
                <div className="w-10 h-1 bg-slate-600 rounded mx-auto mb-3"/>
                <p className="text-white font-bold text-center mb-3">⚽ 参与竞猜</p>
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="text-center"><span className="text-2xl block mb-0.5">{TEAMS[selMatch.home].flag}</span><span className="text-white text-xs font-bold">{TEAMS[selMatch.home].name}</span></div>
                  <span className="text-slate-500 font-bold">VS</span>
                  <div className="text-center"><span className="text-2xl block mb-0.5">{TEAMS[selMatch.away].flag}</span><span className="text-white text-xs font-bold">{TEAMS[selMatch.away].name}</span></div>
                </div>
                <div className="flex gap-2 mb-3">
                  {[{k:'home',l:`${TEAMS[selMatch.home].name}胜`},{k:'draw',l:'平局'},{k:'away',l:`${TEAMS[selMatch.away].name}胜`}].map(o=>(
                    <button key={o.k} onClick={()=>setBetChoice(o.k)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${betChoice===o.k?'bg-amber-500 border-amber-400 text-white':'bg-slate-700 border-slate-600 text-slate-300'}`}>{o.l}</button>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mb-1.5">投入金额 (USDC（1:1）)</p>
                <div className="flex gap-2 mb-3">
                  {[1,3,5,10,20].map(a=>(
                    <button key={a} onClick={()=>setBetAmt(a)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${betAmt===a?'bg-green-500 text-white':'bg-slate-700 text-slate-300'}`}>{a}</button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-3"><span>奖池: {selMatch.pool.toLocaleString()} USDC</span><span>余额: {balance.toFixed(2)}</span></div>
                <button onClick={placeBet} disabled={!betChoice||betAmt>balance} className={`w-full py-2.5 rounded-xl font-bold text-sm ${betChoice&&betAmt<=balance?'bg-gradient-to-r from-amber-500 to-amber-600 text-white':'bg-slate-700 text-slate-500'}`}>确认投注 {betAmt} USDC</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{opacity:0,y:-30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-30}} className="absolute top-4 left-4 right-4 z-50 bg-green-500 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xl">
              <Check size={16} className="text-white"/>
              <div>
                <p className="text-white font-bold text-sm">{toast.msg}</p>
                {toast.type==='bet'&&<p className="text-green-100 text-xs">中奖30分钟内自动到账 🍀</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
