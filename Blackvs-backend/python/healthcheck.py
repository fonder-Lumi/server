#!/usr/bin/env python3
import json, shutil, socket, subprocess, time

def active(name):
    p = subprocess.run(["systemctl","is-active",name], capture_output=True, text=True)
    return p.stdout.strip() == "active"

print(json.dumps({
    "hostname": socket.gethostname(),
    "timestamp": time.time(),
    "root_disk": shutil.disk_usage("/")._asdict(),
    "services": {x: active(x) for x in ["nginx","mariadb","vsftpd","postfix","dovecot"]}
}, indent=2))
