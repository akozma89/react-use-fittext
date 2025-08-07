# react-use-fittext

A powerful React hook that automatically adjusts font size to fit text within its container. Perfect for responsive typography that scales beautifully across different screen sizes and container dimensions.

[![npm version](https://badge.fury.io/js/react-use-fittext.svg)](https://badge.fury.io/js/react-use-fittext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 📏 **Automatic font sizing** - Text scales to fit perfectly within container bounds
- 🔄 **Responsive by default** - Uses ResizeObserver for real-time container changes
- ⚡️ **High performance** - Optimized with requestAnimationFrame and binary search algorithm
- 📐 **Flexible fit modes** - Fit to width, height, or both dimensions
- 📝 **Multi-line support** - Works seamlessly with single-line and multi-line text
- ⏱️ **Debounced updates** - Configurable debounce for smooth performance
- 🎯 **TypeScript support** - Fully typed with comprehensive type definitions
- 🪶 **Lightweight** - Minimal bundle size with zero dependencies

## 📦 Installation

```bash
npm install react-use-fittext
```

```bash
yarn add react-use-fittext
```

```bash
pnpm add react-use-fittext
```

## 🚀 Quick Start

```jsx
import { useFitText } from 'react-use-fittext';

function ResponsiveText() {
  const { containerRef, textRef, fontSize } = useFitText();

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '300px', 
        height: '200px', 
        border: '1px solid #ccc',
        padding: '16px'
      }}
    >
      <div ref={textRef}>
        This text will automatically resize to fit!
      </div>
    </div>
  );
}
```

## 📖 Advanced Examples

### Single Line Text

```jsx
function SingleLineExample() {
  const { containerRef, textRef } = useFitText({
    lineMode: 'single',
    minFontSize: 12,
    maxFontSize: 60
  });

  return (
    <div ref={containerRef} className="banner">
      <h1 ref={textRef}>BREAKING NEWS</h1>
    </div>
  );
}
```

### Fit Width Only

```jsx
function WidthOnlyExample() {
  const { containerRef, textRef } = useFitText({
    fitMode: 'width',
    maxFontSize: 48
  });

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '600px' }}>
      <p ref={textRef}>
        This text will scale based on container width only,
        allowing vertical overflow if needed.
      </p>
    </div>
  );
}
```

### Performance Optimized

```jsx
function PerformanceExample() {
  const { containerRef, textRef, fontSize } = useFitText({
    debounceDelay: 50,      // Faster response
    resolution: 1,         // Higher precision
    minFontSize: 8,
    maxFontSize: 120
  });

  return (
    <div ref={containerRef} className="dynamic-container">
      <span ref={textRef}>
        Current font size: {fontSize}px
      </span>
    </div>
  );
}
```

### Dynamic Content

```jsx
function DynamicContentExample() {
  const [text, setText] = useState('Initial text');
  const { containerRef, textRef } = useFitText({
    fitMode: 'both',
    debounceDelay: 100
  });

  return (
    <div>
      <input 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type to see text resize..."
      />
      
      <div ref={containerRef} className="text-container">
        <div ref={textRef}>{text}</div>
      </div>
    </div>
  );
}
```

## 📚 API Reference

### `useFitText(options?)`

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `minFontSize` | `number` | `1` | Minimum font size in pixels |
| `maxFontSize` | `number` | `100` | Maximum font size in pixels |
| `resolution` | `number` | `0.5` | Precision of the binary search algorithm (lower = more precise) |
| `fitMode` | `'width' \| 'height' \| 'both'` | `'both'` | Which dimensions to fit the text into |
| `lineMode` | `'single' \| 'multi'` | `'multi'` | Whether to allow text wrapping |
| `debounceDelay` | `number` | `100` | Debounce delay in milliseconds for resize events |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `containerRef` | `RefObject<HTMLElement>` | Attach to the container element |
| `textRef` | `RefObject<HTMLElement>` | Attach to the text element |
| `fontSize` | `number` | Current calculated font size in pixels |

## 🎛️ Fit Modes

### `'both'` (default)
Text scales to fit within both width and height constraints of the container.

### `'width'`
Text scales based only on container width. Height can grow as needed.

### `'height'`
Text scales based only on container height. Width can grow as needed.

## 📝 Line Modes

### `'multi'` (default)
Allows text to wrap across multiple lines. Text will break naturally at word boundaries.

### `'single'`
Forces text to remain on a single line. Long text will be truncated with ellipsis if it exceeds container width.

## ⚡ Performance Tips

1. **Adjust `debounceDelay`** - Lower values (50-100ms) for faster response, higher values (200-300ms) for better performance
2. **Tune `resolution`** - Use `1` for pixel-perfect sizing, `0.5` for good balance, `2-3` for faster calculations
3. **Choose appropriate `fitMode`** - Use `'width'` or `'height'` instead of `'both'` when you only need single-axis fitting
4. **Set reasonable bounds** - Use `minFontSize` and `maxFontSize` to prevent extreme scaling

## 🔧 Common Patterns

### Card Titles
```jsx
const { containerRef, textRef } = useFitText({
  lineMode: 'single',
  fitMode: 'width',
  minFontSize: 14,
  maxFontSize: 24
});
```

### Hero Banners
```jsx
const { containerRef, textRef } = useFitText({
  fitMode: 'both',
  minFontSize: 32,
  maxFontSize: 96,
  debounceDelay: 50
});
```

### Responsive Labels
```jsx
const { containerRef, textRef } = useFitText({
  lineMode: 'single',
  fitMode: 'width',
  minFontSize: 10,
  maxFontSize: 16
});
```

## 🐛 Troubleshooting

**Text not resizing?**
- Ensure the container has defined dimensions (width/height)
- Check that both `containerRef` and `textRef` are properly attached
- Verify the container is visible in the DOM

**Performance issues?**
- Increase `debounceDelay` to reduce calculation frequency
- Increase `resolution` for faster (but less precise) calculations
- Consider using `fitMode: 'width'` or `'height'` instead of `'both'`

**Text overflowing?**
- Check that container has `overflow: hidden` if needed
- Ensure `minFontSize` isn't too large for the container
- Verify container padding is accounted for in your layout

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT © [akozma89](https://github.com/akozma89)
