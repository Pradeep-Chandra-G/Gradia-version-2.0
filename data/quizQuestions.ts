export type QuizSeed = { quizId: string; sections: SectionSeed[] };
export type SectionSeed = {
  section_id: number;
  title: string;
  instructions?: string;
  order: number;
  sectionalTotalScore: number;
  questions: QuestionSeed[];
};
export type QuestionSeed = {
  question_id: number;
  questionType: "MCQ" | "SINGLE_OPTION" | "TRUE_FALSE" | "CODING_QUESTION";
  questionText: string;
  order: number;
  points: number;
  options?: {
    optionId: number;
    optionText: string;
    isCorrect: boolean;
    order: number;
  }[];
  codeTemplate?: string;
  testCases?: any;
  explanation?: string;
};

export const quiz1: QuizSeed = {
  quizId: "1",
  sections: [
    {
      section_id: 1,
      title: "Core Java Fundamentals",
      order: 1,
      sectionalTotalScore: 10,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which of the following is a primitive data type in Java?",
          order: 1,
          points: 2,
          options: [
            { optionId: 101, optionText: "String", isCorrect: false, order: 1 },
            {
              optionId: 102,
              optionText: "Integer",
              isCorrect: false,
              order: 2,
            },
            { optionId: 103, optionText: "int", isCorrect: true, order: 3 },
            {
              optionId: 104,
              optionText: "ArrayList",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation: "int is a primitive type, others are reference types.",
        },
        {
          question_id: 2,
          questionType: "TRUE_FALSE",
          questionText: "Java supports multiple inheritance using classes.",
          order: 2,
          points: 2,
          options: [
            { optionId: 201, optionText: "True", isCorrect: false, order: 1 },
            { optionId: 202, optionText: "False", isCorrect: true, order: 2 },
          ],
          explanation:
            "Java supports multiple inheritance through interfaces only.",
        },
        {
          question_id: 3,
          questionType: "MCQ",
          questionText: "Which are valid loop constructs in Java?",
          order: 3,
          points: 3,
          options: [
            { optionId: 301, optionText: "for", isCorrect: true, order: 1 },
            { optionId: 302, optionText: "while", isCorrect: true, order: 2 },
            {
              optionId: 303,
              optionText: "repeat-until",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 304,
              optionText: "do-while",
              isCorrect: true,
              order: 4,
            },
          ],
        },
      ],
    },
  ],
};

export const quiz3: QuizSeed = {
  quizId: "3",
  sections: [
    {
      section_id: 1,
      title: "Relational Algebra & SQL",
      order: 1,
      sectionalTotalScore: 15,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which relational algebra operator removes duplicate tuples?",
          order: 1,
          points: 3,
          options: [
            {
              optionId: 101,
              optionText: "Projection",
              isCorrect: true,
              order: 1,
            },
            {
              optionId: 102,
              optionText: "Selection",
              isCorrect: false,
              order: 2,
            },
            { optionId: 103, optionText: "Join", isCorrect: false, order: 3 },
            {
              optionId: 104,
              optionText: "Union All",
              isCorrect: false,
              order: 4,
            },
          ],
        },
        {
          question_id: 2,
          questionType: "CODING_QUESTION",
          questionText:
            "Write an SQL query to find the second highest salary from Employee table.",
          order: 2,
          points: 5,
          codeTemplate: `SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);`,
          testCases: {
            expectedKeywords: ["MAX", "salary"],
          },
          explanation: "Use subquery to exclude highest salary.",
        },
      ],
    },
  ],
};

export const quiz4: QuizSeed = {
  quizId: "4",
  sections: [
    {
      section_id: 1,
      title: "Process Management",
      order: 1,
      sectionalTotalScore: 12,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText: "Which data structure holds process information in OS?",
          order: 1,
          points: 3,
          options: [
            {
              optionId: 101,
              optionText: "Process Control Block",
              isCorrect: true,
              order: 1,
            },
            { optionId: 102, optionText: "Stack", isCorrect: false, order: 2 },
            { optionId: 103, optionText: "Heap", isCorrect: false, order: 3 },
            {
              optionId: 104,
              optionText: "Semaphore",
              isCorrect: false,
              order: 4,
            },
          ],
        },
        {
          question_id: 2,
          questionType: "MCQ",
          questionText: "Which are IPC mechanisms?",
          order: 2,
          points: 4,
          options: [
            { optionId: 201, optionText: "Pipes", isCorrect: true, order: 1 },
            {
              optionId: 202,
              optionText: "Shared Memory",
              isCorrect: true,
              order: 2,
            },
            { optionId: 203, optionText: "Signals", isCorrect: true, order: 3 },
            { optionId: 204, optionText: "Cache", isCorrect: false, order: 4 },
          ],
        },
      ],
    },
  ],
};
