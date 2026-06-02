import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Briefcase, Key, Mail, ShieldAlert, User, Zap } from "lucide-react";

export default function AuthPage() {
  const { signUpEmail, signInEmail, errorMsg } = useApp();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgOption, setOrgOption] = useState<"join" | "create">("create");
  const [enteredOrgCode, setEnteredOrgCode] = useState("");
  const [newOrgName, setNewOrgName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setLoading(true);

    try {
      if (activeTab === "signin") {
        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }
        await signInEmail(email, password);
      } else {
        if (!email || !password || !name) {
          throw new Error("Full name, email, and password are required.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await signUpEmail(email, password, name, orgOption, enteredOrgCode, newOrgName);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">OpenColab</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === "signin" ? "Sign in to workspace" : "Register new account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Collaborative workspace for agile teams
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" id="auth-card">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 mb-6 gap-2">
            <button
              id="tab-signin"
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "signin"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => {
                setActiveTab("signin");
                setErrorText(null);
              }}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "signup"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => {
                setActiveTab("signup");
                setErrorText(null);
              }}
            >
              Sign Up
            </button>
          </div>

          {(errorText || errorMsg) && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5 leading-relaxed">{errorText || errorMsg}</p>
                <p className="mt-2 font-medium text-[10px] uppercase text-indigo-600 leading-tight">
                  💡 Note: Make sure Email/Password Sign-In is enabled in your Supabase Auth Providers!
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {activeTab === "signup" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            {/* Custom fields for Organization Sign Up */}
            {activeTab === "signup" && (
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Organization Setup
                </span>
                
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button
                    type="button"
                    className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all ${
                      orgOption === "create"
                        ? "bg-white shadow text-slate-900"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setOrgOption("create")}
                  >
                    Create Workspace
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-1 px-3 text-xs font-semibold rounded-lg transition-all ${
                      orgOption === "join"
                        ? "bg-white shadow text-slate-900"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setOrgOption("join")}
                  >
                    Join with Code
                  </button>
                </div>

                {orgOption === "create" ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      New Workspace Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required={orgOption === "create"}
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                        placeholder="e.g. Design Lab"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      6-Character Invite Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required={orgOption === "join"}
                        value={enteredOrgCode}
                        onChange={(e) => setEnteredOrgCode(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none font-mono uppercase"
                        placeholder="e.g. OPEN-ABC123"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-normal">
                      Ask your administrator/owner to copy their organizational code from their profile or top banner.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </span>
              ) : activeTab === "signin" ? (
                "Access Workspace"
              ) : orgOption === "create" ? (
                "Create Workspace & Account"
              ) : (
                "Join Workspace Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
