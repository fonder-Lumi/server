import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Cpu,
  Server,
  Terminal,
  Globe,
  Network,
  ShieldCheck,
  FolderOpen,
  Database,
  Archive,
  HardDrive,
  Layers,
  Mail,
  Clock,
  KeyRound,
  FileText,
  CreditCard,
  Palette,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    domains,
    databases,
    emails,
    telemetry,
    currentNode,
    theme,
    setTheme,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'resources', label: 'Telemetry & Stats', icon: Cpu },
        { id: 'vps', label: 'Server & Services', icon: Server },
        { id: 'terminal', label: 'Web Terminal', icon: Terminal },
      ],
    },
    {
      title: 'Web & Domains',
      items: [
        { id: 'domains', label: 'Domains', icon: Globe, badge: domains.length },
        { id: 'dns', label: 'DNS Zone Editor', icon: Network },
        { id: 'ssl', label: 'SSL / TLS Certs', icon: ShieldCheck },
      ],
    },
    {
      title: 'Storage & Data',
      items: [
        { id: 'file-manager', label: 'File Manager', icon: FolderOpen },
        { id: 'mysql', label: 'MySQL Databases', icon: Database, badge: databases.length },
        { id: 'backups', label: 'Backups & S3', icon: Archive },
        { id: 'ftp', label: 'FTP Accounts', icon: HardDrive },
      ],
    },
    {
      title: 'App Engines & Mail',
      items: [
        { id: 'php-node', label: 'PHP & Node.js', icon: Layers },
        { id: 'emails', label: 'Email Accounts', icon: Mail, badge: emails.length },
        { id: 'cron', label: 'Cron Jobs', icon: Clock },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'security', label: 'Security & WAF', icon: KeyRound },
        { id: 'logs', label: 'System Logs', icon: FileText },
        { id: 'billing', label: 'Billing & Settings', icon: CreditCard },
      ],
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const themeOptions: { id: ThemeMode; label: string; color: string }[] = [
    { id: 'obsidian', label: 'Obsidian', color: 'bg-zinc-900 border-zinc-700' },
    { id: 'midnight', label: 'Midnight', color: 'bg-black border-neutral-700' },
    { id: 'slate', label: 'Slate', color: 'bg-slate-900 border-slate-700' },
    { id: 'light', label: 'Titanium', color: 'bg-white border-neutral-300' },
  ];

  // Render navigation list (shared between desktop and mobile)
  const renderNavList = (isCollapsed: boolean) => (
    <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 space-y-5 scrollbar-thin">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          {/* Section Header */}
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-semibold tracking-wider text-[var(--app-fg-subtle)] uppercase">
              {section.title}
            </div>
          ) : (
            <div className="my-2 mx-auto w-6 h-[1px] bg-white/[0.08]" />
          )}

          {/* Nav Items */}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--app-btn-primary-bg)] text-[var(--app-btn-primary-fg)] shadow-sm font-semibold'
                        : 'text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--app-card-bg)]'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[var(--app-btn-primary-fg)]'
                            : 'text-[var(--app-fg-subtle)] group-hover:text-[var(--app-fg)]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
                          isActive
                            ? 'bg-black/20 text-current'
                            : 'bg-[var(--app-input-bg)] text-[var(--app-fg-muted)] border border-[var(--app-border)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[var(--app-bg)]" />
                    )}
                  </button>

                  {/* Tooltip in Collapsed Desktop Mode */}
                  {isCollapsed && (
                    <div className="hidden md:group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700/90 text-xs font-medium text-white shadow-2xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono bg-white/10 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[var(--app-border)] bg-[var(--app-glass)] backdrop-blur-xl h-full select-none transition-all duration-300 ease-in-out relative ${
          sidebarCollapsed ? 'w-[68px]' : 'w-64 lg:w-72'
        }`}
      >
        {/* Top Header / Collapse Toggle Bar */}
        <div
          className={`h-11 px-3 border-b border-[var(--app-border)] flex items-center ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          } shrink-0`}
        >
          {!sidebarCollapsed && (
            <span className="text-[11px] font-mono text-[var(--app-fg-subtle)] uppercase tracking-wider">
              Navigation
            </span>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title={`${sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} (⌘B)`}
            aria-label="Toggle sidebar collapse"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        {renderNavList(sidebarCollapsed)}

        {/* Bottom Panel */}
        <div className="p-2 sm:p-2.5 border-t border-[var(--app-border)] space-y-2.5 shrink-0 bg-black/10">
          {!sidebarCollapsed ? (
            <>
              {/* Theme quick switcher */}
              <div className="glass-panel p-2 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[var(--app-fg-muted)] px-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Palette className="w-3 h-3 text-[var(--app-fg-subtle)]" />
                    Theme Mode
                  </span>
                  <span className="text-[10px] uppercase font-mono text-[var(--app-fg-subtle)]">
                    {theme}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      title={`Switch to ${opt.label} theme`}
                      className={`py-1 px-1 rounded-lg text-[10px] font-mono border text-center transition-all ${
                        opt.color
                      } ${
                        theme === opt.id
                          ? 'ring-2 ring-emerald-400 font-bold scale-[1.02] text-[var(--app-fg)]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {opt.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Server Node Live Mini-Telemetry */}
              <div className="glass-panel-subtle p-2.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-mono text-[11px] text-[var(--app-fg)] font-medium truncate">
                      {currentNode.hostname}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--app-fg-subtle)] shrink-0">
                    {currentNode.datacenter.split(' ')[0]}
                  </span>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <div className="flex justify-between text-[10px] text-[var(--app-fg-muted)] font-mono">
                    <span>CPU Compute</span>
                    <span className="text-[var(--app-fg)] font-semibold">{telemetry.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--app-input-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, telemetry.cpuUsage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[var(--app-fg-muted)] font-mono">
                    <span>RAM Pool</span>
                    <span className="text-[var(--app-fg)] font-semibold">
                      {telemetry.memoryUsedGB.toFixed(1)} / {telemetry.memoryTotalGB} GB
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[var(--app-input-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 transition-all duration-500 rounded-full"
                      style={{
                        width: `${(telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* BlackVs System Watermark */}
              <div className="px-1 text-[10px] text-center font-mono text-[var(--app-fg-subtle)] truncate">
                BlackVs Cloud Kernel 6.8 · Exporter v2.52
              </div>
            </>
          ) : (
            /* Collapsed Compact State: Clean Icon Buttons & Live Status */
            <div className="flex flex-col items-center gap-2 py-1">
              {/* Node Live Indicator with tooltip */}
              <div className="relative group/node">
                <button
                  className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--app-border)] flex items-center justify-center transition-colors"
                  title="Target Server Status"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </button>
                <div className="hidden group-hover/node:block absolute left-full ml-3 bottom-0 z-50 p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs shadow-2xl w-52 pointer-events-none">
                  <div className="font-semibold text-white truncate">{currentNode.name}</div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">{currentNode.hostname}</div>
                  <div className="mt-1 pt-1 border-t border-neutral-800 text-[10px] font-mono flex justify-between text-neutral-300">
                    <span>CPU: {telemetry.cpuUsage}%</span>
                    <span>RAM: {telemetry.memoryUsedGB.toFixed(0)}G</span>
                  </div>
                </div>
              </div>

              {/* Theme Toggle Icon with cycle */}
              <div className="relative group/theme">
                <button
                  onClick={() => {
                    const order: ThemeMode[] = ['obsidian', 'midnight', 'slate', 'light'];
                    const next = order[(order.indexOf(theme) + 1) % order.length];
                    setTheme(next);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--app-border)] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
                  title={`Current theme: ${theme}. Click to cycle.`}
                >
                  <Palette className="w-4 h-4" />
                </button>
                <div className="hidden group-hover/theme:block absolute left-full ml-3 bottom-0 z-50 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-white shadow-xl pointer-events-none whitespace-nowrap">
                  Theme: {theme}
                </div>
              </div>

              {/* Compact Version Badge */}
              <div className="text-[9px] font-mono text-[var(--app-fg-subtle)] text-center">
                6.8
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[var(--app-bg)] border-r border-[var(--app-border)] z-50 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-[var(--app-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="BlackVs"
                  className="w-7 h-7 rounded-lg object-contain bg-[var(--app-card-bg)] ring-1 ring-[var(--app-border)] shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-7 h-7 rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 flex items-center justify-center text-white font-black text-xs shadow-sm ring-1 ring-white/10';
                    fallback.textContent = 'BV';
                    target.parentNode?.insertBefore(fallback, target.nextSibling);
                  }}
                />
                <div className="text-sm font-semibold text-[var(--app-fg)]">BlackVs Navigator</div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            {renderNavList(false)}
          </div>
        </div>
      )}
    </>
  );
};
