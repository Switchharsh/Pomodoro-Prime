// Pomodoro Prime - Enhanced JavaScript (Optimized)
// Features: Celestial animation, weather effects, multiple sounds, focus mode
// Simple, focused, minimal distractions

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
// Weather cycling: tracks index for auto weather rotation sequence.
let weatherCycleIndex = 0;

const ALLOWED_WEATHER_MODES = ['auto', 'rain', 'snow', 'blossom', 'meteor', 'mist', 'breeze', 'fireflies'];
const AUTO_WEATHER_SEQUENCE = ['rain', 'snow', 'blossom', 'meteor', 'breeze'];
const ALLOWED_SOUND_TYPES = ['chime', 'bell', 'digital', 'gentle', 'harp', 'pulse', 'retro', 'wood', 'lightning', 'bird', 'metal', 'guitar', 'flute', 'mouthorgan', 'whitenoise', 'beach'];

// OPTIMIZATION: Debounce timeout for localStorage saves
let saveTimeout = null;

let options = {
  autoStart: false,
  skipBreaks: false,
  focusMode: false,
  lowPowerMode: false,
  breathingGuide: false,
  noAnimation: false,
  pomodoroStyle: 'classic'
};

let tasks = [];
let distractions = [];
let lastIntention = null;
let currentSessionDistractions = 0;

// Standalone breathing state
let isBreathingStandalone = false;
let breathingStandaloneInterval = null;
let breathingStandaloneTimeout = null;
let breathingCycleCount = 0;

// Task View State (Sorting and Filtering)
let taskViewState = {
  sortBy: 'original', // 'original' or 'status'
  filterBy: 'all'     // 'all', 'completed', or 'pending'
};

const DURATIONS = {
  focus: 25 * 60 * 1000,
  short: 5 * 60 * 1000,
  long: 15 * 60 * 1000
};
const DURATION_PRESETS = {
  classic: { focus: 25, short: 5, long: 15 },
  extended: { focus: 50, short: 10, long: 30 }
};

// ==================== DOM ELEMENTS ====================
let timerDisplay, timerType, progressBar, currentCycle, startBtn, resetBtn, skipBtn, modeBtns;
let themeToggleBtn, presetBtns, volumeSlider, testSoundBtn;
let statPomodoros, statFocusTime, statStreak;
let progressPercent, timeElapsed, timeRemaining;
let customMinutes, customDurationBtn;
let newTaskInput, addTaskBtn, taskList;
let taskSort, taskFilter;
let exportCsvBtn, importCsvBtn, csvFileInput;
let shortcutsBtn;
let onboardingModal, closeOnboarding, startJourneyBtn;
let shortcutsModal, closeShortcuts;
let highContrastToggle, themeOptions, focusModeToggle, lowPowerToggle, volumeValue;
let focusExitBtn;
let soundTypeBtns, weatherBtns;
let audioContext;
// New features
let timerSection;
let intentionInput, intentionBanner, intentionWrap;
let intentionSelect;
let distractionBtn, distractionPanel, distractionText, distractionAddBtn;
let distractionCount, distractionSessionNote;
let distractionSummary, clearDistractionsBtn;
let distractionTotal, distractionTopCategory, distractionTodayCount;
let breathingGuide, breathingCircle, breathingPhase;
let breathingGuideToggle;
let breatheStartBtn, breathingOverlay, breathingOverlayCircle, breathingOverlayPhase, breathingOverlayCounter, breathingStopBtn;
let onboardingTaskInput, onboardingAddTaskBtn, onboardingTaskList;
let noAnimationToggle, presetStyleBtns;
let particlesCanvas, particlesCtx, particles = [];
let skyCanvas, skyCtx, stars = [];
let celestialBody, celestialCircle, celestialGlowEffect, timerSkyGradient;
// OPTIMIZATION: Single animation loop ID instead of two separate loops
let animationFrameId = null;
let lastRenderTime = 0;
let targetAnimationFps = 30;
let animationFrameInterval = 1000 / targetAnimationFps;
// OPTIMIZATION: Cached timer stars DOM element
let timerStarsElement = null;
let timerStarsInitialized = false;
// OPTIMIZATION: Cached progress value to avoid recalculation
let cachedProgress = 0;

// ==================== THEME COLORS ====================
const THEME_COLORS = {
  forest: {
    sunrise:   { top: [135, 206, 235], middle: [255, 200,  87], bottom: [255, 140,  66] },
    morning:   { top: [135, 206, 235], middle: [180, 230, 180], bottom: [220, 245, 220] },
    midday:    { top: [ 60, 140,  80], middle: [100, 180, 120], bottom: [180, 220, 190] },
    afternoon: { top: [ 80, 140,  70], middle: [255, 200, 120], bottom: [255, 160, 100] },
    sunset:    { top: [ 50,  70,  50], middle: [255, 130,  50], bottom: [255,  80,  40] },
    night:     { top: [  8,  25,  15], middle: [ 15,  35,  25], bottom: [ 25,  50,  40] },
    focus: '#2D5A27', focusLight: '#4A7C43',
    short: '#5D8A66', shortLight: '#8AB896',
    long: '#8B7355',  longLight: '#B8A99A'
  },
  ocean: {
    sunrise:   { top: [135, 206, 250], middle: [255, 200, 150], bottom: [255, 150, 100] },
    morning:   { top: [135, 206, 250], middle: [180, 225, 245], bottom: [235, 250, 255] },
    midday:    { top: [ 20, 120, 200], middle: [ 60, 160, 240], bottom: [180, 225, 245] },
    afternoon: { top: [ 50, 100, 180], middle: [255, 200, 150], bottom: [255, 150, 100] },
    sunset:    { top: [ 15,  30,  80], middle: [255, 130,  60], bottom: [255,  90,  50] },
    night:     { top: [  5,  15,  40], middle: [ 10,  30,  60], bottom: [ 20,  50,  90] },
    focus: '#1E90FF', focusLight: '#4169E1',
    short: '#20B2AA', shortLight: '#5DADE2',
    long: '#008B8B',  longLight: '#48D1CC'
  },
  mountain: {
    sunrise:   { top: [176, 196, 222], middle: [255, 218, 185], bottom: [210, 180, 140] },
    morning:   { top: [176, 196, 222], middle: [230, 235, 245], bottom: [250, 250, 255] },
    midday:    { top: [120, 160, 190], middle: [160, 185, 205], bottom: [210, 220, 235] },
    afternoon: { top: [100, 130, 160], middle: [255, 210, 170], bottom: [210, 170, 130] },
    sunset:    { top: [ 40,  60,  70], middle: [255, 140,  50], bottom: [200, 100,  40] },
    night:     { top: [ 12,  18,  28], middle: [ 22,  28,  42], bottom: [ 35,  42,  58] },
    focus: '#6B8E23', focusLight: '#8B9A46',
    short: '#8B4513', shortLight: '#CD853F',
    long: '#556B2F',  longLight: '#8B7355'
  },
  space: {
    sunrise:   { top: [ 75,   0, 130], middle: [255, 120, 100], bottom: [255, 160, 150] },
    morning:   { top: [ 75,   0, 130], middle: [147, 112, 219], bottom: [200, 110, 230] },
    midday:    { top: [ 20,  30, 100], middle: [ 75,   0, 130], bottom: [147, 112, 219] },
    afternoon: { top: [ 60,  50, 120], middle: [255, 120, 100], bottom: [255, 160, 150] },
    sunset:    { top: [  0,   0,   0], middle: [255, 100, 100], bottom: [255,  50,  50] },
    night:     { top: [  3,   3,  12], middle: [  8,   8,  25], bottom: [ 15,  15,  35] },
    focus: '#9400D3', focusLight: '#BA55D3',
    short: '#FF6347', shortLight: '#FFA07A',
    long: '#32CD32',  longLight: '#90EE90'
  },
  sunset: {
    sunrise:   { top: [255, 120,  80], middle: [255, 180, 100], bottom: [255, 220, 150] },
    morning:   { top: [255, 160, 100], middle: [255, 200, 140], bottom: [255, 235, 200] },
    midday:    { top: [255, 140,  80], middle: [255, 190, 120], bottom: [255, 220, 180] },
    afternoon: { top: [255, 100,  60], middle: [255, 160,  90], bottom: [255, 200, 140] },
    sunset:    { top: [ 60,  20,  80], middle: [255, 100,  50], bottom: [255,  60,  30] },
    night:     { top: [ 15,  10,  30], middle: [ 25,  15,  45], bottom: [ 40,  25,  60] },
    focus: '#FF6B35', focusLight: '#FF8C5A',
    short: '#E91E63', shortLight: '#F48FB1',
    long: '#9C27B0', longLight: '#CE93D8'
  },
  cherry: {
    sunrise:   { top: [255, 182, 193], middle: [255, 218, 223], bottom: [255, 240, 245] },
    morning:   { top: [255, 192, 203], middle: [255, 228, 235], bottom: [255, 248, 250] },
    midday:    { top: [255, 200, 210], middle: [255, 230, 240], bottom: [255, 245, 250] },
    afternoon: { top: [255, 180, 195], middle: [255, 220, 230], bottom: [255, 240, 248] },
    sunset:    { top: [200, 100, 140], middle: [255, 150, 180], bottom: [255, 200, 220] },
    night:     { top: [ 25,  15,  25], middle: [ 40,  25,  40], bottom: [ 60,  40,  55] },
    focus: '#FF69B4', focusLight: '#FFB6C1',
    short: '#FFB6C1', shortLight: '#FFC0CB',
    long: '#DB7093', longLight: '#FFB6C1'
  },
  aurora: {
    sunrise:   { top: [  0, 150, 136], middle: [100, 200, 180], bottom: [150, 230, 210] },
    morning:   { top: [  0, 180, 160], middle: [ 80, 200, 190], bottom: [180, 240, 230] },
    midday:    { top: [ 20, 140, 130], middle: [ 60, 180, 170], bottom: [140, 220, 210] },
    afternoon: { top: [ 40, 120, 140], middle: [100, 180, 200], bottom: [160, 220, 230] },
    sunset:    { top: [ 20,  40, 100], middle: [100, 100, 180], bottom: [180, 150, 200] },
    night:     { top: [  5,  15,  25], middle: [ 10,  30,  50], bottom: [ 20,  50,  80] },
    focus: '#00CED1', focusLight: '#48D1CC',
    short: '#7B68EE', shortLight: '#9370DB',
    long: '#20B2AA', longLight: '#66CDAA'
  },
  desert: {
    sunrise:   { top: [255, 200, 120], middle: [255, 220, 150], bottom: [255, 240, 200] },
    morning:   { top: [255, 210, 130], middle: [255, 230, 170], bottom: [255, 245, 220] },
    midday:    { top: [255, 200, 100], middle: [255, 225, 150], bottom: [255, 240, 200] },
    afternoon: { top: [255, 180,  90], middle: [255, 210, 140], bottom: [255, 230, 190] },
    sunset:    { top: [ 80,  40,  20], middle: [255, 140,  60], bottom: [255, 100,  40] },
    night:     { top: [ 20,  15,  10], middle: [ 35,  28,  20], bottom: [ 55,  45,  35] },
    focus: '#D2691E', focusLight: '#F4A460',
    short: '#CD853F', shortLight: '#DEB887',
    long: '#8B4513', longLight: '#A0522D'
  },
  midnight: {
    sunrise:   { top: [ 20,  30,  80], middle: [ 40,  50, 100], bottom: [ 60,  70, 120] },
    morning:   { top: [ 25,  35,  90], middle: [ 50,  60, 110], bottom: [ 70,  80, 130] },
    midday:    { top: [ 30,  40,  70], middle: [ 50,  60,  90], bottom: [ 80,  90, 120] },
    afternoon: { top: [ 25,  35,  75], middle: [ 45,  55,  95], bottom: [ 70,  80, 115] },
    sunset:    { top: [ 10,  15,  40], middle: [ 60,  50,  80], bottom: [ 80,  60,  90] },
    night:     { top: [  2,   3,   8], middle: [  5,   6,  15], bottom: [ 10,  12,  25] },
    focus: '#191970', focusLight: '#4169E1',
    short: '#4B0082', shortLight: '#8A2BE2',
    long: '#2F4F4F', longLight: '#708090'
  }
};

// ==================== LOCAL STORAGE ====================
// OPTIMIZATION: Debounced save to reduce localStorage I/O operations
function saveToStorage() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
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
        weatherCycleIndex,
        options,
        tasks,
        taskViewState,
        distractions: distractions,
        lastIntention: lastIntention
      };
      localStorage.setItem('pomodoroPrimeData', JSON.stringify(data));
    } catch (e) {
      console.warn('Pomodoro Prime: could not save to localStorage:', e);
    }
  }, 500);
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
      if (data.weatherCycleIndex !== undefined) weatherCycleIndex = data.weatherCycleIndex;
      if (data.options) options = { ...options, ...data.options };
      if (data.tasks) tasks = data.tasks;
      if (data.taskViewState) taskViewState = { ...taskViewState, ...data.taskViewState };
      if (data.distractions) distractions = data.distractions;
      if (data.lastIntention !== undefined) lastIntention = data.lastIntention;
    }
    const hasVisited = localStorage.getItem('pomodoroPrimeVisited');
    if (!ALLOWED_SOUND_TYPES.includes(soundSettings.soundType)) {
      soundSettings.soundType = 'chime';
    }
    if (!ALLOWED_WEATHER_MODES.includes(weatherEffect)) {
      weatherEffect = 'auto';
    }
    if (!hasVisited) showOnboarding();
  } catch (e) {
    console.warn('Pomodoro Prime: could not load from localStorage:', e);
    showOnboarding();
  }
}

function isAllowedWeatherMode(mode) {
  return ALLOWED_WEATHER_MODES.includes(mode);
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
  taskSort = document.getElementById('taskSort');
  taskFilter = document.getElementById('taskFilter');
  exportCsvBtn = document.getElementById('exportCsvBtn');
  importCsvBtn = document.getElementById('importCsvBtn');
  csvFileInput = document.getElementById('csvFileInput');
  shortcutsBtn = document.getElementById('shortcutsBtn');
  onboardingModal = document.getElementById('onboardingModal');
  closeOnboarding = document.getElementById('closeOnboarding');
  startJourneyBtn = document.getElementById('startJourneyBtn');
  shortcutsModal = document.getElementById('shortcutsModal');
  closeShortcuts = document.getElementById('closeShortcuts');
  highContrastToggle = document.getElementById('highContrastToggle');
  focusModeToggle = document.getElementById('focusModeToggle');
  lowPowerToggle = document.getElementById('lowPowerToggle');
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
  // New features
  timerSection = document.querySelector('.timer-section');
  intentionInput = null; // removed from HTML
  intentionBanner = document.getElementById('intentionBanner');
  intentionWrap = document.getElementById('intentionWrap');
  intentionSelect = document.getElementById('intentionSelect');
  distractionBtn = document.getElementById('distractionBtn');
  distractionPanel = document.getElementById('distractionPanel');
  distractionText = document.getElementById('distractionText');
  distractionAddBtn = document.getElementById('distractionAddBtn');
  distractionCount = document.getElementById('distractionCount');
  distractionSessionNote = document.getElementById('distractionSessionNote');
  distractionSummary = document.getElementById('distractionSummary');
  clearDistractionsBtn = document.getElementById('clearDistractionsBtn');
  distractionTotal = document.getElementById('distractionTotal');
  distractionTopCategory = document.getElementById('distractionTopCategory');
  distractionTodayCount = document.getElementById('distractionTodayCount');
  breathingGuide = document.getElementById('breathingGuide');
  breathingCircle = document.getElementById('breathingCircle');
  breathingPhase = document.getElementById('breathingPhase');
  breathingGuideToggle = document.getElementById('breathingGuideToggle');
  breatheStartBtn = document.getElementById('breatheStartBtn');
  breathingOverlay = document.getElementById('breathingOverlay');
  breathingOverlayCircle = document.getElementById('breathingOverlayCircle');
  breathingOverlayPhase = document.getElementById('breathingOverlayPhase');
  breathingOverlayCounter = document.getElementById('breathingOverlayCounter');
  breathingStopBtn = document.getElementById('breathingStopBtn');
  onboardingTaskInput = document.getElementById('onboardingTaskInput');
  onboardingAddTaskBtn = document.getElementById('onboardingAddTaskBtn');
  onboardingTaskList = document.getElementById('onboardingTaskList');
  noAnimationToggle = document.getElementById('noAnimationToggle');
  presetStyleBtns = document.querySelectorAll('.preset-style-btn');
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

  // Increase timer sun/moon inner circle size for better visibility.
  const size = 0.8 + Math.sin(t * Math.PI) * 2.4;
  celestialCircle.setAttribute('r', size.toFixed(1));

  // Reduce outer glow radius for cleaner ring visuals.
  celestialGlowEffect.setAttribute('r', (size * (isSun ? 2.7 : 2)).toFixed(1));

  if (isSun) {
    celestialCircle.setAttribute('fill', '#FFF34D');
    celestialCircle.setAttribute('stroke', '#C77900');
    celestialCircle.setAttribute('stroke-width', '0.9');
    celestialGlowEffect.setAttribute('opacity', (0.95 * Math.sin(t * Math.PI)).toFixed(2));
    const glowStops = document.getElementById('celestialGlow');
    if (glowStops) {
      glowStops.querySelector('stop:first-child').setAttribute('style', 'stop-color:#FFF34D;stop-opacity:1');
      glowStops.querySelector('stop:last-child').setAttribute('style', 'stop-color:#FFB800;stop-opacity:0');
    }
  } else {
    celestialCircle.setAttribute('fill', '#E0E8F0');
    celestialCircle.setAttribute('stroke', '#9EB2C8');
    celestialCircle.setAttribute('stroke-width', '0.5');
    celestialGlowEffect.setAttribute('opacity', (0.45 * Math.sin(t * Math.PI)).toFixed(2));
    const glowStops = document.getElementById('celestialGlow');
    if (glowStops) {
      glowStops.querySelector('stop:first-child').setAttribute('style', 'stop-color:#C0D0E8;stop-opacity:0.6');
      glowStops.querySelector('stop:last-child').setAttribute('style', 'stop-color:#C0D0E8;stop-opacity:0');
    }
  }

  if (!timerStarsElement) {
    timerStarsElement = document.getElementById('timerStars');
  }
  if (timerStarsElement) {
    let starOpacity = 0;
    if (progress >= 0.45 && progress < 0.55) {
      starOpacity = (progress - 0.45) / 0.1;
    } else if (progress >= 0.55 && progress < 0.92) {
      starOpacity = 1;
    } else if (progress >= 0.92) {
      starOpacity = Math.max(0, (1.0 - progress) / 0.08);
    }
    timerStarsElement.setAttribute('opacity', starOpacity.toFixed(2));
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
  if (timerSection) timerSection.setAttribute('data-timer-mode', timerState.mode);
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
  // Update glow for shadow effects
  const r = parseInt(colors.focus.slice(1, 3), 16);
  const g = parseInt(colors.focus.slice(3, 5), 16);
  const b = parseInt(colors.focus.slice(5, 7), 16);
  document.documentElement.style.setProperty('--color-focus-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
}

// ==================== SESSION INTENTION ====================
function updateIntentionDropdown() {
  if (!intentionSelect) return;
  const currentVal = intentionSelect.value;
  const incompleteTasks = tasks.filter(t => !t.completed);

  intentionSelect.innerHTML = '<option value="">What are you working on?</option>';
  incompleteTasks.forEach(task => {
    const opt = document.createElement('option');
    opt.value = task.text;
    opt.textContent = task.text;
    intentionSelect.appendChild(opt);
  });

  // Restore previous selection if still valid
  if (currentVal && intentionSelect.querySelector(`option[value="${CSS.escape(currentVal)}"]`)) {
    intentionSelect.value = currentVal;
  }
}

function showIntentionBanner() {
  if (!intentionSelect || !intentionBanner) return;

  if (intentionSelect.value) {
    lastIntention = intentionSelect.value;
  }

  if (lastIntention) {
    intentionSelect.hidden = true;
    intentionBanner.textContent = lastIntention;
    intentionBanner.hidden = false;
  }
  saveToStorage();
}

function hideIntentionBanner() {
  if (!intentionSelect || !intentionBanner) return;
  intentionSelect.hidden = false;
  intentionBanner.hidden = true;
}

function clearIntention() {
  lastIntention = null;
  if (intentionSelect) intentionSelect.value = '';
  if (intentionBanner) { intentionBanner.textContent = ''; intentionBanner.hidden = true; }
  if (intentionSelect) intentionSelect.hidden = false;
  saveToStorage();
}

// ==================== DISTRACTION LOG ====================
function logDistraction(text, category) {
  distractions.push({
    text: text,
    timestamp: Date.now(),
    sessionIntention: lastIntention,
    category: category
  });
  // Cap at 200 entries
  if (distractions.length > 200) distractions = distractions.slice(-200);
  currentSessionDistractions++;
  updateDistractionCount();
  renderDistractionSummary();
  saveToStorage();
}

function updateDistractionCount() {
  if (!distractionCount || !distractionSessionNote) return;
  if (currentSessionDistractions > 0) {
    distractionCount.textContent = currentSessionDistractions;
    distractionCount.hidden = false;
    distractionSessionNote.textContent =
      `${currentSessionDistractions} distraction${currentSessionDistractions > 1 ? 's' : ''} this session`;
    distractionSessionNote.hidden = false;
  } else {
    distractionCount.hidden = true;
    distractionSessionNote.hidden = true;
  }
}

function toggleDistractionPanel() {
  if (!distractionPanel) return;
  distractionPanel.hidden = !distractionPanel.hidden;
  if (!distractionPanel.hidden && distractionText) distractionText.focus();
}

function renderDistractionSummary() {
  if (!distractionSummary) return;
  updateDistractionKPIs();
  if (distractions.length === 0) {
    distractionSummary.innerHTML =
      '<p class="distraction-empty">No distractions logged yet. Stay focused!</p>';
    return;
  }
  const catLabels = { phone: 'Phone', social: 'Social', email: 'Email', thoughts: 'Thoughts', other: 'Other' };
  const freq = {};
  distractions.forEach(d => { freq[d.category] = (freq[d.category] || 0) + 1; });
  let html = '<div class="distraction-freq">';
  Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    html += `<span class="distraction-freq-item">${catLabels[cat] || cat}: ${count}</span>`;
  });
  html += '</div>';
  const recent = distractions.slice(-20).reverse();
  html += '<ul class="distraction-list">';
  recent.forEach(d => {
    const time = new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    html += `<li class="distraction-entry">
      <span class="distraction-entry-time">${time}</span>
      <span class="distraction-entry-text">${escapeHtml(d.text)}</span>
    </li>`;
  });
  html += '</ul>';
  distractionSummary.innerHTML = html;
}

function clearDistractions() {
  distractions = [];
  renderDistractionSummary();
  updateDistractionKPIs();
  saveToStorage();
}

function updateDistractionKPIs() {
  if (!distractionTotal) return;

  distractionTotal.textContent = distractions.length;

  // Most common category
  if (distractions.length > 0) {
    const catLabels = { phone: '📱 Phone', social: '💬 Social', email: '📧 Email', thoughts: '💭 Thoughts', other: '🔤 Other' };
    const freq = {};
    distractions.forEach(d => { freq[d.category] = (freq[d.category] || 0) + 1; });
    const topCat = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    distractionTopCategory.textContent = catLabels[topCat[0]] || topCat[0];
  } else {
    distractionTopCategory.textContent = '—';
  }

  // Today's count
  const today = new Date().toDateString();
  const todayCount = distractions.filter(d => new Date(d.timestamp).toDateString() === today).length;
  distractionTodayCount.textContent = todayCount;
}

// ==================== BREATHING GUIDE ====================
let breathingInterval = null;

function startBreathingGuide() {
  if (!options.breathingGuide || !breathingGuide || !breathingCircle) return;
  if (timerState.mode === 'focus') { stopBreathingGuide(); return; }
  breathingGuide.hidden = false;
  // Reset CSS animation to sync with JS
  breathingCircle.style.animation = 'none';
  void breathingCircle.offsetHeight; // force reflow
  breathingCircle.style.animation = '';
  breathingCircle.style.animationPlayState = 'running';
  let phaseTime = 0;
  if (breathingPhase) breathingPhase.textContent = 'Inhale';
  if (breathingInterval) clearInterval(breathingInterval);
  breathingInterval = setInterval(() => {
    phaseTime = (phaseTime + 0.5) % 19;
    if (!breathingPhase) return;
    if (phaseTime < 4) breathingPhase.textContent = 'Inhale';
    else if (phaseTime < 11) breathingPhase.textContent = 'Hold';
    else breathingPhase.textContent = 'Exhale';
  }, 500);
}

function stopBreathingGuide() {
  if (breathingGuide) breathingGuide.hidden = true;
  if (breathingCircle) breathingCircle.style.animationPlayState = 'paused';
  if (breathingPhase) breathingPhase.textContent = '';
  if (breathingInterval) { clearInterval(breathingInterval); breathingInterval = null; }
}

// ==================== STANDALONE BREATHING EXERCISE ====================
function startStandaloneBreathing() {
  if (isBreathingStandalone) return;
  isBreathingStandalone = true;
  breathingCycleCount = 0;
  const totalCycles = 3;

  if (breathingOverlay) breathingOverlay.hidden = false;
  if (breathingOverlayCounter) breathingOverlayCounter.textContent = `Cycle 1 of ${totalCycles}`;

  // Stop canvas animations while breathing
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (particlesCtx) {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  }
  if (skyCtx) {
    skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
  }

  runBreathingCycle(totalCycles);
}

function runBreathingCycle(totalCycles) {
  let phaseTime = 0; // in half-seconds
  let currentPhase = 'inhale';

  if (breathingStandaloneInterval) clearInterval(breathingStandaloneInterval);

  // Inhale: 4s, Hold: 7s, Exhale: 8s = 19s total
  setBreathingOverlayPhase(currentPhase);

  breathingStandaloneInterval = setInterval(() => {
    phaseTime += 0.5;

    let nextPhase = currentPhase;
    if (phaseTime <= 4) {
      nextPhase = 'inhale';
    } else if (phaseTime <= 11) {
      nextPhase = 'hold';
    } else if (phaseTime <= 19) {
      nextPhase = 'exhale';
    }

    if (nextPhase !== currentPhase) {
      currentPhase = nextPhase;
      setBreathingOverlayPhase(currentPhase);
    }

    if (phaseTime >= 19) {
      clearInterval(breathingStandaloneInterval);
      breathingStandaloneInterval = null;
      breathingCycleCount++;

      if (breathingCycleCount < totalCycles) {
        if (breathingOverlayCounter) breathingOverlayCounter.textContent = `Cycle ${breathingCycleCount + 1} of ${totalCycles}`;
        setTimeout(() => runBreathingCycle(totalCycles), 500);
      } else {
        // Exercise complete
        if (breathingOverlayPhase) breathingOverlayPhase.textContent = 'Done!';
        if (breathingOverlayCircle) {
          breathingOverlayCircle.className = 'breathing-overlay-circle';
        }
        breathingStandaloneTimeout = setTimeout(() => stopStandaloneBreathing(), 2000);
      }
    }
  }, 500);
}

function setBreathingOverlayPhase(phase) {
  if (!breathingOverlayCircle || !breathingOverlayPhase) return;
  const labels = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' };
  breathingOverlayCircle.className = 'breathing-overlay-circle ' + phase;
  breathingOverlayPhase.textContent = labels[phase] || '';
}

function stopStandaloneBreathing() {
  isBreathingStandalone = false;
  if (breathingStandaloneInterval) { clearInterval(breathingStandaloneInterval); breathingStandaloneInterval = null; }
  if (breathingStandaloneTimeout) { clearTimeout(breathingStandaloneTimeout); breathingStandaloneTimeout = null; }

  if (breathingOverlay) breathingOverlay.hidden = true;
  if (breathingOverlayCircle) breathingOverlayCircle.className = 'breathing-overlay-circle';
  if (breathingOverlayPhase) breathingOverlayPhase.textContent = 'Get Ready';

  // Resume canvas animations
  lastRenderTime = 0;
  if (!animationFrameId) animateCombined();
}

// ==================== TIMER SECTION STATE ====================
function setTimerRunning(running) {
  if (!timerSection) return;
  if (running) {
    timerSection.setAttribute('data-running', 'true');
    timerSection.setAttribute('data-timer-mode', timerState.mode);
  } else {
    timerSection.removeAttribute('data-running');
  }
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

function primeAudioAndNotifications() {
  try {
    ensureAudioContext();
  } catch (e) {
    console.log('Audio priming error:', e);
  }

  // Notification permission requests are more reliable on mobile when triggered by a user gesture.
  requestNotificationPermission();
}

function playAlarm() {
  try {
    ensureAudioContext();
    const vol = soundSettings.volume;
    switch (soundSettings.soundType) {
      case 'harp':      playHarp(vol); break;
      case 'pulse':     playPulse(vol); break;
      case 'retro':     playRetro(vol); break;
      case 'wood':      playWood(vol); break;
      case 'bell':      playBell(vol); break;
      case 'digital':   playDigital(vol); break;
      case 'gentle':    playGentle(vol); break;
      case 'lightning': playLightning(vol); break;
      case 'bird':      playBird(vol); break;
      case 'metal':     playMetal(vol); break;
      case 'guitar':    playGuitarString(vol); break;
      case 'flute':     playFlute(vol); break;
      case 'mouthorgan': playMouthOrgan(vol); break;
      case 'whitenoise': playWhiteNoise(vol); break;
      case 'beach':     playBeach(vol); break;
      default:          playChime(vol); break;
    }
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playChime(volume) {
  const t = audioContext.currentTime;
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

function playHarp(volume) {
  const t = audioContext.currentTime;
  [392, 523.25, 659.25].forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t + i * 0.08);
    gain.gain.setValueAtTime(0, t + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.14 * volume, t + i * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 1.0);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 1.0);
  });
}

function playPulse(volume) {
  const t = audioContext.currentTime;
  [0, 0.16, 0.32, 0.5].forEach((offset, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i % 2 === 0 ? 520 : 680, t + offset);
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.15 * volume, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.18);
    osc.start(t + offset);
    osc.stop(t + offset + 0.2);
  });
}

function playRetro(volume) {
  const t = audioContext.currentTime;
  [660, 880, 740].forEach((freq, i) => {
    const start = t + i * 0.11;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12 * volume, start + 0.01);
    gain.gain.linearRampToValueAtTime(0, start + 0.1);
    osc.start(start);
    osc.stop(start + 0.11);
  });
}

function playWood(volume) {
  const t = audioContext.currentTime;
  [0, 0.12].forEach(offset => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t + offset);
    osc.frequency.exponentialRampToValueAtTime(90, t + offset + 0.12);
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.22 * volume, t + offset + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.14);
    osc.start(t + offset);
    osc.stop(t + offset + 0.16);
  });
}

function playLightning(volume) {
  const t = audioContext.currentTime;
  // White noise burst for thunder
  const bufferSize = audioContext.sampleRate * 0.8;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(100, t + 0.8);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.4 * volume, t + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
  noise.start(t);
  noise.stop(t + 0.8);
  // Crack
  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  osc.connect(oscGain);
  oscGain.connect(audioContext.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
  oscGain.gain.setValueAtTime(0, t);
  oscGain.gain.linearRampToValueAtTime(0.2 * volume, t + 0.01);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  osc.start(t);
  osc.stop(t + 0.2);
}

function playBird(volume) {
  const t = audioContext.currentTime;
  [0, 0.15, 0.28].forEach((offset, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    const baseFreq = 2000 + i * 300;
    osc.frequency.setValueAtTime(baseFreq, t + offset);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + offset + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + offset + 0.1);
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.12 * volume, t + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.12);
    osc.start(t + offset);
    osc.stop(t + offset + 0.13);
  });
}

function playGuitarString(volume) {
  const t = audioContext.currentTime;
  const strings = [196, 246.94, 329.63, 392];
  strings.forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'triangle';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t + index * 0.03);
    filter.Q.setValueAtTime(0.7, t + index * 0.03);
    osc.frequency.setValueAtTime(freq, t + index * 0.03);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + index * 0.03 + 0.35);
    gain.gain.setValueAtTime(0, t + index * 0.03);
    gain.gain.linearRampToValueAtTime(0.16 * volume, t + index * 0.03 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + index * 0.03 + 0.9);
    osc.start(t + index * 0.03);
    osc.stop(t + index * 0.03 + 0.95);
  });
}

function playFlute(volume) {
  const t = audioContext.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, t + index * 0.14);
    filter.Q.setValueAtTime(3.5, t + index * 0.14);
    osc.frequency.setValueAtTime(freq, t + index * 0.14);
    osc.frequency.linearRampToValueAtTime(freq * 1.015, t + index * 0.14 + 0.12);
    gain.gain.setValueAtTime(0, t + index * 0.14);
    gain.gain.linearRampToValueAtTime(0.14 * volume, t + index * 0.14 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, t + index * 0.14 + 0.45);
    osc.start(t + index * 0.14);
    osc.stop(t + index * 0.14 + 0.5);
  });
}

function playMouthOrgan(volume) {
  const t = audioContext.currentTime;
  const chord = [261.63, 329.63, 392.00];
  chord.forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'square';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 + index * 140, t);
    filter.Q.setValueAtTime(0.9, t);
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 1.01, t + 0.2);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08 * volume, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);
    osc.start(t);
    osc.stop(t + 1);
  });
}

function playWhiteNoise(volume) {
  const t = audioContext.currentTime;
  const duration = 0.8;
  const bufferSize = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.9;
  }

  const source = audioContext.createBufferSource();
  const highpass = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(1000, t);

  source.connect(highpass);
  highpass.connect(gain);
  gain.connect(audioContext.destination);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.18 * volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  source.start(t);
  source.stop(t + duration);
}

function playBeach(volume) {
  const t = audioContext.currentTime;
  const duration = 1.3;
  const bufferSize = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const time = i / audioContext.sampleRate;
    const swell = 0.45 + 0.55 * Math.sin(time * Math.PI * 1.6);
    const surf = Math.exp(-time * 1.8);
    data[i] = (Math.random() * 2 - 1) * swell * surf;
  }

  const source = audioContext.createBufferSource();
  const lowpass = audioContext.createBiquadFilter();
  const bandpass = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(1400, t);
  lowpass.frequency.exponentialRampToValueAtTime(700, t + duration);
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(500, t);
  bandpass.Q.setValueAtTime(0.8, t);

  source.connect(lowpass);
  lowpass.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(audioContext.destination);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.16 * volume, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  source.start(t);
  source.stop(t + duration);
}

function playMetal(volume) {
  const t = audioContext.currentTime;
  [1200, 2400, 3600].forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime((0.15 - i * 0.04) * volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);
    osc.start(t);
    osc.stop(t + 1.2);
  });
}

// ==================== NOTIFICATIONS ====================
function requestNotificationPermission() {
  if (!window.isSecureContext) return;
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function showBrowserNotification(title, body) {
  if (!window.isSecureContext) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const options = {
    body: body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌲</text></svg>',
    tag: 'pomodoro-timer',
    requireInteraction: false,
    data: { url: './' }
  };

  // On Android, SW notifications are generally more reliable than window Notification().
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(title, options))
      .catch(() => {
        const notification = new Notification(title, options);
        setTimeout(() => notification.close(), 5000);
      });
    return;
  }

  const notification = new Notification(title, options);
  setTimeout(() => notification.close(), 5000);
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
    notificationBody = lastIntention
      ? `Great work! You worked on: ${lastIntention}`
      : 'Great work! Time for a break.';
    statsState.pomodoros++;
    statsState.focusTime += Math.round(timerState.totalTime / 60000);

    const today = new Date().toDateString();
    if (statsState.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (statsState.lastSessionDate === yesterday.toDateString()) {
        statsState.streak++;
      } else {
        statsState.streak = 1;
      }
      statsState.lastSessionDate = today;
    }
    if (weatherEffect === 'auto') {
      weatherCycleIndex++;
      createParticles();
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
  setTimerRunning(false);
  stopBreathingGuide();
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

  setTimerRunning(false);
  clearIntention();
  if (mode === 'focus') {
    stopBreathingGuide();
  } else {
    startBreathingGuide();
  }

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

  // Boost animation FPS while timer is running
  targetAnimationFps = options.lowPowerMode ? 15 : 30;
  animationFrameInterval = 1000 / targetAnimationFps;

  updateButtons();

  // New features: update timer section state
  setTimerRunning(true);
  showIntentionBanner();
  startBreathingGuide();
  if (timerState.mode === 'focus') {
    currentSessionDistractions = 0;
    updateDistractionCount();
  }

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
  }, 500);
}

function pauseTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  clearInterval(timerState.interval);

  // Drop animation FPS while paused
  targetAnimationFps = options.lowPowerMode ? 15 : 20;
  animationFrameInterval = 1000 / targetAnimationFps;

  updateButtons();
  setTimerRunning(false);
  hideIntentionBanner();
  stopBreathingGuide();
  saveToStorage();
}

function resetTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.remainingTime = timerState.totalTime;
  updateDisplay();
  updateProgress();
  updateButtons();
  setTimerRunning(false);
  hideIntentionBanner();
  stopBreathingGuide();
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
function getDisplayTasks() {
  let displayTasks = [...tasks];
  if (taskViewState.filterBy === 'completed') {
    displayTasks = displayTasks.filter(task => task.completed);
  } else if (taskViewState.filterBy === 'pending') {
    displayTasks = displayTasks.filter(task => !task.completed);
  }
  if (taskViewState.sortBy === 'status') {
    displayTasks.sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt - a.createdAt;
      }
      return a.completed ? 1 : -1;
    });
  }
  return displayTasks;
}

function getOriginalIndex(displayTask) {
  return tasks.findIndex(t =>
    t.text === displayTask.text &&
    t.completed === displayTask.completed &&
    t.createdAt === displayTask.createdAt
  );
}

function renderTasks() {
  taskList.innerHTML = '';

  const displayTasks = getDisplayTasks();

  if (displayTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    if (tasks.length === 0) {
      empty.textContent = 'No tasks yet — add one above';
    } else {
      empty.textContent = 'No tasks match the current filter';
    }
    taskList.appendChild(empty);
    return;
  }

  displayTasks.forEach((task) => {
    const originalIndex = getOriginalIndex(task);
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.index = originalIndex;
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
  updateIntentionDropdown();
  saveToStorage();
}

function toggleTaskComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
  updateIntentionDropdown();
  saveToStorage();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
  updateIntentionDropdown();
  saveToStorage();
}

// ==================== CSV EXPORT/IMPORT ====================
function exportTasksToCSV() {
  if (tasks.length === 0) {
    alert('No tasks to export.');
    return;
  }

  let csvContent = 'Task,Status,CreatedAt\n';
  tasks.forEach(task => {
    const escapedText = task.text.replace(/"/g, '""');
    const status = task.completed ? 'completed' : 'pending';
    const createdAt = new Date(task.createdAt).toISOString();
    csvContent += `"${escapedText}",${status},${createdAt}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `pomodoro-tasks-${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importTasksFromCSV(file) {
  if (!file) return;
  if (!file.name.endsWith('.csv')) {
    alert('Please select a valid CSV file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvText = e.target.result;
      const lines = csvText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows.');
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes('task') || !header.includes('status')) {
        alert('Invalid CSV format. Expected headers: Task, Status, CreatedAt');
        return;
      }

      const importedTasks = [];
      const duplicateTasks = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const matches = line.match(/("([^"]|"")*"|[^,]*),([^,]*),(.*)/);
        if (!matches) {
          console.warn(`Skipping malformed row ${i + 1}: ${line}`);
          continue;
        }

        let taskText = matches[1];
        const status = matches[3].trim().toLowerCase();
        const createdAt = matches[4].trim();

        if (taskText.startsWith('"') && taskText.endsWith('"')) {
          taskText = taskText.slice(1, -1).replace(/""/g, '"');
        }

        if (!taskText || taskText === '""') {
          console.warn(`Skipping empty task text in row ${i + 1}`);
          continue;
        }

        const isCompleted = status === 'completed' || status === 'done' || status === 'true' || status === '1';

        let timestamp = Date.now();
        if (createdAt && createdAt !== '') {
          const parsedDate = new Date(createdAt);
          if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate.getTime();
          }
        }

        const isDuplicate = tasks.some(t =>
          t.text === taskText &&
          t.createdAt === timestamp
        );

        if (isDuplicate) {
          duplicateTasks.push(taskText);
        } else {
          importedTasks.push({
            text: taskText,
            completed: isCompleted,
            createdAt: timestamp
          });
        }
      }

      if (importedTasks.length === 0) {
        alert('No valid tasks found in CSV file.');
        return;
      }

      let message = `Successfully imported ${importedTasks.length} task(s).`;
      if (duplicateTasks.length > 0) {
        message += `\n\nSkipped ${duplicateTasks.length} duplicate task(s):\n${duplicateTasks.slice(0, 5).join(', ')}${duplicateTasks.length > 5 ? '...' : ''}`;
      }
      alert(message);

      tasks = [...tasks, ...importedTasks];
      renderTasks();
      updateIntentionDropdown();
      saveToStorage();

    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the file format and try again.');
    }
  };

  reader.onerror = function() {
    alert('Error reading file. Please try again.');
  };
  reader.readAsText(file);
}

// ==================== SORTING/FILTERING ====================
function setTaskSort(sortBy) {
  taskViewState.sortBy = sortBy;
  taskSort.value = sortBy;
  renderTasks();
  saveToStorage();
}

function setTaskFilter(filterBy) {
  taskViewState.filterBy = filterBy;
  taskFilter.value = filterBy;
  renderTasks();
  saveToStorage();
}

// ==================== THEME FUNCTIONS ====================
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
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

function applyLowPowerMode() {
  targetAnimationFps = options.lowPowerMode ? 15 : (timerState.isRunning ? 30 : 20);
  animationFrameInterval = 1000 / targetAnimationFps;
  if (lowPowerToggle) lowPowerToggle.checked = options.lowPowerMode;

  // Apply the new performance profile immediately.
  createParticles();
  lastRenderTime = 0;
  saveToStorage();
}

function applyNoAnimation() {
  if (noAnimationToggle) noAnimationToggle.checked = options.noAnimation;
  if (options.noAnimation) {
    // Stop sky and particle canvases
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (particlesCtx) particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    if (skyCtx) skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
    // Hide canvases
    if (particlesCanvas) particlesCanvas.style.display = 'none';
    if (skyCanvas) skyCanvas.style.display = 'none';
  } else {
    // Restore canvases
    if (particlesCanvas) particlesCanvas.style.display = '';
    if (skyCanvas) skyCanvas.style.display = '';
    lastRenderTime = 0;
    if (!animationFrameId && !isBreathingStandalone) animateCombined();
  }
  document.body.classList.toggle('no-animation', options.noAnimation);
  saveToStorage();
}

function setPomodoroStyle(style) {
  if (!DURATION_PRESETS[style]) return;
  options.pomodoroStyle = style;
  const preset = DURATION_PRESETS[style];
  DURATIONS.focus = preset.focus * 60 * 1000;
  DURATIONS.short = preset.short * 60 * 1000;
  DURATIONS.long = preset.long * 60 * 1000;

  // Update current timer if not running
  if (!timerState.isRunning) {
    timerState.totalTime = DURATIONS[timerState.mode];
    timerState.remainingTime = timerState.totalTime;
    updateDisplay();
    updateProgress();
  }

  presetStyleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });
  saveToStorage();
}

function scaledParticleCount(baseCount) {
  const multiplier = options.lowPowerMode ? 0.4 : 0.75;
  return Math.max(8, Math.floor(baseCount * multiplier));
}

function createMeteorParticle(w, h) {
  const spawnFromRight = Math.random() > 0.5;
  const angle = (125 + Math.random() * 30) * (Math.PI / 180); // mostly down-left
  const speed = 3.5 + Math.random() * 2.5;

  return {
    x: spawnFromRight ? (w + Math.random() * 160) : (Math.random() * w),
    y: spawnFromRight ? (Math.random() * h * 0.5) : (-40 - Math.random() * 140),
    size: Math.random() * 2 + 1.3,
    speedX: Math.cos(angle) * speed,
    speedY: Math.sin(angle) * speed,
    opacity: Math.random() * 0.35 + 0.55,
    type: 'meteor',
    length: Math.random() * 45 + 25
  };
}

// OPTIMIZATION: Only recreate particles if weather actually changed
function setWeatherEffect(weather) {
  if (!isAllowedWeatherMode(weather)) {
    weather = 'auto';
  }

  if (weatherEffect === weather) {
    // Still update button states
    weatherBtns.forEach(btn => {
      const isActive = btn.dataset.weather === weather;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive.toString());
    });
    return;
  }
  weatherEffect = weather;
  weatherBtns.forEach(btn => {
    const isActive = btn.dataset.weather === weather;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  createParticles(); // Recreate only when weather changes
  saveToStorage();
}

function setSoundType(type) {
  if (!ALLOWED_SOUND_TYPES.includes(type)) {
    type = 'chime';
  }
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

// ==================== SKY ANIMATION ====================
function initSky() {
  resizeSkyCanvas();
  createStars();
  if (!animationFrameId) animateCombined();
}

function resizeSkyCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const safeDpr = Math.min(dpr, 1.25);
  skyCanvas.width = Math.floor(window.innerWidth * safeDpr);
  skyCanvas.height = Math.floor(window.innerHeight * safeDpr);
  skyCanvas.style.width = `${window.innerWidth}px`;
  skyCanvas.style.height = `${window.innerHeight}px`;
  skyCtx.setTransform(safeDpr, 0, 0, safeDpr, 0, 0);
  skyCtx.imageSmoothingEnabled = true;
  skyCtx.imageSmoothingQuality = 'high';
}

function createStars() {
  stars = [];
  const starCount = Math.min(45, Math.floor(window.innerWidth * window.innerHeight / 25000));
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7,
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
  const eased = t * t * (3 - 2 * t); // smoothstep

  return {
    top: lerpColor(prev.color.top, next.color.top, eased),
    middle: lerpColor(prev.color.middle, next.color.middle, eased),
    bottom: lerpColor(prev.color.bottom, next.color.bottom, eased)
  };
}

function drawSky(colors) {
  const gradient = skyCtx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, `rgb(${colors.top.join(',')})`);
  gradient.addColorStop(0.5, `rgb(${colors.middle.join(',')})`);
  gradient.addColorStop(1, `rgb(${colors.bottom.join(',')})`);
  skyCtx.fillStyle = gradient;
  skyCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

// Brighter, larger sun core and glow.
function drawSun(progress) {
  if (progress >= 0.5) return;

  const t = progress / 0.5; // 0 to 1
  const sunX = window.innerWidth * 0.1 + window.innerWidth * 0.8 * t;
  const sunY = window.innerHeight * 0.85 - Math.sin(t * Math.PI) * window.innerHeight * 0.65;
  const sunSize = 32 + Math.sin(t * Math.PI) * 48;
  const horizonFade = Math.sin(t * Math.PI);

  skyCtx.fillStyle = `rgba(255, 230, 170, ${0.28 * horizonFade})`;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize * 2, 0, Math.PI * 2);
  skyCtx.fill();

  skyCtx.fillStyle = `rgba(255, 225, 130, ${0.98 * horizonFade})`;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
  skyCtx.fill();
}

// Brighter, larger moon core and glow.
function drawMoon(progress) {
  if (progress < 0.5) return;

  const t = (progress - 0.5) / 0.5; // 0 to 1
  const moonX = window.innerWidth * 0.1 + window.innerWidth * 0.8 * t;
  const moonY = window.innerHeight * 0.85 - Math.sin(t * Math.PI) * window.innerHeight * 0.65;
  const moonSize = 40 + Math.sin(t * Math.PI) * 24;
  const horizonFade = Math.sin(t * Math.PI);

  skyCtx.fillStyle = `rgba(205, 225, 255, ${0.2 * horizonFade})`;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize * 1.8, 0, Math.PI * 2);
  skyCtx.fill();

  skyCtx.fillStyle = `rgba(235, 240, 252, ${Math.min(1, horizonFade + 0.1)})`;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
  skyCtx.fill();

  skyCtx.fillStyle = `rgba(180, 185, 210, ${0.2 * horizonFade})`;
  skyCtx.beginPath();
  skyCtx.arc(moonX - moonSize * 0.25, moonY - moonSize * 0.15, moonSize * 0.15, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.beginPath();
  skyCtx.arc(moonX + moonSize * 0.2, moonY + moonSize * 0.25, moonSize * 0.12, 0, Math.PI * 2);
  skyCtx.fill();
}

function drawStars(progress) {
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

// Combined animation loop (optimized)
function animateCombined(timestamp = 0) {
  // Dynamic FPS: lower when timer not running
  const effectiveFps = timerState.isRunning ? targetAnimationFps : Math.min(targetAnimationFps, 20);
  const effectiveInterval = 1000 / effectiveFps;

  const elapsedMs = lastRenderTime ? (timestamp - lastRenderTime) : effectiveInterval;
  if (elapsedMs < effectiveInterval) {
    animationFrameId = requestAnimationFrame(animateCombined);
    return;
  }
  lastRenderTime = timestamp;
  const timeScale = Math.max(0.8, Math.min(2, elapsedMs / 16.67));

  let progress = 0;
  if (timerState.totalTime > 0) {
    progress = Math.min(1, Math.max(0, 1 - (timerState.remainingTime / timerState.totalTime)));
  }
  cachedProgress = progress;

  // Sky rendering
  const colors = getInterpolatedSkyColors(progress);
  drawSky(colors);
  drawSun(progress);
  drawMoon(progress);
  drawStars(progress);

  // Particle rendering
  const w = window.innerWidth;
  const h = window.innerHeight;
  particlesCtx.clearRect(0, 0, w, h);

  particles.forEach(particle => {
    particle.x += particle.speedX * timeScale;
    particle.y += particle.speedY * timeScale;

    switch (particle.type) {
      case 'rain':
        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x > w + 10) particle.x = -10;

        let rainColor;
        if (cachedProgress < 0.5) {
          rainColor = `rgba(30, 80, 160, ${particle.opacity})`;
        } else {
          rainColor = `rgba(128, 128, 128, ${particle.opacity})`;
        }

        particlesCtx.strokeStyle = rainColor;
        particlesCtx.lineWidth = particle.size;
        particlesCtx.beginPath();
        particlesCtx.moveTo(particle.x, particle.y);
        particlesCtx.lineTo(particle.x - particle.speedX * 0.5, particle.y - particle.length);
        particlesCtx.stroke();
        break;

      case 'snow':
        particle.wobble += 0.02 * timeScale;
        particle.x += Math.sin(particle.wobble) * 0.3;

        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;

        particlesCtx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        particlesCtx.fill();
        break;

      case 'lightning':
        particle.nextFlash--;
        if (particle.nextFlash <= 0) {
          particle.flashOpacity = 0.8;
          particle.flashTimer = 5;
          particle.nextFlash = Math.random() * 400 + 200;
        }
        if (particle.flashTimer > 0) {
          particle.flashTimer--;
          particle.flashOpacity *= 0.85;
          particlesCtx.fillStyle = `rgba(255, 255, 255, ${particle.flashOpacity})`;
          particlesCtx.fillRect(0, 0, w, h);
        }
        break;

      case 'fog':
        particle.wobble += 0.005 * timeScale;
        particle.x += particle.speedX + Math.sin(particle.wobble) * 0.05;
        particle.y += particle.speedY;

        if (particle.x < -particle.size) particle.x = w + particle.size;
        if (particle.x > w + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = h + particle.size;
        if (particle.y > h + particle.size) particle.y = -particle.size;

        particlesCtx.fillStyle = isDarkMode ? 'rgba(150, 160, 170, 0.15)' : 'rgba(220, 230, 240, 0.2)';
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        particlesCtx.fill();
        break;

      case 'firefly':
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;
        if (particle.y < -10) particle.y = h + 10;
        if (particle.y > h + 10) particle.y = -10;

        particle.opacity += (Math.random() - 0.5) * 0.06;
        particle.opacity = Math.max(0.15, Math.min(0.6, particle.opacity));

        particlesCtx.fillStyle = `rgba(255, 255, 150, ${particle.opacity * 0.4})`;
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        particlesCtx.fill();
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

      case 'clouds':
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -particle.size) particle.x = w + particle.size;
        if (particle.x > w + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = h + particle.size;
        if (particle.y > h + particle.size) particle.y = -particle.size;

        particlesCtx.fillStyle = isDarkMode ? 'rgba(100, 110, 120, 0.15)' : 'rgba(255, 255, 255, 0.2)';
        particlesCtx.beginPath();
        particlesCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        particlesCtx.fill();
        break;

      case 'wind':
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > w + particle.length) particle.x = -particle.length;
        if (particle.y < -10) particle.y = h + 10;
        if (particle.y > h + 10) particle.y = -10;

        particlesCtx.strokeStyle = isDarkMode ? `rgba(180, 190, 200, ${particle.opacity})` : `rgba(150, 160, 170, ${particle.opacity})`;
        particlesCtx.lineWidth = particle.size;
        particlesCtx.beginPath();
        particlesCtx.moveTo(particle.x, particle.y);
        particlesCtx.lineTo(particle.x - particle.length, particle.y);
        particlesCtx.stroke();
        break;

      case 'blossom':
        particle.wobble += 0.02 * timeScale;
        particle.x += Math.sin(particle.wobble) * 0.3;
        particle.rotation += particle.rotationSpeed * timeScale;

        if (particle.y > h + 10) {
          particle.y = -10;
          particle.x = Math.random() * w;
        }
        if (particle.x < -10) particle.x = w + 10;
        if (particle.x > w + 10) particle.x = -10;

        particlesCtx.save();
        particlesCtx.translate(particle.x, particle.y);
        particlesCtx.rotate(particle.rotation);
        particlesCtx.fillStyle = `rgba(255, 182, 193, ${particle.opacity})`;
        particlesCtx.beginPath();
        particlesCtx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        particlesCtx.fill();
        particlesCtx.restore();
        break;

      case 'meteor':
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Re-randomize each streak on respawn to avoid repetitive patterns.
        if (particle.x < -particle.length || particle.x > w + particle.length ||
            particle.y < -particle.length || particle.y > h + particle.length) {
          Object.assign(particle, createMeteorParticle(w, h));
        }

        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        const tailX = particle.x + (particle.speedX / speed) * particle.length;
        const tailY = particle.y + (particle.speedY / speed) * particle.length;

        particlesCtx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        particlesCtx.lineWidth = particle.size;
        particlesCtx.beginPath();
        particlesCtx.moveTo(particle.x, particle.y);
        particlesCtx.lineTo(tailX, tailY);
        particlesCtx.stroke();
        break;
    }
  });

  animationFrameId = requestAnimationFrame(animateCombined);
}

// ==================== PARTICLES / WEATHER ====================
function initParticles() {
  resizeParticlesCanvas();
  createParticles();
  if (!animationFrameId) animateCombined();
}

function resizeParticlesCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const safeDpr = Math.min(dpr, 1.25);
  particlesCanvas.width = Math.floor(window.innerWidth * safeDpr);
  particlesCanvas.height = Math.floor(window.innerHeight * safeDpr);
  particlesCanvas.style.width = `${window.innerWidth}px`;
  particlesCanvas.style.height = `${window.innerHeight}px`;
  particlesCtx.setTransform(safeDpr, 0, 0, safeDpr, 0, 0);
}

function getActiveWeather() {
  if (weatherEffect === 'auto') {
    return AUTO_WEATHER_SEQUENCE[weatherCycleIndex % AUTO_WEATHER_SEQUENCE.length];
  }
  return isAllowedWeatherMode(weatherEffect) ? weatherEffect : 'auto';
}

// MODIFICATION: Optimized particle counts for better CPU performance
function createParticles() {
  particles = [];
  const weather = getActiveWeather();
  const w = window.innerWidth;
  const h = window.innerHeight;

  switch (weather) {
    case 'rain': {
      const count = scaledParticleCount(Math.min(140, Math.floor(w * h / 16000)));
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
      const count = scaledParticleCount(Math.min(90, Math.floor(w * h / 22000)));
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
    case 'blossom': {
      const count = scaledParticleCount(Math.min(100, Math.floor(w * h / 18000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: 0.8 + Math.random() * 1.2,
          opacity: Math.random() * 0.7 + 0.4,
          type: 'blossom',
          wobble: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05
        });
      }
      break;
    }
    case 'meteor': {
      const count = 5;
      for (let i = 0; i < count; i++) {
        particles.push(createMeteorParticle(w, h));
      }
      break;
    }
    case 'mist': {
      const count = scaledParticleCount(Math.min(26, Math.floor(w * h / 45000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 85 + 45,
          speedX: (Math.random() - 0.5) * 0.16,
          speedY: (Math.random() - 0.5) * 0.03,
          opacity: Math.random() * 0.25 + 0.12,
          type: 'fog',
          wobble: Math.random() * Math.PI * 2
        });
      }
      break;
    }
    case 'breeze': {
      const count = scaledParticleCount(Math.min(36, Math.floor(w * h / 32000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 0.9 + 0.4,
          speedX: 1.2 + Math.random() * 1.6,
          speedY: (Math.random() - 0.5) * 0.35,
          opacity: Math.random() * 0.2 + 0.12,
          type: 'wind',
          length: Math.random() * 26 + 14
        });
      }
      break;
    }
    case 'fireflies': {
      const count = scaledParticleCount(Math.min(24, Math.floor(w * h / 52000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.6 + 1.1,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.28,
          opacity: Math.random() * 0.35 + 0.2,
          type: 'firefly'
        });
      }
      break;
    }
    default: {
      const count = scaledParticleCount(Math.min(90, Math.floor(w * h / 20000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: 0.8 + Math.random() * 1.2,
          opacity: Math.random() * 0.7 + 0.4,
          type: 'blossom',
          wobble: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05
        });
      }
    }
  }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  loadFromStorage();

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
  if (highContrast) {
    document.body.classList.add('high-contrast');
  }
  if (options.focusMode) {
    document.body.classList.add('focus-mode');
  }

  volumeSlider.value = soundSettings.volume * 100;
  volumeValue.textContent = `${Math.round(soundSettings.volume * 100)}%`;

  highContrastToggle.checked = highContrast;
  focusModeToggle.checked = options.focusMode;
  if (lowPowerToggle) lowPowerToggle.checked = options.lowPowerMode;
  document.getElementById('autoStartToggle').checked = options.autoStart;
  document.getElementById('skipBreaksToggle').checked = options.skipBreaks;

  themeOptions.forEach(btn => {
    const isActive = btn.dataset.theme === currentTheme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  soundTypeBtns.forEach(btn => {
    const isActive = btn.dataset.sound === soundSettings.soundType;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  weatherBtns.forEach(btn => {
    const isActive = btn.dataset.weather === weatherEffect;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  presetBtns.forEach(btn => {
    const minutes = timerState.totalTime / 60000;
    btn.setAttribute('aria-pressed', (parseInt(btn.dataset.minutes) === minutes).toString());
  });

  if (taskSort) taskSort.value = taskViewState.sortBy;
  if (taskFilter) taskFilter.value = taskViewState.filterBy;

  updateThemeColors();
  applyLowPowerMode();
  applyNoAnimation();
  if (options.pomodoroStyle) setPomodoroStyle(options.pomodoroStyle);
  initTimerStars();
  initParticles();
  initSky();
  renderTasks();
  updateIntentionDropdown();
  updateDisplay();
  updateProgress();
  updateCycle();
  updateStats();
  updateTimerType();
  updateModeButtons();

  if (timerState.mode !== 'focus' && options.breathingGuide) {
    startBreathingGuide();
  }

  // Restore intention
  if (lastIntention && intentionSelect) {
    updateIntentionDropdown();
    intentionSelect.value = lastIntention;
  }

  // Render distraction summary
  renderDistractionSummary();
  updateDistractionKPIs();

  // Mobile browsers often block audio until explicit user interaction.
  const unlockAudioOnce = () => primeAudioAndNotifications();
  window.addEventListener('pointerdown', unlockAudioOnce, { once: true, passive: true });
  window.addEventListener('touchstart', unlockAudioOnce, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudioOnce, { once: true });

  // Timer Controls
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

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
    });
  });

  themeToggleBtn.addEventListener('click', toggleTheme);

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setCustomDuration(parseInt(btn.dataset.minutes));
    });
  });

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

  volumeSlider.addEventListener('input', (e) => {
    soundSettings.volume = e.target.value / 100;
    volumeValue.textContent = `${e.target.value}%`;
    saveToStorage();
  });

  testSoundBtn.addEventListener('click', playAlarm);

  soundTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setSoundType(btn.dataset.sound);
    });
  });

  weatherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setWeatherEffect(btn.dataset.weather);
    });
  });

  highContrastToggle.addEventListener('change', (e) => {
    highContrast = e.target.checked;
    applyHighContrast();
  });

  focusModeToggle.addEventListener('change', (e) => {
    options.focusMode = e.target.checked;
    applyFocusMode();
  });

  if (lowPowerToggle) {
    lowPowerToggle.addEventListener('change', (e) => {
      options.lowPowerMode = e.target.checked;
      applyLowPowerMode();
    });
  }

  if (noAnimationToggle) {
    noAnimationToggle.checked = options.noAnimation;
    noAnimationToggle.addEventListener('change', (e) => {
      options.noAnimation = e.target.checked;
      applyNoAnimation();
    });
  }

  presetStyleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setPomodoroStyle(btn.dataset.style);
    });
  });

  focusExitBtn.addEventListener('click', () => {
    options.focusMode = false;
    applyFocusMode();
  });

  // === Distraction Log ===
  distractionBtn.addEventListener('click', toggleDistractionPanel);

  distractionAddBtn.addEventListener('click', () => {
    const text = distractionText.value.trim();
    if (text) {
      logDistraction(text, 'other');
      distractionText.value = '';
      distractionPanel.hidden = true;
    }
  });

  distractionText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      distractionAddBtn.click();
    }
  });

  document.querySelectorAll('.distraction-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catLabels = { phone: 'Phone', social: 'Social', email: 'Email', thoughts: 'Thoughts' };
      const category = btn.dataset.category;
      logDistraction(catLabels[category] || category, category);
      distractionPanel.hidden = true;
    });
  });

  clearDistractionsBtn.addEventListener('click', clearDistractions);

  // === Session Intention (dropdown) ===
  if (intentionSelect) {
    intentionSelect.addEventListener('change', () => {
      lastIntention = intentionSelect.value || null;
      saveToStorage();
    });
  }

  // === Standalone Breathing ===
  if (breatheStartBtn) {
    breatheStartBtn.addEventListener('click', startStandaloneBreathing);
  }
  if (breathingStopBtn) {
    breathingStopBtn.addEventListener('click', stopStandaloneBreathing);
  }

  // === Onboarding Task Prompt ===
  if (onboardingAddTaskBtn && onboardingTaskInput) {
    const addOnboardingTask = () => {
      const text = onboardingTaskInput.value.trim();
      if (!text) return;
      tasks.push({ text, completed: false, createdAt: Date.now() });
      onboardingTaskInput.value = '';
      const li = document.createElement('li');
      li.textContent = text;
      if (onboardingTaskList) onboardingTaskList.appendChild(li);
      updateIntentionDropdown();
      renderTasks();
      saveToStorage();
    };
    onboardingAddTaskBtn.addEventListener('click', addOnboardingTask);
    onboardingTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addOnboardingTask();
      }
    });
  }

  // === Breathing Guide Toggle ===
  if (breathingGuideToggle) {
    breathingGuideToggle.checked = options.breathingGuide;
    breathingGuideToggle.addEventListener('change', (e) => {
      options.breathingGuide = e.target.checked;
      if (options.breathingGuide && timerState.mode !== 'focus') {
        startBreathingGuide();
      } else {
        stopBreathingGuide();
      }
      saveToStorage();
    });
  }

  themeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
    });
  });

  addTaskBtn.addEventListener('click', addTask);
  newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });

  taskSort.addEventListener('change', (e) => {
    setTaskSort(e.target.value);
  });

  taskFilter.addEventListener('change', (e) => {
    setTaskFilter(e.target.value);
  });

  exportCsvBtn.addEventListener('click', exportTasksToCSV);

  importCsvBtn.addEventListener('click', () => {
    csvFileInput.click();
  });
  csvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importTasksFromCSV(e.target.files[0]);
      e.target.value = '';
    }
  });

  shortcutsBtn.addEventListener('click', showShortcuts);

  closeOnboarding.addEventListener('click', hideOnboarding);
  startJourneyBtn.addEventListener('click', hideOnboarding);

  closeShortcuts.addEventListener('click', hideShortcuts);

  document.getElementById('autoStartToggle').addEventListener('change', (e) => {
    options.autoStart = e.target.checked;
    saveToStorage();
  });

  document.getElementById('skipBreaksToggle').addEventListener('change', (e) => {
    options.skipBreaks = e.target.checked;
    saveToStorage();
  });

  document.addEventListener('keydown', (e) => {
    const isInputFocused = document.activeElement &&
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT');

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
      case 'KeyD':
        if (timerState.isRunning && timerState.mode === 'focus') {
          e.preventDefault();
          toggleDistractionPanel();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (isBreathingStandalone) {
          stopStandaloneBreathing();
          break;
        }
        if (distractionPanel && !distractionPanel.hidden) {
          distractionPanel.hidden = true;
          break;
        }
        if (options.focusMode) {
          options.focusMode = false;
          applyFocusMode();
        }
        hideOnboarding();
        hideShortcuts();
        break;
    }
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeParticlesCanvas();
      resizeSkyCanvas();
      createStars();
      createParticles();
    }, 200);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Stop all animations to save CPU/battery when in background
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      // Clear particle canvas to free memory
      if (particlesCtx) {
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      }
    } else {
      // Resume animations when app comes back to foreground
      lastRenderTime = 0;
      if (!animationFrameId) animateCombined();
    }
  });

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