package com.pomodoroprime.notification

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.pomodoroprime.R
import com.pomodoroprime.ui.MainActivity
import com.pomodoroprime.service.TimerService

/**
 * Manages notifications for the Pomodoro application
 */
class PomodoroNotificationManager(private val context: Context) {
    
    companion object {
        private const val CHANNEL_ID = "pomodoro_timer_channel"
        private const val CHANNEL_NAME = "Pomodoro Timer"
        private const val NOTIFICATION_ID = 1001
        
        const val ACTION_START = "com.pomodoroprime.ACTION_START"
        const val ACTION_PAUSE = "com.pomodoroprime.ACTION_PAUSE"
        const val ACTION_STOP = "com.pomodoroprime.ACTION_STOP"
        const val ACTION_SKIP = "com.pomodoroprime.ACTION_SKIP"
    }
    
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    
    init {
        createNotificationChannel()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for Pomodoro timer"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    /**
     * Creates a foreground service notification for the timer
     */
    fun createTimerNotification(
        timerType: String,
        remainingTime: String,
        isRunning: Boolean
    ): Notification {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(getTitle(timerType))
            .setContentText("Time remaining: $remainingTime")
            .setSmallIcon(R.drawable.ic_timer)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
        
        // Add action buttons
        if (isRunning) {
            notificationBuilder.addAction(
                R.drawable.ic_pause,
                "Pause",
                createServicePendingIntent(ACTION_PAUSE)
            )
        } else {
            notificationBuilder.addAction(
                R.drawable.ic_play,
                "Start",
                createServicePendingIntent(ACTION_START)
            )
        }
        
        notificationBuilder.addAction(
            R.drawable.ic_stop,
            "Stop",
            createServicePendingIntent(ACTION_STOP)
        )
        
        return notificationBuilder.build()
    }
    
    /**
     * Creates a notification when a timer completes
     */
    fun createTimerCompleteNotification(timerType: String): Notification {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(getCompleteTitle(timerType))
            .setContentText(getCompleteMessage(timerType))
            .setSmallIcon(R.drawable.ic_timer)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(0, 500, 200, 500))
        
        return notificationBuilder.build()
    }
    
    /**
     * Shows a notification when a timer completes
     */
    fun showTimerCompleteNotification(timerType: String) {
        val notification = createTimerCompleteNotification(timerType)
        notificationManager.notify(NOTIFICATION_ID + 1, notification)
    }
    
    /**
     * Cancels the timer complete notification
     */
    fun cancelTimerCompleteNotification() {
        notificationManager.cancel(NOTIFICATION_ID + 1)
    }
    
    private fun createServicePendingIntent(action: String): PendingIntent {
        val intent = Intent(context, TimerService::class.java).apply {
            this.action = action
        }
        return PendingIntent.getService(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    }
    
    private fun getTitle(timerType: String): String {
        return when (timerType) {
            "WORK" -> "Focus Time"
            "SHORT_BREAK" -> "Short Break"
            "LONG_BREAK" -> "Long Break"
            else -> "Pomodoro Timer"
        }
    }
    
    private fun getCompleteTitle(timerType: String): String {
        return when (timerType) {
            "WORK" -> "Focus Session Complete!"
            "SHORT_BREAK" -> "Short Break Complete!"
            "LONG_BREAK" -> "Long Break Complete!"
            else -> "Timer Complete!"
        }
    }
    
    private fun getCompleteMessage(timerType: String): String {
        return when (timerType) {
            "WORK" -> "Time for a short break!"
            "SHORT_BREAK" -> "Ready to focus again?"
            "LONG_BREAK" -> "Ready to start a new cycle?"
            else -> "Great job!"
        }
    }
}
