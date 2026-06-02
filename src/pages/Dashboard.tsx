import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Plus, 
  Clock, 
  TrendingUp, 
  Compass, 
  AlertCircle,
  FileCheck2,
  ListTodo
} from "lucide-react";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    profile, 
    members, 
    tasks, 
    events, 
    channels, 
    createTask, 
    createEvent 
  } = useApp();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Quick Task Fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskCategory, setTaskCategory] = useState<"development" | "design" | "testing" | "documentation">("development");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Quick Event Fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventType, setEventType] = useState<"meeting" | "deadline" | "review" | "other">("meeting");
  const [eventPriority, setEventPriority] = useState<"low" | "medium" | "high">("medium");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) return;
    setErrorText(null);
    setLoading(true);
    try {
      await createTask(taskTitle, taskDesc, taskPriority, taskCategory, taskAssignee || profile?.uid || "", taskDueDate);
      setShowTaskModal(false);
      // Reset form
      setTaskTitle("");
      setTaskDesc("");
      setTaskPriority("medium");
      setTaskCategory("development");
      setTaskAssignee("");
      setTaskDueDate("");
    } catch (err: any) {
      setErrorText(err.message || "Could not spawn task.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventTime) return;
    setErrorText(null);
    setLoading(true);
    try {
      await createEvent(eventTitle, eventDesc, eventDate, eventTime, eventEndTime || eventTime, eventType, eventPriority, [profile?.uid || ""]);
      setShowEventModal(false);
      // Reset
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventTime("");
      setEventEndTime("");
      setEventType("meeting");
      setEventPriority("medium");
    } catch (err: any) {
      setErrorText(err.message || "Could not create event.");
    } finally {
      setLoading(false);
    }
  };

  // Compute Statistics
  const activeMembersCount = members.length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const pendingTasksCount = tasks.filter((t) => t.status !== "completed").length;
  const upcomingEventsCount = events.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-rose-50 border border-rose-150 text-rose-700";
      case "medium": return "bg-amber-50 border border-amber-150 text-amber-700";
      default: return "bg-emerald-50 border border-emerald-150 text-emerald-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Greetings block */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md shadow-blue-950/10">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white animate-in slide-in-from-top-2 duration-200">
              Hello, {profile?.name || "Team Member"}!
            </h1>
            <p className="text-slate-300 mt-1.5 text-xs sm:text-sm max-w-xl font-medium">
              Welcome back to your agile workspace. Here is a status wrap of your organization activities today.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              id="btn-quick-task"
              onClick={() => {
                setErrorText(null);
                setShowTaskModal(true);
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2 rounded-md border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Quick Task
            </button>
            <button
              id="btn-quick-event"
              onClick={() => {
                setErrorText(null);
                setShowEventModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-md shadow-blue-600/10 border border-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Schedule Event
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Team Size</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{activeMembersCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Completed Tasks</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{completedTasksCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pending Tasks</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{pendingTasksCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Events Slotted</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{upcomingEventsCount}</p>
          </div>
        </div>
      </div>

      {/* Main split: Recent Tasks & Up Coming Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col" id="recent-tasks-panel">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Workspace Tasks</h2>
            </div>
            <button 
              onClick={() => onNavigate("tasks")} 
              className="text-xs font-semibold text-blue-650 hover:text-blue-800 cursor-pointer"
            >
              View all tasks
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
                <FileCheck2 className="h-10 w-10 text-slate-300" />
                <span>No tasks set for this workspace yet. Keep tasks clean!</span>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl border border-slate-150/60 hover:shadow-sm hover:border-slate-200 transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-1.5">
                        <Clock className="h-3 w-3" /> Due {task.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`inline-block py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase ${
                        task.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-600"
                          : task.status === "in-progress"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-slate-500/10 text-slate-500"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.assigneeAvatar ? (
                      <img 
                        src={task.assigneeAvatar} 
                        alt={task.assigneeName} 
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200"
                        title={`Assigned to ${task.assigneeName}`}
                      />
                    ) : (
                      <span className="h-8 w-8 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center">
                        U
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar panels for Calendar & Team channels */}
        <div className="space-y-6">
          
          {/* Calendar List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6" id="dashboard-events-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Meetings & Deadlines</h3>
              </div>
              <button 
                onClick={() => onNavigate("calendar")} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Schedule
              </button>
            </div>

            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming calendar slots today.
                </div>
              ) : (
                events.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                    <div className="bg-white p-2 text-center rounded shadow-sm border border-slate-250 shrink-0">
                      <p className="text-[10px] font-black text-blue-600 leading-none colab-date">
                        {ev.date.split("-")[2] || "01"}
                      </p>
                      <p className="text-[8px] text-slate-405 uppercase font-bold mt-1">
                        {new Date(ev.date).toLocaleString("default", { month: "short" })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 select-all">
                        <Clock className="h-3 w-3" /> {ev.time} - {ev.endTime}
                      </p>
                      <span className="inline-block mt-1.5 text-[8px] uppercase font-extrabold text-blue-600 tracking-wider">
                        {ev.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Member Messaging Link Panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 text-center">
            <span className="p-3 bg-blue-50 text-blue-600 rounded-full inline-block">
              <MessageSquare className="h-5 w-5" />
            </span>
            <p className="text-sm font-bold text-slate-800 mt-3">Team Chat Channel</p>
            <p className="text-xs text-slate-400 mt-1 px-4 leading-normal">
              Sync in real-time with project developers. Start standard typing loops directly.
            </p>
            <button
              onClick={() => onNavigate("chat")}
              className="mt-4 w-full bg-slate-50 border border-slate-205 p-2 text-xs font-semibold rounded text-slate-700 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all cursor-pointer"
            >
              Start Conversation Thread
            </button>
          </div>

        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-100">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Add Workspace Task</span>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              {errorText && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                  ⚠️ {errorText}
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1">TASK TITLE</label>
                <input 
                  type="text" 
                  required
                  value={taskTitle} 
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white" 
                  placeholder="Review schema definitions"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">DESCRIPTION</label>
                <textarea 
                  value={taskDesc}
                  rows={3} 
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white" 
                  placeholder="Review indices or rules checks"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">PRIORITY</label>
                  <select 
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">CATEGORY</label>
                  <select 
                    value={taskCategory} 
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl"
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
                    value={taskAssignee} 
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Unassigned (Self)</option>
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
                    value={taskDueDate} 
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                </div>
              </div>

              {!profile?.isPremium && (
                <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-700 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Tier Note:</strong> Workspaces on the Free Tier are limited to a maximum of 5 tasks. Upgrade anytime to lift limits.
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {loading ? "Adding..." : "Confirm & Save Task"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in duration-100">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Add Calendar Event</span>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              {errorText && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold animate-shake">
                  ⚠️ {errorText}
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1">EVENT TITLE</label>
                <input 
                  type="text" 
                  required
                  value={eventTitle} 
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white" 
                  placeholder="Design review iteration"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">DESCRIPTION</label>
                <textarea 
                  value={eventDesc} 
                  rows={2}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white" 
                  placeholder="Collaboratives screen drawing reviews"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-500 font-bold mb-1">DATE</label>
                  <input 
                    type="date" 
                    required
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">START TIME</label>
                  <input 
                    type="time" 
                    required
                    value={eventTime} 
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">END TIME</label>
                  <input 
                    type="time" 
                    value={eventEndTime} 
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">TYPE</label>
                  <select 
                    value={eventType} 
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="review">Review</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">PRIORITY</label>
                  <select 
                    value={eventPriority} 
                    onChange={(e) => setEventPriority(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {!profile?.isPremium && (
                <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-700 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Tier Note:</strong> Workspace schedules on the Free Tier are limited to 3 calendar entries. Upgrade anytime to unlock infinite events.
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {loading ? "Scheduling..." : "Schedule Event Slots"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
