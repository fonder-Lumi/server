import {
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
  UserProfile,
  PartitionInfo,
} from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alexander Vance',
  email: 'bxserver495@gmail.com',
  role: 'root',
  roleLabel: 'Root Administrator',
  avatarUrl: '/src/assets/images/avatar_admin_user_1790565045486.jpg',
  accountId: 'BVS-9482-ORD',
  mfaEnabled: true,
};

export const serverNodesList: ServerNode[] = [
  {
    id: 'node-us-east-1',
    name: 'US-East Production',
    hostname: 'metal01.blackvs.io',
    ip: '192.241.144.18',
    datacenter: 'Equinix NY5, Secaucus NJ',
    os: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
    kernel: 'Linux 6.8.0-40-generic x86_64',
    uptime: '0 days, 0 hours, 0 mins',
    status: 'nominal',
  },
  {
    id: 'node-eu-west-1',
    name: 'EU-Central Edge',
    hostname: 'edge02.frankfurt.blackvs.io',
    ip: '159.65.120.44',
    datacenter: 'Interxion FRA1, Frankfurt',
    os: 'Debian GNU/Linux 12 (Bookworm)',
    kernel: 'Linux 6.1.0-22-amd64 x86_64',
    uptime: '0 days, 0 hours, 0 mins',
    status: 'nominal',
  },
  {
    id: 'node-ap-sg-1',
    name: 'AP-Southeast Replica',
    hostname: 'sgp01.singapore.blackvs.io',
    ip: '128.199.202.91',
    datacenter: 'Global Switch, Singapore',
    os: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
    kernel: 'Linux 6.8.0-38-generic x86_64',
    uptime: '0 days, 0 hours, 0 mins',
    status: 'nominal',
  },
];

export const initialTelemetry: SystemTelemetry = {
  cpuUsage: 0,
  cpuCores: 16,
  cpuModel: 'AMD EPYC™ 9354 32-Core Processor',
  cpuIowait: 0,
  cpuUser: 0,
  cpuSystem: 0,
  memoryUsedGB: 0,
  memoryTotalGB: 64.0,
  memoryBuffersGB: 0,
  memoryCachedGB: 0,
  diskUsedGB: 0,
  diskTotalGB: 960.0,
  bandwidthUsedTB: 0,
  bandwidthTotalTB: 20.0,
  inodesUsed: 1200,
  inodesTotal: 4800000,
  openFileDescriptors: 128,
  maxFileDescriptors: 65536,
  rootPartitionUsage: 0,
  maxPartitionUsage: 0,
  uptimeMinutes: 0,
  uptimeFormatted: '0 days, 0h 0m',
  loadAverage: [0, 0, 0],
  iopsRead: 0,
  iopsWrite: 0,
  diskReadMBps: 0,
  diskWriteMBps: 0,
  diskIoWaitMs: 0,
  networkIngressMbps: 0,
  networkEgressMbps: 0,
  partitions: [] as PartitionInfo[],
};

export const initialDomains: DomainItem[] = [];
export const initialFiles: FileItem[] = [];
export const initialDatabases: DatabaseItem[] = [];
export const initialEmails: EmailItem[] = [];
export const initialSslCerts: SslCertItem[] = [];
export const initialProcesses: ProcessItem[] = [];
export const initialBackups: BackupItem[] = [];
export const initialCronJobs: CronJobItem[] = [];
export const initialDnsRecords: DnsRecordItem[] = [];
export const initialFtpAccounts: FtpAccountItem[] = [];

export const initialServices: ServiceItem[] = [
  { id: 'svc-nginx', name: 'Nginx', category: 'web', version: '1.26.2', port: 80, status: 'running', memoryMB: 184, uptime: '42d 16h' },
  { id: 'svc-phpfpm', name: 'PHP-FPM', category: 'web', version: '8.3.12', port: 9000, status: 'running', memoryMB: 512, uptime: '42d 16h' },
  { id: 'svc-mariadb', name: 'MariaDB', category: 'database', version: '11.4.3', port: 3306, status: 'running', memoryMB: 1840, uptime: '42d 15h' },
  { id: 'svc-redis', name: 'Redis', category: 'cache', version: '7.4.1', port: 6379, status: 'running', memoryMB: 88, uptime: '42d 15h' },
  { id: 'svc-docker', name: 'Docker', category: 'system', version: '27.3.1', port: 2375, status: 'running', memoryMB: 420, uptime: '42d 14h' },
  { id: 'svc-postfix', name: 'Postfix / Dovecot', category: 'mail', version: '3.8.6', port: 25, status: 'running', memoryMB: 210, uptime: '42d 14h' },
  { id: 'svc-ufw', name: 'UFW Firewall', category: 'system', version: '0.36.2', port: 0, status: 'running', memoryMB: 8, uptime: '142d 16h' },
];

export const initialNotifications: NotificationItem[] = [];
export const initialLogs: LogEntry[] = [];
