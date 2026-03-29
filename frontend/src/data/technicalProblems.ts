export type Difficulty = "Easy" | "Medium" | "Hard";
export type Language = "javascript" | "typescript" | "python";

export interface TechnicalProblem {
  title: string;
  difficulty: Difficulty;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Record<Language, string>;
  testCases: Array<{
    input: string;
    expected: string;
    call: string; // JS expression to call with the input, e.g. "twoSum([2,7,11,15], 9)"
  }>;
}

export const TECHNICAL_PROBLEMS: TechnicalProblem[] = [
  // --- Easy ---
  {
    title: "Reverse a String",
    difficulty: "Easy",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory, and return the reversed string.",
    examples: [
      {
        input: 's = "hello"',
        output: '"olleh"',
        explanation: 'The reversed string of "hello" is "olleh".',
      },
      {
        input: 's = "Hannah"',
        output: '"hannaH"',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      "s consists of printable ASCII characters.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
  // Your solution here

}`,
      typescript: `function reverseString(s: string): string {
  // Your solution here

}`,
      python: `def reverse_string(s: str) -> str:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: '"hello"', expected: '"olleh"', call: 'reverseString("hello")' },
      { input: '"Hannah"', expected: '"hannaH"', call: 'reverseString("Hannah")' },
      { input: '"a"', expected: '"a"', call: 'reverseString("a")' },
    ],
  },
  {
    title: "FizzBuzz",
    difficulty: "Easy",
    description:
      'Given an integer n, return a string array answer (1-indexed) where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, answer[i] == "Fizz" if i is divisible by 3, answer[i] == "Buzz" if i is divisible by 5, and answer[i] == i (as a string) otherwise.',
    examples: [
      {
        input: "n = 3",
        output: '["1","2","Fizz"]',
      },
      {
        input: "n = 5",
        output: '["1","2","Fizz","4","Buzz"]',
      },
      {
        input: "n = 15",
        output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
      },
    ],
    constraints: ["1 <= n <= 10^4"],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  // Your solution here

}`,
      typescript: `function fizzBuzz(n: number): string[] {
  // Your solution here

}`,
      python: `def fizz_buzz(n: int) -> list[str]:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: "3", expected: '["1","2","Fizz"]', call: "JSON.stringify(fizzBuzz(3))" },
      { input: "5", expected: '["1","2","Fizz","4","Buzz"]', call: "JSON.stringify(fizzBuzz(5))" },
      { input: "15", expected: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', call: "JSON.stringify(fizzBuzz(15))" },
    ],
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your solution here

}`,
      typescript: `function isValid(s: string): boolean {
  // Your solution here

}`,
      python: `def is_valid(s: str) -> bool:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: '"()"', expected: "true", call: 'String(isValid("()"))' },
      { input: '"()[]{}"', expected: "true", call: 'String(isValid("()[]{}"))' },
      { input: '"(]"', expected: "false", call: 'String(isValid("(]"))' },
      { input: '"([)]"', expected: "false", call: 'String(isValid("([)]"))' },
    ],
  },
  // --- Medium ---
  {
    title: "Two Sum",
    difficulty: "Medium",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here

}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Your solution here

}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]", call: "JSON.stringify(twoSum([2,7,11,15], 9))" },
      { input: "[3,2,4], 6", expected: "[1,2]", call: "JSON.stringify(twoSum([3,2,4], 6))" },
      { input: "[3,3], 6", expected: "[0,1]", call: "JSON.stringify(twoSum([3,3], 6))" },
    ],
  },
  {
    title: "Merge Intervals",
    difficulty: "Medium",
    description:
      "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Your solution here

}`,
      typescript: `function merge(intervals: number[][]): number[][] {
  // Your solution here

}`,
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]", call: "JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]]))" },
      { input: "[[1,4],[4,5]]", expected: "[[1,5]]", call: "JSON.stringify(merge([[1,4],[4,5]]))" },
    ],
  },
  {
    title: "Group Anagrams",
    difficulty: "Medium",
    description:
      'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.',
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      },
      {
        input: 'strs = [""]',
        output: '[[""]]',
      },
      {
        input: 'strs = ["a"]',
        output: '[["a"]]',
      },
    ],
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Your solution here

}`,
      typescript: `function groupAnagrams(strs: string[]): string[][] {
  // Your solution here

}`,
      python: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expected: "3 groups", call: "JSON.stringify(groupAnagrams(['eat','tea','tan','ate','nat','bat']).length)" },
      { input: '[""]', expected: "1", call: 'JSON.stringify(groupAnagrams([""]).length)' },
      { input: '["a"]', expected: "1", call: 'JSON.stringify(groupAnagrams(["a"]).length)' },
    ],
  },
  // --- Hard ---
  {
    title: "LRU Cache",
    difficulty: "Hard",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(capacity) initializes the cache with positive size capacity. get(key) returns the value of the key if it exists, otherwise returns -1. put(key, value) updates the value of the key if it exists, otherwise adds the key-value pair. If the number of keys exceeds the capacity, evict the least recently used key.",
    examples: [
      {
        input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
        output: "[null,null,null,1,null,-1,null,-1,3,4]",
        explanation:
          "The cache capacity is 2. After put(1,1), put(2,2), get(1) returns 1. put(3,3) evicts key 2. get(2) returns -1 (not found).",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    starterCode: {
      javascript: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    // Your solution here

  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Your solution here

  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Your solution here

  }
}`,
      typescript: `class LRUCache {
  constructor(capacity: number) {
    // Your solution here

  }

  get(key: number): number {
    // Your solution here

  }

  put(key: number, value: number): void {
    // Your solution here

  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        # Your solution here
        pass

    def get(self, key: int) -> int:
        # Your solution here
        pass

    def put(self, key: int, value: int) -> None:
        # Your solution here
        pass`,
    },
    testCases: [
      {
        input: "capacity=2, put(1,1), put(2,2), get(1)",
        expected: "1",
        call: "(() => { const c = new LRUCache(2); c.put(1,1); c.put(2,2); return c.get(1); })()",
      },
      {
        input: "capacity=2, put(1,1), put(2,2), put(3,3), get(2)",
        expected: "-1",
        call: "(() => { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); return c.get(2); })()",
      },
    ],
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "Merged array = [1,2,3] and median is 2.",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
  // Your solution here

}`,
      typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Your solution here

}`,
      python: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    # Your solution here
    pass`,
    },
    testCases: [
      { input: "[1,3], [2]", expected: "2", call: "findMedianSortedArrays([1,3], [2])" },
      { input: "[1,2], [3,4]", expected: "2.5", call: "findMedianSortedArrays([1,2], [3,4])" },
    ],
  },
];

export function getProblemsByDifficulty(difficultyValue: number): TechnicalProblem[] {
  let targetDifficulty: Difficulty;
  if (difficultyValue <= 30) targetDifficulty = "Easy";
  else if (difficultyValue <= 60) targetDifficulty = "Medium";
  else targetDifficulty = "Hard";

  const matching = TECHNICAL_PROBLEMS.filter((p) => p.difficulty === targetDifficulty);
  return matching.length > 0 ? matching : TECHNICAL_PROBLEMS;
}

export function getRandomProblem(difficultyValue: number): TechnicalProblem {
  const problems = getProblemsByDifficulty(difficultyValue);
  return problems[Math.floor(Math.random() * problems.length)];
}
