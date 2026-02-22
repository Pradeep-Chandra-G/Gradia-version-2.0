"use client";

import { CircleCheckBig, NotepadTextDashed, Users } from "lucide-react";
import React from "react";
import StatCard from "./StatCard";
import { useUser } from "@clerk/nextjs";

const DASHBOARD_STATS = {
  STUDENT: ["Upcoming Quizzes", "Avg. Score", "Completion Rate"],
  INSTRUCTOR: ["Active Assessments", "Avg. Student Score", "Engagement Rate"],
  ADMIN: ["Active Assessments", "Total Candidates", "Avg. Completion Rate"],
};

const studentStats = {
  upcomingQuizzes: 10,
  avgScore: 50,
  completionRate: 80.67,
};

const instructorStats = {
  activeAssignments: 10,
  avgStudentScore: 50,
  engagementRate: 80.67,
};

const adminStats = {
  activeAssignments: 10,
  totalCandidates: 5000,
  avgCompletionRate: 80.67,
};

function CoreStats() {
  const role = useUser().user?.publicMetadata.role;
  return (
    <div className="px-8">
      {role === "ADMIN" && (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <StatCard
            trend={10}
            value={adminStats.activeAssignments}
            title={DASHBOARD_STATS.ADMIN[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600 " />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={-2}
            value={adminStats.totalCandidates}
            title={DASHBOARD_STATS.ADMIN[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={8}
            value={Math.round(adminStats.avgCompletionRate)}
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
            trend={10}
            value={instructorStats.activeAssignments}
            title={DASHBOARD_STATS.INSTRUCTOR[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600 " />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={-2}
            value={instructorStats.avgStudentScore}
            title={DASHBOARD_STATS.INSTRUCTOR[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={8}
            value={Math.round(instructorStats.engagementRate)}
            title={DASHBOARD_STATS.INSTRUCTOR[2]}
            subtype="time"
            type="percentage"
            icon={<CircleCheckBig size={28} className="text-amber-500" />}
            iconBgColor="bg-amber-500/5"
          />
        </div>
      )}
      {role === "STUDENT" && (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <StatCard
            trend={10}
            value={studentStats.upcomingQuizzes}
            title={DASHBOARD_STATS.STUDENT[0]}
            subtype="percentage"
            type="number"
            icon={<NotepadTextDashed size={28} className="text-blue-600 " />}
            iconBgColor="bg-blue-600/5"
          />
          <StatCard
            trend={-2}
            value={studentStats.avgScore}
            title={DASHBOARD_STATS.STUDENT[1]}
            subtype="percentage"
            type="number"
            icon={<Users size={28} className="text-fuchsia-500" />}
            iconBgColor="bg-fuchsia-500/5"
          />
          <StatCard
            trend={8}
            value={Math.round(studentStats.completionRate)}
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
