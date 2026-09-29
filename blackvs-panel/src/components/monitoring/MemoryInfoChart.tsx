import React, { useState } from 'react';

interface MemPoint {
  time: string;
  totalGiB: number;
  usedGiB: number;
  buffersGiB: number;
}

interface MemoryInfoChartProps {
  nodeName?: string;
  totalGB?: number;
  usedGB?: number;
}

export const MemoryInfoChart: React.FC<MemoryInfoChartProps> = ({
  nodeName = 'blackvs-node:9100',
  totalGB = 64.0,
  usedGB = 44.8,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Time-series memory allocations matching the reference image's visual band
  const data: MemPoint[] = [
    { time: '06:30', totalGiB: totalGB, usedGiB: usedGB * 0.95, buffersGiB: 11.4 },
    { time: '06:35', totalGiB: totalGB, usedGiB: usedGB * 0.96, buffersGiB: 11.5 },
    { time: '06:40', totalGiB: totalGB, usedGiB: usedGB * 0.96, buffersGiB: 11.6 },
    { time: '06:45', totalGiB: totalGB, usedGiB: usedGB * 0.97, buffersGiB: 11.6 },
    { time: '06:50', totalGiB: totalGB, usedGiB: usedGB * 0.97, buffersGiB: 11.7 },
    { time: '06:55', totalGiB: totalGB, usedGiB: usedGB * 0.98, buffersGiB: 11.7 },
    { time: '07:00', totalGiB: totalGB, usedGiB: usedGB * 1.04, buffersGiB: 12.1 },
    { time: '07:03', totalGiB: totalGB, usedGiB: usedGB * 1.02, buffersGiB: 12.0 },
    { time: '07:06', totalGiB: totalGB, usedGiB: usedGB * 1.01, buffersGiB: 11.9 },
    { time: '07:10', totalGiB: totalGB, usedGiB: usedGB * 1.00, buffersGiB: 11.8 },
    { time: '07:14', totalGiB: totalGB, usedGiB: usedGB * 0.99, buffersGiB: 11.7 },
    { time: '07:18', totalGiB: totalGB, usedGiB: usedGB * 0.99, buffersGiB: 11.7 },
    { time: '07:20', totalGiB: totalGB, usedGiB: usedGB, buffersGiB: 11.7 },
  ];

  const svgWidth = 480;
  const svgHeight = 200;
  const paddingLeft = 36;
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const maxY = totalGB;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (Math.min(val, maxY) / maxY) * chartHeight;

  // Paths
  const pathTotal = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.totalGiB).toFixed(1)}`).join(' ');
  const pathUsed = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.usedGiB).toFixed(1)}`).join(' ');
  const areaUsed = `${pathUsed} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const pathBuffers = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.buffersGiB).toFixed(1)}`).join(' ');
  const areaBuffers = `${pathBuffers} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];
  const freeGiB = Math.max(0, +(hoveredPoint.totalGiB - hoveredPoint.usedGiB).toFixed(1));

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[265px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.04]">
        <span className="text-xs font-semibold text-neutral-200 tracking-tight">
          Memory information
        </span>
        <span className="text-[10px] font-mono text-neutral-400">
          ECC DDR5 · {totalGB} GiB Total
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* SVG Area */}
        <div className="flex-1 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="areaMemUsed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="areaMemBuffers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, totalGB * 0.33, totalGB * 0.66, totalGB].map((val) => {
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
                    {val.toFixed(0)}G
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

            {/* Shaded Areas */}
            <path d={areaUsed} fill="url(#areaMemUsed)" />
            <path d={areaBuffers} fill="url(#areaMemBuffers)" />

            {/* Lines */}
            <path d={pathTotal} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3,3" />
            <path d={pathUsed} fill="none" stroke="#eab308" strokeWidth="2" />
            <path d={pathBuffers} fill="none" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Crosshair indicator */}
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
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].usedGiB)} r="4" fill="#eab308" stroke="#000" strokeWidth="1.5" />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].buffersGiB)} r="3.5" fill="#38bdf8" stroke="#000" strokeWidth="1" />
              </g>
            )}

            {/* Interactive hover columns */}
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

          {/* Hover tooltip */}
          {hoverIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg bg-neutral-950/95 border border-neutral-700 text-[10px] font-mono shadow-2xl space-y-0.5"
              style={{
                left: `${Math.min(65, Math.max(10, (hoverIndex / (data.length - 1)) * 100))}%`,
                top: '10px',
              }}
            >
              <div className="text-neutral-400 border-b border-neutral-800 pb-0.5">{hoveredPoint.time} UTC</div>
              <div className="text-yellow-400">Used: {hoveredPoint.usedGiB.toFixed(1)} GiB ({((hoveredPoint.usedGiB / totalGB) * 100).toFixed(1)}%)</div>
              <div className="text-sky-400">Buffers/Cached: {hoveredPoint.buffersGiB.toFixed(1)} GiB</div>
              <div className="text-emerald-400">Free: {freeGiB} GiB</div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="lg:w-48 shrink-0 flex flex-col justify-center space-y-2 text-[11px] font-mono border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-2 lg:pt-0 lg:pl-3">
          <div className="text-[10px] text-neutral-500 uppercase pb-1 border-b border-white/[0.04]">
            Memory Stats
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-1 rounded-sm bg-emerald-400" />
                Total
              </span>
              <span className="font-semibold text-neutral-200">{hoveredPoint.totalGiB.toFixed(1)} GiB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-1 rounded-sm bg-yellow-400" />
                Used
              </span>
              <span className="font-semibold text-yellow-400">{hoveredPoint.usedGiB.toFixed(1)} GiB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-1 rounded-sm bg-sky-400" />
                Buffers
              </span>
              <span className="text-sky-400">{hoveredPoint.buffersGiB.toFixed(1)} GiB</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-1 rounded-sm bg-emerald-500" />
                Free
              </span>
              <span className="text-emerald-400">{freeGiB} GiB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
