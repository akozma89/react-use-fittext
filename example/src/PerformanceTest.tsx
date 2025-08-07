import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFitText, type FitMode, type LineMode } from 'react-use-fittext';

interface TestConfiguration {
  containerCount: number;
  fitMode: FitMode;
  lineMode: LineMode;
  minFontSize: number;
  maxFontSize: number;
  resolution: number;
  debounceDelay: number;
}

interface TestResult {
  totalTime: number;
  averageTime: number;
  medianTime: number;
  minTime: number;
  maxTime: number;
  containerCount: number;
  configuration: TestConfiguration;
  individualTimes: number[];
  timestamp: number;
}

interface ContainerData {
  id: number;
  text: string;
  width: number;
  height: number;
  category: string;
}

const DEFAULT_CONFIG: TestConfiguration = {
  containerCount: 100,
  fitMode: 'both',
  lineMode: 'multi',
  minFontSize: 1,
  maxFontSize: 100,
  resolution: 0.5,
  debounceDelay: 10,
};

// Predefined test patterns for consistent testing
const TEST_PATTERNS: Array<{ text: string; width: number; height: number; category: string }> = [
  { text: "Short", width: 100, height: 50, category: "Small" },
  { text: "Medium length text", width: 200, height: 80, category: "Medium" },
  { text: "This is a longer text sample that will test multi-line wrapping", width: 300, height: 120, category: "Large" },
  { text: "Very long text content that should wrap multiple lines and test the algorithm's efficiency with complex content", width: 400, height: 160, category: "XLarge" },
  { text: "Single line test", width: 500, height: 40, category: "Wide" },
  { text: "Tall container test with multiple lines", width: 150, height: 200, category: "Tall" },
  { text: "Square", width: 200, height: 200, category: "Square" },
  { text: "Tiny", width: 80, height: 30, category: "Tiny" },
  { text: "Lorem ipsum dolor sit amet consectetur adipiscing elit", width: 350, height: 100, category: "Standard" },
  { text: "🚀 Emoji test with special characters! 💯", width: 250, height: 60, category: "Special" },
];


// Helper functions for statistical calculations
function calculateStandardDeviation(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(x => Math.pow(x - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculatePercentile(numbers: number[], percentile: number): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Test component that actually uses useFitText
const TestContainer: React.FC<{
  data: ContainerData;
  config: TestConfiguration;
  onMeasured: (time: number) => void;
  testRunId: string; // Add this prop to force remount
}> = ({ data, config, onMeasured, testRunId }) => {
  const measureStartRef = useRef<number>(0);
  const hasMeasuredRef = useRef<boolean>(false);

  const { containerRef, textRef, fontSize } = useFitText({
    minFontSize: config.minFontSize,
    maxFontSize: config.maxFontSize,
    resolution: config.resolution,
    fitMode: config.fitMode,
    lineMode: config.lineMode,
    debounceDelay: config.debounceDelay,
  });

  // Reset measurement state when testRunId changes
  useEffect(() => {
    measureStartRef.current = performance.now();
    hasMeasuredRef.current = false;
  }, [testRunId]);

  // Measure when fontSize changes (calculation complete)
  useEffect(() => {
    if (!hasMeasuredRef.current && fontSize !== config.maxFontSize) {
      const measureEnd = performance.now();
      const duration = measureEnd - measureStartRef.current;

      // Log detailed timing info in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Container ${data.id}: ${duration.toFixed(2)}ms, fontSize: ${fontSize}px`);
      }

      onMeasured(duration);
      hasMeasuredRef.current = true;
    }
  }, [fontSize, config.maxFontSize, onMeasured, data.id]);

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
        border: '1px solid #e5e7eb',
        margin: '2px',
        display: 'inline-block',
        verticalAlign: 'top',
        backgroundColor: '#f9fafb',
      }}
    >
      <span ref={textRef as React.RefObject<HTMLSpanElement>}>{data.text}</span>
    </div>
  );
};

export function PerformanceTest() {
  const [config, setConfig] = useState<TestConfiguration>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [showContainers, setShowContainers] = useState(false);
  const [testRunId, setTestRunId] = useState<string>('');

  // Refs to manage test state and cleanup
  const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const measurementHandlerRef = useRef<((time: number) => void) | null>(null);

  const generateContainers = useCallback((count: number): ContainerData[] => {
    return Array.from({ length: count }, (_, index) => {
      const pattern = TEST_PATTERNS[index % TEST_PATTERNS.length];
      return {
        id: index,
        ...pattern,
        // Add slight variations to prevent caching issues
        width: pattern.width + (index % 3) * 5,
        height: pattern.height + (index % 2) * 5,
      };
    });
  }, []);

  // Cleanup function to reset test state
  const cleanupTest = useCallback(() => {
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }
    measurementHandlerRef.current = null;
    // Clean up global handler
    if ((window as any).handleMeasurement) {
      delete (window as any).handleMeasurement;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanupTest;
  }, [cleanupTest]);

  const runPerformanceTest = useCallback(async () => {
    // Clean up any previous test
    cleanupTest();

    // Hide containers first to ensure clean state
    setShowContainers(false);

    // Generate new test run ID to force component remount
    const newTestRunId = `test-${Date.now()}-${Math.random()}`;
    setTestRunId(newTestRunId);

    setIsRunning(true);
    setProgress(0);
    setCurrentTest(null);

    // Wait a frame to ensure state updates are processed
    await new Promise(resolve => requestAnimationFrame(resolve));

    const testContainers = generateContainers(config.containerCount);
    setContainers(testContainers);

    // Clear previous measurements
    const individualTimes: number[] = [];
    let completedCount = 0;
    const startTime = performance.now();

    const handleMeasurement = (time: number) => {
      // Ignore measurements if test is no longer running
      if (!measurementHandlerRef.current) return;

      individualTimes.push(time);
      completedCount++;

      // Update progress
      const progressPercent = (completedCount / config.containerCount) * 100;
      setProgress(progressPercent);

      // Check if all measurements are complete
      if (completedCount === config.containerCount) {
        const totalTime = performance.now() - startTime;
        const sortedTimes = [...individualTimes].sort((a, b) => a - b);

        const result: TestResult = {
          totalTime,
          averageTime: individualTimes.reduce((a, b) => a + b, 0) / individualTimes.length,
          medianTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
          minTime: Math.min(...individualTimes),
          maxTime: Math.max(...individualTimes),
          containerCount: config.containerCount,
          configuration: { ...config },
          individualTimes,
          timestamp: Date.now(),
        };

        setCurrentTest(result);
        setResults(prev => [result, ...prev].slice(0, 10));
        setIsRunning(false);
        setProgress(100);
        cleanupTest();
      }
    };

    // Store the measurement handler
    measurementHandlerRef.current = handleMeasurement;
    (window as any).handleMeasurement = handleMeasurement;

    // Render test containers after setting up measurement handler
    setShowContainers(true);

    // Set a timeout to handle cases where not all containers complete
    activeTimeoutRef.current = setTimeout(() => {
      if (completedCount < config.containerCount) {
        console.warn(`Test completed with only ${completedCount}/${config.containerCount} measurements`);

        if (completedCount > 0) {
          const totalTime = performance.now() - startTime;
          const sortedTimes = [...individualTimes].sort((a, b) => a - b);

          const result: TestResult = {
            totalTime,
            averageTime: individualTimes.reduce((a, b) => a + b, 0) / individualTimes.length,
            medianTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
            minTime: Math.min(...individualTimes),
            maxTime: Math.max(...individualTimes),
            containerCount: completedCount,
            configuration: { ...config },
            individualTimes,
            timestamp: Date.now(),
          };

          setCurrentTest(result);
          setResults(prev => [result, ...prev].slice(0, 10));
        }

        setIsRunning(false);
        setProgress(100);
        cleanupTest();
      }
    }, 30000); // 30 second timeout
  }, [config, generateContainers, cleanupTest]);

  const updateConfig = (updates: Partial<TestConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const clearResults = () => {
    setResults([]);
    setCurrentTest(null);
  };

  const stopTest = () => {
    cleanupTest();
    setIsRunning(false);
    setProgress(0);
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results: results,
      testConfiguration: config,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittext-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">FitText Performance Test Suite</h2>
        <p className="text-blue-100">
          Comprehensive performance testing for the useFitText hook with configurable parameters
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">Test Configuration</h3>

        {/* Basic Settings */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Basic Settings</h4>
          <div className="flex gap-4">
            {/* Container Count */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col flex-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Count
              </label>
              <input
                type="number"
                value={config.containerCount}
                onChange={(e) => updateConfig({ containerCount: Math.max(1, parseInt(e.target.value) || 1) })}
                disabled={isRunning}
                min="1"
                max="10000"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
              {config.containerCount > 1000 && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Large numbers may impact browser performance
                </p>
              )}
            </div>

            {/* Fit Mode */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col flex-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit Mode
              </label>
              <select
                value={config.fitMode}
                onChange={(e) => updateConfig({ fitMode: e.target.value as FitMode })}
                disabled={isRunning}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="both">Both (Width & Height)</option>
                <option value="width">Width Only</option>
                <option value="height">Height Only</option>
              </select>
            </div>

            {/* Line Mode */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col flex-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Mode
              </label>
              <select
                value={config.lineMode}
                onChange={(e) => updateConfig({ lineMode: e.target.value as LineMode })}
                disabled={isRunning}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="multi">Multi-line</option>
                <option value="single">Single-line</option>
              </select>
            </div>
          </div>
        </div>

        {/* Font Size Settings */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Font Size Settings</h4>
          <div className="flex gap-4">
            {/* Min Font Size */}
            <div className="bg-blue-50 p-4 rounded-lg flex flex-col flex-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Font Size (px)
              </label>
              <input
                type="number"
                value={config.minFontSize}
                onChange={(e) => updateConfig({ minFontSize: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                disabled={isRunning}
                min="0.1"
                step="0.1"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>

            {/* Max Font Size */}
            <div className="bg-blue-50 p-4 rounded-lg flex flex-col flex-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Font Size (px)
              </label>
              <input
                type="number"
                value={config.maxFontSize}
                onChange={(e) => updateConfig({ maxFontSize: Math.max(config.minFontSize, parseFloat(e.target.value) || 100) })}
                disabled={isRunning}
                min={config.minFontSize}
                step="1"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4">Performance Settings</h4>
          <div className="flex gap-4">
            {/* Resolution */}
            <div className="bg-green-50 p-4 rounded-lg flex flex-col flex-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <input
                type="number"
                value={config.resolution}
                onChange={(e) => updateConfig({ resolution: Math.max(0.1, parseFloat(e.target.value) || 0.5) })}
                disabled={isRunning}
                min="0.1"
                max="5"
                step="0.1"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Lower values = higher precision, slower performance
              </p>
            </div>

            {/* Debounce Delay */}
            <div className="bg-green-50 p-4 rounded-lg flex flex-col flex-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Debounce Delay (ms)
              </label>
              <input
                type="number"
                value={config.debounceDelay}
                onChange={(e) => updateConfig({ debounceDelay: Math.max(0, parseInt(e.target.value) || 10) })}
                disabled={isRunning}
                min="0"
                max="1000"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Delay before recalculating font size
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={runPerformanceTest}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
          } text-white`}
        >
          {isRunning ? 'Running Test...' : 'Start Performance Test'}
        </button>

        {isRunning && (
          <button
            onClick={stopTest}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Stop Test
          </button>
        )}

        <button
          onClick={() => setShowContainers(!showContainers)}
          disabled={containers.length === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          {showContainers ? 'Hide' : 'Show'} Test Containers
        </button>

        {results.length > 0 && (
          <>
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Export Results
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Results
            </button>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Test Progress</span>
            <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Test Results */}
      {currentTest && (
        <TestResultDisplay result={currentTest} />
      )}

      {/* Results History */}
      {results.length > 1 && (
        <ResultsHistory results={results} />
      )}

      {/* Test Containers */}
      {showContainers && containers.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Test Containers ({containers.length})
          </h3>
          <div className="max-h-96 overflow-y-auto border border-gray-100 p-4">
            {containers.map((container) => (
              <TestContainer
                key={`${container.id}-${testRunId}`} // Use testRunId to force remount
                data={container}
                config={config}
                onMeasured={measurementHandlerRef.current || (() => {})}
                testRunId={testRunId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component to display individual test results
function TestResultDisplay({ result }: { result: TestResult }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Time</p>
          <p className="text-2xl font-mono font-bold text-blue-700">
            {result.totalTime.toFixed(2)}ms
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Average Time</p>
          <p className="text-2xl font-mono font-bold text-green-700">
            {result.averageTime.toFixed(2)}ms
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Median Time</p>
          <p className="text-2xl font-mono font-bold text-purple-700">
            {result.medianTime.toFixed(2)}ms
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Min Time</p>
          <p className="text-2xl font-mono font-bold text-orange-700">
            {result.minTime.toFixed(2)}ms
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Max Time</p>
          <p className="text-2xl font-mono font-bold text-red-700">
            {result.maxTime.toFixed(2)}ms
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Configuration:</strong> {result.configuration.fitMode} fit, {result.configuration.lineMode}-line</p>
        <p><strong>Containers:</strong> {result.containerCount}</p>
        <p><strong>Font Range:</strong> {result.configuration.minFontSize}px - {result.configuration.maxFontSize}px</p>
        <p><strong>Resolution:</strong> {result.configuration.resolution}px</p>
        <p><strong>Performance per Container:</strong> {(result.totalTime / result.containerCount).toFixed(2)}ms per container</p>
      </div>

      {/* Performance Analysis */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <h4 className="font-semibold text-gray-700 mb-2">Performance Analysis</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Variance:</strong> {(result.maxTime - result.minTime).toFixed(2)}ms (Min: {result.minTime.toFixed(2)}ms, Max: {result.maxTime.toFixed(2)}ms)</p>
          <p><strong>Standard Deviation:</strong> {calculateStandardDeviation(result.individualTimes).toFixed(2)}ms</p>
          <p><strong>95th Percentile:</strong> {calculatePercentile(result.individualTimes, 95).toFixed(2)}ms</p>
        </div>
      </div>
    </div>
  );
}

// Component to display results history
function ResultsHistory({ results }: { results: TestResult[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Results History</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Containers</th>
              <th className="text-left py-2">Mode</th>
              <th className="text-right py-2">Total (ms)</th>
              <th className="text-right py-2">Avg (ms)</th>
              <th className="text-right py-2">Median (ms)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.timestamp} className="border-b border-gray-100">
                <td className="py-2 text-gray-600">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-2">{result.containerCount}</td>
                <td className="py-2">
                  {result.configuration.fitMode}/{result.configuration.lineMode}
                </td>
                <td className="py-2 text-right font-mono">{result.totalTime.toFixed(2)}</td>
                <td className="py-2 text-right font-mono">{result.averageTime.toFixed(2)}</td>
                <td className="py-2 text-right font-mono">{result.medianTime.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
