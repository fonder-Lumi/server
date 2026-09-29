import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  Play,
  Pause,
  Download,
  Filter,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { LogEntry } from '../../types';

export const LogsView: React.FC = () => {
  const { logs, addToast } = useApp();

  const [activeLogType, setActiveLogType] = useState<'access' | 'error' | 'mysql' | 'auth'>('access');
  const [isLiveTail, setIsLiveTail] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | '404' | '500'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesType = activeLogType === 'access' ? (log.type === 'access' || !log.type) : log.type === activeLogType;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery) ||
      (log.path && log.path.includes(searchQuery));
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === '200'
        ? log.status === 200
        : statusFilter === '404'
        ? log.status === 404
        : (log.status && log.status >= 500);

    return matchesType && matchesSearch && matchesStatus;
  });

  const handleDownloadLog = () => {
    const lines = filteredLogs.map((l) => `${l.timestamp} [${l.type.toUpperCase()}] ${l.ip} ${l.method || ''} ${l.path || ''} ${l.status || ''} - ${l.message}`).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_${activeLogType}_log_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ title: 'Log Exported', message: `Downloaded ${activeLogType}.log`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            System & Web Server Logs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time journald, Nginx, PHP-FPM and MariaDB telemetry streams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveTail(!isLiveTail)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
              isLiveTail
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-neutral-300 border-white/10'
            }`}
          >
            {isLiveTail ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveTail ? 'Live Tail Active' : 'Tail Paused'}</span>
          </button>
          <button
            onClick={handleDownloadLog}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw Log</span>
          </button>
        </div>
      </div>

      {/* Log Type Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl self-start">
          {[
            { id: 'access', label: 'Nginx Access' },
            { id: 'error', label: 'Nginx Error' },
            { id: 'mysql', label: 'MySQL Query' },
            { id: 'auth', label: 'Auth / SSH' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLogType(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeLogType === tab.id
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {activeLogType === 'access' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
            >
              <option value="all">All HTTP Codes</option>
              <option value="200">200 OK</option>
              <option value="404">404 Not Found</option>
              <option value="500">500+ Errors</option>
            </select>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in log lines..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Log Terminal Display */}
      <div className="rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden font-mono text-xs">
        <div className="h-10 px-4 border-b border-white/10 bg-[#121215] flex items-center justify-between text-neutral-400 select-none">
          <span>/var/log/{activeLogType === 'access' ? 'nginx/access.log' : activeLogType === 'error' ? 'nginx/error.log' : activeLogType === 'mysql' ? 'mysql/slow.log' : 'auth.log'}</span>
          <span>{filteredLogs.length} matching events</span>
        </div>

        <div className="p-4 max-h-[550px] overflow-y-auto space-y-2 leading-relaxed">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-sans">
              No log entries match the current filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="py-1 px-2 rounded hover:bg-white/[0.04] flex flex-col sm:flex-row sm:items-baseline gap-2 transition-colors border-b border-white/[0.02] last:border-b-0"
              >
                <span className="text-neutral-500 shrink-0 tabular-nums">{log.timestamp}</span>
                <span className="text-neutral-300 shrink-0 font-semibold">{log.ip}</span>

                {log.method && (
                  <span className="text-neutral-200 font-bold shrink-0">{log.method}</span>
                )}

                {log.path && (
                  <span className="text-neutral-300 shrink-0">{log.path}</span>
                )}

                {log.status && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-semibold shrink-0 ${
                      log.status === 200
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : log.status >= 500
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {log.status}
                  </span>
                )}

                <span className="text-neutral-400 truncate">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
