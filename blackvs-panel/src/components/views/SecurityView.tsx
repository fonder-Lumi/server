import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  QrCode,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { addToast } = useApp();

  const [wafEnabled, setWafEnabled] = useState(true);
  const [paranoiaLevel, setParanoiaLevel] = useState<1 | 2 | 3 | 4>(2);
  const [disablePasswordAuth, setDisablePasswordAuth] = useState(true);
  const [sshPort, setSshPort] = useState('22');

  const [blockedIps, setBlockedIps] = useState([
    { id: 'ip-1', ip: '185.220.101.5', reason: 'Brute-force SSH attack detected', date: '2026-09-27 20:07' },
    { id: 'ip-2', ip: '45.154.255.88', reason: 'OWASP SQLi rule 942100 triggered', date: '2026-09-26 14:12' },
    { id: 'ip-3', ip: '194.26.29.112', reason: 'Path traversal attempt /etc/passwd', date: '2026-09-24 09:30' },
  ]);

  const [sshKeys, setSshKeys] = useState([
    { id: 'key-1', name: 'Alexander MBP M3 (ED25519)', fingerprint: 'SHA256:7mP42...vQ9z', added: '2025-01-14' },
    { id: 'key-2', name: 'CI/CD GitHub Actions Worker', fingerprint: 'SHA256:K9vX9...82mL', added: '2025-02-04' },
  ]);

  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [show2faModal, setShow2faModal] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newIpReason, setNewIpReason] = useState('Manual security block');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyContent, setNewKeyContent] = useState('');

  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    setBlockedIps((prev) => [
      {
        id: `ip-${Date.now()}`,
        ip: newIp.trim(),
        reason: newIpReason,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    ]);
    setShowAddIpModal(false);
    setNewIp('');
    addToast({
      title: 'IP Address Blacklisted',
      message: `iptables -A INPUT -s ${newIp.trim()} -j DROP applied`,
      type: 'warning',
    });
  };

  const handleUnblock = (id: string, ip: string) => {
    setBlockedIps((prev) => prev.filter((i) => i.id !== id));
    addToast({
      title: 'IP Rule Revoked',
      message: `${ip} removed from iptables / UFW firewall`,
      type: 'info',
    });
  };

  const handleAddSshKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newKeyContent.trim()) return;

    setSshKeys((prev) => [
      ...prev,
      {
        id: `key-${Date.now()}`,
        name: newKeyName.trim(),
        fingerprint: 'SHA256:' + Math.random().toString(36).substring(2, 10),
        added: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowAddKeyModal(false);
    setNewKeyName('');
    setNewKeyContent('');
    addToast({
      title: 'Public Key Appended',
      message: 'Appended to /home/blackvs/.ssh/authorized_keys',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Security & Threat Defense Suite
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            ModSecurity WAF, OWASP Core Rules, UFW packet filtering, and SSH hardening
          </p>
        </div>

        <button
          onClick={() => setShow2faModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Configure 2FA (TOTP)</span>
        </button>
      </div>

      {/* ModSecurity WAF Status Card */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.05] text-white border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">ModSecurity v3 Web Application Firewall</div>
              <div className="text-xs text-neutral-400 font-mono">
                OWASP Core Rule Set (CRS 3.3.4) · Real-time SQLi, XSS & RCE Inspection
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setWafEnabled(!wafEnabled);
              addToast({
                title: 'WAF State Changed',
                message: !wafEnabled ? 'ModSecurity engine active' : 'ModSecurity bypass mode active',
                type: 'info',
              });
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
              wafEnabled ? 'bg-white' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                wafEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-neutral-400">
            Sensitivity Paranoia Level: <span className="font-semibold text-white">Level {paranoiaLevel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setParanoiaLevel(lvl);
                  addToast({ title: 'CRS Paranoia Level Set', message: `Level ${lvl} active`, type: 'info' });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                  paranoiaLevel === lvl
                    ? 'border-white bg-white text-black font-semibold'
                    : 'border-white/10 text-neutral-400 hover:bg-white/5'
                }`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: IP Firewall + SSH Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Blocker */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">IP Firewall Blacklist</h2>
                <p className="text-xs text-neutral-400">Drop packets from malicious hosts at kernel layer</p>
              </div>
              <button
                onClick={() => setShowAddIpModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Block IP</span>
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] font-mono text-xs">
              {blockedIps.map((b) => (
                <div key={b.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <div className="font-semibold text-white">{b.ip}</div>
                    <div className="text-[11px] text-neutral-500 font-sans truncate">{b.reason}</div>
                  </div>
                  <button
                    onClick={() => handleUnblock(b.id, b.ip)}
                    className="p-1 rounded text-neutral-500 hover:text-white hover:bg-white/10 shrink-0"
                    title="Revoke Block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SSH Keys & Hardening */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">SSH Access & Key Vault</h2>
                <p className="text-xs text-neutral-400">Public key authorization only (OpenSSH 9.6p1)</p>
              </div>
              <button
                onClick={() => setShowAddKeyModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SSH Key</span>
              </button>
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              {sshKeys.map((k) => (
                <div key={k.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-white">{k.name}</div>
                    <div className="text-[11px] font-mono text-neutral-500">{k.fingerprint}</div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{k.added}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-neutral-400">Password Authentication:</span>
            <span className="font-mono text-emerald-400">Disabled (Enforced Key-Only)</span>
          </div>
        </div>
      </div>

      {/* Add IP Modal */}
      {showAddIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white">Block Inbound IP Address</h3>
            <form onSubmit={handleBlockIp} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">IPv4 or CIDR Notation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 198.51.100.42 or 198.51.100.0/24"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reason / Reference</label>
                <input
                  type="text"
                  value={newIpReason}
                  onChange={(e) => setNewIpReason(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIpModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
                >
                  Blacklist IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add SSH Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white">Add Authorized SSH Public Key</h3>
            <form onSubmit={handleAddSshKey} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Key Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workstation Laptop (id_ed25519)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Public Key (ssh-ed25519 or ssh-rsa)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
                  value={newKeyContent}
                  onChange={(e) => setNewKeyContent(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-mono text-[11px] text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Authorize Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white">Two-Factor Authentication (TOTP)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Scan this QR code using Google Authenticator, 1Password, or Apple Keychain to protect control panel access.
            </p>

            <div className="flex items-center justify-center p-6 bg-white rounded-2xl w-48 h-48 mx-auto">
              {/* Minimal SVG QR code visual */}
              <div className="w-full h-full border-4 border-black p-2 grid grid-cols-5 grid-rows-5 gap-1">
                <div className="bg-black" />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div className="bg-black" />
                <div className="bg-black" />
                <div />
                <div className="bg-black" />
                <div className="bg-black" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] text-center font-mono text-xs text-neutral-300">
              Secret: JBSWY3DPEHPK3PXP
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShow2faModal(false);
                  addToast({ title: '2FA Enforced', message: 'TOTP authentication active on root session', type: 'success' });
                }}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
