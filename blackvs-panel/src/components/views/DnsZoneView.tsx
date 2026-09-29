import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Network,
  Plus,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { DnsRecordItem } from '../../types';

export const DnsZoneView: React.FC = () => {
  const { dnsRecords, domains, addDnsRecord, deleteDnsRecord, addToast } = useApp();

  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.domain || 'blackvs.cloud');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form
  const [recordType, setRecordType] = useState<'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'CAA'>('A');
  const [recordName, setRecordName] = useState('@');
  const [recordContent, setRecordContent] = useState('');
  const [recordTtl, setRecordTtl] = useState(3600);
  const [recordPriority, setRecordPriority] = useState(10);

  const domainRecords = dnsRecords.filter(
    (r) =>
      r.domain === selectedDomain &&
      (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordContent.trim()) return;

    addDnsRecord({
      domain: selectedDomain,
      type: recordType,
      name: recordName.trim(),
      content: recordContent.trim(),
      ttl: recordTtl,
      priority: recordType === 'MX' ? recordPriority : undefined,
    });

    setShowAddModal(false);
    setRecordName('@');
    setRecordContent('');
  };

  const handleExportZone = () => {
    let bind = `; Zone file for ${selectedDomain}\n; Exported from BlackVs Control Panel at ${new Date().toISOString()}\n$TTL 3600\n@ IN SOA ns1.blackvs.net. hostmaster.blackvs.net. (\n  2026092701 ; Serial\n  7200       ; Refresh\n  3600       ; Retry\n  1209600    ; Expire\n  3600 )     ; Negative Cache TTL\n\n`;

    domainRecords.forEach((r) => {
      if (r.type === 'MX') {
        bind += `${r.name}\t${r.ttl}\tIN\tMX\t${r.priority}\t${r.content}.\n`;
      } else {
        bind += `${r.name}\t${r.ttl}\tIN\t${r.type}\t${r.content}\n`;
      }
    });

    const blob = new Blob([bind], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDomain}.zone`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: 'Zone File Exported',
      message: `Downloaded ${selectedDomain}.zone (RFC 1035 format)`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            DNS Zone Management (BIND 9)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Authoritative DNS record definitions, TTL intervals, and DKIM/SPF delegations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportZone}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BIND Zone</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add DNS Record</span>
          </button>
        </div>
      </div>

      {/* Domain Selector & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Target Zone:</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
          >
            {domains.map((d) => (
              <option key={d.id} value={d.domain}>
                {d.domain}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records in zone..."
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* DNS Records Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-sans font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Host / Name</th>
                <th className="py-3 px-4">Value / Target</th>
                <th className="py-3 px-4">TTL (s)</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {domainRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-sans">
                    No DNS records found for this domain.
                  </td>
                </tr>
              ) : (
                domainRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                        {rec.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">{rec.name}</td>

                    <td className="py-3 px-4 text-neutral-300 truncate max-w-md">{rec.content}</td>

                    <td className="py-3 px-4 text-neutral-400 tabular-nums">{rec.ttl}</td>

                    <td className="py-3 px-4 text-neutral-400">
                      {rec.priority !== undefined ? rec.priority : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => deleteDnsRecord(rec.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete DNS Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add DNS Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Add Record to {selectedDomain}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Type</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  >
                    {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'CAA'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">TTL (Seconds)</label>
                  <input
                    type="number"
                    value={recordTtl}
                    onChange={(e) => setRecordTtl(Number(e.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Host Name (@ for root)</label>
                <input
                  type="text"
                  required
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Record Content / Value</label>
                <input
                  type="text"
                  required
                  placeholder={
                    recordType === 'A'
                      ? '192.241.144.18'
                      : recordType === 'CNAME'
                      ? 'blackvs.cloud'
                      : 'v=spf1 ...'
                  }
                  value={recordContent}
                  onChange={(e) => setRecordContent(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              {recordType === 'MX' && (
                <div>
                  <label className="block text-neutral-400 mb-1">Priority (Preference)</label>
                  <input
                    type="number"
                    value={recordPriority}
                    onChange={(e) => setRecordPriority(Number(e.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
