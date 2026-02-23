// Pomodoro Prime - Enhanced JavaScript
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
    soundType: 'chime' // 'chime', 'birds', 'rain', 'stream'
};

// Theme State
let isDarkMode = false;

// Timer Durations (in milliseconds)
const DURATIONS = {
    focus: 25 * 60 * 1000,
    short: 5 * 60 * 1000,
    long: 15 * 60 * 1000
};

// DOM Elements - will be initialized when DOM is ready
let timerDisplay, timerType, progressBar, currentCycle, startBtn, resetBtn, taskInput, modeBtns;
let themeToggleBtn, presetBtns, soundBtns, volumeSlider, testSoundBtn;
let statPomodoros, statFocusTime, statStreak;

// Audio Context for notification sound
let audioContext;

// Particles Canvas
let particlesCanvas, particlesCtx;
let particles = [];

// Sky Canvas for Day/Night Cycle
let skyCanvas, skyCtx;
let stars = [];

// Sky Colors for different times of day
const SKY_COLORS = {
    sunrise: {
        top: [135, 206, 235],    // Light blue
        middle: [255, 183, 77],  // Orange
        bottom: [255, 127, 80]   // Coral
    },
    morning: {
        top: [135, 206, 235],    // Sky blue
        middle: [176, 224, 230], // Powder blue
        bottom: [255, 255, 255]  // White
    },
    midday: {
        top: [70, 130, 180],     // Steel blue
        middle: [135, 206, 235], // Sky blue
        bottom: [173, 216, 230]  // Light blue
    },
    afternoon: {
        top: [100, 149, 237],    // Cornflower blue
        middle: [255, 218, 185], // Peach
        bottom: [255, 160, 122] // Light salmon
    },
    sunset: {
        top: [72, 61, 139],      // Dark slate blue
        middle: [255, 140, 0],   // Dark orange
        bottom: [255, 69, 0]     // Red orange
    },
    evening: {
        top: [25, 25, 112],      // Midnight blue
        middle: [75, 0, 130],    // Indigo
        bottom: [138, 43, 226]   // Blue violet
    },
    night: {
        top: [10, 10, 30],       // Very dark blue
        middle: [20, 20, 50],    // Dark blue
        bottom: [30, 30, 70]     // Medium dark blue
    }
};

// Initialize DOM Elements
function initDOM() {
    timerDisplay = document.getElementById('timerDisplay');
    timerType = document.getElementById('timerType');
    progressBar = document.getElementById('progressBar');
    currentCycle = document.getElementById('currentCycle');
    startBtn = document.getElementById('startBtn');
    resetBtn = document.getElementById('resetBtn');
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
    particlesCanvas = document.getElementById('particlesCanvas');
    particlesCtx = particlesCanvas.getContext('2d');
    skyCanvas = document.getElementById('skyCanvas');
    skyCtx = skyCanvas.getContext('2d');
}

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
    
    // Update timer type color
    timerType.setAttribute('data-mode', timerState.mode);
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

// Update statistics display
function updateStats() {
    statPomodoros.textContent = statsState.pomodoros;
    statFocusTime.textContent = `${statsState.focusTime}m`;
    statStreak.textContent = statsState.streak;
}

// Play notification sound using Web Audio API
function playAlarm() {
    try {
        // Initialize AudioContext on first user interaction
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume context if suspended (required by browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const volume = soundSettings.volume;
        
        switch (soundSettings.soundType) {
            case 'chime':
                playChime(volume);
                break;
            case 'birds':
                playBirds(volume);
                break;
            case 'rain':
                playRain(volume);
                break;
            case 'stream':
                playStream(volume);
                break;
        }
        
    } catch (e) {
        console.log('Audio play error:', e);
    }
}

// Play chime sound
function playChime(volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3 * volume, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Play birds sound
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

// Play rain sound
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

// Play stream sound
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

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }
}

// Show browser notification
function showBrowserNotification(title, body, icon) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon || '🌲',
            badge: '🌲',
            tag: 'pomodoro-timer',
            requireInteraction: false
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// Handle timer completion
function onTimerComplete() {
    playAlarm();
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    // Show browser notification
    let notificationTitle, notificationBody;
    if (timerState.mode === 'focus') {
        notificationTitle = '🌲 Focus Complete!';
        notificationBody = 'Great work! Time for a break.';
    } else if (timerState.mode === 'short') {
        notificationTitle = '🌿 Break Over!';
        notificationBody = 'Ready to focus again?';
    } else {
        notificationTitle = '🍃 Long Break Over!';
        notificationBody = 'Feeling refreshed? Let\'s focus!';
    }
    showBrowserNotification(notificationTitle, notificationBody, '🌲');
    
    // Show visual feedback
    timerDisplay.classList.add('timer-complete');
    setTimeout(() => {
        timerDisplay.classList.remove('timer-complete');
    }, 3000);
    
    // Update statistics
    if (timerState.mode === 'focus') {
        statsState.pomodoros++;
        statsState.focusTime += Math.round(timerState.totalTime / 60000);
        
        // Update streak
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
    }
    
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
    
    // Reset timer
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    
    updateTimerType();
    updateDisplay();
    updateProgress();
    updateCycle();
    updateModeButtons();
    updateButtons();
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
    if (timerState.isRunning) { return; }
    
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
    if (!timerState.isRunning) { return; }
    
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

// Toggle theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggleBtn.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
}

// Set custom timer duration
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
    
    // Update active preset button
    presetBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
    });
}

// Initialize particles
function initParticles() {
    resizeCanvas();
    createParticles();
    animateParticles();
}

// Resize canvas
function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
}

// Create particles
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

// Animate particles
function animateParticles() {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < -10) particle.x = particlesCanvas.width + 10;
        if (particle.x > particlesCanvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = particlesCanvas.height + 10;
        if (particle.y > particlesCanvas.height + 10) particle.y = -10;
        
        // Draw particle
        particlesCtx.beginPath();
        particlesCtx.globalAlpha = particle.opacity;
        
        if (particle.type === 'firefly') {
            // Draw firefly (glowing dot)
            const gradient = particlesCtx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 150, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
            particlesCtx.fillStyle = gradient;
            particlesCtx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        } else {
            // Draw leaf (small oval)
            particlesCtx.fillStyle = isDarkMode ? 'rgba(100, 150, 100, 0.6)' : 'rgba(80, 120, 80, 0.6)';
            particlesCtx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        }
        
        particlesCtx.fill();
        
        // Twinkle effect for fireflies
        if (particle.type === 'firefly') {
            particle.opacity += (Math.random() - 0.5) * 0.1;
            particle.opacity = Math.max(0.2, Math.min(0.7, particle.opacity));
        }
    });
    
    particlesCtx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}

// ==================== Sky Animation Functions ====================

// Initialize sky
function initSky() {
    resizeSkyCanvas();
    createStars();
    animateSky();
}

// Resize sky canvas
function resizeSkyCanvas() {
    skyCanvas.width = window.innerWidth;
    skyCanvas.height = window.innerHeight;
}

// Create stars
function createStars() {
    stars = [];
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * skyCanvas.width,
            y: Math.random() * skyCanvas.height * 0.6, // Stars only in upper 60%
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleDirection: Math.random() > 0.5 ? 1 : -1
        });
    }
}

// Get sky colors based on timer progress (0-1)
function getSkyColors(progress) {
    // Map progress to time of day:
    // 0.0 - 0.15: Sunrise
    // 0.15 - 0.35: Morning
    // 0.35 - 0.65: Midday
    // 0.65 - 0.85: Afternoon/Sunset
    // 0.85 - 1.0: Night
    
    if (progress < 0.15) {
        return SKY_COLORS.sunrise;
    } else if (progress < 0.35) {
        return SKY_COLORS.morning;
    } else if (progress < 0.65) {
        return SKY_COLORS.midday;
    } else if (progress < 0.85) {
        return SKY_COLORS.sunset;
    } else {
        return SKY_COLORS.night;
    }
}

// Interpolate between two colors
function lerpColor(color1, color2, t) {
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t)
    ];
}

// Get interpolated sky colors for smooth transitions
function getInterpolatedSkyColors(progress) {
    const phases = [
        { start: 0.0, end: 0.15, color: SKY_COLORS.sunrise },
        { start: 0.15, end: 0.35, color: SKY_COLORS.morning },
        { start: 0.35, end: 0.65, color: SKY_COLORS.midday },
        { start: 0.65, end: 0.85, color: SKY_COLORS.sunset },
        { start: 0.85, end: 1.0, color: SKY_COLORS.night }
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

// Draw sky gradient
function drawSky(colors) {
    const gradient = skyCtx.createLinearGradient(0, 0, 0, skyCanvas.height);
    gradient.addColorStop(0, `rgb(${colors.top.join(',')})`);
    gradient.addColorStop(0.5, `rgb(${colors.middle.join(',')})`);
    gradient.addColorStop(1, `rgb(${colors.bottom.join(',')})`);
    
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
}

// Draw sun
function drawSun(progress) {
    // Sun is visible from 0.0 to 0.85
    if (progress > 0.85) return;
    
    const sunProgress = progress / 0.85;
    const sunX = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * sunProgress);
    const sunY = skyCanvas.height * 0.8 - Math.sin(sunProgress * Math.PI) * skyCanvas.height * 0.6;
    const sunSize = 40 + Math.sin(sunProgress * Math.PI) * 10;
    
    // Sun glow
    const glowGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize * 3);
    glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    glowGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)');
    glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    
    skyCtx.fillStyle = glowGradient;
    skyCtx.beginPath();
    skyCtx.arc(sunX, sunY, sunSize * 3, 0, Math.PI * 2);
    skyCtx.fill();
    
    // Sun body
    const sunGradient = skyCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunSize);
    sunGradient.addColorStop(0, 'rgba(255, 255, 220, 1)');
    sunGradient.addColorStop(0.8, 'rgba(255, 200, 100, 1)');
    sunGradient.addColorStop(1, 'rgba(255, 150, 50, 1)');
    
    skyCtx.fillStyle = sunGradient;
    skyCtx.beginPath();
    skyCtx.arc(sunX, sunY, sunSize, 0, Math.PI * 2);
    skyCtx.fill();
}

// Draw moon
function drawMoon(progress) {
    // Moon is visible from 0.7 to 1.0
    if (progress < 0.7) return;
    
    const moonProgress = (progress - 0.7) / 0.3;
    const moonX = skyCanvas.width * 0.1 + (skyCanvas.width * 0.8 * moonProgress);
    const moonY = skyCanvas.height * 0.8 - Math.sin(moonProgress * Math.PI) * skyCanvas.height * 0.6;
    const moonSize = 35;
    
    // Moon glow
    const glowGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize * 2.5);
    glowGradient.addColorStop(0, 'rgba(200, 220, 255, 0.3)');
    glowGradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.15)');
    glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    
    skyCtx.fillStyle = glowGradient;
    skyCtx.beginPath();
    skyCtx.arc(moonX, moonY, moonSize * 2.5, 0, Math.PI * 2);
    skyCtx.fill();
    
    // Moon body
    const moonGradient = skyCtx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize);
    moonGradient.addColorStop(0, 'rgba(240, 240, 255, 1)');
    moonGradient.addColorStop(0.7, 'rgba(200, 200, 230, 1)');
    moonGradient.addColorStop(1, 'rgba(150, 150, 200, 1)');
    
    skyCtx.fillStyle = moonGradient;
    skyCtx.beginPath();
    skyCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
    skyCtx.fill();
    
    // Moon craters
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

// Draw stars
function drawStars(progress) {
    // Stars are visible from 0.8 to 1.0
    if (progress < 0.8) return;
    
    const starVisibility = (progress - 0.8) / 0.2;
    
    stars.forEach(star => {
        // Twinkle effect
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

// Animate sky
function animateSky() {
    // Calculate progress based on timer
    let progress;
    if (timerState.totalTime > 0) {
        progress = 1 - (timerState.remainingTime / timerState.totalTime);
    } else {
        progress = 0;
    }
    
    // Get sky colors
    const colors = getInterpolatedSkyColors(progress);
    
    // Draw sky
    drawSky(colors);
    
    // Draw celestial bodies
    drawSun(progress);
    drawMoon(progress);
    drawStars(progress);
    
    requestAnimationFrame(animateSky);
}

// Event Listeners - wrapped in DOMContentLoaded to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    initDOM();
    
    // Initialize particles
    initParticles();
    
    // Initialize sky
    initSky();
    
    // Attach event listeners
    startBtn.addEventListener('click', () => {
        // Request notification permission on first interaction
        requestNotificationPermission();
        
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

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Timer presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setCustomDuration(parseInt(btn.dataset.minutes));
        });
    });

    // Sound buttons
    soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundSettings.soundType = btn.dataset.sound;
            soundBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
        soundSettings.volume = e.target.value / 100;
    });

    // Test sound button
    testSoundBtn.addEventListener('click', playAlarm);

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
        
        // 'T' for theme toggle
        if (e.code === 'KeyT') {
            e.preventDefault();
            toggleTheme();
        }
    });

    // Window resize for particles and sky
    window.addEventListener('resize', () => {
        resizeCanvas();
        resizeSkyCanvas();
        createStars();
    });

    // Initialize display
    updateDisplay();
    updateProgress();
    updateCycle();
    updateStats();
});
