// Pomodoro Prime - Consolidated & Improved JavaScript
// Features: Gamification, XP system, achievements, ambient sounds, multiplayer, PWA

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
  weeklyData: {} // Store daily focus hours: { 'YYYY-MM-DD': minutes }
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
let savedNotes = [];

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

// New DOM elements
let xpLevel, xpBar, xpText, achievementsGrid;
let sessionNotesInput, saveNotesBtn, taskPomodoros;
let breathingSection, breathingCircle, breathingText, skipBreathingBtn;
let oledToggle, breathingToggle;
let whiteNoiseVolume, rainVolume, cafeVolume, lofiVolume;
let createRoomBtn, roomIdInput, joinRoomBtn, roomInfo, currentRoomIdDisplay, copyRoomIdBtn, leaveRoomBtn, roomMembers;
let achievementModal, closeAchievement, achievementIcon, achievementName, achievementDesc, xpGain;
let celebrationCanvas, celebrationCtx;
let weeklyChart;

// Audio Nodes
let whiteNoiseNode, rainNode, whiteNoiseGain, rainGain;

// ==================== THEME COLORS ====================
const THEME_COLORS = {
  forest: {
    sunrise: { top: [135, 206, 235], middle: [255, 183, 77], bottom: [255, 127, 80] },
    morning: { top: [135, 206, 235], middle: [176, 224, 230], bottom: [255, 255, 255] },
    midday: { top: [70, 130, 180], middle: [135, 206, 235], bottom: [173, 216, 230] },
    afternoon: { top: [100, 149, 237], middle: [255, 218, 185], bottom: [255, 160, 122] },
    sunset: { top: [72, 61, 139], middle: [255, 140, 0], bottom: [255, 69, 0] },
    night: { top: [10, 10, 30], middle: [20, 20, 50], bottom: [30, 30, 70] },
    focus: '#2D5A27', focusLight: '#4A7C43', short: '#5D8A66', shortLight: '#8AB896', long: '#8B7355', longLight: '#B8A99A'
  },
  ocean: {
    sunrise: { top: [135, 206, 250], middle: [255, 200, 150], bottom: [255, 150, 100] },
    morning: { top: [135, 206, 250], middle: [173, 216, 230], bottom: [240, 248, 255] },
    midday: { top: [30, 144, 255], middle: [135, 206, 250], bottom: [173, 216, 230] },
    afternoon: { top: [65, 105, 225], middle: [255, 200, 150], bottom: [255, 150, 100] },
    sunset: { top: [25, 25, 112], middle: [255, 140, 0], bottom: [255, 100, 50] },
    night: { top: [10, 10, 40], middle: [20, 30, 60], bottom: [30, 50, 80] },
    focus: '#1E90FF', focusLight: '#4169E1', short: '#20B2AA', shortLight: '#5DADE2', long: '#008B8B', longLight: '#48D1CC'
  },
  mountain: {
    sunrise: { top: [176, 196, 222], middle: [255, 218, 185], bottom: [210, 180, 140] },
    morning: { top: [176, 196, 222], middle: [230, 230, 250], bottom: [255, 250, 250] },
    midday: { top: [135, 206, 235], middle: [176, 196, 222], bottom: [200, 200, 220] },
    afternoon: { top: [119, 136, 153], middle: [255, 218, 185], bottom: [210, 180, 140] },
    sunset: { top: [47, 79, 79], middle: [255, 140, 0], bottom: [210, 105, 30] },
    night: { top: [15, 15, 25], middle: [25, 25, 40], bottom: [40, 40, 60] },
    focus: '#6B8E23', focusLight: '#8B9A46', short: '#8B4513', shortLight: '#CD853F', long: '#556B2F', longLight: '#8B7355'
  },
  space: {
    sunrise: { top: [75, 0, 130], middle: [255, 100, 100], bottom: [255, 150, 150] },
    morning: { top: [75, 0, 130], middle: [147, 112, 219], bottom: [186, 85, 211] },
    midday: { top: [25, 25, 112], middle: [75, 0, 130], bottom: [147, 112, 219] },
    afternoon: { top: [72, 61, 139], middle: [255, 100, 100], bottom: [255, 150, 150] },
    sunset: { top: [0, 0, 0], middle: [255, 100, 100], bottom: [255, 50, 50] },
    night: { top: [5, 5, 15], middle: [10, 10, 25], bottom: [20, 20, 35] },
    focus: '#9400D3', focusLight: '#BA55D3', short: '#FF6347', shortLight: '#FFA07A', long: '#32CD32', longLight: '#90EE90'
  }
};

// ==================== LOCAL STORAGE ====================
function saveToStorage() {
  const data = {
    timerState: { mode: timerState.mode, totalTime: timerState.totalTime, remainingTime: timerState.remainingTime, cycle: timerState.cycle },
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
  
  // New DOM elements
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
  celebrationCanvas = document.getElementById('celebrationCanvas');
  if(celebrationCanvas) celebrationCtx = celebrationCanvas.getContext('2d');
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
  } else {
    startBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">▶</span><span class="btn-text">Start</span>';
    startBtn.classList.remove('btn-secondary');
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
  
  if (currentLevelData) xpLevel.textContent = `Level ${xpState.level}: ${currentLevelData.name}`;
  
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
  const nextLevelData = LEVELS.find(l => l.level === xpState.level + 1);
  if (nextLevelData && xpState.xp >= nextLevelData.xpRequired) {
    xpState.level++;
    showAchievementModal({ icon: '⬆️', name: `Level Up!`, desc: `You are now Level ${xpState.level}: ${nextLevelData.name}`, xp: 0 });
  }
  updateXP();
  saveToStorage();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.unlocked) return;
    let unlocked = false;
    
    if (achievement.id === 'first_pomodoro') unlocked = statsState.pomodoros >= 1;
    else if (achievement.id === 'streak_3') unlocked = statsState.streak >= 3;
    else if (achievement.id === 'streak_7') unlocked = statsState.streak >= 7;
    else if (achievement.id === 'streak_30') unlocked = statsState.streak >= 30;
    // Deep work: check if just finished the 4th pomodoro
    else if (achievement.id === 'deep_work_4') unlocked = statsState.pomodoros >= 4 && timerState.cycle === 4; 
    else if (achievement.id === 'pomodoro_10') unlocked = statsState.pomodoros >= 10;
    else if (achievement.id === 'pomodoro_50') unlocked = statsState.pomodoros >= 50;
    else if (achievement.id === 'pomodoro_100') unlocked = statsState.pomodoros >= 100;
    else if (achievement.id === 'focus_hour') unlocked = statsState.focusTime >= 60;
    else if (achievement.id === 'focus_5hours') unlocked = statsState.focusTime >= 300;
    else if (achievement.id === 'level_5') unlocked = xpState.level >= 5;
    else if (achievement.id === 'level_10') unlocked = xpState.level >= 10;
    
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
    div.innerHTML = `<span class="achievement-icon">${achievement.icon}</span><span class="achievement-name">${achievement.name}</span>`;
    div.title = achievement.desc;
    achievementsGrid.appendChild(div);
  });
}

function showAchievementModal(achievement) {
  achievementIcon.textContent = achievement.icon;
  achievementName.textContent = achievement.name;
  achievementDesc.textContent = achievement.desc;
  xpGain.textContent = achievement.xp > 0 ? `+${achievement.xp} XP` : '';
  achievementModal.setAttribute('aria-hidden', 'false');
  setTimeout(hideAchievementModal, 5000);
}

function hideAchievementModal() { achievementModal.setAttribute('aria-hidden', 'true'); }

// ==================== AUDIO FUNCTIONS ====================
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
}

function playWorkStartSound() {
  try {
    initAudioContext();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioContext.currentTime);
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2 * soundSettings.volume, audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
  } catch (e) { console.log('Audio error:', e); }
}

function playBreakStartSound() {
  try {
    initAudioContext();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime);
    osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
    osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2 * soundSettings.volume, audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
  } catch (e) { console.log('Audio error:', e); }
}

function playTimerFinishedSound() {
  try {
    initAudioContext();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.25 * soundSettings.volume, audioContext.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
      osc.start(audioContext.currentTime + i * 0.15);
      osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) { console.log('Audio error:', e); }
}

function playTick() {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioContext.currentTime);
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.05 * soundSettings.volume, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}

// Ambient Sounds
function createWhiteNoise() {
  if (whiteNoiseNode) return;
  initAudioContext();
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
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
  if (rainNode) return;
  initAudioContext();
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
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

// ==================== NOTIFICATIONS ====================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: '🌲', badge: '🌲' });
  }
}

// ==================== TIMER FUNCTIONS ====================
function onTimerComplete() {
  playTimerFinishedSound();
  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
  
  let notificationTitle, notificationBody;
  if (timerState.mode === 'focus') {
    notificationTitle = '🌲 Focus Complete!';
    notificationBody = 'Great work! Time for a break.';
    
    // Stats
    statsState.pomodoros++;
    const mins = Math.round(timerState.totalTime / 60000);
    statsState.focusTime += mins;
    
    // Weekly Data Update
    const todayKey = new Date().toISOString().slice(0, 10);
    statsState.weeklyData[todayKey] = (statsState.weeklyData[todayKey] || 0) + mins;
    
    addXP(10);
    triggerCelebration();
    checkAchievements();
    updateWeeklyChart();
    
    // Streak Logic
    const today = new Date().toDateString();
    if (statsState.lastSessionDate !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (statsState.lastSessionDate === yesterday.toDateString() || !statsState.lastSessionDate) statsState.streak++;
      else statsState.streak = 1;
      statsState.lastSessionDate = today;
    }
    updateStats();
  } else {
    notificationTitle = timerState.mode === 'short' ? '🌿 Break Over!' : '🍃 Long Break Over!';
    notificationBody = 'Ready to focus again?';
  }
  
  showBrowserNotification(notificationTitle, notificationBody);
  saveToStorage();
  
  let nextMode;
  if (timerState.mode === 'focus') {
    timerState.cycle++;
    if (timerState.cycle > 4) { timerState.cycle = 1; nextMode = 'long'; } 
    else nextMode = 'short';
  } else nextMode = 'focus';
  
  setTimeout(() => {
    if (options.autoStart) { setMode(nextMode); startTimer(); } 
    else { setMode(nextMode); if (nextMode !== 'focus') startBreathingExercise(); }
  }, 2000);
}

function setMode(mode) {
  timerState.mode = mode;
  timerState.totalTime = DURATIONS[mode];
  timerState.remainingTime = timerState.totalTime;
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  updateTimerType(); updateDisplay(); updateProgress(); updateCycle(); updateModeButtons(); updateButtons(); updateDynamicThemeColors();
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
  if (timerState.mode === 'focus') playWorkStartSound(); else playBreakStartSound();
  stopBreathingExercise();
  
  let lastMinute = Math.floor(timerState.remainingTime / 60000);
  timerState.interval = setInterval(() => {
    const elapsed = Date.now() - timerState.startTime;
    timerState.remainingTime = Math.max(0, timerState.totalTime - elapsed);
    updateDisplay(); updateProgress();
    if (soundSettings.tickEnabled) {
      const currentMinute = Math.floor(timerState.remainingTime / 60000);
      if (currentMinute !== lastMinute && currentMinute >= 0) { playTick(); lastMinute = currentMinute; }
    }
    if (timerState.remainingTime <= 0) { clearInterval(timerState.interval); onTimerComplete(); }
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
  updateDisplay(); updateProgress(); updateButtons();
  saveToStorage();
}

function skipTimer() {
  pauseTimer();
  const modes = ['focus', 'short', 'long'];
  const currentIndex = modes.indexOf(timerState.mode);
  const nextIndex = (currentIndex + 1) % modes.length;
  setMode(modes[nextIndex]);
}

function setCustomDuration(minutes) {
  timerState.totalTime = minutes * 60 * 1000;
  timerState.remainingTime = timerState.totalTime;
  timerState.mode = 'focus';
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  updateTimerType(); updateDisplay(); updateProgress(); updateButtons();
  saveToStorage();
}

// ==================== TASK FUNCTIONS ====================
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
      ${task.estimatedPomodoros ? `<span class="task-pomodoros">🍅 ${task.estimatedPomodoros}</span>` : ''}
      <button class="task-delete">✕</button>`;
    taskList.appendChild(li);
  });
  document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.closest('.task-item').dataset.index);
      tasks[index].completed = !tasks[index].completed;
      renderTasks(); saveToStorage();
    });
  });
  document.querySelectorAll('.task-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      tasks.splice(parseInt(e.target.closest('.task-item').dataset.index), 1);
      renderTasks(); saveToStorage();
    });
  });
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

function addTask() {
  const text = newTaskInput.value.trim();
  const pomodoros = parseInt(taskPomodoros.value) || 1;
  if (!text) return;
  tasks.push({ text, completed: false, estimatedPomodoros: pomodoros, createdAt: Date.now() });
  newTaskInput.value = ''; taskPomodoros.value = '';
  renderTasks(); saveToStorage();
}

// ==================== THEME & OPTIONS ====================
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeToggleBtn.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
  saveToStorage();
}

function setTheme(theme) {
  currentTheme = theme;
  updateThemeColors();
  themeOptions.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
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
  breathingPhase = 0; updateBreathingText();
  breathingInterval = setInterval(() => {
    breathingPhase = (breathingPhase + 1) % breathingPhases.length;
    updateBreathingText();
  }, 4000);
}

function stopBreathingExercise() {
  if (breathingInterval) clearInterval(breathingInterval);
  breathingSection.classList.add('hidden');
}

function updateBreathingText() { breathingText.textContent = breathingPhases[breathingPhase]; }

// ==================== SESSION NOTES ====================
function saveNotes() {
  const notes = sessionNotesInput.value.trim();
  if (!notes) return;
  savedNotes.push({ date: new Date().toISOString(), notes, duration: Math.round((timerState.totalTime - timerState.remainingTime) / 60000) });
  sessionNotesInput.value = ''; saveToStorage();
  saveNotesBtn.textContent = 'Saved!'; setTimeout(() => saveNotesBtn.textContent = 'Save Notes', 2000);
}

// ==================== CELEBRATION PARTICLES ====================
let celebrationParticles = [];
function initCelebrationCanvas() { if (celebrationCanvas) { resizeCelebrationCanvas(); } }
function resizeCelebrationCanvas() { if (celebrationCanvas) { celebrationCanvas.width = window.innerWidth; celebrationCanvas.height = window.innerHeight; } }
function createCelebrationParticles() {
  celebrationParticles = [];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  for (let i = 0; i < 100; i++) celebrationParticles.push({
    x: window.innerWidth / 2, y: window.innerHeight / 2,
    vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15 - 5,
    size: Math.random() * 8 + 2, color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1, decay: Math.random() * 0.02 + 0.01
  });
}
function animateCelebration() {
  if (celebrationParticles.length === 0) { celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height); return; }
  celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
  celebrationParticles.forEach((p, index) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.alpha -= p.decay;
    if (p.alpha <= 0) { celebrationParticles.splice(index, 1); return; }
    celebrationCtx.beginPath();
    celebrationCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    celebrationCtx.fillStyle = p.color;
    celebrationCtx.globalAlpha = p.alpha;
    celebrationCtx.fill();
  });
  celebrationCtx.globalAlpha = 1;
  requestAnimationFrame(animateCelebration);
}
function triggerCelebration() { createCelebrationParticles(); animateCelebration(); }

// ==================== WEEKLY CHART ====================
let weeklyChartInstance = null;
function initWeeklyChart() {
  if (!weeklyChart) return;
  const data = getLast7DaysData();
  if (weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance = new Chart(weeklyChart, {
    type: 'bar',
    data: { labels: data.labels, datasets: [{ label: 'Focus Hours', data: data.data, backgroundColor: 'rgba(45, 90, 39, 0.7)', borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
  });
}

function getLast7DaysData() {
  const labels = [], data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    const key = date.toISOString().slice(0, 10);
    data.push(((statsState.weeklyData[key] || 0) / 60).toFixed(1)); // Convert minutes to hours
  }
  return { labels, data };
}

function updateWeeklyChart() { initWeeklyChart(); }

function updateDynamicThemeColors() {
  const colors = THEME_COLORS[currentTheme];
  if (timerState.mode === 'focus') { document.documentElement.style.setProperty('--color-focus', colors.focus); }
  else if (timerState.mode === 'short') { document.documentElement.style.setProperty('--color-focus', colors.short); }
  else { document.documentElement.style.setProperty('--color-focus', colors.long); }
}

// ==================== MODALS ====================
function showOnboarding() { onboardingModal.setAttribute('aria-hidden', 'false'); }
function hideOnboarding() { onboardingModal.setAttribute('aria-hidden', 'true'); localStorage.setItem('pomodoroPrimeVisited', 'true'); }
function showShortcuts() { shortcutsModal.setAttribute('aria-hidden', 'false'); }
function hideShortcuts() { shortcutsModal.setAttribute('aria-hidden', 'true'); }
function toggleOptionsList() {
  const isExpanded = optionsToggle.getAttribute('aria-expanded') === 'true';
  optionsToggle.setAttribute('aria-expanded', (!isExpanded).toString());
  optionsList.hidden = isExpanded;
}

// ==================== SKY ANIMATION ====================
function initSky() { resizeSkyCanvas(); createStars(); animateSky(); }
function resizeSkyCanvas() { skyCanvas.width = window.innerWidth; skyCanvas.height = window.innerHeight; }
function createStars() {
  stars = [];
  for (let i = 0; i < 100; i++) stars.push({
    x: Math.random() * skyCanvas.width, y: Math.random() * skyCanvas.height * 0.6,
    size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.8 + 0.2, twinkleSpeed: Math.random() * 0.05 + 0.02, twinkleDir: Math.random() > 0.5 ? 1 : -1
  });
}
function lerpColor(c1, c2, t) { return [Math.round(c1[0] + (c2[0] - c1[0]) * t), Math.round(c1[1] + (c2[1] - c1[1]) * t), Math.round(c1[2] + (c2[2] - c1[2]) * t)]; }
function getInterpolatedSkyColors(progress) {
  const phases = [
    { start: 0.0, end: 0.15, color: THEME_COLORS[currentTheme].sunrise },
    { start: 0.15, end: 0.35, color: THEME_COLORS[currentTheme].morning },
    { start: 0.35, end: 0.65, color: THEME_COLORS[currentTheme].midday },
    { start: 0.65, end: 0.85, color: THEME_COLORS[currentTheme].afternoon },
    { start: 0.85, end: 1.0, color: THEME_COLORS[currentTheme].sunset },
    { start: 1.0, end: 1.0, color: THEME_COLORS[currentTheme].night }
  ];
  let curr = phases[0], next = phases[1];
  for (let i = 0; i < phases.length; i++) if (progress >= phases[i].start && progress < phases[i].end) { curr = phases[i]; next = phases[i + 1] || phases[0]; break; }
  const t = (progress - curr.start) / (curr.end - curr.start) || 0;
  return { top: lerpColor(curr.color.top, next.color.top, t), middle: lerpColor(curr.color.middle, next.color.middle, t), bottom: lerpColor(curr.color.bottom, next.color.bottom, t) };
}
function drawSky(colors) {
  const grad = skyCtx.createLinearGradient(0, 0, 0, skyCanvas.height);
  grad.addColorStop(0, `rgb(${colors.top.join(',')})`); grad.addColorStop(0.5, `rgb(${colors.middle.join(',')})`); grad.addColorStop(1, `rgb(${colors.bottom.join(',')})`);
  skyCtx.fillStyle = grad; skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
}
function drawSun(p) {
  if (p > 0.85) return;
  const prog = p / 0.85;
  const x = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * prog);
  const y = skyCanvas.height * 0.8 - Math.sin(prog * Math.PI) * skyCanvas.height * 0.6;
  const size = 40 + Math.sin(prog * Math.PI) * 10;
  const glow = skyCtx.createRadialGradient(x, y, 0, x, y, size * 3); glow.addColorStop(0, 'rgba(255,255,200,0.4)'); glow.addColorStop(1, 'rgba(255,150,50,0)');
  skyCtx.fillStyle = glow; skyCtx.beginPath(); skyCtx.arc(x, y, size * 3, 0, Math.PI * 2); skyCtx.fill();
  const sun = skyCtx.createRadialGradient(x, y, 0, x, y, size); sun.addColorStop(0, 'rgba(255,255,220,1)'); sun.addColorStop(1, 'rgba(255,150,50,1)');
  skyCtx.fillStyle = sun; skyCtx.beginPath(); skyCtx.arc(x, y, size, 0, Math.PI * 2); skyCtx.fill();
}
function drawMoon(p) {
  if (p < 0.7) return;
  const prog = (p - 0.7) / 0.3;
  const x = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * prog);
  const y = skyCanvas.height * 0.8 - Math.sin(prog * Math.PI) * skyCanvas.height * 0.6;
  const size = 35;
  const glow = skyCtx.createRadialGradient(x, y, 0, x, y, size * 2.5); glow.addColorStop(0, 'rgba(200,220,255,0.3)'); glow.addColorStop(1, 'rgba(100,150,255,0)');
  skyCtx.fillStyle = glow; skyCtx.beginPath(); skyCtx.arc(x, y, size * 2.5, 0, Math.PI * 2); skyCtx.fill();
  skyCtx.fillStyle = '#F0F4F8'; skyCtx.beginPath(); skyCtx.arc(x, y, size, 0, Math.PI * 2); skyCtx.fill();
}
function drawStars(p) {
  if (p < 0.8) return;
  const vis = (p - 0.8) / 0.2;
  stars.forEach(s => {
    s.opacity += s.twinkleSpeed * s.twinkleDir;
    if (s.opacity > 1 || s.opacity < 0.2) s.twinkleDir *= -1;
    skyCtx.fillStyle = `rgba(255,255,255,${s.opacity * vis})`;
    skyCtx.beginPath(); skyCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2); skyCtx.fill();
  });
}
function animateSky() {
  const progress = timerState.totalTime > 0 ? 1 - (timerState.remainingTime / timerState.totalTime) : 0;
  const colors = getInterpolatedSkyColors(progress);
  drawSky(colors); drawSun(progress); drawMoon(progress); drawStars(progress);
  requestAnimationFrame(animateSky);
}

// ==================== PARTICLES ====================
function initParticles() { resizeCanvas(); createParticles(); animateParticles(); }
function resizeCanvas() { particlesCanvas.width = window.innerWidth; particlesCanvas.height = window.innerHeight; }
function createParticles() {
  particles = [];
  for (let i = 0; i < 30; i++) particles.push({
    x: Math.random() * particlesCanvas.width, y: Math.random() * particlesCanvas.height,
    size: Math.random() * 4 + 2, speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.2, type: Math.random() > 0.5 ? 'firefly' : 'leaf'
  });
}
function animateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
  particles.forEach(p => {
    p.x += p.speedX; p.y += p.speedY;
    if (p.x < -10) p.x = particlesCanvas.width + 10; if (p.x > particlesCanvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = particlesCanvas.height + 10; if (p.y > particlesCanvas.height + 10) p.y = -10;
    particlesCtx.beginPath(); particlesCtx.globalAlpha = p.opacity;
    if (p.type === 'firefly') {
      const grad = particlesCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      grad.addColorStop(0, 'rgba(255,255,150,0.8)'); grad.addColorStop(1, 'rgba(255,255,150,0)');
      particlesCtx.fillStyle = grad; particlesCtx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    } else {
      particlesCtx.fillStyle = isDarkMode ? 'rgba(100,150,100,0.6)' : 'rgba(80,120,80,0.6)';
      particlesCtx.ellipse(p.x, p.y, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    }
    particlesCtx.fill();
  });
  particlesCtx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

// ==================== MULTIPLAYER (Simulated) ====================
function createRoom() {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  multiplayerState = { roomId, isHost: true, members: [{ name: 'You', status: 'working' }] };
  currentRoomIdDisplay.textContent = roomId;
  roomInfo.classList.remove('hidden');
  navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`);
  saveToStorage(); renderRoomMembers();
}
function joinRoom() {
  const roomId = roomIdInput.value.trim();
  if (!roomId) return;
  multiplayerState = { roomId, isHost: false, members: [{ name: 'You', status: 'working' }, { name: 'Partner', status: 'working' }] };
  currentRoomIdDisplay.textContent = roomId;
  roomInfo.classList.remove('hidden');
  saveToStorage(); renderRoomMembers();
}
function leaveRoom() { multiplayerState = { roomId: null, members: [], isHost: false }; roomInfo.classList.add('hidden'); saveToStorage(); }
function renderRoomMembers() {
  roomMembers.innerHTML = '';
  multiplayerState.members.forEach(m => {
    const div = document.createElement('div');
    div.className = 'room-member';
    div.innerHTML = `<span class="member-status ${m.status}"></span><span class="member-name">${m.name}</span>`;
    roomMembers.appendChild(div);
  });
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  loadFromStorage();
  
  // Apply saved settings
  document.body.classList.toggle('dark-mode', isDarkMode);
  document.body.classList.toggle('oled-mode', isOledMode);
  document.body.classList.toggle('high-contrast', highContrast);
  document.body.classList.toggle('focus-mode', options.focusMode);
  if (themeToggleBtn) themeToggleBtn.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
  volumeSlider.value = soundSettings.volume * 100;
  
  // Init UI
  updateThemeColors();
  initParticles(); initSky(); initCelebrationCanvas();
  renderTasks(); renderAchievements(); updateXP(); updateDisplay(); updateProgress(); updateCycle(); updateStats(); updateWeeklyChart(); updateDynamicThemeColors();
  
  // Check URL for room
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('room')) { roomIdInput.value = urlParams.get('room'); joinRoom(); }

  // Listeners
  startBtn.addEventListener('click', () => { requestNotificationPermission(); timerState.isRunning ? pauseTimer() : startTimer(); });
  resetBtn.addEventListener('click', resetTimer);
  skipBtn.addEventListener('click', skipTimer);
  modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  themeToggleBtn.addEventListener('click', toggleTheme);
  presetBtns.forEach(btn => btn.addEventListener('click', () => setCustomDuration(parseInt(btn.dataset.minutes))));
  customDurationBtn.addEventListener('click', () => { const m = parseInt(customMinutes.value); if (m > 0) setCustomDuration(m); });
  volumeSlider.addEventListener('input', (e) => { soundSettings.volume = e.target.value / 100; saveToStorage(); });
  testSoundBtn.addEventListener('click', playTimerFinishedSound);
  optionsToggle.addEventListener('click', toggleOptionsList);
  highContrastToggle.addEventListener('change', (e) => { highContrast = e.target.checked; toggleHighContrast(); });
  focusModeToggle.addEventListener('change', (e) => { options.focusMode = e.target.checked; toggleFocusMode(); });
  oledToggle.addEventListener('change', (e) => { isOledMode = e.target.checked; toggleOledMode(); });
  breathingToggle.addEventListener('change', (e) => { options.breathingEnabled = e.target.checked; saveToStorage(); });
  themeOptions.forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
  addTaskBtn.addEventListener('click', addTask);
  newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
  saveNotesBtn.addEventListener('click', saveNotes);
  skipBreathingBtn.addEventListener('click', stopBreathingExercise);
  
  // Ambient listeners
  whiteNoiseVolume.addEventListener('input', (e) => { soundSettings.whiteNoiseVolume = parseInt(e.target.value); updateAmbientVolumes(); if (soundSettings.whiteNoiseVolume > 0 && !whiteNoiseNode) createWhiteNoise(); saveToStorage(); });
  rainVolume.addEventListener('input', (e) => { soundSettings.rainVolume = parseInt(e.target.value); updateAmbientVolumes(); if (soundSettings.rainVolume > 0 && !rainNode) createRainSound(); saveToStorage(); });
  
  // Modals & Multiplayer
  closeAchievement.addEventListener('click', hideAchievementModal);
  createRoomBtn.addEventListener('click', createRoom);
  joinRoomBtn.addEventListener('click', joinRoom);
  copyRoomIdBtn.addEventListener('click', () => navigator.clipboard.writeText(`${window.location.origin}?room=${multiplayerState.roomId}`));
  leaveRoomBtn.addEventListener('click', leaveRoom);
  settingsBtn.addEventListener('click', () => { optionsToggle.click(); document.querySelector('.options-section').scrollIntoView({ behavior: 'smooth' }); });
  shortcutsBtn.addEventListener('click', showShortcuts);
  closeOnboarding.addEventListener('click', hideOnboarding);
  startJourneyBtn.addEventListener('click', hideOnboarding);
  closeShortcuts.addEventListener('click', hideShortcuts);
  
  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); requestNotificationPermission(); timerState.isRunning ? pauseTimer() : startTimer(); }
    if (e.code === 'KeyR') { e.preventDefault(); resetTimer(); }
    if (e.code === 'KeyT') { e.preventDefault(); toggleTheme(); }
    if (e.code === 'KeyS') { e.preventDefault(); skipTimer(); }
    if (e.code === 'Escape') { hideOnboarding(); hideShortcuts(); hideAchievementModal(); }
  });
  
  window.addEventListener('resize', () => { resizeCanvas(); resizeSkyCanvas(); resizeCelebrationCanvas(); createStars(); });
  [onboardingModal, shortcutsModal, achievementModal].forEach(m => m.addEventListener('click', (e) => { if (e.target === m) { hideOnboarding(); hideShortcuts(); hideAchievementModal(); } }));
});