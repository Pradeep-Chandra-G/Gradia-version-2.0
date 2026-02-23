"use client";

import { useState } from "react";
import {
  Bell,
  Monitor,
  Shield,
  ChevronRight,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ── Toggle ────────────────────────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-amber-400" : "bg-neutral-700"
      }`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-0"
        }`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-white font-bold">{title}</h2>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  sub,
  control,
}: {
  label: string;
  sub?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <div className="ml-4 shrink-0">{control}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SettingsClient() {
  const [notifs, setNotifs] = useState({
    quizReminders: true,
    gradePublished: true,
    newQuizAvailable: false,
    weeklyDigest: true,
    emailAlerts: false,
  });

  const [display, setDisplay] = useState({
    compactMode: false,
    showScoreOnCard: true,
    showCountdown: true,
    highContrastTimer: false,
  });

  const toggle =
    <T extends Record<string, boolean>>(
      setter: React.Dispatch<React.SetStateAction<T>>,
      key: keyof T,
    ) =>
    () =>
      setter((prev) => ({ ...prev, [key]: !prev[key] }));

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto no-scrollbar">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm mb-1">Preferences</p>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Settings
        </h1>
      </div>

      {/* Profile shortcut */}
      <Link
        href="/account"
        className="flex items-center justify-between bg-neutral-900 border border-white/8 rounded-2xl px-5 py-4 hover:border-white/20 transition-all group"
      >
        <div>
          <p className="text-white font-semibold">Profile & Account</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Change name, email, password, avatar
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors">
          <ExternalLink size={14} />
        </div>
      </Link>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} />}>
        <SettingRow
          label="Quiz Reminders"
          sub="Get reminded 1 hour before a quiz starts"
          control={
            <Toggle
              enabled={notifs.quizReminders}
              onChange={toggle(setNotifs, "quizReminders")}
            />
          }
        />
        <SettingRow
          label="Grade Published"
          sub="Notify me when a result is available"
          control={
            <Toggle
              enabled={notifs.gradePublished}
              onChange={toggle(setNotifs, "gradePublished")}
            />
          }
        />
        <SettingRow
          label="New Quiz Available"
          sub="Alert when instructor publishes a new quiz"
          control={
            <Toggle
              enabled={notifs.newQuizAvailable}
              onChange={toggle(setNotifs, "newQuizAvailable")}
            />
          }
        />
        <SettingRow
          label="Weekly Digest"
          sub="Summary of your performance every Monday"
          control={
            <Toggle
              enabled={notifs.weeklyDigest}
              onChange={toggle(setNotifs, "weeklyDigest")}
            />
          }
        />
        <SettingRow
          label="Email Alerts"
          sub="Send notifications to your registered email"
          control={
            <Toggle
              enabled={notifs.emailAlerts}
              onChange={toggle(setNotifs, "emailAlerts")}
            />
          }
        />
      </Section>

      {/* Display */}
      <Section title="Display" icon={<Monitor size={16} />}>
        <SettingRow
          label="Compact Quiz Cards"
          sub="Show smaller cards on the quizzes page"
          control={
            <Toggle
              enabled={display.compactMode}
              onChange={toggle(setDisplay, "compactMode")}
            />
          }
        />
        <SettingRow
          label="Show Score on Card"
          sub="Display your score directly on completed quiz cards"
          control={
            <Toggle
              enabled={display.showScoreOnCard}
              onChange={toggle(setDisplay, "showScoreOnCard")}
            />
          }
        />
        <SettingRow
          label="Show Countdown on Detail Page"
          sub="Display time remaining on the quiz detail page"
          control={
            <Toggle
              enabled={display.showCountdown}
              onChange={toggle(setDisplay, "showCountdown")}
            />
          }
        />
        <SettingRow
          label="High Contrast Timer"
          sub="Make the exam timer more prominent when time is low"
          control={
            <Toggle
              enabled={display.highContrastTimer}
              onChange={toggle(setDisplay, "highContrastTimer")}
            />
          }
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security" icon={<Shield size={16} />}>
        <SettingRow
          label="Two-Factor Authentication"
          sub="Managed via your account security settings"
          control={
            <Link
              href="/account"
              className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300"
            >
              Manage <ChevronRight size={12} />
            </Link>
          }
        />
        <SettingRow
          label="Active Sessions"
          sub="View and revoke active sign-in sessions"
          control={
            <Link
              href="/account"
              className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300"
            >
              View <ChevronRight size={12} />
            </Link>
          }
        />
        <SettingRow
          label="Data & Privacy"
          sub="Download or delete your quiz history data"
          control={
            <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Request
            </button>
          }
        />
      </Section>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            saved
              ? "bg-emerald-500 text-black"
              : "bg-amber-400 hover:bg-amber-300 text-black"
          }`}
        >
          {saved ? (
            <>
              <Check size={15} /> Saved!
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  );
}
