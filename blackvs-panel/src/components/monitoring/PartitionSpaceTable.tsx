import React, { useState } from 'react';
import { PartitionInfo } from '../../types';

interface PartitionSpaceTableProps {
  partitions: PartitionInfo[];
  nodeIp?: string;
}

export const PartitionSpaceTable: React.FC<PartitionSpaceTableProps> = ({
  partitions,
  nodeIp = 'blackvs-node:9100',
}) => {
  const [sortField, setSortField] = useState<'partition' | 'availableSpace' | 'usagePercent'>('partition');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedPartition, setSelectedPartition] = useState<PartitionInfo | null>(null);

  const sortedPartitions = [...partitions].sort((a, b) => {
    if (sortField === 'partition') {
      return sortAsc ? a.partition.localeCompare(b.partition) : b.partition.localeCompare(a.partition);
    }
    if (sortField === 'usagePercent') {
      return sortAsc ? a.usagePercent - b.usagePercent : b.usagePercent - a.usagePercent;
    }
    return 0;
  });

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[#111317]/90 p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[275px]">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.04] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-200 tracking-tight">
            Free space for each partition
          </span>
          <span className="text-[10px] font-mono text-neutral-500">df -h / mount</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          {partitions.length} Mounts
        </span>
      </div>

      {/* Table Element matching reference style */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto max-h-[210px] scrollbar-thin">
        <table className="w-full text-left font-mono text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-neutral-400 text-[10px] uppercase">
              <th className="py-1.5 px-2 font-medium bg-neutral-900/60 rounded-l">File system</th>
              <th className="py-1.5 px-2 font-medium bg-neutral-900/60">IP</th>
              <th
                className="py-1.5 px-2 font-medium bg-neutral-900/60 cursor-pointer hover:text-white"
                onClick={() => {
                  setSortField('partition');
                  setSortAsc(!sortAsc);
                }}
              >
                Partition {sortField === 'partition' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="py-1.5 px-2 font-medium bg-neutral-900/60 text-right">Available space</th>
              <th
                className="py-1.5 px-2 font-medium bg-neutral-900/60 text-right rounded-r cursor-pointer hover:text-white"
                onClick={() => {
                  setSortField('usagePercent');
                  setSortAsc(!sortAsc);
                }}
              >
                Usage {sortField === 'usagePercent' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sortedPartitions.map((part) => (
              <tr
                key={part.id}
                onClick={() => setSelectedPartition(part)}
                className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
              >
                <td className="py-2 px-2 text-neutral-300 font-mono">
                  {part.filesystem}
                </td>
                <td className="py-2 px-2 text-neutral-400 font-mono text-[10px]">
                  {part.ip || nodeIp}
                </td>
                <td className="py-2 px-2 font-medium text-neutral-200">
                  <span className="group-hover:text-emerald-400 transition-colors">
                    {part.partition}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-emerald-400 font-medium">
                  {part.availableSpace}
                </td>
                <td className="py-2 px-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      part.usagePercent > 85
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : part.usagePercent > 60
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {part.usagePercent.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected partition modal preview / quick detail drawer */}
      {selectedPartition && (
        <div className="mt-2 p-2 rounded-lg bg-black/60 border border-neutral-700/60 text-[10px] font-mono flex items-center justify-between text-neutral-300 animate-in fade-in">
          <div>
            <span className="text-emerald-400 font-bold">{selectedPartition.partition}</span>
            <span className="text-neutral-500 ml-2">Total: {selectedPartition.totalSpace}</span>
            <span className="text-neutral-500 ml-2">Options: {selectedPartition.mountOptions || 'defaults'}</span>
          </div>
          <button
            onClick={() => setSelectedPartition(null)}
            className="text-neutral-400 hover:text-white px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
