import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Task } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  Clock, 
  AlertCircle,
  FolderMinus,
  CheckCircle2,
  ListTodo
} from "lucide-react";

export default function TasksPage() {
  const { 
    profile, 
    tasks, 
    members, 
    createTask, 
    updateTask, 
    deleteTask 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState<"development" | "design" | "testing" | "documentation">("development");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Search & Filter state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate"); // dueDate | priority | status

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("development");
    setAssigneeId("");
    setDueDate("");
    setErrorText(null);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setCategory(task.category);
    setAssigneeId(task.assigneeId);
    setDueDate(task.dueDate);
    setErrorText(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setLoading(true);
    setErrorText(null);

    try {
      if (editingTask) {
        // Edit Task
        const assignee = members.find(m => m.uid === assigneeId);
        await updateTask(editingTask.id, {
          title,
          description,
          priority,
          category,
          assigneeId,
          assigneeName: assignee ? assignee.name : "Unassigned",
          assigneeAvatar: assignee ? assignee.avatar : "",
          dueDate
        });
        setShowModal(false);
      } else {
        // Create Task
        await createTask(title, description, priority, category, assigneeId || profile?.uid || "", dueDate);
        setShowModal(false);
      }
    } catch (err: any) {
      setErrorText(err.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err: any) {
        alert(err.message || "Could not delete task.");
      }
    }
  };

  const handleStatusChange = async (taskId: string, currentStatus: "pending" | "in-progress" | "completed") => {
    const nextStatusMap: Record<string, "pending" | "in-progress" | "completed"> = {
      "pending": "in-progress",
      "in-progress": "completed",
      "completed": "pending"
    };
    try {
      await updateTask(taskId, { status: nextStatusMap[currentStatus] });
    } catch (err: any) {
      alert(err.message || "Failed to update task status.");
    }
  };

  // Filter Logic
  let filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterCategory !== "all" && task.category !== filterCategory) return false;
    if (filterAssignee !== "all" && task.assigneeId !== filterAssignee) return false;
    return true;
  });

  // Sorting Logic
  filteredTasks.sort((a, b) => {
    if (sortBy === "dueDate") {
      return a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === "priority") {
      const pLevel = { high: 3, medium: 2, low: 1 };
      return (pLevel[b.priority] || 0) - (pLevel[a.priority] || 0);
    } else if (sortBy === "status") {
      const sLevel = { pending: 1, "in-progress": 2, completed: 3 };
      return (sLevel[a.status] || 0) - (sLevel[b.status] || 0);
    }
    return 0;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "high": return "bg-rose-50 text-rose-700 border border-rose-200";
      case "medium": return "bg-amber-50 text-amber-700 border border-amber-200";
      default: return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="tasks-page-view">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Workspace / Core Assignments</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Workspace Tasks</h1>
        </div>
        <button
          id="btn-add-task"
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md border border-blue-500/25 shadow-md shadow-blue-600/10 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create New Task
        </button>
      </div>

      {/* Grid Filter controls */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4" id="filters-panel">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
          <Filter className="h-3.5 w-3.5 text-blue-600" /> Filters & Categorization
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">STATUS</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">PRIORITY</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">CATEGORY</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="testing">Testing</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">ASSIGNEE</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium outline-none cursor-pointer"
            >
              <option value="all">All Team Members</option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">SORT BY</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-medium outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List container */}
      <div className="bg-white rounded-lg border border-slate-205 shadow-sm overflow-hidden" id="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
            <FolderMinus className="h-10 w-10 text-slate-300" />
            <span>No tasks match these filters. Try modifying your criteria!</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isCreator = profile?.uid === task.createdBy;
              return (
                <div 
                  key={task.id} 
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 flex items-start gap-3">
                    {/* Status Checkbox Button */}
                    <button 
                      title="Toggle Status"
                      onClick={() => handleStatusChange(task.id, task.status)}
                      className={`mt-1 h-5 w-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                        task.status === "completed" 
                          ? "border-emerald-550 bg-emerald-555 text-white" 
                          : task.status === "in-progress"
                          ? "border-amber-500 text-amber-500"
                          : "border-slate-350 hover:border-blue-600"
                      }`}
                    >
                      {task.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold text-slate-800 ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl line-clamp-2">
                        {task.description || "No description set."}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px]">
                        <span className={`uppercase font-bold px-2.5 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium capitalize">
                          {task.category}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" /> Due {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right tools and assignee */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t border-slate-50 sm:border-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2.5">
                      {task.assigneeAvatar ? (
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={task.assigneeAvatar} 
                            alt={task.assigneeName} 
                            className="h-7 w-7 rounded-lg border border-slate-200 bg-slate-50"
                          />
                          <span className="text-xs text-slate-500 font-semibold max-w-20 truncate">{task.assigneeName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4">
                      {isCreator ? (
                        <>
                          <button
                            title="Edit"
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic cursor-default select-none">View Only</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-100">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingTask ? "Edit Workspace Task" : "Add Workspace Task"}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Close</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorText && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 font-semibold animate-in fade-in">
                  ⚠️ {errorText}
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1">TASK TITLE</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                  placeholder="Review schema definitions"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">DESCRIPTION</label>
                <textarea 
                  value={description}
                  rows={3} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                  placeholder="Review indices or rules checks"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">PRIORITY</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">CATEGORY</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">ASSIGNEE</label>
                  <select 
                    value={assigneeId} 
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.uid} value={m.uid}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">DUE DATE</label>
                  <input 
                    type="date" 
                    required
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-205 rounded outline-none" 
                  />
                </div>
              </div>

              {!profile?.isPremium && !editingTask && (
                <div className="p-3 bg-blue-50/50 border border-blue-150 rounded text-blue-700 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Tier Note:</strong> Workspaces have a limit of 5 tasks. Upgrade anytime to lift limits.
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition-all cursor-pointer"
              >
                {loading ? "Saving..." : editingTask ? "Save Details" : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
