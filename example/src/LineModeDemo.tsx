import React from 'react';
import { useFitText } from 'react-use-fittext';

export function LineModeDemo() {
  const sampleText = "This is a comprehensive text example that will clearly demonstrate the significant differences between single line and multi line modes in various container scenarios";
  const shortText = "Short text";
  const containerWidth = 280;
  const containerHeight = 120;

  const multiLineMode = useFitText({
    lineMode: 'multi',
    fitMode: 'both',
    minFontSize: 8,
    maxFontSize: 50
  });

  const singleLineMode = useFitText({
    lineMode: 'single',
    fitMode: 'both',
    minFontSize: 8,
    maxFontSize: 50
  });

  const multiLineShort = useFitText({ lineMode: 'multi', minFontSize: 12, maxFontSize: 60 });
  const singleLineShort = useFitText({ lineMode: 'single', minFontSize: 12, maxFontSize: 60 });

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Line Mode Comparison</h2>
      <p className="mb-6 text-gray-600 text-lg">
        Understanding how <code className="bg-gray-100 px-2 py-1 rounded text-sm">lineMode</code> affects text fitting behavior.
        Container dimensions: <span className="font-semibold">{containerWidth}px × {containerHeight}px</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Multi-line Mode (Recommended)
            </h3>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
              <p className="text-sm text-green-800 mb-2">
                <strong>Font size:</strong> {multiLineMode.fontSize.toFixed(1)}px
              </p>
              <p className="text-sm text-green-700">
                ✅ Text wraps to multiple lines<br/>
                ✅ All content remains visible<br/>
                ✅ Better for readability
              </p>
            </div>
            <div
              className="w-72 h-32 border-2 border-gray-600 p-4 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={multiLineMode.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center w-full font-medium"
                ref={multiLineMode.textRef as React.RefObject<HTMLSpanElement>}
              >
                {sampleText}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Single-line Mode
            </h3>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Font size:</strong> {singleLineMode.fontSize.toFixed(1)}px
              </p>
              <p className="text-sm text-blue-700">
                ⚠️ Text stays on one line<br/>
                ⚠️ May truncate with ellipsis (...)<br/>
                ⚠️ Consistent height behavior
              </p>
            </div>
            <div
              className="w-72 h-32 border-2 border-gray-600 p-4 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={singleLineMode.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center w-full font-medium"
                ref={singleLineMode.textRef as React.RefObject<HTMLSpanElement>}
              >
                {sampleText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Short Text Comparison</h3>
        <p className="text-gray-600 mb-4">
          With shorter text, both modes can achieve larger font sizes since the content fits more easily.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2 text-green-700">Multi-line: "{shortText}"</h4>
            <p className="text-sm text-gray-600 mb-2">Font size: {multiLineShort.fontSize.toFixed(1)}px</p>
            <div
              className="w-72 h-32 border-2 border-gray-600 p-4 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={multiLineShort.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center w-full font-medium"
                ref={multiLineShort.textRef as React.RefObject<HTMLSpanElement>}
              >
                {shortText}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-blue-700">Single-line: "{shortText}"</h4>
            <p className="text-sm text-gray-600 mb-2">Font size: {singleLineShort.fontSize.toFixed(1)}px</p>
            <div
              className="w-72 h-32 border-2 border-gray-600 p-4 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={singleLineShort.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center w-full font-medium"
                ref={singleLineShort.textRef as React.RefObject<HTMLSpanElement>}
              >
                {shortText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-3 text-green-900">✅ When to Use Multi-line</h4>
          <ul className="text-sm space-y-2 text-green-800">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Article content:</strong> Paragraphs and descriptions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>User-generated content:</strong> Comments, reviews, posts</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Dynamic content:</strong> When text length varies significantly</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Accessibility:</strong> Better for screen readers</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-900">📏 When to Use Single-line</h4>
          <ul className="text-sm space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Headers and titles:</strong> Consistent visual height</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Labels and tags:</strong> Short, predictable content</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Buttons and badges:</strong> Fixed container layouts</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Data displays:</strong> Numbers, metrics, short values</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
