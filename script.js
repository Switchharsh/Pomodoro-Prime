// Pomodoro Prime - Super Lite JavaScript
// Session-only, no persistence - keeps it super lite
// ADHD-friendly: Simple, focused, minimal distractions

// Timer State
let timerState = {
    isRunning: false,
    mode: 'focus', // 'focus', 'short', 'long'
    remainingTime: 25 * 60 * 1000, // milliseconds
    totalTime: 25 * 60 * 1000,
    cycle: 1,
    interval: null
};

// Timer Durations (in milliseconds)
const DURATIONS = {
    focus: 25 * 60 * 1000,
    short: 5 * 60 * 1000,
    long: 15 * 60 * 1000
};

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const timerType = document.getElementById('timerType');
const progressBar = document.getElementById('progressBar');
const currentCycle = document.getElementById('currentCycle');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const taskInput = document.getElementById('taskInput');
const modeBtns = document.querySelectorAll('.mode-btn');
const alarmSound = document.getElementById('alarmSound');

// Format time as MM:SS
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update timer display
function updateDisplay() {
    timerDisplay.textContent = formatTime(timerState.remainingTime);
    document.title = `${formatTime(timerState.remainingTime)} - Pomodoro Prime`;
}

// Update progress ring
function updateProgress() {
    const circumference = 2 * Math.PI * 45;
    const progress = (timerState.totalTime - timerState.remainingTime) / timerState.totalTime;
    const dashOffset = circumference - (progress * circumference);
    progressBar.style.strokeDashoffset = dashOffset;
}

// Update cycle indicator
function updateCycle() {
    currentCycle.textContent = `${timerState.cycle}/4`;
}

// Update timer type display
function updateTimerType() {
    const typeLabels = {
        focus: 'Focus',
        short: 'Short Break',
        long: 'Long Break'
    };
    timerType.textContent = typeLabels[timerState.mode];
    
    // Update progress bar color
    progressBar.setAttribute('data-mode', timerState.mode);
}

// Update button states
function updateButtons() {
    if (timerState.isRunning) {
        startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        startBtn.classList.add('btn-secondary');
    } else {
        startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
        startBtn.classList.remove('btn-secondary');
    }
}

// Play notification sound
function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log('Audio play error:', e));
}

// Handle timer completion
function onTimerComplete() {
    playAlarm();
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    // Show visual feedback
    timerDisplay.classList.add('timer-complete');
    setTimeout(() => {
        timerDisplay.classList.remove('timer-complete');
    }, 3000);
    
    // Determine next mode
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
    
    // Auto-switch mode after delay
    setTimeout(() => {
        setMode(nextMode);
    }, 2000);
}

// Set timer mode
function setMode(mode) {
    timerState.mode = mode;
    timerState.totalTime = DURATIONS[mode];
    timerState.remainingTime = timerState.totalTime;
    
    updateTimerType();
    updateDisplay();
    updateProgress();
    updateCycle();
    updateModeButtons();
    updateButtons();
    
    // Reset timer
    clearInterval(timerState.interval);
    timerState.isRunning = false;
}

// Update mode buttons
function updateModeButtons() {
    modeBtns.forEach(btn => {
        if (btn.dataset.mode === timerState.mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Start timer
function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    updateButtons();
    
    const startTime = Date.now();
    timerState.interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timerState.remainingTime = Math.max(0, timerState.totalTime - elapsed);
        
        updateDisplay();
        updateProgress();
        
        if (timerState.remainingTime <= 0) {
            clearInterval(timerState.interval);
            onTimerComplete();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isRunning = false;
    clearInterval(timerState.interval);
    updateButtons();
}

// Reset timer
function resetTimer() {
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    timerState.remainingTime = timerState.totalTime;
    
    updateDisplay();
    updateProgress();
    updateButtons();
    
    timerDisplay.classList.remove('timer-complete');
}

// Skip to next mode
function skipTimer() {
    pauseTimer();
    const modes = ['focus', 'short', 'long'];
    const currentIndex = modes.indexOf(timerState.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
}

// Event Listeners
startBtn.addEventListener('click', () => {
    if (timerState.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setMode(btn.dataset.mode);
    });
});

// Task input - session only, no save
taskInput.addEventListener('focus', () => {
    taskInput.classList.add('focus-visible');
});

taskInput.addEventListener('blur', () => {
    taskInput.classList.remove('focus-visible');
});

// Keyboard shortcuts for accessibility
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (timerState.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    // 'R' for reset
    if (e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
    }
});

// Initialize display
updateDisplay();
updateProgress();
updateCycle();
