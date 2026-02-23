import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  // Batches this instructor manages
  const batchInstructors = await prisma.batchInstructor.findMany({
    where: { instructorId: user.id },
    include: {
      batch: {
        include: {
          students: { where: { status: "ACTIVE" } },
          quizzes: {
            include: {
              quiz: {
                select: { id: true, status: true },
              },
            },
          },
        },
      },
    },
  });

  const batchIds = batchInstructors.map((bi) => bi.batchId);

  // Quizzes created by this instructor
  const [quizzes, recentAttempts, pendingEnrollments] = await Promise.all([
    prisma.quiz.findMany({
      where: { createdBy: user.id },
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        difficulty: true,
        createdAt: true,
        attempts: { select: { id: true, passed: true, percentageScore: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attempt.findMany({
      where: { quiz: { createdBy: user.id }, status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        quiz: { select: { title: true } },
      },
    }),
    prisma.batchStudent.count({
      where: { batchId: { in: batchIds }, status: "PENDING_INSTRUCTOR" },
    }),
  ]);

  const totalStudents = batchInstructors.reduce(
    (s, bi) => s + bi.batch.students.length,
    0,
  );
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(
    (q) => q.status === "PUBLISHED",
  ).length;
  const allAttempts = quizzes.flatMap((q) => q.attempts);
  const avgScore =
    allAttempts.length > 0
      ? Math.round(
          allAttempts.reduce((s, a) => s + (a.percentageScore ?? 0), 0) /
            allAttempts.length,
        )
      : 0;

  return ok({
    instructor: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    stats: {
      totalBatches: batchInstructors.length,
      totalStudents,
      totalQuizzes,
      publishedQuizzes,
      totalAttempts: allAttempts.length,
      averageScore: avgScore,
      pendingEnrollments,
    },
    batches: batchInstructors.map((bi) => ({
      id: bi.batch.id,
      name: bi.batch.name,
      subject: bi.batch.subject,
      color: bi.batch.color,
      studentCount: bi.batch.students.length,
      quizCount: bi.batch.quizzes.length,
    })),
    recentQuizzes: quizzes.slice(0, 5).map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      status: q.status,
      difficulty: q.difficulty,
      attemptCount: q.attempts.length,
      passRate:
        q.attempts.length > 0
          ? Math.round(
              (q.attempts.filter((a) => a.passed).length / q.attempts.length) *
                100,
            )
          : 0,
    })),
    recentAttempts: recentAttempts.map((a) => ({
      id: a.id,
      studentName: `${a.user.firstName} ${a.user.lastName}`,
      studentEmail: a.user.email,
      quizTitle: a.quiz.title,
      percentageScore: a.percentageScore,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
  });
}
