import {
  PrismaClient,
  Role,
  QuizStatus,
  QuizAccessType,
  QuestionType,
  AttemptStatus,
  EnrollmentStatus,
} from "@/app/generated/prisma/client";

import { prisma } from "@/app/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  await prisma.answer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.section.deleteMany();
  await prisma.quizInvitation.deleteMany();
  await prisma.quizBatch.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.batchStudent.deleteMany();
  await prisma.batchInstructor.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.org.deleteMany();
  console.log("✓ Cleaned existing data");

  // ─── Org ────────────────────────────────────────────────────────────────────
  const org = await prisma.org.create({
    data: {
      id: "org_techacademy",
      name: "Tech Academy",
      description: "A premier coding bootcamp for aspiring developers",
    },
  });
  console.log("✓ Created org:", org.name);

  // ─── Users ──────────────────────────────────────────────────────────────────
  // NOTE: These IDs must match real Clerk user IDs in production.
  // For local dev/testing, use these placeholder IDs.

  const admin = await prisma.user.create({
    data: {
      id: "user_admin_001",
      email: "admin@techacademy.com",
      firstName: "Alex",
      lastName: "Morgan",
      role: Role.ADMIN,
      orgId: org.id,
    },
  });

  // Update org adminId
  await prisma.org.update({
    where: { id: org.id },
    data: { adminId: admin.id },
  });

  const instructor1 = await prisma.user.create({
    data: {
      id: "user_instructor_001",
      email: "priya@techacademy.com",
      firstName: "Priya",
      lastName: "Sharma",
      role: Role.INSTRUCTOR,
      orgId: org.id,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      id: "user_instructor_002",
      email: "rahul@techacademy.com",
      firstName: "Rahul",
      lastName: "Verma",
      role: Role.INSTRUCTOR,
      orgId: org.id,
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        id: "user_student_001",
        email: "ananya@student.com",
        firstName: "Ananya",
        lastName: "Patel",
        role: Role.STUDENT,
        orgId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: "user_student_002",
        email: "vikram@student.com",
        firstName: "Vikram",
        lastName: "Singh",
        role: Role.STUDENT,
        orgId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: "user_student_003",
        email: "meera@student.com",
        firstName: "Meera",
        lastName: "Nair",
        role: Role.STUDENT,
        orgId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: "user_student_004",
        email: "arjun@student.com",
        firstName: "Arjun",
        lastName: "Kumar",
        role: Role.STUDENT,
        orgId: org.id,
      },
    }),
    prisma.user.create({
      data: {
        id: "user_student_005",
        email: "divya@student.com",
        firstName: "Divya",
        lastName: "Reddy",
        role: Role.STUDENT,
        orgId: org.id,
      },
    }),
  ]);
  console.log(
    `✓ Created ${students.length + 3} users (1 admin, 2 instructors, ${students.length} students)`,
  );

  // ─── Batches ─────────────────────────────────────────────────────────────────
  const batch1 = await prisma.batch.create({
    data: {
      id: "batch_java_001",
      name: "Java Batch A",
      subject: "Java & Spring Boot",
      description: "Full-stack Java development with Spring Boot and REST APIs",
      color: "amber",
      joinCode: "JAVA2025",
      orgId: org.id,
      instructors: { create: { instructorId: instructor1.id } },
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      id: "batch_python_001",
      name: "Python Batch B",
      subject: "Python & Django",
      description: "Backend development with Python, Django and PostgreSQL",
      color: "blue",
      joinCode: "PY2025B",
      orgId: org.id,
      instructors: { create: { instructorId: instructor1.id } },
    },
  });

  const batch3 = await prisma.batch.create({
    data: {
      id: "batch_dsa_001",
      name: "DSA Bootcamp",
      subject: "Data Structures & Algorithms",
      description: "Intensive DSA prep for product-based company interviews",
      color: "green",
      joinCode: "DSA2025",
      orgId: org.id,
      instructors: { create: { instructorId: instructor2.id } },
    },
  });
  console.log("✓ Created 3 batches");

  // ─── Enrollments ─────────────────────────────────────────────────────────────
  const now = new Date();
  const enrollmentData = [
    // batch1: students 0,1,2 active; student 3 pending
    {
      batchId: batch1.id,
      studentId: students[0].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 30 * 86400000),
    },
    {
      batchId: batch1.id,
      studentId: students[1].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 28 * 86400000),
    },
    {
      batchId: batch1.id,
      studentId: students[2].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 25 * 86400000),
    },
    {
      batchId: batch1.id,
      studentId: students[3].id,
      status: EnrollmentStatus.PENDING_INSTRUCTOR,
      invitedBy: instructor1.id,
    },
    // batch2: students 0,2,4 active
    {
      batchId: batch2.id,
      studentId: students[0].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 20 * 86400000),
    },
    {
      batchId: batch2.id,
      studentId: students[2].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 18 * 86400000),
    },
    {
      batchId: batch2.id,
      studentId: students[4].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 15 * 86400000),
    },
    // batch3: students 1,3,4 active; student 2 pending admin
    {
      batchId: batch3.id,
      studentId: students[1].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 10 * 86400000),
    },
    {
      batchId: batch3.id,
      studentId: students[3].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 8 * 86400000),
    },
    {
      batchId: batch3.id,
      studentId: students[4].id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(now.getTime() - 6 * 86400000),
    },
    {
      batchId: batch3.id,
      studentId: students[2].id,
      status: EnrollmentStatus.PENDING_ADMIN,
      invitedBy: instructor2.id,
    },
  ];

  await prisma.batchStudent.createMany({ data: enrollmentData });
  console.log("✓ Created enrollments");

  // ─── Quizzes ─────────────────────────────────────────────────────────────────
  const quiz1 = await prisma.quiz.create({
    data: {
      id: "quiz_java_oop",
      title: "Java OOP Fundamentals",
      description:
        "Test your understanding of Object-Oriented Programming in Java",
      subject: "Java",
      difficulty: "MEDIUM",
      status: QuizStatus.PUBLISHED,
      accessType: QuizAccessType.BATCH_ONLY,
      totalTimeLimit: 30,
      passScore: 60,
      correctPoints: 4,
      wrongPoints: -1,
      showResultsImmediately: true,
      beginWindow: new Date(now.getTime() - 7 * 86400000),
      endWindow: new Date(now.getTime() + 7 * 86400000),
      publishedAt: new Date(now.getTime() - 7 * 86400000),
      orgId: org.id,
      createdBy: instructor1.id,
      batches: { create: { batchId: batch1.id } },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      id: "quiz_spring_basics",
      title: "Spring Boot Basics",
      description: "REST APIs, dependency injection, and Spring annotations",
      subject: "Java",
      difficulty: "HARD",
      status: QuizStatus.PUBLISHED,
      accessType: QuizAccessType.BATCH_ONLY,
      totalTimeLimit: 45,
      passScore: 65,
      correctPoints: 4,
      wrongPoints: -1,
      showResultsImmediately: true,
      beginWindow: new Date(now.getTime() - 3 * 86400000),
      endWindow: new Date(now.getTime() + 14 * 86400000),
      publishedAt: new Date(now.getTime() - 3 * 86400000),
      orgId: org.id,
      createdBy: instructor1.id,
      batches: { create: { batchId: batch1.id } },
    },
  });

  const quiz3 = await prisma.quiz.create({
    data: {
      id: "quiz_python_basics",
      title: "Python Fundamentals",
      description: "Core Python concepts: lists, dicts, functions, and OOP",
      subject: "Python",
      difficulty: "EASY",
      status: QuizStatus.PUBLISHED,
      accessType: QuizAccessType.BATCH_ONLY,
      totalTimeLimit: 25,
      passScore: 50,
      correctPoints: 4,
      wrongPoints: -1,
      showResultsImmediately: true,
      beginWindow: new Date(now.getTime() - 5 * 86400000),
      endWindow: new Date(now.getTime() + 10 * 86400000),
      publishedAt: new Date(now.getTime() - 5 * 86400000),
      orgId: org.id,
      createdBy: instructor1.id,
      batches: { create: { batchId: batch2.id } },
    },
  });

  const quiz4 = await prisma.quiz.create({
    data: {
      id: "quiz_dsa_arrays",
      title: "Arrays & Strings",
      description: "Classic array and string manipulation problems",
      subject: "DSA",
      difficulty: "MEDIUM",
      status: QuizStatus.PUBLISHED,
      accessType: QuizAccessType.BATCH_ONLY,
      totalTimeLimit: 60,
      passScore: 60,
      correctPoints: 5,
      wrongPoints: -1,
      showResultsImmediately: false,
      beginWindow: new Date(now.getTime() - 2 * 86400000),
      endWindow: new Date(now.getTime() + 5 * 86400000),
      publishedAt: new Date(now.getTime() - 2 * 86400000),
      orgId: org.id,
      createdBy: instructor2.id,
      batches: { create: { batchId: batch3.id } },
    },
  });

  const quiz5 = await prisma.quiz.create({
    data: {
      id: "quiz_dbms_draft",
      title: "DBMS & SQL",
      description: "Relational databases, normalization, and SQL queries",
      subject: "DBMS",
      difficulty: "MEDIUM",
      status: QuizStatus.DRAFT,
      accessType: QuizAccessType.BATCH_ONLY,
      totalTimeLimit: 40,
      passScore: 60,
      correctPoints: 4,
      wrongPoints: -1,
      showResultsImmediately: true,
      orgId: org.id,
      createdBy: instructor2.id,
    },
  });
  console.log("✓ Created 5 quizzes (4 published, 1 draft)");

  // ─── Sections & Questions ────────────────────────────────────────────────────
  // Quiz 1: Java OOP — 2 sections, 5 questions each
  const sec1 = await prisma.section.create({
    data: {
      quizId: quiz1.id,
      title: "Core OOP Concepts",
      order: 1,
      sectionalTotalScore: 20,
      questions: {
        create: [
          {
            order: 1,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "Which of the following is NOT a pillar of OOP?",
            points: 4,
            explanation:
              "The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism. Compilation is not one of them.",
            options: {
              create: [
                { order: 1, optionText: "Encapsulation", isCorrect: false },
                { order: 2, optionText: "Compilation", isCorrect: true },
                { order: 3, optionText: "Inheritance", isCorrect: false },
                { order: 4, optionText: "Polymorphism", isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "What keyword is used to inherit a class in Java?",
            points: 4,
            explanation:
              "'extends' is the keyword used for inheritance in Java.",
            options: {
              create: [
                { order: 1, optionText: "implements", isCorrect: false },
                { order: 2, optionText: "inherits", isCorrect: false },
                { order: 3, optionText: "extends", isCorrect: true },
                { order: 4, optionText: "super", isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            questionType: QuestionType.TRUE_FALSE,
            questionText:
              "In Java, a class can extend multiple classes simultaneously.",
            points: 4,
            explanation:
              "Java does not support multiple inheritance for classes. A class can only extend one class but can implement multiple interfaces.",
            options: {
              create: [
                { order: 1, optionText: "True", isCorrect: false },
                { order: 2, optionText: "False", isCorrect: true },
              ],
            },
          },
          {
            order: 4,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "Which access modifier makes a member accessible only within its own class?",
            points: 4,
            explanation:
              "'private' restricts access to within the same class only.",
            options: {
              create: [
                { order: 1, optionText: "public", isCorrect: false },
                { order: 2, optionText: "protected", isCorrect: false },
                { order: 3, optionText: "default", isCorrect: false },
                { order: 4, optionText: "private", isCorrect: true },
              ],
            },
          },
          {
            order: 5,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "What is method overloading?",
            points: 4,
            explanation:
              "Method overloading is defining multiple methods with the same name but different parameter lists in the same class.",
            options: {
              create: [
                {
                  order: 1,
                  optionText: "Defining the same method in a subclass",
                  isCorrect: false,
                },
                {
                  order: 2,
                  optionText:
                    "Multiple methods with same name but different parameters",
                  isCorrect: true,
                },
                {
                  order: 3,
                  optionText: "Calling a method multiple times",
                  isCorrect: false,
                },
                {
                  order: 4,
                  optionText: "Overriding a parent class method",
                  isCorrect: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const sec2 = await prisma.section.create({
    data: {
      quizId: quiz1.id,
      title: "Interfaces & Abstract Classes",
      order: 2,
      sectionalTotalScore: 20,
      questions: {
        create: [
          {
            order: 1,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "Which statement about interfaces in Java is correct?",
            points: 4,
            explanation:
              "All methods in an interface are implicitly public and abstract (unless they are default or static methods in Java 8+).",
            options: {
              create: [
                {
                  order: 1,
                  optionText: "Interfaces can have constructors",
                  isCorrect: false,
                },
                {
                  order: 2,
                  optionText: "A class can implement only one interface",
                  isCorrect: false,
                },
                {
                  order: 3,
                  optionText:
                    "Interface methods are implicitly public and abstract",
                  isCorrect: true,
                },
                {
                  order: 4,
                  optionText: "Interfaces can have instance variables",
                  isCorrect: false,
                },
              ],
            },
          },
          {
            order: 2,
            questionType: QuestionType.TRUE_FALSE,
            questionText:
              "An abstract class can have both abstract and non-abstract methods.",
            points: 4,
            explanation:
              "True. Abstract classes can contain a mix of abstract (no body) and concrete (with body) methods.",
            options: {
              create: [
                { order: 1, optionText: "True", isCorrect: true },
                { order: 2, optionText: "False", isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "What is the output of calling toString() on an object that doesn't override it?",
            points: 4,
            explanation:
              "The default toString() from Object class returns the class name followed by '@' and the hashCode in hexadecimal.",
            options: {
              create: [
                { order: 1, optionText: "null", isCorrect: false },
                {
                  order: 2,
                  optionText: "The object's field values",
                  isCorrect: false,
                },
                { order: 3, optionText: "ClassName@hashcode", isCorrect: true },
                { order: 4, optionText: "Compilation error", isCorrect: false },
              ],
            },
          },
          {
            order: 4,
            questionType: QuestionType.MCQ,
            questionText:
              "Which of the following can an interface contain? (Select all that apply)",
            points: 4,
            explanation:
              "Since Java 8, interfaces can contain abstract methods, default methods, and static methods. They cannot have instance fields or constructors.",
            options: {
              create: [
                { order: 1, optionText: "Abstract methods", isCorrect: true },
                { order: 2, optionText: "Default methods", isCorrect: true },
                { order: 3, optionText: "Instance fields", isCorrect: false },
                { order: 4, optionText: "Static methods", isCorrect: true },
              ],
            },
          },
          {
            order: 5,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "Which keyword is used to implement an interface?",
            points: 4,
            explanation:
              "The 'implements' keyword is used by a class to implement an interface.",
            options: {
              create: [
                { order: 1, optionText: "extends", isCorrect: false },
                { order: 2, optionText: "implements", isCorrect: true },
                { order: 3, optionText: "interface", isCorrect: false },
                { order: 4, optionText: "override", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  // Quiz 3: Python Fundamentals — 1 section, 4 questions
  const sec3 = await prisma.section.create({
    data: {
      quizId: quiz3.id,
      title: "Python Core",
      order: 1,
      sectionalTotalScore: 16,
      questions: {
        create: [
          {
            order: 1,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "What is the output of: type([]) in Python?",
            points: 4,
            explanation:
              "[] is a list literal, so type([]) returns <class 'list'>.",
            options: {
              create: [
                { order: 1, optionText: "<class 'list'>", isCorrect: true },
                { order: 2, optionText: "<class 'array'>", isCorrect: false },
                { order: 3, optionText: "<class 'tuple'>", isCorrect: false },
                { order: 4, optionText: "list", isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            questionType: QuestionType.TRUE_FALSE,
            questionText: "Python lists are immutable.",
            points: 4,
            explanation:
              "False. Python lists are mutable — you can add, remove, and change elements. Tuples are immutable.",
            options: {
              create: [
                { order: 1, optionText: "True", isCorrect: false },
                { order: 2, optionText: "False", isCorrect: true },
              ],
            },
          },
          {
            order: 3,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "Which of the following is used to define a function in Python?",
            points: 4,
            explanation:
              "The 'def' keyword is used to define functions in Python.",
            options: {
              create: [
                { order: 1, optionText: "function", isCorrect: false },
                { order: 2, optionText: "def", isCorrect: true },
                { order: 3, optionText: "fn", isCorrect: false },
                { order: 4, optionText: "func", isCorrect: false },
              ],
            },
          },
          {
            order: 4,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "What does the 'self' parameter represent in a Python class method?",
            points: 4,
            explanation:
              "'self' refers to the instance of the class being operated on. It must be the first parameter in instance methods.",
            options: {
              create: [
                { order: 1, optionText: "The class itself", isCorrect: false },
                {
                  order: 2,
                  optionText: "The current module",
                  isCorrect: false,
                },
                {
                  order: 3,
                  optionText: "The instance of the class",
                  isCorrect: true,
                },
                {
                  order: 4,
                  optionText: "A reserved keyword with no meaning",
                  isCorrect: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Quiz 4: DSA — 1 section, 4 questions
  const sec4 = await prisma.section.create({
    data: {
      quizId: quiz4.id,
      title: "Arrays & Time Complexity",
      order: 1,
      sectionalTotalScore: 20,
      questions: {
        create: [
          {
            order: 1,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "What is the time complexity of accessing an element in an array by index?",
            points: 5,
            explanation:
              "Array access by index is O(1) — constant time — because elements are stored in contiguous memory.",
            options: {
              create: [
                { order: 1, optionText: "O(1)", isCorrect: true },
                { order: 2, optionText: "O(n)", isCorrect: false },
                { order: 3, optionText: "O(log n)", isCorrect: false },
                { order: 4, optionText: "O(n²)", isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            questionType: QuestionType.SINGLE_OPTION,
            questionText:
              "Which algorithm has the best average-case time complexity for sorting?",
            points: 5,
            explanation:
              "QuickSort and MergeSort both have O(n log n) average case, which is optimal for comparison-based sorting.",
            options: {
              create: [
                {
                  order: 1,
                  optionText: "Bubble Sort — O(n²)",
                  isCorrect: false,
                },
                {
                  order: 2,
                  optionText: "Selection Sort — O(n²)",
                  isCorrect: false,
                },
                {
                  order: 3,
                  optionText: "Quick Sort — O(n log n)",
                  isCorrect: true,
                },
                {
                  order: 4,
                  optionText: "Insertion Sort — O(n²)",
                  isCorrect: false,
                },
              ],
            },
          },
          {
            order: 3,
            questionType: QuestionType.TRUE_FALSE,
            questionText:
              "A two-pointer approach can solve the 'Two Sum' problem in O(n) time on a sorted array.",
            points: 5,
            explanation:
              "True. On a sorted array, two pointers (one from each end) can find a pair summing to target in a single O(n) pass.",
            options: {
              create: [
                { order: 1, optionText: "True", isCorrect: true },
                { order: 2, optionText: "False", isCorrect: false },
              ],
            },
          },
          {
            order: 4,
            questionType: QuestionType.SINGLE_OPTION,
            questionText: "What is the space complexity of Merge Sort?",
            points: 5,
            explanation:
              "Merge Sort requires O(n) auxiliary space for the temporary arrays used during merging.",
            options: {
              create: [
                { order: 1, optionText: "O(1)", isCorrect: false },
                { order: 2, optionText: "O(log n)", isCorrect: false },
                { order: 3, optionText: "O(n)", isCorrect: true },
                { order: 4, optionText: "O(n log n)", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✓ Created sections and questions");

  // ─── Attempts & Answers ──────────────────────────────────────────────────────
  // Fetch question/option IDs for quiz1 sec1 (needed to create answers)
  const q1Questions = await prisma.question.findMany({
    where: { sectionId: { in: [sec1.id, sec2.id] } },
    include: { options: true },
    orderBy: [{ sectionId: "asc" }, { order: "asc" }],
  });

  // Helper to get correct option ID for a question
  const correctOption = (q: (typeof q1Questions)[0]) =>
    q.options.find((o) => o.isCorrect)!;

  // Helper to get wrong option ID for a question
  const wrongOption = (q: (typeof q1Questions)[0]) =>
    q.options.find((o) => !o.isCorrect)!;

  // Student 0 (Ananya) — completed quiz1 with good score
  const attempt1 = await prisma.attempt.create({
    data: {
      userId: students[0].id,
      quizId: quiz1.id,
      attemptNumber: 1,
      status: AttemptStatus.SUBMITTED,
      startedAt: new Date(now.getTime() - 6 * 86400000),
      submittedAt: new Date(now.getTime() - 6 * 86400000 + 25 * 60000),
      timeSpent: 1500,
      totalScore: 32,
      maxScore: 40,
      percentageScore: 80,
      passed: true,
    },
  });
  // Create answers for attempt1 (8/10 correct)
  for (let i = 0; i < q1Questions.length; i++) {
    const q = q1Questions[i];
    const isCorrect = i < 8; // first 8 correct
    const selectedOption = isCorrect ? correctOption(q) : wrongOption(q);
    await prisma.answer.create({
      data: {
        attemptId: attempt1.id,
        questionId: q.id,
        optionId: selectedOption.id,
        ...(q.questionType === QuestionType.MCQ && {
          selectedOptions: [selectedOption.id],
        }),
        isCorrect,
        pointsEarned: isCorrect ? q.points : -1,
        timeSpent: Math.floor(Math.random() * 120) + 30,
      },
    });
  }

  // Student 1 (Vikram) — completed quiz1 with average score
  const attempt2 = await prisma.attempt.create({
    data: {
      userId: students[1].id,
      quizId: quiz1.id,
      attemptNumber: 1,
      status: AttemptStatus.SUBMITTED,
      startedAt: new Date(now.getTime() - 5 * 86400000),
      submittedAt: new Date(now.getTime() - 5 * 86400000 + 28 * 60000),
      timeSpent: 1680,
      totalScore: 24,
      maxScore: 40,
      percentageScore: 60,
      passed: true,
    },
  });
  for (let i = 0; i < q1Questions.length; i++) {
    const q = q1Questions[i];
    const isCorrect = i < 6;
    const selectedOption = isCorrect ? correctOption(q) : wrongOption(q);
    await prisma.answer.create({
      data: {
        attemptId: attempt2.id,
        questionId: q.id,
        optionId: selectedOption.id,
        ...(q.questionType === QuestionType.MCQ && {
          selectedOptions: [selectedOption.id],
        }),
        isCorrect,
        pointsEarned: isCorrect ? q.points : -1,
        timeSpent: Math.floor(Math.random() * 150) + 40,
      },
    });
  }

  // Student 2 (Meera) — completed quiz1, failed
  const attempt3 = await prisma.attempt.create({
    data: {
      userId: students[2].id,
      quizId: quiz1.id,
      attemptNumber: 1,
      status: AttemptStatus.SUBMITTED,
      startedAt: new Date(now.getTime() - 4 * 86400000),
      submittedAt: new Date(now.getTime() - 4 * 86400000 + 30 * 60000),
      timeSpent: 1800,
      totalScore: 16,
      maxScore: 40,
      percentageScore: 40,
      passed: false,
    },
  });
  for (let i = 0; i < q1Questions.length; i++) {
    const q = q1Questions[i];
    const isCorrect = i < 4;
    const selectedOption = isCorrect ? correctOption(q) : wrongOption(q);
    await prisma.answer.create({
      data: {
        attemptId: attempt3.id,
        questionId: q.id,
        optionId: selectedOption.id,
        ...(q.questionType === QuestionType.MCQ && {
          selectedOptions: [selectedOption.id],
        }),
        isCorrect,
        pointsEarned: isCorrect ? q.points : -1,
        timeSpent: Math.floor(Math.random() * 180) + 60,
      },
    });
  }

  // Student 0 (Ananya) — also completed quiz3 (Python)
  const q3Questions = await prisma.question.findMany({
    where: { sectionId: sec3.id },
    include: { options: true },
    orderBy: { order: "asc" },
  });
  const attempt4 = await prisma.attempt.create({
    data: {
      userId: students[0].id,
      quizId: quiz3.id,
      attemptNumber: 1,
      status: AttemptStatus.SUBMITTED,
      startedAt: new Date(now.getTime() - 3 * 86400000),
      submittedAt: new Date(now.getTime() - 3 * 86400000 + 20 * 60000),
      timeSpent: 1200,
      totalScore: 12,
      maxScore: 16,
      percentageScore: 75,
      passed: true,
    },
  });
  for (let i = 0; i < q3Questions.length; i++) {
    const q = q3Questions[i];
    const isCorrect = i < 3;
    const selectedOption = isCorrect ? correctOption(q) : wrongOption(q);
    await prisma.answer.create({
      data: {
        attemptId: attempt4.id,
        questionId: q.id,
        optionId: selectedOption.id,
        isCorrect,
        pointsEarned: isCorrect ? q.points : -1,
        timeSpent: Math.floor(Math.random() * 100) + 30,
      },
    });
  }

  console.log("✓ Created 4 attempts with answers");
  console.log("\n✅ Seed complete!\n");
  console.log("Summary:");
  console.log("  • 1 org: Tech Academy");
  console.log("  • 3 users: 1 admin, 2 instructors, 5 students");
  console.log("  • 3 batches: Java, Python, DSA");
  console.log("  • 5 quizzes: 4 published, 1 draft");
  console.log("  • 10 questions across 4 sections (quiz1 + quiz3 + quiz4)");
  console.log("  • 4 completed attempts with per-question answers");
  console.log("\n⚠️  Remember: User IDs are placeholder values.");
  console.log(
    "   Replace them with real Clerk user IDs before testing auth-protected routes.\n",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
