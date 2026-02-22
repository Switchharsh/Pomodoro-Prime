package com.pomodoroprime.service

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.CountDownTimer
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.core.content.ContextCompat
import com.pomodoroprime.notification.PomodoroNotificationManager
import com.pomodoroprime.notification.PomodoroNotificationManager.Companion.ACTION_PAUSE
import com.pomodoroprime.notification.PomodoroNotificationManager.Companion.ACTION_START
import com.pomodoroprime.notification.PomodoroNotificationManager.Companion.ACTION_STOP
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Foreground service that manages the Pomodoro timer
 */
class TimerService : Service() {
    
    private val binder = LocalBinder()
    private var countDownTimer: CountDownTimer? = null
    private lateinit var notificationManager: PomodoroNotificationManager
    
    // Timer state
    private var _timerType = MutableStateFlow("WORK")
    val timerType: StateFlow<String> = _timerType
    
    private var _duration = MutableStateFlow(25 * 60 * 1000L)
    val duration: StateFlow<Long> = _duration
    
    private var _remainingTime = MutableStateFlow(25 * 60 * 1000L)
    val remainingTime: StateFlow<Long> = _remainingTime
    
    private var _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning
    
    private var _completedPomodoros = MutableStateFlow(0)
    val completedPomodoros: StateFlow<Int> = _completedPomodoros
    
    private var _currentCycle = MutableStateFlow(1)
    val currentCycle: StateFlow<Int> = _currentCycle
    
    private var _currentTaskId = MutableStateFlow<Long?>(null)
    val currentTaskId: StateFlow<Long?> = _currentTaskId
    
    override fun onCreate() {
        super.onCreate()
        notificationManager = PomodoroNotificationManager(this)
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startTimer()
            ACTION_PAUSE -> pauseTimer()
            ACTION_STOP -> stopTimer()
        }
        return START_NOT_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder {
        return binder
    }
    
    inner class LocalBinder : Binder() {
        fun getService(): TimerService = this@TimerService
    }
    
    /**
     * Starts the timer
     */
    fun startTimer() {
        if (_isRunning.value) return
        
        _isRunning.value = true
        startForegroundService()
        
        countDownTimer = object : CountDownTimer(_remainingTime.value, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                _remainingTime.value = millisUntilFinished
                updateNotification()
            }
            
            override fun onFinish() {
                onTimerComplete()
            }
        }.start()
    }
    
    /**
     * Pauses the timer
     */
    fun pauseTimer() {
        if (!_isRunning.value) return
        
        _isRunning.value = false
        countDownTimer?.cancel()
        updateNotification()
    }
    
    /**
     * Stops and resets the timer
     */
    fun stopTimer() {
        pauseTimer()
        _remainingTime.value = _duration.value
        stopForeground(true)
        stopSelf()
    }
    
    /**
     * Resets the timer to its initial duration
     */
    fun resetTimer() {
        pauseTimer()
        _remainingTime.value = _duration.value
        updateNotification()
    }
    
    /**
     * Sets the timer type (WORK, SHORT_BREAK, LONG_BREAK)
     */
    fun setTimerType(type: String) {
        _timerType.value = type
        _duration.value = getDefaultDuration(type)
        _remainingTime.value = _duration.value
        updateNotification()
    }
    
    /**
     * Sets a custom duration for the timer
     */
    fun setDuration(durationMillis: Long) {
        _duration.value = durationMillis
        _remainingTime.value = durationMillis
    }
    
    /**
     * Sets the current task ID
     */
    fun setCurrentTask(taskId: Long?) {
        _currentTaskId.value = taskId
    }
    
    /**
     * Increments the completed pomodoros count
     */
    fun incrementCompletedPomodoros() {
        _completedPomodoros.value++
        _currentCycle.value = (_completedPomodoros.value % 4) + 1
    }
    
    /**
     * Resets the completed pomodoros count
     */
    fun resetCompletedPomodoros() {
        _completedPomodoros.value = 0
        _currentCycle.value = 1
    }
    
    /**
     * Called when the timer completes
     */
    private fun onTimerComplete() {
        _isRunning.value = false
        vibrate()
        
        // Show completion notification
        notificationManager.showTimerCompleteNotification(_timerType.value)
        
        // Determine next timer type
        val nextType = when (_timerType.value) {
            "WORK" -> {
                incrementCompletedPomodoros()
                if (_currentCycle.value == 1) {
                    // After 4 pomodoros, take a long break
                    "LONG_BREAK"
                } else {
                    "SHORT_BREAK"
                }
            }
            "SHORT_BREAK", "LONG_BREAK" -> "WORK"
            else -> "WORK"
        }
        
        _timerType.value = nextType
        _duration.value = getDefaultDuration(nextType)
        _remainingTime.value = _duration.value
        
        updateNotification()
    }
    
    /**
     * Starts the foreground service with notification
     */
    private fun startForegroundService() {
        val notification = notificationManager.createTimerNotification(
            _timerType.value,
            formatTime(_remainingTime.value),
            true
        )
        startForeground(PomodoroNotificationManager.NOTIFICATION_ID, notification)
    }
    
    /**
     * Updates the foreground notification
     */
    private fun updateNotification() {
        val notification = notificationManager.createTimerNotification(
            _timerType.value,
            formatTime(_remainingTime.value),
            _isRunning.value
        )
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
        notificationManager.notify(PomodoroNotificationManager.NOTIFICATION_ID, notification)
    }
    
    /**
     * Vibrates the device
     */
    private fun vibrate() {
        val vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            vibrator.vibrate(
                VibrationEffect.createWaveform(longArrayOf(0, 500, 200, 500), -1)
            )
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(longArrayOf(0, 500, 200, 500), -1)
        }
    }
    
    /**
     * Formats milliseconds to MM:SS
     */
    fun formatTime(millis: Long): String {
        val minutes = (millis / 1000) / 60
        val seconds = (millis / 1000) % 60
        return String.format("%02d:%02d", minutes, seconds)
    }
    
    private fun getDefaultDuration(type: String): Long {
        return when (type) {
            "WORK" -> 25 * 60 * 1000L
            "SHORT_BREAK" -> 5 * 60 * 1000L
            "LONG_BREAK" -> 15 * 60 * 1000L
            else -> 25 * 60 * 1000L
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
    }
}
