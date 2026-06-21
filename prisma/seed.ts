import { PrismaClient, Difficulty, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SUBJECTS } from "../src/constants";

const prisma = new PrismaClient();

const TOPICS: Record<string, string[]> = {
  javascript: ["Closures", "Promises", "ES6+", "Event Loop", "Prototypes"],
  react: ["Hooks", "State Management", "Virtual DOM", "Lifecycle", "Performance"],
  nodejs: ["Modules", "Streams", "Event Emitter", "Cluster", "Buffer"],
  expressjs: ["Middleware", "Routing", "Error Handling", "Security"],
  mongodb: ["Queries", "Aggregation", "Indexing", "Schema Design"],
  sql: ["Joins", "Subqueries", "Normalization", "Transactions"],
  postgresql: ["JSONB", "Window Functions", "CTEs", "Indexing"],
  redis: ["Caching", "Pub/Sub", "Data Structures", "Persistence"],
  jwt: ["Tokens", "Refresh Tokens", "Security", "OAuth"],
  api: ["REST", "GraphQL", "Versioning", "Rate Limiting"],
  git: ["Branching", "Merging", "Rebase", "Workflow"],
  laravel: ["Eloquent", "Middleware", "Queues", "Blade"],
  php: ["OOP", "Namespaces", "Traits", "Composer"],
  "system-design": ["Scalability", "Caching", "Load Balancing", "Microservices"],
};

type SeedQuestion = {
  slug: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  answer?: string;
};

const SEED_QUESTIONS: SeedQuestion[] = [
  // JavaScript
  {
    slug: "javascript",
    type: "quiz",
    difficulty: "intermediate",
    question: "What is a closure in JavaScript?",
    optionA: "A function bundled with its lexical environment",
    optionB: "A way to close browser tabs",
    optionC: "A type of loop",
    optionD: "A CSS property",
    correctAnswer: "A",
    explanation: "A closure gives a function access to its outer scope even after the outer function has returned.",
  },
  {
    slug: "javascript",
    type: "quiz",
    difficulty: "beginner",
    question: "Which method converts a Promise rejection into a handled Promise?",
    optionA: "Promise.resolve()",
    optionB: "Promise.catch()",
    optionC: "Promise.all()",
    optionD: "Promise.race()",
    correctAnswer: "B",
    explanation: "catch() handles rejections and can return a value, effectively converting rejection to resolution.",
  },
  {
    slug: "javascript",
    type: "theory",
    difficulty: "advanced",
    question: "Explain the JavaScript event loop.",
    answer:
      "The event loop continuously checks the call stack and task queues. When the stack is empty, it moves callbacks from the microtask queue (Promises) and macrotask queue (setTimeout) to the call stack.",
  },
  // React
  {
    slug: "react",
    type: "quiz",
    difficulty: "intermediate",
    question: "What does useEffect with an empty dependency array do?",
    optionA: "Runs on every render",
    optionB: "Runs once after initial render",
    optionC: "Never runs",
    optionD: "Runs before render",
    correctAnswer: "B",
    explanation: "An empty dependency array means the effect runs once after the component mounts.",
  },
  {
    slug: "react",
    type: "quiz",
    difficulty: "beginner",
    question: "What hook is used for local component state?",
    optionA: "useState",
    optionB: "useEffect",
    optionC: "useContext",
    optionD: "useMemo",
    correctAnswer: "A",
    explanation: "useState returns a state value and a setter function for functional components.",
  },
  {
    slug: "react",
    type: "theory",
    difficulty: "intermediate",
    question: "What is the Virtual DOM in React?",
    answer:
      "The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to compute minimal changes (diffing) before updating the real DOM for better performance.",
  },
  // Node.js
  {
    slug: "nodejs",
    type: "quiz",
    difficulty: "beginner",
    question: "Which module system is default in Node.js?",
    optionA: "CommonJS",
    optionB: "AMD",
    optionC: "UMD",
    optionD: "SystemJS",
    correctAnswer: "A",
    explanation: "Node.js traditionally uses CommonJS (require/module.exports), though ESM is also supported.",
  },
  {
    slug: "nodejs",
    type: "quiz",
    difficulty: "intermediate",
    question: "What is the purpose of the Node.js event loop?",
    optionA: "Handle async I/O operations",
    optionB: "Compile TypeScript",
    optionC: "Manage CSS styles",
    optionD: "Render HTML templates",
    correctAnswer: "A",
    explanation: "The event loop allows Node.js to perform non-blocking I/O despite JavaScript being single-threaded.",
  },
  {
    slug: "nodejs",
    type: "theory",
    difficulty: "advanced",
    question: "Explain streams in Node.js.",
    answer:
      "Streams are objects that let you read or write data piece by piece. Types include Readable, Writable, Duplex, and Transform. They are memory-efficient for large files and network data.",
  },
  // Express.js
  {
    slug: "expressjs",
    type: "quiz",
    difficulty: "beginner",
    question: "What is middleware in Express.js?",
    optionA: "Functions that execute during the request-response cycle",
    optionB: "A database ORM",
    optionC: "A CSS framework",
    optionD: "A testing library",
    correctAnswer: "A",
    explanation: "Middleware functions have access to req, res, and next, and can modify the request or terminate the cycle.",
  },
  {
    slug: "expressjs",
    type: "quiz",
    difficulty: "intermediate",
    question: "Which method sends a JSON response in Express?",
    optionA: "res.json()",
    optionB: "res.sendFile()",
    optionC: "res.redirect()",
    optionD: "res.download()",
    correctAnswer: "A",
    explanation: "res.json() sets Content-Type to application/json and sends a JSON-serializable body.",
  },
  {
    slug: "expressjs",
    type: "theory",
    difficulty: "intermediate",
    question: "How do you handle errors globally in Express?",
    answer:
      "Define an error-handling middleware with four parameters (err, req, res, next). Place it after all routes. Use next(err) in route handlers to pass errors to this middleware.",
  },
  // MongoDB
  {
    slug: "mongodb",
    type: "quiz",
    difficulty: "intermediate",
    question: "What is the default _id field type in MongoDB?",
    optionA: "ObjectId",
    optionB: "UUID",
    optionC: "Integer",
    optionD: "String",
    correctAnswer: "A",
    explanation: "MongoDB automatically creates an ObjectId for the _id field if not specified.",
  },
  {
    slug: "mongodb",
    type: "quiz",
    difficulty: "advanced",
    question: "Which operator performs a left outer join in aggregation?",
    optionA: "$lookup",
    optionB: "$match",
    optionC: "$group",
    optionD: "$project",
    correctAnswer: "A",
    explanation: "$lookup performs a left outer join to another collection in the aggregation pipeline.",
  },
  {
    slug: "mongodb",
    type: "theory",
    difficulty: "intermediate",
    question: "What is the difference between SQL and MongoDB schema design?",
    answer:
      "SQL uses fixed schemas with normalized tables and joins. MongoDB uses flexible document schemas, often embedding related data for read performance or referencing for large/unbounded relationships.",
  },
  // SQL
  {
    slug: "sql",
    type: "quiz",
    difficulty: "beginner",
    question: "Which SQL clause filters rows after grouping?",
    optionA: "HAVING",
    optionB: "WHERE",
    optionC: "ORDER BY",
    optionD: "GROUP BY",
    correctAnswer: "A",
    explanation: "HAVING filters aggregated groups, while WHERE filters rows before aggregation.",
  },
  {
    slug: "sql",
    type: "quiz",
    difficulty: "intermediate",
    question: "What type of JOIN returns only matching rows from both tables?",
    optionA: "INNER JOIN",
    optionB: "LEFT JOIN",
    optionC: "RIGHT JOIN",
    optionD: "FULL OUTER JOIN",
    correctAnswer: "A",
    explanation: "INNER JOIN returns rows where the join condition matches in both tables.",
  },
  {
    slug: "sql",
    type: "theory",
    difficulty: "advanced",
    question: "Explain database normalization.",
    answer:
      "Normalization organizes data to reduce redundancy. Normal forms (1NF, 2NF, 3NF, BCNF) progressively eliminate duplicate data, partial dependencies, and transitive dependencies.",
  },
  // PostgreSQL
  {
    slug: "postgresql",
    type: "quiz",
    difficulty: "intermediate",
    question: "Which PostgreSQL feature allows recursive queries?",
    optionA: "CTE (WITH clause)",
    optionB: "TRIGGER",
    optionC: "VIEW",
    optionD: "SEQUENCE",
    correctAnswer: "A",
    explanation: "Common Table Expressions with RECURSIVE enable hierarchical and graph queries.",
  },
  {
    slug: "postgresql",
    type: "quiz",
    difficulty: "advanced",
    question: "What is JSONB in PostgreSQL?",
    optionA: "Binary JSON storage with indexing support",
    optionB: "A JavaScript runtime",
    optionC: "A backup format",
    optionD: "A replication protocol",
    correctAnswer: "A",
    explanation: "JSONB stores JSON in a decomposed binary format, supporting GIN indexes and efficient queries.",
  },
  {
    slug: "postgresql",
    type: "theory",
    difficulty: "intermediate",
    question: "What are PostgreSQL indexes and when should you use them?",
    answer:
      "Indexes speed up read queries by creating lookup structures (B-tree, GIN, GiST, etc.). Use them on columns frequently used in WHERE, JOIN, and ORDER BY clauses, but avoid over-indexing write-heavy tables.",
  },
  // Redis
  {
    slug: "redis",
    type: "quiz",
    difficulty: "beginner",
    question: "What is Redis primarily used for?",
    optionA: "In-memory caching and data store",
    optionB: "File storage",
    optionC: "Email server",
    optionD: "Video encoding",
    correctAnswer: "A",
    explanation: "Redis is an in-memory data structure store used as cache, message broker, and database.",
  },
  {
    slug: "redis",
    type: "quiz",
    difficulty: "intermediate",
    question: "Which Redis command sets a key with expiration?",
    optionA: "SETEX",
    optionB: "GET",
    optionC: "DEL",
    optionD: "KEYS",
    correctAnswer: "A",
    explanation: "SETEX sets a key-value pair with a TTL in seconds atomically.",
  },
  {
    slug: "redis",
    type: "theory",
    difficulty: "advanced",
    question: "Explain Redis persistence options RDB vs AOF.",
    answer:
      "RDB takes point-in-time snapshots at intervals (compact, fast recovery). AOF logs every write operation (more durable, larger files). Many production setups use both for balance.",
  },
  // JWT
  {
    slug: "jwt",
    type: "quiz",
    difficulty: "beginner",
    question: "What does JWT stand for?",
    optionA: "JSON Web Token",
    optionB: "Java Web Toolkit",
    optionC: "Joint Workflow Transfer",
    optionD: "JavaScript Window Tab",
    correctAnswer: "A",
    explanation: "JWT is a compact, URL-safe token format for securely transmitting claims between parties.",
  },
  {
    slug: "jwt",
    type: "quiz",
    difficulty: "intermediate",
    question: "Which JWT part contains the claims?",
    optionA: "Payload",
    optionB: "Header",
    optionC: "Signature",
    optionD: "Footer",
    correctAnswer: "A",
    explanation: "The payload holds claims such as sub, exp, and custom data. It is Base64URL-encoded, not encrypted.",
  },
  {
    slug: "jwt",
    type: "theory",
    difficulty: "advanced",
    question: "How should refresh tokens be handled securely?",
    answer:
      "Store refresh tokens in HttpOnly, Secure cookies or server-side storage. Rotate them on use, set short access token lifetimes, revoke on logout, and never store sensitive data in JWT payloads.",
  },
  // API
  {
    slug: "api",
    type: "quiz",
    difficulty: "beginner",
    question: "Which HTTP method is idempotent and used to retrieve data?",
    optionA: "GET",
    optionB: "POST",
    optionC: "PATCH",
    optionD: "CONNECT",
    correctAnswer: "A",
    explanation: "GET retrieves resources and should not modify server state.",
  },
  {
    slug: "api",
    type: "quiz",
    difficulty: "intermediate",
    question: "What HTTP status code indicates successful resource creation?",
    optionA: "201 Created",
    optionB: "200 OK",
    optionC: "204 No Content",
    optionD: "301 Moved Permanently",
    correctAnswer: "A",
    explanation: "201 Created is returned after a POST that successfully creates a new resource.",
  },
  {
    slug: "api",
    type: "theory",
    difficulty: "intermediate",
    question: "What are REST API best practices?",
    answer:
      "Use nouns for resources, proper HTTP methods (GET, POST, PUT, DELETE), meaningful status codes, versioning, pagination, authentication, rate limiting, and consistent error responses.",
  },
  // Git
  {
    slug: "git",
    type: "quiz",
    difficulty: "beginner",
    question: "Which command creates a new branch and switches to it?",
    optionA: "git checkout -b branch-name",
    optionB: "git branch only",
    optionC: "git merge branch-name",
    optionD: "git push origin",
    correctAnswer: "A",
    explanation: "git checkout -b creates and switches to a new branch in one command.",
  },
  {
    slug: "git",
    type: "quiz",
    difficulty: "intermediate",
    question: "What does git rebase do?",
    optionA: "Replays commits onto another base commit",
    optionB: "Deletes a branch",
    optionC: "Creates a remote repository",
    optionD: "Stashes all changes permanently",
    correctAnswer: "A",
    explanation: "Rebase moves or replays commits on top of a new base, producing a linear history.",
  },
  {
    slug: "git",
    type: "theory",
    difficulty: "intermediate",
    question: "Explain the difference between merge and rebase.",
    answer:
      "Merge combines branches with a merge commit, preserving history. Rebase replays commits on top of another branch for a linear history but rewrites commit SHAs. Avoid rebasing shared/public branches.",
  },
  // Laravel
  {
    slug: "laravel",
    type: "quiz",
    difficulty: "beginner",
    question: "What is Eloquent in Laravel?",
    optionA: "An ORM for database interactions",
    optionB: "A CSS preprocessor",
    optionC: "A queue driver",
    optionD: "A deployment tool",
    correctAnswer: "A",
    explanation: "Eloquent is Laravel's Active Record ORM for working with database models.",
  },
  {
    slug: "laravel",
    type: "quiz",
    difficulty: "intermediate",
    question: "Which Laravel feature handles background jobs?",
    optionA: "Queues",
    optionB: "Blade",
    optionC: "Artisan",
    optionD: "Valet",
    correctAnswer: "A",
    explanation: "Laravel queues defer time-consuming tasks like emails and API calls to background workers.",
  },
  {
    slug: "laravel",
    type: "theory",
    difficulty: "advanced",
    question: "Explain Laravel service container and dependency injection.",
    answer:
      "The service container binds interfaces to implementations and resolves dependencies automatically. Controllers and services receive dependencies via constructor injection, enabling testability and loose coupling.",
  },
  // PHP
  {
    slug: "php",
    type: "quiz",
    difficulty: "beginner",
    question: "Which symbol prefixes PHP variables?",
    optionA: "$",
    optionB: "@",
    optionC: "#",
    optionD: "&",
    correctAnswer: "A",
    explanation: "All PHP variable names begin with a dollar sign ($).",
  },
  {
    slug: "php",
    type: "quiz",
    difficulty: "intermediate",
    question: "What is a PHP trait?",
    optionA: "A mechanism for horizontal code reuse",
    optionB: "A database table type",
    optionC: "An error handler",
    optionD: "A session cookie",
    correctAnswer: "A",
    explanation: "Traits let classes reuse methods from multiple sources without multiple inheritance.",
  },
  {
    slug: "php",
    type: "theory",
    difficulty: "intermediate",
    question: "Explain PHP namespaces and autoloading.",
    answer:
      "Namespaces prevent class name collisions and organize code. PSR-4 autoloading maps namespace prefixes to directory paths, allowing Composer to load classes automatically without manual require statements.",
  },
  // System Design
  {
    slug: "system-design",
    type: "quiz",
    difficulty: "intermediate",
    question: "What is horizontal scaling?",
    optionA: "Adding more machines to handle load",
    optionB: "Upgrading CPU on one server",
    optionC: "Compressing database files",
    optionD: "Reducing API endpoints",
    correctAnswer: "A",
    explanation: "Horizontal scaling (scale out) adds more nodes; vertical scaling adds resources to one node.",
  },
  {
    slug: "system-design",
    type: "quiz",
    difficulty: "advanced",
    question: "Which pattern helps a system handle more read traffic?",
    optionA: "Read replicas",
    optionB: "Single master only",
    optionC: "Removing caches",
    optionD: "Disabling indexes",
    correctAnswer: "A",
    explanation: "Read replicas distribute read queries across multiple database copies.",
  },
  {
    slug: "system-design",
    type: "theory",
    difficulty: "advanced",
    question: "What is horizontal vs vertical scaling?",
    answer:
      "Vertical scaling adds more power (CPU, RAM) to a single machine. Horizontal scaling adds more machines to distribute load. Horizontal scaling is preferred for high availability and elasticity.",
  },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@interviewhub.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "admin",
    },
  });

  console.log(`Admin user: ${adminEmail}`);

  const subjectMap: Record<string, string> = {};

  for (const subject of SUBJECTS) {
    const created = await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name },
      create: { name: subject.name, slug: subject.slug },
    });
    subjectMap[subject.slug] = created.id;

    const topics = TOPICS[subject.slug] ?? ["General"];
    for (const topicName of topics) {
      await prisma.topic.upsert({
        where: {
          subjectId_name: { subjectId: created.id, name: topicName },
        },
        update: {},
        create: { subjectId: created.id, name: topicName },
      });
    }
  }

  console.log(`Created ${SUBJECTS.length} subjects with topics`);

  let seeded = 0;
  for (const q of SEED_QUESTIONS) {
    const subjectId = subjectMap[q.slug];
    if (!subjectId) continue;

    const existing = await prisma.question.findFirst({
      where: { question: q.question, subjectId },
    });
    if (existing) continue;

    await prisma.question.create({
      data: {
        subjectId,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        optionA: q.optionA ?? null,
        optionB: q.optionB ?? null,
        optionC: q.optionC ?? null,
        optionD: q.optionD ?? null,
        correctAnswer: q.correctAnswer ?? null,
        explanation: q.explanation ?? null,
        answer: q.answer ?? null,
      },
    });
    seeded++;
  }

  console.log(`Seeded ${seeded} new sample questions (${SEED_QUESTIONS.length} total in seed file)`);
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
