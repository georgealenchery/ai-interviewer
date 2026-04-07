import type { CodingProblem } from "../types/interview";

const ML_CATEGORIES = [
  "data preprocessing",
  "model evaluation",
  "loss functions",
  "gradient updates",
  "feature engineering",
  "overfitting detection",
  "basic model logic",
];

const ML_GENERIC_KEYWORDS = [
  "linked list",
  "binary tree",
  "graph traversal",
  "depth-first",
  "breadth-first",
  "two sum",
  "fibonacci",
  "merge sort",
  "quicksort",
  "heapsort",
  "trie",
  "dynamic programming",
];

export function mlProblemsAreValid(problems: CodingProblem[]): boolean {
  return problems.every((p) => {
    const text = `${p.prompt} ${p.functionName}`.toLowerCase();
    return !ML_GENERIC_KEYWORDS.some((kw) => text.includes(kw));
  });
}

export function buildMLPrompt(difficulty: string, level: string): string {
  const categories = ML_CATEGORIES.slice().sort(() => Math.random() - 0.5).slice(0, 3);

  return `You are conducting a machine learning technical interview at ${level} level, ${difficulty} difficulty.

Generate EXACTLY 3 coding problems. Each problem must cover a DIFFERENT ML concept from this list:
${categories.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

Each problem must:
- Be solvable in 5–10 minutes
- Require writing a Python function
- Have a clear, bounded problem statement (not an open-ended project)
- Test genuine understanding of the ML concept, not just general programming
- Include 3–5 concrete test cases with specific numeric inputs and expected outputs

STRICTLY FORBIDDEN — do not generate problems about:
- Generic algorithms: sorting, searching, arrays, linked lists, binary trees, graphs
- LeetCode-style puzzles (two-sum, fibonacci, palindromes, etc.)
- Full model training pipelines
- Multi-step ML projects

Good examples of allowed problems:
- "Implement min-max normalization on a list of floats"
- "Compute precision and recall given two label lists"
- "Apply one gradient descent step given weights, gradients, and learning rate"
- "Detect whether a model is overfitting given train/val loss curves"
- "Compute the cross-entropy loss for a set of predictions"

Difficulty guide:
- easy: straightforward formula implementation, one clear concept, simple test cases
- medium: requires combining two concepts or handling edge cases (e.g. divide-by-zero, empty arrays)
- hard: requires deeper understanding, multiple edge cases, performance considerations

Function signature format (Python):
def func_name(param1, param2):
    # Your implementation here
    pass

Return ONLY valid JSON — no markdown, no explanation, no extra text.`;
}
