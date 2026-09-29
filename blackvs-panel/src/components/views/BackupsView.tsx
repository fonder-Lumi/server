import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Archive,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Cloud,
  HardDrive,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { BackupItem } from '../../types';

export const BackupsView: React.FC = () => {
  const { backups, createBackup, deleteBackup, addToast } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showS3Modal, setShowS3Modal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);

  // Create Backup state
  const [backupType, setBackupType] = useState<'Full System' | 'Home Directory' | 'MySQL Only'>('Full System');
  const [storageLoc, setStorageLoc] = useState<'Local SSD' | 'Amazon S3' | 'Wasabi Cloud'>('Amazon S3');

  // S3 Config state
  const [s3Bucket, setS3Bucket] = useState('blackvs-backups-production-us');
  const [s3Region, setS3Region] = useState('us-east-1');
  const [s3KeyId, setS3KeyId] = useState('AKIAIOSFODNN7EXAMPLE');

  const handleStartBackup = (e: React.FormEvent) => {
    e.preventDefault();
    createBackup(backupType, storageLoc);
    setShowCreateModal(false);
  };

  const handleRestore = () => {
    if (!selectedBackup) return;
    setShowRestoreModal(false);
    addToast({
      title: 'Point-in-Time Restore Started',
      message: `Extracting ${selectedBackup.filename}. VirtualHosts and databases entering maintenance mode...`,
      type: 'warning',
    });

    setTimeout(() => {
      addToast({
        title: 'System Restored Successfully',
        message: `Restore point from ${selectedBackup.created} applied. Services reloaded.`,
        type: 'success',
      });
    }, 2500);
  };

  const handleDownload = (backup: BackupItem) => {
    const dummy = `BlackVs Backup Binary Data: ${backup.filename}\nType: ${backup.type}\nCreated: ${backup.created}\n`;
    const blob = new Blob([dummy], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: 'Snapshot Download Started',
      message: `Downloading ${backup.filename} (${backup.sizeMB} MB)`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Backups & Disaster Recovery
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Automated tar.gz archives, MySQL dumps, and encrypted Amazon S3 offsite synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowS3Modal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>S3 Configuration</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Snapshot</span>
          </button>
        </div>
      </div>

      {/* Backup Schedule Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 space-y-1 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Automated Schedule</span>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-semibold text-white">Daily at 03:00 AM UTC</div>
          <div className="text-[11px] text-neutral-500 font-mono">Retention policy: 14 daily, 4 weekly</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-1 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Primary Offsite Target</span>
            <Cloud className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-base font-semibold text-white">Amazon S3 Standard</div>
          <div className="text-[11px] text-neutral-500 font-mono">Bucket: {s3Bucket}</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-1 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Archive Encryption</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-semibold text-white">AES-256-GCM Active</div>
          <div className="text-[11px] text-neutral-500 font-mono">End-to-end zero-knowledge passkey</div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Archive Filename</th>
                <th className="py-3 px-4">Backup Scope</th>
                <th className="py-3 px-4">Storage Vault</th>
                <th className="py-3 px-4 text-right">Compressed Size</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4">Integrity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {backups.map((bk) => (
                <tr key={bk.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold truncate max-w-xs">{bk.filename}</span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-300">
                    {bk.type}
                  </td>

                  <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                    {bk.storageLocation}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-300">
                    {bk.sizeMB >= 1024
                      ? `${(bk.sizeMB / 1024).toFixed(2)} GB`
                      : `${bk.sizeMB} MB`}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px] tabular-nums">
                    {bk.created}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SHA256 OK
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedBackup(bk);
                          setShowRestoreModal(true);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Restore Snapshot"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(bk)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Download Archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBackup(bk.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Purge Snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Create Instant Server Snapshot</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleStartBackup} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Backup Scope</label>
                <div className="space-y-2">
                  {[
                    { id: 'Full System', label: 'Full System Snapshot', desc: 'All virtualhosts, public_html, databases, emails & configs' },
                    { id: 'Home Directory', label: 'Home Directory Only', desc: '/home/blackvs web applications and media assets' },
                    { id: 'MySQL Only', label: 'MySQL Databases Only', desc: 'All InnoDB and MyISAM schemas in gzip format' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setBackupType(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        backupType === item.id
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/10 text-neutral-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold text-white">{item.label}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Storage Destination</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Amazon S3', 'Local SSD', 'Wasabi Cloud'] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setStorageLoc(loc)}
                      className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-colors ${
                        storageLoc === loc
                          ? 'border-white bg-white/15 text-white font-semibold'
                          : 'border-white/10 text-neutral-400 hover:bg-white/5'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Generate Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Restore Point-in-Time Snapshot</h3>
                <p className="text-xs text-neutral-400">{selectedBackup.filename}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Applying this restore will overwrite current filesystem contents and restore MySQL databases to the state at <span className="font-mono text-white">{selectedBackup.created}</span>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                Proceed with Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* S3 Settings Modal */}
      {showS3Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Amazon S3 Remote Storage Vault</h3>
              <button onClick={() => setShowS3Modal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">S3 Bucket Name</label>
                <input
                  type="text"
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">AWS Cloud Region</label>
                <input
                  type="text"
                  value={s3Region}
                  onChange={(e) => setS3Region(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">AWS Access Key ID</label>
                <input
                  type="text"
                  value={s3KeyId}
                  onChange={(e) => setS3KeyId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setShowS3Modal(false);
                  addToast({ title: 'S3 Credentials Saved', message: 'AWS SDK connected to bucket', type: 'success' });
                }}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl"
              >
                Save S3 Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
