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
    isSelected?: boolean;
  }[];
  codeTemplate?: string;
  testCases?: any;
  explanation?: string;
};

// Map from quiz id → QuizSeed (only quizzes that have questions defined)
export const quizDataMap: Record<string, QuizSeed> = {};

// ── Quiz 1: Java Basics ────────────────────────────────────────────────────
export const quiz1: QuizSeed = {
  quizId: "1",
  sections: [
    {
      section_id: 1,
      title: "Core Java Fundamentals",
      order: 1,
      sectionalTotalScore: 20,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which of the following is a primitive data type in Java?",
          order: 1,
          points: 4,
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
          explanation:
            "int is a primitive type. String, Integer, and ArrayList are all reference types.",
        },
        {
          question_id: 2,
          questionType: "TRUE_FALSE",
          questionText: "Java supports multiple inheritance using classes.",
          order: 2,
          points: 4,
          options: [
            { optionId: 201, optionText: "True", isCorrect: false, order: 1 },
            { optionId: 202, optionText: "False", isCorrect: true, order: 2 },
          ],
          explanation:
            "Java supports multiple inheritance through interfaces only, not classes.",
        },
        {
          question_id: 3,
          questionType: "MCQ",
          questionText:
            "Which are valid loop constructs in Java? (Select all that apply)",
          order: 3,
          points: 4,
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
          explanation:
            "Java has for, while, and do-while loops. repeat-until does not exist in Java.",
        },
        {
          question_id: 4,
          questionType: "SINGLE_OPTION",
          questionText:
            "What is the default value of a boolean variable in Java?",
          order: 4,
          points: 4,
          options: [
            { optionId: 401, optionText: "true", isCorrect: false, order: 1 },
            { optionId: 402, optionText: "false", isCorrect: true, order: 2 },
            { optionId: 403, optionText: "0", isCorrect: false, order: 3 },
            { optionId: 404, optionText: "null", isCorrect: false, order: 4 },
          ],
          explanation: "The default value of a boolean in Java is false.",
        },
        {
          question_id: 5,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which keyword is used to prevent method overriding in Java?",
          order: 5,
          points: 4,
          options: [
            { optionId: 501, optionText: "static", isCorrect: false, order: 1 },
            {
              optionId: 502,
              optionText: "private",
              isCorrect: false,
              order: 2,
            },
            { optionId: 503, optionText: "final", isCorrect: true, order: 3 },
            {
              optionId: 504,
              optionText: "abstract",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "The final keyword prevents a method from being overridden in subclasses.",
        },
      ],
    },
  ],
};

// ── Quiz 2: Spring Boot Fundamentals ─────────────────────────────────────
export const quiz2: QuizSeed = {
  quizId: "2",
  sections: [
    {
      section_id: 1,
      title: "Spring Boot Basics",
      order: 1,
      sectionalTotalScore: 20,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which annotation is used to mark the main class of a Spring Boot application?",
          order: 1,
          points: 4,
          options: [
            {
              optionId: 101,
              optionText: "@SpringApplication",
              isCorrect: false,
              order: 1,
            },
            {
              optionId: 102,
              optionText: "@SpringBootApplication",
              isCorrect: true,
              order: 2,
            },
            {
              optionId: 103,
              optionText: "@EnableAutoConfiguration",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 104,
              optionText: "@Component",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan.",
        },
        {
          question_id: 2,
          questionType: "MCQ",
          questionText:
            "Which of the following are valid Spring Boot starters? (Select all that apply)",
          order: 2,
          points: 4,
          options: [
            {
              optionId: 201,
              optionText: "spring-boot-starter-web",
              isCorrect: true,
              order: 1,
            },
            {
              optionId: 202,
              optionText: "spring-boot-starter-data-jpa",
              isCorrect: true,
              order: 2,
            },
            {
              optionId: 203,
              optionText: "spring-boot-starter-orm",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 204,
              optionText: "spring-boot-starter-security",
              isCorrect: true,
              order: 4,
            },
          ],
          explanation:
            "spring-boot-starter-orm does not exist. The correct one is spring-boot-starter-data-jpa.",
        },
        {
          question_id: 3,
          questionType: "TRUE_FALSE",
          questionText:
            "Spring Boot requires an XML configuration file to run.",
          order: 3,
          points: 4,
          options: [
            { optionId: 301, optionText: "True", isCorrect: false, order: 1 },
            { optionId: 302, optionText: "False", isCorrect: true, order: 2 },
          ],
          explanation:
            "Spring Boot uses auto-configuration and convention over configuration — no XML needed.",
        },
        {
          question_id: 4,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which annotation maps an HTTP GET request to a handler method?",
          order: 4,
          points: 4,
          options: [
            {
              optionId: 401,
              optionText: "@GetRequest",
              isCorrect: false,
              order: 1,
            },
            {
              optionId: 402,
              optionText: "@RequestMapping(method=GET)",
              isCorrect: false,
              order: 2,
            },
            {
              optionId: 403,
              optionText: "@GetMapping",
              isCorrect: true,
              order: 3,
            },
            {
              optionId: 404,
              optionText: "@HttpGet",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "@GetMapping is the shorthand for @RequestMapping(method = RequestMethod.GET).",
        },
        {
          question_id: 5,
          questionType: "SINGLE_OPTION",
          questionText: "What does the @Autowired annotation do in Spring?",
          order: 5,
          points: 4,
          options: [
            {
              optionId: 501,
              optionText: "Marks a class as a Spring bean",
              isCorrect: false,
              order: 1,
            },
            {
              optionId: 502,
              optionText: "Injects a dependency automatically",
              isCorrect: true,
              order: 2,
            },
            {
              optionId: 503,
              optionText: "Declares a REST endpoint",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 504,
              optionText: "Maps a request parameter",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "@Autowired tells Spring to inject the matching bean into the field, constructor, or method.",
        },
      ],
    },
  ],
};

// ── Quiz 3: DBMS Mid Term ─────────────────────────────────────────────────
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
              optionText: "Projection (π)",
              isCorrect: true,
              order: 1,
            },
            {
              optionId: 102,
              optionText: "Selection (σ)",
              isCorrect: false,
              order: 2,
            },
            {
              optionId: 103,
              optionText: "Join (⋈)",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 104,
              optionText: "Union All",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "Projection removes duplicates when projecting onto a subset of attributes.",
        },
        {
          question_id: 2,
          questionType: "TRUE_FALSE",
          questionText:
            "A foreign key must always reference the primary key of another table.",
          order: 2,
          points: 3,
          options: [
            { optionId: 201, optionText: "True", isCorrect: false, order: 1 },
            { optionId: 202, optionText: "False", isCorrect: true, order: 2 },
          ],
          explanation:
            "A foreign key can reference any column with a UNIQUE constraint, not just primary keys.",
        },
        {
          question_id: 3,
          questionType: "MCQ",
          questionText:
            "Which SQL clauses are used with GROUP BY? (Select all that apply)",
          order: 3,
          points: 3,
          options: [
            { optionId: 301, optionText: "HAVING", isCorrect: true, order: 1 },
            { optionId: 302, optionText: "WHERE", isCorrect: true, order: 2 },
            { optionId: 303, optionText: "FILTER", isCorrect: false, order: 3 },
            {
              optionId: 304,
              optionText: "ORDER BY",
              isCorrect: true,
              order: 4,
            },
          ],
          explanation:
            "HAVING filters groups, WHERE filters rows before grouping, ORDER BY sorts results.",
        },
        {
          question_id: 4,
          questionType: "SINGLE_OPTION",
          questionText: "What is the result of a NATURAL JOIN?",
          order: 4,
          points: 3,
          options: [
            {
              optionId: 401,
              optionText: "Joins on all columns",
              isCorrect: false,
              order: 1,
            },
            {
              optionId: 402,
              optionText:
                "Joins on columns with the same name and removes duplicates",
              isCorrect: true,
              order: 2,
            },
            {
              optionId: 403,
              optionText: "Returns the Cartesian product",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 404,
              optionText: "Joins only on primary keys",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "NATURAL JOIN automatically joins on all columns with matching names and eliminates duplicate columns.",
        },
        {
          question_id: 5,
          questionType: "SINGLE_OPTION",
          questionText: "Which normal form eliminates transitive dependencies?",
          order: 5,
          points: 3,
          options: [
            { optionId: 501, optionText: "1NF", isCorrect: false, order: 1 },
            { optionId: 502, optionText: "2NF", isCorrect: false, order: 2 },
            { optionId: 503, optionText: "3NF", isCorrect: true, order: 3 },
            { optionId: 504, optionText: "BCNF", isCorrect: false, order: 4 },
          ],
          explanation:
            "3NF removes transitive dependencies — non-key attributes depending on other non-key attributes.",
        },
      ],
    },
  ],
};

// ── Quiz 4: OS Processes ──────────────────────────────────────────────────
export const quiz4: QuizSeed = {
  quizId: "4",
  sections: [
    {
      section_id: 1,
      title: "Process Management",
      order: 1,
      sectionalTotalScore: 20,
      questions: [
        {
          question_id: 1,
          questionType: "SINGLE_OPTION",
          questionText:
            "Which data structure holds process information in an OS?",
          order: 1,
          points: 4,
          options: [
            {
              optionId: 101,
              optionText: "Process Control Block (PCB)",
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
          explanation:
            "The PCB stores all information about a process: state, registers, PID, memory info, etc.",
        },
        {
          question_id: 2,
          questionType: "MCQ",
          questionText:
            "Which are valid IPC (Inter-Process Communication) mechanisms? (Select all that apply)",
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
            {
              optionId: 204,
              optionText: "CPU Cache",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "CPU Cache is not an IPC mechanism. Pipes, shared memory, and signals are all valid IPC mechanisms.",
        },
        {
          question_id: 3,
          questionType: "TRUE_FALSE",
          questionText:
            "A process in the 'waiting' state is currently using the CPU.",
          order: 3,
          points: 4,
          options: [
            { optionId: 301, optionText: "True", isCorrect: false, order: 1 },
            { optionId: 302, optionText: "False", isCorrect: true, order: 2 },
          ],
          explanation:
            "A waiting process is blocked waiting for I/O or an event. Only the running state uses the CPU.",
        },
        {
          question_id: 4,
          questionType: "SINGLE_OPTION",
          questionText: "What happens during a context switch?",
          order: 4,
          points: 4,
          options: [
            {
              optionId: 401,
              optionText: "The CPU executes two processes simultaneously",
              isCorrect: false,
              order: 1,
            },
            {
              optionId: 402,
              optionText:
                "The OS saves the current process state and loads another",
              isCorrect: true,
              order: 2,
            },
            {
              optionId: 403,
              optionText: "A process is terminated",
              isCorrect: false,
              order: 3,
            },
            {
              optionId: 404,
              optionText: "Memory is deallocated",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "Context switching saves the current PCB and restores another, allowing multitasking.",
        },
        {
          question_id: 5,
          questionType: "SINGLE_OPTION",
          questionText: "Which scheduling algorithm can cause starvation?",
          order: 5,
          points: 4,
          options: [
            {
              optionId: 501,
              optionText: "Round Robin",
              isCorrect: false,
              order: 1,
            },
            { optionId: 502, optionText: "FCFS", isCorrect: false, order: 2 },
            {
              optionId: 503,
              optionText: "Priority Scheduling",
              isCorrect: true,
              order: 3,
            },
            {
              optionId: 504,
              optionText: "Multilevel Queue",
              isCorrect: false,
              order: 4,
            },
          ],
          explanation:
            "Priority Scheduling can cause starvation — low priority processes may never execute if higher priority ones keep arriving.",
        },
      ],
    },
  ],
};

// ── Register all quizzes ──────────────────────────────────────────────────
quizDataMap["1"] = quiz1;
quizDataMap["2"] = quiz2;
quizDataMap["3"] = quiz3;
quizDataMap["4"] = quiz4;
