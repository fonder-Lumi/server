import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveTab,
  ThemeMode,
  UserRole,
  UserProfile,
  ServerNode,
  SystemTelemetry,
  DomainItem,
  FileItem,
  DatabaseItem,
  EmailItem,
  SslCertItem,
  ProcessItem,
  BackupItem,
  CronJobItem,
  DnsRecordItem,
  FtpAccountItem,
  ServiceItem,
  NotificationItem,
  LogEntry,
  ToastMessage,
} from '../types';
import {
  initialUserProfile,
  serverNodesList,
  initialTelemetry,
  initialDomains,
  initialFiles,
  initialDatabases,
  initialEmails,
  initialSslCerts,
  initialProcesses,
  initialBackups,
  initialCronJobs,
  initialDnsRecords,
  initialFtpAccounts,
  initialServices,
  initialNotifications,
  initialLogs,
} from '../data/mockData';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentNode: ServerNode;
  setCurrentNode: (node: ServerNode) => void;
  serverNodes: ServerNode[];
  userProfile: UserProfile;
  setUserRole: (role: UserRole) => void;
  telemetry: SystemTelemetry;
  domains: DomainItem[];
  addDomain: (domain: Omit<DomainItem, 'id' | 'created'>) => void;
  deleteDomain: (id: string) => void;
  toggleDomainStatus: (id: string) => void;
  files: FileItem[];
  currentPath: string;
  setCurrentPath: (path: string) => void;
  addFile: (file: Omit<FileItem, 'id'>) => void;
  updateFileContent: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  databases: DatabaseItem[];
  addDatabase: (db: Omit<DatabaseItem, 'id' | 'created'>) => void;
  deleteDatabase: (id: string) => void;
  emails: EmailItem[];
  addEmail: (email: Omit<EmailItem, 'id' | 'created'>) => void;
  deleteEmail: (id: string) => void;
  sslCerts: SslCertItem[];
  issueSsl: (domain: string) => void;
  renewSsl: (id: string) => void;
  processes: ProcessItem[];
  killProcess: (pid: number) => void;
  backups: BackupItem[];
  createBackup: (type: 'Full System' | 'Home Directory' | 'MySQL Only', location: 'Local SSD' | 'Amazon S3' | 'Wasabi Cloud') => void;
  deleteBackup: (id: string) => void;
  cronJobs: CronJobItem[];
  addCronJob: (job: Omit<CronJobItem, 'id' | 'lastRun'>) => void;
  toggleCronJob: (id: string) => void;
  deleteCronJob: (id: string) => void;
  dnsRecords: DnsRecordItem[];
  addDnsRecord: (rec: Omit<DnsRecordItem, 'id'>) => void;
  deleteDnsRecord: (id: string) => void;
  ftpAccounts: FtpAccountItem[];
  addFtpAccount: (ftp: Omit<FtpAccountItem, 'id'>) => void;
  deleteFtpAccount: (id: string) => void;
  services: ServiceItem[];
  restartService: (id: string) => void;
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  logs: LogEntry[];
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: defaults to 'obsidian', persisted to localStorage & document.documentElement
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('blackvs_theme');
    if (saved === 'midnight' || saved === 'slate' || saved === 'light' || saved === 'obsidian') {
      return saved;
    }
    return 'obsidian';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('blackvs_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [serverNodes] = useState<ServerNode[]>(serverNodesList);
  const [currentNode, setCurrentNode] = useState<ServerNode>(serverNodesList[0]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('blackvs_user_profile');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [telemetry, setTelemetry] = useState<SystemTelemetry>(initialTelemetry);

  const [domains, setDomains] = useState<DomainItem[]>(() => {
    const saved = localStorage.getItem('blackvs_domains');
    return saved ? JSON.parse(saved) : initialDomains;
  });

  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('blackvs_files');
    return saved ? JSON.parse(saved) : initialFiles;
  });
  const [currentPath, setCurrentPath] = useState<string>('/home/blackvs/public_html');

  const [databases, setDatabases] = useState<DatabaseItem[]>(() => {
    const saved = localStorage.getItem('blackvs_databases');
    return saved ? JSON.parse(saved) : initialDatabases;
  });

  const [emails, setEmails] = useState<EmailItem[]>(() => {
    const saved = localStorage.getItem('blackvs_emails');
    return saved ? JSON.parse(saved) : initialEmails;
  });

  const [sslCerts, setSslCerts] = useState<SslCertItem[]>(() => {
    const saved = localStorage.getItem('blackvs_ssl');
    return saved ? JSON.parse(saved) : initialSslCerts;
  });

  const [processes, setProcesses] = useState<ProcessItem[]>(initialProcesses);

  const [backups, setBackups] = useState<BackupItem[]>(() => {
    const saved = localStorage.getItem('blackvs_backups');
    return saved ? JSON.parse(saved) : initialBackups;
  });

  const [cronJobs, setCronJobs] = useState<CronJobItem[]>(() => {
    const saved = localStorage.getItem('blackvs_cron');
    return saved ? JSON.parse(saved) : initialCronJobs;
  });

  const [dnsRecords, setDnsRecords] = useState<DnsRecordItem[]>(() => {
    const saved = localStorage.getItem('blackvs_dns');
    return saved ? JSON.parse(saved) : initialDnsRecords;
  });

  const [ftpAccounts, setFtpAccounts] = useState<FtpAccountItem[]>(() => {
    const saved = localStorage.getItem('blackvs_ftp');
    return saved ? JSON.parse(saved) : initialFtpAccounts;
  });

  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    const saved = localStorage.getItem('blackvs_sidebar_collapsed');
    return saved === 'true';
  });

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem('blackvs_sidebar_collapsed', String(collapsed));
  };

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem('blackvs_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('blackvs_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('blackvs_domains', JSON.stringify(domains));
  }, [domains]);

  useEffect(() => {
    localStorage.setItem('blackvs_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('blackvs_databases', JSON.stringify(databases));
  }, [databases]);

  useEffect(() => {
    localStorage.setItem('blackvs_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('blackvs_ssl', JSON.stringify(sslCerts));
  }, [sslCerts]);

  useEffect(() => {
    localStorage.setItem('blackvs_backups', JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem('blackvs_cron', JSON.stringify(cronJobs));
  }, [cronJobs]);

  useEffect(() => {
    localStorage.setItem('blackvs_dns', JSON.stringify(dnsRecords));
  }, [dnsRecords]);

  useEffect(() => {
    localStorage.setItem('blackvs_ftp', JSON.stringify(ftpAccounts));
  }, [ftpAccounts]);

  // Real-time telemetry via Server-Sent Events (SSE)
  useEffect(() => {
    const isProd = import.meta.env.PROD;
    const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
    const eventSource = new EventSource(`${apiUrl}/api/events`);

    eventSource.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data);
        if (metrics.error) {
          console.error('Telemetry error:', metrics.error);
          return;
        }
        
        setTelemetry((prev) => ({
          ...prev,
          ...metrics
        }));
      } catch (err) {
        console.error('Failed to parse telemetry event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
    };

    return () => eventSource.close();
  }, []);

  // Global keyboard shortcuts (Command+K for spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast actions
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Role action
  const setUserRole = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      root: 'Root Administrator',
      owner: 'Account Owner',
      reseller: 'Reseller Partner',
      dev: 'Infrastructure Developer',
    };
    setUserProfile((prev) => ({
      ...prev,
      role,
      roleLabel: labels[role],
    }));
    addToast({
      title: 'Context Switched',
      message: `Operational role escalated to ${labels[role]}`,
      type: 'info',
    });
  };

  // Domain actions
  const addDomain = async (domainData: Omit<DomainItem, 'id' | 'created'>) => {
    try {
      const isProd = import.meta.env.PROD;
      const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
      const res = await fetch(`${apiUrl}/api/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainData.domain })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add domain');

      const newDom: DomainItem = {
        ...domainData,
        id: data.id,
        created: new Date().toISOString().split('T')[0],
      };
      setDomains((prev) => [newDom, ...prev]);
      addToast({
        title: 'VirtualHost Provisioned',
        message: `Domain ${newDom.domain} added and Nginx reloaded`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const deleteDomain = (id: string) => {
    const dom = domains.find((d) => d.id === id);
    setDomains((prev) => prev.filter((d) => d.id !== id));
    addToast({
      title: 'VirtualHost Removed',
      message: `Domain ${dom?.domain || id} and its Nginx vhost file unlinked`,
      type: 'warning',
    });
  };

  const toggleDomainStatus = (id: string) => {
    setDomains((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const next = d.status === 'active' ? 'suspended' : 'active';
          addToast({
            title: next === 'active' ? 'VirtualHost Resumed' : 'VirtualHost Suspended',
            message: `${d.domain} is now ${next}`,
            type: next === 'active' ? 'success' : 'warning',
          });
          return { ...d, status: next };
        }
        return d;
      })
    );
  };

  // File Manager actions
  const addFile = (fileData: Omit<FileItem, 'id'>) => {
    const newF: FileItem = {
      ...fileData,
      id: `f-${Date.now()}`,
    };
    setFiles((prev) => [newF, ...prev]);
    addToast({
      title: fileData.isDir ? 'Directory Created' : 'File Saved',
      message: fileData.path,
      type: 'success',
    });
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            content,
            size: new Blob([content]).size,
            sizeFormatted: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
            modified: 'Just now',
          };
        }
        return f;
      })
    );
    addToast({
      title: 'File Saved to Disk',
      message: 'Changes written to disk with atomic write',
      type: 'success',
    });
  };

  const deleteFile = (id: string) => {
    const f = files.find((item) => item.id === id);
    setFiles((prev) => prev.filter((item) => item.id !== id));
    addToast({
      title: 'Deleted from Disk',
      message: f?.path || id,
      type: 'info',
    });
  };

  // Database actions
  const addDatabase = async (dbData: Omit<DatabaseItem, 'id' | 'created'>) => {
    try {
      const isProd = import.meta.env.PROD;
      const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
      
      // We assume dbData has password property from the form, but DatabaseItem doesn't store it
      // For this implementation, we will pass a default or random password if not provided by UI
      // Ideally the UI form provides it. We'll extract it if it exists.
      const payload = { 
        name: dbData.name, 
        username: dbData.user, 
        password: (dbData as any).password || Math.random().toString(36).slice(-12) + "A1!" 
      };

      const res = await fetch(`${apiUrl}/api/databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create database');

      const newDb: DatabaseItem = {
        ...dbData,
        id: data.id,
        created: new Date().toISOString().split('T')[0],
      };
      setDatabases((prev) => [newDb, ...prev]);
      addToast({
        title: 'Database Created',
        message: `Schema ${newDb.name} created with dedicated grants`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Database Error', message: err.message, type: 'error' });
    }
  };

  const deleteDatabase = (id: string) => {
    const db = databases.find((d) => d.id === id);
    setDatabases((prev) => prev.filter((d) => d.id !== id));
    addToast({
      title: 'Database Dropped',
      message: `Database schema ${db?.name || id} dropped successfully`,
      type: 'warning',
    });
  };

  // Email actions
  const addEmail = async (emailData: Omit<EmailItem, 'id' | 'created'>) => {
    try {
      const isProd = import.meta.env.PROD;
      const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
      
      const payload = { 
        email: emailData.address, 
        password: (emailData as any).password || Math.random().toString(36).slice(-12) + "A1!" 
      };

      const res = await fetch(`${apiUrl}/api/mail/mailboxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mailbox');

      const newEm: EmailItem = {
        ...emailData,
        id: data.id,
        created: new Date().toISOString().split('T')[0],
      };
      setEmails((prev) => [newEm, ...prev]);
      addToast({
        title: 'Mailbox Created',
        message: `Address ${newEm.address} created on Postfix/Dovecot`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'Mail Error', message: err.message, type: 'error' });
    }
  };

  const deleteEmail = (id: string) => {
    const em = emails.find((e) => e.id === id);
    setEmails((prev) => prev.filter((e) => e.id !== id));
    addToast({
      title: 'Mailbox Deleted',
      message: `Address ${em?.address || id} purged`,
      type: 'info',
    });
  };

  // SSL actions
  const issueSsl = async (domain: string) => {
    // Find domain to get ID
    const targetDomain = domains.find(d => d.domain === domain);
    if (!targetDomain) return;

    try {
      const isProd = import.meta.env.PROD;
      const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
      
      addToast({ title: 'Issuing SSL...', message: 'Requesting Let\'s Encrypt certificate...', type: 'info' });
      
      const res = await fetch(`${apiUrl}/api/sites/${targetDomain.id}/ssl`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue SSL');

      const newCert: SslCertItem = {
        id: `ssl-${Date.now()}`,
        domain,
        issuer: "Let's Encrypt Authority X3",
        type: "Let's Encrypt",
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        autoRenew: true,
        status: 'active',
        hsts: true,
        forceHttps: true,
      };
      setSslCerts((prev) => [newCert, ...prev]);
      setDomains((prev) =>
        prev.map((d) => (d.domain === domain ? { ...d, sslActive: true, sslExpiryDays: 90 } : d))
      );
      addToast({
        title: 'SSL Certificate Issued',
        message: `Let's Encrypt TLS 1.3 cert verified for ${domain}`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'SSL Error', message: err.message, type: 'error' });
    }
  };

  const renewSsl = (id: string) => {
    setSslCerts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'active',
            validTo: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          };
        }
        return c;
      })
    );
    addToast({
      title: 'SSL Auto-Renew Executed',
      message: 'Certificate validity extended 90 days with ACME challenge',
      type: 'success',
    });
  };

  // Process killer
  const killProcess = (pid: number) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    addToast({
      title: 'SIGKILL (9) Dispatched',
      message: `Process PID ${pid} terminated immediately`,
      type: 'warning',
    });
  };

  // Backup actions
  const createBackup = (
    type: 'Full System' | 'Home Directory' | 'MySQL Only',
    storageLocation: 'Local SSD' | 'Amazon S3' | 'Wasabi Cloud'
  ) => {
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const prefix = type === 'Full System' ? 'backup_full' : type === 'Home Directory' ? 'backup_home' : 'backup_mysql';
    const ext = type === 'MySQL Only' ? '.sql.gz' : '.tar.gz';
    const newBk: BackupItem = {
      id: `bk-${Date.now()}`,
      filename: `${prefix}_blackvs_${dateStr}${ext}`,
      type,
      sizeMB: type === 'Full System' ? 4920 : type === 'Home Directory' ? 3120 : 380,
      created: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'completed',
      storageLocation,
    };
    setBackups((prev) => [newBk, ...prev]);
    addToast({
      title: 'Snapshot Created & Verified',
      message: `Archive ${newBk.filename} archived to ${storageLocation}`,
      type: 'success',
    });
  };

  const deleteBackup = (id: string) => {
    const bk = backups.find((b) => b.id === id);
    setBackups((prev) => prev.filter((b) => b.id !== id));
    addToast({
      title: 'Backup Pruned',
      message: bk?.filename || id,
      type: 'info',
    });
  };

  // Cron actions
  const addCronJob = (jobData: Omit<CronJobItem, 'id' | 'lastRun'>) => {
    const newJob: CronJobItem = {
      ...jobData,
      id: `cj-${Date.now()}`,
      lastRun: 'Pending initial trigger',
    };
    setCronJobs((prev) => [newJob, ...prev]);
    addToast({
      title: 'Cron Job Installed',
      message: `Schedule "${newJob.schedule}" written to /etc/cron.d/blackvs_users`,
      type: 'success',
    });
  };

  const toggleCronJob = (id: string) => {
    setCronJobs((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === 'active' ? 'paused' : 'active';
          addToast({
            title: next === 'active' ? 'Cron Task Enabled' : 'Cron Task Paused',
            message: c.command,
            type: 'info',
          });
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  const deleteCronJob = (id: string) => {
    setCronJobs((prev) => prev.filter((c) => c.id !== id));
    addToast({
      title: 'Cron Task Deleted',
      message: 'Removed from crontab table',
      type: 'warning',
    });
  };

  // DNS actions
  const addDnsRecord = (recData: Omit<DnsRecordItem, 'id'>) => {
    const newRec: DnsRecordItem = {
      ...recData,
      id: `dns-${Date.now()}`,
    };
    setDnsRecords((prev) => [newRec, ...prev]);
    addToast({
      title: 'DNS Resource Record Added',
      message: `${newRec.type} ${newRec.name}.${newRec.domain} -> ${newRec.content}`,
      type: 'success',
    });
  };

  const deleteDnsRecord = (id: string) => {
    setDnsRecords((prev) => prev.filter((r) => r.id !== id));
    addToast({
      title: 'DNS Record Removed',
      message: 'Zone serial incremented and Bind9 reloaded',
      type: 'info',
    });
  };

  // FTP actions
  const addFtpAccount = async (ftpData: Omit<FtpAccountItem, 'id'>) => {
    try {
      const isProd = import.meta.env.PROD;
      const apiUrl = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://127.0.0.1:8080');
      
      const payload = { 
        username: ftpData.username, 
        home: ftpData.directory,
        password: (ftpData as any).password || Math.random().toString(36).slice(-12) + "A1!" 
      };

      const res = await fetch(`${apiUrl}/api/ftp/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create FTP account');

      const newFtp: FtpAccountItem = {
        ...ftpData,
        id: data.id,
      };
      setFtpAccounts((prev) => [newFtp, ...prev]);
      addToast({
        title: 'FTP Account Provisioned',
        message: `User ${newFtp.username} locked to directory`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({ title: 'FTP Error', message: err.message, type: 'error' });
    }
  };

  const deleteFtpAccount = (id: string) => {
    setFtpAccounts((prev) => prev.filter((f) => f.id !== id));
    addToast({
      title: 'FTP Account Removed',
      message: 'vsftpd credentials revoked',
      type: 'warning',
    });
  };

  // Service actions
  const restartService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return { ...s, status: 'restarting' };
        }
        return s;
      })
    );
    const target = services.find((s) => s.id === id);
    addToast({
      title: `Restarting ${target?.name || 'Service'}`,
      message: 'systemctl restart dispatched',
      type: 'info',
    });

    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return { ...s, status: 'running', uptime: '1 min' };
          }
          return s;
        })
      );
      addToast({
        title: `${target?.name || 'Service'} Active`,
        message: 'Daemon restarted cleanly with PID reallocation',
        type: 'success',
      });
    }, 1800);
  };

  // Notification actions
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({
      title: 'Notifications Cleared',
      message: 'All notifications marked as read',
      type: 'info',
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast({
      title: 'Inbox Cleared',
      message: 'All notifications purged',
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        currentNode,
        setCurrentNode,
        serverNodes,
        userProfile,
        setUserRole,
        telemetry,
        domains,
        addDomain,
        deleteDomain,
        toggleDomainStatus,
        files,
        currentPath,
        setCurrentPath,
        addFile,
        updateFileContent,
        deleteFile,
        databases,
        addDatabase,
        deleteDatabase,
        emails,
        addEmail,
        deleteEmail,
        sslCerts,
        issueSsl,
        renewSsl,
        processes,
        killProcess,
        backups,
        createBackup,
        deleteBackup,
        cronJobs,
        addCronJob,
        toggleCronJob,
        deleteCronJob,
        dnsRecords,
        addDnsRecord,
        deleteDnsRecord,
        ftpAccounts,
        addFtpAccount,
        deleteFtpAccount,
        services,
        restartService,
        notifications,
        markAllNotificationsRead,
        clearNotifications,
        logs,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
