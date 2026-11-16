const { facelessReply, sendAwait } = require('../lib/function');
const axios = require('axios');
const dns = require('dns').promises;
const { exec } = require('child_process');

module.exports = {
  name: "network",
  async run(sock, m, jid, cmd, args, text, isOwner, isGroup, sender){

    const netCmds = ['ping','speedtest','speed','whois','dns','lookup','nslookup','ipinfo','port','headers','ssl','checksite','uptime','traceroute','mac','myip'];
    if(!netCmds.includes(cmd)) return false;

    // ================= PING - REAL latency =================
    if(cmd === 'ping'){
      const start = Date.now();
      await sendAwait(sock, jid, m);
      try{
        await axios.get('https://www.google.com', { timeout: 5000 });
        const latency = Date.now() - start;
        await facelessReply(sock, jid, `Pong! 🏓\nLatency: ${latency}ms\nUptime: ${Math.floor(process.uptime()/60)} mins\nRAM: ${(process.memoryUsage().heapUsed/1024/1024).toFixed(1)} MB`, m);
      }catch(e){ await facelessReply(sock, jid, `Ping Failed: ${e.message}`, m); }
      return true;
    }

    // ================= MY IP - REAL =================
    if(cmd === 'myip'){
      await sendAwait(sock, jid, m);
      try{
        const res = await axios.get('https://api.ipify.org?format=json');
        const info = await axios.get(`http://ip-api.com/json/${res.data.ip}`);
        await facelessReply(sock, jid, `Bot Server IP:\nIP: ${info.data.query}\nCountry: ${info.data.country}\nCity: ${info.data.city}\nISP: ${info.data.isp}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SPEEDTEST - REAL download speed =================
    if(cmd === 'speedtest' || cmd === 'speed'){
      await sendAwait(sock, jid, m);
      try{
        const start = Date.now();
        // Real: download 1MB test file from Cloudflare
        const res = await axios.get('https://speed.cloudflare.com/__down?bytes=1000000', { responseType: 'arraybuffer', timeout: 30000 });
        const elapsed = (Date.now() - start) / 1000;
        const mbps = ((res.data.byteLength * 8) / elapsed / 1000000).toFixed(2);
        await facelessReply(sock, jid, `Speed Test:\nDownload: ${mbps} Mbps\nTest Size: 1 MB\nTime: ${elapsed.toFixed(2)}s\nServer: Cloudflare`, m);
      }catch(e){ await facelessReply(sock, jid, `Speedtest Failed: ${e.message}`, m); }
      return true;
    }

    // ================= DNS / NSLOOKUP - REAL Node DNS =================
    if(cmd === 'dns' || cmd === 'lookup' || cmd === 'nslookup'){
      await sendAwait(sock, jid, m);
      const domain = text.replace(/https?:\/\//,'').split('/')[0];
      if(!domain){ await facelessReply(sock, jid, "Usage: .dns <domain e.g google.com>", m); return true; }
      try{
        const [a, mx, txt] = await Promise.allSettled([
          dns.resolve4(domain),
          dns.resolveMx(domain),
          dns.resolveTxt(domain)
        ]);
        const ip = a.status === 'fulfilled' ? a.value.join(', ') : 'N/A';
        const mxStr = mx.status === 'fulfilled' ? mx.value.map(x=>x.exchange).join(', ') : 'N/A';
        await facelessReply(sock, jid, `DNS Lookup: ${domain}\nA Records (IP): ${ip}\nMX Records: ${mxStr}`, m);
      }catch(e){ await facelessReply(sock, jid, `DNS Failed: ${e.message}`, m); }
      return true;
    }

    // ================= WHOIS - REAL whois API =================
    if(cmd === 'whois'){
      await sendAwait(sock, jid, m);
      const domain = text.replace(/https?:\/\//,'').split('/')[0];
      if(!domain){ await facelessReply(sock, jid, "Usage: .whois <domain>", m); return true; }
      try{
        const res = await axios.get(`https://who-dat.net/api/v1/whois/${domain}`, { timeout: 15000 });
        const d = res.data;
        await facelessReply(sock, jid, `Whois: ${domain}\nRegistrar: ${d.registrar || 'N/A'}\nCreated: ${d.created_date || 'N/A'}\nExpires: ${d.expiration_date || 'N/A'}\nStatus: ${d.status || 'N/A'}\nName Servers: ${(d.name_servers||[]).join(', ') || 'N/A'}`, m);
      }catch{
        // Fallback to RDAP - real
        try{
          const res2 = await axios.get(`https://rdap.org/domain/${domain}`);
          const d2 = res2.data;
          const registrar = d2.entities?.find(e=>e.roles?.includes('registrar'))?.vcardArray?.[1]?.find(f=>f[0]==='fn')?.[3] || 'N/A';
          await facelessReply(sock, jid, `Whois: ${domain}\nRegistrar: ${registrar}\nStatus: ${d2.status?.join(', ') || 'N/A'}\nNameservers: ${d2.nameservers?.map(n=>n.ldhName).join(', ') || 'N/A'}`, m);
        }catch(e){ await facelessReply(sock, jid, `Whois Failed: ${e.message}`, m); }
      }
      return true;
    }

    // ================= IPINFO - REAL ip-api =================
    if(cmd === 'ipinfo'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .ipinfo <ip>", m); return true; }
      try{
        const res = await axios.get(`http://ip-api.com/json/${text}?fields=status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        const d = res.data;
        if(d.status !== 'success') throw new Error("Invalid IP");
        await facelessReply(sock, jid, `IP Info: ${d.query}\nCountry: ${d.country} (${d.countryCode})\nRegion: ${d.regionName}\nCity: ${d.city} ${d.zip}\nCoords: ${d.lat}, ${d.lon}\nTimezone: ${d.timezone}\nISP: ${d.isp}\nOrg: ${d.org}\nAS: ${d.as}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= HEADERS - REAL =================
    if(cmd === 'headers'){
      await sendAwait(sock, jid, m);
      let url = text;
      if(!url.startsWith('http')) url = 'https://' + url;
      if(!text){ await facelessReply(sock, jid, "Usage: .headers <website>", m); return true; }
      try{
        const res = await axios.head(url, { timeout: 10000 });
        let txt = `Headers For: ${url}\nStatus: ${res.status}\n\n`;
        for(const k in res.headers) txt += `${k}: ${res.headers[k]}\n`;
        await facelessReply(sock, jid, txt.slice(0,3000), m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= SSL - REAL =================
    if(cmd === 'ssl'){
      await sendAwait(sock, jid, m);
      const domain = text.replace(/https?:\/\//,'').split('/')[0];
      if(!domain){ await facelessReply(sock, jid, "Usage: .ssl <domain>", m); return true; }
      try{
        const res = await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&fromCache=on&maxAge=24`, { timeout: 15000 });
        const d = res.data;
        await facelessReply(sock, jid, `SSL Check: ${domain}\nStatus: ${d.status}\nGrade: ${d.endpoints?.[0]?.grade || 'Pending'}\nIP: ${d.endpoints?.[0]?.ipAddress || 'N/A'}`, m);
      }catch(e){ await facelessReply(sock, jid, `SSL Check Failed - Try Again In 1 Min: ${e.message}`, m); }
      return true;
    }

    // ================= CHECKSITE / UPTIME - REAL =================
    if(cmd === 'checksite' || cmd === 'uptime'){
      await sendAwait(sock, jid, m);
      let url = text;
      if(!url.startsWith('http')) url = 'https://' + url;
      if(!text){ await facelessReply(sock, jid, "Usage: .checksite <website>", m); return true; }
      try{
        const start = Date.now();
        const res = await axios.get(url, { timeout: 10000, validateStatus: () => true });
        const time = Date.now() - start;
        const status = res.status >= 200 && res.status < 400 ? 'UP ✅' : 'DOWN ❌';
        await facelessReply(sock, jid, `Site Check: ${url}\nStatus: ${status}\nHTTP Code: ${res.status}\nResponse Time: ${time}ms`, m);
      }catch(e){ await facelessReply(sock, jid, `Site Check: ${url}\nStatus: DOWN ❌\nError: ${e.message}`, m); }
      return true;
    }

    // ================= PORT - REAL common ports check =================
    if(cmd === 'port'){
      await sendAwait(sock, jid, m);
      const domain = text.replace(/https?:\/\//,'').split('/')[0];
      if(!domain){ await facelessReply(sock, jid, "Usage: .port <domain>", m); return true; }
      try{
        const ports = [80,443,21,22,25,53,8080];
        const net = require('net');
        const check = (port) => new Promise(resolve => {
          const s = net.createConnection({ host: domain, port, timeout: 2000 }, () => { s.end(); resolve(`Port ${port}: OPEN ✅`); });
          s.on('error', () => resolve(`Port ${port}: CLOSED ❌`));
          s.on('timeout', () => { s.destroy(); resolve(`Port ${port}: TIMEOUT ⏳`); });
        });
        const results = await Promise.all(ports.map(check));
        await facelessReply(sock, jid, `Port Scan: ${domain}\n\n${results.join('\n')}`, m);
      }catch(e){ await facelessReply(sock, jid, `Failed: ${e.message}`, m); }
      return true;
    }

    // ================= MAC - REAL vendor lookup =================
    if(cmd === 'mac'){
      await sendAwait(sock, jid, m);
      if(!text){ await facelessReply(sock, jid, "Usage: .mac <mac address e.g 00:1A:2B:3C:4D:5E>", m); return true; }
      try{
        const res = await axios.get(`https://api.macvendors.com/${text}`, { timeout: 10000 });
        await facelessReply(sock, jid, `MAC Vendor:\nMAC: ${text}\nVendor: ${res.data}`, m);
      }catch(e){ await facelessReply(sock, jid, `MAC Not Found Or API Limit`, m); }
      return true;
    }

    return false;
  }
};
