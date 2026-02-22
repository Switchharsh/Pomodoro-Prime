package com.pomodoroprime.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SeekBar
import androidx.appcompat.app.AppCompatDelegate
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.pomodoroprime.databinding.FragmentSettingsBinding
import kotlinx.coroutines.launch

/**
 * Fragment for the Settings screen
 */
class SettingsFragment : Fragment() {
    
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!
    
    private val settingsViewModel: SettingsViewModel by activityViewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupSeekBars()
        setupSwitches()
        observeSettings()
    }
    
    private fun setupSeekBars() {
        // Work duration
        binding.seekBarWorkDuration.max = 60 - 5 // 5 to 60 minutes
        binding.seekBarWorkDuration.progress = settingsViewModel.workDuration.value - 5
        binding.tvWorkDurationValue.text = "${settingsViewModel.workDuration.value} min"
        
        binding.seekBarWorkDuration.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val duration = progress + 5
                binding.tvWorkDurationValue.text = "$duration min"
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                val duration = seekBar?.progress?.plus(5) ?: 25
                settingsViewModel.setWorkDuration(duration)
            }
        })
        
        // Short break duration
        binding.seekBarShortBreakDuration.max = 15 - 1 // 1 to 15 minutes
        binding.seekBarShortBreakDuration.progress = settingsViewModel.shortBreakDuration.value - 1
        binding.tvShortBreakDurationValue.text = "${settingsViewModel.shortBreakDuration.value} min"
        
        binding.seekBarShortBreakDuration.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val duration = progress + 1
                binding.tvShortBreakDurationValue.text = "$duration min"
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                val duration = seekBar?.progress?.plus(1) ?: 5
                settingsViewModel.setShortBreakDuration(duration)
            }
        })
        
        // Long break duration
        binding.seekBarLongBreakDuration.max = 45 - 10 // 10 to 45 minutes
        binding.seekBarLongBreakDuration.progress = settingsViewModel.longBreakDuration.value - 10
        binding.tvLongBreakDurationValue.text = "${settingsViewModel.longBreakDuration.value} min"
        
        binding.seekBarLongBreakDuration.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val duration = progress + 10
                binding.tvLongBreakDurationValue.text = "$duration min"
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            
            override fun onStopTrackingTouch(seekBar: SeekBar?) {
                val duration = seekBar?.progress?.plus(10) ?: 15
                settingsViewModel.setLongBreakDuration(duration)
            }
        })
    }
    
    private fun setupSwitches() {
        // Notifications
        binding.switchNotifications.isChecked = settingsViewModel.notificationsEnabled.value
        binding.switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setNotificationsEnabled(isChecked)
        }
        
        // Sound
        binding.switchSound.isChecked = settingsViewModel.soundEnabled.value
        binding.switchSound.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setSoundEnabled(isChecked)
        }
        
        // Vibration
        binding.switchVibration.isChecked = settingsViewModel.vibrationEnabled.value
        binding.switchVibration.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setVibrationEnabled(isChecked)
        }
        
        // Dark mode
        binding.switchDarkMode.isChecked = settingsViewModel.darkModeEnabled.value
        binding.switchDarkMode.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setDarkModeEnabled(isChecked)
            updateTheme(isChecked)
        }
        
        // Auto-start breaks
        binding.switchAutoStartBreaks.isChecked = settingsViewModel.autoStartBreaks.value
        binding.switchAutoStartBreaks.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setAutoStartBreaks(isChecked)
        }
        
        // Auto-start work
        binding.switchAutoStartWork.isChecked = settingsViewModel.autoStartWork.value
        binding.switchAutoStartWork.setOnCheckedChangeListener { _, isChecked ->
            settingsViewModel.setAutoStartWork(isChecked)
        }
        
        // Reset to defaults
        binding.btnResetDefaults.setOnClickListener {
            settingsViewModel.resetToDefaults()
            // Update UI to reflect defaults
            updateUI()
        }
    }
    
    private fun observeSettings() {
        viewLifecycleOwner.lifecycleScope.launch {
            settingsViewModel.workDuration.collect { duration ->
                binding.seekBarWorkDuration.progress = duration - 5
                binding.tvWorkDurationValue.text = "$duration min"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            settingsViewModel.shortBreakDuration.collect { duration ->
                binding.seekBarShortBreakDuration.progress = duration - 1
                binding.tvShortBreakDurationValue.text = "$duration min"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            settingsViewModel.longBreakDuration.collect { duration ->
                binding.seekBarLongBreakDuration.progress = duration - 10
                binding.tvLongBreakDurationValue.text = "$duration min"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            settingsViewModel.darkModeEnabled.collect { enabled ->
                binding.switchDarkMode.isChecked = enabled
            }
        }
    }
    
    private fun updateTheme(isDarkMode: Boolean) {
        if (isDarkMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }
    }
    
    private fun updateUI() {
        binding.seekBarWorkDuration.progress = 25 - 5
        binding.tvWorkDurationValue.text = "25 min"
        
        binding.seekBarShortBreakDuration.progress = 5 - 1
        binding.tvShortBreakDurationValue.text = "5 min"
        
        binding.seekBarLongBreakDuration.progress = 15 - 10
        binding.tvLongBreakDurationValue.text = "15 min"
        
        binding.switchNotifications.isChecked = true
        binding.switchSound.isChecked = true
        binding.switchVibration.isChecked = true
        binding.switchDarkMode.isChecked = false
        binding.switchAutoStartBreaks.isChecked = false
        binding.switchAutoStartWork.isChecked = false
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
