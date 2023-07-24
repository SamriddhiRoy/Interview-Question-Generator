import { getModel } from '../config/gemini.js';

function buildPrompt({ difficulty, category, count, projectDescription, technicalSubtopic }) {
  const base = `You are an expert interviewer. Generate ${count} interview questions as a JSON array.

Each item must have:
- "question": string
- "expectedAnswer": string
- "hints": string[]
- "difficulty": one of ["Easy","Medium","Hard"]
- "difficultyExplanation": string

Rules:
- Generate ONLY for Category: ${category}.
- All items MUST be at difficulty: ${difficulty} (calibrated for this category).
- Questions MUST be distinct and non-repetitive.
- Do NOT reuse questions you would ask at other difficulty levels.
- Do NOT include code fences, markdown, or any text outside the JSON array.`;

  const project = projectDescription
    ? `Candidate Project Context:
${projectDescription}
- Include at least ${Math.min(2, count)} questions tailored to this project.`
    : '';

  const subtopic = category === 'Technical' && technicalSubtopic && technicalSubtopic !== 'General'
    ? `Technical Subtopic: ${technicalSubtopic}.
- Generate questions SPECIFIC to this subtopic (not generic technical questions).
- Prefer practical, real-world interview questions for ${technicalSubtopic}.`
    : '';

  const categoryGuidance = `Category Guidance:
- Coding: Provide concrete algorithm/implementation tasks, suitable for live coding.
- HR: Behavioral questions testing communication, leadership, conflict handling, reflection.
- System Design: Junior/Mid scenarios (APIs, data modeling, scalability, consistency trade-offs).
- Technical: Conceptual questions across DSA, OOP, DBMS, OS, Web fundamentals.
- Project: Questions assessing alignment with the provided project, design choices, and trade-offs.`;

  const difficultyCalibration = `Difficulty Calibration (examples):
- Coding Easy: arrays/strings/two-pointers; Medium: hash maps/trees/graphs; Hard: complex algorithms/constraints.
- HR Easy: basic self-reflection; Medium: nuanced team scenarios; Hard: leadership/strategy with trade-offs.
- System Design Easy: small feature or single service; Medium: multi-service with scaling; Hard: distributed trade-offs/consistency.
- Technical Easy: definitions and simple examples; Medium: comparisons/trade-offs; Hard: deeper internals and edge cases.`;

  const schemaHint = `Return format example (structure only):
[
  {
    "question": "Explain how binary search works on a sorted array.",
    "expectedAnswer": "It repeatedly halves the search space ...",
    "hints": ["Sorted input", "Mid index"],
    "difficulty": "Easy",
    "difficultyExplanation": "Common fundamental; minimal prerequisites."
  }
]`;

  return [base, project, subtopic, categoryGuidance, difficultyCalibration, schemaHint].join('\n\n');
}

function getFallbackQuestions(category, difficulty, count, projectDescription, technicalSubtopic) {
  const lvl = (difficulty || 'Easy');

  // Topic-specific banks for Technical
  const technicalByTopic = {
    Python: {
      Easy: [
        { question: 'What are Python lists and tuples? How do they differ?', expectedAnswer: 'Lists are mutable; tuples are immutable. Both are sequence types with different use cases.', hints: ['Mutability', 'Use cases'], difficulty: 'Easy', difficultyExplanation: 'Core Python data structures.' },
        { question: 'Explain list comprehensions with an example.', expectedAnswer: 'Concise syntax to construct lists (e.g., [x*x for x in arr if x%2==0]).', hints: ['Comprehension', 'Predicate'], difficulty: 'Easy', difficultyExplanation: 'Fundamental Python idiom.' },
        { question: 'What is PEP 8 and why follow it?', expectedAnswer: 'Python style guide; improves readability and consistency.', hints: ['Style', 'Readability'], difficulty: 'Easy', difficultyExplanation: 'Clean code basics.' },
        { question: 'How do virtual environments help in Python?', expectedAnswer: 'Isolate dependencies per project via venv/virtualenv.', hints: ['Isolation', 'Dependencies'], difficulty: 'Easy', difficultyExplanation: 'Standard project hygiene.' },
        { question: 'What is the difference between a list and a generator expression?', expectedAnswer: 'List builds the whole list in memory; generator yields lazily on iteration.', hints: ['Eager vs lazy'], difficulty: 'Easy', difficultyExplanation: 'Memory/performance basics.' }
      ],
      Medium: [
        { question: 'Describe generators and how they differ from lists.', expectedAnswer: 'Lazy iteration using yield; memory efficient; single pass.', hints: ['yield', 'Lazy'], difficulty: 'Medium', difficultyExplanation: 'Performance-conscious Python patterns.' },
        { question: 'Explain GIL and its impact on multithreading.', expectedAnswer: 'Global Interpreter Lock prevents multiple native threads executing Python bytecode simultaneously; use multiprocessing or I/O-bound threads.', hints: ['GIL', 'I/O vs CPU'], difficulty: 'Medium', difficultyExplanation: 'Concurrency awareness.' },
        { question: 'How would you structure a package for a medium project?', expectedAnswer: 'Use src layout, __init__.py, setup/pyproject, tests, type hints if applicable.', hints: ['src layout', 'Tests'], difficulty: 'Medium', difficultyExplanation: 'Packaging and maintainability.' },
        { question: 'When to use dataclasses vs namedtuple?', expectedAnswer: 'dataclasses for mutable, default values, methods; namedtuple for lightweight immutable tuples.', hints: ['Mutability', 'Boilerplate'], difficulty: 'Medium', difficultyExplanation: 'Right tool for the job.' }
      ],
      Hard: [
        { question: 'Optimize a CPU-bound Python function.', expectedAnswer: 'Use C extensions/NumPy/Cython, or multiprocessing; profile to find hotspots.', hints: ['C extensions', 'Profile'], difficulty: 'Hard', difficultyExplanation: 'Performance engineering.' },
        { question: 'Design a resilient ETL pipeline in Python.', expectedAnswer: 'Idempotency, checkpoints, retries, backpressure, monitoring.', hints: ['Idempotent', 'Retries'], difficulty: 'Hard', difficultyExplanation: 'System design using Python.' },
        { question: 'Explain asyncio event loop and backpressure handling.', expectedAnswer: 'Single-threaded loop with awaitables; manage producer/consumer pace using queues/semaphores.', hints: ['await', 'Queues'], difficulty: 'Hard', difficultyExplanation: 'Advanced async patterns.' }
      ]
    },
    React: {
      Easy: [
        { question: 'What are React components and props?', expectedAnswer: 'Components compose UI; props are read-only inputs.', hints: ['Composition', 'Props'], difficulty: 'Easy', difficultyExplanation: 'React fundamentals.' },
        { question: 'When do you use state vs props?', expectedAnswer: 'State is internal and mutable; props are external inputs.', hints: ['State', 'Props'], difficulty: 'Easy', difficultyExplanation: 'Basic data flow.' },
        { question: 'What is JSX?', expectedAnswer: 'Syntax sugar to describe UI trees that compiles to React.createElement.', hints: ['Syntax', 'Compilation'], difficulty: 'Easy', difficultyExplanation: 'Core concept.' },
        { question: 'Why are keys needed when rendering lists?', expectedAnswer: 'Keys help React identify items for efficient reconciliation and avoid incorrect reuse.', hints: ['Reconciliation', 'Stable identity'], difficulty: 'Easy', difficultyExplanation: 'Avoids subtle rendering bugs.' },
        { question: 'How do you conditionally render content in React?', expectedAnswer: 'Use logical &&, ternaries, or wrapper functions; avoid inline complex logic.', hints: ['Ternary', '&&'], difficulty: 'Easy', difficultyExplanation: 'Common UI pattern.' }
      ],
      Medium: [
        { question: 'Explain useEffect and common pitfalls.', expectedAnswer: 'Side-effects with dependency arrays; stale closures; cleanup.', hints: ['Deps array', 'Cleanup'], difficulty: 'Medium', difficultyExplanation: 'Hooks proficiency.' },
        { question: 'How to optimize re-renders?', expectedAnswer: 'Memoization (React.memo, useMemo, useCallback), keying, splitting state.', hints: ['Memo', 'Keys'], difficulty: 'Medium', difficultyExplanation: 'Performance tuning.' },
        { question: 'Describe controlled vs uncontrolled components.', expectedAnswer: 'Controlled uses state as source of truth; uncontrolled uses refs/DOM.', hints: ['Forms', 'Refs'], difficulty: 'Medium', difficultyExplanation: 'Form patterns.' },
        { question: 'How would you split a large bundle in a React app?', expectedAnswer: 'Dynamic import(), route-level code splitting, Suspense/lazy for components.', hints: ['Code splitting', 'lazy()'], difficulty: 'Medium', difficultyExplanation: 'Improves performance at scale.' },
        { question: 'Explain context and when to use it.', expectedAnswer: 'Prop drilling alternative for global-ish state like theme/auth; avoid overuse for frequently changing data.', hints: ['Prop drilling', 'Global state'], difficulty: 'Medium', difficultyExplanation: 'Architecture trade-offs.' }
      ],
      Hard: [
        { question: 'Design a scalable state management approach.', expectedAnswer: 'Context for global config; Redux/Zustand/Recoil for app state; colocation; query libraries for server cache.', hints: ['Colocation', 'Server cache'], difficulty: 'Hard', difficultyExplanation: 'Architecture decisions.' },
        { question: 'Handle concurrent UI updates and race conditions with async data.', expectedAnswer: 'Use abort controllers, request dedupe, idempotent updates, Suspense patterns.', hints: ['Abort', 'Suspense'], difficulty: 'Hard', difficultyExplanation: 'Robust async UX.' },
        { question: 'How to make a large React app resilient to hydration mismatches?', expectedAnswer: 'Consistent server/client rendering, avoid random values during render, use useEffect for client-only, suppressHydrationWarning where justified.', hints: ['SSR', 'Hydration'], difficulty: 'Hard', difficultyExplanation: 'SSR correctness and UX.' }
      ]
    },
    JavaScript: {
      Easy: [
        { question: 'Explain var, let, and const.', expectedAnswer: 'Scope and mutability differences; hoisting behavior.', hints: ['Scope', 'Hoist'], difficulty: 'Easy', difficultyExplanation: 'Language basics.' },
        { question: 'What is a closure?', expectedAnswer: 'Function that captures references from its lexical environment.', hints: ['Lexical scope'], difficulty: 'Easy', difficultyExplanation: 'Core concept.' },
        { question: 'Difference between == and ===?', expectedAnswer: '== performs coercion; === strict equality.', hints: ['Coercion'], difficulty: 'Easy', difficultyExplanation: 'Common pitfalls.' },
        { question: 'What are arrow functions and how do they treat this?', expectedAnswer: 'Lexically binds this from surrounding scope; concise syntax; no new.target.', hints: ['Lexical this'], difficulty: 'Easy', difficultyExplanation: 'Modern JS essentials.' },
        { question: 'What is destructuring and when is it useful?', expectedAnswer: 'Unpack values from arrays/objects into variables; improves readability.', hints: ['Arrays', 'Objects'], difficulty: 'Easy', difficultyExplanation: 'ES6 basics.' }
      ],
      Medium: [
        { question: 'Explain event loop, microtasks, and macrotasks.', expectedAnswer: 'Microtasks (promises) run before next macrotask; affects ordering.', hints: ['Ordering'], difficulty: 'Medium', difficultyExplanation: 'Runtime model.' },
        { question: 'How does prototypal inheritance work?', expectedAnswer: 'Objects delegate property lookups to their prototype chain.', hints: ['Prototype chain'], difficulty: 'Medium', difficultyExplanation: 'Object model.' },
        { question: 'What is debouncing vs throttling?', expectedAnswer: 'Debounce delays until quiet; throttle enforces rate limit.', hints: ['Rate-limiting'], difficulty: 'Medium', difficultyExplanation: 'Performance patterns.' }
      ],
      Hard: [
        { question: 'Design a module loader/resolver strategy.', expectedAnswer: 'ESM vs CJS, tree-shaking, bundlers, dynamic import, code splitting.', hints: ['ESM', 'Tree-shake'], difficulty: 'Hard', difficultyExplanation: 'Build tooling understanding.' },
        { question: 'Implement an LRU cache in JS and discuss complexity.', expectedAnswer: 'Map + doubly linked list; O(1) get/put.', hints: ['Map', 'DLL'], difficulty: 'Hard', difficultyExplanation: 'DSA in JS.' }
      ]
    },
    Java: {
      Easy: [
        { question: 'Difference between interface and abstract class.', expectedAnswer: 'Interfaces define contracts; abstract classes can hold state and partial implementations.', hints: ['Contracts', 'Partial impl'], difficulty: 'Easy', difficultyExplanation: 'OOP basics.' },
        { question: 'What is the JVM and JDK?', expectedAnswer: 'JVM runs bytecode; JDK includes compiler and tools.', hints: ['Runtime', 'Toolchain'], difficulty: 'Easy', difficultyExplanation: 'Platform understanding.' },
        { question: 'How do you create and use enums in Java?', expectedAnswer: 'enum type for constants; can include fields/methods; type-safe alternatives to ints.', hints: ['Type safety'], difficulty: 'Easy', difficultyExplanation: 'Language feature familiarity.' },
        { question: 'Explain exceptions and the difference between checked and unchecked.', expectedAnswer: 'Checked must be declared/handled; unchecked are runtime; design trade-offs.', hints: ['Checked vs unchecked'], difficulty: 'Easy', difficultyExplanation: 'Error handling basics.' },
        { question: 'What is autoboxing/unboxing?', expectedAnswer: 'Automatic conversion between primitives and wrapper types; beware of performance pitfalls.', hints: ['Wrappers', 'Performance'], difficulty: 'Easy', difficultyExplanation: 'Language ergonomics.' }
      ],
      Medium: [
        { question: 'Explain Java memory model and happens-before.', expectedAnswer: 'Defines visibility/ordering guarantees with synchronized/volatile.', hints: ['HB', 'volatile'], difficulty: 'Medium', difficultyExplanation: 'Concurrency correctness.' },
        { question: 'When to use Optional and Streams?', expectedAnswer: 'Optional for return absence; Streams for functional pipelines with care for readability.', hints: ['Pipelines', 'Nulls'], difficulty: 'Medium', difficultyExplanation: 'Idiomatic Java.' }
      ],
      Hard: [
        { question: 'Design a resilient microservice with Spring Boot.', expectedAnswer: 'Circuit breakers, retries, timeouts, bulkheads, observability.', hints: ['Resilience'], difficulty: 'Hard', difficultyExplanation: 'Production readiness.' },
        { question: 'Tuning GC for low-latency Java services.', expectedAnswer: 'Choose collector (G1/ZGC), heap sizing, pause targets, profiling.', hints: ['GC tuning'], difficulty: 'Hard', difficultyExplanation: 'Performance engineering.' }
      ]
    },
    OOP: {
      Easy: [
        { question: 'Explain encapsulation, inheritance, polymorphism, abstraction.', expectedAnswer: 'Core OOP principles with concise definitions and examples.', hints: ['4 pillars'], difficulty: 'Easy', difficultyExplanation: 'Theory fundamentals.' },
        { question: 'What is composition over inheritance?', expectedAnswer: 'Prefer composing behavior via objects to deep inheritance hierarchies.', hints: ['Composition'], difficulty: 'Easy', difficultyExplanation: 'Design heuristic.' },
        { question: 'Explain the Liskov Substitution Principle with an example.', expectedAnswer: 'Subtypes must be substitutable for base types without breaking correctness.', hints: ['Contracts', 'Substitutability'], difficulty: 'Easy', difficultyExplanation: 'Solid foundations.' },
        { question: 'What is the difference between aggregation and composition?', expectedAnswer: 'Aggregation is a weak has-a; composition is strong ownership and lifecycle.', hints: ['UML', 'Ownership'], difficulty: 'Easy', difficultyExplanation: 'Design vocabulary.' },
        { question: 'When would you apply the Strategy pattern?', expectedAnswer: 'To swap algorithms at runtime via common interface and composition.', hints: ['Behavioral pattern'], difficulty: 'Easy', difficultyExplanation: 'Practical OOP.' }
      ],
      Medium: [
        { question: 'Apply SOLID principles to a small design problem.', expectedAnswer: 'Show violations and refactorings for each principle.', hints: ['SOLID'], difficulty: 'Medium', difficultyExplanation: 'Design literacy.' },
        { question: 'Explain dependency inversion with an example.', expectedAnswer: 'Program to abstractions; inject dependencies; testability benefits.', hints: ['Abstractions', 'DI'], difficulty: 'Medium', difficultyExplanation: 'Architecture.' }
      ],
      Hard: [
        { question: 'Identify code smells and refactorings in a given snippet.', expectedAnswer: 'Long method, feature envy, etc., with refactoring strategies.', hints: ['Refactor'], difficulty: 'Hard', difficultyExplanation: 'Practical design skills.' }
      ]
    },
    'Spring Boot': {
      Easy: [
        { question: 'What does Spring Boot auto-configuration do?', expectedAnswer: 'Configures beans based on classpath and properties to reduce boilerplate.', hints: ['Auto-config'], difficulty: 'Easy', difficultyExplanation: 'Framework basics.' },
        { question: 'How do you create REST endpoints in Spring Boot?', expectedAnswer: '@RestController, @GetMapping, @PostMapping, etc.', hints: ['Annotations'], difficulty: 'Easy', difficultyExplanation: 'Web basics.' },
        { question: 'What is the purpose of application.properties/yml?', expectedAnswer: 'Externalize configuration; supports profiles; inject via @Value or @ConfigurationProperties.', hints: ['Profiles', 'Config'], difficulty: 'Easy', difficultyExplanation: 'Configuration basics.' },
        { question: 'How do you run and package a Spring Boot app?', expectedAnswer: 'Spring Boot plugin builds an executable jar; run with java -jar or via IDE.', hints: ['fat jar'], difficulty: 'Easy', difficultyExplanation: 'Getting started tasks.' },
        { question: 'Explain dependency injection in Spring.', expectedAnswer: 'Framework manages beans and injects dependencies via constructor/setter/field.', hints: ['IoC container'], difficulty: 'Easy', difficultyExplanation: 'Core concept.' }
      ],
      Medium: [
        { question: 'How to handle configuration and profiles?', expectedAnswer: 'application.yml with profiles; @ConfigurationProperties; environment overrides.', hints: ['Profiles', 'Props'], difficulty: 'Medium', difficultyExplanation: 'Environment management.' },
        { question: 'Explain Spring Data JPA and repositories.', expectedAnswer: 'Repository interfaces, query derivation, transactions.', hints: ['JPA', 'Transactions'], difficulty: 'Medium', difficultyExplanation: 'Data access.' }
      ],
      Hard: [
        { question: 'Build resilient HTTP clients in Spring.', expectedAnswer: 'WebClient/RestTemplate with timeouts, retries, circuit breakers (Resilience4j).', hints: ['Resilience4j', 'Timeouts'], difficulty: 'Hard', difficultyExplanation: 'Reliability patterns.' },
        { question: 'Observability in Spring Boot.', expectedAnswer: 'Micrometer, metrics, tracing, logs, dashboards/alerts.', hints: ['Micrometer', 'Tracing'], difficulty: 'Hard', difficultyExplanation: 'Production ops.' }
      ]
    }
  };

  const byCat = {
    Coding: {
      Easy: [
        {
          question: 'Given a string, return true if it is an anagram of another string.',
          expectedAnswer: 'Count characters with a map or sort both strings and compare.',
          hints: ['Hash map counts', 'Sorting O(n log n) vs O(n)'],
          difficulty: 'Easy',
          difficultyExplanation: 'Fundamental string/map skill for junior roles.'
        },
        {
          question: 'Check if an array has any duplicate values.',
          expectedAnswer: 'Use a set to track seen elements in O(n) time, O(n) space.',
          hints: ['Set', 'Early exit when found'],
          difficulty: 'Easy',
          difficultyExplanation: 'Basic use of sets and linear scans.'
        },
        {
          question: 'Determine if a string is a palindrome ignoring non-alphanumerics.',
          expectedAnswer: 'Two-pointer approach skipping non-alphanumerics; case-insensitive compare.',
          hints: ['Two pointers', 'Character filtering'],
          difficulty: 'Easy',
          difficultyExplanation: 'Classic string problem with careful pointer moves.'
        },
        {
          question: 'Merge two sorted arrays into one sorted array.',
          expectedAnswer: 'Use two pointers and append the smaller element at each step.',
          hints: ['Two pointers', 'Linear time'],
          difficulty: 'Easy',
          difficultyExplanation: 'Entry-level algorithmic merging.'
        },
        {
          question: 'Validate parentheses in a string of brackets.',
          expectedAnswer: 'Use a stack mapping opens to closes; push/pop and validate at end.',
          hints: ['Stack', 'Mapping parentheses'],
          difficulty: 'Easy',
          difficultyExplanation: 'Fundamental stack usage.'
        }
      ],
      Medium: [
        {
          question: 'Implement a function to group anagrams.',
          expectedAnswer: 'Key by sorted string or char frequency signature; return grouped arrays.',
          hints: ['Canonical key', 'Hash map of lists'],
          difficulty: 'Medium',
          difficultyExplanation: 'Combines hashing with array manipulation.'
        },
        {
          question: 'Given a binary tree, return its level order traversal.',
          expectedAnswer: 'Use BFS with a queue, iterate level by level.',
          hints: ['Queue', 'Breadth-first search'],
          difficulty: 'Medium',
          difficultyExplanation: 'Tests understanding of BFS and data structures.'
        },
        {
          question: 'Find the length of the longest substring without repeating characters.',
          expectedAnswer: 'Sliding window with set or map for last seen indices.',
          hints: ['Sliding window', 'Hash map'],
          difficulty: 'Medium',
          difficultyExplanation: 'Common string/window pattern problem.'
        },
        {
          question: 'Detect a cycle in a linked list and return the cycle start if any.',
          expectedAnswer: 'Floyd’s tortoise-hare to detect; then move pointers to find entry.',
          hints: ['Two pointers', 'Cycle entry'],
          difficulty: 'Medium',
          difficultyExplanation: 'Pointer technique with reasoning about meeting point.'
        },
        {
          question: 'Return the k most frequent elements in an array.',
          expectedAnswer: 'Count with map; use bucket sort or min-heap of size k.',
          hints: ['Frequency map', 'Heap or buckets'],
          difficulty: 'Medium',
          difficultyExplanation: 'Combines counting with data-structure selection.'
        }
      ],
      Hard: [
        {
          question: 'Find the median of two sorted arrays in O(log (m+n)).',
          expectedAnswer: 'Binary search partition approach to balance left/right halves.',
          hints: ['Partition indices', 'Invariants on left/right max/min'],
          difficulty: 'Hard',
          difficultyExplanation: 'Requires careful binary search reasoning and edge cases.'
        },
        {
          question: 'Implement a concurrent-safe LRU cache API outline.',
          expectedAnswer: 'Hash map + doubly-linked list plus locks or concurrent structures.',
          hints: ['Concurrency concerns', 'Eviction policy'],
          difficulty: 'Hard',
          difficultyExplanation: 'Data structures plus concurrency considerations.'
        },
        {
          question: 'Solve the word ladder shortest transformation sequence length problem.',
          expectedAnswer: 'Use BFS over word graph; optionally bi-directional BFS for performance.',
          hints: ['Graph BFS', 'Pattern buckets'],
          difficulty: 'Hard',
          difficultyExplanation: 'Graph search with efficient adjacency generation.'
        },
        {
          question: 'Find the maximum subarray sum in a circular array.',
          expectedAnswer: 'Kadane’s for max; and min subarray to handle wrap; compare.',
          hints: ['Kadane', 'Wrap-around case'],
          difficulty: 'Hard',
          difficultyExplanation: 'Edge case reasoning for circular structure.'
        },
        {
          question: 'Serialize and deserialize a binary tree.',
          expectedAnswer: 'Use BFS or DFS order with null markers; parse to rebuild.',
          hints: ['Preorder/BFS', 'Null sentinels'],
          difficulty: 'Hard',
          difficultyExplanation: 'Designing robust encoding/decoding logic.'
        }
      ]
    },
    HR: {
      Easy: [
        {
          question: 'Tell me about a time you received constructive feedback. What did you do next?',
          expectedAnswer: 'Receive feedback openly, plan improvements, show outcome and reflection.',
          hints: ['STAR', 'Actionable steps'],
          difficulty: 'Easy',
          difficultyExplanation: 'Basic self-reflection and growth mindset.'
        },
        {
          question: 'What motivates you in your daily work?',
          expectedAnswer: 'Connects personal drivers to impact, learning, and team goals.',
          hints: ['Impact', 'Learning'],
          difficulty: 'Easy',
          difficultyExplanation: 'Assesses values and alignment.'
        },
        {
          question: 'Describe a time you helped a teammate who was stuck.',
          expectedAnswer: 'Mentoring, knowledge sharing, enabling autonomy, results.',
          hints: ['Mentorship', 'Outcome'],
          difficulty: 'Easy',
          difficultyExplanation: 'Collaboration and willingness to help.'
        },
        {
          question: 'How do you prioritize tasks when everything is urgent?',
          expectedAnswer: 'Clarify priority, trade-offs, communicate, and timebox.',
          hints: ['Prioritization', 'Communication'],
          difficulty: 'Easy',
          difficultyExplanation: 'Basic organization and communication.'
        }
      ],
      Medium: [
        {
          question: 'Describe a conflict with a teammate and how you resolved it.',
          expectedAnswer: 'Clarify goals, active listening, compromise, measurable resolution, lessons learned.',
          hints: ['Stakeholders', 'Resolution path'],
          difficulty: 'Medium',
          difficultyExplanation: 'Assesses collaboration and communication depth.'
        },
        {
          question: 'Share a time you managed unclear requirements and delivered successfully.',
          expectedAnswer: 'Drove clarity, iterated with stakeholders, delivered incrementally with feedback.',
          hints: ['Ambiguity', 'Iteration'],
          difficulty: 'Medium',
          difficultyExplanation: 'Product thinking and stakeholder alignment.'
        },
        {
          question: 'Tell me about disagreeing with your manager and how you handled it.',
          expectedAnswer: 'Respectful challenge with evidence, alignment on goals, follow-up and reflection.',
          hints: ['Disagreement', 'Evidence'],
          difficulty: 'Medium',
          difficultyExplanation: 'Professionalism and influence.'
        },
        {
          question: 'Describe a time you missed a deadline and what you changed afterward.',
          expectedAnswer: 'Root cause, transparency, mitigation, process improvements.',
          hints: ['Root cause', 'Process change'],
          difficulty: 'Medium',
          difficultyExplanation: 'Ownership and continuous improvement.'
        }
      ],
      Hard: [
        {
          question: 'How did you lead a cross-functional initiative under tight deadlines?',
          expectedAnswer: 'Scope, prioritization, alignment, risk mitigation, delegation, metrics, outcome.',
          hints: ['Leadership', 'Trade-offs', 'Impact'],
          difficulty: 'Hard',
          difficultyExplanation: 'Evaluates leadership and strategic thinking.'
        },
        {
          question: 'Tell me about a time you had to manage an underperforming teammate.',
          expectedAnswer: 'Clear expectations, coaching plan, timely feedback, escalation if needed.',
          hints: ['Coaching', 'Expectations'],
          difficulty: 'Hard',
          difficultyExplanation: 'People leadership and accountability.'
        },
        {
          question: 'Describe driving an org-wide change and how you handled resistance.',
          expectedAnswer: 'Stakeholder mapping, pilots, metrics, comms plan, addressing concerns.',
          hints: ['Change management', 'Stakeholders'],
          difficulty: 'Hard',
          difficultyExplanation: 'Influence and large-scale coordination.'
        },
        {
          question: 'Share a critical incident you owned end-to-end.',
          expectedAnswer: 'Incident response, communication, remediation, root cause, postmortem.',
          hints: ['Incident response', 'Postmortem'],
          difficulty: 'Hard',
          difficultyExplanation: 'Crisis leadership and learning culture.'
        }
      ]
    },
    'System Design': {
      Easy: [
        {
          question: 'Design a service to upload and serve images for a small app.',
          expectedAnswer: 'API, storage (S3), metadata DB, basic CDN, simple auth; small scale.',
          hints: ['Object storage', 'CDN basics'],
          difficulty: 'Easy',
          difficultyExplanation: 'Single service with straightforward components.'
        },
        {
          question: 'Design a feature flag service for one application.',
          expectedAnswer: 'CRUD API, config store, SDK polling, simple cache, audit trail.',
          hints: ['Config store', 'SDK'],
          difficulty: 'Easy',
          difficultyExplanation: 'Simple control-plane style service.'
        },
        {
          question: 'Design an email notification sender for low volume.',
          expectedAnswer: 'Queue, worker, SMTP/provider, retries, minimal templates.',
          hints: ['Queue', 'Retries'],
          difficulty: 'Easy',
          difficultyExplanation: 'Event-driven basics.'
        },
        {
          question: 'Design a read-only product catalog API.',
          expectedAnswer: 'REST API, cache, search index, single DB, pagination.',
          hints: ['Caching', 'Pagination'],
          difficulty: 'Easy',
          difficultyExplanation: 'Basic read-heavy design.'
        }
      ],
      Medium: [
        {
          question: 'Design a URL shortener handling 10k RPS.',
          expectedAnswer: 'API, id generation/hash, collisions, DB sharding/replication, cache, CDN, observability.',
          hints: ['Base62', 'Cache', 'Replication'],
          difficulty: 'Medium',
          difficultyExplanation: 'Multi-component system with scaling trade-offs.'
        },
        {
          question: 'Design a rate limiter for user requests.',
          expectedAnswer: 'Token bucket or leaky bucket; centralized store (Redis), correctness vs cost trade-offs.',
          hints: ['Token bucket', 'Redis'],
          difficulty: 'Medium',
          difficultyExplanation: 'Distributed coordination and consistency trade-offs.'
        },
        {
          question: 'Design a Pastebin-like text sharing service.',
          expectedAnswer: 'Create/read paste, short ids, store, TTL, abuse prevention, cache, CDN.',
          hints: ['TTL', 'CDN'],
          difficulty: 'Medium',
          difficultyExplanation: 'Balanced read/write patterns.'
        },
        {
          question: 'Design a simple metrics ingestion and dashboard service.',
          expectedAnswer: 'Ingest API, queue, time-series DB, rollups, retention, dashboards.',
          hints: ['Time-series', 'Rollups'],
          difficulty: 'Medium',
          difficultyExplanation: 'Data modeling and retention planning.'
        }
      ],
      Hard: [
        {
          question: 'Design a real-time chat system supporting millions of concurrent connections.',
          expectedAnswer: 'Gateway, WebSocket fanout, partitioning, presence, message queues, storage, backpressure, consistency.',
          hints: ['Fanout', 'Sharding', 'Backpressure'],
          difficulty: 'Hard',
          difficultyExplanation: 'Distributed systems challenges and SLAs.'
        },
        {
          question: 'Design a ride-matching/dispatch system (e.g., rideshare) at scale.',
          expectedAnswer: 'Geo-indexing, matching, surge pricing, streaming, consistency/latency trade-offs.',
          hints: ['Geo index', 'Streaming'],
          difficulty: 'Hard',
          difficultyExplanation: 'Complex real-time spatial matching.'
        },
        {
          question: 'Design a global feed ranking system (e.g., short-video app).',
          expectedAnswer: 'Ingestion, feature store, ranking, caching, fanout/fan-in, experimentation.',
          hints: ['Ranking', 'Fanout vs fan-in'],
          difficulty: 'Hard',
          difficultyExplanation: 'Large-scale ML + systems integration.'
        },
        {
          question: 'Design a distributed lock service.',
          expectedAnswer: 'Consensus (Raft/Paxos/ZK), fencing tokens, failure modes, client libs.',
          hints: ['Consensus', 'Fencing tokens'],
          difficulty: 'Hard',
          difficultyExplanation: 'Coordination primitives and correctness.'
        }
      ]
    },
    Technical: {
      Easy: [
        {
          question: 'What is the difference between stack and heap memory?',
          expectedAnswer: 'Stack: function frames; Heap: dynamic allocation; implications for lifetime and access.',
          hints: ['Lifetime', 'Allocation'],
          difficulty: 'Easy',
          difficultyExplanation: 'Fundamental memory model knowledge.'
        },
        {
          question: 'Explain Big-O notation and what O(n) means.',
          expectedAnswer: 'Asymptotic upper bound of time/space; O(n) grows linearly with input size.',
          hints: ['Asymptotic', 'Growth rate'],
          difficulty: 'Easy',
          difficultyExplanation: 'Core algorithmic complexity concept.'
        },
        {
          question: 'What is REST and how does it differ from RPC?',
          expectedAnswer: 'REST: resource-based over HTTP verbs; RPC: action-based calls; trade-offs.',
          hints: ['Resources', 'HTTP verbs'],
          difficulty: 'Easy',
          difficultyExplanation: 'Web API fundamentals.'
        },
        {
          question: 'Relational vs NoSQL databases: when would you choose each?',
          expectedAnswer: 'Relational for ACID and relations; NoSQL for scale/partitioning; depends on access patterns.',
          hints: ['ACID', 'Access patterns'],
          difficulty: 'Easy',
          difficultyExplanation: 'High-level DB selection trade-offs.'
        },
        {
          question: 'What is a memory leak?',
          expectedAnswer: 'Allocated memory not released/referenced unnecessarily; leads to growth and performance issues.',
          hints: ['Lifetime', 'Garbage collection'],
          difficulty: 'Easy',
          difficultyExplanation: 'Basic reliability concept.'
        }
      ],
      Medium: [
        {
          question: 'Compare HTTP/1.1 vs HTTP/2 and their performance implications.',
          expectedAnswer: 'Multiplexing, header compression, prioritization; fewer connections; latency improvements.',
          hints: ['Multiplexing', 'HPACK'],
          difficulty: 'Medium',
          difficultyExplanation: 'Requires protocol concepts and trade-offs.'
        },
        {
          question: 'Explain ACID properties of transactions.',
          expectedAnswer: 'Atomicity, Consistency, Isolation, Durability; what each guarantees.',
          hints: ['Atomicity', 'Isolation'],
          difficulty: 'Medium',
          difficultyExplanation: 'Database transaction fundamentals.'
        },
        {
          question: 'How does the JavaScript event loop work?',
          expectedAnswer: 'Call stack, task/microtask queues, event loop scheduling.',
          hints: ['Microtasks', 'Macrotasks'],
          difficulty: 'Medium',
          difficultyExplanation: 'Runtime concurrency model understanding.'
        },
        {
          question: 'Explain indexing in databases and trade-offs.',
          expectedAnswer: 'Speeds reads with additional structures; slower writes and more storage.',
          hints: ['Selectivity', 'Write overhead'],
          difficulty: 'Medium',
          difficultyExplanation: 'DB performance tuning basics.'
        }
      ],
      Hard: [
        {
          question: 'Explain MVCC in databases and how it enables concurrent reads/writes.',
          expectedAnswer: 'Versioned snapshots, visibility rules, write conflicts, vacuum/GC, isolation levels.',
          hints: ['Snapshots', 'Isolation levels'],
          difficulty: 'Hard',
          difficultyExplanation: 'Deeper DB internals knowledge.'
        },
        {
          question: 'What does the CAP theorem state and how does it apply in practice?',
          expectedAnswer: 'Impossibility of simultaneously guaranteeing C, A, and P; systems choose trade-offs.',
          hints: ['Consistency', 'Availability', 'Partition tolerance'],
          difficulty: 'Hard',
          difficultyExplanation: 'Distributed systems principle and implications.'
        },
        {
          question: 'Describe different garbage collection strategies and trade-offs.',
          expectedAnswer: 'Mark-sweep, generational, concurrent; latency vs throughput considerations.',
          hints: ['Generational', 'Pause times'],
          difficulty: 'Hard',
          difficultyExplanation: 'Runtime internals and performance.'
        },
        {
          question: 'Lock-free vs lock-based concurrency: when would you choose either?',
          expectedAnswer: 'Lock-free uses atomics and retries; avoids deadlocks; complexity vs performance trade-offs.',
          hints: ['Atomics', 'Deadlocks'],
          difficulty: 'Hard',
          difficultyExplanation: 'Advanced concurrency design.'
        }
      ]
    },
    Project: {
      Easy: [
        {
          question: projectDescription
            ? 'Summarize the core user journey your project enables.'
            : 'Summarize the core user journey your latest project enables.',
          expectedAnswer: 'Key steps, actors, success criteria, and constraints.',
          hints: ['Actors', 'Success criteria'],
          difficulty: 'Easy',
          difficultyExplanation: 'Ensures clear articulation of basics.'
        },
        {
          question: 'List the main components and how they interact in your project.',
          expectedAnswer: 'High-level diagram of services/modules and data flow.',
          hints: ['Components', 'Data flow'],
          difficulty: 'Easy',
          difficultyExplanation: 'Architecture literacy.'
        },
        {
          question: 'What were the top 2 non-functional requirements?',
          expectedAnswer: 'E.g., performance, reliability, security; how they shaped design.',
          hints: ['NFRs', 'Trade-offs'],
          difficulty: 'Easy',
          difficultyExplanation: 'Requirements thinking.'
        },
        {
          question: 'How did you ensure basic observability in your project?',
          expectedAnswer: 'Logging, metrics, tracing; dashboards and alerts.',
          hints: ['Metrics', 'Tracing'],
          difficulty: 'Easy',
          difficultyExplanation: 'Operational hygiene.'
        }
      ],
      Medium: [
        {
          question: projectDescription
            ? 'Which component in your project was the bottleneck and how did you address it?'
            : 'Identify a bottleneck in your system and propose mitigations.',
          expectedAnswer: 'Measurement, root cause analysis, caching/queueing/partitioning, validation of results.',
          hints: ['Measure', 'Mitigate', 'Validate'],
          difficulty: 'Medium',
          difficultyExplanation: 'Applies practical performance tuning.'
        },
        {
          question: 'How did you approach testing (unit/integration/e2e) and CI?',
          expectedAnswer: 'Coverage strategy, environments, gates, flaky test handling.',
          hints: ['CI', 'Integration tests'],
          difficulty: 'Medium',
          difficultyExplanation: 'Quality and delivery process.'
        },
        {
          question: 'Describe your security approach (authz/authn/secrets) in the project.',
          expectedAnswer: 'Principle of least privilege, secret storage, encryption, audits.',
          hints: ['Auth', 'Secrets'],
          difficulty: 'Medium',
          difficultyExplanation: 'Security by design.'
        },
        {
          question: 'What was your rollback plan for risky releases?',
          expectedAnswer: 'Canary, feature flags, versioned schemas, quick rollback.',
          hints: ['Canary', 'Feature flags'],
          difficulty: 'Medium',
          difficultyExplanation: 'Safe delivery practices.'
        }
      ],
      Hard: [
        {
          question: projectDescription
            ? 'Propose a migration plan to re-architect a critical subsystem in your project with zero downtime.'
            : 'Plan a zero-downtime migration for a critical subsystem.',
          expectedAnswer: 'Strangler pattern, dual-writes/backfills, canary, rollback, observability.',
          hints: ['Strangler fig', 'Canary', 'Rollback'],
          difficulty: 'Hard',
          difficultyExplanation: 'Complex migration strategy and risk management.'
        },
        {
          question: 'Design a multi-region strategy for your system.',
          expectedAnswer: 'Data replication, latency routing, failover, consistency trade-offs, cost.',
          hints: ['Multi-region', 'Failover'],
          difficulty: 'Hard',
          difficultyExplanation: 'Geo-distribution complexity.'
        },
        {
          question: 'How would you cut infra cost by 30% without hurting reliability?',
          expectedAnswer: 'Right-sizing, autoscaling, caching, storage tiers, workload scheduling.',
          hints: ['Autoscaling', 'Caching'],
          difficulty: 'Hard',
          difficultyExplanation: 'Optimization under constraints.'
        },
        {
          question: 'What is your disaster recovery plan (RPO/RTO) for this system?',
          expectedAnswer: 'Backups, replication, DR drills, objectives and validation.',
          hints: ['RPO', 'RTO'],
          difficulty: 'Hard',
          difficultyExplanation: 'Resilience planning and execution.'
        }
      ]
    }
  };

  // If Technical subtopic provided, override Technical banks
  if (category === 'Technical' && technicalSubtopic && technicalByTopic[technicalSubtopic]) {
    byCat.Technical = technicalByTopic[technicalSubtopic];
  }

  const cat = byCat[category] || byCat.Technical;
  const bank = cat[lvl] || cat.Easy;
  const desired = Math.max(1, count || 5);
  // Shuffle to vary across requests
  const shuffled = [...bank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.length >= desired) {
    return shuffled.slice(0, desired).map((q) => ({ ...q, difficulty: lvl }));
  }
  const out = [...shuffled];
  while (out.length < desired) {
    out.push({ ...bank[out.length % bank.length], difficulty: lvl });
  }
  return out.slice(0, desired);
}

export async function generateQuestions(options) {
  const model = getModel('gemini-1.5-flash');
  const { difficulty, category, count, projectDescription, technicalSubtopic } = options;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (!model) {
    // Fallback when API key is missing
    return getFallbackQuestions(category, difficulty, Math.max(1, count || 5), projectDescription, technicalSubtopic);
  }

  const prompt = buildPrompt({ difficulty, category, count, projectDescription, technicalSubtopic }) + `

Variation seed: ${nonce}
- Generate a fresh set of questions distinct from typical examples.`;
  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text() || '[]';
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json) && json.length) return json.slice(0, count);
      if (Array.isArray(json?.items) && json.items.length) return json.items.slice(0, count);
    } catch (e) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, count);
        } catch {}
      }
    }
    // If parsing failed or empty, use fallback
    return getFallbackQuestions(category, difficulty, Math.max(1, count || 5), projectDescription, technicalSubtopic);
  } catch (err) {
    // If API call itself fails, use fallback
    return getFallbackQuestions(category, difficulty, Math.max(1, count || 5), projectDescription, technicalSubtopic);
  }
}


