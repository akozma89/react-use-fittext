import { Description } from './Description'
import { LineModeDemo } from './LineModeDemo'
import { FitModeDemo } from './FitModeDemo'
import { InteractivePlayground } from './InteractivePlayground'
import { PerformanceTest } from './PerformanceTest.tsx'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-primary-700 bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
            react-use-fittext
          </h1>
          <p className="text-lg text-gray-600">
            A powerful React hook for automatic font size adjustment
          </p>
        </div>

        <Description />
        <LineModeDemo />
        <FitModeDemo />
        <InteractivePlayground />
        <PerformanceTest />
      </div>
    </div>
  )
}

export default App
