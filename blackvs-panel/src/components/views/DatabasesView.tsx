import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Plus,
  Trash2,
  Terminal,
  Play,
  RotateCcw,
  Download,
  Users,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Shield,
} from 'lucide-react';
import { DatabaseItem } from '../../types';

export const DatabasesView: React.FC = () => {
  const { databases, addDatabase, deleteDatabase, addToast, telemetry } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbToDelete, setDbToDelete] = useState<DatabaseItem | null>(null);

  // New DB form
  const [newDbName, setNewDbName] = useState('');
  const [newDbUser, setNewDbUser] = useState('');
  const [newDbCollation, setNewDbCollation] = useState('utf8mb4_unicode_ci');
  const [dbPassword, setDbPassword] = useState('P@ss_' + Math.random().toString(36).substring(2, 8));

  // SQL Runner Console
  const [sqlQuery, setSqlQuery] = useState('SHOW TABLES;\n-- or try: SELECT * FROM information_schema.tables LIMIT 5;');
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: (string | number)[][];
    executionTime: string;
  } | null>({
    columns: ['Tables_in_blackvs_prod', 'Table_type', 'Data_length (KB)'],
    rows: [
      ['users', 'BASE TABLE', 512],
      ['sessions', 'BASE TABLE', 1024],
      ['orders', 'BASE TABLE', 2048],
      ['audit_logs', 'BASE TABLE', 4096],
      ['migrations', 'BASE TABLE', 64],
    ],
    executionTime: '0.002s',
  });
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'databases' | 'sql-runner'>('databases');

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    const formattedName = newDbName.startsWith('blackvs_') ? newDbName : `blackvs_${newDbName}`;
    const formattedUser = newDbUser.trim() || `usr_${newDbName.substring(0, 8)}`;

    addDatabase({
      name: formattedName.toLowerCase(),
      user: formattedUser.toLowerCase(),
      sizeMB: 0.1,
      tablesCount: 0,
      collation: newDbCollation,
      charset: 'utf8mb4',
    });

    setShowAddModal(false);
    setNewDbName('');
    setNewDbUser('');
  };

  const handleExecuteSql = () => {
    setIsExecutingSql(true);
    setTimeout(() => {
      setIsExecutingSql(false);
      const clean = sqlQuery.trim().toLowerCase();

      if (clean.includes('optimize') || clean.includes('repair')) {
        setQueryResult({
          columns: ['Table', 'Op', 'Msg_type', 'Msg_text'],
          rows: [
            ['blackvs_prod.users', 'optimize', 'status', 'OK'],
            ['blackvs_prod.sessions', 'optimize', 'status', 'Table is already up to date'],
            ['blackvs_prod.orders', 'optimize', 'status', 'OK'],
          ],
          executionTime: '0.014s',
        });
        addToast({ title: 'SQL Execution', message: 'Optimization completed', type: 'success' });
      } else if (clean.includes('select') && clean.includes('users')) {
        setQueryResult({
          columns: ['id', 'email', 'role', 'status', 'created_at'],
          rows: [
            [1, 'alexander@blackvs.cloud', 'root_admin', 'active', '2025-01-14 10:20:00'],
            [2, 'developer@blackvs.cloud', 'engineer', 'active', '2025-02-01 14:15:22'],
            [3, 'billing@blackvs.cloud', 'accountant', 'active', '2025-02-12 09:00:11'],
          ],
          executionTime: '0.003s',
        });
      } else {
        setQueryResult({
          columns: ['Tables_in_active_db', 'Engine', 'Rows_count', 'Collation'],
          rows: [
            ['wp_options', 'InnoDB', 284, 'utf8mb4_unicode_ci'],
            ['wp_posts', 'InnoDB', 1420, 'utf8mb4_unicode_ci'],
            ['wp_comments', 'InnoDB', 840, 'utf8mb4_unicode_ci'],
            ['wp_postmeta', 'InnoDB', 8920, 'utf8mb4_unicode_ci'],
          ],
          executionTime: '0.004s',
        });
      }
    }, 400);
  };

  const handleDumpDatabase = (db: DatabaseItem) => {
    const dumpContent = `-- BlackVs MySQL Dump\n-- Database: ${db.name}\n-- Host: 127.0.0.1:3306\n-- Generated: ${new Date().toISOString()}\n\n/*!40101 SET NAMES utf8mb4 */;\n-- Dump completed\n`;
    const blob = new Blob([dumpContent], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${db.name}_dump.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({
      title: 'SQL Dump Generated',
      message: `Downloaded ${db.name}_dump.sql`,
      type: 'success',
    });
  };

  const handleOptimizeAll = () => {
    addToast({
      title: 'Table Maintenance Scheduled',
      message: 'Running OPTIMIZE & ANALYZE on all active MariaDB InnoDB schemas...',
      type: 'info',
    });
  };

  const filteredDatabases = databases.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            MySQL & MariaDB Databases
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            MariaDB 11.2 Enterprise server, dedicated schemas, users, and SQL console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOptimizeAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Optimize All</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Database</span>
          </button>
        </div>
      </div>

      {/* Tabs: Databases vs SQL Runner */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
          <button
            onClick={() => setActiveTabSub('databases')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTabSub === 'databases'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Databases ({databases.length})
          </button>
          <button
            onClick={() => setActiveTabSub('sql-runner')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTabSub === 'sql-runner'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Query Runner</span>
          </button>
        </div>

        {activeTabSub === 'databases' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search database name or user..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {activeTabSub === 'databases' ? (
        /* Databases Table */
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Database Name</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4 text-right">Size</th>
                  <th className="py-3 px-4 text-right">Tables</th>
                  <th className="py-3 px-4">Collation</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {filteredDatabases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      No databases found.
                    </td>
                  </tr>
                ) : (
                  filteredDatabases.map((db) => (
                    <tr key={db.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold">{db.name}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-300 text-[11px]">
                        {db.user}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {db.sizeMB >= 1024
                          ? `${(db.sizeMB / 1024).toFixed(2)} GB`
                          : `${db.sizeMB.toFixed(1)} MB`}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-400">
                        {db.tablesCount}
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                        {db.collation}
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                        {db.created}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSqlQuery(`USE ${db.name};\nSHOW TABLES;`);
                              setActiveTabSub('sql-runner');
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Open in SQL Runner"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDumpDatabase(db)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Export / Download SQL Dump"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDbToDelete(db)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Drop Database"
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
      ) : (
        /* SQL Runner Console */
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Terminal className="w-4 h-4 text-neutral-300" />
                <span>MariaDB Interactive Shell (127.0.0.1:3306)</span>
              </div>
              <button
                onClick={handleExecuteSql}
                disabled={isExecutingSql}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isExecutingSql ? 'Running...' : 'Execute SQL'}</span>
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={4}
              placeholder="Enter SQL statement..."
              className="w-full bg-[#0d0d10] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-white/30 resize-y"
              spellCheck={false}
            />

            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span>Shortcuts:</span>
              <button
                onClick={() => setSqlQuery('SHOW TABLES;')}
                className="hover:text-white underline font-mono"
              >
                SHOW TABLES
              </button>
              <span>·</span>
              <button
                onClick={() => setSqlQuery('SELECT * FROM users LIMIT 10;')}
                className="hover:text-white underline font-mono"
              >
                SELECT * FROM users
              </button>
              <span>·</span>
              <button
                onClick={() => setSqlQuery('OPTIMIZE TABLE sessions;')}
                className="hover:text-white underline font-mono"
              >
                OPTIMIZE TABLE sessions
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {queryResult && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
              <div className="px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Query Results</span>
                <span className="font-mono text-neutral-400 text-[11px]">
                  {queryResult.rows.length} row(s) returned in {queryResult.executionTime}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.01] text-neutral-400">
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02]">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-neutral-200">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Database Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Create MySQL Database & User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDatabase} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Database Name</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-neutral-900 border border-r-0 border-white/10 rounded-l-xl font-mono text-neutral-400">
                    blackvs_
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="app_production"
                    value={newDbName}
                    onChange={(e) => setNewDbName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-r-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Database User</label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generated user"
                  value={newDbUser}
                  onChange={(e) => setNewDbUser(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Default Collation</label>
                <select
                  value={newDbCollation}
                  onChange={(e) => setNewDbCollation(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                >
                  <option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci (Recommended)</option>
                  <option value="utf8mb4_0900_ai_ci">utf8mb4_0900_ai_ci (MySQL 8 standard)</option>
                  <option value="utf8mb4_general_ci">utf8mb4_general_ci</option>
                  <option value="utf8_general_ci">utf8_general_ci (Legacy)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="text-[11px] text-neutral-400">Generated User Password:</div>
                <div className="font-mono text-emerald-400 text-xs select-all">{dbPassword}</div>
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
                  Provision Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {dbToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Drop MySQL Database</h3>
                <p className="text-xs text-neutral-400">{dbToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently drop <span className="font-mono text-white">{dbToDelete.name}</span> ({dbToDelete.sizeMB} MB)? All {dbToDelete.tablesCount} tables and stored procedures will be purged immediately. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDbToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDatabase(dbToDelete.id);
                  setDbToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Confirm Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
