import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  LayoutDashboard,
  Globe,
  FolderOpen,
  Database,
  Mail,
  ShieldCheck,
  Cpu,
  Archive,
  Terminal,
  Clock,
  FileText,
  CreditCard,
  KeyRound,
  PlusCircle,
  Network,
  Palette,
  Server,
} from 'lucide-react';
import { ThemeMode } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    domains,
    databases,
    addToast,
    theme,
    setTheme,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    category: string;
    action: () => void;
  }

  const baseItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'System health, services, hardware telemetry',
      icon: <LayoutDashboard className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('dashboard');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-domains',
      title: 'Domains & VirtualHosts',
      subtitle: 'Manage root folders, PHP versions, DNS bindings',
      icon: <Globe className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('domains');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-filemanager',
      title: 'File Manager',
      subtitle: 'Browse /home/blackvs/public_html, edit and upload files',
      icon: <FolderOpen className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('file-manager');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-mysql',
      title: 'MySQL Databases',
      subtitle: 'MariaDB 11.2 databases, users, SQL query runner',
      icon: <Database className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('mysql');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-dns',
      title: 'DNS Zone Editor',
      subtitle: 'Manage DNS resource records, SPF, DKIM, DMARC',
      icon: <Network className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('dns');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-terminal',
      title: 'Web Terminal & SSH Shell',
      subtitle: 'Interactive command line session',
      icon: <Terminal className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('terminal');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-resources',
      title: 'Resource Telemetry & Processes',
      subtitle: 'CPU cores, memory breakdown, disk I/O, process killer',
      icon: <Cpu className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('resources');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-ssl',
      title: 'SSL/TLS Certificates',
      subtitle: "Let's Encrypt auto-renew, custom certs, HSTS",
      icon: <ShieldCheck className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('ssl');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-email',
      title: 'Email Accounts & Forwarders',
      subtitle: 'Postfix/Dovecot mailboxes, quotas, SPF/DKIM',
      icon: <Mail className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('emails');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-backups',
      title: 'Backups & Snapshots',
      subtitle: 'Amazon S3 sync, instant snapshots, restore point',
      icon: <Archive className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('backups');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-cron',
      title: 'Cron Jobs & Scheduled Tasks',
      subtitle: 'System crontab manager and automated tasks',
      icon: <Clock className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('cron');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-logs',
      title: 'Real-Time Server Logs',
      subtitle: 'Nginx access/error, PHP-FPM, MySQL slow logs',
      icon: <FileText className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('logs');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-security',
      title: 'Security Suite & WAF',
      subtitle: 'ModSecurity, IP firewall rules, 2FA setup',
      icon: <KeyRound className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('security');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-billing',
      title: 'Billing & Plan Quotas',
      subtitle: 'Bare metal specs, invoices, API tokens',
      icon: <CreditCard className="w-4 h-4 text-neutral-300" />,
      category: 'Navigation',
      action: () => {
        setActiveTab('billing');
        setCommandPaletteOpen(false);
      },
    },
    // Quick Actions
    {
      id: 'act-new-domain',
      title: 'Add New Domain / Subdomain',
      subtitle: 'Setup virtualhost with auto-SSL',
      icon: <PlusCircle className="w-4 h-4 text-neutral-200" />,
      category: 'Quick Actions',
      action: () => {
        setActiveTab('domains');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-db',
      title: 'Create MySQL Database',
      subtitle: 'Provision new schema with dedicated user',
      icon: <PlusCircle className="w-4 h-4 text-neutral-200" />,
      category: 'Quick Actions',
      action: () => {
        setActiveTab('mysql');
        setCommandPaletteOpen(false);
      },
    },
    // Theme Switcher Commands
    {
      id: 'theme-obsidian',
      title: 'Switch Theme: Obsidian Dark',
      subtitle: 'Apple-styled deep zinc with polished glass accents',
      icon: <Palette className="w-4 h-4 text-neutral-300" />,
      category: 'Appearance Themes',
      action: () => {
        setTheme('obsidian');
        setCommandPaletteOpen(false);
        addToast({ title: 'Theme Updated', message: 'Applied Obsidian Dark theme', type: 'info' });
      },
    },
    {
      id: 'theme-midnight',
      title: 'Switch Theme: OLED Midnight',
      subtitle: 'Pure zero-black theme for high-contrast OLED screens',
      icon: <Palette className="w-4 h-4 text-sky-400" />,
      category: 'Appearance Themes',
      action: () => {
        setTheme('midnight');
        setCommandPaletteOpen(false);
        addToast({ title: 'Theme Updated', message: 'Applied OLED Midnight theme', type: 'info' });
      },
    },
    {
      id: 'theme-slate',
      title: 'Switch Theme: Slate Space Gray',
      subtitle: 'Cool slate tones inspired by Apple Space Gray hardware',
      icon: <Palette className="w-4 h-4 text-blue-400" />,
      category: 'Appearance Themes',
      action: () => {
        setTheme('slate');
        setCommandPaletteOpen(false);
        addToast({ title: 'Theme Updated', message: 'Applied Slate Space Gray theme', type: 'info' });
      },
    },
    {
      id: 'theme-light',
      title: 'Switch Theme: Titanium Light',
      subtitle: 'Crisp titanium bright studio appearance',
      icon: <Palette className="w-4 h-4 text-amber-500" />,
      category: 'Appearance Themes',
      action: () => {
        setTheme('light');
        setCommandPaletteOpen(false);
        addToast({ title: 'Theme Updated', message: 'Applied Titanium Light theme', type: 'info' });
      },
    },
  ];

  // Dynamic domain search results
  const domainItems: CommandItem[] = domains.map((d) => ({
    id: `domain-${d.id}`,
    title: d.domain,
    subtitle: `${d.type} · ${d.phpVersion} · ${d.documentRoot}`,
    icon: <Globe className="w-4 h-4 text-neutral-400" />,
    category: 'Domains',
    action: () => {
      setActiveTab('domains');
      setCommandPaletteOpen(false);
    },
  }));

  // Dynamic database search results
  const dbItems: CommandItem[] = databases.map((db) => ({
    id: `db-${db.id}`,
    title: db.name,
    subtitle: `${db.sizeMB} MB · ${db.tablesCount} tables · ${db.user}`,
    icon: <Database className="w-4 h-4 text-neutral-400" />,
    category: 'Databases',
    action: () => {
      setActiveTab('mysql');
      setCommandPaletteOpen(false);
    },
  }));

  const allItems = [...baseItems, ...domainItems, ...dbItems];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl glass-dropdown border border-[var(--app-border)] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Zone */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--app-border)] bg-[var(--app-input-bg)]">
          <Search className="w-4 h-4 text-[var(--app-fg-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, theme name, domain, or database..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-subtle)]"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--app-fg-subtle)] bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded">
            ESC
          </kbd>
        </div>

        {/* Command Item List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--app-border)]/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--app-fg-subtle)]">
              No matching commands, themes, or resources found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[var(--app-btn-primary-bg)] text-[var(--app-btn-primary-fg)] font-medium shadow-sm'
                      : 'text-[var(--app-fg)] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-black/10 text-current' : 'bg-[var(--app-card-bg)] text-[var(--app-fg-muted)]'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs truncate font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'opacity-80' : 'text-[var(--app-fg-subtle)]'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ml-2 shrink-0 ${
                      isSelected
                        ? 'bg-black/20 text-current'
                        : 'bg-[var(--app-input-bg)] text-[var(--app-fg-subtle)] border border-[var(--app-border)]'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Bottom Keyboard Legend */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--app-border)] bg-[var(--app-input-bg)] text-[10px] text-[var(--app-fg-subtle)] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>BlackVs Quick Command</span>
        </div>
      </div>
    </div>
  );
};
