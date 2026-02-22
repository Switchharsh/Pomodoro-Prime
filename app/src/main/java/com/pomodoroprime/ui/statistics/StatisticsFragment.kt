package com.pomodoroprime.ui.statistics

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import com.pomodoroprime.databinding.FragmentStatisticsBinding
import kotlinx.coroutines.launch

/**
 * Fragment for the Statistics screen
 */
class StatisticsFragment : Fragment() {
    
    private var _binding: FragmentStatisticsBinding? = null
    private val binding get() = _binding!!
    
    private val statisticsViewModel: StatisticsViewModel by activityViewModels()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentStatisticsBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        observeStatistics()
        
        // Refresh button
        binding.btnRefresh.setOnClickListener {
            statisticsViewModel.loadStatistics()
        }
    }
    
    private fun observeStatistics() {
        // Total statistics
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.totalWorkSessions.collect { count ->
                binding.tvTotalSessions.text = "$count"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.totalWorkDuration.collect { duration ->
                binding.tvTotalDuration.text = statisticsViewModel.formatDuration(duration)
            }
        }
        
        // Today's statistics
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.todayWorkSessions.collect { count ->
                binding.tvTodaySessions.text = "$count"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.todayWorkDuration.collect { duration ->
                binding.tvTodayDuration.text = statisticsViewModel.formatDuration(duration)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            launch {
                binding.tvTodayDate.text = statisticsViewModel.getTodayDateString()
            }
        }
        
        // Week's statistics
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.weekWorkSessions.collect { count ->
                binding.tvWeekSessions.text = "$count"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.weekWorkDuration.collect { duration ->
                binding.tvWeekDuration.text = statisticsViewModel.formatDuration(duration)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            launch {
                binding.tvWeekRange.text = statisticsViewModel.getWeekRangeString()
            }
        }
        
        // Month's statistics
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.monthWorkSessions.collect { count ->
                binding.tvMonthSessions.text = "$count"
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            statisticsViewModel.monthWorkDuration.collect { duration ->
                binding.tvMonthDuration.text = statisticsViewModel.formatDuration(duration)
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            launch {
                binding.tvMonthName.text = statisticsViewModel.getMonthString()
            }
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
