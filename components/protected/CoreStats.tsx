"use client";

import { CircleCheckBig, NotepadTextDashed, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { useUser } from "@clerk/nextjs";

const DASHBOARD_STATS = {
  STUDENT: ["Upcoming Quizzes", "Avg. Score", "Completion Rate"],
  INSTRUCTOR: ["Active Assessments", "Avg. Student Score", "Engagement Rate"],
  ADMIN: ["Active Assessments", "Total Candidates", "Avg. Completion Rate"],
};

type StudentStats = {
  upcoming: number;
  averageScore: number;
  completionRate: number;
};

function CoreStats() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    if (role === "STUDENT" || !role) {
      fetch("/api/student/dashboard")
        .then((r) => r.json())
        .then((d) => {
          const stats = d?.stats;
          if (!stats) return;
          const total = (stats.completed ?? 0) + (stats.upcoming ?? 0);
          const completionRate =
            total > 0 ? Math.round(((stats.completed ?? 0) / total) * 100) : 0;
          setStudentStats({
            upcoming: stats.upcoming ?? 0,
            averageScore: Math.round(stats.averageScore ?? 0),
            completionRate,
          });
        })
        .catch(console.error);
    }
  }, [role]);

  // Instructor and Admin stats are still not backed by a dedicated API.
  // Keep them clearly labelled as placeholders until those APIs are built.
  const instructorStats = {
    activeAssignments: 0,
    avgStudentScore: 0,
    engagementRate: 0,
  };
  const adminStats = {
    activeAssignments: 0,
    totalCandidates: 0,
    avgCompletionRate: 0,
  };

  return (
    <div className="px-8">
      {role === "ADMIN" && (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <StatCard
            trend={0}
            value={adminStats.activeAssignments}
            title={DASHBOARD_STATS.ADMIN[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600" />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={0}
            value={adminStats.totalCandidates}
            title={DASHBOARD_STATS.ADMIN[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={0}
            value={adminStats.avgCompletionRate}
            title={DASHBOARD_STATS.ADMIN[2]}
            subtype="time"
            type="percentage"
            icon={<CircleCheckBig size={28} className="text-amber-500" />}
            iconBgColor="bg-amber-500/5"
          />
        </div>
      )}

      {role === "INSTRUCTOR" && (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <StatCard
            trend={0}
            value={instructorStats.activeAssignments}
            title={DASHBOARD_STATS.INSTRUCTOR[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600" />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={0}
            value={instructorStats.avgStudentScore}
            title={DASHBOARD_STATS.INSTRUCTOR[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={0}
            value={Math.round(instructorStats.engagementRate)}
            title={DASHBOARD_STATS.INSTRUCTOR[2]}
            subtype="time"
            type="percentage"
            icon={<CircleCheckBig size={28} className="text-amber-500" />}
            iconBgColor="bg-amber-500/5"
          />
        </div>
      )}

      {(role === "STUDENT" || !role) && (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <StatCard
            trend={0}
            value={studentStats?.upcoming ?? 0}
            title={DASHBOARD_STATS.STUDENT[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600" />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={0}
            value={studentStats?.averageScore ?? 0}
            title={DASHBOARD_STATS.STUDENT[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={0}
            value={studentStats?.completionRate ?? 0}
            title={DASHBOARD_STATS.STUDENT[2]}
            subtype="time"
            type="percentage"
            icon={<CircleCheckBig size={28} className="text-amber-500" />}
            iconBgColor="bg-amber-500/5"
          />
        </div>
      )}
    </div>
  );
}

export default CoreStats;
