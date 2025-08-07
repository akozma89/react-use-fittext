import React from 'react';
import { useFitText } from 'react-use-fittext';

export function FitModeDemo() {
  const sampleText = "This text demonstrates how different fit modes affect sizing behavior in containers";
  const longText = "This is a much longer text example that will really show the differences between the three fit modes when dealing with containers that have specific width and height constraints";
  const containerWidth = 220;
  const containerHeight = 100;

  const bothMode = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 50 });
  const widthMode = useFitText({ fitMode: 'width', minFontSize: 8, maxFontSize: 50 });
  const heightMode = useFitText({ fitMode: 'height', minFontSize: 8, maxFontSize: 50 });

  // Examples with different aspect ratios
  const wideContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });
  const tallContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });
  const squareContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });

  const containerStyle = {
    width: containerWidth,
    height: containerHeight,
    border: '2px solid #374151',
    padding: '12px',
    margin: '10px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    borderRadius: '8px'
  };

  const textStyle = {
    display: 'block',
    textAlign: 'center' as const,
    wordBreak: 'break-word' as const,
    fontWeight: '500'
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Fit Mode Comparison</h2>
      <p className="mb-6 text-gray-600 text-lg">
        Understanding how <code className="bg-gray-100 px-2 py-1 rounded text-sm">fitMode</code> controls which dimensions constrain the text.
        Container dimensions: <span className="font-semibold">{containerWidth}px × {containerHeight}px</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            'both' Mode (Default)
          </h3>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-3">
            <p className="text-sm text-purple-800 mb-2">
              <strong>Font size:</strong> {bothMode.fontSize.toFixed(1)}px
            </p>
            <p className="text-sm text-purple-700">
              ✅ Respects width AND height<br/>
              ✅ Never overflows container<br/>
              ✅ Most practical for layouts
            </p>
          </div>
          <div style={containerStyle} ref={bothMode.containerRef as React.RefObject<HTMLDivElement>}>
            <span style={textStyle} ref={bothMode.textRef as React.RefObject<HTMLSpanElement>}>
              {sampleText}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            'width' Mode
          </h3>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Font size:</strong> {widthMode.fontSize.toFixed(1)}px
            </p>
            <p className="text-sm text-blue-700">
              📏 Only fits to width<br/>
              ⚠️ May overflow vertically<br/>
              🎯 Good for horizontal layouts
            </p>
          </div>
          <div style={containerStyle} ref={widthMode.containerRef as React.RefObject<HTMLDivElement>}>
            <span style={textStyle} ref={widthMode.textRef as React.RefObject<HTMLSpanElement>}>
              {sampleText}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold mb-3 text-lg text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            'height' Mode
          </h3>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
            <p className="text-sm text-green-800 mb-2">
              <strong>Font size:</strong> {heightMode.fontSize.toFixed(1)}px
            </p>
            <p className="text-sm text-green-700">
              📐 Only fits to height<br/>
              ⚠️ May overflow horizontally<br/>
              🎯 Good for vertical layouts
            </p>
          </div>
          <div style={containerStyle} ref={heightMode.containerRef as React.RefObject<HTMLDivElement>}>
            <span style={textStyle} ref={heightMode.textRef as React.RefObject<HTMLSpanElement>}>
              {sampleText}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Different Container Shapes</h3>
        <p className="text-gray-600 mb-6">
          How fit mode behavior changes with different container aspect ratios. All using <code className="bg-gray-100 px-1 rounded text-sm">fitMode: 'both'</code>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-semibold mb-2 text-gray-700">Wide Container (400×80px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font: {wideContainer.fontSize.toFixed(1)}px - Width constrains</p>
            <div
              style={{
                width: 400,
                height: 80,
                border: '2px solid #374151',
                padding: '12px',
                margin: '10px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                overflow: 'hidden',
                borderRadius: '8px'
              }}
              ref={wideContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span style={textStyle} ref={wideContainer.textRef as React.RefObject<HTMLSpanElement>}>
                {longText}
              </span>
            </div>
          </div>

          <div className="text-center">
            <h4 className="font-semibold mb-2 text-gray-700">Tall Container (120×200px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font: {tallContainer.fontSize.toFixed(1)}px - Width constrains</p>
            <div
              style={{
                width: 120,
                height: 200,
                border: '2px solid #374151',
                padding: '12px',
                margin: '10px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                overflow: 'hidden',
                borderRadius: '8px'
              }}
              ref={tallContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span style={textStyle} ref={tallContainer.textRef as React.RefObject<HTMLSpanElement>}>
                {longText}
              </span>
            </div>
          </div>

          <div className="text-center">
            <h4 className="font-semibold mb-2 text-gray-700">Square Container (160×160px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font: {squareContainer.fontSize.toFixed(1)}px - Balanced</p>
            <div
              style={{
                width: 160,
                height: 160,
                border: '2px solid #374151',
                padding: '12px',
                margin: '10px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                overflow: 'hidden',
                borderRadius: '8px'
              }}
              ref={squareContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span style={textStyle} ref={squareContainer.textRef as React.RefObject<HTMLSpanElement>}>
                {longText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold mb-3 text-purple-900">🎯 'both' Mode Use Cases</h4>
          <ul className="text-sm space-y-2 text-purple-800">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">•</span>
              <span><strong>Cards & Widgets:</strong> Dashboard components</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">•</span>
              <span><strong>Modal content:</strong> Dialogs and popups</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">•</span>
              <span><strong>Responsive design:</strong> Any size container</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">•</span>
              <span><strong>General purpose:</strong> Most common use case</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-900">📏 'width' Mode Use Cases</h4>
          <ul className="text-sm space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Horizontal banners:</strong> Full-width headers</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Scrollable content:</strong> Vertical overflow OK</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Column layouts:</strong> Fixed width, variable height</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2 mt-0.5">•</span>
              <span><strong>Reading content:</strong> Paragraph width control</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-3 text-green-900">📐 'height' Mode Use Cases</h4>
          <ul className="text-sm space-y-2 text-green-800">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Sidebars:</strong> Fixed height, variable width</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Vertical navigation:</strong> Menu items</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Timeline items:</strong> Consistent height rows</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">•</span>
              <span><strong>Status indicators:</strong> Fixed height badges</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="font-semibold mb-3 text-amber-900 flex items-center">
          <span className="text-xl mr-2">⚡</span>
          Performance & Behavior Notes
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <p className="mb-2"><strong>Calculation Speed:</strong></p>
            <ul className="space-y-1 ml-4">
              <li><code className="bg-amber-100 px-1 rounded">height</code> mode: Fastest (single dimension)</li>
              <li><code className="bg-amber-100 px-1 rounded">width</code> mode: Fast (single dimension)</li>
              <li><code className="bg-amber-100 px-1 rounded">both</code> mode: Slightly slower (both dimensions)</li>
            </ul>
          </div>
          <div>
            <p className="mb-2"><strong>Layout Stability:</strong></p>
            <ul className="space-y-1 ml-4">
              <li><code className="bg-amber-100 px-1 rounded">both</code>: Most predictable, no overflow</li>
              <li><code className="bg-amber-100 px-1 rounded">width</code>: May cause height jumps</li>
              <li><code className="bg-amber-100 px-1 rounded">height</code>: May cause horizontal scrolling</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-amber-700">
          <strong>Recommendation:</strong> Start with <code className="bg-amber-100 px-1 rounded">fitMode: 'both'</code> for most use cases,
          then switch to single-dimension modes only when you specifically need overflow behavior.
        </p>
      </div>
    </div>
  );
}
