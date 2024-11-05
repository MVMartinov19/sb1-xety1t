import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, dbTasks } from './lib/db';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { CheckCircle2, ListTodo, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'completed'>(
    'all'
  );

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => dbTasks.getAll(),
  });

  const createTask = useMutation({
    mutationFn: (newTask: Omit<Task, 'id'>) => dbTasks.create(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      setShowAddForm(false);
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...task }: Task) => dbTasks.update(id!, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
      setEditingTask(null);
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: number) => dbTasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
  });

  const filteredTasks = tasks.filter((task: Task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your daily tasks and stay organized
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Task
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ListTodo className="h-5 w-5 mr-2" />
                All Tasks
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Pending
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Completed
              </button>
            </div>

            {showAddForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Task
                </h2>
                <TaskForm
                  onSubmit={(data) => createTask.mutate(data)}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}

            {editingTask && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Task
                </h2>
                <TaskForm
                  initialData={editingTask}
                  onSubmit={(data) =>
                    updateTask.mutate({ ...data, id: editingTask.id! })
                  }
                  onCancel={() => setEditingTask(null)}
                />
              </div>
            )}

            <TaskList
              tasks={filteredTasks}
              onEdit={setEditingTask}
              onDelete={(id) => deleteTask.mutate(id)}
              onStatusChange={(id, status) =>
                updateTask.mutate({ id, status } as Task)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;