import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Shell from "./components/Shell";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import ChatPage from "./pages/ChatPage";
import WhiteboardPage from "./pages/WhiteboardPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";

import { Zap } from "lucide-react";

function MainAppContent() {
  const { user, authLoading, loading } = useApp();
  const [activeView, setActiveView] = useState<string>("dashboard");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-3">
        <div className="bg-indigo-600 text-white p-3 rounded-2xl animate-bounce shadow-lg shadow-indigo-200">
          <Zap className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">
          <span className="animate-spin h-3 w-3 border-2 border-slate-500 border-t-transparent rounded-full" />
          Synchronizing Workspace Auth...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveView} />;
      case "tasks":
        return <TasksPage />;
      case "calendar":
        return <CalendarPage />;
      case "chat":
        return <ChatPage />;
      case "whiteboard":
        return <WhiteboardPage />;
      case "profile":
        return <ProfilePage onNavigate={setActiveView} />;
      case "subscription":
        return <SubscriptionPage onNavigate={setActiveView} />;
      default:
        return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="antialiased selection:bg-indigo-500 selection:text-white">
      <Shell activeView={activeView} setActiveView={setActiveView}>
        {renderActiveView()}
      </Shell>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}