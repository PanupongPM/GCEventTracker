# 🐔 Grow a Chicken Event Tracker

A modern, precision-timed recurring event countdown dashboard for Roblox (Grow a Chicken Fighter). Designed as a clean, tamper-proof display driven directly by `config.js` with **Global Multi-Timezone synchronization**.

---

## 🚀 Getting Started

1. Open the project folder `RobloxCountdown`.
2. Double-click `index.html` to open it in any web browser.
3. No build tools or Node.js required. Runs 100% client-side with zero dependencies.

---

## 📋 Current Events (Configured in `config.js`)

| Event | Cycle Interval | Anchor Time | Duration | Accent Color | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 🎒 **Wandering Merchant** | Every 4 hours (240 mins) | `15:00` (UTC+7) | 45 mins | Amber Gold (`#f59e0b`) | Spawns with exclusive items. |
| 🦖 **Jurassic Event** | Every 50 mins | `16:10` (UTC+7) | 3 mins | Neon Emerald (`#10b981`) | Dinosaur boss encounter and rewards. |
| 🛸 **UFO Event** | Every 50 mins | `15:50` (UTC+7) | 3 mins | Alien Purple (`#a855f7`) | Mysterious UFO arrival and alien encounter. |
| 🐔 **Chicken Boss** | Every 50 mins | `16:00` (UTC+7) | 3 mins | Crimson Red (`#ef4444`) | Giant Chicken Boss battle and rewards. |
| 🪿 **Golden Goose** | Every 50 mins | `16:20` (UTC+7) | 3 mins | Golden Yellow (`#eab308`) | Golden Goose event and rewards. |
| 🥚 **Hot Egg** | Every 50 mins | `16:30` (UTC+7) | 3 mins | Flame Orange (`#f97316`) | Hot Egg event and rewards. |

---

## ⚙️ How to Configure Events

Open `config.js` in any text editor (VS Code, Notepad, etc.).  
All settings, intervals, durations, and new events are configured directly in the `DEFAULT_EVENTS` array:

```javascript
const DEFAULT_EVENTS = [
  {
    id: "wandering-merchant",
    name: "Wandering Merchant",
    icon: "🎒",
    intervalMinutes: 240, // Frequency in minutes (4 hours = 240)
    lastKnownTime: "15:00", // Anchor time (HH:mm)
    anchorDate: "2026-09-20", // Anchor date (YYYY-MM-DD)
    originTimezone: "+07:00", // Anchor timezone offset
    durationMinutes: 45, // Active duration in minutes
    themeColor: "#f59e0b",
    description: "Merchant spawns with exclusive items.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  // Add new events by copying this structure!
];
```

Any changes saved to `config.js` take effect immediately when you refresh the browser!

---

## 🌐 Multi-Timezone Features
- **UTC Epoch Precision**: Countdown is synchronized globally to the exact second.
- **Display Selector**: Viewers can switch the display between **Local Time**, **Origin (UTC+7)**, or **UTC**.
- **Tamper-Proof**: Public viewers cannot edit, reset, or tamper with countdown times.
