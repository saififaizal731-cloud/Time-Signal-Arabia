# 🟢 Settings Panel - User Guide

## Where to Find the Settings Button

The **⚙️ Settings** button is located in the **top-right corner** of your website navbar.

### Visual Location:
```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar]      [EN|AR] ❤️ 🛒 👤 🟢⚙️ Settings        │
└──────────────────────────────────────────────────────────────────┘
                                                              ↑
                                                        Click here!
```

## How to Access the Settings Panel

1. **Open your website**: Go to `http://localhost:5000`
2. **Look at the top-right corner** of the page
3. **Click the green ⚙️ Settings button**
4. A modal window will open with 4 tabs

## What You'll See Inside

The Settings Panel has **4 main tabs** on the left sidebar:

### 🌐 Connection Settings
- Internet Connection Type (DHCP, Static IP, PPPoE)
- Primary DNS
- Secondary DNS
- DHCP Server Settings

### 📡 Wi-Fi Settings
- 2.4GHz Network Name & Password
- 5GHz Network Name & Password
- Security Protocols (WPA2, WPA3)
- Guest Network Configuration

### 🔐 Security & Firewall
- Port Forwarding Rules (add/edit/remove)
- VPN Client Configuration
- OpenVPN and WireGuard support

### ⚙️ System Admin
- Change Admin Password
- Firmware Update Checker
- Configuration Backup
- Configuration Restore
- Factory Reset

## How to Use

1. **Click the Settings button** → Modal opens
2. **Select a tab** from the left sidebar
3. **Fill in the settings** you want to configure
4. **Click "💾 Save Changes"** to save
5. **Or click "↻ Reset"** to discard changes

## Button Styling

The Settings button has:
- ✅ Green background (#10b981)
- ✅ Bold white text
- ✅ Rounded corners
- ✅ Hover effects (lifts up when you hover)
- ✅ Positioned on the far right of the navbar

## Technical Details

- **File Location**: `public/index.html` (line 32)
- **Modal ID**: `#settingsModal`
- **Open Function**: `openSettings()`
- **Close Function**: `closeSettings()`
- **Theme**: Dark (navy background, green accents)

## Troubleshooting

**Can't see the Settings button?**
- Make sure your server is running: `npm start`
- Clear your browser cache (Ctrl+Shift+Delete)
- Reload the page (Ctrl+R or F5)

**Settings button not responding?**
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Try a different browser

**Want to customize the Settings?**
- Edit `public/app.js` for JavaScript logic
- Edit `public/style.css` for styling
- Edit `public/index.html` for structure
