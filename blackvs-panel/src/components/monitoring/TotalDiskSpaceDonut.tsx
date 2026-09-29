import React, { useState } from 'react';

interface StorageSlice {
  id: string;
  name: string;
  mount: string;
  usedGB: number;
  percentage: number;
  color: string;
  desc: string;
}

export const TotalDiskSpaceDonut: React.FC = () => {
  const [hoveredSlice, setHoveredSlice] = useState<StorageSlice | null>(null);

  const totalGB = 960;
  const slices: StorageSlice[] = [
    {
      id: 'webapps',
      name: '/home/blackvs',
      mount: 'Customer Web Applications',
      usedGB: 178.4,
      percentage: 18.58,
      color: '#38bdf8', // sky
      desc: 'Nginx public_html, PHP scripts, client static media',
    },
    {
      id: 'mysql',
      name: '/var/lib/mysql',
      mount: 'MariaDB Databases',
      usedGB: 115.8,
      percentage: 12.06,
      color: '#a855f7', // purple
      desc: 'InnoDB tablespaces, indexes, and write-ahead redo logs',
    },
    {
      id: 'docker',
      name: '/var/lib/docker',
      mount: 'Containers & Layers',
      usedGB: 15.1,
      percentage: 1.57,
      color: '#f97316', // orange
      desc: 'Container images, volumes, and overlay2 storage driver',
    },
    {
      id: 'logs',
      name: '/var/log',
      mount: 'System & Audit Logs',
      usedGB: 6.2,
      percentage: 0.65,
      color: '#eab308', // yellow
      desc: 'Nginx access/error logs, PHP-FPM slowlogs, journald',
    },
    {
      id: 'root',
      name: '/ (Root System)',
      mount: 'Ubuntu 24.04 OS Core',
      usedGB: 2.04,
      percentage: 0.21,
      color: '#ef4444', // red
      desc: 'Kernel modules, binaries, libraries, and core configuration',
    },
    {
      id: 'swap',
      name: 'System Swap',
      mount: 'Virtual Memory Paging',
      usedGB: 8.0,
      percentage: 0.83,
      color: '#ec4899', // pink
      desc: 'NVMe-backed memory swap space partition',
    },
    {
      id: 'free',
      name: 'Available Free',
      mount: 'Unallocated NVMe SSD',
      usedGB: 634.46,
      percentage: 66.1,
      color: '#22c55e', // green
      desc: 'Healthy unpartitioned high-speed NVMe flash space',
    },
  ];

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[275px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-200 tracking-tight">
            Total disk space
          </span>
          <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            NVMe Gen4
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">960 GB Total</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-auto py-1">
        {/* Interactive SVG Donut Chart */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg] select-none">
            {slices.map((slice) => {
              const strokeDasharray = (slice.percentage / 100) * circumference;
              const strokeDashoffset = -cumulativeAngle;
              cumulativeAngle += strokeDasharray;

              const isHovered = hoveredSlice?.id === slice.id;

              return (
                <circle
                  key={slice.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    opacity: hoveredSlice ? (isHovered ? 1 : 0.45) : 0.95,
                  }}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              {hoveredSlice ? hoveredSlice.name : 'Free Space'}
            </span>
            <span
              className="text-lg font-bold font-mono tracking-tight"
              style={{ color: hoveredSlice ? hoveredSlice.color : '#22c55e' }}
            >
              {hoveredSlice ? `${hoveredSlice.percentage.toFixed(1)}%` : '66.1%'}
            </span>
            <span className="text-[10px] font-mono text-neutral-300">
              {hoveredSlice ? `${hoveredSlice.usedGB.toFixed(1)} GB` : '634.5 GB Free'}
            </span>
          </div>
        </div>

        {/* Legend Slices Breakdown */}
        <div className="flex-1 w-full space-y-1 text-[11px] font-mono">
          {slices.slice(0, 5).map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer ${
                  isHovered ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-neutral-300 truncate" title={slice.desc}>
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-neutral-400 text-[10px]">{slice.usedGB} GB</span>
                  <span
                    className="w-10 text-right font-medium"
                    style={{ color: slice.color }}
                  >
                    {slice.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick partition status footer */}
      <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <span>Filesystem: Ext4 + XFS Journaled</span>
        <span className="text-emerald-400">Disk Health: OK (SMART Verified)</span>
      </div>
    </div>
  );
};
