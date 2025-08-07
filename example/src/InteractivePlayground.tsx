import React from 'react';
import { useFitText } from 'react-use-fittext';
import { ResizableBox } from './ResizableBox';

interface InteractivePlaygroundProps {
  text: string;
  setText: (text: string) => void;
  fitMode: 'width' | 'height' | 'both';
  setFitMode: (mode: 'width' | 'height' | 'both') => void;
  lineMode: 'single' | 'multi';
  setLineMode: (mode: 'single' | 'multi') => void;
  minFontSize: number;
  setMinFontSize: (size: number) => void;
  maxFontSize: number;
  setMaxFontSize: (size: number) => void;
  debounceDelay: number;
  setDebounceDelay: (delay: number) => void;
}

export function InteractivePlayground({
  text,
  setText,
  fitMode,
  setFitMode,
  lineMode,
  setLineMode,
  minFontSize,
  setMinFontSize,
  maxFontSize,
  setMaxFontSize,
  debounceDelay,
  setDebounceDelay
}: InteractivePlaygroundProps) {
  const { containerRef, textRef, fontSize } = useFitText({
    minFontSize,
    maxFontSize,
    fitMode,
    lineMode,
    debounceDelay,
  });

  // Quick preset texts for testing
  const presetTexts = [
    "Short text",
    "This is a medium length text example",
    "This is a comprehensive text example that will clearly demonstrate how the hook behaves with longer content across different container sizes and configurations",
    "🎯 Performance Dashboard\n📊 Key Metrics\n💡 Insights",
    "BRAND LOGO",
    "Error: Something went wrong. Please try again later or contact support.",
    "1,234,567",
    "SALE 50% OFF"
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Interactive Playground</h2>
        <p className="text-gray-600">
          Experiment with different settings and see how the text adapts in real-time.
          Drag the container corners to test responsiveness!
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2 flex items-center">
          <span className="text-2xl mr-2">⚙️</span>
          Configuration Controls
        </h3>

        <div className="space-y-6">
          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <div className="flex flex-col gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white resize-none"
                placeholder="Enter your text here..."
              />
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 mr-2">Quick presets:</span>
                {presetTexts.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setText(preset)}
                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    title={preset.length > 20 ? preset.substring(0, 20) + '...' : preset}
                  >
                    {preset.length > 15 ? preset.substring(0, 15) + '...' : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex flex-col flex-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fit Mode
              </label>
              <select
                value={fitMode}
                onChange={(e) => setFitMode(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
              >
                <option value="both">Both</option>
                <option value="width">Width</option>
                <option value="height">Height</option>
              </select>
            </div>

            <div className="flex flex-col flex-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Line Mode
              </label>
              <select
                value={lineMode}
                onChange={(e) => setLineMode(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
              >
                <option value="multi">Multi-line</option>
                <option value="single">Single-line</option>
              </select>
            </div>

            <div className="flex flex-col flex-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Font (px)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={minFontSize}
                onChange={(e) => setMinFontSize(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col flex-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Font (px)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={maxFontSize}
                onChange={(e) => setMaxFontSize(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col flex-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debounce (ms)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="10"
                value={debounceDelay}
                onChange={(e) => setDebounceDelay(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col flex-1/6 justify-end">
              <button
                onClick={() => {
                  setText('Resize this container and watch the text adjust to fit perfectly inside!');
                  setFitMode('both');
                  setLineMode('multi');
                  setMinFontSize(10);
                  setMaxFontSize(100);
                  setDebounceDelay(100);
                }}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <strong className="text-blue-900">Current Font Size:</strong>
              <div className="text-xl font-bold text-blue-700">{fontSize.toFixed(1)}px</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <strong className="text-green-900">Text Length:</strong>
              <div className="text-lg font-semibold text-green-700">{text.length} characters</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <strong className="text-purple-900">Configuration:</strong>
              <div className="text-sm text-purple-700">
                {fitMode} fit, {lineMode}-line
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Container */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="text-2xl mr-2">🎯</span>
          Live Demo Container
        </h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Instructions:</strong> Drag the resize handles (corners and edges) to change the container size.
            Watch how the text automatically adjusts its font size to fit perfectly within the container boundaries.
          </p>
        </div>

        <div className="flex justify-center">
          <ResizableBox
            className="rounded-lg border-2 border-blue-300 shadow-lg"
            initialWidth={450}
            initialHeight={250}
          >
            <div
              ref={containerRef as React.RefObject<HTMLDivElement>}
              className="h-full flex items-center justify-center overflow-hidden p-6"
              style={{ boxSizing: 'border-box', width: '100%' }}
            >
              <div
                ref={textRef as React.RefObject<HTMLDivElement>}
                className="text-gray-800 font-semibold text-center leading-tight"
                style={{
                  wordBreak: lineMode === 'single' ? 'keep-all' : 'break-word',
                  whiteSpace: lineMode === 'single' ? 'nowrap' : 'normal'
                }}
              >
                {text}
              </div>
            </div>
          </ResizableBox>
        </div>
      </div>

      {/* Advanced Tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-semibold mb-3 text-emerald-900 flex items-center">
            <span className="text-lg mr-2">💡</span>
            Experimentation Tips
          </h4>
          <ul className="text-sm space-y-2 text-emerald-800">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
              <span>Try extreme container sizes (very wide/tall or very small)</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
              <span>Test with different text lengths using the preset buttons</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
              <span>Compare single-line vs multi-line with the same text</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
              <span>Adjust min/max font sizes to see constraint effects</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2 mt-0.5">•</span>
              <span>Increase debounce delay to see performance optimization</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-semibold mb-3 text-orange-900 flex items-center">
            <span className="text-lg mr-2">🔍</span>
            What to Observe
          </h4>
          <ul className="text-sm space-y-2 text-orange-800">
            <li className="flex items-start">
              <span className="text-orange-600 mr-2 mt-0.5">•</span>
              <span><strong>Font size changes:</strong> Updates in real-time as you resize</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2 mt-0.5">•</span>
              <span><strong>Constraint behavior:</strong> How min/max limits affect sizing</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2 mt-0.5">•</span>
              <span><strong>Fit mode differences:</strong> Text overflow patterns</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2 mt-0.5">•</span>
              <span><strong>Line wrapping:</strong> How text flows in multi-line mode</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2 mt-0.5">•</span>
              <span><strong>Performance:</strong> Smooth vs choppy updates with debouncing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
          <span className="text-lg mr-2">📝</span>
          Current Configuration Code
        </h4>
        <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`const { containerRef, textRef, fontSize } = useFitText({
  minFontSize: ${minFontSize},
  maxFontSize: ${maxFontSize},
  fitMode: '${fitMode}',
  lineMode: '${lineMode}',
  debounceDelay: ${debounceDelay}
});

// Current result: ${fontSize.toFixed(1)}px font size`}
        </pre>
      </div>
    </div>
  );
}
