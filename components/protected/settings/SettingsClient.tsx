"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  Bell,
  Shield,
} from "lucide-react";

type Settings = {
  name: string;
  email: string;
  phone: string | null;
  notifyEmail: boolean;
  notifyQuizReminder: boolean;
};

type Tab = "profile" | "notifications" | "security";

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("profile");

  // Password change state
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    fetch("/api/student/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/student/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError(null);
    if (pwData.next !== pwData.confirm) {
      setPwError("New passwords do not match");
      return;
    }
    if (pwData.next.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/student/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwData.current,
          newPassword: pwData.next,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setPwSaved(true);
      setPwData({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: unknown) {
      setPwError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  if (!settings) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
    { id: "security", label: "Security", icon: <Shield size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 border border-white/8 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-4 py-2 transition ${
              tab === t.id
                ? "bg-neutral-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-white font-bold">Personal Information</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                Display Name
              </label>
              <input
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 transition"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                Email Address
              </label>
              <input
                value={settings.email}
                disabled
                className="w-full bg-neutral-800/50 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">
                Email cannot be changed. Contact admin if needed.
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                Phone Number
              </label>
              <input
                value={settings.phone ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value || null })
                }
                placeholder="+91 00000 00000"
                className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold rounded-xl px-5 py-2.5 w-fit transition"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : saved ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-white font-bold">Notification Preferences</h2>

          <div className="flex flex-col gap-4">
            {[
              {
                key: "notifyEmail" as const,
                label: "Email Notifications",
                desc: "Receive updates about quiz assignments and results via email",
              },
              {
                key: "notifyQuizReminder" as const,
                label: "Quiz Reminders",
                desc: "Get reminded when a quiz is about to close",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-white font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      [item.key]: !settings[item.key],
                    })
                  }
                  className={`shrink-0 w-11 h-6 rounded-full transition-colors ${settings[item.key] ? "bg-amber-400" : "bg-neutral-700"}`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full mx-1 transition-transform ${settings[item.key] ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold rounded-xl px-5 py-2.5 w-fit transition"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : saved ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-white font-bold">Change Password</h2>

          <div className="flex flex-col gap-4">
            {[
              { key: "current" as const, label: "Current Password" },
              { key: "next" as const, label: "New Password" },
              { key: "confirm" as const, label: "Confirm New Password" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  {f.label}
                </label>
                <input
                  type="password"
                  value={pwData[f.key]}
                  onChange={(e) =>
                    setPwData({ ...pwData, [f.key]: e.target.value })
                  }
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50 transition"
                />
              </div>
            ))}
          </div>

          {pwError && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm">
              <AlertCircle size={14} />
              {pwError}
            </div>
          )}

          {pwSaved && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm">
              <CheckCircle2 size={14} />
              Password changed successfully!
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={pwSaving || !pwData.current || !pwData.next}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold rounded-xl px-5 py-2.5 w-fit transition"
          >
            {pwSaving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Shield size={14} />
            )}
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </div>
      )}
    </div>
  );
}
