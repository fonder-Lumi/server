import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  RotateCw,
  Play,
  Square,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ServiceItem } from '../../types';

export const VpsView: React.FC = () => {
  const { services, restartService, currentNode, telemetry, addToast } = useApp();
  const [isUpdatingPackages, setIsUpdatingPackages] = useState(false);

  const handleUpdatePackages = () => {
    setIsUpdatingPackages(true);
    addToast({
      title: 'apt update && apt upgrade -y',
      message: 'Fetching security errata from Ubuntu repository mirrors...',
      type: 'info',
    });

    setTimeout(() => {
      setIsUpdatingPackages(false);
      addToast({
        title: 'System Packages Up to Date',
        message: 'All 448 installed deb packages are on their latest stable patch.',
        type: 'success',
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Server Hardware & System Services
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Dedicated host specifications, systemd init units, and package management
          </p>
        </div>

        <button
          onClick={handleUpdatePackages}
          disabled={isUpdatingPackages}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isUpdatingPackages ? 'animate-spin' : ''}`} />
          <span>{isUpdatingPackages ? 'Checking Mirror...' : 'Check OS Package Updates'}</span>
        </button>
      </div>

      {/* Host Specs Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.05] text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{currentNode.name}</div>
              <div className="text-xs text-neutral-400 font-mono">
                {currentNode.hostname} ({currentNode.ip}) · {currentNode.datacenter}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CLUSTER MASTER
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-3 border-t border-white/[0.06]">
          <div>
            <div className="text-neutral-500 font-sans text-[11px]">Processor Model</div>
            <div className="text-white font-medium truncate">{telemetry.cpuModel}</div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans text-[11px]">Physical Memory</div>
            <div className="text-white font-medium">{telemetry.memoryTotalGB} GB DDR5 ECC Registered</div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans text-[11px]">Primary Storage</div>
            <div className="text-white font-medium">PCIe Gen4 NVMe RAID-1 (1.8 TB)</div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans text-[11px]">Operating System</div>
            <div className="text-white font-medium truncate">{currentNode.os}</div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] space-y-3 p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Managed systemd Service Daemons</h2>
          <p className="text-xs text-neutral-400">Process status, listen sockets and instant service restarts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Daemon Version</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Memory</th>
                <th className="py-2.5 px-3">Uptime</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        srv.status === 'running'
                          ? 'bg-emerald-400'
                          : srv.status === 'restarting'
                          ? 'bg-amber-400 animate-spin'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-semibold">{srv.name}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-neutral-400 text-[11px]">{srv.version}</td>
                  <td className="py-3 px-3 font-mono text-neutral-300">{srv.port || 'Socket'}</td>
                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-300">{srv.memoryMB} MB</td>
                  <td className="py-3 px-3 font-mono text-neutral-400 text-[11px]">{srv.uptime}</td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                        srv.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : srv.status === 'restarting'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {srv.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => restartService(srv.id)}
                      disabled={srv.status === 'restarting'}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                    >
                      <RotateCw
                        className={`w-3 h-3 ${srv.status === 'restarting' ? 'animate-spin' : ''}`}
                      />
                      <span>Restart</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
