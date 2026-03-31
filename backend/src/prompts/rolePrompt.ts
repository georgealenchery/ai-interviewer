export type UserRole = "frontend" | "backend" | "fullstack";

const ROLE_TOPICS: Record<string, string[]> = {
  frontend: [
    "React and component design",
    "JavaScript and TypeScript",
    "CSS, layout, and responsive design",
    "browser performance and rendering",
    "accessibility (a11y)",
    "state management (Redux, Zustand, Context)",
    "client-side routing and SPAs",
  ],
  backend: [
    "REST and GraphQL API design",
    "relational and NoSQL databases",
    "system architecture and scalability",
    "caching strategies (Redis, CDN)",
    "authentication and authorization",
    "microservices and message queues",
    "server performance and observability",
  ],
  fullstack: [
    "React and modern JavaScript",
    "REST API design and databases",
    "authentication flows end-to-end",
    "state management on client and server",
    "deployment and CI/CD pipelines",
    "performance across the stack",
    "end-to-end architecture trade-offs",
  ],
};

const ROLE_EMPHASIS: Record<string, string> = {
  frontend:
    "Emphasize UI/UX concepts, React patterns, JavaScript fundamentals, browser internals, and frontend performance optimization.",
  backend:
    "Emphasize API design, database architecture, data modeling, scalability patterns, and server-side performance.",
  fullstack:
    "Cover both frontend and backend concerns — React and APIs, databases and UI, deployment pipelines and component design.",
};

/**
 * Returns a role-specific context string to embed in interview prompts.
 *
 * @param role   - User's engineering discipline: "frontend" | "backend" | "fullstack"
 * @param type   - Interview type: "technical" | "behavioral" | "followup"
 * @param level  - Optional experience label (e.g. "junior", "senior")
 */
export function buildInterviewPrompt(role: string, type: string, level?: string): string {
  const normalized = role.toLowerCase();
  const topics = ROLE_TOPICS[normalized] ?? ROLE_TOPICS.fullstack;
  const emphasis = ROLE_EMPHASIS[normalized] ?? ROLE_EMPHASIS.fullstack;
  const topicList = topics.join(", ");
  const levelLabel = level ? ` for a ${level} candidate` : "";

  if (type === "technical") {
    return `You are evaluating a ${normalized} engineer${levelLabel}. ${emphasis} Draw questions from these areas: ${topicList}.`;
  }

  if (type === "behavioral") {
    return `You are evaluating a ${normalized} engineer${levelLabel}. Tailor scenarios to ${normalized} engineering work. Relevant domains: ${topicList}.`;
  }

  // followup or any other type
  return `You are evaluating a ${normalized} engineer${levelLabel}. ${emphasis}`;
}
