import type { CodingProblem } from "../types/interview";

export const FALLBACK_PROBLEMS: CodingProblem[] = [
  {
    prompt: "Write a function that takes an array of numbers and returns the two numbers that add up to a given target sum. Return them as an array in the order they appear.",
    functionName: "twoSum",
    functionSignature: "function twoSum(nums, target) {\n  // Your implementation here\n}",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [2, 7] },
      { input: [[3, 2, 4], 6], expectedOutput: [2, 4] },
      { input: [[1, 5, 3, 7], 8], expectedOutput: [1, 7] },
    ],
  },
  {
    prompt: "Write a function that takes a string and returns true if it is a valid palindrome (ignoring non-alphanumeric characters and case), false otherwise.",
    functionName: "isPalindrome",
    functionSignature: "function isPalindrome(s) {\n  // Your implementation here\n}",
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expectedOutput: true },
      { input: ["race a car"], expectedOutput: false },
      { input: ["Was it a car or a cat I saw?"], expectedOutput: true },
    ],
  },
  {
    prompt: "Write a function that takes an array of integers and returns the maximum sum of any contiguous subarray.",
    functionName: "maxSubarraySum",
    functionSignature: "function maxSubarraySum(nums) {\n  // Your implementation here\n}",
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6 },
      { input: [[1]], expectedOutput: 1 },
      { input: [[5, 4, -1, 7, 8]], expectedOutput: 23 },
    ],
  },
];

export const ML_FALLBACK_PROBLEMS: CodingProblem[] = [
  {
    prompt:
      "Implement min-max normalization for a list of numerical values. " +
      "Given a list of numbers, return a new list where every value is scaled " +
      "to the range [0, 1] using the formula: (x - min) / (max - min). " +
      "If all values are identical, return a list of zeros.",
    functionName: "min_max_normalize",
    functionSignature:
      "def min_max_normalize(values):\n    # Your implementation here\n    pass",
    testCases: [
      { input: [[0, 5, 10]], expectedOutput: [0.0, 0.5, 1.0] },
      { input: [[3, 3, 3]], expectedOutput: [0.0, 0.0, 0.0] },
      { input: [[-10, 0, 10]], expectedOutput: [0.0, 0.5, 1.0] },
      { input: [[1, 2, 3, 4, 5]], expectedOutput: [0.0, 0.25, 0.5, 0.75, 1.0] },
    ],
  },
  {
    prompt:
      "Implement a function that computes classification accuracy, precision, " +
      "and recall given two lists: the true labels and the predicted labels " +
      "(binary: 0 or 1). Return a dict with keys 'accuracy', 'precision', and " +
      "'recall', each rounded to 2 decimal places. " +
      "If there are no positive predictions, precision is 0. " +
      "If there are no actual positives, recall is 0.",
    functionName: "classification_metrics",
    functionSignature:
      "def classification_metrics(y_true, y_pred):\n    # Your implementation here\n    pass",
    testCases: [
      {
        input: [[1, 0, 1, 1], [1, 0, 0, 1]],
        expectedOutput: { accuracy: 0.75, precision: 1.0, recall: 0.67 },
      },
      {
        input: [[1, 1, 0, 0], [1, 0, 0, 0]],
        expectedOutput: { accuracy: 0.75, precision: 1.0, recall: 0.5 },
      },
      {
        input: [[0, 0, 0], [0, 0, 0]],
        expectedOutput: { accuracy: 1.0, precision: 0.0, recall: 0.0 },
      },
    ],
  },
  {
    prompt:
      "Implement a single gradient descent weight update. Given the current " +
      "weights (a list of floats), the corresponding gradients (a list of floats), " +
      "and a learning rate (float), return the updated weights after one step: " +
      "w = w - learning_rate * gradient. Return each weight rounded to 4 decimal places.",
    functionName: "gradient_descent_step",
    functionSignature:
      "def gradient_descent_step(weights, gradients, learning_rate):\n    # Your implementation here\n    pass",
    testCases: [
      { input: [[1.0, 2.0], [0.5, 0.5], 0.1], expectedOutput: [0.95, 1.95] },
      { input: [[0.0, 0.0], [1.0, -1.0], 0.01], expectedOutput: [-0.01, 0.01] },
      { input: [[5.0], [2.0], 0.5], expectedOutput: [4.0] },
    ],
  },
];
