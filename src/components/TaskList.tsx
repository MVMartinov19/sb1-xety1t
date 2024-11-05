import React from 'react';
import { Task } from '../lib/db';
import { Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <li key={task.id} className="py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                onStatusChange(
                  task.id!,
                  task.status === 'completed' ? 'pending' : 'completed'
                )
              }
              className="flex-shrink-0"
            >
              {task.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}>
                {task.name}
              </p>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
              <div className="mt-1 flex items-center space-x-4 text-xs">
                <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                {task.due_date && (
                  <span className="text-gray-500">
                    Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 space-x-2">
              <button
                onClick={() => onEdit(task)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id!)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}