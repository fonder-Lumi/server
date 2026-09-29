export type ThemeMode = 'obsidian' | 'midnight' | 'slate' | 'light';

export type ActiveTab =
  | 'dashboard'
  | 'domains'
  | 'file-manager'
  | 'mysql'
  | 'emails'
  | 'ssl'
  | 'resources'
  | 'backups'
  | 'php-node'
  | 'ftp'
  | 'dns'
  | 'security'
  | 'vps'
  | 'terminal'
  | 'cron'
  | 'logs'
  | 'billing'
  | 'settings';

export type UserRole = 'root' | 'owner' | 'reseller' | 'dev';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarUrl: string;
  accountId: string;
  mfaEnabled: boolean;
}

export interface ServerNode {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  datacenter: string;
  os: string;
  kernel: string;
  uptime: string;
  status: 'nominal' | 'degraded' | 'maintenance';
}

export interface PartitionInfo {
  id: string;
  filesystem: string;
  ip: string;
  partition: string;
  availableSpace: string;
  totalSpace: string;
  usagePercent: number;
  status: 'nominal' | 'warning' | 'critical';
  mountOptions?: string;
}

export interface AlertRule {
  id: string;
  metric: string;
  condition: string;
  threshold: string;
  severity: 'info' | 'warning' | 'critical';
  state: 'firing' | 'resolved' | 'pending';
  lastTriggered: string;
}

export interface SystemTelemetry {
  cpuUsage: number; // percentage
  cpuCores: number;
  cpuModel: string;
  cpuIowait: number;
  cpuUser: number;
  cpuSystem: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  memoryBuffersGB: number;
  memoryCachedGB: number;
  diskUsedGB: number;
  diskTotalGB: number;
  bandwidthUsedTB: number;
  bandwidthTotalTB: number;
  inodesUsed: number;
  inodesTotal: number;
  openFileDescriptors: number;
  maxFileDescriptors: number;
  rootPartitionUsage: number;
  maxPartitionUsage: number;
  uptimeMinutes: number;
  uptimeFormatted: string;
  loadAverage: [number, number, number];
  iopsRead: number;
  iopsWrite: number;
  diskReadMBps: number;
  diskWriteMBps: number;
  diskIoWaitMs: number;
  networkIngressMbps: number;
  networkEgressMbps: number;
  partitions: PartitionInfo[];
}

export interface DomainItem {
  id: string;
  domain: string;
  type: 'primary' | 'subdomain' | 'alias' | 'redirect';
  documentRoot: string;
  phpVersion: string;
  sslActive: boolean;
  sslIssuer: string;
  sslExpiryDays: number;
  redirectUrl?: string;
  bandwidthMB: number;
  status: 'active' | 'suspended';
  created: string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  size: number; // in bytes
  sizeFormatted: string;
  modified: string;
  permissions: string; // e.g. "0644"
  extension?: string;
  content?: string;
}

export interface DatabaseItem {
  id: string;
  name: string;
  user: string;
  sizeMB: number;
  tablesCount: number;
  collation: string;
  charset: string;
  created: string;
}

export interface EmailItem {
  id: string;
  address: string;
  domain: string;
  quotaUsedMB: number;
  quotaLimitMB: number;
  status: 'active' | 'suspended';
  created: string;
}

export interface SslCertItem {
  id: string;
  domain: string;
  issuer: string;
  type: 'Let\'s Encrypt' | 'Custom Sectigo' | 'Cloudflare Wildcard';
  validFrom: string;
  validTo: string;
  autoRenew: boolean;
  status: 'active' | 'expiring_soon' | 'expired';
  hsts: boolean;
  forceHttps: boolean;
}

export interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  time: string;
  command: string;
}

export interface BackupItem {
  id: string;
  filename: string;
  type: 'Full System' | 'Home Directory' | 'MySQL Only';
  sizeMB: number;
  created: string;
  status: 'completed' | 'in_progress';
  storageLocation: 'Local SSD' | 'Amazon S3' | 'Wasabi Cloud';
}

export interface CronJobItem {
  id: string;
  schedule: string;
  scheduleDescription: string;
  command: string;
  emailAlert: string;
  status: 'active' | 'paused';
  lastRun: string;
}

export interface DnsRecordItem {
  id: string;
  domain: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'CAA';
  name: string;
  content: string;
  ttl: number;
  priority?: number;
}

export interface FtpAccountItem {
  id: string;
  username: string;
  directory: string;
  quotaMB: number; // 0 for unlimited
  status: 'active' | 'suspended';
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'web' | 'database' | 'cache' | 'mail' | 'system';
  version: string;
  port: number;
  status: 'running' | 'stopped' | 'restarting';
  memoryMB: number;
  uptime: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'access' | 'error' | 'mysql' | 'auth';
  ip: string;
  status?: number;
  method?: string;
  path?: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
