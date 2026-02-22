package com.pomodoroprime.data.repository

import com.pomodoroprime.data.database.PomodoroDatabase
import com.pomodoroprime.data.database.SessionEntity
import kotlinx.coroutines.flow.Flow

/**
 * Repository for Session operations
 */
class SessionRepository(private val database: PomodoroDatabase) {
    
    private val sessionDao = database.sessionDao()
    
    fun getAllSessions(): Flow<List<SessionEntity>> = sessionDao.getAllSessions()
    
    fun getSessionsByTask(taskId: Long): Flow<List<SessionEntity>> = sessionDao.getSessionsByTask(taskId)
    
    fun getSessionsByType(timerType: String): Flow<List<SessionEntity>> = sessionDao.getSessionsByType(timerType)
    
    fun getSessionsByDateRange(startDate: Long, endDate: Long): Flow<List<SessionEntity>> = 
        sessionDao.getSessionsByDateRange(startDate, endDate)
    
    suspend fun getTotalWorkSessionsCount(): Int = sessionDao.getTotalWorkSessionsCount()
    
    suspend fun getTotalWorkDuration(): Long? = sessionDao.getTotalWorkDuration()
    
    suspend fun getWorkSessionsCountToday(startDate: Long): Int = sessionDao.getWorkSessionsCountToday(startDate)
    
    suspend fun insertSession(session: SessionEntity): Long = sessionDao.insertSession(session)
    
    suspend fun updateSession(session: SessionEntity) = sessionDao.updateSession(session)
    
    suspend fun deleteSession(session: SessionEntity) = sessionDao.deleteSession(session)
    
    suspend fun deleteSessionById(sessionId: Long) = sessionDao.deleteSessionById(sessionId)
    
    suspend fun deleteSessionsBefore(beforeDate: Long) = sessionDao.deleteSessionsBefore(beforeDate)
}
