import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HardDrive,
  Plus,
  Trash2,
  Download,
  Key,
  Folder,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { FtpAccountItem } from '../../types';

export const FtpAccountsView: React.FC = () => {
  const { ftpAccounts, addFtpAccount, deleteFtpAccount, addToast, currentNode } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDir, setNewDir] = useState('/home/blackvs/public_html');
  const [newQuota, setNewQuota] = useState(0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    addFtpAccount({
      username: newUsername.trim().toLowerCase(),
      directory: newDir.trim(),
      quotaMB: newQuota,
      status: 'active',
    });

    setShowAddModal(false);
    setNewUsername('');
  };

  const handleDownloadFileZilla = (acc: FtpAccountItem) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FileZilla3 version="3.66.5" platform="mac">
  <Servers>
    <Server>
      <Host>${currentNode.ip}</Host>
      <Port>21</Port>
      <Protocol>0</Protocol>
      <Type>0</Type>
      <User>${acc.username}</User>
      <Logontype>1</Logontype>
      <TimezoneOffset>0</TimezoneOffset>
      <RemoteDir>${acc.directory}</RemoteDir>
    </Server>
  </Servers>
</FileZilla3>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filezilla_${acc.username}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: 'Config Exported',
      message: `Downloaded FileZilla XML profile for ${acc.username}`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            FTP & SFTP Access Accounts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Secure vsftpd & OpenSSH chroot directory isolation accounts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add FTP User</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-3 text-xs border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/[0.05] text-neutral-200 border border-white/10">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-white">Default Connection Endpoints</div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Host: {currentNode.ip} · FTPS Port: 21 (Explicit TLS) · SFTP Port: 22 (SSH)
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              <th className="py-3 px-4">FTP Username</th>
              <th className="py-3 px-4">Chroot Directory Path</th>
              <th className="py-3 px-4">Disk Quota</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Configs</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {ftpAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-semibold">{acc.username}</span>
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-300 text-[11px]">
                  {acc.directory}
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                  {acc.quotaMB === 0 ? 'Unlimited' : `${acc.quotaMB} MB`}
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDownloadFileZilla(acc)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>FileZilla XML</span>
                  </button>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => deleteFtpAccount(acc.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Revoke FTP User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add FTP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Create FTP / SFTP User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">FTP Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. staging_deployer"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Chroot Isolated Directory</label>
                <input
                  type="text"
                  required
                  value={newDir}
                  onChange={(e) => setNewDir(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Quota (MB, 0 for Unlimited)</label>
                <input
                  type="number"
                  value={newQuota}
                  onChange={(e) => setNewQuota(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
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
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
