import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Terminal, Trash2, ArrowUpRight } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
}

export const TerminalView: React.FC = () => {
  const { currentNode, telemetry } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'output',
      content: `Welcome to BlackVs Web Terminal (OpenSSH 9.6p1 / x86_64-pc-linux-gnu)\nTarget Host: ${currentNode.hostname} [${currentNode.ip}]\nType "help" for a list of diagnostic commands.\n`,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    // Echo input
    const inputLine: TerminalLine = {
      id: `in-${Date.now()}`,
      type: 'input',
      content: trimmed,
    };

    let response = '';
    let isError = false;

    const lower = trimmed.toLowerCase();

    if (lower === 'clear') {
      setLines([]);
      return;
    } else if (lower === 'help') {
      response = `BlackVs Shell Commands:
  help                    Show this manual
  uptime                  System uptime & load average
  free -m                 Display memory consumption in MB
  df -h                   Show file system disk usage
  htop                    Inspect active tasks and CPU threads
  uname -a                Kernel architecture and release
  ls -la                  List files in /home/blackvs/public_html
  php -v                  Show active PHP-FPM runtime version
  node -v                 Show active Node.js version
  systemctl status nginx  Display Nginx daemon status
  docker ps               List containerized microservices
  clear                   Clear terminal window`;
    } else if (lower === 'uptime') {
      response = ` 20:12:44 up 142 days, 16:24,  2 users,  load average: ${telemetry.loadAverage.join(', ')}`;
    } else if (lower === 'free -m' || lower === 'free') {
      response = `               total        used        free      shared  buff/cache   available
Mem:           64382       14540       38102         824       11740       49018
Swap:           8192           0        8192`;
    } else if (lower === 'df -h' || lower === 'df') {
      response = `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  940G  185G  708G  21% /
udev             32G     0   32G   0% /dev
tmpfs           6.3G  2.1M  6.3G   1% /run
/dev/nvme1n1    1.8T  420G  1.3T  25% /home/blackvs/backups`;
    } else if (lower === 'uname -a') {
      response = `Linux ${currentNode.hostname} 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux`;
    } else if (lower === 'htop') {
      response = `Tasks: 184 total,   1 running, 183 sleeping,   0 stopped,   0 zombie
%Cpu(s):  ${telemetry.cpuUsage} us,  1.2 sy,  0.0 ni, 95.8 id,  0.2 wa,  0.0 hi,  0.1 si
MiB Mem :  64382.4 total,  38102.1 free,  14540.3 used,  11740.0 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 www-data  20   0  524100  84200  32100 S   6.8   4.2  18:42.10 nginx
 3840 mysql     20   0 2481000 118000 148200 S   4.1  18.4  92:14.02 mariadbd
 2190 blackvs   20   0  382100  68200  18400 S   3.2   6.8  34:10.19 php-fpm
 5690 blackvs   20   0  894100 114200  28400 S   1.9   5.2  12:08.44 node server.js`;
    } else if (lower === 'ls -la' || lower === 'ls') {
      response = `total 36
drwxr-xr-x 4 blackvs blackvs 4096 Sep 26 19:40 .
drwxr-xr-x 8 blackvs blackvs 4096 Sep 24 14:12 ..
-rw-r--r-- 1 blackvs blackvs  840 Sep 22 17:15 .htaccess
-rw-r--r-- 1 blackvs blackvs 3420 Sep 26 19:40 index.html
-rw------- 1 blackvs blackvs 1520 Sep 25 08:22 config.php
-rw-r--r-- 1 blackvs blackvs  210 Sep 10 12:00 robots.txt
drwxr-xr-x 2 blackvs blackvs 4096 Sep 20 09:30 assets
drwxr-xr-x 3 blackvs blackvs 4096 Sep 20 09:30 wp-content`;
    } else if (lower.includes('php -v')) {
      response = `PHP 8.3.8 (cli) (built: Jun  6 2024 12:04:18) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.8, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.8, Copyright (c), by Zend Technologies
    with Zend JIT v8.3.8, Copyright (c), by Zend Technologies`;
    } else if (lower.includes('node -v')) {
      response = `v20.14.0 (LTS Iron)`;
    } else if (lower.includes('systemctl status')) {
      response = `● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-05-08 04:12:08 UTC; 142 days ago
   Main PID: 1420 (nginx)
      Tasks: 17 (limit: 76800)
     Memory: 84.2M
        CPU: 1h 14min 22.410s`;
    } else if (lower.includes('docker ps')) {
      response = `CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS                    NAMES
8f91a4b82c10   redis:7.2.4-alpine   "docker-entrypoint.s…"   45 days ago    Up 45 days    0.0.0.0:6379->6379/tcp   blackvs-cache-01
d48104e12fa8   mariadb:11.2-jammy   "docker-entrypoint.s…"   89 days ago    Up 89 days    0.0.0.0:3306->3306/tcp   blackvs-mariadb-01`;
    } else {
      isError = true;
      response = `bash: command not found: ${trimmed}. Type "help" for a list of built-in commands.`;
    }

    const outputLine: TerminalLine = {
      id: `out-${Date.now()}`,
      type: isError ? 'error' : 'output',
      content: response,
    };

    setLines((prev) => [...prev, inputLine, outputLine]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setInputVal('');
        } else {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx]);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--app-fg)] tracking-tight">
            Web Terminal & SSH Shell
          </h1>
          <p className="text-xs sm:text-sm text-[var(--app-fg-muted)]">
            Encrypted pseudo-terminal session connected to {currentNode.hostname}
          </p>
        </div>

        {/* Quick action chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['htop', 'df -h', 'free -m', 'uptime', 'docker ps', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              className="px-2.5 py-1 text-xs font-mono text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] bg-[var(--app-input-bg)] hover:bg-white/10 rounded-lg border border-[var(--app-border)] transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window Container */}
      <div
        className="rounded-2xl border border-[var(--app-border)] bg-black shadow-2xl flex flex-col h-[650px] overflow-hidden cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Window Chrome Title Bar */}
        <div className="h-10 px-4 border-b border-white/10 bg-neutral-950 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-neutral-400">
              blackvs@{currentNode.hostname}:~
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
            <span>xterm-256color</span>
            <button
              onClick={() => setLines([])}
              className="hover:text-white transition-colors"
              title="Clear output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 select-text leading-relaxed bg-black">
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="flex items-center gap-2 text-white">
                  <span className="text-emerald-400 font-semibold">blackvs@{currentNode.hostname.split('.')[0]}:~$</span>
                  <span>{line.content}</span>
                </div>
              );
            }
            return (
              <div
                key={line.id}
                className={`whitespace-pre-wrap ${
                  line.type === 'error' ? 'text-rose-400' : 'text-neutral-300'
                }`}
              >
                {line.content}
              </div>
            );
          })}

          {/* Active Command Prompt Line */}
          <div className="flex items-center gap-2 text-white pt-1">
            <span className="text-emerald-400 font-semibold shrink-0">
              blackvs@{currentNode.hostname.split('.')[0]}:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none caret-white"
            />
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
