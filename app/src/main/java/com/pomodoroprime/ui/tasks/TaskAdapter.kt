package com.pomodoroprime.ui.tasks

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.pomodoroprime.R
import com.pomodoroprime.data.database.TaskEntity
import com.pomodoroprime.databinding.ItemTaskBinding

/**
 * Adapter for the Tasks RecyclerView
 */
class TaskAdapter(
    private val onTaskClick: (TaskEntity) -> Unit,
    private val onTaskLongClick: (TaskEntity) -> Unit,
    private val onTaskSelect: (TaskEntity) -> Unit,
    private val onTaskComplete: (TaskEntity) -> Unit,
    private val onTaskDelete: (TaskEntity) -> Unit
) : ListAdapter<TaskEntity, TaskAdapter.TaskViewHolder>(TaskDiffCallback()) {
    
    private var selectedTaskId: Long? = null
    
    fun setSelectedTaskId(taskId: Long?) {
        selectedTaskId = taskId
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val binding = ItemTaskBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return TaskViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        val task = getItem(position)
        holder.bind(task, selectedTaskId)
    }
    
    inner class TaskViewHolder(
        private val binding: ItemTaskBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(task: TaskEntity, selectedTaskId: Long?) {
            binding.apply {
                tvTaskTitle.text = task.title
                tvTaskDescription.text = task.description
                
                // Pomodoro progress
                tvPomodoroProgress.text = "${task.completedPomodoros}/${task.estimatedPomodoros}"
                progressPomodoro.max = task.estimatedPomodoros
                progressPomodoro.progress = task.completedPomodoros
                
                // Completed state
                if (task.isCompleted) {
                    tvTaskTitle.paintFlags = tvTaskTitle.paintFlags or android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
                    btnComplete.setImageResource(R.drawable.ic_check_circle_filled)
                    root.alpha = 0.7f
                } else {
                    tvTaskTitle.paintFlags = tvTaskTitle.paintFlags and android.graphics.Paint.STRIKE_THRU_TEXT_FLAG.inv()
                    btnComplete.setImageResource(R.drawable.ic_check_circle_outline)
                    root.alpha = 1f
                }
                
                // Selected state
                if (task.id == selectedTaskId) {
                    root.setBackgroundColor(
                        ContextCompat.getColor(root.context, R.color.task_selected)
                    )
                    btnSelect.visibility = View.VISIBLE
                } else {
                    root.setBackgroundColor(
                        ContextCompat.getColor(root.context, R.color.task_background)
                    )
                    btnSelect.visibility = View.GONE
                }
                
                // Click listeners
                root.setOnClickListener {
                    onTaskClick(task)
                }
                
                root.setOnLongClickListener {
                    onTaskLongClick(task)
                    true
                }
                
                btnSelect.setOnClickListener {
                    onTaskSelect(task)
                }
                
                btnComplete.setOnClickListener {
                    onTaskComplete(task)
                }
                
                btnDelete.setOnClickListener {
                    onTaskDelete(task)
                }
            }
        }
    }
    
    class TaskDiffCallback : DiffUtil.ItemCallback<TaskEntity>() {
        override fun areItemsTheSame(oldItem: TaskEntity, newItem: TaskEntity): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: TaskEntity, newItem: TaskEntity): Boolean {
            return oldItem == newItem
        }
    }
}
