# ZERO DAY — Cyber Security Operator Console

A browser-based cyber security simulation game where you play as a red team operator. You monitor live network traffic, analyze packets, and trace targets across the globe — all inside a fictional Linux-style operator console.

> **This is a game.** All packets, IPs, devices, and locations are simulated. Nothing here interacts with real networks or real people.

---

##  What It Does

ZERO DAY is a single-page web app that simulates the desktop of a cyber security operator. It has five live panels:

| Panel | Location | What It Shows |
|-------|----------|---------------|
| **Wireshark** | Top Left | Live packet capture stream |
| **Earth Globe** | Top Right | Interactive 3D Earth with network nodes and target markers |
| **Terminal** | Center | Where you run commands and drop packets |
| **Execution Engine** | Bottom Left | Live-running code |
| **Intel Output** | Bottom Right | Streaming alerts, warnings, and logs |

---

## How to Play

1. **Watch packets stream** into the Wireshark panel.
2. **Click a packet** to select it.
3. **Copy it** with `Ctrl + C` — or just **drag it** straight into the terminal.
4. **Paste it** with `Ctrl + V` — the terminal will auto-parse it and show every detail.
5. **See the target appear** on the Earth globe with a pulsing red marker.

### Terminal Commands

| Command | What It Does |
|---------|--------------|
| `help` | Show all commands |
| `paste` | Paste the last copied packet |
| `/ip` | Reveal client and server IPs |
| `/track` | Track target on the Earth globe |
| `/device` | Show device fingerprint (device, OS, browser) |
| `/whois <ip>` | WHOIS lookup |
| `/geo <ip>` | GeoIP lookup |
| `/scan <ip>` | Port scan |
| `clear` | Clear the terminal |

---

## 🌍 Earth Globe

The Earth is fully interactive:

- **Drag** to rotate the planet
- **Scroll** to zoom in and out
- **Click `＋` / `−`** buttons for zoom
- **Click `⟳`** to reset the view
- **Red pulsing marker** appears when a target is tracked

---

##  Features

- ✅ Live streaming packet capture (simulated)
- ✅ Interactive drag-rotatable Earth
- ✅ Drag-and-drop packets into terminal
- ✅ Full packet parsing (source, destination, device, OS, location, ISP, coords)
- ✅ Terminal with 8+ commands
- ✅ Location overlay popup
- ✅ Scanline + CRT aesthetic
- ✅ Fully responsive

---

## Run Locally

Clone the repo and open `index.html`:

```bash
git clone https://github.com/YOUR_USERNAME/zero-day.git
cd zero-day
open index.html   # macOS
# or
start index.html  # Windows
# or
xdg-open index.html  # Linux
