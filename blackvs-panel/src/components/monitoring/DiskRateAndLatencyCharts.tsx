import React, { useState } from 'react';

interface MetricPoint {
  time: string;
  read: number;
  write: number;
}

export const DiskRateAndLatencyCharts: React.FC<{
  iopsRead?: number;
  iopsWrite?: number;
  mbRead?: number;
  mbWrite?: number;
  latencyMs?: number;
  netIn?: number;
  netOut?: number;
}> = ({
  iopsRead = 284,
  iopsWrite = 612,
  mbRead = 18.4,
  mbWrite = 42.1,
  latencyMs = 0.38,
  netIn = 142.8,
  netOut = 218.4,
}) => {
  const [activeTab, setActiveTab] = useState<'iops' | 'throughput' | 'latency' | 'network'>('iops');

  // Time-series mock series for disk operations
  const timeLabels = ['06:30', '06:40', '06:50', '07:00', '07:10', '07:20'];

  const iopsData: MetricPoint[] = [
    { time: '06:30', read: 120, write: 340 },
    { time: '06:40', read: 140, write: 380 },
    { time: '06:50', read: 180, write: 420 },
    { time: '07:00', read: 980, write: 2450 },
    { time: '07:10', read: 340, write: 820 },
    { time: '07:20', read: iopsRead, write: iopsWrite },
  ];

  const throughputData: MetricPoint[] = [
    { time: '06:30', read: 8.2, write: 18.4 },
    { time: '06:40', read: 9.1, write: 22.0 },
    { time: '06:50', read: 12.4, write: 28.5 },
    { time: '07:00', read: 84.5, write: 188.2 },
    { time: '07:10', read: 24.1, write: 54.0 },
    { time: '07:20', read: mbRead, write: mbWrite },
  ];

  const latencyData: MetricPoint[] = [
    { time: '06:30', read: 0.22, write: 0.34 },
    { time: '06:40', read: 0.24, write: 0.36 },
    { time: '06:50', read: 0.25, write: 0.39 },
    { time: '07:00', read: 1.45, write: 2.84 },
    { time: '07:10', read: 0.42, write: 0.58 },
    { time: '07:20', read: latencyMs * 0.8, write: latencyMs },
  ];

  const networkData: MetricPoint[] = [
    { time: '06:30', read: 65, write: 110 },
    { time: '06:40', read: 72, write: 125 },
    { time: '06:50', read: 95, write: 160 },
    { time: '07:00', read: 480, write: 740 },
    { time: '07:10', read: 180, write: 280 },
    { time: '07:20', read: netIn, write: netOut },
  ];

  // Helper chart renderer
  const renderSpark = (points: MetricPoint[], maxY: number, unit: string, readColor: string, writeColor: string) => {
    const width = 240;
    const height = 48;
    const getX = (i: number) => (i / (points.length - 1)) * width;
    const getY = (val: number) => height - (Math.min(val, maxY) / maxY) * (height - 8) - 4;

    const pathRead = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.read).toFixed(1)}`).join(' ');
    const pathWrite = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getY(p.write).toFixed(1)}`).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={pathRead} fill="none" stroke={readColor} strokeWidth="1.5" />
        <path d={pathWrite} fill="none" stroke={writeColor} strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Disk read and write rate (IOPS) */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-[160px]">
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-[9px] font-mono text-neutral-500 border border-neutral-700">
              i
            </span>
            <span className="text-xs font-semibold text-neutral-200 truncate">
              Disk read and write rate（IOPS）
            </span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-mono text-neutral-400">
              Read: <span className="text-emerald-400 font-bold">{iopsRead} IOPS</span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Write: <span className="text-yellow-400 font-bold">{iopsWrite} IOPS</span>
            </div>
          </div>
          <div className="mt-1.5 h-11">
            {renderSpark(iopsData, 2600, 'IOPS', '#22c55e', '#eab308')}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-white/[0.04]">
          <span>Peak: 3,430 total IOPS</span>
          <span className="text-neutral-400">vda NVMe</span>
        </div>
      </div>

      {/* 2. Disk read and write capacity (Throughput) */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-[160px]">
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-[9px] font-mono text-neutral-500 border border-neutral-700">
              i
            </span>
            <span className="text-xs font-semibold text-neutral-200 truncate">
              Disk read and write capacity
            </span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-mono text-neutral-400">
              Read: <span className="text-sky-400 font-bold">{mbRead} MB/s</span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Write: <span className="text-orange-400 font-bold">{mbWrite} MB/s</span>
            </div>
          </div>
          <div className="mt-1.5 h-11">
            {renderSpark(throughputData, 200, 'MB/s', '#38bdf8', '#f97316')}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-white/[0.04]">
          <span>Max Bandwidth: 3,500 MB/s</span>
          <span className="text-emerald-400">PCIe 4.0 x4</span>
        </div>
      </div>

      {/* 3. Disk IO read and write time (Latency) */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-[160px]">
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-[9px] font-mono text-neutral-500 border border-neutral-700">
              i
            </span>
            <span className="text-xs font-semibold text-neutral-200 truncate">
              Disk IO read and write time
            </span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-mono text-neutral-400">
              Await: <span className="text-emerald-400 font-bold">{latencyMs} ms</span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              r_await: <span className="text-sky-400 font-bold">{(latencyMs * 0.7).toFixed(2)} ms</span>
            </div>
          </div>
          <div className="mt-1.5 h-11">
            {renderSpark(latencyData, 3.0, 'ms', '#38bdf8', '#22c55e')}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-white/[0.04]">
          <span>Target: &lt; 1.0 ms</span>
          <span className="text-emerald-400 font-bold">Ultra Low Latency</span>
        </div>
      </div>

      {/* 4. Network Traffic (Ingress / Egress) */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-[160px]">
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-[9px] font-mono text-neutral-500 border border-neutral-700">
              i
            </span>
            <span className="text-xs font-semibold text-neutral-200 truncate">
              Network Traffic (eth0)
            </span>
          </div>
        </div>

        <div className="my-1.5">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-mono text-neutral-400">
              RX: <span className="text-emerald-400 font-bold">{netIn} Mbps</span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              TX: <span className="text-purple-400 font-bold">{netOut} Mbps</span>
            </div>
          </div>
          <div className="mt-1.5 h-11">
            {renderSpark(networkData, 800, 'Mbps', '#22c55e', '#a855f7')}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-white/[0.04]">
          <span>Interface: 10 Gbps SFP+</span>
          <span className="text-emerald-400">0 Dropped Pkts</span>
        </div>
      </div>
    </div>
  );
};
