import React, { useState } from 'react';

interface CpuIoPoint {
  time: string;
  system: number;
  user: number;
  iowait: number;
  vdaIo: number;
}

interface CpuIoOperationsChartProps {
  nodeName?: string;
}

export const CpuIoOperationsChart: React.FC<CpuIoOperationsChartProps> = ({
  nodeName = 'blackvs-node:9100',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Time-series dataset matching the reference image spike at 07:00
  const data: CpuIoPoint[] = [
    { time: '06:30', system: 1.2, user: 1.8, iowait: 0.1, vdaIo: 0.1 },
    { time: '06:35', system: 1.3, user: 1.9, iowait: 0.1, vdaIo: 0.1 },
    { time: '06:40', system: 1.4, user: 2.1, iowait: 0.1, vdaIo: 0.1 },
    { time: '06:45', system: 1.2, user: 1.9, iowait: 0.1, vdaIo: 0.1 },
    { time: '06:50', system: 1.4, user: 2.0, iowait: 0.1, vdaIo: 0.1 },
    { time: '06:55', system: 1.8, user: 2.4, iowait: 0.2, vdaIo: 0.2 },
    { time: '07:00', system: 10.53, user: 99.27, iowait: 1.8, vdaIo: 11.68 },
    { time: '07:03', system: 4.8, user: 42.1, iowait: 2.4, vdaIo: 5.2 },
    { time: '07:06', system: 3.2, user: 24.5, iowait: 8.0, vdaIo: 3.1 },
    { time: '07:10', system: 2.1, user: 5.2, iowait: 1.1, vdaIo: 0.8 },
    { time: '07:14', system: 1.8, user: 3.1, iowait: 0.4, vdaIo: 0.3 },
    { time: '07:18', system: 1.7, user: 2.2, iowait: 0.2, vdaIo: 0.1 },
    { time: '07:20', system: 1.73, user: 2.07, iowait: 0.13, vdaIo: 0.0 },
  ];

  const svgWidth = 560;
  const svgHeight = 200;
  const paddingLeft = 40;
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 26;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const maxY = 100;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - (Math.min(val, maxY) / maxY) * chartHeight;

  // Path generators
  const pathUser = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.user).toFixed(1)}`).join(' ');
  const areaUser = `${pathUser} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const pathSystem = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.system).toFixed(1)}`).join(' ');
  const pathIowait = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.iowait).toFixed(1)}`).join(' ');
  const pathVda = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(d.vdaIo).toFixed(1)}`).join(' ');

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[265px]">
      {/* Title with info icon matching reference */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] font-mono text-neutral-500 border border-neutral-700">
            i
          </span>
          <span className="text-xs font-semibold text-neutral-200 tracking-tight">
            CPU usage, disk I/O operations per second (%)
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">Peak: 99.27% (Nginx/Artisan Worker Spike)</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        {/* SVG Area */}
        <div className="flex-1 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="areaGradUser" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Grid Lines: 0%, 20%, 40%, 60%, 80%, 100% */}
            {[0, 20, 40, 60, 80, 100].map((val) => {
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
                    {val.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* X-axis timestamps */}
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

            {/* Shaded Area for User CPU */}
            <path d={areaUser} fill="url(#areaGradUser)" />

            {/* Curves */}
            <path d={pathVda} fill="none" stroke="#f97316" strokeWidth="1.5" />
            <path d={pathIowait} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <path d={pathSystem} fill="none" stroke="#22c55e" strokeWidth="1.5" />
            <path d={pathUser} fill="none" stroke="#eab308" strokeWidth="2" />

            {/* Hover Indicator Crosshair */}
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
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].user)} r="4" fill="#eab308" stroke="#000" strokeWidth="1.5" />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].system)} r="3.5" fill="#22c55e" stroke="#000" strokeWidth="1" />
                <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].iowait)} r="3.5" fill="#38bdf8" stroke="#000" strokeWidth="1" />
              </g>
            )}

            {/* Interactive touch columns */}
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

          {/* Floating Tooltip */}
          {hoverIndex !== null && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-lg bg-neutral-950/95 border border-neutral-700 text-[10px] font-mono shadow-2xl space-y-0.5"
              style={{
                left: `${Math.min(65, Math.max(10, (hoverIndex / (data.length - 1)) * 100))}%`,
                top: '10px',
              }}
            >
              <div className="text-neutral-400 border-b border-neutral-800 pb-0.5">{hoveredPoint.time} UTC</div>
              <div className="text-yellow-400">User: {hoveredPoint.user.toFixed(2)}%</div>
              <div className="text-emerald-400">System: {hoveredPoint.system.toFixed(2)}%</div>
              <div className="text-sky-400">Iowait: {hoveredPoint.iowait.toFixed(2)}%</div>
              <div className="text-orange-400">vda I/O %: {hoveredPoint.vdaIo.toFixed(2)}%</div>
            </div>
          )}
        </div>

        {/* Legend Table with max / avg / current matching reference screenshot */}
        <div className="xl:w-64 shrink-0 flex flex-col justify-center text-[10px] font-mono border-t xl:border-t-0 xl:border-l border-white/[0.06] pt-2 xl:pt-0 xl:pl-3 space-y-1">
          <div className="grid grid-cols-12 text-neutral-500 uppercase pb-1 border-b border-white/[0.04] text-[9px]">
            <span className="col-span-6">Series</span>
            <span className="col-span-2 text-right">Max</span>
            <span className="col-span-2 text-right">Avg</span>
            <span className="col-span-2 text-right text-sky-400">Cur</span>
          </div>

          {/* System */}
          <div className="grid grid-cols-12 py-1 items-center hover:bg-white/[0.04] rounded px-1 transition-colors">
            <div className="col-span-6 flex items-center gap-1.5 truncate">
              <span className="w-2 h-1 rounded-sm bg-emerald-400 shrink-0" />
              <span className="text-neutral-300 truncate" title={`${nodeName}_System`}>
                {nodeName}_System
              </span>
            </div>
            <span className="col-span-2 text-right text-neutral-400">10.53%</span>
            <span className="col-span-2 text-right text-neutral-400">1.50%</span>
            <span className="col-span-2 text-right font-medium text-emerald-400">
              {hoveredPoint.system.toFixed(2)}%
            </span>
          </div>

          {/* User */}
          <div className="grid grid-cols-12 py-1 items-center hover:bg-white/[0.04] rounded px-1 transition-colors">
            <div className="col-span-6 flex items-center gap-1.5 truncate">
              <span className="w-2 h-1 rounded-sm bg-yellow-400 shrink-0" />
              <span className="text-neutral-300 truncate" title={`${nodeName}_User`}>
                {nodeName}_User
              </span>
            </div>
            <span className="col-span-2 text-right text-neutral-400">99.27%</span>
            <span className="col-span-2 text-right text-neutral-400">13.52%</span>
            <span className="col-span-2 text-right font-medium text-yellow-400">
              {hoveredPoint.user.toFixed(2)}%
            </span>
          </div>

          {/* Iowait */}
          <div className="grid grid-cols-12 py-1 items-center hover:bg-white/[0.04] rounded px-1 transition-colors">
            <div className="col-span-6 flex items-center gap-1.5 truncate">
              <span className="w-2 h-1 rounded-sm bg-sky-400 shrink-0" />
              <span className="text-neutral-300 truncate" title={`${nodeName}_Iowait`}>
                {nodeName}_Iowait
              </span>
            </div>
            <span className="col-span-2 text-right text-neutral-400">8.00%</span>
            <span className="col-span-2 text-right text-neutral-400">0.36%</span>
            <span className="col-span-2 text-right font-medium text-sky-400">
              {hoveredPoint.iowait.toFixed(2)}%
            </span>
          </div>

          {/* vda per second IO % */}
          <div className="grid grid-cols-12 py-1 items-center hover:bg-white/[0.04] rounded px-1 transition-colors">
            <div className="col-span-6 flex items-center gap-1.5 truncate">
              <span className="w-2 h-1 rounded-sm bg-orange-400 shrink-0" />
              <span className="text-neutral-300 truncate" title={`${nodeName}_vda_per second I/O operating %`}>
                {nodeName}_vda_IO
              </span>
            </div>
            <span className="col-span-2 text-right text-neutral-400">11.68%</span>
            <span className="col-span-2 text-right text-neutral-400">0.22%</span>
            <span className="col-span-2 text-right font-medium text-orange-400">
              {hoveredPoint.vdaIo.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
