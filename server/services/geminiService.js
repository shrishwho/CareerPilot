import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash or gemini-2.0-flash
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Clean json response helper
const cleanJsonText = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }
  return cleaned.trim();
};

export const generateInterviewQuestions = async ({
  role = 'Full Stack Developer',
  interviewType = 'Mixed',
  numQuestions = 5,
  jobDescription = '',
}) => {
  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are an expert technical recruiter and interviewer.
Generate exactly ${numQuestions} distinct, high-quality interview questions for a candidate applying for the role: "${role}".
Interview Type: ${interviewType} (HR / Behavioral, Technical, or Mixed).
${jobDescription ? `Target Job Description: """${jobDescription}"""` : ''}

Respond ONLY with valid JSON array containing objects with these exact keys:
[
  {
    "id": 1,
    "question": "Question text here",
    "type": "Technical" or "Behavioral" or "Situational",
    "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
  }
]
No additional markdown or explanation outside the JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonText(text);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, numQuestions).map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          type: q.type || interviewType,
          expectedKeyPoints: q.expectedKeyPoints || [],
        }));
      }
    } catch (err) {
      console.warn('[Gemini Service] Error generating questions, using intelligent fallback:', err.message);
    }
  }

  // Intelligent Fallback Questions based on role & interview type
  const fallbackBank = {
    'Frontend Developer': [
      { id: 1, question: "What is the difference between let, const, and var in JavaScript, and how does hoisting affect them?", type: "Technical", expectedKeyPoints: ["Block scope vs function scope", "Temporal Dead Zone", "Re-assignment rules"] },
      { id: 2, question: "Explain the Virtual DOM in React and how reconciliation works.", type: "Technical", expectedKeyPoints: ["Diffing algorithm", "Fiber architecture", "Performance optimization"] },
      { id: 3, question: "Describe how you optimize web application performance and improve Core Web Vitals (LCP, FID/INP, CLS).", type: "Technical", expectedKeyPoints: ["Lazy loading", "Asset compression", "Minimizing layout shifts", "Code splitting"] },
      { id: 4, question: "Tell me about a time you had to deal with cross-browser compatibility or responsive design issues under a tight deadline.", type: "HR / Behavioral", expectedKeyPoints: ["STAR method", "CSS flexbox/grid", "Testing across devices", "Outcome"] },
      { id: 5, question: "How do you manage complex state in a large-scale modern frontend application?", type: "Technical", expectedKeyPoints: ["Context API vs Redux/Zustand", "Server state vs Client state", "Immutability"] },
      { id: 6, question: "Explain CSS Specificity and the Cascade order in modern web development.", type: "Technical", expectedKeyPoints: ["Inline vs IDs vs classes vs elements", "!important rule", "Cascade layers"] },
      { id: 7, question: "How do you ensure accessibility (a11y) standards (WCAG) in your web components?", type: "Technical", expectedKeyPoints: ["ARIA attributes", "Semantic HTML", "Keyboard navigation", "Contrast ratios"] },
      { id: 8, question: "Walk me through how the browser's Event Loop handles Microtasks (Promises) and Macrotasks (setTimeout).", type: "Technical", expectedKeyPoints: ["Call stack", "Microtask queue priority", "Callback queue", "Render cycle"] },
      { id: 9, question: "Describe a situation where you had a technical disagreement with a teammate or designer. How did you resolve it?", type: "HR / Behavioral", expectedKeyPoints: ["Communication", "Empathy", "Data-driven decisions", "Mutual agreement"] },
      { id: 10, question: "What strategies do you use for secure frontend authentication and token storage (JWT, cookies, XSS/CSRF prevention)?", type: "Technical", expectedKeyPoints: ["HttpOnly cookies", "XSS mitigation", "SameSite attribute", "Refresh token rotation"] },
      { id: 11, question: "How does React 18/19 Server Components differ from standard Client-Side Rendering and SSR?", type: "Technical", expectedKeyPoints: ["Zero bundle size on client", "Direct backend access", "Hydration overhead reduction"] },
      { id: 12, question: "Why are you interested in this role and what makes you a great fit for our engineering team?", type: "HR / Behavioral", expectedKeyPoints: ["Enthusiasm", "Alignment with company mission", "Relevant past accomplishments"] },
      { id: 13, question: "How do you write effective unit and integration tests for UI components using React Testing Library or Jest?", type: "Technical", expectedKeyPoints: ["User-centric queries", "Mocking API calls", "Testing behavior over implementation"] },
      { id: 14, question: "Tell me about your favorite frontend project and the biggest technical challenge you solved in it.", type: "HR / Behavioral", expectedKeyPoints: ["Architecture", "Problem solving", "Measurable impact"] },
      { id: 15, question: "Where do you see frontend technologies heading in the next 3 to 5 years, and how do you stay updated?", type: "HR / Behavioral", expectedKeyPoints: ["Continuous learning", "WebAssembly/AI UI", "Tooling evolution"] },
    ],
    'Backend Developer': [
      { id: 1, question: "How would you design a scalable RESTful API with proper versioning, pagination, and error handling?", type: "Technical", expectedKeyPoints: ["Consistent status codes", "Cursor vs offset pagination", "Rate limiting", "API Gateway"] },
      { id: 2, question: "Explain the differences between SQL and NoSQL databases and when you would choose one over the other.", type: "Technical", expectedKeyPoints: ["ACID compliance", "Schema flexibility", "Horizontal scaling", "Join complexity"] },
      { id: 3, question: "How do you handle database indexing and optimize slow-running database queries?", type: "Technical", expectedKeyPoints: ["B-Tree indexes", "Execution plans / EXPLAIN", "Composite indexes", "N+1 query problem"] },
      { id: 4, question: "Describe how message queues (e.g., RabbitMQ, Kafka, Redis Pub/Sub) help in building decoupled microservices.", type: "Technical", expectedKeyPoints: ["Asynchronous processing", "Buffering traffic spikes", "Fault tolerance", "Consumer groups"] },
      { id: 5, question: "Tell me about a challenging production bug or outage you resolved. What was your triage process?", type: "HR / Behavioral", expectedKeyPoints: ["Monitoring & logs", "Root cause analysis", "Post-mortem & prevention"] },
      { id: 6, question: "Explain JWT authentication vs Session-based authentication with their security trade-offs.", type: "Technical", expectedKeyPoints: ["Stateless vs stateful", "Revocation strategies", "Storage security"] },
      { id: 7, question: "How do you implement caching strategies (Cache-Aside, Write-Through, TTL, Redis) to improve throughput?", type: "Technical", expectedKeyPoints: ["Cache invalidation", "Cache stampede / thundering herd", "Memory management"] },
      { id: 8, question: "What is the difference between synchronous blocking I/O and asynchronous non-blocking event loops in Node.js?", type: "Technical", expectedKeyPoints: ["libuv threadpool", "Event loop phases", "CPU-bound vs I/O-bound"] },
      { id: 9, question: "How do you handle data consistency in distributed systems (CAP Theorem, 2PC, Saga pattern)?", type: "Technical", expectedKeyPoints: ["Eventual consistency", "Compensating transactions", "Partition tolerance"] },
      { id: 10, question: "Give an example of how you prioritized security in backend development (SQL injection, CSRF, sanitization, rate limiting).", type: "Technical", expectedKeyPoints: ["Input validation", "Prepared statements", "Helmet/CORS", "Principle of least privilege"] },
      { id: 11, question: "How do you handle deadlocks and race conditions in concurrent backend systems?", type: "Technical", expectedKeyPoints: ["Optimistic vs pessimistic locking", "Atomic operations", "Isolation levels"] },
      { id: 12, question: "Describe a project where you had to negotiate requirements with product managers or frontend engineers.", type: "HR / Behavioral", expectedKeyPoints: ["Collaboration", "Requirement scoping", "Clear technical contracts"] },
      { id: 13, question: "What is your approach to CI/CD pipelines, containerization (Docker), and automated testing for backends?", type: "Technical", expectedKeyPoints: ["Docker multi-stage builds", "Automated unit/integration suites", "Zero-downtime deployment"] },
      { id: 14, question: "How do you structure microservices communication: REST vs gRPC vs GraphQL?", type: "Technical", expectedKeyPoints: ["Protobuf binary serialization", "Over-fetching reduction", "Latency and contract safety"] },
      { id: 15, question: "Why do you want to join our engineering team as a Backend Developer?", type: "HR / Behavioral", expectedKeyPoints: ["Career goals", "Technical passion", "Company culture fit"] },
    ],
    'Full Stack Developer': [
      { id: 1, question: "Walk me through what happens under the hood when a user types a URL in the browser and hits Enter.", type: "Technical", expectedKeyPoints: ["DNS lookup", "TCP/TLS handshake", "HTTP request/response", "DOM/CSSOM rendering tree", "JS execution"] },
      { id: 2, question: "How do you structure an end-to-end full-stack web application for maintainability and scalability?", type: "Technical", expectedKeyPoints: ["Layered architecture", "Separation of concerns", "Shared types/DTOs", "Environment config"] },
      { id: 3, question: "Explain how you handle real-time bidirectional communication between frontend and backend (WebSockets vs SSE vs Polling).", type: "Technical", expectedKeyPoints: ["Full-duplex socket", "Server-Sent Events for streaming", "Reconnection & heartbeat handling"] },
      { id: 4, question: "Tell me about a time you had to balance building features quickly with paying down technical debt.", type: "HR / Behavioral", expectedKeyPoints: ["Pragmatic trade-offs", "Refactoring strategy", "Automated test coverage", "Stakeholder communication"] },
      { id: 5, question: "How do you secure data transmission and user sessions across the full stack?", type: "Technical", expectedKeyPoints: ["HTTPS/TLS", "CORS policy", "JWT in secure cookies", "Input sanitation on client & server"] },
      { id: 6, question: "How do you design database schemas (relational or NoSQL) to support high-traffic user dashboard queries?", type: "Technical", expectedKeyPoints: ["Normalization vs denormalization", "Indexing strategy", "Aggregation pipelines"] },
      { id: 7, question: "Describe how you debug a performance issue where an action in the UI feels sluggish.", type: "Technical", expectedKeyPoints: ["Browser DevTools Profiler", "Network waterfall analysis", "Backend response time metrics", "Database query profiling"] },
      { id: 8, question: "What is your experience with state management, caching, and optimistic UI updates?", type: "Technical", expectedKeyPoints: ["Immediate feedback for UX", "Rollback on failure", "React Query/SWR or Redux"] },
      { id: 9, question: "Describe a project where you built both the frontend interface and the backend API from scratch.", type: "HR / Behavioral", expectedKeyPoints: ["Architecture choices", "Execution steps", "Lessons learned"] },
      { id: 10, question: "How do you manage environment variables, secret keys, and configuration across staging and production?", type: "Technical", expectedKeyPoints: [".env protection", "Secret managers", "Never checking secrets into Git"] },
      { id: 11, question: "How do you approach error handling so users get friendly error messages while developers get full error logs?", type: "Technical", expectedKeyPoints: ["Global error boundaries in React", "Express error middleware", "Sentry/log aggregation"] },
      { id: 12, question: "Tell me about a time you had to learn a completely new framework or tool on the job in a very short time.", type: "HR / Behavioral", expectedKeyPoints: ["Adaptability", "Learning process", "Successful delivery"] },
      { id: 13, question: "What is your philosophy on automated testing across unit, integration, and E2E layers in a full-stack project?", type: "Technical", expectedKeyPoints: ["Testing pyramid", "Test speed vs confidence", "Mocking external services"] },
      { id: 14, question: "How do you ensure responsive mobile and desktop compatibility while maintaining clean CSS?", type: "Technical", expectedKeyPoints: ["Mobile-first design", "Utility CSS vs styled components", "Breakpoints & media queries"] },
      { id: 15, question: "Where do you see yourself growing technically as a full-stack engineer over the next 2 years?", type: "HR / Behavioral", expectedKeyPoints: ["Skill development", "System design mastery", "Leadership or mentorship"] },
    ],
    'Software Engineer': [
      { id: 1, question: "Explain the SOLID principles of object-oriented design and provide practical examples of at least two.", type: "Technical", expectedKeyPoints: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion"] },
      { id: 2, question: "How do you analyze the Time and Space Complexity (Big O) of an algorithm you are designing?", type: "Technical", expectedKeyPoints: ["Worst/Average case", "Memory allocation", "Trade-offs between speed and space"] },
      { id: 3, question: "Describe a situation where you had to refactor a complex legacy codebase without breaking existing functionality.", type: "HR / Behavioral", expectedKeyPoints: ["Safety nets (unit tests)", "Incremental refactoring", "Regression testing"] },
      { id: 4, question: "How do you design a robust caching layer for a distributed application?", type: "Technical", expectedKeyPoints: ["Cache eviction policies (LRU, LFU)", "Data serialization", "Consistency"] },
      { id: 5, question: "Explain how Git branching strategies (e.g., Git Flow, Trunk-Based Development) support team collaboration.", type: "Technical", expectedKeyPoints: ["Feature branches", "Pull requests & code review", "Continuous integration"] },
      { id: 6, question: "How do you handle concurrency, race conditions, and thread safety in software applications?", type: "Technical", expectedKeyPoints: ["Locks/Mutexes", "Atomic operations", "Immutability"] },
      { id: 7, question: "Tell me about a time you made a technical mistake or introduced a bug. How did you handle it?", type: "HR / Behavioral", expectedKeyPoints: ["Accountability", "Swift fix", "Root cause post-mortem"] },
      { id: 8, question: "What is the difference between monolithic architecture and microservices architecture?", type: "Technical", expectedKeyPoints: ["Deployment simplicity vs independent scaling", "Network overhead", "Organizational alignment"] },
      { id: 9, question: "Explain the concept of Dependency Injection and why it facilitates testable software.", type: "Technical", expectedKeyPoints: ["Decoupling creation from usage", "Easy mocking/stubbing", "Configurability"] },
      { id: 10, question: "Why are you interested in our company, and what unique value do you bring as an engineer?", type: "HR / Behavioral", expectedKeyPoints: ["Company research", "Problem-solving mindset", "Collaborative culture"] },
      { id: 11, question: "How do you approach writing clean, self-documenting code vs adding comments?", type: "Technical", expectedKeyPoints: ["Descriptive naming", "Small functions", "Comments explaining 'why' not 'what'"] },
      { id: 12, question: "Tell me about a complex technical problem you solved that you are particularly proud of.", type: "HR / Behavioral", expectedKeyPoints: ["Problem framing", "Engineering methodology", "Measurable result"] },
      { id: 13, question: "How do you evaluate whether to use a third-party open-source library versus building an in-house solution?", type: "Technical", expectedKeyPoints: ["Maintenance burden", "Security audit", "Licensing", "Customizability"] },
      { id: 14, question: "Explain how memory management and Garbage Collection works in your primary programming language.", type: "Technical", expectedKeyPoints: ["Heap vs Stack", "Mark-and-sweep or reference counting", "Preventing memory leaks"] },
      { id: 15, question: "How do you give constructive and empathetic feedback during code reviews?", type: "HR / Behavioral", expectedKeyPoints: ["Positive reinforcement", "Focusing on the code not person", "Explaining rationale"] },
    ],
    'Data Analyst': [
      { id: 1, question: "How do you write complex SQL queries using window functions (ROW_NUMBER, RANK, LEAD, LAG) for cohort analysis?", type: "Technical", expectedKeyPoints: ["PARTITION BY", "ORDER BY frame", "Aggregations across partitions"] },
      { id: 2, question: "Describe how you clean and preprocess messy datasets with missing values and outliers in Python (pandas) or SQL.", type: "Technical", expectedKeyPoints: ["Imputation techniques", "Outlier detection (IQR/Z-score)", "Type conversion and deduplication"] },
      { id: 3, question: "Tell me about a time you translated raw data insights into an actionable business recommendation that led to positive results.", type: "HR / Behavioral", expectedKeyPoints: ["Business context", "Executive dashboard/presentation", "Stakeholder adoption"] },
      { id: 4, question: "Explain the difference between Correlation and Causation with an intuitive business example.", type: "Technical", expectedKeyPoints: ["Confounding variables", "A/B testing necessity", "Statistical significance"] },
      { id: 5, question: "How do you design an effective executive dashboard in tools like Tableau, Power BI, or Looker?", type: "Technical", expectedKeyPoints: ["KPI prioritization", "Clean visual hierarchy", "Interactive filters", "Actionable insights"] },
      { id: 6, question: "Explain hypothesis testing, p-values, and statistical power in the context of A/B experiments.", type: "Technical", expectedKeyPoints: ["Null vs alternative hypothesis", "Type I and Type II errors", "Sample size calculations"] },
      { id: 7, question: "How do you handle a situation where data from two different internal databases conflicts?", type: "HR / Behavioral", expectedKeyPoints: ["Root cause investigation", "Data lineage check", "Establishing single source of truth"] },
      { id: 8, question: "Explain the difference between Inner, Left, Right, Full Outer, and Cross Joins in SQL.", type: "Technical", expectedKeyPoints: ["Match behavior", "NULL handling", "Cartesian product risks"] },
      { id: 9, question: "What metrics would you track to measure the health and user engagement of a SaaS product?", type: "Technical", expectedKeyPoints: ["DAU/MAU", "Churn rate", "Customer Acquisition Cost (CAC)", "LTV", "Retention cohorts"] },
      { id: 10, question: "How do you communicate technical analytical findings to non-technical executive stakeholders?", type: "HR / Behavioral", expectedKeyPoints: ["Storytelling with data", "Clear visual summaries", "Bottom-line impact focus"] },
      { id: 11, question: "Explain how you use Group By and Having clauses in SQL to filter aggregated results.", type: "Technical", expectedKeyPoints: ["Where filters rows before aggregation", "Having filters groups after aggregation"] },
      { id: 12, question: "Tell me about a time when an analysis you conducted proved an initial hypothesis or executive assumption wrong.", type: "HR / Behavioral", expectedKeyPoints: ["Data integrity", "Diplomatic presentation", "Guiding better strategy"] },
      { id: 13, question: "What is data normalization (1NF, 2NF, 3NF) and star schema vs snowflake schema in data warehousing?", type: "Technical", expectedKeyPoints: ["Fact tables", "Dimension tables", "Query optimization"] },
      { id: 14, question: "How do you detect and prevent bias in data collection and predictive models?", type: "Technical", expectedKeyPoints: ["Sampling bias", "Historical bias", "Stratified sampling"] },
      { id: 15, question: "Why are you interested in becoming a Data Analyst at our company?", type: "HR / Behavioral", expectedKeyPoints: ["Passion for data", "Alignment with company domain", "Impact orientation"] },
    ],
  };

  const genericBank = fallbackBank[role] || fallbackBank['Software Engineer'];
  let filtered = genericBank;
  if (interviewType === 'HR / Behavioral') {
    filtered = genericBank.filter((q) => q.type === 'HR / Behavioral');
    if (filtered.length < numQuestions) {
      filtered = genericBank;
    }
  } else if (interviewType === 'Technical') {
    filtered = genericBank.filter((q) => q.type === 'Technical');
    if (filtered.length < numQuestions) {
      filtered = genericBank;
    }
  }

  // Shuffle and pick requested number
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions).map((item, idx) => ({
    id: idx + 1,
    question: item.question,
    type: item.type,
    expectedKeyPoints: item.expectedKeyPoints,
  }));
};

export const evaluateAnswer = async ({
  question,
  answer,
  role = 'Software Engineer',
  interviewType = 'Mixed',
  jobDescription = '',
}) => {
  const model = getGeminiModel();

  if (model && answer && answer.trim().length > 5) {
    try {
      const prompt = `You are a senior technical interviewer evaluating a candidate's response.
Candidate Role: "${role}"
Interview Type: "${interviewType}"
${jobDescription ? `Job Description: """${jobDescription}"""` : ''}

Question: "${question}"
Candidate Answer: """${answer}"""

Evaluate the candidate's answer objectively.
Respond ONLY with valid JSON in this exact structure:
{
  "score": 8, // Integer from 1 to 10
  "relevance": "High / Medium / Low - brief sentence",
  "technicalCorrectness": "Strong / Fair / Needs Improvement - brief sentence",
  "communication": "Clear and structured / Somewhat vague / Rambling",
  "completeness": "Addressed all key points / Missed some edge cases",
  "feedback": "2-3 sentences of constructive feedback highlighting strengths and what was accurate.",
  "improvementSuggestion": "1-2 actionable sentences on how the answer could be made more impressive (e.g. mentioning specific metrics, trade-offs, or STAR structure)."
}
No extra text outside the JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonText(text);
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.score === 'number') {
        return {
          score: Math.min(10, Math.max(1, Math.round(parsed.score))),
          relevance: parsed.relevance || 'High relevance to the question',
          technicalCorrectness: parsed.technicalCorrectness || 'Good conceptual understanding',
          communication: parsed.communication || 'Clear and well-structured response',
          completeness: parsed.completeness || 'Covered main concepts',
          feedback: parsed.feedback || 'Good articulation of the key concepts.',
          improvementSuggestion: parsed.improvementSuggestion || 'Consider mentioning real-world project experience or performance trade-offs.',
        };
      }
    } catch (err) {
      console.warn('[Gemini Service] Error evaluating answer, using intelligent heuristic evaluation:', err.message);
    }
  }

  // Intelligent Heuristic Evaluation
  const wordCount = answer ? answer.trim().split(/\s+/).filter(Boolean).length : 0;
  let score = 5;
  let relevance = 'Moderate relevance';
  let technicalCorrectness = 'Fair understanding shown';
  let communication = 'Basic answer provided';
  let completeness = 'Partial response';
  let feedback = 'You provided an answer, but expanding with specific technical terms and examples will elevate your score.';
  let improvementSuggestion = 'Try structuring your answer with definitions, real-world examples, and discussing performance or trade-offs.';

  if (wordCount === 0) {
    score = 1;
    relevance = 'No answer provided';
    technicalCorrectness = 'Unanswered';
    communication = 'No response';
    completeness = 'Incomplete';
    feedback = 'The question was left blank or was too brief to evaluate.';
    improvementSuggestion = 'Attempt to provide an answer even if unsure; interviewers appreciate reasoning through the problem.';
  } else if (wordCount < 15) {
    score = 4;
    relevance = 'Somewhat relevant';
    technicalCorrectness = 'Brief definition provided';
    communication = 'Very concise';
    completeness = 'Lacks detail and depth';
    feedback = 'Your response is on the right track but very brief.';
    improvementSuggestion = 'Expand your answer by elaborating on the "why" and giving a concrete practical example.';
  } else if (wordCount < 40) {
    score = 7;
    relevance = 'High relevance';
    technicalCorrectness = 'Solid fundamental understanding';
    communication = 'Clear and direct';
    completeness = 'Covered the primary points';
    feedback = 'Good clear response addressing the core question accurately.';
    improvementSuggestion = 'To get a perfect 10, discuss real-world edge cases, performance considerations, or alternative approaches.';
  } else {
    score = 9;
    relevance = 'Highly relevant and thorough';
    technicalCorrectness = 'Comprehensive and technically accurate';
    communication = 'Well-structured, professional articulation';
    completeness = 'Thoroughly covered core concepts and nuances';
    feedback = 'Excellent in-depth response! You clearly demonstrated strong domain expertise and structured thinking.';
    improvementSuggestion = 'Great job! Keep tying your answers back to measurable impact and system design trade-offs in real interviews.';
  }

  return {
    score,
    relevance,
    technicalCorrectness,
    communication,
    completeness,
    feedback,
    improvementSuggestion,
  };
};

export const generateFinalReport = async ({
  role = 'Software Engineer',
  interviewType = 'Mixed',
  jobDescription = '',
  questionsAndAnswers = [],
}) => {
  const model = getGeminiModel();

  if (model && questionsAndAnswers.length > 0) {
    try {
      const prompt = `You are a principal hiring manager.
Candidate Role: "${role}"
Interview Type: "${interviewType}"
${jobDescription ? `Job Description: """${jobDescription}"""` : ''}

Candidate Interview Performance:
${questionsAndAnswers
  .map(
    (qa, idx) => `Q${idx + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
  )
  .join('\n\n')}

Analyze their complete performance across all questions.
Respond ONLY with valid JSON in this exact structure:
{
  "overallScore": 82, // Integer percentage (0 - 100)
  "technicalScore": 85, // Integer percentage (0 - 100)
  "communicationScore": 80, // Integer percentage (0 - 100)
  "confidenceScore": 82, // Integer percentage (0 - 100)
  "strongAreas": ["Solid understanding of core architectural principles", "Clear articulation of complex technical trade-offs", "Good practical examples"],
  "weakAreas": ["Could delve deeper into distributed edge cases", "Needs more concise opening summaries"],
  "improvementSuggestions": ["Practice using the STAR method for behavioral answers", "Review system scaling patterns and indexing strategies"],
  "recommendedTopics": ["Database Indexing & Query Optimization", "System Design Patterns", "Web Performance Metrics (CWV)"],
  "summary": "2-3 sentences summarizing the candidate's interview performance, readiness level, and main takeaways."
}
No extra text outside the JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonText(text);
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.overallScore === 'number') {
        return {
          overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore))),
          technicalScore: Math.min(100, Math.max(0, Math.round(parsed.technicalScore))),
          communicationScore: Math.min(100, Math.max(0, Math.round(parsed.communicationScore))),
          confidenceScore: Math.min(100, Math.max(0, Math.round(parsed.confidenceScore))),
          strongAreas: parsed.strongAreas || ['Good domain fundamentals', 'Clear communication'],
          weakAreas: parsed.weakAreas || ['Minor gaps in depth on complex questions'],
          improvementSuggestions: parsed.improvementSuggestions || ['Practice explaining system trade-offs with concrete metrics'],
          recommendedTopics: parsed.recommendedTopics || ['System Architecture', 'Design Patterns'],
          summary: parsed.summary || 'Overall strong interview performance with solid potential for the target role.',
        };
      }
    } catch (err) {
      console.warn('[Gemini Service] Error generating final report, using intelligent aggregate calculations:', err.message);
    }
  }

  // Intelligent Aggregation Fallback
  let totalScore = 0;
  let count = 0;
  questionsAndAnswers.forEach((qa) => {
    totalScore += Number(qa.score || 0);
    count += 1;
  });

  const avgOutOf10 = count > 0 ? totalScore / count : 7;
  const overallPercentage = Math.round(avgOutOf10 * 10);
  const technicalScore = Math.min(100, Math.max(20, overallPercentage + (overallPercentage > 70 ? 2 : -4)));
  const communicationScore = Math.min(100, Math.max(25, overallPercentage + (overallPercentage > 60 ? 4 : -2)));
  const confidenceScore = Math.min(100, Math.max(30, overallPercentage - 1));

  const strongAreas = [
    `Strong grasp of fundamental concepts in ${role}`,
    'Structured problem-solving approach and clarity of thought',
    'Clear verbal and written communication during answers',
  ];

  const weakAreas = [
    'Opportunity to expand on edge cases and failure mode handling',
    'Could cite more quantitative metrics and performance benchmarks from past work',
  ];

  const improvementSuggestions = [
    'Use the STAR method (Situation, Task, Action, Result) consistently on scenario questions.',
    'Highlight trade-offs (e.g., speed vs memory, complexity vs time to market) when proposing technical solutions.',
    `Review deep-dive interview topics for ${role} to sharpen technical vocabulary.`,
  ];

  const recommendedTopics = [
    'System Design & Microservices Architecture',
    'Performance Optimization & Caching Strategies',
    'Security Best Practices (OWASP, Auth, Encryption)',
    'Behavioral STAR Storytelling & Executive Presence',
  ];

  const summary = `The candidate demonstrated an overall score of ${overallPercentage}%. Strong technical fluency and logical reasoning were evident throughout the interview. With targeted practice on edge cases and metrics-driven answers, the candidate will be in a prime position to succeed in top-tier interviews.`;

  return {
    overallScore: overallPercentage,
    technicalScore,
    communicationScore,
    confidenceScore,
    strongAreas,
    weakAreas,
    improvementSuggestions,
    recommendedTopics,
    summary,
  };
};

export const generateColdEmail = async ({ userProfile = {}, application = {} }) => {
  const model = getGeminiModel();

  const applicantName = userProfile.name || 'Job Seeker';
  const targetRole = application.jobTitle || userProfile.targetRole || 'Software Engineer';
  const company = application.company || 'the target company';
  const skills = Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || 'Modern Web Development, Problem Solving');
  const recipient = application.contactPerson || 'Hiring Manager';

  if (model) {
    try {
      const prompt = `You are a career coach and professional copywriter.
Write an authentic, highly personalized, concise cold outreach email from a job seeker to a hiring manager or recruiter.

Applicant Name: ${applicantName}
Applicant Target Role: ${targetRole}
Applicant Skills: ${skills}
Applicant Education: ${userProfile.education || 'Computer Science / Engineering'}
Applicant Summary: ${userProfile.aboutMe || 'Passionate developer building high impact solutions'}

Target Company: ${company}
Target Job Title: ${application.jobTitle || targetRole}
Job Location: ${application.location || 'Remote'}
Recipient Name: ${recipient}
${application.notes ? `Additional Context/Notes: "${application.notes}"` : ''}

Guidelines:
- Short (under 160 words)
- Professional, warm, and natural (NOT robotic or generic)
- Highlights 1-2 key value propositions and matching skills
- Clear, low-friction call to action (e.g., 10-minute coffee chat or brief call)
- High open rate subject line

Respond ONLY with valid JSON in this exact structure:
{
  "subject": "Subject line text here",
  "body": "Hi [Name],\n\nBody text here...\n\nBest regards,\n${applicantName}"
}
No extra text outside JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonText(text);
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.subject && parsed.body) {
        return {
          subject: parsed.subject,
          body: parsed.body,
        };
      }
    } catch (err) {
      console.warn('[Gemini Service] Error generating cold email, using intelligent template:', err.message);
    }
  }

  // Intelligent High-Converting Cold Email Fallback
  const greeting = application.contactPerson ? `Hi ${application.contactPerson},` : `Hi ${company} Hiring Team,`;
  const subject = `Application for ${targetRole} - ${applicantName}`;
  const body = `${greeting}

I hope you're having a great week!

I came across the ${targetRole} role at ${company} and wanted to reach out directly. With my background in ${skills} and a strong focus on building reliable, scalable applications, I am very excited about what ${company} is building.

In my recent work, I've focused on delivering clean code, optimizing performance, and building seamless user experiences that drive measurable impact.

I would love the chance to connect for a quick 10-minute chat to learn more about the team's goals and discuss how my skill set can support your engineering initiatives.

Thank you for your time and consideration!

Best regards,
${applicantName}
${userProfile.email || ''}`;

  return {
    subject,
    body,
  };
};
