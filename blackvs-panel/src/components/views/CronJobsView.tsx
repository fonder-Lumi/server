import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { CronJobItem } from '../../types';

export const CronJobsView: React.FC = () => {
  const { cronJobs, addCronJob, toggleCronJob, deleteCronJob, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [schedule, setSchedule] = useState('0 3 * * *');
  const [scheduleDescription, setScheduleDescription] = useState('Every day at 03:00 AM');
  const [command, setCommand] = useState('php /home/blackvs/public_html/artisan schedule:run');
  const [emailAlert, setEmailAlert] = useState('admin@blackvs.cloud');

  const presets = [
    { label: 'Every 5 Minutes', expr: '*/5 * * * *', desc: 'Every 5 minutes' },
    { label: 'Every 15 Minutes', expr: '*/15 * * * *', desc: 'Every 15 minutes' },
    { label: 'Hourly', expr: '0 * * * *', desc: 'Every hour at minute 0' },
    { label: 'Daily at Midnight', expr: '0 0 * * *', desc: 'Every day at 00:00 UTC' },
    { label: 'Daily at 3 AM', expr: '0 3 * * *', desc: 'Every day at 03:00 AM' },
    { label: 'Weekly (Sundays)', expr: '0 0 * * 0', desc: 'Every Sunday at midnight' },
  ];

  const handleApplyPreset = (expr: string, desc: string) => {
    setSchedule(expr);
    setScheduleDescription(desc);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule.trim() || !command.trim()) return;

    addCronJob({
      schedule: schedule.trim(),
      scheduleDescription: scheduleDescription.trim() || 'Custom schedule',
      command: command.trim(),
      emailAlert: emailAlert.trim(),
      status: 'active',
    });

    setShowAddModal(false);
    setCommand('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Cron Jobs & Background Tasks
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            UNIX cron daemon scheduler (/etc/cron.d/blackvs_users) with standard 5-part cron syntax
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Cron Job</span>
        </button>
      </div>

      {/* Cron Jobs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              <th className="py-3 px-4">Crontab Schedule</th>
              <th className="py-3 px-4">Command to Execute</th>
              <th className="py-3 px-4">Alert Notification</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Execution</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {cronJobs.map((job) => (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold">{job.schedule}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans mt-0.5">{job.scheduleDescription}</div>
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-300 text-[11px] truncate max-w-xs">
                  {job.command}
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                  {job.emailAlert || 'Disabled'}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      job.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400 border-white/10'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                  {job.lastRun}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggleCronJob(job.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                      title={job.status === 'active' ? 'Pause Job' : 'Resume Job'}
                    >
                      {job.status === 'active' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCronJob(job.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Cron Task"
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

      {/* Add Cron Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Schedule New Cron Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Common Interval Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleApplyPreset(p.expr, p.desc)}
                      className={`p-2 rounded-xl border text-left transition-colors ${
                        schedule === p.expr
                          ? 'border-white bg-white/15 text-white font-medium'
                          : 'border-white/10 text-neutral-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold text-white">{p.label}</div>
                      <div className="text-[10px] font-mono text-neutral-500">{p.expr}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Cron Expression (5 parts)</label>
                  <input
                    type="text"
                    required
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Human Description</label>
                  <input
                    type="text"
                    value={scheduleDescription}
                    onChange={(e) => setScheduleDescription(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Command Line</label>
                <input
                  type="text"
                  required
                  placeholder="/usr/bin/php /home/blackvs/public_html/cron.php"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Email Output Errors To</label>
                <input
                  type="email"
                  placeholder="admin@blackvs.cloud (optional)"
                  value={emailAlert}
                  onChange={(e) => setEmailAlert(e.target.value)}
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
