import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CalendarEvent } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle,
  CalendarDays,
  ListCollapse,
  CalendarRange
} from "lucide-react";

export default function CalendarPage() {
  const { 
    profile, 
    events, 
    members, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"month" | "list">("month");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Form Field parameters
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<"meeting" | "deadline" | "review" | "other">("meeting");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [eventAttendees, setEventAttendees] = useState<string[]>([]);

  // Selected Day State for details
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split("T")[0]);

  // Compute Days for simple dynamic grid
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Day of the week the month starts on
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleOpenCreateModal = (initDate?: string) => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setDate(initDate || selectedDay || new Date().toISOString().split("T")[0]);
    setTime("10:00");
    setEndTime("11:00");
    setType("meeting");
    setPriority("medium");
    setEventAttendees([]);
    setErrorText(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setDate(ev.date);
    setTime(ev.time);
    setEndTime(ev.endTime);
    setType(ev.type);
    setPriority(ev.priority);
    setEventAttendees(ev.attendees || []);
    setErrorText(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    setLoading(true);
    setErrorText(null);

    try {
      if (editingEvent) {
        // Edit own event
        await updateEvent(editingEvent.id, {
          title,
          description,
          date,
          time,
          endTime: endTime || time,
          type,
          priority,
          attendees: eventAttendees
        });
        setShowModal(false);
      } else {
        // Create new event
        await createEvent(title, description, date, time, endTime || time, type, priority, eventAttendees);
        setShowModal(false);
      }
    } catch (err: any) {
      setErrorText(err.message || "Failed to edit event slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (confirm("Cancel this scheduled calendar event?")) {
      try {
        await deleteEvent(eventId);
      } catch (err: any) {
        alert(err.message || "Could not delete event.");
      }
    }
  };

  const toggleAttendee = (uid: string) => {
    if (eventAttendees.includes(uid)) {
      setEventAttendees(eventAttendees.filter(id => id !== uid));
    } else {
      setEventAttendees([...eventAttendees, uid]);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (filterType !== "all" && ev.type !== filterType) return false;
    return true;
  });

  // Color mappings
  const getTypeColor = (t: string) => {
    switch (t) {
      case "deadline": return "bg-rose-500 text-rose-100 border-rose-600";
      case "review": return "bg-amber-500 text-amber-950 border-amber-600";
      case "meeting": return "bg-indigo-600 text-white border-indigo-700";
      default: return "bg-slate-500 text-white border-slate-600";
    }
  };

  const getDayEvents = (dayNum: number) => {
    const formattedDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return filteredEvents.filter(ev => ev.date === formattedDayStr);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="calendar-page-view">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Workspace / Agenda Planner</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Calendar Schedules</h1>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-slate-200 rounded p-1 flex shadow-sm">
            <button
              onClick={() => setActiveTab("month")}
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "month" 
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Month Plan
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "list" 
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListCollapse className="h-3.5 w-3.5" /> Agenda List
            </button>
          </div>

          <button
            id="btn-add-event"
            onClick={() => handleOpenCreateModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto text-xs">
        <div className="font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <CalendarRange className="h-4 w-4 text-blue-600 shrink-0" /> Filter slots
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded border transition-all ${
              filterType === "all" ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType("meeting")}
            className={`px-3 py-1.5 rounded border transition-all ${
              filterType === "meeting" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setFilterType("deadline")}
            className={`px-3 py-1.5 rounded border transition-all ${
              filterType === "deadline" ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setFilterType("review")}
            className={`px-3 py-1.5 rounded border transition-all ${
              filterType === "review" ? "bg-amber-650 border-amber-650 text-amber-950" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {activeTab === "month" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly grid */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">
                Grid Calendar Mode
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs" id="calendar-grid">
              {/* Padding for starting days */}
              {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 bg-slate-50/40 rounded p-1 border border-transparent select-none" />
              ))}

              {/* Day slots */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dailyEvents = getDayEvents(dayNum);
                const isSelected = selectedDay === formattedDayStr;
                const isToday = new Date().toISOString().split("T")[0] === formattedDayStr;

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDay(formattedDayStr)}
                    className={`h-16 rounded border p-1 flex flex-col items-between text-left transition-all relative cursor-pointer ${
                      isSelected 
                        ? "border-blue-600 ring-2 ring-blue-600/10 bg-blue-50/10" 
                        : isToday
                        ? "border-blue-250 bg-slate-50/60"
                        : "border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <span className={`text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold ${
                      isToday ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-600"
                    }`}>
                      {dayNum}
                    </span>

                    {/* Dot indicators */}
                    <div className="mt-auto flex gap-1 flex-wrap overflow-hidden h-3">
                      {dailyEvents.slice(0, 3).map(ev => (
                        <span 
                          key={ev.id} 
                          title={ev.title}
                          className={`h-1.5 w-1.5 rounded-full inline-block ${
                            ev.type === "deadline" ? "bg-rose-500" : ev.type === "review" ? "bg-amber-500" : "bg-blue-600"
                          }`}
                        />
                      ))}
                      {dailyEvents.length > 3 && (
                        <span className="text-[6px] font-bold leading-none text-slate-400">+{dailyEvents.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day events summary panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col" id="calendar-agenda-mini">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Selected Day</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1 select-all">{selectedDay}</h3>
            </div>

            <div className="flex-1 space-y-3">
              {filteredEvents.filter(ev => ev.date === selectedDay).length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <span className="p-3 bg-slate-50 text-slate-350 rounded-full">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span>No events scheduled for this date.</span>
                  <button 
                    onClick={() => handleOpenCreateModal(selectedDay)}
                    className="mt-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:text-blue-800 cursor-pointer"
                  >
                    + Schedule One
                  </button>
                </div>
              ) : (
                filteredEvents.filter(ev => ev.date === selectedDay).map((ev) => {
                  const isCreator = profile?.uid === ev.createdBy;
                  return (
                    <div key={ev.id} className="p-3.5 rounded border border-slate-200 bg-slate-50/40 relative group">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-extrabold tracking-wider border ${getTypeColor(ev.type)}`}>
                          {ev.type}
                        </span>
                        
                        {isCreator && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleOpenEditModal(ev)}
                              className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleDelete(ev.id)}
                              className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Cancel slot"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-2">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ev.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500 font-medium pt-2.5 border-t border-slate-100/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {ev.time} - {ev.endTime}
                        </span>
                        {ev.attendees && ev.attendees.length > 0 && (
                          <span className="flex items-center gap-1 select-all">
                            <Users className="h-3.5 w-3.5" /> {ev.attendees.length} attending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List view of agenda */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6" id="calendar-agenda-list">
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No calendar entries mapped. Use "+ Add Event" to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((ev) => {
                const isCreator = profile?.uid === ev.createdBy;
                return (
                  <div key={ev.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 flex items-start gap-3">
                      <div className="bg-slate-50 border p-2 text-center rounded font-bold shrink-0 min-w-14 shadow-sm">
                        <p className="text-xs text-blue-600 leading-none">{ev.date.split("-")[2]}</p>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                          {new Date(ev.date).toLocaleString("default", { month: "short" })}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-black border tracking-wider ${getTypeColor(ev.type)}`}>
                            {ev.type}
                          </span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            ev.priority === "high" ? "bg-red-50 text-red-655" : "bg-slate-50 text-slate-500"
                          }`}>
                            {ev.priority}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 mt-1.5">{ev.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{ev.description || "No description."}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-12 md:pl-0">
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 select-all">
                        <Clock className="h-3.5 w-3.5" /> {ev.time} - {ev.endTime}
                      </span>

                      {isCreator ? (
                        <div className="flex gap-1 border-l border-slate-150 pl-4">
                          <button onClick={() => handleOpenEditModal(ev)} className="p-1 text-slate-405 hover:text-blue-600 cursor-pointer">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(ev.id)} className="p-1 text-slate-405 hover:text-rose-600 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-350 italic border-l border-slate-150 pl-4 select-none">View Only</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar Creator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-100">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingEvent ? "Edit Calendar Slot" : "Schedule Workspace Event"}
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Close</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorText && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 font-semibold">
                  ⚠️ {errorText}
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1">EVENT TITLE</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                  placeholder="Design review iteration"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">DESCRIPTION</label>
                <textarea 
                  value={description} 
                  rows={2}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                  placeholder="Collaboratives screen drawing reviews"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-500 font-bold mb-1">DATE</label>
                  <input 
                    type="date" 
                    required
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">START TIME</label>
                  <input 
                    type="time" 
                    required
                    value={time} 
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">END TIME</label>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">TYPE</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer"
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
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Attendance checkbox ticks list */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase">INVITE TEAM MEMBERS</label>
                <div className="max-h-24 overflow-y-auto border border-slate-200 p-2 rounded bg-slate-50 flex flex-col gap-1.5">
                  {members.map((m) => (
                    <label key={m.uid} className="flex items-center gap-2 cursor-pointer p-0.5 hover:bg-white rounded transition-colors pr-2">
                      <input 
                        type="checkbox" 
                        checked={eventAttendees.includes(m.uid)} 
                        onChange={() => toggleAttendee(m.uid)}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <img src={m.avatar} alt="member avatar" className="h-5.5 w-5.5 rounded" />
                      <span className="font-semibold text-slate-700">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {!profile?.isPremium && !editingEvent && (
                <div className="p-3 bg-blue-50 border border-blue-150 rounded text-blue-700 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Tier Note:</strong> Workspaces have a limit of 3 events. Upgrade to Premium for unlimited scheduling slots.
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition-all cursor-pointer"
              >
                {loading ? "Saving..." : editingEvent ? "Save Details" : "Schedule Event"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
