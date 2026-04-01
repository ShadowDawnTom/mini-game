import React from 'react';

export default function WheelSVG({ prizes }) {
  const cx = 150, cy = 150, r = 140, n = prizes.length;
  
  return prizes.map((prize, i) => {
    const angle = 360 / n;
    const s = i * angle - 90;
    const e = s + angle;
    const sr = (s * Math.PI) / 180;
    const er = (e * Math.PI) / 180;
    const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
    const ma = ((s + e) / 2 * Math.PI) / 180;
    const tx = cx + r * 0.62 * Math.cos(ma), ty = cy + r * 0.62 * Math.sin(ma);
    const ta = (s + e) / 2 + 90;
    const fill = i % 2 === 0 ? '#1e293b' : '#2d3a4f';
    
    return (
      <g key={i}>
        <path d={path} fill={fill} stroke="#475569" strokeWidth="0.5" />
        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ta},${tx},${ty})`}>
          <tspan x={tx} dy="-7" fontSize="15">{prize.icon}</tspan>
          <tspan x={tx} dy="14" fontSize="6.5" fill={prize.color} fontWeight="bold">{prize.name}</tspan>
        </text>
      </g>
    );
  });
}
