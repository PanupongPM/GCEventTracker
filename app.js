/**
 * Roblox Event Countdown Tracker - Application Logic
 * Pure Display / Read-Only Dashboard Driven Directly by config.js
 */

// Application State
let events = [];
let appSettings = {};
let notifiedMilestones = {};
let audioCtx = null;

// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const currentTzPill = document.getElementById('currentTzPill');
const tzModeSelect = document.getElementById('tzModeSelect');
const statTotalEvents = document.getElementById('statTotalEvents');
const statActiveEvents = document.getElementById('statActiveEvents');
const statNextEvent = document.getElementById('statNextEvent');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundLabel = document.getElementById('soundLabel');
const notifyToggleBtn = document.getElementById('notifyToggleBtn');
const notifyIcon = document.getElementById('notifyIcon');
const notifyLabel = document.getElementById('notifyLabel');
const toastContainer = document.getElementById('toastContainer');

// 1. Timezone Detection & Formatting
function getUserTimezoneInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
  const mins = String(Math.abs(offsetMin) % 60).padStart(2, '0');
  return {
    timeZone: tz,
    offsetString: `GMT${sign}${hours}:${mins}`,
    shortOffset: `GMT${sign}${Math.abs(offsetMin) / 60}`
  };
}

function getActiveTimezone() {
  const mode = appSettings.displayTimezone || 'local';
  if (mode === 'origin') {
    return 'Asia/Bangkok';
  } else if (mode === 'utc') {
    return 'UTC';
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function formatDisplayTime(dateOrMs, format = 'full') {
  const date = new Date(dateOrMs);
  const timeZone = getActiveTimezone();
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone
  };
  if (format === 'full') options.second = '2-digit';
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function getTimezonePillLabel() {
  const mode = appSettings.displayTimezone || 'local';
  if (mode === 'origin') return 'Origin (UTC+7)';
  if (mode === 'utc') return 'UTC';
  const info = getUserTimezoneInfo();
  return `${info.shortOffset}`;
}

// 2. Accurate Anchor Calculation with Multi-Timezone Support
function getEventAnchorMs(event) {
  if (event.anchorTimestamp) {
    return event.anchorTimestamp;
  }

  const originTz = event.originTimezone || appSettings.originTimezone || "+07:00";

  if (typeof event.lastKnownTime === 'string') {
    if (event.lastKnownTime.includes('T') && (event.lastKnownTime.includes('+') || event.lastKnownTime.includes('Z'))) {
      const d = new Date(event.lastKnownTime);
      if (!isNaN(d.getTime())) return d.getTime();
    }

    if (event.lastKnownTime.includes(':')) {
      const parts = event.lastKnownTime.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');

      let dateStr = event.anchorDate;
      if (!dateStr || !dateStr.includes('-')) {
        const d = new Date();
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      const isoWithTz = `${dateStr}T${hours}:${minutes}:00${originTz}`;
      const parsedDate = new Date(isoWithTz);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getTime();
      }
    }
  }

  return new Date().getTime();
}

function calculateEventTimings(event, now = new Date()) {
  const intervalMs = Math.max(1, event.intervalMinutes) * 60 * 1000;
  const durationMs = Math.max(0, event.durationMinutes || 0) * 60 * 1000;

  const nowMs = now.getTime();
  const baseMs = getEventAnchorMs(event);

  let offset = (nowMs - baseMs) % intervalMs;
  if (offset < 0) {
    offset += intervalMs;
  }

  const lastOccurrenceMs = nowMs - offset;
  const nextOccurrenceMs = lastOccurrenceMs + intervalMs;
  const currentEndMs = lastOccurrenceMs + durationMs;

  const isLive = durationMs > 0 && nowMs < currentEndMs;
  const msRemainingToNext = Math.max(0, nextOccurrenceMs - nowMs);
  const msRemainingLive = isLive ? Math.max(0, currentEndMs - nowMs) : 0;

  let progressPercent = 0;
  if (isLive) {
    progressPercent = 100 - ((msRemainingLive / durationMs) * 100);
  } else {
    progressPercent = (offset / intervalMs) * 100;
  }

  return {
    isLive,
    lastOccurrenceMs,
    nextOccurrenceMs,
    currentEndMs,
    msRemainingToNext,
    msRemainingLive,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    intervalMs
  };
}

function formatCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

function formatDurationText(mins) {
  if (!mins) return '0 mins';
  if (mins % 60 === 0) {
    return `${mins / 60} hour${mins / 60 > 1 ? 's' : ''}`;
  }
  if (mins > 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }
  return `${mins} mins`;
}

// 3. Initial Load: Directly Driven from config.js
function loadConfiguration() {
  // Load viewer preferences
  const savedSettings = localStorage.getItem('roblox_app_settings');
  if (savedSettings) {
    try {
      appSettings = { ...APP_SETTINGS, ...JSON.parse(savedSettings) };
    } catch (e) {
      appSettings = { ...APP_SETTINGS };
    }
  } else {
    appSettings = { ...APP_SETTINGS };
  }

  // Always load directly from config.js so your edits in config.js take effect immediately!
  events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));

  if (tzModeSelect) {
    tzModeSelect.value = appSettings.displayTimezone || 'local';
  }

  updateSettingsUI();
  renderEventCards();
}

function saveSettings(reRender = true) {
  localStorage.setItem('roblox_app_settings', JSON.stringify({
    displayTimezone: appSettings.displayTimezone,
    soundEnabled: appSettings.soundEnabled,
    soundVolume: appSettings.soundVolume,
    browserNotification: appSettings.browserNotification
  }));
  updateSettingsUI();
  if (reRender) {
    renderEventCards();
  }
}

function updateSettingsUI() {
  if (appSettings.soundEnabled) {
    soundIcon.textContent = '🔊';
    soundLabel.textContent = 'Sound ON';
    soundToggleBtn.classList.remove('btn-muted');
  } else {
    soundIcon.textContent = '🔇';
    soundLabel.textContent = 'Sound OFF';
    soundToggleBtn.classList.add('btn-muted');
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    notifyIcon.textContent = '🔔';
    notifyLabel.textContent = 'Alerts: ON';
  } else {
    notifyIcon.textContent = '🔕';
    notifyLabel.textContent = 'Alerts: OFF';
  }

  if (currentTzPill) {
    currentTzPill.textContent = getTimezonePillLabel();
  }
}

// 4. Audio Synthesizer (Web Audio API)
function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChime(type = 'chime') {
  if (!appSettings.soundEnabled) return;
  initAudioContext();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  const volume = (appSettings.soundVolume !== undefined ? appSettings.soundVolume : 0.7) * 0.4;
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(audioCtx.destination);

  if (type === 'live') {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      noteGain.gain.setValueAtTime(0, now + idx * 0.08);
      noteGain.gain.linearRampToValueAtTime(0.5, now + idx * 0.08 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  } else {
    const notes = [587.33, 880.00];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      noteGain.gain.setValueAtTime(0, now + idx * 0.12);
      noteGain.gain.linearRampToValueAtTime(0.6, now + idx * 0.12 + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.55);
    });
  }
}

// 5. Toasts & Desktop Notifications
function showToast(title, message, icon = 'ℹ️', color = '#06b6d4') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeftColor = color;
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

function sendDesktopNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏱️</text></svg>'
    });
  }
}

// 6. Render Event Cards (Pure View - No Edit or Sync Buttons)
function renderEventCards() {
  eventsGrid.innerHTML = '';

  const activeCount = events.filter(e => e.enabled).length;
  statTotalEvents.textContent = String(activeCount);

  events.forEach(event => {
    if (!event.enabled) return;

    const card = document.createElement('div');
    card.className = 'event-card';
    card.id = `card-${event.id}`;
    card.style.setProperty('--event-color', event.themeColor || '#6366f1');
    card.style.setProperty('--card-glow', `0 0 25px ${(event.themeColor || '#6366f1')}33`);

    card.innerHTML = `
      <div class="card-header">
        <div class="event-identity">
          <div class="event-icon-wrapper">${event.icon || '⚡'}</div>
          <div class="event-names">
            <h2>${escapeHtml(event.name)}</h2>
          </div>
        </div>
        <div class="status-badge status-upcoming" id="status-${event.id}">
          <span>UPCOMING</span>
        </div>
      </div>

      <div class="countdown-box">
        <div class="timer-target-label" id="targetLabel-${event.id}">COUNTDOWN TO NEXT OCCURRENCE</div>
        <div class="timer-digits">
          <div class="digit-group">
            <span class="digit-val" id="h-${event.id}">00</span>
            <span class="digit-unit">HOURS</span>
          </div>
          <div class="digit-separator">:</div>
          <div class="digit-group">
            <span class="digit-val" id="m-${event.id}">00</span>
            <span class="digit-unit">MINUTES</span>
          </div>
          <div class="digit-separator">:</div>
          <div class="digit-group">
            <span class="digit-val" id="s-${event.id}">00</span>
            <span class="digit-unit">SECONDS</span>
          </div>
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-${event.id}" style="width: 0%"></div>
        </div>
        <div class="progress-labels">
          <span id="progTextLeft-${event.id}">Cycle Progress</span>
          <span id="progTextRight-${event.id}">0%</span>
        </div>
      </div>

      <div class="event-details">
        <div class="detail-item">
          <span class="detail-label">Cycle Interval</span>
          <span class="detail-value">Every ${formatDurationText(event.intervalMinutes)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Next Occurrence</span>
          <span class="detail-value" id="nextTimeVal-${event.id}">--:--:--</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Active Duration</span>
          <span class="detail-value">${event.durationMinutes ? event.durationMinutes + ' mins' : 'Instant'}</span>
        </div>
      </div>

      <div class="schedule-preview">
        <div class="schedule-title">
          <span>📅</span> Upcoming 3 Cycles:
        </div>
        <div class="schedule-pills" id="pills-${event.id}">
          <!-- Dynamic pills -->
        </div>
      </div>
    `;

    eventsGrid.appendChild(card);
  });
}

// 7. Main Clock & Countdown Loop (Every Second)
function tick() {
  const now = new Date();

  currentTimeDisplay.textContent = formatDisplayTime(now, 'full');
  if (currentTzPill) {
    currentTzPill.textContent = getTimezonePillLabel();
  }

  let activeCount = 0;
  let nextSoonestMs = Infinity;
  let nextSoonestName = '--';

  events.forEach(event => {
    if (!event.enabled) return;

    const timings = calculateEventTimings(event, now);

    const hElem = document.getElementById(`h-${event.id}`);
    const mElem = document.getElementById(`m-${event.id}`);
    const sElem = document.getElementById(`s-${event.id}`);
    const statusElem = document.getElementById(`status-${event.id}`);
    const targetLabel = document.getElementById(`targetLabel-${event.id}`);
    const progressFill = document.getElementById(`progress-${event.id}`);
    const progTextLeft = document.getElementById(`progTextLeft-${event.id}`);
    const progTextRight = document.getElementById(`progTextRight-${event.id}`);
    const nextTimeVal = document.getElementById(`nextTimeVal-${event.id}`);
    const pillsContainer = document.getElementById(`pills-${event.id}`);

    if (!hElem) return;

    if (timings.isLive) {
      activeCount++;
      const timeRemaining = formatCountdown(timings.msRemainingLive);
      hElem.textContent = timeRemaining.hours;
      mElem.textContent = timeRemaining.minutes;
      sElem.textContent = timeRemaining.seconds;

      statusElem.className = 'status-badge status-live';
      statusElem.innerHTML = `<span>● LIVE NOW</span>`;
      targetLabel.textContent = '🔥 EVENT LIVE! ENDS IN';
      targetLabel.style.color = '#34d399';

      progTextLeft.textContent = 'Event Time Remaining';
      progTextRight.textContent = `${Math.round(timings.progressPercent)}%`;
      progressFill.style.width = `${timings.progressPercent}%`;
      progressFill.style.background = '#10b981';

      checkMilestoneNotification(event, timings, 0);
    } else {
      const timeRemaining = formatCountdown(timings.msRemainingToNext);
      hElem.textContent = timeRemaining.hours;
      mElem.textContent = timeRemaining.minutes;
      sElem.textContent = timeRemaining.seconds;

      const minsLeft = Math.floor(timings.msRemainingToNext / (60 * 1000));

      if (minsLeft < 5) {
        statusElem.className = 'status-badge status-soon';
        statusElem.innerHTML = `<span>⚠️ SOON (<5m)</span>`;
        targetLabel.style.color = '#fbbf24';
      } else {
        statusElem.className = 'status-badge status-upcoming';
        statusElem.innerHTML = `<span>UPCOMING</span>`;
        targetLabel.style.color = 'var(--text-muted)';
      }

      targetLabel.textContent = 'COUNTDOWN TO NEXT OCCURRENCE';
      progTextLeft.textContent = 'Cycle Progress';
      progTextRight.textContent = `${Math.round(timings.progressPercent)}%`;
      progressFill.style.width = `${timings.progressPercent}%`;
      progressFill.style.background = event.themeColor || '#6366f1';

      if (minsLeft === 5) checkMilestoneNotification(event, timings, 5);
      if (minsLeft === 1) checkMilestoneNotification(event, timings, 1);

      if (timings.msRemainingToNext < nextSoonestMs) {
        nextSoonestMs = timings.msRemainingToNext;
        nextSoonestName = `${event.icon || ''} ${event.name} (${minsLeft}m)`;
      }
    }

    if (nextTimeVal) {
      nextTimeVal.textContent = formatDisplayTime(timings.nextOccurrenceMs, 'full');
    }

    if (pillsContainer) {
      const pills = [];
      const intervalMs = timings.intervalMs;
      for (let i = 0; i < (appSettings.showUpcomingListCount || 3); i++) {
        const timeMs = timings.nextOccurrenceMs + (i * intervalMs);
        const isFirst = i === 0 && !timings.isLive;
        pills.push(`
          <span class="schedule-pill ${isFirst ? 'next-pill' : ''}">
            ${formatDisplayTime(timeMs, 'short')}
          </span>
        `);
      }
      pillsContainer.innerHTML = pills.join('');
    }
  });

  statActiveEvents.textContent = String(activeCount);
  statNextEvent.textContent = nextSoonestName;
}

// 8. Milestone Alert System
function checkMilestoneNotification(event, timings, milestoneMinute) {
  const milestoneKey = `${event.id}_${timings.nextOccurrenceMs}_m${milestoneMinute}`;
  if (notifiedMilestones[milestoneKey]) return;
  notifiedMilestones[milestoneKey] = true;

  if (milestoneMinute === 0) {
    playChime('live');
    const title = `🎉 ${event.name} has started!`;
    const msg = `The event is now active for ${event.durationMinutes || 0} minutes.`;
    showToast(title, msg, event.icon || '🔥', event.themeColor || '#10b981');
    sendDesktopNotification(title, msg);
  } else {
    playChime('chime');
    const title = `⏰ ${event.name} starts in ${milestoneMinute} minute(s)`;
    const msg = `Next cycle at ${formatDisplayTime(timings.nextOccurrenceMs, 'short')}`;
    showToast(title, msg, event.icon || '⏳', '#f59e0b');
    sendDesktopNotification(title, msg);
  }
}

// 9. Event Listeners (View Controls Only)
tzModeSelect.addEventListener('change', (e) => {
  appSettings.displayTimezone = e.target.value;
  saveSettings(true);
});

soundToggleBtn.addEventListener('click', () => {
  initAudioContext();
  appSettings.soundEnabled = !appSettings.soundEnabled;
  saveSettings();
  if (appSettings.soundEnabled) {
    playChime('chime');
    showToast('Sound ON', 'Notification chimes enabled', '🔊');
  } else {
    showToast('Sound OFF', 'Notification chimes muted', '🔇');
  }
});

notifyToggleBtn.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    alert('Browser does not support desktop notifications');
    return;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      appSettings.browserNotification = true;
      saveSettings();
      sendDesktopNotification('Notifications Enabled', 'Roblox Event Tracker will notify you when events start');
      showToast('Notifications Enabled', '', '🔔');
    }
  } else if (Notification.permission === 'granted') {
    appSettings.browserNotification = !appSettings.browserNotification;
    saveSettings();
    showToast('Notifications', appSettings.browserNotification ? 'Enabled' : 'Disabled', '🔔');
  } else {
    alert('Notifications are blocked by browser settings.');
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('click', () => {
  initAudioContext();
}, { once: true });

// App Init
loadConfiguration();
tick();
setInterval(tick, 1000);
