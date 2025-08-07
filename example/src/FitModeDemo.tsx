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

  const wideContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });
  const tallContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });
  const squareContainer = useFitText({ fitMode: 'both', minFontSize: 8, maxFontSize: 40 });

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
          <div
            className="w-56 h-24 border-2 border-gray-600 p-3 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
            ref={bothMode.containerRef as React.RefObject<HTMLDivElement>}
          >
            <span
              className="block text-center break-words font-medium"
              ref={bothMode.textRef as React.RefObject<HTMLSpanElement>}
            >
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
              ⚠️ May exceed container height<br/>
              ⚠️ Use with flexible height layouts
            </p>
          </div>
          <div
            className="w-56 h-24 border-2 border-gray-600 p-3 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
            ref={widthMode.containerRef as React.RefObject<HTMLDivElement>}
          >
            <span
              className="block text-center break-words font-medium"
              ref={widthMode.textRef as React.RefObject<HTMLSpanElement>}
            >
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
              ⚠️ May exceed container width<br/>
              ⚠️ Good for vertical layouts
            </p>
          </div>
          <div
            className="w-56 h-24 border-2 border-gray-600 p-3 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
            ref={heightMode.containerRef as React.RefObject<HTMLDivElement>}
          >
            <span
              className="block text-center break-words font-medium"
              ref={heightMode.textRef as React.RefObject<HTMLSpanElement>}
            >
              {sampleText}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Different Container Shapes</h3>
        <p className="text-gray-600 mb-6">
          See how 'both' mode adapts to different container aspect ratios with longer text.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-purple-700">Wide Container (400×80px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font size: {wideContainer.fontSize.toFixed(1)}px</p>
            <div
              className="w-full h-20 border-2 border-gray-600 p-3 flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={wideContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center break-words font-medium"
                ref={wideContainer.textRef as React.RefObject<HTMLSpanElement>}
              >
                {longText}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-purple-700">Tall Container (120×200px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font size: {tallContainer.fontSize.toFixed(1)}px</p>
            <div
              className="w-32 h-48 border-2 border-gray-600 p-3 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={tallContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center break-words font-medium"
                ref={tallContainer.textRef as React.RefObject<HTMLSpanElement>}
              >
                {longText}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-purple-700">Square Container (180×180px)</h4>
            <p className="text-sm text-gray-600 mb-2">Font size: {squareContainer.fontSize.toFixed(1)}px</p>
            <div
              className="w-44 h-44 border-2 border-gray-600 p-3 mx-auto flex items-center justify-center bg-gray-50 overflow-hidden rounded-lg"
              ref={squareContainer.containerRef as React.RefObject<HTMLDivElement>}
            >
              <span
                className="block text-center break-words font-medium"
                ref={squareContainer.textRef as React.RefObject<HTMLSpanElement>}
              >
                {longText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold mb-3 text-purple-900">🎯 'both' Mode</h4>
          <ul className="text-sm space-y-1 text-purple-800">
            <li>• Cards and fixed containers</li>
            <li>• Dashboard widgets</li>
            <li>• Responsive design</li>
            <li>• Most common use case</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3 text-blue-900">📏 'width' Mode</h4>
          <ul className="text-sm space-y-1 text-blue-800">
            <li>• Horizontal banners</li>
            <li>• Navigation items</li>
            <li>• Auto-height containers</li>
            <li>• Single-line emphasis</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-3 text-green-900">📐 'height' Mode</h4>
          <ul className="text-sm space-y-1 text-green-800">
            <li>• Sidebar content</li>
            <li>• Vertical tabs</li>
            <li>• Auto-width containers</li>
            <li>• Height-constrained areas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
