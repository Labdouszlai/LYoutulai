# L'Youtulai

A lightweight, portable Electron wrapper for **YouTube Music** with audio effects engine, sleep timer, Discord Rich Presence, companion server, and custom CSS support.

Maintained by **l'abdouszlai** — optimized for low resource usage.

---

## Features

### Audio Effects Engine
Built-in real-time audio processing via the Web Audio API. Click the **AE** button next to the player controls to open the effects panel.

| Effect | Range | Description |
|--------|-------|-------------|
| Speed | 0.25× – 3.00× | Adjust playback speed |
| Reverb | 0 – 100% | Simulated room reverb using convolution |
| Bass Boost | 0 – 20 dB | Low-frequency emphasis |
| Preserve Pitch | On/Off | Maintain vocal pitch when changing speed |

### Customizable Keyboard Shortcuts
Assign global hotkeys in `Settings > Shortcuts`:

| Shortcut | Default Action |
|----------|---------------|
| Play/Pause | Toggle playback |
| Next | Skip to next track |
| Previous | Go to previous track |
| Thumbs Up | Like current track |
| Thumbs Down | Dislike current track |
| Volume Up/Down | Adjust volume |
| AE Speed Up/Down | Fine-tune audio speed |
| AE Reverb Up/Down | Adjust reverb level |
| AE Bass Up/Down | Adjust bass boost |
| AE Apply | Apply current AE settings |
| AE Off | Disable audio effects |
| AE Preserve Pitch | Toggle preserve pitch |

### Sleep Timer
Set a timer to automatically pause playback after a chosen duration.

### Discord Rich Presence
Show your currently playing track on your Discord profile.

### Companion Server
Control the player from external applications or browser extensions via a local WebSocket server.

### Custom CSS
Load your own stylesheet to customize the YouTube Music interface.

### Additional Settings
- Hide to tray on close
- Show notification on song change
- Start on boot / start minimized
- Always show volume slider
- Zoom (30% – 300%)
- Continue where you left off
- Progress in taskbar
- Ratio volume

---

## Download

Get the latest portable release from the [Releases](https://github.com/Labdouszlai/LYoutulai/releases) page.

| Architecture | File |
|-------------|------|
| x64 | `LYoutulai-v1.1.0-win-x64.zip` |
| x86 | `LYoutulai-v1.1.0-win-x86.zip` |

Extract the ZIP and run `LYoutulai.exe` or `YTMDesktop.bat` — no installation required.

---

## Building from Source

1. Clone the repository
2. Ensure `runtime/` contains the Electron binaries for your architecture
3. Run `build.ps1` to package portable ZIPs

---

## Credits

**Original concept:** [ytmdesktop/ytmdesktop](https://github.com/ytmdesktop/ytmdesktop)  
**Ongoing maintenance and enhancements:** [l'abdouszlai](https://github.com/Labdouszlai)
