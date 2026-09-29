import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Activity,
  HardDrive,
  ArrowDownUp,
  Search,
  RefreshCw,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';
import { MetricArcGauge } from '../monitoring/MetricArcGauge';
import { SystemAverageLoadChart } from '../monitoring/SystemAverageLoadChart';
import { TotalDiskSpaceDonut } from '../monitoring/TotalDiskSpaceDonut';
import { PartitionSpaceTable } from '../monitoring/PartitionSpaceTable';
import { CpuIoOperationsChart } from '../monitoring/CpuIoOperationsChart';
import { MemoryInfoChart } from '../monitoring/MemoryInfoChart';
import { DiskRateAndLatencyCharts } from '../monitoring/DiskRateAndLatencyCharts';

export const ResourcesView: React.FC = () => {
  const { telemetry, processes, killProcess, addToast, currentNode } = useApp();
  const [searchProcess, setSearchProcess] = useState('');
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '24h'>('5m');
  const [activeTab, setActiveTab] = useState<'telemetry' | 'processes' | 'storage'>('telemetry');

  const filteredProcesses = processes.filter(
    (p) =>
      p.command.toLowerCase().includes(searchProcess.toLowerCase()) ||
      p.user.toLowerCase().includes(searchProcess.toLowerCase()) ||
      String(p.pid).includes(searchProcess)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BlackVs Telemetry Exporter v2.52</span>
            <span>·</span>
            <span>{currentNode.hostname}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            System Telemetry & Hardware Gauges
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time CPU cores, memory allocation, disk I/O operations, and active process inspection
          </p>
        </div>

        {/* Navigation pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-700/80 rounded-xl self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'telemetry' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Gauges & Charts
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'processes' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Processes ({processes.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'storage' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Storage & Mounts
          </button>
        </div>
      </div>

      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          {/* Top Gauges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3 flex flex-col justify-between shadow-sm h-full min-h-[176px] overflow-hidden">
              <span className="text-[10px] sm:text-[11px] font-medium text-neutral-300 tracking-tight">Uptime</span>
              <div className="py-1 my-auto text-center">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 leading-none drop-shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                  {telemetry.uptimeFormatted.split(' ')[0]}
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-emerald-500 uppercase font-semibold mt-0.5 leading-tight">
                  {telemetry.uptimeFormatted.split(' ')[1] || 'min'}
                </div>
              </div>
              <div className="pt-1 border-t border-white/[0.04] text-[9px] font-mono text-neutral-500 text-center truncate leading-tight">
                Since last boot
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-between h-full min-h-[176px]">
              <div className="flex-1 rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-2.5 sm:p-3 flex flex-col justify-between shadow-sm overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-medium text-neutral-300 truncate leading-tight tracking-tight">vCPU Cores</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-500 text-center leading-none">{telemetry.cpuCores}</div>
                <div className="text-[9px] font-mono text-neutral-500 text-center leading-tight truncate">AMD EPYC 32C</div>
              </div>
              <div className="flex-1 rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-2.5 sm:p-3 flex flex-col justify-between shadow-sm overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-medium text-neutral-300 truncate leading-tight tracking-tight">Memory Total</span>
                <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 text-center leading-none">{telemetry.memoryTotalGB} GiB</div>
                <div className="text-[9px] font-mono text-neutral-500 text-center leading-tight truncate">DDR5 ECC</div>
              </div>
            </div>

            <MetricArcGauge
              title="CPU Usage (5m)"
              value={telemetry.cpuUsage}
              unit="%"
              percentage={telemetry.cpuUsage}
              color="#22c55e"
              sparklineData={[8.2, 8.5, 9.1, 9.8, 12.4, 18.2, 14.1, 10.2, 9.2]}
            />
            <MetricArcGauge
              title="CPU I/O Wait"
              value={telemetry.cpuIowait}
              unit="%"
              percentage={Math.min(100, telemetry.cpuIowait * 10)}
              color="#22c55e"
              sparklineData={[0.10, 0.12, 0.11, 0.14, 0.22, 0.45, 0.18, 0.13]}
            />
            <MetricArcGauge
              title="Memory Usage"
              value={Math.round((telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100)}
              unit="%"
              percentage={(telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100}
              color="#22c55e"
              sparklineData={[68, 69, 70, 71, 70, 72, 70, 70]}
            />
            <MetricArcGauge
              title="Open FD"
              value={`${(telemetry.openFileDescriptors / 1000).toFixed(2)} K`}
              unit=""
              percentage={(telemetry.openFileDescriptors / telemetry.maxFileDescriptors) * 100}
              color="#22c55e"
              sparklineData={[1130, 1140, 1145, 1150, 1152, 1150]}
            />
            <MetricArcGauge
              title="Root / Usage"
              value={telemetry.rootPartitionUsage}
              unit="%"
              percentage={telemetry.rootPartitionUsage}
              color="#22c55e"
              sparklineData={[8.35, 8.38, 8.4, 8.4]}
            />
            <MetricArcGauge
              title="Max Partition"
              value={telemetry.maxPartitionUsage}
              unit="%"
              percentage={telemetry.maxPartitionUsage}
              color="#22c55e"
              sparklineData={[8.35, 8.38, 8.4, 8.4]}
            />
          </div>

          {/* Row 2: Charts and Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-5">
              <SystemAverageLoadChart currentLoad={telemetry.loadAverage} nodeName="blackvs-node:9100" />
            </div>
            <div className="lg:col-span-3">
              <TotalDiskSpaceDonut />
            </div>
            <div className="lg:col-span-4">
              <PartitionSpaceTable partitions={telemetry.partitions} nodeIp="blackvs-node:9100" />
            </div>
          </div>

          {/* Row 3: CPU & I/O breakdown + Memory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-7">
              <CpuIoOperationsChart nodeName="blackvs-node:9100" />
            </div>
            <div className="lg:col-span-5">
              <MemoryInfoChart nodeName="blackvs-node:9100" totalGB={telemetry.memoryTotalGB} usedGB={telemetry.memoryUsedGB} />
            </div>
          </div>

          {/* Row 4: Disk Latency & IOPS */}
          <DiskRateAndLatencyCharts
            iopsRead={telemetry.iopsRead}
            iopsWrite={telemetry.iopsWrite}
            mbRead={telemetry.diskReadMBps}
            mbWrite={telemetry.diskWriteMBps}
            latencyMs={telemetry.diskIoWaitMs}
            netIn={telemetry.networkIngressMbps}
            netOut={telemetry.networkEgressMbps}
          />
        </div>
      )}

      {activeTab === 'processes' && (
        <div className="rounded-2xl border border-[var(--app-border)] bg-[#111317]/95 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Linux Process Pool</h2>
              <p className="text-xs text-neutral-400">Live htop process inspection and POSIX signal dispatcher</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchProcess}
                onChange={(e) => setSearchProcess(e.target.value)}
                placeholder="Search PID, user or command..."
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-400 text-[10px] uppercase bg-neutral-900/60">
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">CPU %</th>
                  <th className="py-2.5 px-3">Mem %</th>
                  <th className="py-2.5 px-3">CPU Time</th>
                  <th className="py-2.5 px-3">Command</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProcesses.map((p) => (
                  <tr key={p.pid} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2 px-3 text-neutral-300 font-bold">{p.pid}</td>
                    <td className="py-2 px-3 text-neutral-400">{p.user}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{p.cpu}%</td>
                    <td className="py-2 px-3 text-yellow-400">{p.mem}%</td>
                    <td className="py-2 px-3 text-neutral-400">{p.time}</td>
                    <td className="py-2 px-3 text-neutral-200 max-w-xs truncate">{p.command}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => killProcess(p.pid)}
                        className="px-2 py-1 text-[10px] rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        Kill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TotalDiskSpaceDonut />
            <PartitionSpaceTable partitions={telemetry.partitions} nodeIp="blackvs-node:9100" />
          </div>
        </div>
      )}
    </div>
  );
};
