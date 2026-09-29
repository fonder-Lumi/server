import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Settings2,
  CheckCircle2,
  RotateCw,
  Terminal,
  Play,
  Square,
  Plus,
  Save,
  Check,
  Cpu,
  Activity,
} from 'lucide-react';

export const PhpNodeView: React.FC = () => {
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'php' | 'nodejs'>('php');
  const [selectedPhpVer, setSelectedPhpVer] = useState('8.3');

  // PHP Extensions toggles
  const [extensions, setExtensions] = useState<Record<string, boolean>>({
    opcache: true,
    pdo_mysql: true,
    redis: true,
    imagick: true,
    curl: true,
    mbstring: true,
    sodium: true,
    gd: true,
    xml: true,
    zip: true,
    intl: true,
    bcmath: true,
  });

  // php.ini directives
  const [memoryLimit, setMemoryLimit] = useState('512M');
  const [uploadMaxFilesize, setUploadMaxFilesize] = useState('128M');
  const [postMaxSize, setPostMaxSize] = useState('128M');
  const [maxExecutionTime, setMaxExecutionTime] = useState('180');
  const [displayErrors, setDisplayErrors] = useState(false);

  // Node.js apps
  const [nodeApps, setNodeApps] = useState([
    {
      id: 'node-app-1',
      name: 'BlackVs Core REST API',
      path: '/home/blackvs/api_root/server.js',
      nodeVersion: 'Node 20.14 LTS',
      port: 3001,
      status: 'online',
      uptime: '14 days',
      memoryMB: 114,
      cpu: 1.4,
    },
    {
      id: 'node-app-2',
      name: 'Next.js SSR Frontend',
      path: '/home/blackvs/public_html/server.js',
      nodeVersion: 'Node 20.14 LTS',
      port: 3000,
      status: 'online',
      uptime: '14 days',
      memoryMB: 182,
      cpu: 2.1,
    },
  ]);

  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodePath, setNewNodePath] = useState('/home/blackvs/app/index.js');
  const [newNodePort, setNewNodePort] = useState(3002);

  const toggleExtension = (ext: string) => {
    setExtensions((prev) => {
      const next = !prev[ext];
      addToast({
        title: `PHP Extension ${next ? 'Enabled' : 'Disabled'}`,
        message: `${ext}.so loaded into PHP ${selectedPhpVer}-FPM`,
        type: 'info',
      });
      return { ...prev, [ext]: next };
    });
  };

  const handleSavePhpIni = () => {
    addToast({
      title: 'php.ini Updated',
      message: `systemctl reload php${selectedPhpVer}-fpm completed`,
      type: 'success',
    });
  };

  const handleRestartNodeApp = (id: string) => {
    addToast({
      title: 'PM2 Reload Triggered',
      message: 'pm2 restart with cluster zero-downtime reload',
      type: 'info',
    });
  };

  const handleCreateNodeApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    setNodeApps((prev) => [
      ...prev,
      {
        id: `node-${Date.now()}`,
        name: newNodeName,
        path: newNodePath,
        nodeVersion: 'Node 20.14 LTS',
        port: newNodePort,
        status: 'online',
        uptime: 'Just started',
        memoryMB: 68,
        cpu: 0.8,
      },
    ]);
    setShowAddNodeModal(false);
    setNewNodeName('');
    addToast({
      title: 'PM2 Daemon Registered',
      message: `pm2 start ${newNodePath} --name ${newNodeName}`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            PHP & Node.js Runtime Engine Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Multi-version PHP-FPM pools, opcache tuning, and Node.js PM2 process supervisors
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl self-start">
          <button
            onClick={() => setActiveTab('php')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'php'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            PHP Manager
          </button>
          <button
            onClick={() => setActiveTab('nodejs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'nodejs'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Node.js (PM2)
          </button>
        </div>
      </div>

      {activeTab === 'php' ? (
        <div className="space-y-6">
          {/* PHP Version Selector */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Installed PHP Runtime Versions</h2>
                <p className="text-xs text-neutral-400">Select active target version to tune extensions & ini settings</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FPM ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { version: '8.4', label: 'PHP 8.4 (JIT)', desc: 'Next-gen JIT compiler' },
                { version: '8.3', label: 'PHP 8.3-FPM', desc: 'Active System Default' },
                { version: '8.2', label: 'PHP 8.2-FPM', desc: 'Long Term Support' },
                { version: '8.1', label: 'PHP 8.1-FPM', desc: 'Legacy Compatibility' },
              ].map((v) => {
                const isSelected = selectedPhpVer === v.version;
                return (
                  <button
                    key={v.version}
                    onClick={() => setSelectedPhpVer(v.version)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-white bg-white/10 text-white shadow-sm'
                        : 'border-white/10 text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{v.label}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PHP.INI Directives */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">PHP {selectedPhpVer} Core Directives (php.ini)</h2>
                <p className="text-xs text-neutral-400">Memory bounds, execution ceilings, and file upload limits</p>
              </div>
              <button
                onClick={handleSavePhpIni}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save php.ini</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-neutral-400 font-sans">memory_limit</label>
                <input
                  type="text"
                  value={memoryLimit}
                  onChange={(e) => setMemoryLimit(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-sans">upload_max_filesize</label>
                <input
                  type="text"
                  value={uploadMaxFilesize}
                  onChange={(e) => setUploadMaxFilesize(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-sans">post_max_size</label>
                <input
                  type="text"
                  value={postMaxSize}
                  onChange={(e) => setPostMaxSize(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-sans">max_execution_time (sec)</label>
                <input
                  type="text"
                  value={maxExecutionTime}
                  onChange={(e) => setMaxExecutionTime(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PHP Extensions Grid */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <h2 className="text-sm font-semibold text-white">PHP {selectedPhpVer} Dynamic Modules & Extensions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {Object.entries(extensions).map(([ext, enabled]) => (
                <div
                  key={ext}
                  onClick={() => toggleExtension(ext)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    enabled
                      ? 'border-white/20 bg-white/[0.04] text-white'
                      : 'border-white/5 bg-transparent text-neutral-500'
                  }`}
                >
                  <span className="font-mono">{ext}.so</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border ${
                      enabled ? 'border-white bg-white text-black' : 'border-neutral-700'
                    }`}
                  >
                    {enabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Node.js (PM2) Manager */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">PM2 Process Supervisor</h2>
              <p className="text-xs text-neutral-400">Node.js microservices and SSR application daemon manager</p>
            </div>
            <button
              onClick={() => setShowAddNodeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Node App</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Port</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4">Memory</th>
                  <th className="py-3 px-4">CPU %</th>
                  <th className="py-3 px-4">Uptime</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {nodeApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="font-semibold">{app.name}</div>
                          <div className="text-[11px] font-mono text-neutral-500 truncate max-w-xs">
                            {app.path}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-300">:{app.port}</td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">{app.nodeVersion}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-300">{app.memoryMB} MB</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-300">{app.cpu}%</td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">{app.uptime}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestartNodeApp(app.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                        title="Reload App"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Restart</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Register Node.js PM2 Application</h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNodeApp} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">App Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Realtime WebSocket Server"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Entry Script Path</label>
                <input
                  type="text"
                  required
                  value={newNodePath}
                  onChange={(e) => setNewNodePath(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Internal Port</label>
                <input
                  type="number"
                  required
                  value={newNodePort}
                  onChange={(e) => setNewNodePort(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Start Daemon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
