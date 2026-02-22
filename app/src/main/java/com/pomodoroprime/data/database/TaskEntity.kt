package com.pomodoroprime.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity representing a task in the Pomodoro application
 */
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val estimatedPomodoros: Int = 1,
    val completedPomodoros: Int = 0,
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null
)
