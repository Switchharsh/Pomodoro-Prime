// Pomodoro Prime - Enhanced JavaScript
// Features: Gamification, XP system, achievements, ambient sounds, multiplayer, PWA
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
  lastSessionDate: null,
  weeklyData: {} // Store daily focus hours for the week
};

let soundSettings = {
  volume: 0.5,
  tickEnabled: false,
  whiteNoiseVolume: 0,
  rainVolume: 0,
  cafeVolume: 0,
  lofiVolume: 0
};

let currentTheme = 'forest';
let isDarkMode = false;
let isOledMode = false;
let highContrast = false;

let options = {
  autoStart: false,
  skipBreaks: false,
  focusMode: false,
  breathingEnabled: true
};

let tasks = [];

// ==================== GAMIFICATION STATE ====================
let xpState = {
  xp: 0,
  level: 1,
  totalXpEarned: 0
};

const LEVELS = [
  { level: 1, name: 'Novice', xpRequired: 0 },
  { level: 2, name: 'Apprentice', xpRequired: 100 },
  { level: 3, name: 'Focused', xpRequired: 250 },
  { level: 4, name: 'Dedicated', xpRequired: 500 },
  { level: 5, name: 'Productive', xpRequired: 800 },
  { level: 6, name: 'Efficient', xpRequired: 1200 },
  { level: 7, name: 'Master', xpRequired: 1700 },
  { level: 8, name: 'Expert', xpRequired: 2300 },
  { level: 9, name: 'Champion', xpRequired: 3000 },
  { level: 10, name: 'Time Lord', xpRequired: 4000 }
];

const ACHIEVEMENTS = [
  { id: 'first_pomodoro', name: 'First Pomodoro', desc: 'Complete your first focus session', icon: '🌱', xp: 10, unlocked: false },
  { id: 'streak_3', name: '3-Day Streak', desc: 'Use the app for 3 consecutive days', icon: '🔥', xp: 30, unlocked: false },
  { id: 'streak_7', name: 'Week Warrior', desc: 'Use the app for 7 consecutive days', icon: '⚔️', xp: 70, unlocked: false },
  { id: 'streak_30', name: 'Monthly Master', desc: 'Use the app for 30 consecutive days', icon: '👑', xp: 300, unlocked: false },
  { id: 'deep_work_4', name: 'Deep Work Master', desc: 'Complete 4 pomodoros in one session', icon: '🧠', xp: 50, unlocked: false },
  { id: 'pomodoro_10', name: 'Ten Pomodoros', desc: 'Complete 10 pomodoros total', icon: '🎯', xp: 40, unlocked: false },
  { id: 'pomodoro_50', name: 'Half Century', desc: 'Complete 50 pomodoros total', icon: '💯', xp: 150, unlocked: false },
  { id: 'pomodoro_100', name: 'Century Club', desc: 'Complete 100 pomodoros total', icon: '🏆', xp: 300, unlocked: false },
  { id: 'focus_hour', name: 'Focus Hour', desc: 'Focus for 60 minutes total', icon: '⏰', xp: 20, unlocked: false },
  { id: 'focus_5hours', name: 'Focus Five', desc: 'Focus for 5 hours total', icon: '⏳', xp: 80, unlocked: false },
  { id: 'level_5', name: 'Rising Star', desc: 'Reach Level 5', icon: '⭐', xp: 100, unlocked: false },
  { id: 'level_10', name: 'Time Lord', desc: 'Reach Level 10', icon: '🌟', xp: 200, unlocked: false }
];

// ==================== MULTIPLAYER STATE ====================
let multiplayerState = {
  roomId: null,
  members: [],
  isHost: false
};

// ==================== SESSION NOTES ====================
let sessionNotes = '';
let savedNotes = [];

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
let settingsBtn, shortcutsBtn, optionsToggle, optionsList;
let onboardingModal, closeOnboarding, startJourneyBtn;
let shortcutsModal, closeShortcuts;
let highContrastToggle, themeOptions, focusModeToggle;
let audioContext;
let particlesCanvas, particlesCtx, particles = [];
let skyCanvas, skyCtx, stars = [];
let celestialBody, celestialCircle, celestialGlowEffect, timerSkyGradient;

// New DOM elements for features
let xpLevel, xpBar, xpText, achievementsGrid;
let sessionNotesInput, saveNotesBtn, taskPomodoros;
let breathingSection, breathingCircle, breathingText, skipBreathingBtn;
let oledToggle, breathingToggle;
let whiteNoiseVolume, rainVolume, cafeVolume, lofiVolume;
let createRoomBtn, roomIdInput, joinRoomBtn, roomInfo, currentRoomIdDisplay, copyRoomIdBtn, leaveRoomBtn, roomMembers;
let achievementModal, closeAchievement, achievementIcon, achievementName, achievementDesc, xpGain;
let celebrationCanvas, celebrationCtx;
let weeklyChart;

// ==================== THEME COLORS ====================
const THEME_COLORS = {
  forest: {
    sunrise: { top: [135, 206, 235], middle: [255, 183, 77], bottom: [255, 127, 80] },
    morning: { top: [135, 206, 235], middle: [176, 224, 230], bottom: [255, 255, 255] },
    midday: { top: [70, 130, 180], middle: [135, 206, 235], bottom: [173, 216, 230] },
    afternoon: { top: [100, 149, 237], middle: [255, 218, 185], bottom: [255, 160, 122] },
    sunset: { top: [72, 61, 139], middle: [255, 140, 0], bottom: [255, 69, 0] },
    night: { top: [10, 10, 30], middle: [20, 20, 50], bottom: [30, 30, 70] },
    focus: '#2D5A27',
    focusLight: '#4A7C43',
    short: '#5D8A66',
    shortLight: '#8AB896',
    long: '#8B7355',
    longLight: '#B8A99A'
  },
  ocean: {
    sunrise: { top: [135, 206, 250], middle: [255, 200, 150], bottom: [255, 150, 100] },
    morning: { top: [135, 206, 250], middle: [173, 216, 230], bottom: [240, 248, 255] },
    midday: { top: [30, 144, 255], middle: [135, 206, 250], bottom: [173, 216, 230] },
    afternoon: { top: [65, 105, 225], middle: [255, 200, 150], bottom: [255, 150, 100] },
    sunset: { top: [25, 25, 112], middle: [255, 140, 0], bottom: [255, 100, 50] },
    night: { top: [10, 10, 40], middle: [20, 30, 60], bottom: [30, 50, 80] },
    focus: '#1E90FF',
    focusLight: '#4169E1',
    short: '#20B2AA',
    shortLight: '#5DADE2',
    long: '#008B8B',
    longLight: '#48D1CC'
  },
  mountain: {
    sunrise: { top: [176, 196, 222], middle: [255, 218, 185], bottom: [210, 180, 140] },
    morning: { top: [176, 196, 222], middle: [230, 230, 250], bottom: [255, 250, 250] },
    midday: { top: [135, 206, 235], middle: [176, 196, 222], bottom: [200, 200, 220] },
    afternoon: { top: [119, 136, 153], middle: [255, 218, 185], bottom: [210, 180, 140] },
    sunset: { top: [47, 79, 79], middle: [255, 140, 0], bottom: [210, 105, 30] },
    night: { top: [15, 15, 25], middle: [25, 25, 40], bottom: [40, 40, 60] },
    focus: '#6B8E23',
    focusLight: '#8B9A46',
    short: '#8B4513',
    shortLight: '#CD853F',
    long: '#556B2F',
    longLight: '#8B7355'
  },
  space: {
    sunrise: { top: [75, 0, 130], middle: [255, 100, 100], bottom: [255, 150, 150] },
    morning: { top: [75, 0, 130], middle: [147, 112, 219], bottom: [186, 85, 211] },
    midday: { top: [25, 25, 112], middle: [75, 0, 130], bottom: [147, 112, 219] },
    afternoon: { top: [72, 61, 139], middle: [255, 100, 100], bottom: [255, 150, 150] },
    sunset: { top: [0, 0, 0], middle: [255, 100, 100], bottom: [255, 50, 50] },
    night: { top: [5, 5, 15], middle: [10, 10, 25], bottom: [20, 20, 35] },
    focus: '#9400D3',
    focusLight: '#BA55D3',
    short: '#FF6347',
    shortLight: '#FFA07A',
    long: '#32CD32',
    longLight: '#90EE90'
  }
};

// ==================== LOCAL STORAGE ====================
function saveToStorage() {
  const data = {
    timerState: {
      mode: timerState.mode,
      totalTime: timerState.totalTime,
      remainingTime: timerState.remainingTime,
      cycle: timerState.cycle
    },
    statsState,
    soundSettings,
    themeSettings: { currentTheme, isDarkMode, isOledMode, highContrast },
    options,
    tasks,
    xpState,
    achievements: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked })),
    savedNotes,
    multiplayerState: { roomId: multiplayerState.roomId, isHost: multiplayerState.isHost }
  };
  localStorage.setItem('pomodoroPrimeData', JSON.stringify(data));
}

function loadFromStorage() {
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
      isOledMode = data.themeSettings.isOledMode || false;
      highContrast = data.themeSettings.highContrast || false;
    }
    if (data.options) options = { ...options, ...data.options };
    if (data.tasks) tasks = data.tasks;
    if (data.xpState) xpState = { ...xpState, ...data.xpState };
    if (data.achievements) {
      data.achievements.forEach(saved => {
        const achievement = ACHIEVEMENTS.find(a => a.id === saved.id);
        if (achievement) achievement.unlocked = saved.unlocked;
      });
    }
    if (data.savedNotes) savedNotes = data.savedNotes;
    if (data.multiplayerState) {
      multiplayerState.roomId = data.multiplayerState.roomId;
      multiplayerState.isHost = data.multiplayerState.isHost;
    }
  }
  
  const hasVisited = localStorage.getItem('pomodoroPrimeVisited');
  if (!hasVisited) showOnboarding();
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
  settingsBtn = document.getElementById('settingsBtn');
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
  settingsBtn = document.getElementById('settingsBtn');
  shortcutsBtn = document.getElementById('shortcutsBtn');
  optionsToggle = document.getElementById('optionsToggle');
  optionsList = document.getElementById('optionsList');
  onboardingModal = document.getElementById('onboardingModal');
  closeOnboarding = document.getElementById('closeOnboarding');
  startJourneyBtn = document.getElementById('startJourneyBtn');
  shortcutsModal = document.getElementById('shortcutsModal');
  closeShortcuts = document.getElementById('closeShortcuts');
  highContrastToggle = document.getElementById('highContrastToggle');
  themeOptions = document.querySelectorAll('.theme-option');
  focusModeToggle = document.getElementById('focusModeToggle');
  particlesCanvas = document.getElementById('particlesCanvas');
  particlesCtx = particlesCanvas.getContext('2d');
  skyCanvas = document.getElementById('skyCanvas');
  skyCtx = skyCanvas.getContext('2d');
  celestialBody = document.getElementById('celestialBody');
  celestialCircle = document.getElementById('celestialCircle');
  celestialGlowEffect = document.getElementById('celestialGlowEffect');
  timerSkyGradient = document.getElementById('timerSkyGradient');
  
  // New DOM elements for features
  xpLevel = document.getElementById('xpLevel');
  xpBar = document.getElementById('xpBar');
  xpText = document.getElementById('xpText');
  achievementsGrid = document.getElementById('achievementsGrid');
  sessionNotesInput = document.getElementById('sessionNotes');
  saveNotesBtn = document.getElementById('saveNotesBtn');
  taskPomodoros = document.getElementById('taskPomodoros');
  breathingSection = document.getElementById('breathingSection');
  breathingCircle = document.getElementById('breathingCircle');
  breathingText = document.getElementById('breathingText');
  skipBreathingBtn = document.getElementById('skipBreathingBtn');
  oledToggle = document.getElementById('oledToggle');
  breathingToggle = document.getElementById('breathingToggle');
  whiteNoiseVolume = document.getElementById('whiteNoiseVolume');
  rainVolume = document.getElementById('rainVolume');
  cafeVolume = document.getElementById('cafeVolume');
  lofiVolume = document.getElementById('lofiVolume');
  createRoomBtn = document.getElementById('createRoomBtn');
  roomIdInput = document.getElementById('roomIdInput');
  joinRoomBtn = document.getElementById('joinRoomBtn');
  roomInfo = document.getElementById('roomInfo');
  currentRoomIdDisplay = document.getElementById('currentRoomId');
  copyRoomIdBtn = document.getElementById('copyRoomIdBtn');
  leaveRoomBtn = document.getElementById('leaveRoomBtn');
  roomMembers = document.getElementById('roomMembers');
  achievementModal = document.getElementById('achievementModal');
  closeAchievement = document.getElementById('closeAchievement');
  achievementIcon = document.getElementById('achievementIcon');
  achievementName = document.getElementById('achievementName');
  achievementDesc = document.getElementById('achievementDesc');
  xpGain = document.getElementById('xpGain');
  weeklyChart = document.getElementById('weeklyChart');
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

function updateCelestialBody(progress) {
  if (!celestialBody || !celestialCircle) return;
  
  const angle = Math.PI - (progress * Math.PI);
  const radius = 35;
  const centerX = 50;
  const centerY = 50;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;
  
  celestialCircle.setAttribute('cx', x.toString());
  celestialCircle.setAttribute('cy', y.toString());
  
  const size = 6 + Math.sin(progress * Math.PI) * 4;
  celestialCircle.setAttribute('r', size.toString());
  
  // Update celestial body state (sun/moon) based on progress
  if (progress < 0.3 || progress > 0.85) {
    celestialBody.classList.remove('sun');
    celestialBody.classList.add('moon');
    celestialCircle.setAttribute('fill', '#F0F4F8');
  } else {
    celestialBody.classList.remove('moon');
    celestialBody.classList.add('sun');
    celestialCircle.setAttribute('fill', '#FFD700');
  }
}

function updateTimerSkyGradient(progress) {
  if (!timerSkyGradient) return;
  
  const colors = getInterpolatedSkyColors(progress);
  const stops = timerSkyGradient.querySelectorAll('stop');
  
  stops[0].setAttribute('style', `stop-color:rgb(${colors.top.join(',')});stop-opacity:1`);
  stops[1].setAttribute('style', `stop-color:rgb(${colors.middle.join(',')});stop-opacity:1`);
  stops[2].setAttribute('style', `stop-color:rgb(${colors.bottom.join(',')});stop-opacity:1`);
}

function updateCycle() {
  currentCycle.textContent = `${timerState.cycle}/4`;
  
  // Update cycle dots
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

// ==================== GAMIFICATION FUNCTIONS ====================
function updateXP() {
  const currentLevelData = LEVELS.find(l => l.level === xpState.level);
  const nextLevelData = LEVELS.find(l => l.level === xpState.level + 1);
  
  if (currentLevelData) {
    xpLevel.textContent = `Level ${xpState.level}: ${currentLevelData.name}`;
  }
  
  if (nextLevelData) {
    const xpInCurrentLevel = xpState.xp - currentLevelData.xpRequired;
    const xpNeededForNextLevel = nextLevelData.xpRequired - currentLevelData.xpRequired;
    const progress = Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);
    xpBar.style.width = `${progress}%`;
    xpText.textContent = `${xpInCurrentLevel}/${xpNeededForNextLevel} XP`;
  } else {
    xpBar.style.width = '100%';
    xpText.textContent = 'MAX LEVEL';
  }
}

function addXP(amount) {
  xpState.xp += amount;
  xpState.totalXpEarned += amount;
  
  // Check for level up
  const nextLevelData = LEVELS.find(l => l.level === xpState.level + 1);
  if (nextLevelData && xpState.xp >= nextLevelData.xpRequired) {
    xpState.level++;
    showAchievementModal({
      icon: '⬆️',
      name: `Level Up!`,
      desc: `You are now Level ${xpState.level}: ${nextLevelData.name}`,
      xp: 0
    });
  }
  
  updateXP();
  saveToStorage();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.unlocked) return;
    
    let unlocked = false;
    
    switch (achievement.id) {
      case 'first_pomodoro':
        unlocked = statsState.pomodoros >= 1;
        break;
      case 'streak_3':
        unlocked = statsState.streak >= 3;
        break;
      case 'streak_7':
        unlocked = statsState.streak >= 7;
        break;
      case 'streak_30':
        unlocked = statsState.streak >= 30;
        break;
      case 'deep_work_4':
        unlocked = statsState.pomodoros >= 4 && timerState.cycle === 4;
        break;
      case 'pomodoro_10':
        unlocked = statsState.pomodoros >= 10;
        break;
      case 'pomodoro_50':
        unlocked = statsState.pomodoros >= 50;
        break;
      case 'pomodoro_100':
        unlocked = statsState.pomodoros >= 100;
        break;
      case 'focus_hour':
        unlocked = statsState.focusTime >= 60;
        break;
      case 'focus_5hours':
        unlocked = statsState.focusTime >= 300;
        break;
      case 'level_5':
        unlocked = xpState.level >= 5;
        break;
      case 'level_10':
        unlocked = xpState.level >= 10;
        break;
    }
    
    if (unlocked) {
      achievement.unlocked = true;
      showAchievementModal(achievement);
      addXP(achievement.xp);
      renderAchievements();
    }
  });
}

function renderAchievements() {
  achievementsGrid.innerHTML = '';
  ACHIEVEMENTS.forEach(achievement => {
    const div = document.createElement('div');
    div.className = `achievement-badge ${achievement.unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <span class="achievement-name">${achievement.name}</span>
    `;
    div.title = achievement.desc;
    achievementsGrid.appendChild(div);
  });
}

function showAchievementModal(achievement) {
  achievementIcon.textContent = achievement.icon;
  achievementName.textContent = achievement.name;
  achievementDesc.textContent = achievement.desc;
  if (achievement.xp > 0) {
    xpGain.textContent = `+${achievement.xp} XP`;
    xpGain.style.display = 'inline-block';
  } else {
    xpGain.style.display = 'none';
  }
  achievementModal.setAttribute('aria-hidden', 'false');
  
  setTimeout(() => {
    hideAchievementModal();
  }, 5000);
}

function hideAchievementModal() {
  achievementModal.setAttribute('aria-hidden', 'true');
}

// ==================== AUDIO FUNCTIONS (Enhanced) ====================
function playWorkStartSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2 * soundSettings.volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playBreakStartSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2 * soundSettings.volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playTimerFinishedSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    // Play a chime pattern
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.25 * soundSettings.volume, audioContext.currentTime + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
      
      oscillator.start(audioContext.currentTime + i * 0.15);
      oscillator.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playAlarm() {
  playTimerFinishedSound();
}

function playChime(volume) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3 * volume, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function playTick() {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05 * soundSettings.volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// ==================== AMBIENT SOUNDS ====================
let whiteNoiseNode, rainNode, cafeNode, lofiNode;
let whiteNoiseGain, rainGain, cafeGain, lofiGain;

function createWhiteNoise() {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  whiteNoiseNode = audioContext.createBufferSource();
  whiteNoiseNode.buffer = noiseBuffer;
  whiteNoiseNode.loop = true;
  whiteNoiseGain = audioContext.createGain();
  whiteNoiseGain.gain.value = 0;
  
  whiteNoiseNode.connect(whiteNoiseGain);
  whiteNoiseGain.connect(audioContext.destination);
  whiteNoiseNode.start();
}

function createRainSound() {
  // Simulate rain with filtered noise
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  rainNode = audioContext.createBufferSource();
  rainNode.buffer = noiseBuffer;
  rainNode.loop = true;
  
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  
  rainGain = audioContext.createGain();
  rainGain.gain.value = 0;
  
  rainNode.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(audioContext.destination);
  rainNode.start();
}

function updateAmbientVolumes() {
  if (whiteNoiseGain) whiteNoiseGain.gain.value = (soundSettings.whiteNoiseVolume / 100) * 0.3;
  if (rainGain) rainGain.gain.value = (soundSettings.rainVolume / 100) * 0.3;
  // Cafe and Lo-Fi would need actual audio files, for now just placeholders
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

// ==================== AUDIO FUNCTIONS (Simplified - Chime Only) ====================
function playAlarm() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    playChime(soundSettings.volume);
  } catch (e) {
    console.log('Audio play error:', e);
  }
}

function playChime(volume) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3 * volume, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function playTick() {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05 * soundSettings.volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// ==================== NOTIFICATIONS ====================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') console.log('Notification permission granted');
    });
  }
}

function showBrowserNotification(title, body, icon) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: icon || '🌲',
      badge: '🌲',
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
    
    // Add XP for completing a pomodoro
    addXP(10);
    
    // Trigger celebration particles
    triggerCelebration();
    
    // Check for achievements
    checkAchievements();
    
    // Update weekly chart
    updateWeeklyChart();
    
    const today = new Date().toDateString();
    if (statsState.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (statsState.lastSessionDate === yesterday.toDateString()) {
        statsState.streak++;
      } else if (statsState.lastSessionDate === null) {
        statsState.streak = 1;
      } else {
        statsState.streak = 1;
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
  
  showBrowserNotification(notificationTitle, notificationBody, '🌲');
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
    if (options.autoStart) {
      setMode(nextMode);
      startTimer();
    } else {
      setMode(nextMode);
      // Start breathing exercise for breaks
      if (nextMode !== 'focus') {
        startBreathingExercise();
      } else {
        stopBreathingExercise();
      }
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
  updateDynamicThemeColors();
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
  
  // Play work start sound
  if (timerState.mode === 'focus') {
    playWorkStartSound();
  } else {
    playBreakStartSound();
  }
  
  // Stop breathing exercise when starting timer
  stopBreathingExercise();
  
  let lastMinute = Math.floor(timerState.remainingTime / 60000);
  
  timerState.interval = setInterval(() => {
    const elapsed = Date.now() - timerState.startTime;
    timerState.remainingTime = Math.max(0, timerState.totalTime - elapsed);
    
    updateDisplay();
    updateProgress();
    
    if (soundSettings.tickEnabled) {
      const currentMinute = Math.floor(timerState.remainingTime / 60000);
      if (currentMinute !== lastMinute && currentMinute >= 0) {
        playTick();
        lastMinute = currentMinute;
      }
    }
    
    if (timerState.remainingTime <= 0) {
      clearInterval(timerState.interval);
      onTimerComplete();
    }
  }, 1000);
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
    const modes = ['focus', 'short', 'long'];
    const currentIndex = modes.indexOf(timerState.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
    
    if (timerState.mode === 'short' && options.skipBreaks && timerState.cycle === 4) {
      setMode('long');
    }
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
  saveToStorage();
  
  presetBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', (parseInt(btn.dataset.minutes) === minutes).toString());
  });
}

// ==================== TASK FUNCTIONS ====================
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.index = index;
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
      <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
      ${task.estimatedPomodoros ? `<span class="task-pomodoros">🍅 ${task.estimatedPomodoros}</span>` : ''}
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
  const pomodoros = parseInt(taskPomodoros.value) || 1;
  if (!text) return;
  
  tasks.push({ text, completed: false, estimatedPomodoros: pomodoros, createdAt: Date.now() });
  newTaskInput.value = '';
  taskPomodoros.value = '';
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

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeToggleBtn.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
  saveToStorage();
}

function toggleOledMode() {
  isOledMode = !isOledMode;
  document.body.classList.toggle('oled-mode', isOledMode);
  saveToStorage();
}

function toggleHighContrast() {
  highContrast = !highContrast;
  document.body.classList.toggle('high-contrast', highContrast);
  saveToStorage();
}

function toggleFocusMode() {
  options.focusMode = !options.focusMode;
  document.body.classList.toggle('focus-mode', options.focusMode);
  saveToStorage();
}

// ==================== BREATHING EXERCISE ====================
let breathingInterval = null;
let breathingPhase = 0;
const breathingPhases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];

function startBreathingExercise() {
  if (!options.breathingEnabled) return;
  
  breathingSection.classList.remove('hidden');
  breathingPhase = 0;
  updateBreathingText();
  
  breathingInterval = setInterval(() => {
    breathingPhase = (breathingPhase + 1) % breathingPhases.length;
    updateBreathingText();
  }, 4000); // 4 seconds per phase
}

function stopBreathingExercise() {
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  breathingSection.classList.add('hidden');
}

function updateBreathingText() {
  breathingText.textContent = breathingPhases[breathingPhase];
}

function skipBreathingExercise() {
  stopBreathingExercise();
}

// ==================== SESSION NOTES ====================
function saveNotes() {
  const notes = sessionNotesInput.value.trim();
  if (!notes) return;
  
  savedNotes.push({
    date: new Date().toISOString(),
    notes: notes,
    mode: timerState.mode,
    duration: Math.round((timerState.totalTime - timerState.remainingTime) / 60000)
  });
  
  sessionNotesInput.value = '';
  saveToStorage();
  
  // Show brief feedback
  const btn = saveNotesBtn;
  const originalText = btn.textContent;
  btn.textContent = 'Saved!';
  setTimeout(() => {
    btn.textContent = originalText;
  }, 2000);
}

// ==================== CELEBRATION PARTICLES ====================
let celebrationParticles = [];

function initCelebrationCanvas() {
  celebrationCanvas = document.getElementById('celebrationCanvas');
  if (celebrationCanvas) {
    celebrationCtx = celebrationCanvas.getContext('2d');
    resizeCelebrationCanvas();
  }
}

function resizeCelebrationCanvas() {
  if (celebrationCanvas) {
    celebrationCanvas.width = window.innerWidth;
    celebrationCanvas.height = window.innerHeight;
  }
}

function createCelebrationParticles() {
  celebrationParticles = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  for (let i = 0; i < 100; i++) {
    celebrationParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 5,
      size: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.02 + 0.01
    });
  }
}

function animateCelebration() {
  if (celebrationParticles.length === 0) {
    celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    return;
  }
  
  celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
  
  celebrationParticles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.3; // gravity
    particle.alpha -= particle.decay;
    
    if (particle.alpha <= 0) {
      celebrationParticles.splice(index, 1);
      return;
    }
    
    celebrationCtx.beginPath();
    celebrationCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    celebrationCtx.fillStyle = particle.color;
    celebrationCtx.globalAlpha = particle.alpha;
    celebrationCtx.fill();
  });
  
  celebrationCtx.globalAlpha = 1;
  requestAnimationFrame(animateCelebration);
}

function triggerCelebration() {
  createCelebrationParticles();
  animateCelebration();
}

// ==================== WEEKLY CHART ====================
let weeklyChartInstance = null;

function initWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  
  const last7Days = getLast7DaysData();
  
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }
  
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last7Days.labels,
      datasets: [{
        label: 'Focus Hours',
        data: last7Days.data,
        backgroundColor: 'rgba(45, 90, 39, 0.7)',
        borderColor: 'rgba(45, 90, 39, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function getLast7DaysData() {
  const labels = [];
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    labels.push(dayName);
    
    // Get focus time for this day from saved notes
    const dayNotes = savedNotes.filter(n => new Date(n.date).toDateString() === dateStr);
    const totalMinutes = dayNotes.reduce((sum, n) => sum + (n.duration || 0), 0);
    data.push((totalMinutes / 60).toFixed(1));
  }
  
  return { labels, data };
}

function updateWeeklyChart() {
  initWeeklyChart();
}

// ==================== DYNAMIC THEME COLORS ====================
function updateDynamicThemeColors() {
  // Change colors based on current mode
  const colors = THEME_COLORS[currentTheme];
  
  if (timerState.mode === 'focus') {
    document.documentElement.style.setProperty('--color-focus', colors.focus);
    document.documentElement.style.setProperty('--color-focus-light', colors.focusLight);
  } else if (timerState.mode === 'short') {
    document.documentElement.style.setProperty('--color-focus', colors.short);
    document.documentElement.style.setProperty('--color-focus-light', colors.shortLight);
  } else {
    document.documentElement.style.setProperty('--color-focus', colors.long);
    document.documentElement.style.setProperty('--color-focus-light', colors.longLight);
  }
}

// ==================== MODAL FUNCTIONS ====================
function showOnboarding() {
  onboardingModal.setAttribute('aria-hidden', 'false');
}

function hideOnboarding() {
  onboardingModal.setAttribute('aria-hidden', 'true');
  localStorage.setItem('pomodoroPrimeVisited', 'true');
}

function showShortcuts() {
  shortcutsModal.setAttribute('aria-hidden', 'false');
}

function hideShortcuts() {
  shortcutsModal.setAttribute('aria-hidden', 'true');
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
  const starCount = 100;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * skyCanvas.width,
      y: Math.random() * skyCanvas.height * 0.6,
      size: Math.random() * 2 + 0.5,
      twinkleSpeed: Math.random() * 0.05 + 0.02,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleDirection: Math.random() > 0.5 ? 1 : -1
    });
  }
}

function lerpColor(color1, color2, t) {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t)
  ];
}

function getInterpolatedSkyColors(progress) {
  const phases = [
    { start: 0.0, end: 0.15, color: THEME_COLORS[currentTheme].sunrise },
    { start: 0.15, end: 0.35, color: THEME_COLORS[currentTheme].morning },
    { start: 0.35, end: 0.65, color: THEME_COLORS[currentTheme].midday },
    { start: 0.65, end: 0.85, color: THEME_COLORS[currentTheme].afternoon },
    { start: 0.85, end: 1.0, color: THEME_COLORS[currentTheme].sunset },
    { start: 1.0, end: 1.0, color: THEME_COLORS[currentTheme].night }
  ];
  
  let currentPhase, nextPhase;
  for (let i = 0; i < phases.length; i++) {
    if (progress >= phases[i].start && progress < phases[i].end) {
      currentPhase = phases[i];
      nextPhase = phases[i + 1] || phases[0];
      break;
    }
  }
  
  if (!currentPhase) {
    currentPhase = phases[phases.length - 1];
    nextPhase = phases[0];
  }
  
  const phaseProgress = (progress - currentPhase.start) / (currentPhase.end - currentPhase.start);
  
  return {
    top: lerpColor(currentPhase.color.top, nextPhase.color.top, phaseProgress),
    middle: lerpColor(currentPhase.color.middle, nextPhase.color.middle, phaseProgress),
    bottom: lerpColor(currentPhase.color.bottom, nextPhase.color.bottom, phaseProgress)
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
  if (progress > 0.85) return;
  const sunProgress = progress / 0.85;
  const sunX = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * sunProgress);
  const sunY = skyCanvas.height * 0.8 - Math.sin(sunProgress * Math.PI) * skyCanvas.height * 0.6;
  const sunSize = 40 + Math.sin(sunProgress * Math.PI) * 10;
  
  const glowGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 3);
  glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
  glowGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)');
  glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
  skyCtx.fillStyle = glowGradient;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize * 3, 0, Math.PI * 2);
  skyCtx.fill();
  
  const sunGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize);
  sunGradient.addColorStop(0, 'rgba(255, 255, 220, 1)');
  sunGradient.addColorStop(0.8, 'rgba(255, 200, 100, 1)');
  sunGradient.addColorStop(1, 'rgba(255, 150, 50, 1)');
  skyCtx.fillStyle = sunGradient;
  skyCtx.beginPath();
  skyCtx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
  skyCtx.fill();
}

function drawMoon(progress) {
  if (progress < 0.7) return;
  const moonProgress = (progress - 0.7) / 0.3;
  const moonX = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * moonProgress);
  const moonY = skyCanvas.height * 0.8 - Math.sin(moonProgress * Math.PI) * skyCanvas.height * 0.6;
  const moonSize = 35;
  
  const glowGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize * 2.5);
  glowGradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
  glowGradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.15)');
  glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
  skyCtx.fillStyle = glowGradient;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize * 2.5, 0, Math.PI * 2);
  skyCtx.fill();
  
  const moonGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize);
  moonGradient.addColorStop(0, 'rgba(240, 240, 255, 1)');
  moonGradient.addColorStop(0.7, 'rgba(200, 200, 230, 1)');
  moonGradient.addColorStop(1, 'rgba(150, 150, 200, 1)');
  skyCtx.fillStyle = moonGradient;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
  skyCtx.fill();
  
  skyCtx.fillStyle = 'rgba(180, 180, 210, 0.3)';
  skyCtx.beginPath();
  skyCtx.arc(moonX - 8, moonY - 5, 5, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.beginPath();
  skyCtx.arc(moonX + 5, moonY + 8, 4, 0, Math.PI * 2);
  skyCtx.fill();
  skyCtx.beginPath();
  skyCtx.arc(moonX + 10, moonY - 3, 3, 0, Math.PI * 2);
  skyCtx.fill();
}

function drawStars(progress) {
  if (progress < 0.8) return;
  const starVisibility = (progress - 0.8) / 0.2;
  
  stars.forEach(star => {
    star.opacity += star.twinkleSpeed * star.twinkleDirection;
    if (star.opacity > 1 || star.opacity < 0.2) {
      star.twinkleDirection *= -1;
    }
    skyCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity * starVisibility})`;
    skyCtx.beginPath();
    skyCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    skyCtx.fill();
  });
}

function animateSky() {
  let progress;
  if (timerState.totalTime > 0) {
    progress = 1 - (timerState.remainingTime / timerState.totalTime);
  } else {
    progress = 0;
  }
  
  const colors = getInterpolatedSkyColors(progress);
  drawSky(colors);
  drawSun(progress);
  drawMoon(progress);
  drawStars(progress);
  
  requestAnimationFrame(animateSky);
}

// ==================== PARTICLES ====================
function initParticles() {
  resizeCanvas();
  createParticles();
  animateParticles();
}

function resizeCanvas() {
  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      type: Math.random() > 0.5 ? 'firefly' : 'leaf'
    });
  }
}

function animateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  
  particles.forEach(particle => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    if (particle.x < -10) particle.x = particlesCanvas.width + 10;
    if (particle.x > particlesCanvas.width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = particlesCanvas.height + 10;
    if (particle.y > particlesCanvas.height + 10) particle.y = -10;
    
    particlesCtx.beginPath();
    particlesCtx.globalAlpha = particle.opacity;
    
    if (particle.type === 'firefly') {
      const gradient = particlesCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 150, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
      particlesCtx.fillStyle = gradient;
      particlesCtx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
    } else {
      particlesCtx.fillStyle = isDarkMode ? 'rgba(100, 150, 100, 0.6)' : 'rgba(80, 120, 80, 0.6)';
      particlesCtx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
    }
    particlesCtx.fill();
    
    if (particle.type === 'firefly') {
      particle.opacity += (Math.random() - 0.5) * 0.1;
      particle.opacity = Math.max(0.2, Math.min(0.7, particle.opacity));
    }
  });
  
  particlesCtx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
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
  if (isOledMode) document.body.classList.add('oled-mode');
  if (highContrast) document.body.classList.add('high-contrast');
  if (options.focusMode) document.body.classList.add('focus-mode');
  
  volumeSlider.value = soundSettings.volume * 100;
  
  // Set active theme
  themeOptions.forEach(btn => {
    const isActive = btn.dataset.theme === currentTheme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });
  
  // Set active preset
  presetBtns.forEach(btn => {
    const minutes = timerState.totalTime / 60000;
    btn.setAttribute('aria-pressed', (parseInt(btn.dataset.minutes) === minutes).toString());
  });
  
  updateThemeColors();
  initParticles();
  initSky();
  initCelebrationCanvas();
  renderTasks();
  renderAchievements();
  updateXP();
  updateDisplay();
  updateProgress();
  updateCycle();
  updateStats();
  updateWeeklyChart();
  updateDynamicThemeColors();
  
  // Start button
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
  
  // Theme toggle
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
  
  // Volume slider
  volumeSlider.addEventListener('input', (e) => {
    soundSettings.volume = e.target.value / 100;
    saveToStorage();
  });
  
  // Test sound button
  testSoundBtn.addEventListener('click', playAlarm);
  
  // Options toggle
  optionsToggle.addEventListener('click', toggleOptionsList);
  
  // High contrast toggle
  highContrastToggle.addEventListener('change', (e) => {
    highContrast = e.target.checked;
    toggleHighContrast();
  });
  
  // Focus mode toggle
  focusModeToggle.addEventListener('change', (e) => {
    options.focusMode = e.target.checked;
    toggleFocusMode();
  });
  
  // OLED mode toggle
  oledToggle.addEventListener('change', (e) => {
    isOledMode = e.target.checked;
    toggleOledMode();
  });
  
  // Breathing toggle
  breathingToggle.addEventListener('change', (e) => {
    options.breathingEnabled = e.target.checked;
    saveToStorage();
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
  
  // Session notes
  saveNotesBtn.addEventListener('click', saveNotes);
  
  // Breathing exercise
  skipBreathingBtn.addEventListener('click', skipBreathingExercise);
  
  // Ambient sound volumes
  whiteNoiseVolume.addEventListener('input', (e) => {
    soundSettings.whiteNoiseVolume = parseInt(e.target.value);
    updateAmbientVolumes();
    if (soundSettings.whiteNoiseVolume > 0 && !whiteNoiseNode) {
      createWhiteNoise();
    }
    saveToStorage();
  });
  
  rainVolume.addEventListener('input', (e) => {
    soundSettings.rainVolume = parseInt(e.target.value);
    updateAmbientVolumes();
    if (soundSettings.rainVolume > 0 && !rainNode) {
      createRainSound();
    }
    saveToStorage();
  });
  
  cafeVolume.addEventListener('input', (e) => {
    soundSettings.cafeVolume = parseInt(e.target.value);
    saveToStorage();
  });
  
  lofiVolume.addEventListener('input', (e) => {
    soundSettings.lofiVolume = parseInt(e.target.value);
    saveToStorage();
  });
  
  // Achievement modal
  closeAchievement.addEventListener('click', hideAchievementModal);
  
  // Multiplayer controls
  createRoomBtn.addEventListener('click', createRoom);
  joinRoomBtn.addEventListener('click', joinRoom);
  copyRoomIdBtn.addEventListener('click', copyRoomId);
  leaveRoomBtn.addEventListener('click', leaveRoom);
  
  // Settings button
  settingsBtn.addEventListener('click', () => {
    optionsToggle.click();
    document.querySelector('.options-section').scrollIntoView({ behavior: 'smooth' });
  });
  
  // Shortcuts button
  shortcutsBtn.addEventListener('click', showShortcuts);
  
  // Onboarding modal
  closeOnboarding.addEventListener('click', hideOnboarding);
  startJourneyBtn.addEventListener('click', hideOnboarding);
  
  // Shortcuts modal
  closeShortcuts.addEventListener('click', hideShortcuts);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA'
    );
    
    if (isInputFocused && e.code !== 'Escape') return;
    
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      requestNotificationPermission();
      if (timerState.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
    if (e.code === 'KeyR') {
      e.preventDefault();
      resetTimer();
    }
    if (e.code === 'KeyT') {
      e.preventDefault();
      toggleTheme();
    }
    if (e.code === 'KeyS') {
      e.preventDefault();
      skipTimer();
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      hideOnboarding();
      hideShortcuts();
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    resizeSkyCanvas();
    resizeCelebrationCanvas();
    createStars();
  });
  
  // Close modals when clicking outside
  [onboardingModal, shortcutsModal, achievementModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideOnboarding();
        hideShortcuts();
        hideAchievementModal();
      }
    });
  });
});

// ==================== MULTIPLAYER FUNCTIONS ====================
function createRoom() {
  const roomId = generateRoomId();
  multiplayerState.roomId = roomId;
  multiplayerState.isHost = true;
  multiplayerState.members = [{ name: 'You', status: 'working' }];
  
  currentRoomIdDisplay.textContent = roomId;
  roomInfo.classList.remove('hidden');
  
  // Copy room link to clipboard
  const roomLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
  navigator.clipboard.writeText(roomLink).then(() => {
    const btn = copyRoomIdBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
  
  saveToStorage();
  renderRoomMembers();
}

function joinRoom() {
  const roomId = roomIdInput.value.trim();
  if (!roomId) return;
  
  multiplayerState.roomId = roomId;
  multiplayerState.isHost = false;
  multiplayerState.members = [
    { name: 'You', status: 'working' },
    { name: 'Friend', status: 'working' }
  ];
  
  currentRoomIdDisplay.textContent = roomId;
  roomInfo.classList.remove('hidden');
  
  saveToStorage();
  renderRoomMembers();
}

function copyRoomId() {
  const roomLink = `${window.location.origin}${window.location.pathname}?room=${multiplayerState.roomId}`;
  navigator.clipboard.writeText(roomLink).then(() => {
    const btn = copyRoomIdBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function leaveRoom() {
  multiplayerState.roomId = null;
  multiplayerState.members = [];
  roomInfo.classList.add('hidden');
  saveToStorage();
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function renderRoomMembers() {
  roomMembers.innerHTML = '';
  multiplayerState.members.forEach(member => {
    const div = document.createElement('div');
    div.className = 'room-member';
    div.innerHTML = `
      <span class="member-status ${member.status}"></span>
      <span class="member-name">${member.name}</span>
    `;
    roomMembers.appendChild(div);
  });
}

// Check for room in URL
function checkRoomInUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  if (roomId) {
    roomIdInput.value = roomId;
    joinRoom();
  }
}

// Call this on page load
checkRoomInUrl();