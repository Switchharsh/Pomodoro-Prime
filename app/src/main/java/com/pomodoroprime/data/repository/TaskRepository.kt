package com.pomodoroprime.data.repository

import com.pomodoroprime.data.database.PomodoroDatabase
import com.pomodoroprime.data.database.TaskEntity
import kotlinx.coroutines.flow.Flow

/**
 * Repository for Task operations
 */
class TaskRepository(private val database: PomodoroDatabase) {
    
    private val taskDao = database.taskDao()
    
    fun getAllTasks(): Flow<List<TaskEntity>> = taskDao.getAllTasks()
    
    fun getActiveTasks(): Flow<List<TaskEntity>> = taskDao.getActiveTasks()
    
    fun getCompletedTasks(): Flow<List<TaskEntity>> = taskDao.getCompletedTasks()
    
    suspend fun getTaskById(taskId: Long): TaskEntity? = taskDao.getTaskById(taskId)
    
    suspend fun insertTask(task: TaskEntity): Long = taskDao.insertTask(task)
    
    suspend fun updateTask(task: TaskEntity) = taskDao.updateTask(task)
    
    suspend fun deleteTask(task: TaskEntity) = taskDao.deleteTask(task)
    
    suspend fun deleteTaskById(taskId: Long) = taskDao.deleteTaskById(taskId)
    
    suspend fun incrementPomodoros(taskId: Long) = taskDao.incrementPomodoros(taskId)
    
    suspend fun markAsCompleted(taskId: Long) = taskDao.markAsCompleted(taskId)
    
    suspend fun markAsIncomplete(taskId: Long) = taskDao.markAsIncomplete(taskId)
}
