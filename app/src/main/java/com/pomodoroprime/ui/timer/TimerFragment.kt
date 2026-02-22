package com.pomodoroprime.ui.timer

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.pomodoroprime.R
import com.pomodoroprime.databinding.FragmentTimerBinding
import com.pomodoroprime.ui.tasks.TasksViewModel
import kotlinx.coroutines.launch

/**
 * Fragment for the main Timer screen
 */
class TimerFragment : Fragment() {
    
    private var _binding: FragmentTimerBinding? = null
    private val binding get() = _binding!!
    
    private val timerViewModel: TimerViewModel by activityViewModels()
    private val tasksViewModel: TasksViewModel by activityViewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTimerBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupClickListeners()
        observeTimerState()
    }
    
    private fun setupClickListeners() {
        binding.btnStartPause.setOnClickListener {
            if (timerViewModel.isRunning.value) {
                timerViewModel.pauseTimer()
            } else {
                timerViewModel.startTimer()
            }
        }
        
        binding.btnReset.setOnClickListener {
            timerViewModel.resetTimer()
        }
        
        binding.btnStop.setOnClickListener {
            timerViewModel.stopTimer()
        }
        
        binding.btnSkip.setOnClickListener {
            timerViewModel.skipTimer()
        }
        
        binding.btnSelectTask.setOnClickListener {
            // Navigate to tasks fragment
            // This will be handled by navigation in MainActivity
        }
    }
    
    private fun observeTimerState() {
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.timerType.collect { type ->
                binding.tvTimerType.text = timerViewModel.getTimerDisplayName()
                updateTimerColor(type)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.formattedTime.collect { time ->
                binding.tvTime.text = time
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.isRunning.collect { isRunning ->
                updateButtonState(isRunning)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.completedPomodoros.collect { count ->
                binding.tvCompletedPomodoros.text = "$count"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.currentCycle.collect { cycle ->
                binding.tvCycle.text = "Cycle $cycle/4"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.remainingTime.collect {
                timerViewModel.calculateProgress()
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            timerViewModel.progress.collect { progress ->
                binding.progressIndicator.progress = (progress * 100).toInt()
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            tasksViewModel.selectedTaskId.collect { taskId ->
                updateCurrentTaskDisplay(taskId)
            }
        }
    }
    
    private fun updateButtonState(isRunning: Boolean) {
        if (isRunning) {
            binding.btnStartPause.setImageResource(R.drawable.ic_pause)
            binding.btnStartPause.contentDescription = "Pause"
        } else {
            binding.btnStartPause.setImageResource(R.drawable.ic_play)
            binding.btnStartPause.contentDescription = "Start"
        }
    }
    
    private fun updateTimerColor(type: String) {
        val colorRes = when (type) {
            "WORK" -> R.color.timer_work
            "SHORT_BREAK" -> R.color.timer_short_break
            "LONG_BREAK" -> R.color.timer_long_break
            else -> R.color.timer_work
        }
        binding.progressIndicator.setIndicatorColorResource(colorRes)
    }
    
    private fun updateCurrentTaskDisplay(taskId: Long?) {
        if (taskId != null) {
            viewLifecycleOwner.lifecycleScope.launch {
                val task = tasksViewModel.getTaskById(taskId)
                if (task != null) {
                    binding.tvCurrentTask.text = task.title
                    binding.tvCurrentTask.visibility = View.VISIBLE
                    binding.btnSelectTask.text = "Change Task"
                } else {
                    binding.tvCurrentTask.visibility = View.GONE
                    binding.btnSelectTask.text = "Select Task"
                }
            }
        } else {
            binding.tvCurrentTask.visibility = View.GONE
            binding.btnSelectTask.text = "Select Task"
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
