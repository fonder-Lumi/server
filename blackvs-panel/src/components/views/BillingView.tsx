import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Key,
  Users,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Palette,
} from 'lucide-react';
import { UserRole, ThemeMode } from '../../types';

export const BillingView: React.FC = () => {
  const { userProfile, setUserRole, addToast, theme, setTheme } = useApp();

  const [apiTokens, setApiTokens] = useState([
    { id: 'tok-1', name: 'DevOps Orchestration Token', token: 'bvs_pat_9a82f0...42e', created: '2026-08-01', scope: 'Full Access' },
    { id: 'tok-2', name: 'Datadog Monitoring Exporter', token: 'bvs_pat_1120aa...89b', created: '2026-09-10', scope: 'Read-Only Telemetry' },
  ]);

  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenScope, setNewTokenScope] = useState('Full Access');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const teamMembers = [
    { name: 'Alexander Vance', email: 'bxserver495@gmail.com', role: 'root' as UserRole, label: 'Root Administrator' },
    { name: 'Elena Rostova', email: 'elena@blackvs.cloud', role: 'dev' as UserRole, label: 'Infrastructure Developer' },
    { name: 'Marcus Finch', email: 'marcus@blackvs.cloud', role: 'owner' as UserRole, label: 'Account Owner' },
  ];

  const themeList: { id: ThemeMode; name: string; desc: string; sample: string }[] = [
    { id: 'obsidian', name: 'Obsidian Dark', desc: 'Zinc-950 backdrop with subtle glass borders', sample: 'bg-zinc-900 border-zinc-700' },
    { id: 'midnight', name: 'OLED Midnight', desc: 'Pure black (#000000) for OLED panels', sample: 'bg-black border-neutral-800' },
    { id: 'slate', name: 'Slate Gray', desc: 'Space gray cool blue slate atmosphere', sample: 'bg-slate-900 border-slate-700' },
    { id: 'light', name: 'Titanium Light', desc: 'Clean bright studio white and titanium', sample: 'bg-white border-neutral-300' },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const raw = 'bvs_pat_' + Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 6);
    setApiTokens((prev) => [
      ...prev,
      {
        id: `tok-${Date.now()}`,
        name: newTokenName.trim(),
        token: raw,
        created: new Date().toISOString().split('T')[0],
        scope: newTokenScope,
      },
    ]);
    setShowAddTokenModal(false);
    setNewTokenName('');
    addToast({
      title: 'API Token Generated',
      message: 'New personal access token created for BlackVs REST API v2',
      type: 'success',
    });
  };

  const handleDeleteToken = (id: string) => {
    setApiTokens((prev) => prev.filter((t) => t.id !== id));
    addToast({ title: 'API Token Revoked', message: 'Token purged from auth cache', type: 'info' });
  };

  const handleDownloadInvoice = (invNum: string) => {
    const content = `BlackVs Cloud Infrastructure Invoice: ${invNum}\nAmount: $189.00 USD\nPaid via Visa ending in 4242\nStatus: Paid\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${invNum}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ title: 'Invoice Downloaded', message: `Exported ${invNum}`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--app-fg)] tracking-tight">
            Billing, Appearance & Team Governance
          </h1>
          <p className="text-xs sm:text-sm text-[var(--app-fg-muted)]">
            Dedicated Bare Metal subscription plan, UI theme configuration, REST API keys, and RBAC
          </p>
        </div>

        <button
          onClick={() => setShowAddTokenModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[var(--app-btn-primary-fg)] bg-[var(--app-btn-primary-bg)] hover:opacity-90 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate API Token</span>
        </button>
      </div>

      {/* Subscription Plan Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[var(--app-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--app-fg-muted)] uppercase tracking-wider">
              Current Active Tier
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUTOPAY ON
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--app-fg)] tracking-tight">
            BlackVs Metal Dedicated Server — Dual AMD EPYC
          </h2>
          <p className="text-xs text-[var(--app-fg-muted)]">
            16 vCPU Cores · 64 GB ECC RAM · 960 GB NVMe Storage · 20 TB Bandwidth / mo
          </p>
        </div>

        <div className="text-left md:text-right space-y-1">
          <div className="text-2xl font-bold text-[var(--app-fg)] font-mono">$189.00 <span className="text-xs font-sans text-[var(--app-fg-muted)] font-normal">/ month</span></div>
          <div className="text-xs text-[var(--app-fg-muted)]">Next renewal: October 14, 2026</div>
          <div className="text-[11px] text-[var(--app-fg-subtle)] font-mono">Billed to Visa ending in •••• 4242</div>
        </div>
      </div>

      {/* Theme Selection Section */}
      <div className="glass-panel rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-fg)] flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              Theme & Appearance Customization
            </h3>
            <p className="text-xs text-[var(--app-fg-muted)]">Select your preferred color profile. Applied instantly across all views and panels.</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[var(--app-input-bg)] border border-[var(--app-border)] text-[var(--app-fg)]">
            Current: {theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {themeList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  addToast({ title: 'Theme Updated', message: `Applied ${t.name}`, type: 'info' });
                }}
                className={`p-4 rounded-xl text-left border transition-all ${t.sample} ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[var(--app-bg)] shadow-md'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">{t.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] opacity-70 leading-relaxed">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Columns: API Tokens + Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Tokens */}
        <div className="glass-panel rounded-2xl p-5 border border-[var(--app-border)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-fg)]">REST API Automation Tokens</h3>
              <p className="text-xs text-[var(--app-fg-muted)]">Bearer tokens for Terraform and remote orchestration</p>
            </div>
            <Key className="w-4 h-4 text-[var(--app-fg-muted)]" />
          </div>

          <div className="divide-y divide-[var(--app-border)]/50 text-xs">
            {apiTokens.map((tok) => (
              <div key={tok.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-[var(--app-fg)]">{tok.name}</div>
                  <div className="text-[11px] font-mono text-[var(--app-fg-muted)] mt-0.5">{tok.token}</div>
                  <div className="text-[10px] text-[var(--app-fg-subtle)] mt-0.5">{tok.scope} · Created {tok.created}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(tok.token, tok.id)}
                    className="p-1.5 rounded-lg text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/5 transition-colors"
                    title="Copy Token"
                  >
                    {copiedToken === tok.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteToken(tok.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Revoke Token"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="glass-panel rounded-2xl p-5 border border-[var(--app-border)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-fg)]">Invoices & Statements</h3>
              <p className="text-xs text-[var(--app-fg-muted)]">Monthly billing receipts with VAT/Tax details</p>
            </div>
            <CreditCard className="w-4 h-4 text-[var(--app-fg-muted)]" />
          </div>

          <div className="divide-y divide-[var(--app-border)]/50 text-xs">
            {[
              { id: 'INV-2026-09', date: 'Sep 14, 2026', amount: '$189.00', status: 'Paid' },
              { id: 'INV-2026-08', date: 'Aug 14, 2026', amount: '$189.00', status: 'Paid' },
              { id: 'INV-2026-07', date: 'Jul 14, 2026', amount: '$189.00', status: 'Paid' },
            ].map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium text-[var(--app-fg)]">{inv.id}</div>
                  <div className="text-[11px] text-[var(--app-fg-subtle)] font-mono">{inv.date}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-[var(--app-fg)] font-medium">{inv.amount}</div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">{inv.status}</span>
                  </div>

                  <button
                    onClick={() => handleDownloadInvoice(inv.id)}
                    className="p-1.5 rounded-lg text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/5 transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members & Role Switcher */}
      <div className="glass-panel rounded-2xl p-5 border border-[var(--app-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-fg)]">Team Access & RBAC Directory</h3>
            <p className="text-xs text-[var(--app-fg-muted)]">Users with administrative delegation on this cluster</p>
          </div>
          <Users className="w-4 h-4 text-[var(--app-fg-muted)]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--app-border)] text-[11px] font-medium text-[var(--app-fg-muted)] uppercase tracking-wider">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">2FA Status</th>
                <th className="py-2.5 px-3 text-right">Switch Active Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]/40">
              {teamMembers.map((member) => (
                <tr key={member.email} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[var(--app-fg)]">{member.name}</div>
                    <div className="text-[11px] font-mono text-[var(--app-fg-subtle)]">{member.email}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[var(--app-fg-muted)]">
                    {member.label}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ENFORCED
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setUserRole(member.role)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        userProfile.role === member.role
                          ? 'bg-[var(--app-btn-primary-bg)] text-[var(--app-btn-primary-fg)] font-semibold'
                          : 'bg-white/5 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/10'
                      }`}
                    >
                      {userProfile.role === member.role ? 'Active Context' : 'Elevate Session'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Token Modal */}
      {showAddTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-[var(--app-border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--app-fg)]">Generate Personal Access Token</h3>
            <form onSubmit={handleCreateToken} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--app-fg-muted)] mb-1">Token Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Terraform Cluster Orchestration"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  className="w-full bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[var(--app-fg)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--app-fg-muted)] mb-1">Permission Scope</label>
                <select
                  value={newTokenScope}
                  onChange={(e) => setNewTokenScope(e.target.value)}
                  className="w-full bg-neutral-900 border border-[var(--app-border)] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                >
                  <option value="Full Access">Full Cluster Control (Root Equivalent)</option>
                  <option value="VirtualHosts Only">VirtualHosts & DNS Only</option>
                  <option value="Read-Only Telemetry">Read-Only Telemetry & Health Checks</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTokenModal(false)}
                  className="px-4 py-2 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-[var(--app-btn-primary-fg)] bg-[var(--app-btn-primary-bg)] hover:opacity-90 rounded-xl"
                >
                  Create Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
