package com.pomodoroprime.ui.timer

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pomodoroprime.data.database.PomodoroDatabase
import com.pomodoroprime.data.database.SessionEntity
import com.pomodoroprime.data.repository.SessionRepository
import com.pomodoroprime.notification.PomodoroNotificationManager
import com.pomodoroprime.service.TimerService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the Timer screen
 */
class TimerViewModel(application: Application) : AndroidViewModel(application) {
    
    private val context: Context = application.applicationContext
    private val database = PomodoroDatabase.getDatabase(context)
    private val sessionRepository = SessionRepository(database)
    
    // Service connection
    private var timerService: TimerService? = null
    private var isServiceBound = false
    
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as TimerService.LocalBinder
            timerService = binder.getService()
            isServiceBound = true
            // Collect timer state from service
            viewModelScope.launch {
                timerService?.timerType?.collect { type ->
                    _timerType.value = type
                }
            }
            viewModelScope.launch {
                timerService?.remainingTime?.collect { time ->
                    _remainingTime.value = time
                    _formattedTime.value = timerService?.formatTime(time) ?: "25:00"
                }
            }
            viewModelScope.launch {
                timerService?.isRunning?.collect { running ->
                    _isRunning.value = running
                }
            }
            viewModelScope.launch {
                timerService?.completedPomodoros?.collect { count ->
                    _completedPomodoros.value = count
                }
            }
            viewModelScope.launch {
                timerService?.currentCycle?.collect { cycle ->
                    _currentCycle.value = cycle
                }
            }
        }
        
        override fun onServiceDisconnected(name: ComponentName?) {
            isServiceBound = false
            timerService = null
        }
    }
    
    // Timer state
    private val _timerType = MutableStateFlow("WORK")
    val timerType: StateFlow<String> = _timerType.asStateFlow()
    
    private val _remainingTime = MutableStateFlow(25 * 60 * 1000L)
    val remainingTime: StateFlow<Long> = _remainingTime.asStateFlow()
    
    private val _formattedTime = MutableStateFlow("25:00")
    val formattedTime: StateFlow<String> = _formattedTime.asStateFlow()
    
    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()
    
    private val _completedPomodoros = MutableStateFlow(0)
    val completedPomodoros: StateFlow<Int> = _completedPomodoros.asStateFlow()
    
    private val _currentCycle = MutableStateFlow(1)
    val currentCycle: StateFlow<Int> = _currentCycle.asStateFlow()
    
    private val _currentTaskId = MutableStateFlow<Long?>(null)
    val currentTaskId: StateFlow<Long?> = _currentTaskId.asStateFlow()
    
    private val _progress = MutableStateFlow(0f)
    val progress: StateFlow<Float> = _progress.asStateFlow()
    
    init {
        bindToService()
    }
    
    private fun bindToService() {
        val intent = Intent(context, TimerService::class.java)
        context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    }
    
    private fun unbindFromService() {
        if (isServiceBound) {
            context.unbindService(serviceConnection)
            isServiceBound = false
        }
    }
    
    /**
     * Starts the timer
     */
    fun startTimer() {
        val intent = Intent(context, TimerService::class.java).apply {
            action = PomodoroNotificationManager.ACTION_START
        }
        context.startService(intent)
    }
    
    /**
     * Pauses the timer
     */
    fun pauseTimer() {
        val intent = Intent(context, TimerService::class.java).apply {
            action = PomodoroNotificationManager.ACTION_PAUSE
        }
        context.startService(intent)
    }
    
    /**
     * Stops and resets the timer
     */
    fun stopTimer() {
        val intent = Intent(context, TimerService::class.java).apply {
            action = PomodoroNotificationManager.ACTION_STOP
        }
        context.startService(intent)
        _progress.value = 0f
    }
    
    /**
     * Resets the timer to its initial duration
     */
    fun resetTimer() {
        timerService?.resetTimer()
        _progress.value = 0f
    }
    
    /**
     * Skips to the next timer type
     */
    fun skipTimer() {
        timerService?.pauseTimer()
        val nextType = when (_timerType.value) {
            "WORK" -> "SHORT_BREAK"
            "SHORT_BREAK" -> "WORK"
            "LONG_BREAK" -> "WORK"
            else -> "WORK"
        }
        timerService?.setTimerType(nextType)
        _progress.value = 0f
    }
    
    /**
     * Sets the current task
     */
    fun setCurrentTask(taskId: Long?) {
        _currentTaskId.value = taskId
        timerService?.setCurrentTask(taskId)
    }
    
    /**
     * Records a completed session
     */
    fun recordSession(duration: Long, wasInterrupted: Boolean = false) {
        viewModelScope.launch {
            val session = SessionEntity(
                taskId = _currentTaskId.value,
                timerType = _timerType.value,
                duration = duration,
                startedAt = System.currentTimeMillis() - duration,
                completedAt = System.currentTimeMillis(),
                wasInterrupted = wasInterrupted
            )
            sessionRepository.insertSession(session)
        }
    }
    
    /**
     * Gets the display name for the current timer type
     */
    fun getTimerDisplayName(): String {
        return when (_timerType.value) {
            "WORK" -> "Focus"
            "SHORT_BREAK" -> "Short Break"
            "LONG_BREAK" -> "Long Break"
            else -> "Timer"
        }
    }
    
    /**
     * Calculates the progress percentage
     */
    fun calculateProgress() {
        val totalTime = when (_timerType.value) {
            "WORK" -> 25 * 60 * 1000L
            "SHORT_BREAK" -> 5 * 60 * 1000L
            "LONG_BREAK" -> 15 * 60 * 1000L
            else -> 25 * 60 * 1000L
        }
        _progress.value = 1f - (_remainingTime.value.toFloat() / totalTime.toFloat())
    }
    
    override fun onCleared() {
        super.onCleared()
        unbindFromService()
    }
}
