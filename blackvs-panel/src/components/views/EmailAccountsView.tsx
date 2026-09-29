import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Settings,
  HardDrive,
  Copy,
  Check,
  Search,
  Send,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { EmailItem } from '../../types';

export const EmailAccountsView: React.FC = () => {
  const { emails, domains, addEmail, deleteEmail, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClientConfigModal, setShowClientConfigModal] = useState(false);
  const [showWebmailModal, setShowWebmailModal] = useState(false);
  const [activeConfigEmail, setActiveConfigEmail] = useState<EmailItem | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<EmailItem | null>(null);

  // New Email form
  const [newUser, setNewUser] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.domain || 'blackvs.cloud');
  const [quotaMB, setQuotaMB] = useState(5000);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim()) return;

    const fullAddress = `${newUser.trim().toLowerCase()}@${selectedDomain}`;
    addEmail({
      address: fullAddress,
      domain: selectedDomain,
      quotaUsedMB: 12,
      quotaLimitMB: quotaMB,
      status: 'active',
    });

    setShowAddModal(false);
    setNewUser('');
  };

  const filteredEmails = emails.filter((e) =>
    e.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Email Accounts & Routing
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Postfix MTA & Dovecot IMAP/POP3 mailboxes with DKIM & SPF encryption
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Mailbox</span>
        </button>
      </div>

      {/* Security Health Ribbon */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-white">Email Authentication Status: Nominal</div>
            <div className="text-[11px] text-neutral-400 font-mono">
              SPF: Pass · DKIM 2048-bit: Signed · DMARC: p=quarantine active
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            addToast({
              title: 'DNS Records Validated',
              message: 'MX and TXT security records resolving correctly on port 25/587',
              type: 'success',
            })
          }
          className="text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors self-start sm:self-auto"
        >
          Verify MX Records
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter email addresses..."
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
        />
      </div>

      {/* Email Accounts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Quota & Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No email mailboxes found.
                  </td>
                </tr>
              ) : (
                filteredEmails.map((em) => {
                  const usagePercent = Math.min(100, (em.quotaUsedMB / em.quotaLimitMB) * 100);
                  return (
                    <tr key={em.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold">{em.address}</span>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {em.domain}
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-48 space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                            <span>{em.quotaUsedMB} MB</span>
                            <span>{em.quotaLimitMB} MB</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercent > 85 ? 'bg-rose-500' : 'bg-white'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {em.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {em.created}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setActiveConfigEmail(em);
                              setShowWebmailModal(true);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Launch Webmail"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveConfigEmail(em);
                              setShowClientConfigModal(true);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Client Configuration (Apple Mail / Thunderbird)"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEmailToDelete(em)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Mailbox"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webmail Modal Preview */}
      {showWebmailModal && activeConfigEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl h-[75vh] rounded-2xl glass-dropdown border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="h-12 px-4 border-b border-white/10 bg-neutral-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white">BlackVs Webmail Client</span>
                <span className="text-xs font-mono text-neutral-400">({activeConfigEmail.address})</span>
              </div>
              <button
                onClick={() => setShowWebmailModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-48 border-r border-white/10 p-3 space-y-1 text-xs">
                <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium">
                  <span>Inbox</span>
                  <span className="font-mono text-[10px]">3</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white">
                  <span>Sent</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white">
                  <span>Drafts</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white">
                  <span>Junk / Spam</span>
                </button>
              </div>

              <div className="flex-1 divide-y divide-white/[0.06] overflow-y-auto">
                {[
                  {
                    sender: 'Cloudflare Security',
                    subject: 'Weekly DNS & WAF Mitigation Summary',
                    time: '11:20 AM',
                    snippet: '0 threats detected across your zone in the past 7 days.',
                  },
                  {
                    sender: "Let's Encrypt CA",
                    subject: 'Certificate Renewal Notice for *.blackvs.cloud',
                    time: 'Yesterday',
                    snippet: 'Your certificate has been automatically provisioned.',
                  },
                  {
                    sender: 'GitHub Octocat',
                    subject: '[Deploy] Successful deployment to production',
                    time: 'Sep 25',
                    snippet: 'Alexander Vance pushed commit 7f91a4b to main.',
                  },
                ].map((msg, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <div className="flex justify-between text-xs font-medium text-white mb-0.5">
                      <span>{msg.sender}</span>
                      <span className="font-mono text-[11px] text-neutral-500">{msg.time}</span>
                    </div>
                    <div className="text-xs text-neutral-300 font-medium">{msg.subject}</div>
                    <div className="text-[11px] text-neutral-500 truncate mt-0.5">{msg.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Configuration Modal */}
      {showClientConfigModal && activeConfigEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Manual Mail Client Setup</h3>
              <button onClick={() => setShowClientConfigModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="text-neutral-400 text-[11px] font-sans">Username / Account:</div>
                <div className="text-white flex items-center justify-between">
                  <span>{activeConfigEmail.address}</span>
                  <button onClick={() => handleCopy(activeConfigEmail.address, 'user')} className="text-neutral-500 hover:text-white">
                    {copiedKey === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="text-neutral-400 text-[11px] font-sans">Incoming Server (IMAP):</div>
                <div className="text-white flex items-center justify-between">
                  <span>mail.{activeConfigEmail.domain} · Port 993 (SSL/TLS)</span>
                  <button onClick={() => handleCopy(`mail.${activeConfigEmail.domain}`, 'imap')} className="text-neutral-500 hover:text-white">
                    {copiedKey === 'imap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="text-neutral-400 text-[11px] font-sans">Outgoing Server (SMTP):</div>
                <div className="text-white flex items-center justify-between">
                  <span>mail.{activeConfigEmail.domain} · Port 465 (SSL/TLS)</span>
                  <button onClick={() => handleCopy(`mail.${activeConfigEmail.domain}`, 'smtp')} className="text-neutral-500 hover:text-white">
                    {copiedKey === 'smtp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClientConfigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Mailbox Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Create Email Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmail} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Email Address</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="support"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="w-full bg-white/[0.04] border border-r-0 border-white/10 rounded-l-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/30"
                  />
                  <span className="px-2 py-2 bg-neutral-900 border border-white/10 text-neutral-400 font-mono">
                    @
                  </span>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="bg-neutral-900 border border-l-0 border-white/10 rounded-r-xl px-2 py-2 text-white font-mono focus:outline-none"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.domain}>
                        {d.domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Storage Quota</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2000, 5000, 10000].map((mb) => (
                    <button
                      key={mb}
                      type="button"
                      onClick={() => setQuotaMB(mb)}
                      className={`py-2 rounded-xl border text-center font-mono transition-colors ${
                        quotaMB === mb
                          ? 'border-white bg-white/15 text-white font-semibold'
                          : 'border-white/10 text-neutral-400 hover:bg-white/5'
                      }`}
                    >
                      {mb >= 1000 ? `${mb / 1000} GB` : `${mb} MB`}
                    </button>
                  ))}
                </div>
              </div>

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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Email Modal */}
      {emailToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete Email Mailbox</h3>
                <p className="text-xs text-neutral-400">{emailToDelete.address}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete <span className="font-mono text-white">{emailToDelete.address}</span>? All stored mail messages, folders, and IMAP credentials will be purged permanently.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEmailToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteEmail(emailToDelete.id);
                  setEmailToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
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
