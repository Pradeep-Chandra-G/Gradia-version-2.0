export type Quiz = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  course: string;
  date: string;
  status: "UPCOMING" | "COMPLETED" | "GRADE_AVAILABLE";
  topics_covered: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export const quizzesData: Quiz[] = [
  {
    id: "1",
    title: "Java Basics Test",
    description:
      "This test evaluates your understanding of core Java concepts such as variables, data types, control structures, and basic OOP principles. It is designed to assess foundational knowledge required for advanced Java programming. Ideal for beginners to validate their fundamentals.",
    instructor: "Dr. Aris",
    duration: 90,
    course: "Java",
    date: "Oct 25, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Variables",
      "Data Types",
      "Control Structures",
      "Loops",
      "Basic OOP",
    ],
    difficulty: "EASY",
  },
  {
    id: "2",
    title: "Spring Boot Fundamentals",
    description:
      "This quiz focuses on the basics of Spring Boot, including project setup, dependency injection, and REST controller creation. It tests your ability to build simple backend applications efficiently. Prior knowledge of core Java is recommended.",
    instructor: "Prof. Sarah",
    duration: 45,
    course: "Java",
    date: "Oct 20, 2023",
    status: "GRADE_AVAILABLE",
    topics_covered: [
      "Spring Boot Setup",
      "Dependency Injection",
      "REST Controllers",
      "Application Properties",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "3",
    title: "DBMS Mid Term",
    description:
      "This mid-term exam covers key DBMS concepts such as ER models, relational algebra, and SQL queries. It evaluates both theoretical understanding and practical problem-solving skills. The test is crucial for strengthening database fundamentals.",
    instructor: "Dr. Elena",
    duration: 120,
    course: "DBMS",
    date: "Oct 30, 2023",
    status: "COMPLETED",
    topics_covered: [
      "ER Models",
      "Relational Algebra",
      "SQL Queries",
      "Schema Design",
    ],
    difficulty: "HARD",
  },
  {
    id: "4",
    title: "Operating Systems – Processes",
    description:
      "This quiz assesses your knowledge of process management, process states, and inter-process communication. It focuses on how operating systems handle execution and resource allocation. A strong conceptual understanding is required.",
    instructor: "Dr. Kumar",
    duration: 60,
    course: "OS",
    date: "Nov 2, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Process States",
      "Process Control Block",
      "IPC",
      "Context Switching",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "5",
    title: "Advanced Java OOP",
    description:
      "This test dives deep into advanced object-oriented programming concepts such as inheritance, polymorphism, abstraction, and design principles. It evaluates your ability to apply OOP concepts in real-world scenarios. Suitable for intermediate Java learners.",
    instructor: "Prof. Rahul",
    duration: 75,
    course: "Java",
    date: "Sep 18, 2023",
    status: "COMPLETED",
    topics_covered: [
      "Inheritance",
      "Polymorphism",
      "Abstraction",
      "Encapsulation",
      "SOLID Principles",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "6",
    title: "DBMS Normalization Quiz",
    description:
      "This quiz focuses on database normalization techniques and functional dependencies. It tests your ability to design efficient and redundancy-free database schemas. Practical examples are included to assess conceptual clarity.",
    instructor: "Dr. Elena",
    duration: 40,
    course: "DBMS",
    date: "Sep 25, 2023",
    status: "GRADE_AVAILABLE",
    topics_covered: ["1NF", "2NF", "3NF", "BCNF", "Functional Dependencies"],
    difficulty: "MEDIUM",
  },
  {
    id: "7",
    title: "OS Memory Management",
    description:
      "This quiz evaluates your understanding of memory allocation strategies, paging, and segmentation. It focuses on how operating systems manage main memory efficiently. Analytical thinking is essential to perform well.",
    instructor: "Dr. Kumar",
    duration: 80,
    course: "OS",
    date: "Nov 10, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Paging",
      "Segmentation",
      "Memory Allocation",
      "Fragmentation",
    ],
    difficulty: "HARD",
  },
  {
    id: "8",
    title: "Java Collections Deep Dive",
    description:
      "This test explores Java Collection Framework components such as Lists, Sets, Maps, and their implementations. It assesses your ability to choose the right collection based on performance and use case. A solid grasp of Java generics is helpful.",
    instructor: "Prof. Sarah",
    duration: 50,
    course: "Java",
    date: "Aug 28, 2023",
    status: "COMPLETED",
    topics_covered: ["List", "Set", "Map", "HashMap", "ArrayList", "Generics"],
    difficulty: "MEDIUM",
  },
  {
    id: "9",
    title: "DBMS Transactions & ACID",
    description:
      "This quiz tests your knowledge of database transactions, concurrency control, and ACID properties. It emphasizes consistency and reliability in database systems. Real-world transaction scenarios are included for evaluation.",
    instructor: "Dr. Aris",
    duration: 70,
    course: "DBMS",
    date: "Oct 5, 2023",
    status: "GRADE_AVAILABLE",
    topics_covered: ["Transactions", "ACID", "Concurrency Control", "Locking"],
    difficulty: "HARD",
  },
  {
    id: "10",
    title: "OS Scheduling Algorithms",
    description:
      "This test covers CPU scheduling algorithms such as FCFS, SJF, Priority, and Round Robin. It evaluates your ability to analyze scheduling performance using metrics like waiting time and turnaround time. Problem-solving skills are key.",
    instructor: "Dr. Kumar",
    duration: 55,
    course: "OS",
    date: "Sep 12, 2023",
    status: "COMPLETED",
    topics_covered: [
      "FCFS",
      "SJF",
      "Priority Scheduling",
      "Round Robin",
      "Turnaround Time",
    ],
    difficulty: "HARD",
  },
  {
    id: "11",
    title: "Java Streams & Lambdas",
    description:
      "This quiz focuses on functional programming concepts in Java using streams and lambda expressions. It tests your ability to write concise, efficient, and readable code. Hands-on understanding of Java 8 features is required.",
    instructor: "Prof. Rahul",
    duration: 65,
    course: "Java",
    date: "Nov 15, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Streams API",
      "Lambda Expressions",
      "Functional Interfaces",
      "Collectors",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "12",
    title: "DBMS Indexing Techniques",
    description:
      "This test examines indexing methods such as B-trees, hash indexing, and clustered indexes. It evaluates how indexing improves query performance. Conceptual clarity and practical understanding are both assessed.",
    instructor: "Dr. Elena",
    duration: 90,
    course: "DBMS",
    date: "Aug 20, 2023",
    status: "COMPLETED",
    topics_covered: [
      "B-Tree",
      "Hash Indexing",
      "Clustered Index",
      "Query Optimization",
    ],
    difficulty: "HARD",
  },
  {
    id: "13",
    title: "OS Deadlocks",
    description:
      "This quiz assesses your understanding of deadlocks, their conditions, detection, and prevention techniques. It focuses on real-world operating system challenges. Logical reasoning is crucial for solving deadlock problems.",
    instructor: "Dr. Kumar",
    duration: 45,
    course: "OS",
    date: "Oct 1, 2023",
    status: "GRADE_AVAILABLE",
    topics_covered: [
      "Deadlock Conditions",
      "Deadlock Detection",
      "Deadlock Prevention",
      "Banker's Algorithm",
    ],
    difficulty: "HARD",
  },
  {
    id: "14",
    title: "Java Exception Handling",
    description:
      "This test focuses on Java’s exception handling mechanism, including checked and unchecked exceptions. It evaluates your ability to write robust and fault-tolerant code. Practical coding scenarios are included.",
    instructor: "Dr. Aris",
    duration: 35,
    course: "Java",
    date: "Sep 5, 2023",
    status: "COMPLETED",
    topics_covered: [
      "Checked Exceptions",
      "Unchecked Exceptions",
      "Try-Catch",
      "Custom Exceptions",
    ],
    difficulty: "EASY",
  },
  {
    id: "15",
    title: "DBMS Query Optimization",
    description:
      "This quiz examines techniques used to optimize SQL queries and improve database performance. It focuses on execution plans, indexing strategies, and cost estimation. Analytical thinking is heavily tested.",
    instructor: "Prof. Sarah",
    duration: 85,
    course: "DBMS",
    date: "Nov 18, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Execution Plans",
      "Cost Estimation",
      "Index Strategies",
      "Query Rewriting",
    ],
    difficulty: "HARD",
  },
  {
    id: "16",
    title: "OS File Systems",
    description:
      "This test evaluates your understanding of file system structures, allocation methods, and disk management. It focuses on how operating systems store and retrieve data efficiently. Both theory and use cases are covered.",
    instructor: "Dr. Kumar",
    duration: 70,
    course: "OS",
    date: "Oct 12, 2023",
    status: "COMPLETED",
    topics_covered: [
      "File Allocation",
      "Inodes",
      "Disk Scheduling",
      "Directory Structure",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "17",
    title: "Java Multithreading",
    description:
      "This quiz focuses on multithreading concepts such as thread lifecycle, synchronization, and concurrency utilities. It tests your ability to write thread-safe Java applications. Prior experience with concurrent programming is beneficial.",
    instructor: "Prof. Rahul",
    duration: 100,
    course: "Java",
    date: "Nov 22, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Thread Lifecycle",
      "Synchronization",
      "Executors",
      "Concurrent Collections",
    ],
    difficulty: "HARD",
  },
  {
    id: "18",
    title: "DBMS Views & Triggers",
    description:
      "This test assesses your knowledge of database views, triggers, and their practical use cases. It focuses on automation and abstraction in databases. SQL proficiency is required to perform well.",
    instructor: "Dr. Elena",
    duration: 60,
    course: "DBMS",
    date: "Sep 30, 2023",
    status: "GRADE_AVAILABLE",
    topics_covered: [
      "Views",
      "Triggers",
      "Stored Procedures",
      "Database Automation",
    ],
    difficulty: "MEDIUM",
  },
  {
    id: "19",
    title: "OS Virtual Memory",
    description:
      "This quiz evaluates concepts related to virtual memory, paging, and page replacement algorithms. It focuses on efficient memory utilization in modern operating systems. Problem-solving questions are emphasized.",
    instructor: "Dr. Kumar",
    duration: 90,
    course: "OS",
    date: "Aug 15, 2023",
    status: "COMPLETED",
    topics_covered: ["Virtual Memory", "Page Replacement", "LRU", "Thrashing"],
    difficulty: "HARD",
  },
  {
    id: "20",   
    title: "Java Design Patterns",
    description:
      "This test covers commonly used Java design patterns such as Singleton, Factory, Observer, and Strategy. It evaluates your ability to apply patterns to real-world software design problems. Conceptual understanding and practical usage are both tested.",
    instructor: "Dr. Aris",
    duration: 110,
    course: "Java",
    date: "Nov 28, 2023",
    status: "UPCOMING",
    topics_covered: [
      "Singleton",
      "Factory",
      "Observer",
      "Strategy",
      "Design Principles",
    ],
    difficulty: "HARD",
  },
];
