package com.pomodoroprime.ui.tasks

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.pomodoroprime.R
import com.pomodoroprime.databinding.FragmentTasksBinding
import com.pomodoroprime.ui.timer.TimerViewModel
import kotlinx.coroutines.launch

/**
 * Fragment for the Tasks screen
 */
class TasksFragment : Fragment() {
    
    private var _binding: FragmentTasksBinding? = null
    private val binding get() = _binding!!
    
    private val tasksViewModel: TasksViewModel by activityViewModels()
    private val timerViewModel: TimerViewModel by activityViewModels()
    
    private lateinit var taskAdapter: TaskAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTasksBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupClickListeners()
        observeTasks()
        observeDialogs()
    }
    
    private fun setupRecyclerView() {
        taskAdapter = TaskAdapter(
            onTaskClick = { task ->
                // Show task details or edit dialog
                showEditTaskDialog(task)
            },
            onTaskLongClick = { task ->
                // Show context menu
                showTaskContextMenu(task)
            },
            onTaskSelect = { task ->
                // Select task for timer
                tasksViewModel.selectTask(task.id)
                timerViewModel.setCurrentTask(task.id)
            },
            onTaskComplete = { task ->
                if (task.isCompleted) {
                    tasksViewModel.markAsIncomplete(task.id)
                } else {
                    tasksViewModel.markAsCompleted(task.id)
                }
            },
            onTaskDelete = { task ->
                showDeleteConfirmationDialog(task)
            }
        )
        
        binding.recyclerViewTasks.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = taskAdapter
        }
    }
    
    private fun setupClickListeners() {
        binding.fabAddTask.setOnClickListener {
            showAddTaskDialog()
        }
        
        binding.tabActive.setOnClickListener {
            binding.tabActive.isSelected = true
            binding.tabCompleted.isSelected = false
            observeActiveTasks()
        }
        
        binding.tabCompleted.setOnClickListener {
            binding.tabActive.isSelected = false
            binding.tabCompleted.isSelected = true
            observeCompletedTasks()
        }
    }
    
    private fun observeTasks() {
        observeActiveTasks()
    }
    
    private fun observeActiveTasks() {
        viewLifecycleOwner.lifecycleScope.launch {
            tasksViewModel.activeTasks.collect { tasks ->
                taskAdapter.submitList(tasks)
                updateEmptyState(tasks.isEmpty())
            }
        }
    }
    
    private fun observeCompletedTasks() {
        viewLifecycleOwner.lifecycleScope.launch {
            tasksViewModel.completedTasks.collect { tasks ->
                taskAdapter.submitList(tasks)
                updateEmptyState(tasks.isEmpty())
            }
        }
    }
    
    private fun observeDialogs() {
        viewLifecycleOwner.lifecycleScope.launch {
            tasksViewModel.showAddTaskDialog.collect { show ->
                if (show) {
                    showAddTaskDialog()
                    tasksViewModel.hideAddTaskDialog()
                }
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            tasksViewModel.showEditTaskDialog.collect { task ->
                task?.let {
                    showEditTaskDialog(it)
                    tasksViewModel.hideEditTaskDialog()
                }
            }
        }
    }
    
    private fun showAddTaskDialog() {
        val dialogView = LayoutInflater.from(requireContext())
            .inflate(R.layout.dialog_add_task, null)
        
        val etTitle = dialogView.findViewById<EditText>(R.id.etTaskTitle)
        val etDescription = dialogView.findViewById<EditText>(R.id.etTaskDescription)
        val etPomodoros = dialogView.findViewById<EditText>(R.id.etEstimatedPomodoros)
        
        AlertDialog.Builder(requireContext())
            .setTitle("Add New Task")
            .setView(dialogView)
            .setPositiveButton("Add") { _, _ ->
                val title = etTitle.text.toString()
                val description = etDescription.text.toString()
                val pomodoros = etPomodoros.text.toString().toIntOrNull() ?: 1
                
                if (title.isNotBlank()) {
                    tasksViewModel.addTask(title, description, pomodoros)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun showEditTaskDialog(task: com.pomodoroprime.data.database.TaskEntity) {
        val dialogView = LayoutInflater.from(requireContext())
            .inflate(R.layout.dialog_add_task, null)
        
        val etTitle = dialogView.findViewById<EditText>(R.id.etTaskTitle)
        val etDescription = dialogView.findViewById<EditText>(R.id.etTaskDescription)
        val etPomodoros = dialogView.findViewById<EditText>(R.id.etEstimatedPomodoros)
        
        etTitle.setText(task.title)
        etDescription.setText(task.description)
        etPomodoros.setText(task.estimatedPomodoros.toString())
        
        AlertDialog.Builder(requireContext())
            .setTitle("Edit Task")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val title = etTitle.text.toString()
                val description = etDescription.text.toString()
                val pomodoros = etPomodoros.text.toString().toIntOrNull() ?: 1
                
                if (title.isNotBlank()) {
                    val updatedTask = task.copy(
                        title = title,
                        description = description,
                        estimatedPomodoros = pomodoros
                    )
                    tasksViewModel.updateTask(updatedTask)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun showTaskContextMenu(task: com.pomodoroprime.data.database.TaskEntity) {
        val options = arrayOf("Edit", "Delete", "Mark as ${if (task.isCompleted) "Incomplete" else "Complete"}")
        
        AlertDialog.Builder(requireContext())
            .setTitle(task.title)
            .setItems(options) { _, which ->
                when (which) {
                    0 -> showEditTaskDialog(task)
                    1 -> showDeleteConfirmationDialog(task)
                    2 -> {
                        if (task.isCompleted) {
                            tasksViewModel.markAsIncomplete(task.id)
                        } else {
                            tasksViewModel.markAsCompleted(task.id)
                        }
                    }
                }
            }
            .show()
    }
    
    private fun showDeleteConfirmationDialog(task: com.pomodoroprime.data.database.TaskEntity) {
        AlertDialog.Builder(requireContext())
            .setTitle("Delete Task")
            .setMessage("Are you sure you want to delete \"${task.title}\"?")
            .setPositiveButton("Delete") { _, _ ->
                tasksViewModel.deleteTask(task)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun updateEmptyState(isEmpty: Boolean) {
        if (isEmpty) {
            binding.recyclerViewTasks.visibility = View.GONE
            binding.layoutEmptyState.visibility = View.VISIBLE
        } else {
            binding.recyclerViewTasks.visibility = View.VISIBLE
            binding.layoutEmptyState.visibility = View.GONE
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
