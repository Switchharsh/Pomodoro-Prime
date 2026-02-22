package com.pomodoroprime.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * Main database for the Pomodoro application
 */
@Database(
    entities = [TaskEntity::class, SessionEntity::class],
    version = 1,
    exportSchema = false
)
abstract class PomodoroDatabase : RoomDatabase() {
    
    abstract fun taskDao(): TaskDao
    abstract fun sessionDao(): SessionDao
    
    companion object {
        @Volatile
        private var INSTANCE: PomodoroDatabase? = null
        
        fun getDatabase(context: Context): PomodoroDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PomodoroDatabase::class.java,
                    "pomodoro_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
