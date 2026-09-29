import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Check,
  ChevronDown,
  Shield,
  RotateCw,
  Terminal,
  Layers,
  Sun,
  Moon,
  Sparkles,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { UserRole, ThemeMode } from '../../types';

export const Header: React.FC<{ onToggleSidebarMobile?: () => void }> = ({ onToggleSidebarMobile }) => {
  const {
    theme,
    setTheme,
    currentNode,
    setCurrentNode,
    serverNodes,
    userProfile,
    setUserRole,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    setCommandPaletteOpen,
    setActiveTab,
    addToast,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();

  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showRebootModal, setShowRebootModal] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setShowNodeMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReboot = () => {
    setShowRebootModal(false);
    addToast({
      title: 'Graceful Server Restart Queued',
      message: `Initiating systemctl reboot for ${currentNode.hostname} (30s window)`,
      type: 'warning',
    });
  };

  const themes: { id: ThemeMode; label: string; description: string; icon: React.ElementType }[] = [
    { id: 'obsidian', label: 'Obsidian Dark', description: 'Deep zinc with Apple glass accents', icon: Moon },
    { id: 'midnight', label: 'OLED Midnight', description: 'Pure true-black contrast', icon: Sparkles },
    { id: 'slate', label: 'Slate Gray', description: 'Space gray with cool slate tones', icon: Monitor },
    { id: 'light', label: 'Titanium Light', description: 'Apple bright studio appearance', icon: Sun },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-[var(--app-border)] bg-[var(--app-glass)] backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Layers className="w-5 h-5" />
          </button>

          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
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
            <span className="font-semibold tracking-tight text-[var(--app-fg)]">BlackVs</span>
          </a>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden md:inline-flex items-center justify-center p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-[var(--app-border)] transition-all"
            title={`${sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} (⌘B)`}
            aria-label="Toggle sidebar collapse"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Quick Node Selector Dropdown */}
          <div className="relative hidden lg:block" ref={nodeRef}>
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] bg-[var(--app-input-bg)] hover:bg-white/[0.08] border border-[var(--app-border)] transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[150px] truncate">{currentNode.name}</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>

            {showNodeMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl glass-dropdown p-1.5 z-40 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Select Infrastructure Node
                </div>
                {serverNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setCurrentNode(node);
                      setShowNodeMenu(false);
                      addToast({
                        title: 'Target Node Changed',
                        message: `Switched to ${node.name} (${node.ip})`,
                        type: 'info',
                      });
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      node.id === currentNode.id
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-[var(--app-fg)]">{node.name}</div>
                      <div className="text-[11px] font-mono text-[var(--app-fg-muted)]">{node.ip} · {node.datacenter.split(',')[0]}</div>
                    </div>
                    {node.id === currentNode.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Fast Search Command Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--app-input-bg)] hover:bg-neutral-800/40 border border-[var(--app-border)] hover:border-neutral-500/40 text-xs text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Search domains, databases, files, tools...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--app-fg-muted)] bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 3: Actions (Theme Switcher, Terminal quick button, Notifications, Profile menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Switcher Menu */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5 border border-transparent hover:border-[var(--app-border)]"
              title="Change Theme Appearance"
              aria-label="Change Theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'midnight' ? (
                <Sparkles className="w-4 h-4 text-sky-400" />
              ) : theme === 'slate' ? (
                <Monitor className="w-4 h-4 text-blue-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-300" />
              )}
              <ChevronDown className="w-3 h-3 text-neutral-400 hidden md:inline" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--app-fg-subtle)] border-b border-[var(--app-border)] mb-1">
                  Appearance Theme
                </div>
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isCur = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeMenu(false);
                        addToast({
                          title: 'Theme Applied',
                          message: `Switched appearance to ${t.label}`,
                          type: 'info',
                        });
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                        isCur
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${isCur ? 'text-white' : 'text-neutral-400'}`} />
                        <div className="text-left">
                          <div className="leading-tight text-[var(--app-fg)]">{t.label}</div>
                          <div className="text-[10px] text-[var(--app-fg-subtle)]">{t.description}</div>
                        </div>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Terminal Trigger */}
          <button
            onClick={() => setActiveTab('terminal')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] bg-[var(--app-input-bg)] hover:bg-white/[0.08] border border-[var(--app-border)] rounded-lg transition-colors whitespace-nowrap"
            title="Open Web Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span>Terminal</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] rounded-lg hover:bg-white/5 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--app-bg)]" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-3 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)] px-1">
                  <div className="text-xs font-semibold text-[var(--app-fg)]">Notifications</div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2 space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      No notifications to display
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl transition-colors ${
                          n.read ? 'bg-transparent text-[var(--app-fg-subtle)]' : 'bg-white/[0.04] text-[var(--app-fg)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className={n.read ? 'text-[var(--app-fg-muted)]' : 'text-[var(--app-fg)]'}>{n.title}</span>
                          <span className="text-[10px] text-[var(--app-fg-subtle)] font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[var(--app-fg-muted)] mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Selector */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-[var(--app-border)] transition-all"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover bg-neutral-800 ring-1 ring-white/15"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-[var(--app-fg)] leading-tight">{userProfile.name}</div>
                <div className="text-[10px] text-[var(--app-fg-subtle)] leading-none">{userProfile.roleLabel}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-[var(--app-border)]">
                  <div className="text-xs font-medium text-[var(--app-fg)]">{userProfile.name}</div>
                  <div className="text-[11px] text-[var(--app-fg-muted)] font-mono truncate">{userProfile.email}</div>
                  <div className="mt-1 text-[10px] font-mono text-[var(--app-fg-subtle)]">Account ID: {userProfile.accountId}</div>
                </div>

                <div className="px-2 py-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--app-fg-subtle)] px-2 py-1">
                    Simulate Role Access
                  </div>
                  {(['root', 'owner', 'reseller', 'dev'] as UserRole[]).map((r) => {
                    const label =
                      r === 'root'
                        ? 'Root Administrator'
                        : r === 'owner'
                        ? 'Account Owner'
                        : r === 'reseller'
                        ? 'Reseller Partner'
                        : 'Infrastructure Developer';
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setUserRole(r);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          userProfile.role === r
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/5'
                        }`}
                      >
                        <span>{label}</span>
                        {userProfile.role === r && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--app-border)] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setActiveTab('billing');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Account & Security</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowRebootModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Graceful Server Reboot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reboot confirmation modal */}
      {showRebootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RotateCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Reboot Virtual Private Server</h3>
                <p className="text-xs text-neutral-400">{currentNode.hostname} ({currentNode.ip})</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to reboot this server? All active HTTP connections and MariaDB transactions will be drained gracefully before restarting system services. Expected downtime is under 25 seconds.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRebootModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReboot}
                className="px-4 py-2 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                Confirm Graceful Reboot
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
