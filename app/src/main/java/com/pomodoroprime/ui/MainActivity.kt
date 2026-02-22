package com.pomodoroprime.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.pomodoroprime.R
import com.pomodoroprime.databinding.ActivityMainBinding

/**
 * Main activity for the Pomodoro application
 */
class MainActivity : AppCompatActivity() {
    
    private var _binding: ActivityMainBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        _binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupNavigation()
    }
    
    private fun setupNavigation() {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController
        
        binding.bottomNavigation.setupWithNavController(navController)
        
        // Update title based on current destination
        navController.addOnDestinationChangedListener { _, destination, _ ->
            val title = when (destination.id) {
                R.id.timerFragment -> "Pomodoro Timer"
                R.id.tasksFragment -> "Tasks"
                R.id.statisticsFragment -> "Statistics"
                R.id.settingsFragment -> "Settings"
                else -> "Pomodoro Prime"
            }
            supportActionBar?.title = title
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        _binding = null
    }
}
