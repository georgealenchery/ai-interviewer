import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle2, XCircle, Circle } from "lucide-react";
import type { CodingProblem, TestCase } from "../../services/api";

type TestResult = {
  passed: boolean;
  actual: string;
  expected: string;
  error?: string;
};

type TechnicalCodeEditorProps = {
  problem: CodingProblem | null;
  questionIndex: number;
  onAllTestsPassed: (passed: boolean) => void;
};

function runTestCase(code: string, functionName: string, testCase: TestCase): TestResult {
  const expected = JSON.stringify(testCase.expectedOutput);
  try {
    // Wrap the user code and return the named function
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${code}; return ${functionName};`)() as (...args: unknown[]) => unknown;
    const result = fn(...testCase.input);
    const actual = JSON.stringify(result);
    return { passed: actual === expected, actual, expected };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { passed: false, actual: "Error", expected, error };
  }
}

function formatValue(val: string): string {
  try {
    return JSON.stringify(JSON.parse(val), null, 0);
  } catch {
    return val;
  }
}

export function TechnicalCodeEditor({ problem, questionIndex, onAllTestsPassed }: TechnicalCodeEditorProps) {
  const [code, setCode] = useState<string>("");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const prevIndexRef = useRef(questionIndex);

  // Reset editor when question changes
  useEffect(() => {
    if (prevIndexRef.current !== questionIndex) {
      prevIndexRef.current = questionIndex;
      setResults(null);
      setHasRun(false);
      onAllTestsPassed(false);
    }
    setCode(problem?.functionSignature ?? "");
  }, [questionIndex, problem]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunTests = () => {
    if (!problem) return;

    const testResults = problem.testCases.map((tc) =>
      runTestCase(code, problem.functionName, tc)
    );

    setResults(testResults);
    setHasRun(true);

    const allPassed = testResults.every((r) => r.passed);
    console.log("Test results:", testResults);
    onAllTestsPassed(allPassed);
  };

  const allPassed = hasRun && results?.every((r) => r.passed);
  const passCount = results?.filter((r) => r.passed).length ?? 0;
  const totalCount = problem?.testCases.length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80 border-b border-white/10 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
          <span className="text-blue-400 font-mono">{problem?.functionName ?? "solution"}.js</span>
          {hasRun && (
            <span className={allPassed ? "text-green-400" : "text-yellow-400"}>
              {passCount}/{totalCount} tests passed
            </span>
          )}
        </div>
        <button
          onClick={handleRunTests}
          disabled={!problem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Run Tests
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ minHeight: "200px" }}>
        <Editor
          height="100%"
          language="javascript"
          value={code}
          onChange={(val) => setCode(val ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "off",
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            tabSize: 2,
            folding: false,
            lineDecorationsWidth: 4,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: "auto", horizontal: "auto" },
          }}
        />
      </div>

      {/* Test Results Panel */}
      <div className="shrink-0 border-t border-white/10 bg-gray-900/80 max-h-52 overflow-y-auto">
        {!hasRun && (
          <div className="px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
            <Circle className="w-3.5 h-3.5" />
            Run your code to see test results
          </div>
        )}

        {hasRun && results && (
          <div className="divide-y divide-white/5">
            {results.map((result, i) => {
              const tc = problem?.testCases[i];
              return (
                <div
                  key={i}
                  className={`px-4 py-2.5 text-xs ${result.passed ? "bg-green-900/10" : "bg-red-900/10"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    )}
                    <span className={result.passed ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                      Test {i + 1}
                    </span>
                    {tc?.description && (
                      <span className="text-gray-500">— {tc.description}</span>
                    )}
                  </div>
                  <div className="ml-5 space-y-0.5 font-mono text-gray-400">
                    <div>
                      <span className="text-gray-500">input:&nbsp;&nbsp;&nbsp;</span>
                      <span className="text-gray-200">{JSON.stringify(tc?.input)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">expected: </span>
                      <span className="text-gray-200">{formatValue(result.expected)}</span>
                    </div>
                    {!result.passed && (
                      <div>
                        <span className="text-gray-500">actual:&nbsp;&nbsp; </span>
                        <span className={result.error ? "text-red-300" : "text-yellow-300"}>
                          {result.error ? `Error: ${result.error}` : formatValue(result.actual)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
