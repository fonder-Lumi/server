import React from 'react';

interface MetricArcGaugeProps {
  title: string;
  value: number | string;
  unit?: string;
  min?: number;
  max?: number;
  percentage?: number; // 0 to 100
  color?: string; // e.g. '#22c55e' or gradient
  sparklineData?: number[];
  infoTooltip?: string;
  subValue?: string;
  isKilo?: boolean;
}

export const MetricArcGauge: React.FC<MetricArcGaugeProps> = ({
  title,
  value,
  unit = '%',
  min = 0,
  max = 100,
  percentage,
  color,
  sparklineData = [12, 14, 13, 15, 18, 14, 12, 11, 13, 16, 20, 15, 14, 13, 14],
  infoTooltip,
  subValue,
}) => {
  // Numeric calculation for arc
  const numericVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const pct = percentage !== undefined ? percentage : Math.min(100, Math.max(0, ((numericVal - min) / (max - min)) * 100));

  // Determine stroke color if not explicitly provided
  const strokeColor = color || (pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#22c55e');

  // Gauge geometry: Semicircle / arc from 150° to 390° (240° sweep) or 180° to 360° (180° sweep)
  // Matching Grafana reference: arc sweeps from bottom-left (-210°) to bottom-right (30°)
  // For standard SVG circle with strokeDasharray/offset:
  const radius = 64;
  const strokeWidth = 9;
  const center = 80;
  // Circumference of full circle
  const circumference = 2 * Math.PI * radius;
  // Sweep is 220 degrees (approx 61% of full circle)
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - (arcLength * pct) / 100;

  // Mini sparkline SVG path
  const sparkWidth = 140;
  const sparkHeight = 22;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData, minVal + 1);
  const points = sparklineData.map((d, i) => {
    const x = (i / (sparklineData.length - 1)) * sparkWidth;
    const y = sparkHeight - ((d - minVal) / (maxVal - minVal)) * (sparkHeight - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const sparkPath = `M ${points.join(' L ')}`;
  const sparkArea = `${sparkPath} L ${sparkWidth},${sparkHeight} L 0,${sparkHeight} Z`;

  return (
    <div className="relative rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3 flex flex-col justify-between overflow-hidden shadow-sm group hover:border-neutral-500/40 transition-all h-full min-h-[176px]">
      {/* Top Header Label */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className="text-[10px] sm:text-[11px] font-medium text-neutral-300 tracking-tight truncate leading-tight"
            title={title}
          >
            {title}
          </span>
        </div>
        {infoTooltip && (
          <div className="relative group/info shrink-0 mt-0.5">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-mono text-neutral-500 hover:text-neutral-300 border border-neutral-700/60 cursor-help">
              i
            </span>
            <div className="absolute right-0 top-5 hidden group-hover/info:block z-30 w-48 p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-[10px] text-neutral-200 shadow-xl pointer-events-none">
              {infoTooltip}
            </div>
          </div>
        )}
      </div>

      {/* Center Arc Gauge */}
      <div className="relative flex items-center justify-center py-1 my-auto">
        <svg viewBox="0 0 160 100" className="w-full max-w-[140px] h-auto overflow-visible">
          <defs>
            <linearGradient id={`gaugeBgGradient-${title.slice(0, 8)}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="90%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id={`gaugeZoneGradient-${title.slice(0, 8)}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id={`glow-${title.slice(0, 8)}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track with Subtle Colored Border Guide */}
          <path
            d="M 24 95 A 64 64 0 1 1 136 95"
            fill="none"
            stroke={`url(#gaugeZoneGradient-${title.slice(0, 8)})`}
            strokeWidth="2"
            opacity="0.25"
          />

          {/* Gauge Background Channel */}
          <path
            d="M 24 95 A 64 64 0 1 1 136 95"
            fill="none"
            stroke="#1c212a"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Progress Path */}
          <path
            d="M 24 95 A 64 64 0 1 1 136 95"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: pct > 80 ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : undefined,
            }}
          />

          {/* Start and End Markers */}
          <circle cx="24" cy="95" r="2.5" fill="#475569" />
          <circle cx="136" cy="95" r="2.5" fill="#ef4444" />
        </svg>

        {/* Numeric Center Value Display */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center select-none pointer-events-none pb-1">
          <div className="flex items-baseline justify-center">
            <span
              className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white drop-shadow-sm tabular-nums leading-none"
              style={{ color: strokeColor }}
            >
              {typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : value}
            </span>
            {unit && (
              <span className="text-[10px] sm:text-xs font-mono ml-0.5 leading-none" style={{ color: strokeColor }}>
                {unit}
              </span>
            )}
          </div>
          {subValue && (
            <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 mt-0.5 leading-tight whitespace-nowrap">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Mini Sparkline Curve */}
      <div className="mt-1.5 pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-1.5">
        <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 uppercase tracking-wider shrink-0">Trend</span>
        <div className="flex-1 h-4 overflow-hidden min-w-0">
          <svg width="100%" height="100%" viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${title.slice(0, 8)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={sparkArea} fill={`url(#spark-${title.slice(0, 8)})`} />
            <path d={sparkPath} fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        </div>
        <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400 tabular-nums shrink-0 whitespace-nowrap">
          {pct > 50 ? '↑' : '↓'} {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};
