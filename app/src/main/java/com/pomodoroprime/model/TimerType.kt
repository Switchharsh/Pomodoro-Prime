package com.pomodoroprime.model

/**
 * Represents the different types of timer states in the Pomodoro technique
 */
enum class TimerType {
    WORK,       // 25 minutes - focused work session
    SHORT_BREAK, // 5 minutes - short break between pomodoros
    LONG_BREAK   // 15-30 minutes - long break after 4 pomodoros
}

/**
 * Returns the default duration in milliseconds for each timer type
 */
fun TimerType.getDefaultDuration(): Long {
    return when (this) {
        TimerType.WORK -> 25 * 60 * 1000L        // 25 minutes
        TimerType.SHORT_BREAK -> 5 * 60 * 1000L  // 5 minutes
        TimerType.LONG_BREAK -> 15 * 60 * 1000L  // 15 minutes
    }
}

/**
 * Returns a user-friendly display name for each timer type
 */
fun TimerType.getDisplayName(): String {
    return when (this) {
        TimerType.WORK -> "Focus"
        TimerType.SHORT_BREAK -> "Short Break"
        TimerType.LONG_BREAK -> "Long Break"
    }
}
