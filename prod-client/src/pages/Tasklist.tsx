import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { getApiEndpoint, API_ENDPOINTS } from "@/lib/api";

interface Task {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task, newText: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle(task);
      setIsAnimating(false);
    }, 150);
  };

  const handleEdit = () => {
    if (editText.trim() && editText !== task.text) {
      onEdit(task, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEdit();
    else if (e.key === "Escape") handleCancel();
  };

  return (
    <div
      className={`group flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
        task.completed
          ? "bg-green-50 border-green-200 opacity-75"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isAnimating ? "transform scale-105" : ""}`}
    >
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${
          task.completed
            ? "text-green-500"
            : "text-gray-400 hover:text-green-500"
        }`}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              size="sm"
              onClick={handleEdit}
              className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="h-7 w-7 p-0 hover:bg-red-50"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <span
            className={`block text-sm transition-all duration-300 ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.text}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task._id)}
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

const TaskList: React.FC = () => {
  const API_URL = getApiEndpoint(API_ENDPOINTS.TASKS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  const isValidToken = (token: string | null): boolean => {
    if (!token) return false;
    // Basic JWT validation - check if it starts with eyJ (typical JWT format)
    return token.startsWith('eyJ') && token.split('.').length === 3;
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    setError("Session expired. Please login again.");
    setTasks([]);
  };

  const checkAuthentication = (): boolean => {
    const token = getToken();
    if (!token || !isValidToken(token)) {
      setError("Please login to access tasks");
      setTasks([]);
      setLoading(false);
      return false;
    }
    return true;
  };

  const fetchTasks = async () => {
    if (!checkAuthentication()) return;

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const res = await fetch(API_URL, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    
    if (!checkAuthentication()) return;
    
    setOperationLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Please login to add tasks");
        return;
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newTaskText.trim() }),
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to add task: ${res.status} ${errorData.message || ''}`);
      }

      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTaskText("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task. Please try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!checkAuthentication()) return;

    try {
      const token = getToken();
      if (!token) {
        setError("Please login to update tasks");
        return;
      }

      const res = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.status}`);
      }

      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error("Error toggling task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const editTask = async (task: Task, newText: string) => {
    if (!checkAuthentication()) return;

    try {
      const token = getToken();
      if (!token) {
        setError("Please login to edit tasks");
        return;
      }

      const res = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to edit task: ${res.status}`);
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, text: newText } : t))
      );
    } catch (error) {
      console.error("Error editing task:", error);
      setError("Failed to edit task. Please try again.");
    }
  };

  const deleteTask = async (id: string) => {
    if (!checkAuthentication()) return;

    try {
      const token = getToken();
      if (!token) {
        setError("Please login to delete tasks");
        return;
      }

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to delete task: ${res.status}`);
      }

      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  useEffect(() => {
    // Wait briefly to ensure token is stored after login
    const timer = setTimeout(() => {
      fetchTasks();
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTask();
    else if (e.key === "Escape") {
      setNewTaskText("");
      setIsAdding(false);
    }
  };

  const startAdding = () => {
    if (!checkAuthentication()) return;
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login'; // Adjust this to your login route
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const hasValidToken = isValidToken(getToken());

  if (!hasValidToken) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-gray-600 mb-4 font-medium">
            Authentication required
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please login to access your tasks
          </p>
          <Button 
            onClick={handleLoginRedirect}
            className="flex items-center gap-2 mx-auto"
          >
            <LogIn className="w-4 h-4" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (error && !hasValidToken) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 mb-4 font-medium">{error}</div>
          <div className="space-x-3">
            <Button onClick={handleLoginRedirect} className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </Button>
            <Button onClick={fetchTasks} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Task List</h3>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Add Task Section */}
        {isAdding ? (
          <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter a new task..."
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={operationLoading}
            />
            <Button
              onClick={addTask}
              size="sm"
              className="bg-green-500 hover:bg-green-600 h-7 w-7 p-0"
              disabled={!newTaskText.trim() || operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewTaskText("");
              }}
              size="sm"
              variant="outline"
              className="hover:bg-red-50 h-7 w-7 p-0"
              disabled={operationLoading}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={startAdding}
            variant="outline"
            className="w-full py-2 mb-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-sm"
            disabled={operationLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        )}

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-3">
            <div className="flex items-center text-red-700 text-xs">
              <AlertCircle className="w-3 h-3 mr-2" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Task List - Scrollable */}
      <div className={`flex-1 min-h-0 ${tasks.length > 3 ? 'overflow-y-auto' : ''} space-y-2`}>
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet. Add one to get started!</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task._id}
              className="animate-in slide-in-from-right duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskItem
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Stats - Fixed */}
      {tasks.length > 0 && (
        <div className="flex-shrink-0 pt-3 border-t mt-3">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {tasks.filter((t) => !t.completed).length} remaining
            </span>
            <span>{completedCount} completed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;