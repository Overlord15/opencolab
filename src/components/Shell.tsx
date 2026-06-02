import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SUPABASE_ACTIVE } from "../supabase";
import { 
  BarChart2, 
  Calendar, 
  CheckSquare, 
  ChevronDown, 
  Copy, 
  LogOut, 
  MessageSquare, 
  Bell, 
  PenTool, 
  User, 
  Users, 
  Zap,
  Menu,
  X,
  Sparkles,
  Check
} from "lucide-react";

interface ShellProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Shell({ children, activeView, setActiveView }: ShellProps) {
  const { 
    profile, 
    organization, 
    signOutUser, 
    notifications, 
    markNotificationRead, 
    clearNotifications,
    members 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const [showTeamMenu, setShowTeamMenu] = useState(false);

  const copyOrgCode = () => {
    if (profile?.orgCode) {
      navigator.clipboard.writeText(profile.orgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "chat", label: "Team Chat", icon: MessageSquare },
    { id: "whiteboard", label: "Whiteboard", icon: PenTool },
    { id: "profile", label: "Profile", icon: User },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900" id="opencolab-app">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20 text-sm">OC</div>
          <span className="text-xl font-bold text-white tracking-tight">OpenColab</span>
          {profile?.isPremium && (
            <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold ml-auto flex items-center gap-1">
              <Sparkles className="h-2 w-2" /> Premium
            </span>
          )}
        </div>

        {/* Workspace Quick-Box */}
        <div className="p-4 mx-4 my-4 bg-slate-800/60 rounded-lg text-sm border border-slate-700/50">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workspace</p>
          <p className="text-sm font-semibold text-white mt-1 truncate">
            {organization?.name || "My Organization"}
          </p>
          
          <button 
            id="btn-copy-code"
            onClick={copyOrgCode}
            className="mt-2.5 w-full flex items-center justify-between text-xs bg-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-705 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
          >
            <span className="font-mono text-blue-400 font-bold truncate">{profile?.orgCode || "NO-CODE"}</span>
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                id={`nav-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-850 hover:text-white"
                }`}
              >
                <IconComponent className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Badge Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3">
          <img 
            src={profile?.avatar || "https://api.dicebear.com/7.x/bottts/svg"} 
            alt="user avatar" 
            className="h-10 w-10 rounded-full bg-slate-800 border-2 border-white/20 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.name || "OpenColab Member"}</p>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">{profile?.isPremium ? "Premium Plan" : "Free Plan"}</p>
          </div>
          <button 
            id="btn-logout-sidebar"
            onClick={signOutOutAlert} 
            title="Log Out"
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1 md:hidden text-slate-500 hover:text-blue-600 transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="text-md font-bold tracking-tight text-slate-800 capitalize md:text-lg">
              {activeView === "dashboard" ? "Overview Dashboard" : activeView}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {SUPABASE_ACTIVE ? (
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200/50 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                Supabase Engine
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                Firebase Engine Option
              </span>
            )}

            {/* Quick Team Directory Dropdown */}
            <div className="relative">
              <button 
                id="btn-team-dropdown"
                onClick={() => {
                  setShowTeamMenu(!showTeamMenu);
                  setShowNotifyMenu(false);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer animate-in duration-100"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Workspace Team ({members.length})</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showTeamMenu && (
                <div 
                  id="team-menu"
                  className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 w-64 py-2 z-50 text-xs text-slate-700 animate-in fade-in duration-100"
                >
                  <p className="px-3 py-1 font-semibold text-slate-400 border-b border-slate-50 pb-2 animate-in duration-100">Active Team Directory</p>
                  <div className="max-h-60 overflow-y-auto">
                    {members.map((member) => (
                      <div key={member.uid} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors">
                        <img src={member.avatar} alt="avatar" className="h-6.5 w-6.5 rounded-lg border border-slate-200" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize truncate">{member.jobTitle || "Developer"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Tray */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => {
                  setShowNotifyMenu(!showNotifyMenu);
                  setShowTeamMenu(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-blue-600 ring-2 ring-white text-white font-black text-[9px] h-4 w-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifyMenu && (
                <div 
                  id="notifications-menu"
                  className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 w-80 py-2 z-50 animate-in fade-in duration-100"
                >
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-sm">Notifications ({unreadCount})</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-blue-600 font-semibold hover:text-blue-800 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No recent updates or alerts.
                      </div>
                    ) : (
                      notifications.map((notify) => (
                        <div 
                          key={notify.id} 
                          className={`p-3 border-b border-dashed border-slate-100 hover:bg-slate-50 transition-colors flex gap-2.5 text-xs text-slate-600 ${!notify.read ? "bg-blue-50/20" : ""}`}
                          onClick={() => markNotificationRead(notify.id)}
                        >
                          <div className="mt-0.5">
                            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex justify-center items-center">
                              <Zap className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 leading-tight">{notify.title}</p>
                            <p className="mt-0.5 text-slate-500 leading-normal">{notify.description}</p>
                            <p className="mt-1 text-[9px] text-slate-400 font-medium">Just now</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="btn-profile-dropdown"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifyMenu(false);
                  setShowTeamMenu(false);
                }}
                className="flex items-center gap-1.5 p-1 hover:bg-slate-105 rounded-xl transition-colors cursor-pointer"
              >
                <img 
                  src={profile?.avatar || "https://api.dicebear.com/7.x/bottts/svg"} 
                  alt="avatar" 
                  className="h-8.5 w-8.5 rounded-full border border-slate-200"
                />
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div 
                  id="profile-dropdown-menu"
                  className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 w-48 py-2 z-50 text-xs text-slate-700 animate-in fade-in duration-100"
                >
                  <div className="px-4 py-2 border-b border-slate-100 pb-2">
                    <p className="font-bold text-slate-800 leading-none truncate">{profile?.name || "Member"}</p>
                    <p className="mt-1 text-slate-400 text-[10px] truncate">{profile?.email || "No email"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveView("profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors font-medium text-slate-600 cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={signOutOutAlert}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 transition-colors font-semibold cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation overlay */}
        {showMobileMenu && (
          <div className="absolute inset-0 bg-slate-900/60 z-40 md:hidden" onClick={() => setShowMobileMenu(false)}>
            <div 
              className="w-64 bg-slate-900 h-full flex flex-col pt-4 animate-in slide-in-from-left duration-200" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-800">
                <span className="text-xl font-bold text-white tracking-tight">OpenColab</span>
                <button onClick={() => setShowMobileMenu(false)} className="text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-850 rounded-xl border border-slate-800/60 m-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workspace</p>
                <p className="text-sm font-semibold text-white mt-1 select-all truncate">{organization?.name}</p>
                <p className="text-[11px] font-mono mt-1 text-blue-400 font-bold select-all">{profile?.orgCode}</p>
              </div>

              <nav className="flex-1 px-3 space-y-1 mt-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                        activeView === item.id 
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <IconComponent className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3">
                <img 
                  src={profile?.avatar} 
                  alt="avatar" 
                  className="h-10 w-10 rounded-full bg-slate-850 border-2 border-white/10" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{profile?.name}</p>
                  <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">{profile?.isPremium ? "Premium" : "Free"}</p>
                </div>
                <button onClick={signOutOutAlert} className="text-slate-500 hover:text-red-400">
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Outer Workspace Content Frame */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );

  function signOutOutAlert() {
    if (confirm("Are you sure you want to sign out?")) {
      signOutUser();
    }
  }
}
