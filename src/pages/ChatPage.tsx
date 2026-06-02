import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { UserProfile, ChatMessage } from "../types";
import { 
  Send, 
  Search, 
  MessageSquare, 
  Image, 
  Smile, 
  Clock, 
  ShieldAlert,
  UserCheck
} from "lucide-react";

export default function ChatPage() {
  const { profile, members, channels, sendDirectMessage } = useApp();
  const [selectedPartner, setSelectedPartner] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto scroll ref
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedPartner, channels]);

  // Exclude self from conversation partner list
  const teammates = members.filter((m) => m.uid !== profile?.uid);

  // Filter teammates by search query
  const filteredTeammates = teammates.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.jobTitle && m.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Find active channel for selected partner
  const getActiveChannel = () => {
    if (!selectedPartner || !profile) return null;
    const conversationId = [profile.uid, selectedPartner.uid].sort().join("_");
    return channels.find((c) => c.id === conversationId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner) return;

    setLoading(true);
    try {
      await sendDirectMessage(selectedPartner.uid, inputText.trim());
      setInputText("");
    } catch (err) {
      console.error("Failed to send message: ", err);
    } finally {
      setLoading(false);
    }
  };

  const activeChannel = getActiveChannel();
  const activeMessages = activeChannel ? activeChannel.messages : [];

  // Helper to find the last message for a teammate to display in list preview
  const getLastMessagePreview = (userId: string) => {
    if (!profile) return null;
    const conversationId = [profile.uid, userId].sort().join("_");
    const channel = channels.find((c) => c.id === conversationId);
    if (!channel || channel.messages.length === 0) return null;
    return channel.messages[channel.messages.length - 1];
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-12rem)] flex" id="chat-page-view">
      
      {/* Teammates Sidebar Pane */}
      <aside className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/25">
        
        {/* Search header bar */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-505 focus:border-blue-500"
              placeholder="Search teammate profile..."
            />
          </div>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredTeammates.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No teammates found in this workspace.
            </div>
          ) : (
            filteredTeammates.map((teammate) => {
              const lastMsg = getLastMessagePreview(teammate.uid);
              const isSelected = selectedPartner?.uid === teammate.uid;

              return (
                <button
                  id={`chat-user-${teammate.uid}`}
                  key={teammate.uid}
                  onClick={() => setSelectedPartner(teammate)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? "bg-blue-50/40 border-l-4 border-blue-600" : "hover:bg-slate-50/55"
                  }`}
                >
                  <img
                    src={teammate.avatar}
                    alt="avatar"
                    className="h-10 w-10 rounded bg-slate-50 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{teammate.name}</p>
                      {lastMsg && (
                        <span className="text-[9px] text-slate-400 font-medium">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-450 truncate mt-0.5 font-medium uppercase tracking-wider text-[8px]">
                      {teammate.jobTitle || "Developer"}
                    </p>
                    <p className="text-[11px] text-slate-450 truncate mt-1.5 font-medium leading-normal">
                      {lastMsg ? lastMsg.text : "No messages. Let's start typing!"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Conversational Section */}
      <section className="flex-1 flex flex-col bg-slate-50/10 min-w-0">
        {selectedPartner ? (
          <>
            {/* Thread Companion header bar */}
            <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPartner.avatar}
                  alt="avatar"
                  className="h-9.5 w-9.5 rounded bg-slate-50 border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedPartner.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize truncate font-medium">
                    {selectedPartner.jobTitle || "Active Participant"}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                <UserCheck className="h-3 w-3" /> sync connected
              </span>
            </div>

            {/* Message bubble historical stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-xs text-slate-400 gap-2">
                  <span className="p-3 bg-blue-50 text-blue-500 rounded-full animate-pulse">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <span>This starts your secure workspace chat log. State your ideas safely!</span>
                </div>
              ) : (
                activeMessages.map((msg, idx) => {
                  const isSelf = msg.senderId === profile?.uid;
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 text-xs max-w-[80%] ${
                        isSelf ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {!isSelf && (
                        <img
                          src={selectedPartner.avatar}
                          alt="avatar"
                          className="h-8 w-8 rounded bg-slate-50 border border-slate-100 shrink-0 self-end"
                        />
                      )}
                      <div>
                        <div
                          className={`p-3 rounded-lg leading-relaxed text-xs shadow-sm shadow-slate-100 ${
                            isSelf
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-slate-855 border border-slate-200 rounded-tl-none"
                          }`}
                        >
                          <p className="break-words font-medium">{msg.text}</p>
                        </div>
                        <p
                          className={`text-[8px] text-slate-400 mt-1 font-medium ${
                            isSelf ? "text-right" : "text-left"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={lastMessageRef} />
            </div>

            {/* Input typing footer */}
            <div className="bg-white p-4 border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  id="chat-input-text"
                  type="text"
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2.5 border border-slate-250 bg-slate-50 rounded outline-none focus:bg-white focus:border-blue-500"
                  placeholder={`Send a direct message to ${selectedPartner.name}...`}
                />
                <button
                  id="btn-send-message"
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded transition-all shadow-md shadow-blue-105/10 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-xs text-slate-400 gap-2">
            <span className="p-4 bg-slate-50 text-slate-305 rounded-full">
              <MessageSquare className="h-8 w-8" />
            </span>
            <p className="font-bold text-slate-600">No active thread</p>
            <p className="text-slate-400 px-12 text-center max-w-sm leading-normal">
              Select one of your team members on the left side directory to initialize real-time synchronized message channels.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
