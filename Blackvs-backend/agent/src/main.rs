use axum::{extract::Path, routing::{get, post}, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{net::SocketAddr, process::{Command, Stdio}, io::Write};
use sysinfo::System;
use tower_http::trace::TraceLayer;

#[derive(Serialize)]
struct Health { ok: bool, service: &'static str }
#[derive(Deserialize)] struct SiteReq { domain:String }
#[derive(Deserialize)] struct DbReq { name:String, username:String, password:String }
#[derive(Deserialize)] struct FtpReq { username:String, home:String, password:String }
#[derive(Deserialize)] struct MailReq { domain:String }
#[derive(Deserialize)] struct MailboxReq { email:String, password:String }

fn valid_domain(s:&str)->bool {
    s.len()<=253 && s.split('.').count()>=2 &&
    s.chars().all(|c| c.is_ascii_alphanumeric() || c=='.' || c=='-')
}
fn safe_name(s:&str,max:usize)->bool {
    !s.is_empty() && s.len()<=max && s.chars().all(|c| c.is_ascii_alphanumeric() || c=='_' || c=='-')
}
fn run(program:&str,args:&[&str])->Result<String,String>{
    let o=Command::new(program).args(args).output().map_err(|e|e.to_string())?;
    if !o.status.success(){return Err(String::from_utf8_lossy(&o.stderr).to_string())}
    Ok(String::from_utf8_lossy(&o.stdout).to_string())
}

async fn health()->Json<Health>{Json(Health{ok:true,service:"blackvs-agent"})}

async fn server()->Json<Value>{
    let mut s=System::new_all(); s.refresh_all();
    let l=System::load_average();
    Json(json!({
        "hostname":System::host_name(),"os":System::long_os_version(),
        "kernel":System::kernel_version(),"uptime_seconds":System::uptime(),
        "cpu_count":s.cpus().len(),"memory_total_bytes":s.total_memory(),
        "memory_used_bytes":s.used_memory(),
        "load_average":{"one":l.one,"five":l.five,"fifteen":l.fifteen}
    }))
}

async fn metrics()->Json<Value>{
    let mut s=System::new_all(); s.refresh_all();
    let cpu=s.cpus().iter().map(|c|c.cpu_usage()).sum::<f32>() / s.cpus().len().max(1) as f32;
    let disks:Vec<Value>=s.disks().iter().map(|d|json!({
        "name":d.name().to_string_lossy(),"mount":d.mount_point().to_string_lossy(),
        "total":d.total_space(),"available":d.available_space()
    })).collect();
    let l=System::load_average();
    Json(json!({
        "timestamp":format!("{}",System::uptime()),
        "cpu_usage_percent":cpu,
        "memory":{"total":s.total_memory(),"used":s.used_memory(),"available":s.available_memory()},
        "swap":{"total":s.total_swap(),"used":s.used_swap()},
        "load":{"one":l.one,"five":l.five,"fifteen":l.fifteen},
        "uptime_seconds":System::uptime(),"disks":disks
    }))
}

async fn services()->Json<Value>{
    let names=["nginx","mysql","mariadb","vsftpd","postfix","dovecot"];
    let list:Vec<Value>=names.iter().map(|n|{
        let active=Command::new("systemctl").args(["is-active",n]).output()
            .map(|o|String::from_utf8_lossy(&o.stdout).trim()=="active").unwrap_or(false);
        json!({"name":n,"active":active})
    }).collect();
    Json(json!(list))
}

async fn service(Path((name,action)):Path<(String,String)>)->Json<Value>{
    let names=["nginx","mysql","mariadb","vsftpd","postfix","dovecot"];
    let actions=["start","stop","restart","status"];
    if !names.contains(&name.as_str()) || !actions.contains(&action.as_str()){
        return Json(json!({"ok":false,"error":"unsupported service/action"}))
    }
    match run("systemctl",&[&action,&name]){
        Ok(out)=>Json(json!({"ok":true,"service":name,"action":action,"output":out})),
        Err(e)=>Json(json!({"ok":false,"error":e}))
    }
}

async fn site_create(Json(req):Json<SiteReq>)->Json<Value>{
    if !valid_domain(&req.domain){return Json(json!({"ok":false,"error":"invalid domain"}))}
    let root=format!("/var/www/{}",req.domain);
    let public=format!("{}/public",root);
    if let Err(e)=run("mkdir",&["-p",&public]){return Json(json!({"ok":false,"error":e}))}
    let index=format!("{}/index.php",public);
    let _=run("bash",&["-lc",&format!("printf '%s' '{}' > '{}'",format!("<?php\necho '<h1>{}</h1><p>BlackVS hosting is ready with PHP support!</p>';\nphpinfo();\n?>",req.domain),index)]);
    
    // Nginx config with PHP-FPM support (defaults to php8.3-fpm, standard on Ubuntu 24.04)
    let conf=format!(r#"server {{
    listen 80;
    server_name {0} www.{0};
    root {1};
    index index.php index.html index.htm;
    
    location / {{
        try_files $uri $uri/ /index.php?$query_string;
    }}

    location ~ \.php$ {{
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }}
    
    location ~ /\.ht {{
        deny all;
    }}
}}"#,req.domain,public);
    let confpath=format!("/etc/nginx/sites-available/{}",req.domain);
    if let Err(e)=run("bash",&["-lc",&format!("printf '%s' '{}' > '{}' && ln -sf '{}' '/etc/nginx/sites-enabled/{}'",
        conf.replace('\'',"'\''"),confpath,confpath,req.domain)]) {
        return Json(json!({"ok":false,"error":e}))
    }
    let test=run("nginx",&["-t"]);
    if let Err(e)=test{return Json(json!({"ok":false,"error":e}))}
    match run("systemctl",&["reload","nginx"]){
        Ok(_)=>Json(json!({"ok":true,"root":root})),
        Err(e)=>Json(json!({"ok":false,"error":e}))
    }
}

async fn site_reload(Json(req):Json<SiteReq>)->Json<Value>{
    if !valid_domain(&req.domain){return Json(json!({"ok":false,"error":"invalid domain"}))}
    match run("systemctl",&["reload","nginx"]){
        Ok(_)=>Json(json!({"ok":true})),Err(e)=>Json(json!({"ok":false,"error":e}))
    }
}

#[derive(Deserialize)] struct SslReq { domain: String, email: Option<String> }
async fn site_ssl(Json(req): Json<SslReq>) -> Json<Value> {
    if !valid_domain(&req.domain) { return Json(json!({"ok":false,"error":"invalid domain"})) }
    let email = req.email.unwrap_or_else(|| format!("admin@{}", req.domain));
    
    // Install SSL via Certbot
    let out = run("certbot", &["--nginx", "-d", &req.domain, "-d", &format!("www.{}", req.domain), "--non-interactive", "--agree-tos", "-m", &email]);
    match out {
        Ok(o) => Json(json!({"ok":true,"output":o})),
        Err(e) => Json(json!({"ok":false,"error":e}))
    }
}

async fn database_create(Json(req):Json<DbReq>)->Json<Value>{
    if !safe_name(&req.name,48)||!safe_name(&req.username,32)||req.password.len()<12{
        return Json(json!({"ok":false,"error":"invalid database input"}))
    }
    let sql=format!("CREATE DATABASE `{}`; CREATE USER '{}'@'localhost' IDENTIFIED BY '{}'; GRANT ALL PRIVILEGES ON `{}`.* TO '{}'@'localhost'; FLUSH PRIVILEGES;",
        req.name,req.username,req.password.replace('\'',"''"),req.name,req.username);
    match run("mysql",&["-e",&sql]){
        Ok(_)=>Json(json!({"ok":true,"database":req.name,"username":req.username})),
        Err(e)=>Json(json!({"ok":false,"error":e}))
    }
}

async fn ftp_create(Json(req):Json<FtpReq>)->Json<Value>{
    if !safe_name(&req.username,32)||req.password.len()<12{return Json(json!({"ok":false,"error":"invalid FTP input"}))}
    let home=if req.home.is_empty(){format!("/var/www/{}",req.username)}else{req.home.clone()};
    if !home.starts_with("/var/www/"){return Json(json!({"ok":false,"error":"FTP home must be inside /var/www"}))}
    if let Err(e)=run("useradd",&["-m","-d",&home,"-s","/usr/sbin/nologin",&req.username]){
        return Json(json!({"ok":false,"error":e}))
    }
    let mut child=match Command::new("chpasswd").stdin(Stdio::piped()).spawn(){
        Ok(c)=>c,Err(e)=>return Json(json!({"ok":false,"error":e.to_string()}))
    };
    if let Some(mut stdin)=child.stdin.take(){let _=stdin.write_all(format!("{}:{}\n",req.username,req.password).as_bytes());}
    match child.wait(){
        Ok(s) if s.success()=>Json(json!({"ok":true,"username":req.username,"home":home})),
        _=>Json(json!({"ok":false,"error":"unable to set FTP password"}))
    }
}

async fn mail_domain(Json(req):Json<MailReq>)->Json<Value>{
    if !valid_domain(&req.domain){return Json(json!({"ok":false,"error":"invalid domain"}))}
    let _ = run("bash", &["-c", &format!("echo '{} OK' >> /etc/postfix/virtual_domains && touch /etc/postfix/virtual_domains && postmap /etc/postfix/virtual_domains", req.domain)]);
    let _ = run("systemctl", &["reload", "postfix"]);
    Json(json!({"ok":true,"domain":req.domain,
        "note":"Domain added to Postfix virtual_domains. Configure DNS (MX, SPF, DKIM, DMARC)."}))
}

async fn mail_mailbox(Json(req):Json<MailboxReq>)->Json<Value>{
    let parts: Vec<&str> = req.email.split('@').collect();
    if parts.len() != 2 || !valid_domain(parts[1]) {
        return Json(json!({"ok":false,"error":"invalid email"}));
    }
    let _ = run("bash", &["-c", &format!("touch /etc/dovecot/users && echo '{}|{}' >> /etc/dovecot/users", req.email, req.password.replace('\'',"''"))]);
    let _ = run("systemctl", &["reload", "dovecot"]);
    Json(json!({"ok":true,"email":req.email, "note":"Mailbox added to Dovecot users."}))
}

#[tokio::main]
async fn main(){
    let app=Router::new()
        .route("/health",get(health)).route("/server",get(server))
        .route("/metrics",get(metrics)).route("/services",get(services))
        .route("/service/{name}/{action}",post(service))
        .route("/site/create",post(site_create)).route("/site/reload",post(site_reload))
        .route("/site/ssl",post(site_ssl))
        .route("/database/create",post(database_create)).route("/ftp/create",post(ftp_create))
        .route("/mail/domain",post(mail_domain)).route("/mail/mailbox",post(mail_mailbox)).layer(TraceLayer::new_for_http());
    let addr:SocketAddr="0.0.0.0:9100".parse().unwrap();
    println!("BlackVS agent listening on {}",addr);
    let listener=tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener,app).await.unwrap();
}
