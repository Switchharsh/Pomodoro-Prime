package com.pomodoroprime.ui.tasks

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pomodoroprime.data.database.PomodoroDatabase
import com.pomodoroprime.data.database.TaskEntity
import com.pomodoroprime.data.repository.TaskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the Tasks screen
 */
class TasksViewModel(application: Application) : AndroidViewModel(application) {
    
    private val context = application.applicationContext
    private val database = PomodoroDatabase.getDatabase(context)
    private val taskRepository = TaskRepository(database)
    
    // Tasks state
    val allTasks = taskRepository.getAllTasks()
    val activeTasks = taskRepository.getActiveTasks()
    val completedTasks = taskRepository.getCompletedTasks()
    
    private val _selectedTaskId = MutableStateFlow<Long?>(null)
    val selectedTaskId: StateFlow<Long?> = _selectedTaskId.asStateFlow()
    
    private val _showAddTaskDialog = MutableStateFlow(false)
    val showAddTaskDialog: StateFlow<Boolean> = _showAddTaskDialog.asStateFlow()
    
    private val _showEditTaskDialog = MutableStateFlow<TaskEntity?>(null)
    val showEditTaskDialog: StateFlow<TaskEntity?> = _showEditTaskDialog.asStateFlow()
    
    /**
     * Adds a new task
     */
    fun addTask(title: String, description: String = "", estimatedPomodoros: Int = 1) {
        viewModelScope.launch {
            val task = TaskEntity(
                title = title,
                description = description,
                estimatedPomodoros = estimatedPomodoros
            )
            taskRepository.insertTask(task)
        }
    }
    
    /**
     * Updates an existing task
     */
    fun updateTask(task: TaskEntity) {
        viewModelScope.launch {
            taskRepository.updateTask(task)
        }
    }
    
    /**
     * Deletes a task
     */
    fun deleteTask(task: TaskEntity) {
        viewModelScope.launch {
            taskRepository.deleteTask(task)
            if (_selectedTaskId.value == task.id) {
                _selectedTaskId.value = null
            }
        }
    }
    
    /**
     * Deletes a task by ID
     */
    fun deleteTaskById(taskId: Long) {
        viewModelScope.launch {
            taskRepository.deleteTaskById(taskId)
            if (_selectedTaskId.value == taskId) {
                _selectedTaskId.value = null
            }
        }
    }
    
    /**
     * Marks a task as completed
     */
    fun markAsCompleted(taskId: Long) {
        viewModelScope.launch {
            taskRepository.markAsCompleted(taskId)
        }
    }
    
    /**
     * Marks a task as incomplete
     */
    fun markAsIncomplete(taskId: Long) {
        viewModelScope.launch {
            taskRepository.markAsIncomplete(taskId)
        }
    }
    
    /**
     * Increments the pomodoro count for a task
     */
    fun incrementPomodoros(taskId: Long) {
        viewModelScope.launch {
            taskRepository.incrementPomodoros(taskId)
        }
    }
    
    /**
     * Selects a task as the current task
     */
    fun selectTask(taskId: Long?) {
        _selectedTaskId.value = taskId
    }
    
    /**
     * Shows the add task dialog
     */
    fun showAddTaskDialog() {
        _showAddTaskDialog.value = true
    }
    
    /**
     * Hides the add task dialog
     */
    fun hideAddTaskDialog() {
        _showAddTaskDialog.value = false
    }
    
    /**
     * Shows the edit task dialog
     */
    fun showEditTaskDialog(task: TaskEntity) {
        _showEditTaskDialog.value = task
    }
    
    /**
     * Hides the edit task dialog
     */
    fun hideEditTaskDialog() {
        _showEditTaskDialog.value = null
    }
    
    /**
     * Gets a task by ID
     */
    suspend fun getTaskById(taskId: Long): TaskEntity? {
        return taskRepository.getTaskById(taskId)
    }
}
