# react-use-fittext

A React hook to automatically adjust font size to fit text within its container.

## Features

- 📏 Automatically adjusts font size to fit container
- 🔄 Uses ResizeObserver for responsive behavior
- ⚡️ Optimized with requestAnimationFrame and binary search
- 📐 Supports different fit modes: width, height, or both
- ⏱️ Optional debounce for performance
- 📝 Fully supports multi-line text

## Installation

```bash
npm install react-use-fittext
# or
yarn add react-use-fittext
# or
pnpm add react-use-fittext
```

## Usage

```jsx
import { useFitText } from 'react-use-fittext';

function MyComponent() {
  const { containerRef, textRef, fontSize } = useFitText({
    minFontSize: 10,
    maxFontSize: 100,
    fitMode: 'both', // 'width' | 'height' | 'both'
    debounceDelay: 100,
  });

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '300px', 
        height: '200px', 
        border: '1px solid black' 
      }}
    >
      <div ref={textRef}>
        This text will automatically resize to fit the container!
      </div>
    </div>
  );
}
```

## API

### useFitText Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minFontSize` | number | 1 | Minimum font size in pixels |
| `maxFontSize` | number | 100 | Maximum font size in pixels |
| `resolution` | number | 0.5 | Resolution of the binary search algorithm |
| `fitMode` | 'width' \| 'height' \| 'both' | 'both' | Dimension to fit text into |
| `debounceDelay` | number | 100 | Debounce delay in ms for resize updates |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `containerRef` | React.RefObject<HTMLElement> | Ref to be applied to the container element |
| `textRef` | React.RefObject<HTMLElement> | Ref to be applied to the text element |
| `fontSize` | number | The calculated font size |

## License

MIT
