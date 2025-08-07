export function Description() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <p className="text-gray-700 mb-4 text-lg leading-relaxed">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">react-use-fittext</code> is a powerful React hook that automatically adjusts font size to fit text within its container.
          Perfect for responsive designs, dynamic content, dashboards, and maintaining consistent layouts across different screen sizes.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-1">🎯 Responsive Design</h4>
            <p className="text-sm text-blue-800">Automatically adapts to any container size</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-1">⚡ High Performance</h4>
            <p className="text-sm text-green-800">Optimized with caching and debouncing</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-1">🔧 Flexible Options</h4>
            <p className="text-sm text-purple-800">Multiple fit modes and configurations</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">API Reference</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Prop</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Default</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">minFontSize</td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">1</td>
              <td className="px-4 py-3 text-sm text-gray-600">Minimum font size in pixels. Prevents text from becoming unreadable.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">maxFontSize</td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">100</td>
              <td className="px-4 py-3 text-sm text-gray-600">Maximum font size in pixels. Prevents text from becoming too large.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">resolution</td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">0.5</td>
              <td className="px-4 py-3 text-sm text-gray-600">Precision of font size calculation. Lower values = more precise but slower.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">fitMode</td>
              <td className="px-4 py-3 text-sm text-gray-600">'width' | 'height' | 'both'</td>
              <td className="px-4 py-3 text-sm text-gray-600">'both'</td>
              <td className="px-4 py-3 text-sm text-gray-600">Constraint mode: fit to width only, height only, or both dimensions.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">lineMode</td>
              <td className="px-4 py-3 text-sm text-gray-600">'single' | 'multi'</td>
              <td className="px-4 py-3 text-sm text-gray-600">'multi'</td>
              <td className="px-4 py-3 text-sm text-gray-600">Text wrapping: single line with ellipsis or multiple lines.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-gray-900">debounceDelay</td>
              <td className="px-4 py-3 text-sm text-gray-600">number</td>
              <td className="px-4 py-3 text-sm text-gray-600">100</td>
              <td className="px-4 py-3 text-sm text-gray-600">Delay in ms before recalculating on resize. Improves performance.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-4 mt-8 text-gray-800 border-b pb-2">Quick Start</h3>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { useFitText } from 'react-use-fittext';

function ResponsiveTitle() {
  const { containerRef, textRef, fontSize } = useFitText({
    minFontSize: 16,
    maxFontSize: 72,
    fitMode: 'both',
    lineMode: 'single'
  });

  return (
    <div 
      ref={containerRef} 
      className="w-full h-24 border rounded p-4"
    >
      <h1 ref={textRef} className="font-bold text-center">
        Dynamic Title That Always Fits!
      </h1>
    </div>
  );
}`}
        </pre>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">💡 Use Cases</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span><strong>Dashboard widgets:</strong> Numbers and KPIs that scale with container size</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span><strong>Card titles:</strong> Headlines that always fit their containers</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span><strong>Responsive logos:</strong> Text-based logos that scale appropriately</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span><strong>Mobile interfaces:</strong> Text that adapts to different screen sizes</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span><strong>Data visualization:</strong> Labels that scale with chart dimensions</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">⚠️ Best Practices</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Set reasonable <code className="bg-gray-100 px-1 rounded">min/maxFontSize</code> to maintain readability</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Use <code className="bg-gray-100 px-1 rounded">lineMode: 'single'</code> for titles and labels</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Apply padding to containers to prevent edge-touching text</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Test with various text lengths and container sizes</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              <span>Consider accessibility: avoid extremely small or large font sizes</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <h4 className="font-semibold text-red-900 mb-2">🚨 Troubleshooting</h4>
        <div className="text-sm text-red-800 space-y-2">
          <p><strong>Text not fitting properly?</strong> Check that your container has explicit dimensions (width/height).</p>
          <p><strong>Performance issues?</strong> Increase <code className="bg-red-100 rounded">debounceDelay</code> or <code className="bg-red-100 rounded">resolution</code> values.</p>
          <p className="mt-0"><strong>Font size not updating?</strong> Ensure refs are properly attached to DOM elements, not React components.</p>
        </div>
      </div>
    </div>
  );
}
