import React, { useState } from 'react';

interface LoadPoint {
  time: string;
  load1m: number;
  load5m: number;
  load15m: number;
}

interface SystemAverageLoadChartProps {
  currentLoad: [number, number, number];
  nodeName?: string;
}

export const SystemAverageLoadChart: React.FC<SystemAverageLoadChartProps> = ({
  currentLoad,
  nodeName = 'blackvs-node:9100',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Time series dataset matching the curve in the reference screenshot
  // showing baseline ~0.08, jumping up between 06:58 and 07:05 to 1.18, and tapering down to 0.10
  const data: LoadPoint[] = [
    { time: '06:30', load1m: 0.08, load5m: 0.07, load15m: 0.07 },
    { time: '06:35', load1m: 0.09, load5m: 0.08, load15m: 0.07 },
    { time: '06:40', load1m: 0.08, load5m: 0.08, load15m: 0.07 },
    { time: '06:45', load1m: 0.09, load5m: 0.08, load15m: 0.08 },
    { time: '06:50', load1m: 0.08, load5m: 0.08, load15m: 0.08 },
    { time: '06:55', load1m: 0.12, load5m: 0.09, load15m: 0.08 },
    { time: '07:00', load1m: 1.18, load5m: 0.42, load15m: 0.19 },
    { time: '07:03', load1m: 0.85, load5m: 0.48, load15m: 0.24 },
    { time: '07:06', load1m: 0.38, load5m: 0.34, load15m: 0.22 },
    { time: '07:10', load1m: 0.22, load5m: 0.22, load15m: 0.18 },
    { time: '07:14', load1m: 0.16, load5m: 0.17, load15m: 0.15 },
    { time: '07:18', load1m: 0.12, load5m: 0.13, load15m: 0.11 },
    { time: '07:20', load1m: currentLoad[0], load5m: currentLoad[1], load15m: currentLoad[2] },
  ];

  // SVG dimensions
  const svgWidth = 520;
  const svgHeight = 180;
  const paddingLeft = 34;
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const maxY = 1.5;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (Math.min(val, maxY) / maxY) * chartHeight;

  // Generate paths for SVG
  const path1m = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.load1m).toFixed(1)}`).join(' ');
  const path5m = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.load5m).toFixed(1)}`).join(' ');
  const path15m = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.load15m).toFixed(1)}`).join(' ');

  // Gradient area for 1m load
  const area1m = `${path1m} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[275px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-200 tracking-tight">
            System average load
          </span>
          <span className="text-[10px] font-mono text-neutral-500">Node Exporter · 1m / 5m / 15m</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Poll</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        {/* SVG Chart Area */}
        <div className="flex-1 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="areaGradient1m" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.5, 1.0, 1.5].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#1e2430"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? undefined : '2,2'}
                  />
                  <text
                    x={paddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* X-axis ticks */}
            {data.filter((_, idx) => idx % 2 === 0).map((d) => {
              const originalIdx = data.findIndex((pt) => pt.time === d.time);
              const x = getX(originalIdx);
              return (
                <text
                  key={d.time}
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {d.time}
                </text>
              );
            })}

            {/* Shaded Area for 1m load */}
            <path d={area1m} fill="url(#areaGradient1m)" />

            {/* Lines */}
            <path d={path15m} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <path d={path5m} fill="none" stroke="#facc15" strokeWidth="1.5" />
            <path d={path1m} fill="none" stroke="#22c55e" strokeWidth="2" />

            {/* Interactive hover crosshair */}
            {hoverIndex !== null && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={paddingTop}
                  x2={getX(hoverIndex)}
                  y2={paddingTop + chartHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].load1m)} r="4" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].load5m)} r="3.5" fill="#facc15" stroke="#000" strokeWidth="1" />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].load15m)} r="3.5" fill="#38bdf8" stroke="#000" strokeWidth="1" />
              </g>
            )}

            {/* Transparent touch/mouse capture columns */}
            {data.map((_, idx) => {
              const xStart = idx === 0 ? paddingLeft : (getX(idx - 1) + getX(idx)) / 2;
              const xEnd = idx === data.length - 1 ? svgWidth - paddingRight : (getX(idx) + getX(idx + 1)) / 2;
              return (
                <rect
                  key={idx}
                  x={xStart}
                  y={paddingTop}
                  width={xEnd - xStart}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}
          </svg>

          {/* Hover Tooltip Box */}
          {hoverIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg bg-neutral-950/95 border border-neutral-700/80 shadow-2xl text-[10px] font-mono space-y-0.5"
              style={{
                left: `${Math.min(70, Math.max(10, (hoverIndex / (data.length - 1)) * 100))}%`,
                top: '10px',
              }}
            >
              <div className="text-neutral-400 text-[9px] border-b border-neutral-800 pb-0.5">{hoveredPoint.time} UTC</div>
              <div className="text-emerald-400">1m: {hoveredPoint.load1m.toFixed(3)}</div>
              <div className="text-yellow-400">5m: {hoveredPoint.load5m.toFixed(3)}</div>
              <div className="text-sky-400">15m: {hoveredPoint.load15m.toFixed(3)}</div>
            </div>
          )}
        </div>

        {/* Right Legend Table matching reference image */}
        <div className="lg:w-48 shrink-0 flex flex-col justify-center space-y-1.5 text-xs font-mono border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-2 lg:pt-0 lg:pl-3">
          <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase pb-1 border-b border-white/[0.04]">
            <span>Series Metric</span>
            <span>Current</span>
          </div>

          {/* 1m Load */}
          <div className="flex items-center justify-between gap-2 group cursor-pointer hover:bg-white/[0.04] p-1 rounded transition-colors">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-1 rounded-sm bg-emerald-400 shrink-0" />
              <span className="text-[11px] text-neutral-300 truncate" title={`${nodeName}_1m`}>
                {nodeName}_1m
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px]">
              {hoveredPoint.load1m.toFixed(3)}
            </span>
          </div>

          {/* 5m Load */}
          <div className="flex items-center justify-between gap-2 group cursor-pointer hover:bg-white/[0.04] p-1 rounded transition-colors">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-1 rounded-sm bg-yellow-400 shrink-0" />
              <span className="text-[11px] text-neutral-300 truncate" title={`${nodeName}_5m`}>
                {nodeName}_5m
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px]">
              {hoveredPoint.load5m.toFixed(3)}
            </span>
          </div>

          {/* 15m Load */}
          <div className="flex items-center justify-between gap-2 group cursor-pointer hover:bg-white/[0.04] p-1 rounded transition-colors">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-1 rounded-sm bg-sky-400 shrink-0" />
              <span className="text-[11px] text-neutral-300 truncate" title={`${nodeName}_15m`}>
                {nodeName}_15m
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px]">
              {hoveredPoint.load15m.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
