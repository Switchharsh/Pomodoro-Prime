package com.pomodoroprime.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for SessionEntity
 */
@Dao
interface SessionDao {
    
    @Query("SELECT * FROM sessions ORDER BY completedAt DESC")
    fun getAllSessions(): Flow<List<SessionEntity>>
    
    @Query("SELECT * FROM sessions WHERE taskId = :taskId ORDER BY completedAt DESC")
    fun getSessionsByTask(taskId: Long): Flow<List<SessionEntity>>
    
    @Query("SELECT * FROM sessions WHERE timerType = :timerType ORDER BY completedAt DESC")
    fun getSessionsByType(timerType: String): Flow<List<SessionEntity>>
    
    @Query("SELECT * FROM sessions WHERE completedAt >= :startDate AND completedAt <= :endDate ORDER BY completedAt DESC")
    fun getSessionsByDateRange(startDate: Long, endDate: Long): Flow<List<SessionEntity>>
    
    @Query("SELECT COUNT(*) FROM sessions WHERE timerType = 'WORK'")
    suspend fun getTotalWorkSessionsCount(): Int
    
    @Query("SELECT SUM(duration) FROM sessions WHERE timerType = 'WORK'")
    suspend fun getTotalWorkDuration(): Long?
    
    @Query("SELECT COUNT(*) FROM sessions WHERE completedAt >= :startDate AND timerType = 'WORK'")
    suspend fun getWorkSessionsCountToday(startDate: Long): Int
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: SessionEntity): Long
    
    @Update
    suspend fun updateSession(session: SessionEntity)
    
    @Delete
    suspend fun deleteSession(session: SessionEntity)
    
    @Query("DELETE FROM sessions WHERE id = :sessionId")
    suspend fun deleteSessionById(sessionId: Long)
    
    @Query("DELETE FROM sessions WHERE completedAt < :beforeDate")
    suspend fun deleteSessionsBefore(beforeDate: Long)
}
