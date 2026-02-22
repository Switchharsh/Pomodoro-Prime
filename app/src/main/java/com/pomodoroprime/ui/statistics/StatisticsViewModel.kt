package com.pomodoroprime.ui.statistics

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pomodoroprime.data.database.PomodoroDatabase
import com.pomodoroprime.data.repository.SessionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * ViewModel for the Statistics screen
 */
class StatisticsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val context = application.applicationContext
    private val database = PomodoroDatabase.getDatabase(context)
    private val sessionRepository = SessionRepository(database)
    
    // Statistics state
    private val _totalWorkSessions = MutableStateFlow(0)
    val totalWorkSessions: StateFlow<Int> = _totalWorkSessions.asStateFlow()
    
    private val _totalWorkDuration = MutableStateFlow(0L)
    val totalWorkDuration: StateFlow<Long> = _totalWorkDuration.asStateFlow()
    
    private val _todayWorkSessions = MutableStateFlow(0)
    val todayWorkSessions: StateFlow<Int> = _todayWorkSessions.asStateFlow()
    
    private val _todayWorkDuration = MutableStateFlow(0L)
    val todayWorkDuration: StateFlow<Long> = _todayWorkDuration.asStateFlow()
    
    private val _weekWorkSessions = MutableStateFlow(0)
    val weekWorkSessions: StateFlow<Int> = _weekWorkSessions.asStateFlow()
    
    private val _weekWorkDuration = MutableStateFlow(0L)
    val weekWorkDuration: StateFlow<Long> = _weekWorkDuration.asStateFlow()
    
    private val _monthWorkSessions = MutableStateFlow(0)
    val monthWorkSessions: StateFlow<Int> = _monthWorkSessions.asStateFlow()
    
    private val _monthWorkDuration = MutableStateFlow(0L)
    val monthWorkDuration: StateFlow<Long> = _monthWorkDuration.asStateFlow()
    
    init {
        loadStatistics()
    }
    
    /**
     * Loads all statistics
     */
    fun loadStatistics() {
        viewModelScope.launch {
            // Total statistics
            _totalWorkSessions.value = sessionRepository.getTotalWorkSessionsCount()
            _totalWorkDuration.value = sessionRepository.getTotalWorkDuration() ?: 0L
            
            // Today's statistics
            val todayStart = getTodayStart()
            _todayWorkSessions.value = sessionRepository.getWorkSessionsCountToday(todayStart)
            
            // This week's statistics
            val weekStart = getWeekStart()
            _weekWorkSessions.value = sessionRepository.getWorkSessionsCountToday(weekStart)
            
            // This month's statistics
            val monthStart = getMonthStart()
            _monthWorkSessions.value = sessionRepository.getWorkSessionsCountToday(monthStart)
        }
    }
    
    /**
     * Gets the start of today (midnight)
     */
    private fun getTodayStart(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    /**
     * Gets the start of the week (Monday at midnight)
     */
    private fun getWeekStart(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    /**
     * Gets the start of the month (1st at midnight)
     */
    private fun getMonthStart(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.DAY_OF_MONTH, 1)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
    
    /**
     * Formats milliseconds to a readable duration string
     */
    fun formatDuration(millis: Long): String {
        val hours = millis / (1000 * 60 * 60)
        val minutes = (millis % (1000 * 60 * 60)) / (1000 * 60)
        
        return when {
            hours > 0 -> "${hours}h ${minutes}m"
            minutes > 0 -> "${minutes}m"
            else -> "0m"
        }
    }
    
    /**
     * Gets the date string for today
     */
    fun getTodayDateString(): String {
        val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        return sdf.format(Date())
    }
    
    /**
     * Gets the week range string
     */
    fun getWeekRangeString(): String {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
        val start = calendar.time
        
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
        val end = calendar.time
        
        val sdf = SimpleDateFormat("MMM dd", Locale.getDefault())
        return "${sdf.format(start)} - ${sdf.format(end)}"
    }
    
    /**
     * Gets the month string
     */
    fun getMonthString(): String {
        val sdf = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
        return sdf.format(Date())
    }
}
