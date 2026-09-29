import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  RefreshCw,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Terminal,
  Globe,
  Database,
  Trash2,
  XCircle,
  Search,
} from 'lucide-react';
import { MetricArcGauge } from '../monitoring/MetricArcGauge';
import { SystemAverageLoadChart } from '../monitoring/SystemAverageLoadChart';
import { TotalDiskSpaceDonut } from '../monitoring/TotalDiskSpaceDonut';
import { PartitionSpaceTable } from '../monitoring/PartitionSpaceTable';
import { CpuIoOperationsChart } from '../monitoring/CpuIoOperationsChart';
import { MemoryInfoChart } from '../monitoring/MemoryInfoChart';
import { DiskRateAndLatencyCharts } from '../monitoring/DiskRateAndLatencyCharts';

export const DashboardView: React.FC = () => {
  const {
    telemetry,
    currentNode,
    setCurrentNode,
    serverNodes,
    processes,
    killProcess,
    setActiveTab,
    addToast,
  } = useApp();

  // Active view mode within dashboard
  const [viewMode, setViewMode] = useState<'monitoring' | 'processes' | 'storage' | 'alerts'>('monitoring');

  // Time range filter matching monitoring systems
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '30m' | '1h' | '6h' | '24h'>('5m');
  const [refreshInterval, setRefreshInterval] = useState<'off' | '2s' | '5s' | '10s' | '30s'>('5s');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [memoryDisplayUnit, setMemoryDisplayUnit] = useState<'GiB' | 'MiB'>('GiB');

  // Process search filter
  const [processSearch, setProcessSearch] = useState('');

  // Alerts state
  const [alertRules] = useState([
    { id: 'alt-1', name: 'High CPU Load Spike', condition: 'cpu_usage > 90% for 3m', severity: 'warning', state: 'resolved', lastEvent: '12m ago' },
    { id: 'alt-2', name: 'Disk Space Running Low', condition: 'partition_usage(/) > 85%', severity: 'critical', state: 'resolved', lastEvent: '2d ago' },
    { id: 'alt-3', name: 'Nginx Process Saturation', condition: 'active_workers > 400', severity: 'info', state: 'resolved', lastEvent: '1h ago' },
    { id: 'alt-4', name: 'Disk I/O Await Latency', condition: 'iowait_ms > 20ms', severity: 'warning', state: 'resolved', lastEvent: '45m ago' },
  ]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast({
        title: 'Prometheus Node Telemetry Synced',
        message: `Polled metrics from ${currentNode.hostname}:9100 (${timeRange} window)`,
        type: 'info',
      });
    }, 600);
  };

  const filteredProcesses = processes.filter(
    (p) =>
      p.command.toLowerCase().includes(processSearch.toLowerCase()) ||
      p.user.toLowerCase().includes(processSearch.toLowerCase()) ||
      String(p.pid).includes(processSearch)
  );

  return (
    <div className="space-y-4">
      {/* Top Prometheus & Control Bar matching reference header structure */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/95 p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md backdrop-blur-xl">
        {/* Left: Node Info & Host badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>BlackVs Server Monitoring</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>EXPORTER 9100 ACTIVE</span>
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-neutral-200">{currentNode.hostname}</span>
              <span className="text-neutral-600">·</span>
              <span>{currentNode.ip}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{currentNode.datacenter.split(',')[0]}</span>
              <span className="text-neutral-600">·</span>
              <span>{currentNode.os.split(' ')[0]} 24.04</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Node Switcher */}
          <select
            value={currentNode.id}
            onChange={(e) => {
              const target = serverNodes.find((n) => n.id === e.target.value);
              if (target) {
                setCurrentNode(target);
                addToast({
                  title: 'Monitoring Target Switched',
                  message: `Now polling metrics from ${target.hostname}`,
                  type: 'info',
                });
              }
            }}
            className="px-2.5 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-700/80 rounded-xl text-neutral-200 focus:outline-none focus:border-neutral-500 cursor-pointer"
          >
            {serverNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.ip})
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex items-center bg-neutral-900/90 border border-neutral-700/80 rounded-xl p-0.5 text-xs font-mono">
            {(['5m', '15m', '30m', '1h', '6h', '24h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  timeRange === r
                    ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Auto Refresh dropdown */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value as any)}
            className="px-2 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-700/80 rounded-xl text-neutral-300 focus:outline-none"
            title="Telemetry Poll Interval"
          >
            <option value="off">Poll: Paused</option>
            <option value="2s">Poll: 2s</option>
            <option value="5s">Poll: 5s (Default)</option>
            <option value="10s">Poll: 10s</option>
            <option value="30s">Poll: 30s</option>
          </select>

          {/* Manual Refresh button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 transition-colors"
            title="Poll metrics immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Switcher Tabs - Segmented Apple-inspired control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[var(--app-border)] pb-2 gap-2">
        <div className="flex items-center gap-1.5 bg-neutral-950/60 p-1 rounded-xl border border-white/[0.06] shrink-0 overflow-x-auto scrollbar-thin w-full lg:w-auto">
          <button
            onClick={() => setViewMode('monitoring')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'monitoring'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Telemetry & Gauges
          </button>
          <button
            onClick={() => setViewMode('processes')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'processes'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Processes ({processes.length})
          </button>
          <button
            onClick={() => setViewMode('storage')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'storage'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Partitions
          </button>
          <button
            onClick={() => setViewMode('alerts')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'alerts'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Alert Rules
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-neutral-400 shrink-0 whitespace-nowrap justify-end">
          <span>Uptime: <strong className="text-neutral-200">{telemetry.uptimeFormatted}</strong></span>
          <span className="text-neutral-600">·</span>
          <span>Load: <strong className="text-neutral-200">{telemetry.loadAverage.join(', ')}</strong></span>
          <span className="text-neutral-600">·</span>
          <span>Linux 6.8.0-45</span>
        </div>
      </div>

      {/* VIEW 1: Main Server Telemetry & Gauges matching Reference Image */}
      {viewMode === 'monitoring' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* ======================================================== */}
          {/* ROW 1: TOP METRICS & GAUGES ROW MATCHING REFERENCE IMAGE */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
            {/* 1. System runtime */}
            <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3 flex flex-col justify-between shadow-sm h-full min-h-[176px] hover:border-neutral-500/40 transition-all overflow-hidden">
              <span className="text-[10px] sm:text-[11px] font-medium text-neutral-300 tracking-tight">
                Uptime
              </span>
              <div className="py-1 my-auto text-center select-none">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight drop-shadow-[0_0_12px_rgba(34,197,94,0.3)] leading-none">
                  {telemetry.uptimeFormatted.split(' ')[0]}
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-emerald-500 uppercase tracking-wider font-semibold mt-0.5 leading-tight">
                  {telemetry.uptimeFormatted.split(' ')[1] || 'min'}
                </div>
              </div>
              <div className="pt-1.5 border-t border-white/[0.04] text-[9px] font-mono text-neutral-500 text-center truncate leading-tight">
                Since last reboot
              </div>
            </div>

            {/* 2. Stacked: CPU Audit number & Total memory */}
            <div className="flex flex-col gap-2 justify-between h-full min-h-[176px]">
              {/* Top: CPU Audit number */}
              <div className="flex-1 rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-2.5 sm:p-3 flex flex-col justify-between shadow-sm hover:border-neutral-500/40 transition-all overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-medium text-neutral-300 truncate leading-tight tracking-tight">
                  vCPU Cores
                </span>
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-500 text-center py-0.5 leading-none">
                  {telemetry.cpuCores}
                </div>
                <div className="text-[9px] font-mono text-neutral-500 text-center leading-tight truncate">
                  AMD EPYC 32C
                </div>
              </div>

              {/* Bottom: Total memory */}
              <div className="flex-1 rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-2.5 sm:p-3 flex flex-col justify-between shadow-sm hover:border-neutral-500/40 transition-all overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-medium text-neutral-300 truncate leading-tight tracking-tight">
                  Memory Total
                </span>
                <div
                  onClick={() => setMemoryDisplayUnit((prev) => (prev === 'GiB' ? 'MiB' : 'GiB'))}
                  className="text-sm sm:text-base font-bold font-mono text-emerald-400 text-center cursor-pointer hover:underline py-0.5 leading-none"
                  title="Click to toggle GiB / MiB"
                >
                  {memoryDisplayUnit === 'GiB'
                    ? `${telemetry.memoryTotalGB} GiB`
                    : `${Math.round(telemetry.memoryTotalGB * 1024)} MiB`}
                </div>
                <div className="text-[9px] font-mono text-neutral-500 text-center leading-tight truncate">
                  DDR5 ECC
                </div>
              </div>
            </div>

            {/* 3. CPU Usage */}
            <MetricArcGauge
              title="CPU Usage (5m)"
              value={telemetry.cpuUsage}
              unit="%"
              percentage={telemetry.cpuUsage}
              color="#22c55e"
              infoTooltip="Aggregated 5-minute CPU core active usage rate from /proc/stat"
              sparklineData={[7.8, 8.2, 8.5, 9.1, 9.8, 12.4, 18.2, 14.1, 10.2, 9.2]}
            />

            {/* 4. CPU iowait */}
            <MetricArcGauge
              title="CPU I/O Wait"
              value={telemetry.cpuIowait}
              unit="%"
              percentage={Math.min(100, telemetry.cpuIowait * 10)}
              color="#22c55e"
              infoTooltip="Percentage of time CPU was idle waiting for outstanding disk I/O requests"
              sparklineData={[0.08, 0.10, 0.12, 0.11, 0.14, 0.22, 0.45, 0.18, 0.13, 0.13]}
            />

            {/* 5. Memory usage */}
            <MetricArcGauge
              title="Memory Usage"
              value={Math.round((telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100)}
              unit="%"
              percentage={(telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100}
              color="#22c55e"
              infoTooltip="Active resident memory in use without buffers/cache"
              subValue={`${telemetry.memoryUsedGB.toFixed(1)} / ${telemetry.memoryTotalGB} GB`}
              sparklineData={[68, 69, 70, 71, 70, 72, 70, 70, 71, 70]}
            />

            {/* 6. Currently open file descriptor */}
            <MetricArcGauge
              title="Open FD"
              value={`${(telemetry.openFileDescriptors / 1000).toFixed(2)} K`}
              unit=""
              percentage={(telemetry.openFileDescriptors / telemetry.maxFileDescriptors) * 100}
              color="#22c55e"
              infoTooltip="Active allocated system-wide file descriptors (/proc/sys/fs/file-nr)"
              subValue="Max 65,536"
              sparklineData={[1120, 1130, 1140, 1145, 1150, 1152, 1150, 1152]}
            />

            {/* 7. Root partition usage */}
            <MetricArcGauge
              title="Root / Usage"
              value={telemetry.rootPartitionUsage}
              unit="%"
              percentage={telemetry.rootPartitionUsage}
              color="#22c55e"
              infoTooltip="Percentage of filesystem blocks allocated on the root mount point (/)"
              sparklineData={[8.3, 8.35, 8.38, 8.4, 8.4, 8.4]}
            />

            {/* 8. Maximum partition usage */}
            <MetricArcGauge
              title="Max Partition"
              value={telemetry.maxPartitionUsage}
              unit="%"
              percentage={telemetry.maxPartitionUsage}
              color="#22c55e"
              infoTooltip="Maximum utilization observed across any physical disk partition"
              sparklineData={[8.3, 8.35, 8.38, 8.4, 8.4, 8.4]}
            />
          </div>

          {/* ======================================================== */}
          {/* ROW 2: SYSTEM LOAD, STORAGE DONUT, AND PARTITIONS TABLE   */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* System Average Load (Col span 5) */}
            <div className="lg:col-span-5 h-full">
              <SystemAverageLoadChart
                currentLoad={telemetry.loadAverage}
                nodeName="blackvs-node:9100"
              />
            </div>

            {/* Total Disk Space (Col span 3) */}
            <div className="lg:col-span-3 h-full">
              <TotalDiskSpaceDonut />
            </div>

            {/* Free space for each partition (Col span 4) */}
            <div className="lg:col-span-4 h-full">
              <PartitionSpaceTable
                partitions={telemetry.partitions}
                nodeIp="blackvs-node:9100"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* ROW 3: CPU & DISK I/O OPERATIONS % + MEMORY INFORMATION */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* CPU usage, disk I/O operations per second (%) (Col span 7) */}
            <div className="lg:col-span-7 h-full">
              <CpuIoOperationsChart nodeName="blackvs-node:9100" />
            </div>

            {/* Memory Information Stacked Area Chart (Col span 5) */}
            <div className="lg:col-span-5 h-full">
              <MemoryInfoChart
                nodeName="blackvs-node:9100"
                totalGB={telemetry.memoryTotalGB}
                usedGB={telemetry.memoryUsedGB}
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* ROW 4: DISK RATE, THROUGHPUT, LATENCY & NETWORK METRICS   */}
          {/* ======================================================== */}
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

      {/* VIEW 2: Process Manager (htop style) with internal clean scrolling */}
      {viewMode === 'processes' && (
        <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/95 p-4 space-y-3.5 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Linux Process Tasks</h2>
              <p className="text-xs text-neutral-400">Inspecting tasks, resident memory, and CPU allocation (top / htop view)</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by PID, user, command..."
                value={processSearch}
                onChange={(e) => setProcessSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin border border-white/[0.06] rounded-xl">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-900 border-b border-white/[0.08]">
                <tr className="text-neutral-400 text-[10px] uppercase">
                  <th className="py-2 px-3">PID</th>
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">CPU %</th>
                  <th className="py-2 px-3">Mem %</th>
                  <th className="py-2 px-3">CPU Time</th>
                  <th className="py-2 px-3">Command</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProcesses.map((p) => (
                  <tr key={p.pid} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-3 text-neutral-300 font-bold">{p.pid}</td>
                    <td className="py-2.5 px-3 text-neutral-400">{p.user}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.cpu}%</td>
                    <td className="py-2.5 px-3 text-yellow-400">{p.mem}%</td>
                    <td className="py-2.5 px-3 text-neutral-400">{p.time}</td>
                    <td className="py-2.5 px-3 text-neutral-200 max-w-xs truncate">{p.command}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => killProcess(p.pid)}
                        className="p-1 px-2 text-[10px] rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        SIGKILL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Storage & Partitions deep-dive */}
      {viewMode === 'storage' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <TotalDiskSpaceDonut />
            <PartitionSpaceTable partitions={telemetry.partitions} nodeIp="blackvs-node:9100" />
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/95 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              NVMe Physical Array Health (SMART Diagnostics)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">SMART Overall Health</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">PASSED (100%)</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">NVMe Controller Temp</div>
                <div className="text-neutral-200 font-bold text-sm mt-1">36°C (Nominal)</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Wear Level Indicator</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">0.4% Endurance Used</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Total Terabytes Written</div>
                <div className="text-neutral-200 font-bold text-sm mt-1">48.2 TBW</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Alerts & Incident Log */}
      {viewMode === 'alerts' && (
        <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/95 p-4 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Configured Prometheus Alerts</h2>
              <p className="text-xs text-neutral-400">Automated thresholds wired to Discord & PagerDuty webhooks</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ALL SYSTEMS HEALTHY
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {alertRules.map((alt) => (
              <div key={alt.id} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-200">{alt.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        alt.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400'
                          : alt.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-sky-500/10 text-sky-400'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">{alt.condition}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{alt.state}</div>
                  <div className="text-[9px] font-mono text-neutral-500">{alt.lastEvent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
