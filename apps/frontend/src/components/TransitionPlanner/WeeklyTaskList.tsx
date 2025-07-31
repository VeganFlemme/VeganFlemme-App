import React, { useState } from 'react';
import { TransitionTask, Resource } from '../../types';
import { Check, Calendar, Clock, Book, Video, FileText, ExternalLink, Plus } from 'react-feather';

interface WeeklyTaskListProps {
  tasks: TransitionTask[];
  onTaskToggle: (taskId: string, isCompleted: boolean) => void;
  onAddTask?: (description: string, type: 'learning' | 'cooking' | 'shopping' | 'habit', dueDate: Date) => void;
  onDeleteTask?: (taskId: string) => void;
}

const WeeklyTaskList: React.FC<WeeklyTaskListProps> = ({
  tasks,
  onTaskToggle,
  onAddTask,
  onDeleteTask
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState<'learning' | 'cooking' | 'shopping' | 'habit'>('learning');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleAddTask = () => {
    if (!newTaskDesc.trim() || !onAddTask) return;
    
    onAddTask(newTaskDesc, newTaskType, new Date(newTaskDueDate));
    setNewTaskDesc('');
    setNewTaskType('learning');
    setShowAddTask(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learning':
        return <Book size={16} />;
      case 'cooking':
        return <FileText size={16} />;
      case 'shopping':
        return <FileText size={16} />;
      case 'habit':
        return <Check size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText size={14} />;
      case 'video':
        return <Video size={14} />;
      case 'recipe':
        return <FileText size={14} />;
      case 'book':
        return <Book size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'cooking':
        return 'bg-yellow-100 text-yellow-800';
      case 'shopping':
        return 'bg-purple-100 text-purple-800';
      case 'habit':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (date: Date): boolean => {
    return new Date(date) < new Date() && date.toDateString() !== new Date().toDateString();
  };

  const formatDueDate = (date: Date): string => {
    const today = new Date();
    const dueDate = new Date(date);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return dueDate.toLocaleDateString();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completed status first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    // Then sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="weekly-task-list">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Weekly Tasks</h2>
        {onAddTask && (
          <button
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center"
            onClick={() => setShowAddTask(!showAddTask)}
          >
            <Plus size={16} className="mr-1" />
            Add Task
          </button>
        )}
      </div>
      
      {showAddTask && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-md font-medium mb-3">New Task</h3>
          <div className="space-y-3">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Task description..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                >
                  <option value="learning">Learning</option>
                  <option value="cooking">Cooking</option>
                  <option value="shopping">Shopping</option>
                  <option value="habit">Habit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={handleAddTask}
                disabled={!newTaskDesc.trim()}
              >
                Add Task
              </button>
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {sortedTasks.length === 0 ? (
        <p className="text-gray-500 italic">No tasks scheduled for this week.</p>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-4 ${
                task.isCompleted ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                    task.isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300'
                  } flex items-center justify-center mr-3 cursor-pointer`}
                  onClick={() => onTaskToggle(task.id, !task.isCompleted)}
                >
                  {task.isCompleted && <Check size={16} />}
                </div>
                
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(task.type)}`}>
                      <div className="flex items-center">
                        {getTypeIcon(task.type)}
                        <span className="ml-1 capitalize">{task.type}</span>
                      </div>
                    </span>
                    
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                      isOverdue(task.dueDate) && !task.isCompleted
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Calendar size={14} className="mr-1" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                  
                  <p className={`${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.description}
                  </p>
                  
                  {task.resources && task.resources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Resources:</p>
                      <div className="space-y-1">
                        {task.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {getResourceIcon(resource.type)}
                            <span className="ml-1">{resource.title}</span>
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {onDeleteTask && (
                  <button
                    className="text-gray-400 hover:text-red-600 ml-2"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyTaskList;