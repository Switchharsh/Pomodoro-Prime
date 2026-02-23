// Pomodoro Prime - Enhanced JavaScript with All Features
// localStorage persistence, task management, multiple themes, ambient sounds
// ADHD-friendly: Simple, focused, minimal distractions

// ==================== STATE MANAGEMENT ====================

// Timer State
let timerState = {
    isRunning: false,
    mode: 'focus', // 'focus', 'short', 'long'
    remainingTime: 25 * 60 * 1000, // milliseconds
    totalTime: 25 * 60 * 1000,
    cycle: 1,
    interval: null,
    startTime: null
};

// Statistics State
let statsState = {
    pomodoros: 0,
    focusTime: 0, // in minutes
    streak: 0,
    lastSessionDate: null
};

// Sound Settings
let soundSettings = {
    volume: 0.5,
    soundType: 'chime', // 'chime', 'birds', 'rain', 'stream'
    ambientEnabled: false,
    tickEnabled: false
};

// Theme Settings
let currentTheme = 'forest'; // 'forest', 'ocean', 'mountain', 'space'
let isDarkMode = false;
let highContrast = false;

// Options
let options = {
    autoStart: false,
    skipBreaks: false
};

// Tasks
let tasks = [];

// Timer Durations (in milliseconds)
const DURATIONS = {
    focus: 25 * 60 * 1000,
    short: 5 * 60 * 1000,
    long: 15 * 60 * 1000
};

// ==================== DOM ELEMENTS ====================

let timerDisplay, timerType, progressBar, currentCycle, startBtn, resetBtn, skipBtn, taskInput, modeBtns;
let themeToggleBtn, presetBtns, soundBtns, volumeSlider, testSoundBtn;
let statPomodoros, statFocusTime, statStreak;
let progressPercent, timeElapsed, timeRemaining;
let customMinutes, customDurationBtn;
let newTaskInput, addTaskBtn, taskList;
let settingsBtn, shortcutsBtn;
let onboardingModal, closeOnboarding, startJourneyBtn;
let shortcutsModal, closeShortcuts;
let ambientSoundToggle, autoStartToggle, skipBreaksToggle, tickSoundToggle;
let highContrastToggle, themeOptions;
let audioContext;
let particlesCanvas, particlesCtx, particles = [];
let skyCanvas, skyCtx, stars = [];
let ambientOscillator, ambientGainNode;

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
        themeSettings: {
            currentTheme,
            isDarkMode,
            highContrast
        },
        options,
        tasks
    };
    localStorage.setItem('pomodoroPrimeData', JSON.stringify(data));
}

function loadFromStorage() {
    const saved = localStorage.getItem('pomodoroPrimeData');
    if (saved) {
        const data = JSON.parse(saved);
        
        // Restore timer state
        if (data.timerState) {
            timerState.mode = data.timerState.mode || 'focus';
            timerState.totalTime = data.timerState.totalTime || DURATIONS.focus;
            timerState.remainingTime = data.timerState.remainingTime || DURATIONS.focus;
            timerState.cycle = data.timerState.cycle || 1;
        }
        
        // Restore statistics
        if (data.statsState) {
            statsState = { ...statsState, ...data.statsState };
        }
        
        // Restore sound settings
        if (data.soundSettings) {
            soundSettings = { ...soundSettings, ...data.soundSettings };
        }
        
        // Restore theme settings
        if (data.themeSettings) {
            currentTheme = data.themeSettings.currentTheme || 'forest';
            isDarkMode = data.themeSettings.isDarkMode || false;
            highContrast = data.themeSettings.highContrast || false;
        }
        
        // Restore options
        if (data.options) {
            options = { ...options, ...data.options };
        }
        
        // Restore tasks
        if (data.tasks) {
            tasks = data.tasks;
        }
    }
    
    // Check if first-time user
    const hasVisited = localStorage.getItem('pomodoroPrimeVisited');
    if (!hasVisited) {
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
    soundBtns = document.querySelectorAll('.sound-btn');
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
    onboardingModal = document.getElementById('onboardingModal');
    closeOnboarding = document.getElementById('closeOnboarding');
    startJourneyBtn = document.getElementById('startJourneyBtn');
    shortcutsModal = document.getElementById('shortcutsModal');
    closeShortcuts = document.getElementById('closeShortcuts');
    ambientSoundToggle = document.getElementById('ambientSoundToggle');
    autoStartToggle = document.getElementById('autoStartToggle');
    skipBreaksToggle = document.getElementById('skipBreaksToggle');
    tickSoundToggle = document.getElementById('tickSoundToggle');
    highContrastToggle = document.getElementById('highContrastToggle');
    themeOptions = document.querySelectorAll('.theme-option');
    particlesCanvas = document.getElementById('particlesCanvas');
    particlesCtx = particlesCanvas.getContext('2d');
    skyCanvas = document.getElementById('skyCanvas');
    skyCtx = skyCanvas.getContext('2d');
    celestialBody = document.getElementById('celestialBody');
    celestialCircle = document.getElementById('celestialCircle');
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
    
    // Update timer info
    const elapsed = timerState.totalTime - timerState.remainingTime;
    const progress = Math.round((elapsed / timerState.totalTime) * 100);
    
    progressPercent.textContent = `${progress}%`;
    timeElapsed.textContent = formatTime(elapsed);
    timeRemaining.textContent = formatTime(timerState.remainingTime);
    
    // Countdown animation on last 10 seconds
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
    
    // Animate celestial body inside timer ring
    updateCelestialBody(progress);
}

function updateCelestialBody(progress) {
    if (!celestialBody || !celestialCircle) return;
    
    // Calculate position in a semi-circle arc (from bottom to top)
    const angle = Math.PI - (progress * Math.PI);
    const radius = 35;
    const centerX = 50;
    const centerY = 50;
    
    // Calculate position based on angle
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Move celestial body
    celestialCircle.setAttribute('cx', x.toString());
    celestialCircle.setAttribute('cy', y.toString());
    
    // Update size based on progress (sun gets bigger at midday, moon gets bigger at night)
    const size = 6 + Math.sin(progress * Math.PI) * 4;
    celestialCircle.setAttribute('r', size.toString());
}

function updateCycle() {
    currentCycle.textContent = `${timerState.cycle}/4`;
}

function updateTimerType() {
    const typeLabels = {
        focus: 'Focus',
        short: 'Short Break',
        long: 'Long Break'
    };
    timerType.textContent = typeLabels[timerState.mode];
    progressBar.setAttribute('data-mode', timerState.mode);
    timerType.setAttribute('data-mode', timerState.mode);
    
    // Update celestial body color
    if (celestialBody) {
        celestialBody.setAttribute('data-mode', timerState.mode);
    }
}

function updateButtons() {
    if (timerState.isRunning) {
        startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        startBtn.classList.add('btn-secondary');
    } else {
        startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
        startBtn.classList.remove('btn-secondary');
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

function playAlarm() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const volume = soundSettings.volume;
        
        switch (soundSettings.soundType) {
            case 'chime': playChime(volume); break;
            case 'birds': playBirds(volume); break;
            case 'rain': playRain(volume); break;
            case 'stream': playStream(volume); break;
        }
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

function playBirds(volume) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000 + Math.random() * 500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 500, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }, i * 150);
    }
}

function playRain(volume) {
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    const gainNode = audioContext.createGain();
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3 * volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.5);
}

function playStream(volume) {
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    const gainNode = audioContext.createGain();
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4 * volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.5);
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

function toggleAmbientSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (soundSettings.ambientEnabled) {
        // Start ambient sound
        ambientOscillator = audioContext.createOscillator();
        ambientGainNode = audioContext.createGain();
        
        ambientOscillator.connect(ambientGainNode);
        ambientGainNode.connect(audioContext.destination);
        
        ambientOscillator.type = 'sine';
        ambientOscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        
        ambientGainNode.gain.setValueAtTime(0, audioContext.currentTime);
        ambientGainNode.gain.linearRampToValueAtTime(0.1 * soundSettings.volume, audioContext.currentTime + 1);
        
        ambientOscillator.start(audioContext.currentTime);
    } else {
        // Stop ambient sound
        if (ambientOscillator && ambientGainNode) {
            ambientGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            setTimeout(() => {
                ambientOscillator.stop();
                ambientOscillator = null;
            }, 500);
        }
    }
}

// ==================== NOTIFICATIONS ====================

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
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
        
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// ==================== TIMER FUNCTIONS ====================

function onTimerComplete() {
    playAlarm();
    
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    timerDisplay.classList.add('timer-complete');
    setTimeout(() => {
        timerDisplay.classList.remove('timer-complete');
    }, 3000);
    
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
        btn.classList.toggle('active', btn.dataset.mode === timerState.mode);
    });
}

function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    timerState.startTime = Date.now() - (timerState.totalTime - timerState.remainingTime);
    updateButtons();
    
    let lastMinute = Math.floor(timerState.remainingTime / 60000);
    
    timerState.interval = setInterval(() => {
        const elapsed = Date.now() - timerState.startTime;
        timerState.remainingTime = Math.max(0, timerState.totalTime - elapsed);
        
        updateDisplay();
        updateProgress();
        
        // Tick sound every minute
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
        // Skip break, go to focus
        setMode('focus');
        if (options.autoStart) {
            startTimer();
        }
    } else {
        // Normal skip logic - go through cycle
        const modes = ['focus', 'short', 'long'];
        const currentIndex = modes.indexOf(timerState.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setMode(modes[nextIndex]);
        
        // Special case: if we're on short break and skip breaks is on,
        // we should skip to long break after 4th pomodoro
        if (timerState.mode === 'short' && options.skipBreaks && timerState.cycle === 4) {
            setMode('long');
        }
        
        if (options.autoStart) {
            startTimer();
        }
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
        btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
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
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="task-delete" aria-label="Delete task">✕</button>
        `;
        
        taskList.appendChild(li);
    });
    
    // Add event listeners
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

function addTask() {
    const text = newTaskInput.value.trim();
    if (!text) return;
    
    tasks.push({
        text,
        completed: false,
        createdAt: Date.now()
    });
    
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
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    saveToStorage();
}

function toggleHighContrast() {
    highContrast = !highContrast;
    document.body.classList.toggle('high-contrast', highContrast);
    saveToStorage();
}

// ==================== MODAL FUNCTIONS ====================

function showOnboarding() {
    onboardingModal.classList.add('visible');
}

function hideOnboarding() {
    onboardingModal.classList.remove('visible');
    localStorage.setItem('pomodoroPrimeVisited', 'true');
}

function showShortcuts() {
    shortcutsModal.classList.add('visible');
}

function hideShortcuts() {
    shortcutsModal.classList.remove('visible');
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
    if (highContrast) {
        document.body.classList.add('high-contrast');
    }
    ambientSoundToggle.checked = soundSettings.ambientEnabled;
    autoStartToggle.checked = options.autoStart;
    skipBreaksToggle.checked = options.skipBreaks;
    tickSoundToggle.checked = soundSettings.tickEnabled;
    volumeSlider.value = soundSettings.volume * 100;
    
    // Set active theme
    themeOptions.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
    
    // Set active sound
    soundBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sound === soundSettings.soundType);
    });
    
    updateThemeColors();
    initParticles();
    initSky();
    renderTasks();
    updateDisplay();
    updateProgress();
    updateCycle();
    updateStats();
    
    // Start button
    startBtn.addEventListener('click', () => {
        requestNotificationPermission();
        if (timerState.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetTimer);
    
    // Skip button
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
    
    // Sound buttons
    soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundSettings.soundType = btn.dataset.sound;
            soundBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveToStorage();
        });
    });
    
    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
        soundSettings.volume = e.target.value / 100;
        saveToStorage();
    });
    
    // Test sound button
    testSoundBtn.addEventListener('click', playAlarm);
    
    // Ambient sound toggle
    ambientSoundToggle.addEventListener('change', (e) => {
        soundSettings.ambientEnabled = e.target.checked;
        toggleAmbientSound();
        saveToStorage();
    });
    
    // Auto-start toggle
    autoStartToggle.addEventListener('change', (e) => {
        options.autoStart = e.target.checked;
        saveToStorage();
    });
    
    // Skip breaks toggle
    skipBreaksToggle.addEventListener('change', (e) => {
        options.skipBreaks = e.target.checked;
        saveToStorage();
    });
    
    // Tick sound toggle
    tickSoundToggle.addEventListener('change', (e) => {
        soundSettings.tickEnabled = e.target.checked;
        saveToStorage();
    });
    
    // High contrast toggle
    highContrastToggle.addEventListener('change', (e) => {
        highContrast = e.target.checked;
        toggleHighContrast();
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
    
    // Settings button
    settingsBtn.addEventListener('click', () => {
        // Scroll to settings section
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
        // Don't trigger shortcuts when typing in inputs
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
        createStars();
    });
});
