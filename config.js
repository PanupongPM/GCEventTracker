/**
 * =========================================================================
 * ⚙️ ROBLOX EVENT COUNTDOWN TRACKER - CONFIGURATION
 * =========================================================================
 * 
 * Event Object Schema:
 * - id: Unique string identifier (no spaces)
 * - name: Event display name
 * - icon: Emoji or icon symbol (e.g. 🎒, 🦖, ⚔️, 💎)
 * - intervalMinutes: Recurring interval in minutes
 *     - 4 hours = 240 minutes
 *     - 50 minutes = 50 minutes
 *     - 1 hour = 60 minutes
 * - lastKnownTime: Last occurrence time in "HH:mm" format (e.g. "15:00")
 * - anchorDate: Anchor reference date in "YYYY-MM-DD"
 * - originTimezone: Timezone offset of the anchor time (e.g. "+07:00")
 * - durationMinutes: Duration the event stays active in minutes
 * - themeColor: Primary accent hex color code
 * - description: Event description or notes
 * - notifyBeforeMinutes: Notification alert milestones in minutes [5, 1, 0]
 * - enabled: Whether this event is actively tracked (true/false)
 */

const DEFAULT_EVENTS = [
  {
    id: "wandering-merchant",
    name: "Wandering Merchant",
    icon: "🎒",
    intervalMinutes: 240, // Every 4 hours (240 mins)
    lastKnownTime: "15:00",
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Anchor reference timezone
    durationMinutes: 45, // Active for 45 minutes
    themeColor: "#f59e0b",
    description: "Merchant spawns with exclusive items. Appears every 4 hours.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  {
    id: "jurassic-event",
    name: "Jurassic Event",
    icon: "🦖",
    intervalMinutes: 50, // Every 50 minutes
    lastKnownTime: "16:10", // Arrival time
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Anchor reference timezone
    durationMinutes: 3, // Active for 3 minutes
    themeColor: "#10b981",
    description: "Dinosaur boss encounter and special rewards. Spawns every 50 minutes.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  {
    id: "ufo-event",
    name: "UFO Event",
    icon: "🛸",
    intervalMinutes: 50, // Every 50 minutes
    lastKnownTime: "15:50",
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Thai reference timezone
    durationMinutes: 3, // Active for 3 minutes
    themeColor: "#a855f7", // Alien purple
    description: "Mysterious UFO arrival and alien encounter. Spawns every 50 minutes.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  {
    id: "chicken-boss",
    name: "Chicken Boss",
    icon: "🐔",
    intervalMinutes: 50, // Every 50 minutes
    lastKnownTime: "16:00",
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Thai reference timezone
    durationMinutes: 3, // Active for 3 minutes
    themeColor: "#ef4444", // Crimson Rooster Red
    description: "Giant Chicken Boss battle. Spawns every 50 minutes.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  {
    id: "golden-goose",
    name: "Golden Goose",
    icon: "🪿",
    intervalMinutes: 50, // Every 50 minutes
    lastKnownTime: "16:20",
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Thai reference timezone
    durationMinutes: 3, // Active for 3 minutes
    themeColor: "#eab308", // Golden Yellow
    description: "Golden Goose event. Spawns every 50 minutes.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  },
  {
    id: "hot-egg",
    name: "Hot Egg",
    icon: "🥚",
    intervalMinutes: 50, // Every 50 minutes
    lastKnownTime: "16:30",
    anchorDate: "2026-09-20",
    originTimezone: "+07:00", // Thai reference timezone
    durationMinutes: 3, // Active for 3 minutes
    themeColor: "#f97316", // Flame Orange
    description: "Hot Egg event. Spawns every 50 minutes.",
    notifyBeforeMinutes: [5, 1, 0],
    enabled: true
  }
];

const APP_SETTINGS = {
  appName: "Roblox Event Tracker",
  appSubtitle: "Global Multi-Timezone Countdown & Alert System",
  originTimezone: "+07:00", // Reference origin timezone (UTC+7)
  originTimezoneName: "Bangkok (UTC+7)",
  displayTimezone: "local", // "local", "origin", or "utc"
  soundEnabled: true,
  soundVolume: 0.7,
  browserNotification: false,
  showUpcomingListCount: 3 // Number of upcoming cycles to display
};
