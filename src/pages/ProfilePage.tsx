import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, 
  Settings, 
  CreditCard, 
  Users, 
  Copy, 
  Check, 
  CheckCircle2, 
  Briefcase, 
  Phone, 
  FileText, 
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { 
    profile, 
    organization, 
    members, 
    updateUserProfile, 
    upgradeToPremium 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Edit Profile fields
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || "");

  // Checkout inputs
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText(null);
    try {
      await updateUserProfile({
        name,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        bio,
        phone,
        jobTitle
      });
      alert("Workspace Profile Successfully Synced!");
    } catch (err: any) {
      setErrorText(err.message || "Could not save profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      setErrorText("Please fill in all credit card details.");
      return;
    }
    setLoading(true);
    setErrorText(null);
    try {
      await upgradeToPremium(cardNumber, expiry, cvc);
      setShowCheckout(false);
      alert("OpenColab Premium unlocked! Unlimited tasks and events enabled.");
    } catch (err: any) {
      setErrorText(err.message || "Simulated payment declined.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (profile?.orgCode) {
      navigator.clipboard.writeText(profile.orgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRole = () => {
    if (!profile || !organization) return "Member";
    return organization.ownerId === profile.uid ? "Workspace Creator / Owner" : "Workspace Participant";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="profile-page-view">
      
      {/* Page Title Label */}
      <div>
        <p className="text-slate-400 text-xs font-semibold">My Account / Settings</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Profile & Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Editing Form element */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Account Profile details</h2>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase">Full Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase">Email (Read Only)</label>
              <input 
                type="email" 
                readOnly
                value={profile?.email || ""} 
                className="w-full text-xs p-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded cursor-not-allowed select-none outline-none" 
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase">Job Title</label>
              <input 
                type="text" 
                value={jobTitle} 
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                placeholder="Developer / Designer"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase">Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded outline-none focus:border-blue-500 focus:bg-white" 
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold mb-1 uppercase">Avatar Seed or Image URL</label>
              <input 
                type="text" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded outline-none font-mono focus:border-blue-500 focus:bg-white" 
                placeholder="https://api.dicebear.com/7.x/bottts/svg?seed=yourname"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold mb-1 uppercase">Bio / Description</label>
              <textarea 
                value={bio} 
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded outline-none resize-none focus:border-blue-500 focus:bg-white" 
                placeholder="Describe your design patterns or agile workspace guidelines..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                id="btn-save-profile"
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 font-semibold rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar settings: Workspace Info & Premium gates */}
        <div className="space-y-6">
          
          {/* Workspace info Block */}
          <div className="bg-white rounded border border-slate-200 p-6 shadow-sm space-y-4" id="org-details-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Workspace information</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Workspace Name</span>
                <p className="font-semibold text-slate-850 mt-0.5 truncate select-all">
                  {organization?.name || "Shared Workspace"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Invite Code</span>
                <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded p-2 mt-1">
                  <span className="font-mono text-slate-700 select-all">{profile?.orgCode}</span>
                  <button 
                    onClick={copyCode}
                    className="p-1 hover:bg-white rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Active Members</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{members.length}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">My Role</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1 capitalize truncate">{getRole()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Billing Box */}
          <div className="bg-white rounded border border-slate-200 p-6 shadow-sm space-y-4" id="billing-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Payment & Account Tier</h3>
            </div>

            <div className="text-xs space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">CURRENT TIERS</p>
                  <p className="text-slate-505 mt-0.5 font-medium">
                    {profile?.isPremium ? "OpenColab Premium" : "Basic Free Tier"}
                  </p>
                </div>
                <span className={`inline-block py-1 px-2.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  profile?.isPremium ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-650 animate-pulse"
                }`}>
                  {profile?.isPremium ? "PREMIUM" : "FREE"}
                </span>
              </div>

              {!profile?.isPremium ? (
                <div className="space-y-3">
                  <p className="text-slate-405 leading-normal">
                    You are currently using the Free Tier (capped at 5 tasks and 3 calendar events). Upgrade to Premium for unrequested/unlimited agile iterations!
                  </p>
                  
                  {!showCheckout ? (
                    <button
                      id="btn-upgrade-view"
                      onClick={() => onNavigate("subscription")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" /> Upgrade Workspace — ₹499/mo
                    </button>
                  ) : (
                    <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-200 animate-in slide-in-from-top duration-200">
                      {errorText && (
                        <div className="p-2 bg-red-50 text-red-700 rounded font-semibold text-[10px]">
                          ⚠️ {errorText}
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">CARD NUMBER</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded font-mono"
                          placeholder="4000 1234 5678 9010"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">EXPIRY</label>
                          <input
                            type="text"
                            required
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">CVC</label>
                          <input
                            type="password"
                            required
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCheckout(false)}
                          className="flex-1 bg-slate-50 text-slate-500 p-2 font-semibold rounded text-[11px] hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-600 text-white p-2 font-semibold rounded text-[11px] hover:bg-emerald-700 cursor-pointer"
                        >
                          Unlock Unlimited
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded leading-normal flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Premium Enabled:</strong> Thank you for supporting OpenColab! Unlimited workspace task creating and event schedules are fully active.
                    </span>
                  </span>

                  {/* Payment Billing history list */}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="font-bold text-slate-400 uppercase text-[10px] mb-2">Previous bills</p>
                    <div className="bg-slate-50 rounded p-2.5 text-[10px] text-slate-600 flex justify-between items-center border border-slate-200">
                      <div className="flex items-center gap-1.5 select-all">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        <span>INV-OCO-0021</span>
                      </div>
                      <span className="font-semibold text-slate-800">₹499.00 PAID</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}