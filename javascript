// ============================================
// CLOCK
// ============================================
function updateClock() {
  const n = new Date();
  document.getElementById("tb-clock").textContent =
    String(n.getHours()).padStart(2,"0") + ":" +
    String(n.getMinutes()).padStart(2,"0") + ":" +
    String(n.getSeconds()).padStart(2,"0");
}
setInterval(updateClock, 1000);
updateClock();

// ============================================
// STATE
// ============================================
let packetCount = 0;
let selectedPacket = null;
let clipboardPacket = null;
const packets = [];

// ============================================
// WIRESHARK
// ============================================
const sources = ["192.168.1.42", "10.0.0.7", "172.16.0.5", "192.168.43.72", "192.168.1.100"];
const dests   = ["142.250.185.78", "104.21.45.12", "151.101.1.69", "203.0.113.42", "198.51.100.7", "8.8.8.8"];
const protos  = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SSH"];
const infos   = ["GET /index.html HTTP/1.1","TLS handshake","DNS query","POST /api/login","SSH connection","ICMP echo request","TCP keep-alive","HTTPS session","SYN → ACK","GET /api/data"];

function randomIP() {
  return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
}

const devicePool = [
  { device: "iPhone 15 Pro", os: "iOS 17.5", browser: "Safari 17" },
  { device: "Samsung Galaxy S24", os: "Android 14", browser: "Chrome 122" },
  { device: "MacBook Pro M3", os: "macOS 14.5", browser: "Safari 17" },
  { device: "Windows 11 PC", os: "Windows 11 Pro", browser: "Edge 122" },
  { device: "Dell XPS 15", os: "Windows 11", browser: "Chrome 122" },
  { device: "Linux Workstation", os: "Ubuntu 24.04", browser: "Firefox 124" },
  { device: "iPad Pro", os: "iPadOS 17.4", browser: "Safari 17" },
  { device: "Android Tablet", os: "Android 14", browser: "Chrome 122" },
];

const citiesPool = [
  { city: "London", country: "UK", isp: "BT Broadband", lat: 51.5074, lon: -0.1278 },
  { city: "Lagos", country: "Nigeria", isp: "MTN Nigeria", lat: 6.5244, lon: 3.3792 },
  { city: "New York", country: "USA", isp: "Verizon", lat: 40.7128, lon: -74.0060 },
  { city: "Tokyo", country: "Japan", isp: "NTT", lat: 35.6762, lon: 139.6503 },
  { city: "Accra", country: "Ghana", isp: "MTN Ghana", lat: 5.6037, lon: -0.1870 },
  { city: "Berlin", country: "Germany", isp: "Deutsche Telekom", lat: 52.5200, lon: 13.4050 },
  { city: "Mumbai", country: "India", isp: "Jio", lat: 19.0760, lon: 72.8777 },
  { city: "Toronto", country: "Canada", isp: "Rogers", lat: 43.6532, lon: -79.3832 },
  { city: "Paris", country: "France", isp: "Orange", lat: 48.8566, lon: 2.3522 },
  { city: "Dubai", country: "UAE", isp: "Etisalat", lat: 25.2048, lon: 55.2708 },
];

function addPacket() {
  packetCount++;
  const pkt = {
    num: packetCount,
    src: Math.random() > 0.5 ? sources[Math.floor(Math.random()*sources.length)] : randomIP(),
    dst: dests[Math.floor(Math.random()*dests.length)],
    proto: protos[Math.floor(Math.random()*protos.length)],
    info: infos[Math.floor(Math.random()*infos.length)],
    time: new Date().toLocaleTimeString(),
    device: devicePool[Math.floor(Math.random()*devicePool.length)],
    location: citiesPool[Math.floor(Math.random()*citiesPool.length)],
    size: Math.floor(Math.random() * 1400) + 60,
    ttl: Math.floor(Math.random() * 60) + 64,
  };
  packets.push(pkt);
  if (packets.length > 200) packets.shift();

  const list = document.getElementById("packet-list");
  const row = document.createElement("div");
  row.className = "packet-row";
  row.dataset.num = pkt.num;
  row.draggable = true;
  row.innerHTML = `
    <span class="num">${pkt.num}</span>
    <span class="src">${pkt.src}</span>
    <span class="dst">${pkt.dst}</span>
    <span class="proto">${pkt.proto}</span>
    <span class="info">${pkt.info}</span>
  `;
  row.onclick = () => selectPacket(pkt.num, row);

  // Drag handling
  row.addEventListener("dragstart", (e) => {
    row.classList.add("dragging");
    const payload = `PKT-${pkt.num}|${pkt.src}|${pkt.dst}|${pkt.proto}|${pkt.info}|SIZE=${pkt.size}|TTL=${pkt.ttl}`;
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "copy";
    selectedPacket = pkt;
    clipboardPacket = payload;
  });
  row.addEventListener("dragend", () => row.classList.remove("dragging"));

  list.appendChild(row);
  if (list.children.length > 200) list.removeChild(list.firstChild);
  list.parentElement.scrollTop = list.parentElement.scrollHeight;
  document.getElementById("tb-packets").textContent = "PKT: " + packetCount;
}

function selectPacket(num, row) {
  document.querySelectorAll(".packet-row").forEach(r => r.classList.remove("selected"));
  row.classList.add("selected");
  selectedPacket = packets.find(p => p.num === num);
  clipboardPacket = `PKT-${selectedPacket.num}|${selectedPacket.src}|${selectedPacket.dst}|${selectedPacket.proto}|${selectedPacket.info}|SIZE=${selectedPacket.size}|TTL=${selectedPacket.ttl}`;
  try { navigator.clipboard.writeText(clipboardPacket); } catch(e) {}
}

// Ctrl+C copy
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedPacket && document.activeElement !== document.getElementById("terminal-input")) {
    e.preventDefault();
    clipboardPacket = `PKT-${selectedPacket.num}|${selectedPacket.src}|${selectedPacket.dst}|${selectedPacket.proto}|${selectedPacket.info}|SIZE=${selectedPacket.size}|TTL=${selectedPacket.ttl}`;
    navigator.clipboard.writeText(clipboardPacket).catch(()=>{});
    termPrint(`<span class="term-dim">◉ Packet #${selectedPacket.num} copied to clipboard</span>`);
  }
});

setInterval(addPacket, 800);
for (let i = 0; i < 15; i++) addPacket();

// ============================================
// EARTH GLOBE — INTERACTIVE
// ============================================
const canvas = document.getElementById("globe-canvas");
const ctx = canvas.getContext("2d");
let globeRot = 0;
let globeZoom = 1;
let targetMarker = null;
let stars = [];
let isDragging = false;
let lastMouseX = 0;

function resizeCanvas() {
  const p = canvas.parentElement;
  canvas.width = p.clientWidth;
  canvas.height = p.clientHeight;
  generateStars();
}
window.addEventListener("resize", resizeCanvas);
setTimeout(resizeCanvas, 50);

function generateStars() {
  stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2
    });
  }
}

// Drag rotation
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  canvas.style.cursor = "grabbing";
});
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const dx = e.clientX - lastMouseX;
    lastMouseX = e.clientX;
    globeRot += dx * 0.3;
  }
});
canvas.addEventListener("mouseup", () => {
  isDragging = false;
  canvas.style.cursor = "grab";
});
canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  canvas.style.cursor = "grab";
});

// Scroll zoom
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0) globeZoom = Math.min(globeZoom * 1.1, 3);
  else globeZoom = Math.max(globeZoom * 0.9, 0.5);
}, { passive: false });

// Touch drag
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
  }
});
canvas.addEventListener("touchmove", (e) => {
  if (isDragging && e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastMouseX;
    lastMouseX = e.touches[0].clientX;
    globeRot += dx * 0.3;
  }
});
canvas.addEventListener("touchend", () => isDragging = false);

function zoomGlobe(factor) {
  globeZoom = Math.max(0.5, Math.min(globeZoom * factor, 3));
}
function resetGlobe() {
  globeZoom = 1;
  globeRot = 0;
  targetMarker = null;
}

const continents = [
  [[-168,65],[-140,70],[-100,72],[-70,60],[-60,48],[-75,35],[-90,28],[-105,22],[-115,30],[-125,45],[-130,55],[-168,65]],
  [[-82,12],[-70,12],[-60,5],[-50,-5],[-38,-15],[-42,-25],[-55,-35],[-65,-45],[-70,-55],[-75,-50],[-72,-35],[-78,-20],[-80,-5],[-82,12]],
  [[-10,60],[5,62],[25,60],[40,55],[35,45],[20,40],[5,40],[-5,38],[-10,45],[-10,60]],
  [[-17,28],[10,35],[30,32],[42,20],[52,10],[48,-10],[35,-22],[25,-34],[15,-30],[8,-20],[0,-5],[-10,5],[-17,20],[-17,28]],
  [[45,55],[70,60],[100,68],[140,60],[145,45],[125,35],[120,22],[100,15],[80,10],[65,22],[55,30],[45,45],[45,55]],
  [[113,-22],[130,-12],[145,-15],[153,-25],[148,-38],[135,-38],[120,-33],[113,-22]]
];

function latLonToXY(lat, lon, r, cx, cy, rotation) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = ((lon + rotation) * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lonRad);
  const y = cy - r * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, z, visible: z > 0 };
}

function drawEarth() {
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.38 * globeZoom;

  ctx.clearRect(0, 0, w, h);

  stars.forEach(s => {
    s.twinkle += 0.03;
    const alpha = s.opacity * (0.6 + Math.sin(s.twinkle) * 0.4);
    ctx.fillStyle = `rgba(200,255,200,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  const atmoGrad = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.5);
  atmoGrad.addColorStop(0, "rgba(60,140,220,0.35)");
  atmoGrad.addColorStop(0.5, "rgba(40,100,180,0.15)");
  atmoGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atmoGrad;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2); ctx.fill();

  const oceanGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  oceanGrad.addColorStop(0, "#1a4d8f");
  oceanGrad.addColorStop(0.5, "#0e2e5c");
  oceanGrad.addColorStop(1, "#05132e");
  ctx.fillStyle = oceanGrad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  continents.forEach(continent => {
    ctx.beginPath();
    let started = false;
    continent.forEach(([lat, lon]) => {
      const p = latLonToXY(lat, lon, r, cx, cy, globeRot);
      if (p.visible) {
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
    });
    ctx.closePath();
    const landGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    landGrad.addColorStop(0, "rgba(30,90,45,0.85)");
    landGrad.addColorStop(0.5, "rgba(45,110,55,0.9)");
    landGrad.addColorStop(1, "rgba(25,75,40,0.85)");
    ctx.fillStyle = landGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(80,160,90,0.4)";
    ctx.lineWidth = 0.5; ctx.stroke();
  });

  // Lat / Lon grid
  ctx.strokeStyle = "rgba(100,180,255,0.08)";
  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const y = cy - r * Math.sin(latRad);
    const rx = r * Math.cos(latRad);
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, rx * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI + globeRot * Math.PI / 180;
    const rx = Math.abs(Math.cos(angle)) * r;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sunlight + shadow
  const sunGrad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, 0, cx - r * 0.4, cy - r * 0.4, r * 1.2);
  sunGrad.addColorStop(0, "rgba(255,255,220,0.25)");
  sunGrad.addColorStop(0.4, "rgba(255,255,200,0.05)");
  sunGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  const shadowGrad = ctx.createRadialGradient(cx + r * 0.6, cy + r * 0.3, r * 0.1, cx + r * 0.6, cy + r * 0.3, r * 1.3);
  shadowGrad.addColorStop(0, "rgba(0,0,20,0.6)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = "rgba(80,180,255,0.5)";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  // Network nodes
  for (let i = 0; i < 30; i++) {
    const seed = i * 137.5;
    const lat = Math.sin(seed) * 70;
    const lon = (seed * 13) % 360;
    const p = latLonToXY(lat, lon, r, cx, cy, globeRot);
    if (p.visible) {
      ctx.fillStyle = "rgba(0,255,100,0.9)";
      ctx.shadowColor = "#0f0"; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0,255,100,0.08)";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
  }

  // Target marker
  if (targetMarker) {
    const t = latLonToXY(targetMarker.lat, targetMarker.lon, r, cx, cy, globeRot);
    if (t.visible) {
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.4;
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(255,60,60,${0.5 - i * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(t.x, t.y, (6 + i * 4) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#ff3b3b";
      ctx.shadowColor = "#f00"; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(t.x, t.y, 4 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,60,60,0.8)";
      ctx.beginPath();
      ctx.moveTo(t.x - 12, t.y); ctx.lineTo(t.x - 6, t.y);
      ctx.moveTo(t.x + 6, t.y); ctx.lineTo(t.x + 12, t.y);
      ctx.moveTo(t.x, t.y - 12); ctx.lineTo(t.x, t.y - 6);
      ctx.moveTo(t.x, t.y + 6); ctx.lineTo(t.x, t.y + 12);
      ctx.stroke();
    }
  }

  // Auto-rotate only when not dragging
  if (!isDragging) globeRot += 0.15;
  if (globeRot >= 360) globeRot -= 360;
  requestAnimationFrame(drawEarth);
}
drawEarth();

function placeTargetOnGlobe(lat, lon) {
  targetMarker = { lat, lon };
}

// ============================================
// CODE PANEL
// ============================================
const codeSnippets = [
  ["import", "socket"], ["import", "scapy.all as scapy"],
  ["from", "geoip2.database import Reader"], ["", ""],
  ["def", "capture_packets(interface):"],
  ["", "    sniff(iface=interface,"], ["", "          prn=process_packet,"],
  ["", "          store=False)"], ["", ""],
  ["def", "process_packet(pkt):"], ["", "    if pkt.haslayer(IP):"],
  ["", "        src = pkt[IP].src"], ["", "        dst = pkt[IP].dst"],
  ["", "        geo = lookup(src)"], ["", "        emit(src, dst, geo)"],
  ["", ""], ["def", "lookup(ip):"],
  ["", "    reader = Reader('geo.mmdb')"],
  ["", "    return reader.city(ip)"], ["", ""],
  ["#", " Starting capture engine..."], ["capture_packets('eth0')"],
];
let codeIndex = 0;
function renderCode() {
  const container = document.getElementById("code-lines");
  container.innerHTML = "";
  codeSnippets.forEach((line, i) => {
    const div = document.createElement("div");
    div.className = "code-line" + (i === codeIndex ? " active" : "");
    let content = "";
    if (line[0] === "#") content = `<span class="cmt">${line[1]}</span>`;
    else {
      if (line[0]) content += `<span class="kw">${line[0]}</span> `;
      if (line[1]) content += `<span class="content">${line[1]}</span>`;
    }
    div.innerHTML = content;
    container.appendChild(div);
  });
}
function advanceCode() { codeIndex = (codeIndex + 1) % codeSnippets.length; renderCode(); }
renderCode();
setInterval(advanceCode, 900);

// ============================================
// OUTPUT PANEL
// ============================================
const outputSamples = [
  { tag: "info", msg: "Packet captured", detail: "TCP 192.168.1.42:54321 → 142.250.185.78:443" },
  { tag: "ok",   msg: "DNS resolved", detail: "google.com → 142.250.185.78" },
  { tag: "info", msg: "TLS handshake complete", detail: "Cipher: TLS_AES_256_GCM_SHA384" },
  { tag: "warn", msg: "Unencrypted HTTP traffic", detail: "POST /api/login on port 80" },
  { tag: "info", msg: "GeoIP lookup", detail: "142.250.185.78 → Mountain View, US" },
  { tag: "crit", msg: "Suspicious outbound connection", detail: "203.0.113.42:8080 — no known service" },
  { tag: "ok",   msg: "Device fingerprinted", detail: "macOS 14.5 — Safari 17" },
  { tag: "info", msg: "Session cookie intercepted", detail: "session_id=abc123..." },
];
let outputIndex = 0;
function addOutput() {
  const s = outputSamples[outputIndex % outputSamples.length];
  outputIndex++;
  const body = document.getElementById("output-body");
  const entry = document.createElement("div");
  entry.className = "output-entry " + (s.tag === "crit" ? "critical" : s.tag === "warn" ? "warn" : s.tag === "ok" ? "success" : "");
  const time = new Date().toLocaleTimeString();
  const tagClass = s.tag === "crit" ? "crit" : s.tag === "warn" ? "warn" : s.tag === "ok" ? "ok" : "info";
  const tagLabel = s.tag === "crit" ? "CRIT" : s.tag.toUpperCase();
  entry.innerHTML = `<span class="tag ${tagClass}">${tagLabel}</span><span class="time">${time}</span><span class="msg">${s.msg}</span><div class="detail">${s.detail}</div>`;
  body.appendChild(entry);
  if (body.children.length > 40) body.removeChild(body.firstChild);
  body.scrollTop = body.scrollHeight;
}
addOutput();
setInterval(addOutput, 2200);

// ============================================
// TERMINAL
// ============================================
const termOut = document.getElementById("terminal-output");
const termIn = document.getElementById("terminal-input");
const termPanel = document.getElementById("panel-terminal");

function termPrint(text, cls = "") {
  const div = document.createElement("div");
  if (cls) div.className = cls;
  div.innerHTML = text;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
}
function termPrompt(cmd) {
  termPrint(`<span class="term-dim">root@nullsec:~#</span> ${cmd}`);
}

termPrint(`<span class="term-info">◉ NULLSEC OPERATOR TERMINAL v3.0</span>`);
termPrint(`<span class="term-dim">Select a packet and drag it into this terminal.</span>`);
termPrint(`<span class="term-dim">Or paste (Ctrl+V). Type 'help' for commands.</span>`);
termPrint("");

termIn.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = termIn.value.trim();
    if (!cmd) return;
    termPrompt(cmd);
    handleCommand(cmd);
    termIn.value = "";
  }
});
termIn.addEventListener("paste", (e) => {
  const pasted = (e.clipboardData || window.clipboardData).getData("text");
  if (pasted && pasted.startsWith("PKT-")) {
    e.preventDefault();
    termPrompt(pasted);
    handleCommand(pasted);
    termIn.value = "";
  }
});

// ============================================
// DRAG & DROP INTO TERMINAL
// ============================================
termPanel.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  termPanel.classList.add("drop-active");
});
termPanel.addEventListener("dragleave", (e) => {
  termPanel.classList.remove("drop-active");
});
termPanel.addEventListener("drop", (e) => {
  e.preventDefault();
  termPanel.classList.remove("drop-active");
  const data = e.dataTransfer.getData("text/plain");
  if (data && data.startsWith("PKT-")) {
    termPrompt(data);
    handleCommand(data);
  }
});

function handleCommand(cmd) {
  if (cmd.startsWith("PKT-")) { parsePacket(cmd); return; }
  const parts = cmd.split(/\s+/);
  const base = parts[0].toLowerCase();
  const arg = parts[1];

  switch (base) {
    case "help":
      termPrint(`<span class="term-success">Available Commands:</span>`);
      termPrint(`  <span class="term-info">help</span>              Show this menu`);
      termPrint(`  <span class="term-info">paste</span>             Show last copied packet`);
      termPrint(`  <span class="term-info">/ip</span>               Reveal IPs`);
      termPrint(`  <span class="term-info">/track</span>            Track on Earth`);
      termPrint(`  <span class="term-info">/device</span>           Device fingerprint`);
      termPrint(`  <span class="term-info">/whois</span> <ip>        WHOIS lookup`);
      termPrint(`  <span class="term-info">/geo</span> <ip>          GeoIP lookup`);
      termPrint(`  <span class="term-info">/scan</span> <ip>         Port scan`);
      termPrint(`  <span class="term-info">clear</span>             Clear terminal`);
      termPrint("");
      break;
    case "paste":
      if (clipboardPacket) { termPrompt(clipboardPacket); parsePacket(clipboardPacket); }
      else termPrint(`<span class="term-warn">⚠ No packet copied yet.</span>`);
      break;
    case "/ip":
      if (!selectedPacket) { termPrint(`<span class="term-error">✕ Select a packet first.</span>`); return; }
      termPrint(`<span class="term-success">◉ IP REVEAL</span>`);
      termPrint(`<span class="term-info">Client IP: ${selectedPacket.src}</span>`);
      termPrint(`<span class="term-info">Server IP: ${selectedPacket.dst}</span>`);
      termPrint("");
      break;
    case "/track":
      if (!selectedPacket) { termPrint(`<span class="term-error">✕ Select a packet first.</span>`); return; }
      trackTarget(selectedPacket);
      break;
    case "/device":
      if (!selectedPacket) { termPrint(`<span class="term-error">✕ Select a packet first.</span>`); return; }
      termPrint(`<span class="term-success">◉ DEVICE FINGERPRINT</span>`);
      termPrint(`<span class="term-info">Device: ${selectedPacket.device.device}</span>`);
      termPrint(`<span class="term-info">OS: ${selectedPacket.device.os}</span>`);
      termPrint(`<span class="term-info">Browser: ${selectedPacket.device.browser}</span>`);
      termPrint("");
      break;
    case "/whois":
      if (!arg) { termPrint(`<span class="term-error">✕ Usage: /whois <ip></span>`); return; }
      termPrint(`<span class="term-success">◉ WHOIS: ${arg}</span>`);
      termPrint(`<span class="term-info">OrgName: Example Networks Inc.</span>`);
      termPrint("");
      break;
    case "/geo":
      if (!arg) { termPrint(`<span class="term-error">✕ Usage: /geo <ip></span>`); return; }
      termPrint(`<span class="term-success">◉ GEOIP: ${arg}</span>`);
      termPrint(`<span class="term-info">Lat: ${(Math.random()*120-60).toFixed(4)}</span>`);
      termPrint("");
      break;
    case "/scan":
      if (!arg) { termPrint(`<span class="term-error">✕ Usage: /scan <ip></span>`); return; }
      termPrint(`<span class="term-success">◉ SCANNING: ${arg}</span>`);
      setTimeout(() => {
        termPrint(`<span class="term-info">22/tcp open ssh</span>`);
        termPrint(`<span class="term-info">80/tcp open http</span>`);
        termPrint(`<span class="term-info">443/tcp open https</span>`);
        termPrint(`<span class="term-success">◉ Scan complete</span>`);
      }, 1500);
      break;
    case "clear":
      termOut.innerHTML = "";
      break;
    default:
      termPrint(`<span class="term-error">✕ Command not found: ${base}</span>`);
  }
}

function parsePacket(raw) {
  const parts = raw.split("|");
  if (parts.length < 5) { termPrint(`<span class="term-error">✕ Malformed packet.</span>`); return; }
  const [tag, src, dst, proto, info] = parts;
  const sizeMatch = raw.match(/SIZE=(\d+)/);
  const ttlMatch = raw.match(/TTL=(\d+)/);
  const size = sizeMatch ? sizeMatch[1] : "?";
  const ttl = ttlMatch ? ttlMatch[1] : "?";

  const num = parseInt(tag.replace("PKT-", ""));
  const pkt = packets.find(p => p.num === num) || {
    src, dst, proto, info,
    device: devicePool[Math.floor(Math.random() * devicePool.length)],
    location: citiesPool[Math.floor(Math.random() * citiesPool.length)],
    size, ttl, time: new Date().toLocaleTimeString()
  };

  termPrint("");
  termPrint(`<span class="term-header">╔════════════════════════════════════════╗</span>`);
  termPrint(`<span class="term-header">║  ◉ PACKET ANALYSIS — ${tag}</span>`);
  termPrint(`<span class="term-header">╚════════════════════════════════════════╝</span>`);
  termPrint("");
  termPrint(`<span class="term-success">[ SOURCE ]</span>`);
  termPrint(`  <span class="term-dim">IP        :</span> <span class="term-info">${src}</span>`);
  termPrint(`  <span class="term-dim">Device    :</span> <span class="term-info">${pkt.device.device}</span>`);
  termPrint(`  <span class="term-dim">OS        :</span> <span class="term-info">${pkt.device.os}</span>`);
  termPrint(`  <span class="term-dim">Browser   :</span> <span class="term-info">${pkt.device.browser}</span>`);
  termPrint(`  <span class="term-dim">Location  :</span> <span class="term-info">${pkt.location.city}, ${pkt.location.country}</span>`);
  termPrint(`  <span class="term-dim">ISP       :</span> <span class="term-info">${pkt.location.isp}</span>`);
  termPrint(`  <span class="term-dim">Coords    :</span> <span class="term-info">${pkt.location.lat}, ${pkt.location.lon}</span>`);
  termPrint("");
  termPrint(`<span class="term-success">[ DESTINATION ]</span>`);
  termPrint(`  <span class="term-dim">IP        :</span> <span class="term-info">${dst}</span>`);
  termPrint(`  <span class="term-dim">Protocol  :</span> <span class="term-info">${proto}</span>`);
  termPrint(`  <span class="term-dim">Info      :</span> <span class="term-info">${info}</span>`);
  termPrint("");
  termPrint(`<span class="term-success">[ PACKET ]</span>`);
  termPrint(`  <span class="term-dim">Size      :</span> <span class="term-info">${size} bytes</span>`);
  termPrint(`  <span class="term-dim">TTL       :</span> <span class="term-info">${ttl}</span>`);
  termPrint(`  <span class="term-dim">Captured  :</span> <span class="term-info">${pkt.time}</span>`);
  termPrint("");
  termPrint(`<span class="term-warn">◉ /track to see on Earth globe</span>`);
  termPrint("");

  placeTargetOnGlobe(pkt.location.lat, pkt.location.lon);
  document.getElementById("tb-target").textContent = "TARGET: " + pkt.location.city;
}

function trackTarget(pkt) {
  termPrint(`<span class="term-success">◉ TRACKING ON EARTH...</span>`);
  const loc = pkt.location;
  termPrint(`<span class="term-info">Lat: ${loc.lat}</span>`);
  termPrint(`<span class="term-info">Lon: ${loc.lon}</span>`);
  termPrint(`<span class="term-info">City: ${loc.city}, ${loc.country}</span>`);
  termPrint("");
  placeTargetOnGlobe(loc.lat, loc.lon);

  document.getElementById("loc-coords").textContent = `${loc.lat}, ${loc.lon}`;
  document.getElementById("loc-ip").textContent = pkt.dst;
  document.getElementById("loc-device").textContent = pkt.device.device;
  document.getElementById("loc-os").textContent = pkt.device.os;
  document.getElementById("loc-city").textContent = loc.city;
  document.getElementById("loc-country").textContent = loc.country;
  document.getElementById("loc-isp").textContent = loc.isp;
  document.getElementById("location-overlay").classList.add("active");
  document.getElementById("tb-target").textContent = "TARGET: " + loc.city;
}

function closeLocation() {
  document.getElementById("location-overlay").classList.remove("active");
}
