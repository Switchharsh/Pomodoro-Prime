package com.pomodoroprime.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity representing a completed Pomodoro session
 */
@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val taskId: Long? = null,  // Optional: associated task
    val timerType: String,     // "WORK", "SHORT_BREAK", "LONG_BREAK"
    val duration: Long,         // Duration in milliseconds
    val startedAt: Long,
    val completedAt: Long,
    val wasInterrupted: Boolean = false
)
