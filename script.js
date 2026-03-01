// Pomodoro Prime - Enhanced JavaScript
// Features: Celestial animation, weather effects, multiple sounds, focus mode
// ADHD-friendly: Simple, focused, minimal distractions

// ==================== STATE MANAGEMENT ====================
let timerState = {
  isRunning: false,
  mode: 'focus',
  remainingTime: 25 * 60 * 1000,
  totalTime: 25 * 60 * 1000,
  cycle: 1,
  interval: null,
  startTime: null
};

let statsState = {
  pomodoros: 0,
  focusTime: 0,
  streak: 0,
  lastSessionDate: null
};

let soundSettings = {
  volume: 0.5,
  soundType: 'chime'
};

let currentTheme = 'forest';
let isDarkMode = false;
let highContrast = false;
let weatherEffect = 'auto';

let options = {
  autoStart: false,
  skipBreaks: false,
  focusMode: false
};

let tasks = [];

const DURATIONS = {
  focus: 25 * 60 * 1000,
  short: 5 * 60 * 1000,
  long: 15 * 60 * 1000
};

// ==================== DOM ELEMENTS ====================
let timerDisplay, timerType, progressBar, currentCycle, startBtn, resetBtn, skipBtn, taskInput, modeBtns;
let themeToggleBtn, presetBtns, volumeSlider, testSoundBtn;
let statPomodoros, statFocusTime, statStreak;
let progressPercent, timeElapsed, timeRemaining;
let customMinutes, customDurationBtn;
let newTaskInput, addTaskBtn, taskList;
let shortcutsBtn, optionsToggle, optionsList;
let onboardingModal, closeOnboarding, startJourneyBtn;
let shortcutsModal, closeShortcuts;
let highContrastToggle, themeOptions, focusModeToggle, volumeValue;
let focusExitBtn;
let soundTypeBtns, weatherBtns;
let audioContext;
let particlesCanvas, particlesCtx, particles = [];
let skyCanvas, skyCtx, stars = [];
let celestialBody, celestialCircle, celestialGlowEffect, timerSkyGradient;
let skyAnimationId = null, particleAnimationId = null;
let timerStarsInitialized = false;

// ==================== THEME COLORS ====================
const THEME_COLORS = {
  forest: {
    sunrise:   { top: [135, 206, 235], middle: [255, 183,  77], bottom: [255, 127,  80] },
    morning:   { top: [135, 206, 235], middle: [176, 224, 230], bottom: [255, 255, 255] },
    midday:    { top: [ 70, 130, 180], middle: [135, 206, 235], bottom: [173, 216, 230] },
    afternoon: { top: [100, 149, 237], middle: [255, 218, 185], bottom: [255, 160, 122] },
    sunset:    { top: [ 72,  61, 139], middle: [255, 140,   0], bottom: [255,  69,   0] },
    night:     { top: [ 10,  10,  30], middle: [ 20,  20,  50], bottom: [ 30,  30,  70] },
    focus: '#2D5A27', focusLight: '#4A7C43',
    short: '#5D8A66', shortLight: '#8AB896',
    long: '#8B7355',  longLight: '#B8A99A'
  },
  ocean: {
    sunrise:   { top: [135, 206, 250], middle: [255, 200, 150], bottom: [255, 150, 100] },
    morning:   { top: [135, 206, 250], middle: [173, 216, 230], bottom: [240, 248, 255] },
    midday:    { top: [ 30, 144, 255], middle: [135, 206, 250], bottom: [173, 216, 230] },
    afternoon: { top: [ 65, 105, 225], middle: [255, 200, 150], bottom: [255, 150, 100] },
    sunset:    { top: [ 25,  25, 112], middle: [255, 140,   0], bottom: [255, 100,  50] },
    night:     { top: [ 10,  10,  40], middle: [ 20,  30,  60], bottom: [ 30,  50,  80] },
    focus: '#1E90FF', focusLight: '#4169E1',
    short: '#20B2AA', shortLight: '#5DADE2',
    long: '#008B8B',  longLight: '#48D1CC'
  },
  mountain: {
    sunrise:   { top: [176, 196, 222], middle: [255, 218, 185], bottom: [210, 180, 140] },
    morning:   { top: [176, 196, 222], middle: [230, 230, 250], bottom: [255, 250, 250] },
    midday:    { top: [135, 206, 235], middle: [176, 196, 222], bottom: [200, 200, 220] },
    afternoon: { top: [119, 136, 153], middle: [255, 218, 185], bottom: [210, 180, 140] },
    sunset:    { top: [ 47,  79,  79], middle: [255, 140,   0], bottom: [210, 105,  30] },
    night:     { top: [ 15,  15,  25], middle: [ 25,  25,  40], bottom: [ 40,  40,  60] },
    focus: '#6B8E23', focusLight: '#8B9A46',
    short: '#8B4513', shortLight: '#CD853F',
    long: '#556B2F',  longLight: '#8B7355'
  },
  space: {
    sunrise:   { top: [ 75,   0, 130], middle: [255, 100, 100], bottom: [255, 150, 150] },
    morning:   { top: [ 75,   0, 130], middle: [147, 112, 219], bottom: [186,  85, 211] },
    midday:    { top: [ 25,  25, 112], middle: [ 75,   0, 130], bottom: [147, 112, 219] },
    afternoon: { top: [ 72,  61, 139], middle: [255, 100, 100], bottom: [255, 150, 150] },
    sunset:    { top: [  0,   0,   0], middle: [255, 100, 100], bottom: [255,  50,  50] },
    night:     { top: [  5,   5,  15], middle: [ 10,  10,  25], bottom: [ 20,  20,  35] },
    focus: '#9400D3', focusLight: '#BA55D3',
    short: '#FF6347', shortLight: '#FFA07A',
    long: '#32CD32',  longLight: '#90EE90'
  }
};

// ==================== LOCAL STORAGE ====================
function saveToStorage() {
  try {
    const data = {
      timerState: {
        mode: timerState.mode,
        totalTime: timerState.totalTime,
        remainingTime: timerState.remainingTime,
        cycle: timerState.cycle
      },
      statsState,
      soundSettings,
      themeSettings: { currentTheme, isDarkMode, highContrast },
      weatherEffect,
      options,
      tasks
    };
    localStorage.setItem('pomodoroPrimeData', JSON.stringify(data));
  } catch (e) {
    console.warn('Pomodoro Prime: could not save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('pomodoroPrimeData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.timerState) {
        timerState.mode = data.timerState.mode || 'focus';
        timerState.totalTime = data.timerState.totalTime || DURATIONS.focus;
        timerState.remainingTime = data.timerState.remainingTime || DURATIONS.focus;
        timerState.cycle = data.timerState.cycle || 1;
      }
      if (data.statsState) statsState = { ...statsState, ...data.statsState };
      if (data.soundSettings) soundSettings = { ...soundSettings, ...data.soundSettings };
      if (data.themeSettings) {
        currentTheme = data.themeSettings.currentTheme || 'forest';
        isDarkMode = data.themeSettings.isDarkMode || false;
        highContrast = data.themeSettings.highContrast || false;
      }
      if (data.weatherEffect) weatherEffect = data.weatherEffect;
      if (data.options) options = { ...options, ...data.options };
      if (data.tasks) tasks = data.tasks;
    }
    const hasVisited = localStorage.getItem('pomodoroPrimeVisited');
    if (!hasVisited) showOnboarding();
  } catch (e) {
    console.warn('Pomodoro Prime: could not load from localStorage:', e);
    showOnboarding();
  }
}

// ==================== INITIALIZATION ====================
function initDOM() {
  timerDisplay = document.getElementById('timerDisplay');
  timerType = document.getElementById('timerType');
  progressBar = document.getElementById('progressBar');
  currentCycle = document.getElementById('currentCycle');
  startBtn = document.getElementById('startBtn');
  resetBtn = document.getElementById('resetBtn');
  skipBtn = document.getElementById('skipBtn');
  taskInput = document.getElementById('taskInput');
  modeBtns = document.querySelectorAll('.mode-btn');
  themeToggleBtn = document.getElementById('themeToggle');
  presetBtns = document.querySelectorAll('.preset-btn');
  volumeSlider = document.getElementById('volumeSlider');
  testSoundBtn = document.getElementById('testSoundBtn');
  statPomodoros = document.getElementById('statPomodoros');
  statFocusTime = document.getElementById('statFocusTime');
  statStreak = document.getElementById('statStreak');
  progressPercent = document.getElementById('progressPercent');
  timeElapsed = document.getElementById('timeElapsed');
  timeRemaining = document.getElementById('timeRemaining');
  customMinutes = document.getElementById('customMinutes');
  customDurationBtn = document.getElementById('customDurationBtn');
  newTaskInput = document.getElementById('newTaskInput');
  addTaskBtn = document.getElementById('addTaskBtn');
  taskList = document.getElementById('taskList');
  // settingsBtn removed from UI
  shortcutsBtn = document.getElementById('shortcutsBtn');
  optionsToggle = document.getElementById('optionsToggle');
  optionsList = document.getElementById('optionsList');
  onboardingModal = document.getElementById('onboardingModal');
  closeOnboarding = document.getElementById('closeOnboarding');
  startJourneyBtn = document.getElementById('startJourneyBtn');
  shortcutsModal = document.getElementById('shortcutsModal');
  closeShortcuts = document.getElementById('closeShortcuts');
  highContrastToggle = document.getElementById('highContrastToggle');
  focusModeToggle = document.getElementById('focusModeToggle');
  themeOptions = document.querySelectorAll('.theme-option');
  volumeValue = document.getElementById('volumeValue');
  focusExitBtn = document.getElementById('focusExitBtn');
  soundTypeBtns = document.querySelectorAll('.sound-type-btn');
  weatherBtns = document.querySelectorAll('.weather-btn');
  particlesCanvas = document.getElementById('particlesCanvas');
  particlesCtx = particlesCanvas.getContext('2d');
  skyCanvas = document.getElementById('skyCanvas');
  skyCtx = skyCanvas.getContext('2d');
  celestialBody = document.getElementById('celestialBody');
  celestialCircle = document.getElementById('celestialCircle');
  celestialGlowEffect = document.getElementById('celestialGlowEffect');
  timerSkyGradient = document.getElementById('timerSkyGradient');
}

// ==================== UTILITY FUNCTIONS ====================
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timerState.remainingTime);
  document.title = `${formatTime(timerState.remainingTime)} - Pomodoro Prime`;

  const elapsed = timerState.totalTime - timerState.remainingTime;
  const progress = Math.round((elapsed / timerState.totalTime) * 100);
  progressPercent.textContent = `${progress}%`;
  timeElapsed.textContent = formatTime(elapsed);
  timeRemaining.textContent = formatTime(timerState.remainingTime);

  if (timerState.remainingTime <= 10000 && timerState.remainingTime > 0) {
    timerDisplay.classList.add('countdown');
  } else {
    timerDisplay.classList.remove('countdown');
  }
}

function updateProgress() {
  const circumference = 2 * Math.PI * 45;
  const progress = (timerState.totalTime - timerState.remainingTime) / timerState.totalTime;
  const dashOffset = circumference - (progress * circumference);
  progressBar.style.strokeDashoffset = dashOffset;

  updateCelestialBody(progress);
  updateTimerSkyGradient(progress);
}

// ==================== CELESTIAL BODY IN TIMER ====================
function initTimerStars() {
  const starsGroup = document.getElementById('timerStars');
  if (!starsGroup || timerStarsInitialized) return;
  timerStarsInitialized = true;

  for (let i = 0; i < 20; i++) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 38;
    star.setAttribute('cx', (50 + Math.cos(angle) * dist).toFixed(1));
    star.setAttribute('cy', (50 + Math.sin(angle) * dist).toFixed(1));
    star.setAttribute('r', (Math.random() * 0.8 + 0.3).toFixed(1));
    star.setAttribute('fill', 'white');
    star.setAttribute('opacity', (Math.random() * 0.7 + 0.3).toFixed(2));
    starsGroup.appendChild(star);
  }
}

function updateCelestialBody(progress) {
  if (!celestialBody || !celestialCircle || !celestialGlowEffect) return;

  // Sun: 0.0-0.5, Moon: 0.5-1.0
  const isSun = progress < 0.5;
  let t;
  if (isSun) {
    t = progress / 0.5;
  } else {
    t = (progress - 0.5) / 0.5;
  }

  // Compensate for SVG rotate(-90deg): swap axes so on-screen path
  // goes lower-left → top-center → lower-right (like the background sky)
  // screen_x = svg_y, screen_y = 100 - svg_x
  const x = 22 + Math.sin(t * Math.PI) * 56;
  const y = 15 + t * 70;

  celestialCircle.setAttribute('cx', x.toFixed(1));
  celestialCircle.setAttribute('cy', y.toFixed(1));
  celestialGlowEffect.setAttribute('cx', x.toFixed(1));
  celestialGlowEffect.setAttribute('cy', y.toFixed(1));

  // Size: bigger at peak of arc
  const size = 5 + Math.sin(t * Math.PI) * 3;
  celestialCircle.setAttribute('r', size.toFixed(1));

  // Glow size
  celestialGlowEffect.setAttribute('r', (size * 3).toFixed(1));

  if (isSun) {
    celestialCircle.setAttribute('fill', '#FFD700');
    celestialGlowEffect.setAttribute('opacity', (0.5 * Math.sin(t * Math.PI)).toFixed(2));
    // Update glow gradient color to sun
    const glowStops = document.getElementById('celestialGlow');
    if (glowStops) {
      glowStops.querySelector('stop:first-child').setAttribute('style', 'stop-color:#FFD700;stop-opacity:0.8');
      glowStops.querySelector('stop:last-child').setAttribute('style', 'stop-color:#FFD700;stop-opacity:0');
    }
  } else {
    celestialCircle.setAttribute('fill', '#E0E8F0');
    celestialGlowEffect.setAttribute('opacity', (0.3 * Math.sin(t * Math.PI)).toFixed(2));
    const glowStops = document.getElementById('celestialGlow');
    if (glowStops) {
      glowStops.querySelector('stop:first-child').setAttribute('style', 'stop-color:#C0D0E8;stop-opacity:0.6');
      glowStops.querySelector('stop:last-child').setAttribute('style', 'stop-color:#C0D0E8;stop-opacity:0');
    }
  }

  // Timer stars visibility
  const starsGroup = document.getElementById('timerStars');
  if (starsGroup) {
    let starOpacity = 0;
    if (progress >= 0.45 && progress < 0.55) {
      starOpacity = (progress - 0.45) / 0.1;
    } else if (progress >= 0.55 && progress < 0.92) {
      starOpacity = 1;
    } else if (progress >= 0.92) {
      starOpacity = Math.max(0, (1.0 - progress) / 0.08);
    }
    starsGroup.setAttribute('opacity', starOpacity.toFixed(2));
  }
}

function updateTimerSkyGradient(progress) {
  if (!timerSkyGradient) return;

  const colors = getInterpolatedSkyColors(progress);
  const stops = timerSkyGradient.querySelectorAll('stop');

  if (stops.length >= 3) {
    stops[0].setAttribute('style', `stop-color:rgb(${colors.top.join(',')});stop-opacity:1`);
    stops[1].setAttribute('style', `stop-color:rgb(${colors.middle.join(',')});stop-opacity:1`);
    stops[2].setAttribute('style', `stop-color:rgb(${colors.bottom.join(',')});stop-opacity:1`);
  }
}

function updateCycle() {
  currentCycle.textContent = `${timerState.cycle}/4`;
  document.querySelectorAll('.cycle-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index < timerState.cycle);
  });
}

function updateTimerType() {
  const typeLabels = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };
  timerType.textContent = typeLabels[timerState.mode];
  progressBar.setAttribute('data-mode', timerState.mode);
  timerType.setAttribute('data-mode', timerState.mode);
}

function updateButtons() {
  if (timerState.isRunning) {
    startBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">⏸</span><span class="btn-text">Pause</span>';
    startBtn.classList.add('btn-secondary');
    startBtn.setAttribute('aria-label', 'Pause timer');
  } else {
    startBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">▶</span><span class="btn-text">Start</span>';
    startBtn.classList.remove('btn-secondary');
    startBtn.setAttribute('aria-label', 'Start timer');
  }
}

function updateStats() {
  statPomodoros.textContent = statsState.pomodoros;
  statFocusTime.textContent = `${statsState.focusTime}m`;
  statStreak.textContent = statsState.streak;
}

function updateThemeColors() {
  const colors = THEME_COLORS[currentTheme];
  document.documentElement.style.setProperty('--color-focus', colors.focus);
  document.documentElement.style.setProperty('--color-focus-light', colors.focusLight);
  document.documentElement.style.setProperty('--color-short-break', colors.short);
  document.documentElement.style.setProperty('--color-short-break-light', colors.shortLight);
  document.documentElement.style.setProperty('--color-long-break', colors.long);
  document.documentElement.style.setProperty('--color-long-break-light', colors.longLight);
}

// ==================== AUDIO FUNCTIONS ====================
function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playAlarm() {
  try {
    ensureAudioContext();
    const vol = soundSettings.volume;
    switch (soundSettings.soundType) {
      case 'bell':    playBell(vol); break;
      case 'digital': playDigital(vol); break;
      case 'gentle':  playGentle(vol); break;
      default:        playChime(vol); break;
    }
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playChime(volume) {
  const t = audioContext.currentTime;
  // First note
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.connect(gain1);
  gain1.connect(audioContext.destination);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523.25, t);
  osc1.frequency.exponentialRampToValueAtTime(783.99, t + 0.1);
  gain1.gain.setValueAtTime(0, t);
  gain1.gain.linearRampToValueAtTime(0.3 * volume, t + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
  osc1.start(t);
  osc1.stop(t + 0.5);

  // Second note (delayed)
  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.connect(gain2);
  gain2.connect(audioContext.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(659.25, t + 0.3);
  osc2.frequency.exponentialRampToValueAtTime(1046.50, t + 0.45);
  gain2.gain.setValueAtTime(0, t + 0.3);
  gain2.gain.linearRampToValueAtTime(0.25 * volume, t + 0.35);
  gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.9);
  osc2.start(t + 0.3);
  osc2.stop(t + 0.9);
}

function playBell(volume) {
  const t = audioContext.currentTime;
  // Deep bell chord with harmonics
  const freqs = [261.63, 329.63, 392.00];
  freqs.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime((0.25 - i * 0.06) * volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}

function playDigital(volume) {
  const t = audioContext.currentTime;
  // Three short beeps
  [0, 0.15, 0.3].forEach(offset => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t + offset);
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.12 * volume, t + offset + 0.01);
    gain.gain.setValueAtTime(0.12 * volume, t + offset + 0.08);
    gain.gain.linearRampToValueAtTime(0, t + offset + 0.1);
    osc.start(t + offset);
    osc.stop(t + offset + 0.12);
  });
}

function playGentle(volume) {
  const t = audioContext.currentTime;
  // Soft rising dual-tone
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.connect(gain1);
  gain1.connect(audioContext.destination);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(392, t);
  osc1.frequency.linearRampToValueAtTime(523.25, t + 1);
  gain1.gain.setValueAtTime(0, t);
  gain1.gain.linearRampToValueAtTime(0.18 * volume, t + 0.3);
  gain1.gain.linearRampToValueAtTime(0.12 * volume, t + 0.8);
  gain1.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
  osc1.start(t);
  osc1.stop(t + 1.5);

  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.connect(gain2);
  gain2.connect(audioContext.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(523.25, t + 0.2);
  osc2.frequency.linearRampToValueAtTime(659.25, t + 1.2);
  gain2.gain.setValueAtTime(0, t + 0.2);
  gain2.gain.linearRampToValueAtTime(0.1 * volume, t + 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
  osc2.start(t + 0.2);
  osc2.stop(t + 1.5);
}

// ==================== NOTIFICATIONS ====================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌲</text></svg>',
      tag: 'pomodoro-timer',
      requireInteraction: false
    });
    setTimeout(() => notification.close(), 5000);
  }
}

// ==================== TIMER FUNCTIONS ====================
function onTimerComplete() {
  playAlarm();
  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

  timerDisplay.classList.add('timer-complete');
  setTimeout(() => timerDisplay.classList.remove('timer-complete'), 3000);

  let notificationTitle, notificationBody;
  if (timerState.mode === 'focus') {
    notificationTitle = '🌲 Focus Complete!';
    notificationBody = 'Great work! Time for a break.';
    statsState.pomodoros++;
    statsState.focusTime += Math.round(timerState.totalTime / 60000);

    const today = new Date().toDateString();
    if (statsState.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (statsState.lastSessionDate === yesterday.toDateString()) {
        statsState.streak++;
      } else {
        statsState.streak = statsState.lastSessionDate === null ? 1 : 1;
      }
      statsState.lastSessionDate = today;
    }
    updateStats();
  } else if (timerState.mode === 'short') {
    notificationTitle = '🌿 Break Over!';
    notificationBody = 'Ready to focus again?';
  } else {
    notificationTitle = '🍃 Long Break Over!';
    notificationBody = 'Feeling refreshed? Let\'s focus!';
  }

  showBrowserNotification(notificationTitle, notificationBody);
  saveToStorage();

  let nextMode;
  if (timerState.mode === 'focus') {
    timerState.cycle++;
    if (timerState.cycle > 4) {
      timerState.cycle = 1;
      nextMode = 'long';
    } else {
      nextMode = 'short';
    }
  } else {
    nextMode = 'focus';
  }

  setTimeout(() => {
    if (options.skipBreaks && nextMode !== 'focus') {
      nextMode = 'focus';
    }
    setMode(nextMode);
    if (options.autoStart) {
      startTimer();
    }
  }, 2000);
}

function setMode(mode) {
  timerState.mode = mode;
  timerState.totalTime = DURATIONS[mode];
  timerState.remainingTime = timerState.totalTime;
  clearInterval(timerState.interval);
  timerState.isRunning = false;

  updateTimerType();
  updateDisplay();
  updateProgress();
  updateCycle();
  updateModeButtons();
  updateButtons();
  saveToStorage();
}

function updateModeButtons() {
  modeBtns.forEach(btn => {
    const isActive = btn.dataset.mode === timerState.mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive.toString());
  });
}

function startTimer() {
  if (timerState.isRunning) return;
  timerState.isRunning = true;
  timerState.startTime = Date.now() - (timerState.totalTime - timerState.remainingTime);
  updateButtons();

  timerState.interval = setInterval(() => {
    const elapsed = Date.now() - timerState.startTime;
    timerState.remainingTime = Math.max(0, timerState.totalTime - elapsed);

    updateDisplay();
    updateProgress();

    if (timerState.remainingTime <= 0) {
      clearInterval(timerState.interval);
      timerState.isRunning = false;
      onTimerComplete();
    }
  }, 250); // Update 4x/sec for smoother progress bar
}

function pauseTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  clearInterval(timerState.interval);
  updateButtons();
  saveToStorage();
}

function resetTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.remainingTime = timerState.totalTime;
  updateDisplay();
  updateProgress();
  updateButtons();
  timerDisplay.classList.remove('timer-complete');
  saveToStorage();
}

function skipTimer() {
  pauseTimer();
  if (options.skipBreaks && timerState.mode !== 'focus') {
    setMode('focus');
    if (options.autoStart) startTimer();
  } else {
    let nextMode;
    if (timerState.mode === 'focus') {
      if (timerState.cycle >= 4) {
        nextMode = 'long';
      } else {
        nextMode = 'short';
      }
    } else {
      nextMode = 'focus';
    }
    setMode(nextMode);
    if (options.autoStart) startTimer();
  }
}

function setCustomDuration(minutes) {
  timerState.totalTime = minutes * 60 * 1000;
  timerState.remainingTime = timerState.totalTime;
  timerState.mode = 'focus';
  clearInterval(timerState.interval);
  timerState.isRunning = false;

  updateTimerType();
  updateDisplay();
  updateProgress();
  updateButtons();
  updateModeButtons();
  saveToStorage();

  presetBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', (parseInt(btn.dataset.minutes) === minutes).toString());
  });
}

// ==================== TASK FUNCTIONS ====================
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    empty.textContent = 'No tasks yet — add one above';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.index = index;
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
      <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
      <button class="task-delete" aria-label="Delete task">✕</button>
    `;
    taskList.appendChild(li);
  });

  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.closest('.task-item').dataset.index);
      toggleTaskComplete(index);
    });
  });

  document.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.task-item').dataset.index);
      deleteTask(index);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function addTask() {
  const text = newTaskInput.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false, createdAt: Date.now() });
  newTaskInput.value = '';
  renderTasks();
  saveToStorage();
}

function toggleTaskComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  saveToStorage();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  saveToStorage();
}

// ==================== THEME FUNCTIONS ====================
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeToggleBtn.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
  saveToStorage();
}

function setTheme(theme) {
  currentTheme = theme;
  updateThemeColors();
  themeOptions.forEach(btn => {
    const isActive = btn.dataset.theme === theme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  saveToStorage();
}

function applyHighContrast() {
  document.body.classList.toggle('high-contrast', highContrast);
  if (highContrastToggle) highContrastToggle.checked = highContrast;
  saveToStorage();
}

function applyFocusMode() {
  document.body.classList.toggle('focus-mode', options.focusMode);
  if (focusModeToggle) focusModeToggle.checked = options.focusMode;
  saveToStorage();
}

function setWeatherEffect(weather) {
  weatherEffect = weather;
  weatherBtns.forEach(btn => {
    const isActive = btn.dataset.weather === weather;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  // Recreate particles for new weather
  createParticles();
  saveToStorage();
}

function setSoundType(type) {
  soundSettings.soundType = type;
  soundTypeBtns.forEach(btn => {
    const isActive = btn.dataset.sound === type;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  saveToStorage();
}

// ==================== MODAL FUNCTIONS ====================
function showOnboarding() {
  if (onboardingModal) onboardingModal.setAttribute('aria-hidden', 'false');
}

function hideOnboarding() {
  if (onboardingModal) onboardingModal.setAttribute('aria-hidden', 'true');
  localStorage.setItem('pomodoroPrimeVisited', 'true');
}

function showShortcuts() {
  if (shortcutsModal) shortcutsModal.setAttribute('aria-hidden', 'false');
}

function hideShortcuts() {
  if (shortcutsModal) shortcutsModal.setAttribute('aria-hidden', 'true');
}

function toggleOptionsList() {
  const isExpanded = optionsToggle.getAttribute('aria-expanded') === 'true';
  optionsToggle.setAttribute('aria-expanded', (!isExpanded).toString());
  optionsList.hidden = isExpanded;
}

// ==================== SKY ANIMATION ====================
function initSky() {
  resizeSkyCanvas();
  createStars();
  animateSky();
}

function resizeSkyCanvas() {
  skyCanvas.width = window.innerWidth;
  skyCanvas.height = window.innerHeight;
}

function createStars() {
  stars = [];
  const starCount = Math.min(120, Math.floor(skyCanvas.width * skyCanvas.height / 8000));
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * skyCanvas.width,
      y: Math.random() * skyCanvas.height * 0.7,
      size: Math.random() * 2 + 0.5,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleDir: Math.random() > 0.5 ? 1 : -1
    });
  }
}

function lerpColor(c1, c2, t) {
  t = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t)
  ];
}

function getInterpolatedSkyColors(progress) {
  progress = Math.max(0, Math.min(1, progress));

  // Key phases: sun 0-0.5, moon 0.5-1.0
  // Colors transition naturally through day-night cycle
  const phases = [
    { at: 0.00, color: THEME_COLORS[currentTheme].sunrise },
    { at: 0.08, color: THEME_COLORS[currentTheme].morning },
    { at: 0.20, color: THEME_COLORS[currentTheme].midday },
    { at: 0.38, color: THEME_COLORS[currentTheme].afternoon },
    { at: 0.48, color: THEME_COLORS[currentTheme].sunset },
    { at: 0.55, color: THEME_COLORS[currentTheme].night },
    { at: 0.92, color: THEME_COLORS[currentTheme].night },
    { at: 1.00, color: THEME_COLORS[currentTheme].sunrise }
  ];

  // Find surrounding phases
  let prev = phases[0], next = phases[1];
  for (let i = 0; i < phases.length - 1; i++) {
    if (progress >= phases[i].at && progress <= phases[i + 1].at) {
      prev = phases[i];
      next = phases[i + 1];
      break;
    }
  }

  const range = next.at - prev.at;
  const t = range > 0 ? (progress - prev.at) / range : 0;

  // Smooth easing for more natural transitions
  const eased = t * t * (3 - 2 * t); // smoothstep

  return {
    top: lerpColor(prev.color.top, next.color.top, eased),
    middle: lerpColor(prev.color.middle, next.color.middle, eased),
    bottom: lerpColor(prev.color.bottom, next.color.bottom, eased)
  };
}

function drawSky(colors) {
  const gradient = skyCtx.createLinearGradient(0, 0, 0, skyCanvas.height);
  gradient.addColorStop(0, `rgb(${colors.top.join(',')})`);
  gradient.addColorStop(0.5, `rgb(${colors.middle.join(',')})`);
  gradient.addColorStop(1, `rgb(${colors.bottom.join(',')})`);
  skyCtx.fillStyle = gradient;
  skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
}

function drawSun(progress) {
  // Sun visible from 0.0 to 0.5
  if (progress >= 0.5) return;

  const t = progress / 0.5; // 0 to 1
  const sunX = skyCanvas.width * 0.1 + skyCanvas.width * 0.8 * t;
  const sunY = skyCanvas.height * 0.85 - Math.sin(t * Math.PI) * skyCanvas.height * 0.65;
  const sunSize = 30 + Math.sin(t * Math.PI) * 15;

  // Horizon fade: fade near edges (sunrise/sunset)
  const horizonFade = Math.sin(t * Math.PI);

  // Outer glow
  const glowGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 3.5);
  glowGradient.addColorStop(0, `rgba(255, 255, 200, ${0.35 * horizonFade})`);
  glowGradient.addColorStop(0.4, `rgba(255, 200, 100, ${0.15 * horizonFade})`);
  glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
  skyCtx.fillStyle = glowGradient;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize * 3.5, 0, Math.PI * 2);
  skyCtx.fill();

  // Sun body
  const sunGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize);
  sunGradient.addColorStop(0, `rgba(255, 255, 220, ${0.9 + 0.1 * horizonFade})`);
  sunGradient.addColorStop(0.7, `rgba(255, 210, 100, ${0.85 + 0.15 * horizonFade})`);
  sunGradient.addColorStop(1, `rgba(255, 150, 50, ${0.6 + 0.2 * horizonFade})`);
  skyCtx.fillStyle = sunGradient;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
  skyCtx.fill();
}

function drawMoon(progress) {
  // Moon visible from 0.5 to 1.0
  if (progress < 0.5) return;

  const t = (progress - 0.5) / 0.5; // 0 to 1
  const moonX = skyCanvas.width * 0.1 + skyCanvas.width * 0.8 * t;
  const moonY = skyCanvas.height * 0.85 - Math.sin(t * Math.PI) * skyCanvas.height * 0.65;
  const moonSize = 28 + Math.sin(t * Math.PI) * 8;
  const horizonFade = Math.sin(t * Math.PI);

  // Moon glow
  const glowGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize * 3);
  glowGradient.addColorStop(0, `rgba(200, 220, 255, ${0.25 * horizonFade})`);
  glowGradient.addColorStop(0.5, `rgba(150, 180, 255, ${0.1 * horizonFade})`);
  glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
  skyCtx.fillStyle = glowGradient;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize * 3, 0, Math.PI * 2);
  skyCtx.fill();

  // Moon body
  const moonGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize);
  moonGradient.addColorStop(0, 'rgba(240, 240, 255, 1)');
  moonGradient.addColorStop(0.6, 'rgba(210, 215, 235, 1)');
  moonGradient.addColorStop(1, 'rgba(180, 185, 210, 1)');
  skyCtx.fillStyle = moonGradient;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
  skyCtx.fill();

  // Moon craters
  skyCtx.fillStyle = `rgba(170, 175, 200, ${0.3 * horizonFade})`;
  skyCtx.beginPath();
  skyCtx.arc(moonX - moonSize * 0.25, moonY - moonSize * 0.15, moonSize * 0.15, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.beginPath();
  skyCtx.arc(moonX + moonSize * 0.2, moonY + moonSize * 0.25, moonSize * 0.12, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.beginPath();
  skyCtx.arc(moonX + moonSize * 0.3, moonY - moonSize * 0.1, moonSize * 0.08, 0, Math.PI * 2);
  skyCtx.fill();
}

function drawStars(progress) {
  // Stars visible during night phase (0.45 to 0.98)
  let visibility = 0;
  if (progress >= 0.45 && progress < 0.55) {
    visibility = (progress - 0.45) / 0.1;
  } else if (progress >= 0.55 && progress < 0.92) {
    visibility = 1;
  } else if (progress >= 0.92 && progress <= 1) {
    visibility = Math.max(0, (1.0 - progress) / 0.08);
  }

  if (visibility <= 0) return;

  stars.forEach(star => {
    star.opacity += star.twinkleSpeed * star.twinkleDir;
    if (star.opacity > 1) { star.opacity = 1; star.twinkleDir = -1; }
    if (star.opacity < 0.2) { star.opacity = 0.2; star.twinkleDir = 1; }

    skyCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity * visibility})`;
    skyCtx.beginPath();
    skyCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    skyCtx.fill();
  });
}

function animateSky() {
  let progress = 0;
  if (timerState.totalTime > 0) {
    progress = Math.min(1, Math.max(0, 1 - (timerState.remainingTime / timerState.totalTime)));
  }

  const colors = getInterpolatedSkyColors(progress);
  drawSky(colors);
  drawSun(progress);
  drawMoon(progress);
  drawStars(progress);

  skyAnimationId = requestAnimationFrame(animateSky);
}

// ==================== PARTICLES / WEATHER ====================
function initParticles() {
  resizeParticlesCanvas();
  createParticles();
  animateParticles();
}

function resizeParticlesCanvas() {
  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}

function getActiveWeather() {
  if (weatherEffect === 'auto') return 'clear';
  return weatherEffect;
}

function createParticles() {
  particles = [];
  const weather = getActiveWeather();
  const w = particlesCanvas.width;
  const h = particlesCanvas.height;

  switch (weather) {
    case 'rain': {
      const count = Math.min(100, Math.floor(w * h / 10000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.5,
          speedX: 0.3 + Math.random() * 0.5,
          speedY: 5 + Math.random() * 5,
          opacity: Math.random() * 0.4 + 0.2,
          type: 'rain',
          length: Math.random() * 10 + 8
        });
      }
      break;
    }
    case 'snow': {
      const count = Math.min(60, Math.floor(w * h / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: 0.5 + Math.random() * 1,
          opacity: Math.random() * 0.6 + 0.3,
          type: 'snow',
          wobble: Math.random() * Math.PI * 2
        });
      }
      break;
    }
    default: { // clear / auto
      const count = Math.min(25, Math.floor(w * h / 40000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 3 + 2,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.2,
          type: Math.random() > 0.5 ? 'firefly' : 'leaf'
        });
      }
    }
  }
}

function animateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  const w = particlesCanvas.width;
  const h = particlesCanvas.height;

  particles.forEach(particle => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    switch (particle.type) {
      case 'rain':
        // Reset when off screen
        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x > w + 10) particle.x = -10;

        // Draw raindrop as a line
        particlesCtx.strokeStyle = `rgba(180, 210, 255, ${particle.opacity})`;
        particlesCtx.lineWidth = particle.size;
        particlesCtx.beginPath();
        particlesCtx.moveTo(particle.x, particle.y);
        particlesCtx.lineTo(particle.x - particle.speedX * 0.5, particle.y - particle.length);
        particlesCtx.stroke();
        break;

      case 'snow':
        particle.wobble += 0.02;
        particle.x += Math.sin(particle.wobble) * 0.3;

        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;

        // Draw snowflake
        particlesCtx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        particlesCtx.fill();
        break;

      case 'firefly':
        // Wrap around
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;
        if (particle.y < -10) particle.y = h + 10;
        if (particle.y > h + 10) particle.y = -10;

        // Pulsing glow
        particle.opacity += (Math.random() - 0.5) * 0.06;
        particle.opacity = Math.max(0.15, Math.min(0.6, particle.opacity));

        particlesCtx.globalAlpha = particle.opacity;
        const gradient = particlesCtx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2.5
        );
        gradient.addColorStop(0, 'rgba(255, 255, 150, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
        particlesCtx.fillStyle = gradient;
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        particlesCtx.fill();
        particlesCtx.globalAlpha = 1;
        break;

      case 'leaf':
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;
        if (particle.y < -10) particle.y = h + 10;
        if (particle.y > h + 10) particle.y = -10;

        particlesCtx.globalAlpha = particle.opacity;
        particlesCtx.fillStyle = isDarkMode ? 'rgba(100, 150, 100, 0.6)' : 'rgba(80, 120, 80, 0.6)';
        particlesCtx.beginPath();
        particlesCtx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.5, 0, 0, Math.PI * 2);
        particlesCtx.fill();
        particlesCtx.globalAlpha = 1;
        break;
    }
  });

  particleAnimationId = requestAnimationFrame(animateParticles);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  loadFromStorage();

  // Apply saved settings
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
  }
  if (highContrast) {
    document.body.classList.add('high-contrast');
  }
  if (options.focusMode) {
    document.body.classList.add('focus-mode');
  }

  volumeSlider.value = soundSettings.volume * 100;
  volumeValue.textContent = `${Math.round(soundSettings.volume * 100)}%`;

  // Restore checkbox states
  highContrastToggle.checked = highContrast;
  focusModeToggle.checked = options.focusMode;
  document.getElementById('autoStartToggle').checked = options.autoStart;
  document.getElementById('skipBreaksToggle').checked = options.skipBreaks;

  // Set active theme
  themeOptions.forEach(btn => {
    const isActive = btn.dataset.theme === currentTheme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  // Set active sound type
  soundTypeBtns.forEach(btn => {
    const isActive = btn.dataset.sound === soundSettings.soundType;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  // Set active weather
  weatherBtns.forEach(btn => {
    const isActive = btn.dataset.weather === weatherEffect;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  // Set active preset
  presetBtns.forEach(btn => {
    const minutes = timerState.totalTime / 60000;
    btn.setAttribute('aria-pressed', (parseInt(btn.dataset.minutes) === minutes).toString());
  });

  updateThemeColors();
  initTimerStars();
  initParticles();
  initSky();
  renderTasks();
  updateDisplay();
  updateProgress();
  updateCycle();
  updateStats();
  updateTimerType();
  updateModeButtons();

  // ============ Timer Controls ============
  startBtn.addEventListener('click', () => {
    requestNotificationPermission();
    if (timerState.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn.addEventListener('click', resetTimer);
  skipBtn.addEventListener('click', skipTimer);

  // Mode buttons
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
    });
  });

  // Theme toggle (dark/light)
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setCustomDuration(parseInt(btn.dataset.minutes));
    });
  });

  // Custom duration
  customDurationBtn.addEventListener('click', () => {
    const minutes = parseInt(customMinutes.value);
    if (minutes && minutes > 0 && minutes <= 120) {
      setCustomDuration(minutes);
    }
  });
  customMinutes.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      customDurationBtn.click();
    }
  });

  // Volume slider
  volumeSlider.addEventListener('input', (e) => {
    soundSettings.volume = e.target.value / 100;
    volumeValue.textContent = `${e.target.value}%`;
    saveToStorage();
  });

  // Test sound
  testSoundBtn.addEventListener('click', playAlarm);

  // Sound type buttons
  soundTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setSoundType(btn.dataset.sound);
    });
  });

  // Weather buttons
  weatherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setWeatherEffect(btn.dataset.weather);
    });
  });

  // Options toggle
  optionsToggle.addEventListener('click', toggleOptionsList);

  // High contrast toggle (no double-toggle)
  highContrastToggle.addEventListener('change', (e) => {
    highContrast = e.target.checked;
    applyHighContrast();
  });

  // Focus mode toggle (no double-toggle)
  focusModeToggle.addEventListener('change', (e) => {
    options.focusMode = e.target.checked;
    applyFocusMode();
  });

  // Focus mode exit button
  focusExitBtn.addEventListener('click', () => {
    options.focusMode = false;
    applyFocusMode();
  });

  // Theme options
  themeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
    });
  });

  // Task input
  addTaskBtn.addEventListener('click', addTask);
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });

  // Settings button removed from UI

  // Shortcuts button
  shortcutsBtn.addEventListener('click', showShortcuts);

  // Onboarding modal
  closeOnboarding.addEventListener('click', hideOnboarding);
  startJourneyBtn.addEventListener('click', hideOnboarding);

  // Shortcuts modal
  closeShortcuts.addEventListener('click', hideShortcuts);

  // Auto-start toggle
  document.getElementById('autoStartToggle').addEventListener('change', (e) => {
    options.autoStart = e.target.checked;
    saveToStorage();
  });

  // Skip breaks toggle
  document.getElementById('skipBreaksToggle').addEventListener('change', (e) => {
    options.skipBreaks = e.target.checked;
    saveToStorage();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const isInputFocused = document.activeElement &&
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');

    if (isInputFocused && e.code !== 'Escape') return;

    switch (e.code) {
      case 'Space':
      case 'Enter':
        e.preventDefault();
        requestNotificationPermission();
        if (timerState.isRunning) pauseTimer();
        else startTimer();
        break;
      case 'KeyR':
        e.preventDefault();
        resetTimer();
        break;
      case 'KeyT':
        e.preventDefault();
        toggleTheme();
        break;
      case 'KeyS':
        e.preventDefault();
        skipTimer();
        break;
      case 'KeyF':
        e.preventDefault();
        options.focusMode = !options.focusMode;
        applyFocusMode();
        break;
      case 'Escape':
        e.preventDefault();
        if (options.focusMode) {
          options.focusMode = false;
          applyFocusMode();
        }
        hideOnboarding();
        hideShortcuts();
        break;
    }
  });

  // Window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeParticlesCanvas();
      resizeSkyCanvas();
      createStars();
      createParticles();
    }, 150);
  });

  // Pause canvas animations when tab is hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (skyAnimationId) { cancelAnimationFrame(skyAnimationId); skyAnimationId = null; }
      if (particleAnimationId) { cancelAnimationFrame(particleAnimationId); particleAnimationId = null; }
    } else {
      if (!skyAnimationId) animateSky();
      if (!particleAnimationId) animateParticles();
    }
  });

  // Close modals when clicking outside
  [onboardingModal, shortcutsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideOnboarding();
          hideShortcuts();
        }
      });
    }
  });
});
