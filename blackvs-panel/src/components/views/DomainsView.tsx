import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Plus,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Network,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { DomainItem } from '../../types';

export const DomainsView: React.FC = () => {
  const {
    domains,
    addDomain,
    deleteDomain,
    toggleDomainStatus,
    setActiveTab,
    setCurrentPath,
    addToast,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<DomainItem | null>(null);

  // Form state
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainType, setNewDomainType] = useState<'primary' | 'subdomain' | 'redirect'>('primary');
  const [newDocRoot, setNewDocRoot] = useState('');
  const [newPhpVersion, setNewPhpVersion] = useState('PHP 8.3-FPM');
  const [autoSsl, setAutoSsl] = useState(true);
  const [redirectTarget, setRedirectTarget] = useState('');

  const handleDomainNameChange = (val: string) => {
    setNewDomainName(val);
    if (newDomainType !== 'redirect') {
      const sanitized = val.toLowerCase().replace(/[^a-z0-9.-]/g, '');
      setNewDocRoot(`/home/blackvs/${sanitized}`);
    }
  };

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) {
      addToast({ title: 'Validation Error', message: 'Domain name is required', type: 'error' });
      return;
    }

    addDomain({
      domain: newDomainName.trim().toLowerCase(),
      type: newDomainType,
      documentRoot: newDomainType === 'redirect' ? '/home/blackvs/redirects' : (newDocRoot || `/home/blackvs/${newDomainName}`),
      phpVersion: newDomainType === 'redirect' ? 'N/A' : newPhpVersion,
      sslActive: autoSsl,
      sslIssuer: autoSsl ? "Let's Encrypt Authority X3" : 'None',
      sslExpiryDays: autoSsl ? 90 : 0,
      redirectUrl: newDomainType === 'redirect' ? redirectTarget : undefined,
      bandwidthMB: 0,
      status: 'active',
    });

    setShowAddModal(false);
    setNewDomainName('');
    setNewDocRoot('');
    setRedirectTarget('');
  };

  const filteredDomains = domains.filter((d) => {
    const matchesFilter = filterType === 'all' || d.type === filterType;
    const matchesSearch =
      d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.documentRoot.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Domains & VirtualHosts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Configure web roots, PHP handlers, Let's Encrypt TLS and reverse proxies
          </p>
        </div>

        <button
          onClick={() => {
            setNewDomainName('');
            setNewDocRoot('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Domain</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl self-start">
          {[
            { id: 'all', label: 'All Domains' },
            { id: 'primary', label: 'Primary' },
            { id: 'subdomain', label: 'Subdomains' },
            { id: 'redirect', label: 'Redirects' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain or root path..."
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Domains Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Document Root</th>
                <th className="py-3 px-4">Runtime Engine</th>
                <th className="py-3 px-4">SSL / TLS</th>
                <th className="py-3 px-4 text-right">Bandwidth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No domains found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDomains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            dom.status === 'active' ? 'bg-emerald-400' : 'bg-neutral-600'
                          }`}
                        />
                        <span className="font-semibold">{dom.domain}</span>
                        {dom.status === 'suspended' && (
                          <span className="text-[10px] text-neutral-400 font-mono">(Suspended)</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400">
                      <span className="capitalize">{dom.type}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {dom.type === 'redirect' ? (
                        <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                          <ArrowRight className="w-3 h-3 text-neutral-500" />
                          <span>{dom.redirectUrl}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentPath(dom.documentRoot);
                            setActiveTab('file-manager');
                          }}
                          className="flex items-center gap-1.5 text-neutral-300 hover:text-white font-mono text-[11px] hover:underline"
                          title="Open in File Manager"
                        >
                          <FolderOpen className="w-3 h-3 text-neutral-500" />
                          <span className="truncate max-w-[180px]">{dom.documentRoot}</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-300 text-[11px]">
                      {dom.phpVersion}
                    </td>

                    <td className="py-3.5 px-4">
                      {dom.sslActive ? (
                        <button
                          onClick={() => setActiveTab('ssl')}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[11px] font-mono"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>TLS Active ({dom.sslExpiryDays}d)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('ssl')}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px] font-mono"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>No SSL</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-300">
                      {(dom.bandwidthMB / 1024).toFixed(2)} GB
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleDomainStatus(dom.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                          title={dom.status === 'active' ? 'Suspend Domain' : 'Activate Domain'}
                        >
                          {dom.status === 'active' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('dns')}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Manage DNS Records"
                        >
                          <Network className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDomainToDelete(dom)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-dropdown p-6 border border-white/10 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white">Add New Domain / VirtualHost</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDomain} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Domain Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['primary', 'subdomain', 'redirect'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewDomainType(type)}
                      className={`py-2 px-3 rounded-xl border text-center capitalize transition-colors ${
                        newDomainType === type
                          ? 'border-white bg-white/10 text-white font-medium'
                          : 'border-white/10 text-neutral-400 hover:bg-white/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Domain Name (FQDN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. app.domain.com"
                  value={newDomainName}
                  onChange={(e) => handleDomainNameChange(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-white font-mono placeholder:text-neutral-600 focus:outline-none"
                />
              </div>

              {newDomainType === 'redirect' ? (
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Destination Redirect URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/target"
                    value={redirectTarget}
                    onChange={(e) => setRedirectTarget(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-white font-mono placeholder:text-neutral-600 focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Document Root</label>
                    <input
                      type="text"
                      required
                      value={newDocRoot}
                      onChange={(e) => setNewDocRoot(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">PHP / Engine Version</label>
                    <select
                      value={newPhpVersion}
                      onChange={(e) => setNewPhpVersion(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    >
                      <option value="PHP 8.3-FPM">PHP 8.3-FPM (Default)</option>
                      <option value="PHP 8.4-FPM (JIT)">PHP 8.4-FPM (JIT Enabled)</option>
                      <option value="PHP 8.2-FPM">PHP 8.2-FPM</option>
                      <option value="PHP 8.1-FPM">PHP 8.1-FPM</option>
                      <option value="Node.js 20.14 (PM2)">Node.js 20.14 LTS (PM2)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="autoSsl"
                      checked={autoSsl}
                      onChange={(e) => setAutoSsl(e.target.checked)}
                      className="rounded border-white/20 bg-neutral-800 text-white focus:ring-0"
                    />
                    <label htmlFor="autoSsl" className="text-neutral-300">
                      Issue automated Let's Encrypt TLS 1.3 certificate with auto-renewal
                    </label>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Create VirtualHost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete Domain VirtualHost</h3>
                <p className="text-xs text-neutral-400">{domainToDelete.domain}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove <span className="font-mono text-white">{domainToDelete.domain}</span>? Nginx virtualhost configuration, SSL bindings, and DNS records will be purged. (Files in <span className="font-mono text-neutral-400">{domainToDelete.documentRoot}</span> will not be deleted).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDomainToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDomain(domainToDelete.id);
                  setDomainToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
