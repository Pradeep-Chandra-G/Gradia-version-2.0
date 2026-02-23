"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Monitor,
  Shield,
  ChevronRight,
  Check,
  ExternalLink,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react";

type ToggleProps = { enabled: boolean; onToggle: () => void };
function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5.5 rounded-full border transition-colors duration-200 ${enabled ? "bg-amber-400 border-amber-400" : "bg-neutral-700 border-neutral-600"}`}
      style={{ minWidth: 40, height: 22 }}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

type SettingRowProps = {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
};
function SettingRow({ label, desc, enabled, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-gray-500" />
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="border-t border-white/5 mt-3">{children}</div>
    </div>
  );
}

export default function InstructorSettingsClient() {
  const [prefs, setPrefs] = useState({
    submissionAlerts: true,
    batchRequestAlerts: true,
    adminApprovalAlerts: true,
    weeklyDigest: false,
    emailNotifications: true,
    autoCloseQuizzes: false,
    showStudentNames: true,
    anonymousGrading: false,
    publishResultsImmediately: true,
  });

  const toggle = (k: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 text-white min-h-full max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage instructor preferences and notifications
        </p>
      </div>

      {/* Profile shortcut */}
      <Link href="/account">
        <div className="flex items-center justify-between bg-neutral-900 border border-white/8 rounded-2xl p-4 mb-5 hover:border-white/15 transition group cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-white">
              Profile & Account
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Name, email, password, photo
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-amber-400 transition">
            Edit <ExternalLink size={12} />
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-4">
        <SectionCard icon={Bell} title="Notifications">
          <SettingRow
            label="Student submits quiz"
            desc="Alert when a student submits in your batch"
            enabled={prefs.submissionAlerts}
            onToggle={() => toggle("submissionAlerts")}
          />
          <SettingRow
            label="Batch join requests"
            desc="Alert when a student requests to join your batch"
            enabled={prefs.batchRequestAlerts}
            onToggle={() => toggle("batchRequestAlerts")}
          />
          <SettingRow
            label="Admin approvals"
            desc="Alert when admin approves or rejects a join request"
            enabled={prefs.adminApprovalAlerts}
            onToggle={() => toggle("adminApprovalAlerts")}
          />
          <SettingRow
            label="Weekly summary digest"
            desc="Weekly email with batch performance highlights"
            enabled={prefs.weeklyDigest}
            onToggle={() => toggle("weeklyDigest")}
          />
          <SettingRow
            label="Email notifications"
            desc="Receive all alerts via email as well"
            enabled={prefs.emailNotifications}
            onToggle={() => toggle("emailNotifications")}
          />
        </SectionCard>

        <SectionCard icon={BookOpen} title="Quiz Behaviour">
          <SettingRow
            label="Auto-close after deadline"
            desc="Automatically close quizzes when deadline passes"
            enabled={prefs.autoCloseQuizzes}
            onToggle={() => toggle("autoCloseQuizzes")}
          />
          <SettingRow
            label="Publish results immediately"
            desc="Students see results right after submission"
            enabled={prefs.publishResultsImmediately}
            onToggle={() => toggle("publishResultsImmediately")}
          />
          <SettingRow
            label="Anonymous grading"
            desc="Hide student names when reviewing submissions"
            enabled={prefs.anonymousGrading}
            onToggle={() => toggle("anonymousGrading")}
          />
        </SectionCard>

        <SectionCard icon={BarChart3} title="Analytics">
          <SettingRow
            label="Show student names"
            desc="Display names in analytics charts and tables"
            enabled={prefs.showStudentNames}
            onToggle={() => toggle("showStudentNames")}
          />
        </SectionCard>

        <SectionCard icon={Shield} title="Privacy & Security">
          <div className="flex flex-col gap-2 pt-2">
            {[
              {
                label: "Enable 2-Factor Auth",
                href: "/account",
                desc: "Add extra security to your login",
              },
              {
                label: "Active Sessions",
                href: "/account",
                desc: "View and revoke login sessions",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between py-2.5 group hover:bg-neutral-800/30 rounded-xl px-1 transition"
              >
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-600 group-hover:text-gray-400 transition"
                />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-amber-400 text-black hover:bg-amber-300"
          }`}
        >
          {saved ? (
            <>
              <Check size={14} /> Saved!
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  );
}
