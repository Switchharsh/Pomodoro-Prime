package com.pomodoroprime.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the Settings screen
 */
class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    
    private val context = application.applicationContext
    private val sharedPreferences = context.getSharedPreferences("pomodoro_settings", android.content.Context.MODE_PRIVATE)
    
    // Timer settings
    private val _workDuration = MutableStateFlow(getWorkDuration())
    val workDuration: StateFlow<Int> = _workDuration.asStateFlow()
    
    private val _shortBreakDuration = MutableStateFlow(getShortBreakDuration())
    val shortBreakDuration: StateFlow<Int> = _shortBreakDuration.asStateFlow()
    
    private val _longBreakDuration = MutableStateFlow(getLongBreakDuration())
    val longBreakDuration: StateFlow<Int> = _longBreakDuration.asStateFlow()
    
    // Notification settings
    private val _notificationsEnabled = MutableStateFlow(getNotificationsEnabled())
    val notificationsEnabled: StateFlow<Boolean> = _notificationsEnabled.asStateFlow()
    
    private val _soundEnabled = MutableStateFlow(getSoundEnabled())
    val soundEnabled: StateFlow<Boolean> = _soundEnabled.asStateFlow()
    
    private val _vibrationEnabled = MutableStateFlow(getVibrationEnabled())
    val vibrationEnabled: StateFlow<Boolean> = _vibrationEnabled.asStateFlow()
    
    // Theme settings
    private val _darkModeEnabled = MutableStateFlow(getDarkModeEnabled())
    val darkModeEnabled: StateFlow<Boolean> = _darkModeEnabled.asStateFlow()
    
    // Auto-start settings
    private val _autoStartBreaks = MutableStateFlow(getAutoStartBreaks())
    val autoStartBreaks: StateFlow<Boolean> = _autoStartBreaks.asStateFlow()
    
    private val _autoStartWork = MutableStateFlow(getAutoStartWork())
    val autoStartWork: StateFlow<Boolean> = _autoStartWork.asStateFlow()
    
    // Getters
    private fun getWorkDuration(): Int = sharedPreferences.getInt("work_duration", 25)
    private fun getShortBreakDuration(): Int = sharedPreferences.getInt("short_break_duration", 5)
    private fun getLongBreakDuration(): Int = sharedPreferences.getInt("long_break_duration", 15)
    private fun getNotificationsEnabled(): Boolean = sharedPreferences.getBoolean("notifications_enabled", true)
    private fun getSoundEnabled(): Boolean = sharedPreferences.getBoolean("sound_enabled", true)
    private fun getVibrationEnabled(): Boolean = sharedPreferences.getBoolean("vibration_enabled", true)
    private fun getDarkModeEnabled(): Boolean = sharedPreferences.getBoolean("dark_mode_enabled", false)
    private fun getAutoStartBreaks(): Boolean = sharedPreferences.getBoolean("auto_start_breaks", false)
    private fun getAutoStartWork(): Boolean = sharedPreferences.getBoolean("auto_start_work", false)
    
    // Setters
    fun setWorkDuration(minutes: Int) {
        viewModelScope.launch {
            sharedPreferences.edit().putInt("work_duration", minutes).apply()
            _workDuration.value = minutes
        }
    }
    
    fun setShortBreakDuration(minutes: Int) {
        viewModelScope.launch {
            sharedPreferences.edit().putInt("short_break_duration", minutes).apply()
            _shortBreakDuration.value = minutes
        }
    }
    
    fun setLongBreakDuration(minutes: Int) {
        viewModelScope.launch {
            sharedPreferences.edit().putInt("long_break_duration", minutes).apply()
            _longBreakDuration.value = minutes
        }
    }
    
    fun setNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("notifications_enabled", enabled).apply()
            _notificationsEnabled.value = enabled
        }
    }
    
    fun setSoundEnabled(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("sound_enabled", enabled).apply()
            _soundEnabled.value = enabled
        }
    }
    
    fun setVibrationEnabled(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("vibration_enabled", enabled).apply()
            _vibrationEnabled.value = enabled
        }
    }
    
    fun setDarkModeEnabled(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("dark_mode_enabled", enabled).apply()
            _darkModeEnabled.value = enabled
        }
    }
    
    fun setAutoStartBreaks(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("auto_start_breaks", enabled).apply()
            _autoStartBreaks.value = enabled
        }
    }
    
    fun setAutoStartWork(enabled: Boolean) {
        viewModelScope.launch {
            sharedPreferences.edit().putBoolean("auto_start_work", enabled).apply()
            _autoStartWork.value = enabled
        }
    }
    
    /**
     * Resets all settings to default values
     */
    fun resetToDefaults() {
        viewModelScope.launch {
            sharedPreferences.edit().clear().apply()
            _workDuration.value = 25
            _shortBreakDuration.value = 5
            _longBreakDuration.value = 15
            _notificationsEnabled.value = true
            _soundEnabled.value = true
            _vibrationEnabled.value = true
            _darkModeEnabled.value = false
            _autoStartBreaks.value = false
            _autoStartWork.value = false
        }
    }
}
