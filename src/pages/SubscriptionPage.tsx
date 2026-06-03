import React, { useState } from "react";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Star,
  ShieldAlert,
  CreditCard,
  User,
  Mail,
  Lock,
  CalendarDays,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type View = "plans" | "payment";

const FREE_FEATURES = [
  { label: "50 Tasks / month", included: true },
  { label: "50 Events / month", included: true },
  { label: "100 Messages / month", included: true },
  { label: "Priority Support", included: false },
  { label: "Advanced Analytics", included: false },
  { label: "Unlimited Team Workspaces", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited Tasks", included: true },
  { label: "Unlimited Events", included: true },
  { label: "Unlimited Messages", included: true },
  { label: "Priority Support", included: true },
  { label: "Advanced Analytics", included: true },
  { label: "Unlimited Team Workspaces", included: true },
];

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").substring(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 2) return digits.substring(0, 2) + " / " + digits.substring(2, 4);
  return digits;
}

interface SubscriptionPageProps {
  onNavigate: (view: string) => void;
}

export default function SubscriptionPage({ onNavigate }: SubscriptionPageProps)  {
  const [view, setView] = useState<View>("plans");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Payment form fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [payEmail, setPayEmail] = useState("");

  const handleGoToPayment = () => {
    setErrorText(null);
    setView("payment");
  };

  const handleBack = () => {
    setErrorText(null);
    setView("plans");
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setLoading(true);
    // Simulate network delay then always reject
    await new Promise((res) => setTimeout(res, 2000));
    setLoading(false);
    setErrorText(
      "The card details you entered are incorrect or your card was declined. Please check your card number, expiry date, and CVV and try again."
    );
  };

  // ─── PLANS VIEW ────────────────────────────────────────────────────────────
  if (view === "plans") {
    return (
      <div
        id="subscription-page"
        className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Logo + heading */}
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">OpenColab</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Choose your plan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Start free, upgrade when your team needs more power.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            <Star className="h-3 w-3 fill-indigo-500 text-indigo-500" />
            Limited time — Premium at just ₹499/mo
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 w-full sm:max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* FREE CARD */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 py-8 px-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="bg-slate-100 text-slate-500 p-2 rounded-xl">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5">
                Free
              </span>
            </div>

            <div className="mt-4">
              <span className="text-4xl font-black tracking-tight text-slate-900">₹0</span>
              <span className="text-sm text-slate-400 ml-1">/ forever</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Perfect for individuals exploring the platform.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                What's included
              </p>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                    <span className={f.included ? "text-slate-700" : "text-slate-400"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="mt-6 w-full flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Continue with Free
            </button>
          </div>

          {/* PREMIUM CARD */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-500 py-8 px-6 flex flex-col relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              ✦ Most Popular
            </div>

            <div className="flex items-center justify-between mb-1">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-200">
                <Star className="h-5 w-5 fill-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-full px-2.5 py-0.5">
                Premium
              </span>
            </div>

            <div className="mt-4">
              <span className="text-4xl font-black tracking-tight text-slate-900">₹499</span>
              <span className="text-sm text-slate-400 ml-1">/ month</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Everything your team needs to ship faster, together.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                What's included
              </p>
              <ul className="space-y-2.5">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-700">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="btn-buy-premium"
              type="button"
              onClick={handleGoToPayment}
              className="mt-6 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Buy Premium — ₹499/mo
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          🔒 Secure checkout &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day money-back guarantee
        </p>
      </div>
    );
  }

  // ─── PAYMENT VIEW ──────────────────────────────────────────────────────────
  return (
    <div
      id="payment-page"
      className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">OpenColab</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Complete your purchase
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          You're one step away from unlimited everything.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">

          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-5 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to plans
          </button>

          {/* Order summary */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6">
            <div>
              <p className="text-sm font-bold text-slate-800">⚡ OpenColab Premium</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Billed monthly · Cancel anytime</p>
            </div>
            <span className="text-lg font-black text-indigo-600 tracking-tight">₹499</span>
          </div>

          {/* Error banner */}
          {errorText && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment Declined</p>
                <p className="mt-0.5 leading-relaxed">{errorText}</p>
                <p className="mt-2 font-medium text-[10px] uppercase text-indigo-600 leading-tight">
                  💡 Tip: Double-check your card number, expiry, and CVV.
                </p>
              </div>
            </div>
          )}

          {/* Card logos */}
          <div className="flex gap-2 mb-4">
            {["VISA", "MC", "RUPAY", "UPI"].map((logo) => (
              <span
                key={logo}
                className="text-[10px] font-extrabold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-1"
              >
                {logo}
              </span>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handlePaySubmit}>
            {/* Cardholder name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Cardholder Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                  placeholder="Full name on card"
                />
              </div>
            </div>

            {/* Card number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Card Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none font-mono tracking-widest"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
            </div>

            {/* Expiry + CVV row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={7}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none font-mono"
                    placeholder="MM / YY"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  CVV
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email for Receipt
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={payEmail}
                  onChange={(e) => setPayEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-shadow outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <button
              id="btn-pay-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ₹499 securely
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-1">
              <Lock className="h-3 w-3" />
              256-bit SSL encryption · Your card details are never stored
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}