import { FitMode, LineMode } from './types';

interface TextSize {
  width: number;
  height: number;
}

interface CacheEntry {
  fontSize: number;
  timestamp: number;
}

const fontSizeCache = new Map<string, CacheEntry>();
const CACHE_LIFETIME_MS = 30000;
const MAX_ITERATIONS = 20;

// Persistent host for all measurement clones — reused across calls so we never
// append/remove directly on document.body, which is the most expensive reflow point.
let _measurementHost: HTMLElement | null = null;

const getMeasurementHost = (): HTMLElement => {
  if (!_measurementHost || !document.body.contains(_measurementHost)) {
    _measurementHost = document.createElement('div');
    _measurementHost.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;top:0;left:0;width:0;height:0;overflow:visible;';
    document.body.appendChild(_measurementHost);
  }
  return _measurementHost;
};

const FONT_STYLE_PROPS = [
  'fontFamily', 'fontWeight', 'fontStyle', 'fontVariant',
  'letterSpacing', 'textTransform', 'wordSpacing',
] as const;

const copyComputedFontStyles = (source: HTMLElement, target: HTMLElement): void => {
  const computed = window.getComputedStyle(source);

  FONT_STYLE_PROPS.forEach(prop => {
    (target.style as unknown as Record<string, string>)[prop] = computed[prop as keyof CSSStyleDeclaration] as string;
  });

  // lineHeight from getComputedStyle is always a px value (e.g. "125px" at 100px font-size).
  // Copying it directly would freeze the clone's line-height at that px value regardless of
  // what font-size the binary search tries, producing wrong scrollHeight measurements.
  // Convert to a unitless ratio so it scales correctly at every tested font size.
  const computedFontSizePx = parseFloat(computed.fontSize);
  const computedLineHeightPx = parseFloat(computed.lineHeight);
  if (!isNaN(computedLineHeightPx) && !isNaN(computedFontSizePx) && computedFontSizePx > 0) {
    target.style.lineHeight = String(computedLineHeightPx / computedFontSizePx);
  } else {
    target.style.lineHeight = 'normal';
  }
};

export const getAvailableContentSpace = (
  element: HTMLElement
): { width: number; height: number } => {
  const computedStyle = window.getComputedStyle(element);

  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

  return {
    width: Math.max(0, element.clientWidth - paddingLeft - paddingRight),
    height: Math.max(0, element.clientHeight - paddingTop - paddingBottom),
  };
};

export const sizeFits = (
  textSize: TextSize,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): boolean => {
  const fitsWidth = fitMode === 'height' || textSize.width <= containerWidth;
  const fitsHeight = fitMode === 'width' || textSize.height <= containerHeight;
  return fitsWidth && fitsHeight;
};

const binarySearchFontSize = (
  clone: HTMLElement,
  low: number,
  high: number,
  resolution: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): number => {
  let bestSize = low;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS && high - low > resolution) {
    const mid = (low + high) / 2;

    clone.style.fontSize = `${mid}px`;
    const currentWidth = clone.scrollWidth;
    const currentHeight = clone.scrollHeight;

    if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
      bestSize = mid;
      low = mid + resolution;
    } else {
      high = mid - resolution;
    }

    iterations++;
  }

  return bestSize;
};

const cleanupCache = (): void => {
  if (Math.random() < 0.001) {
    const expiredTime = Date.now() - CACHE_LIFETIME_MS;
    for (const [key, entry] of fontSizeCache.entries()) {
      if (entry.timestamp < expiredTime) {
        fontSizeCache.delete(key);
      }
    }
  }
};

const createCacheKey = (
  containerWidth: number,
  containerHeight: number,
  text: string,
  fitMode: FitMode,
  lineMode: LineMode,
  minFontSize: number,
  maxFontSize: number,
  resolution: number,
  fontKey: string
): string => {
  return `${Math.round(containerWidth)},${Math.round(containerHeight)},${minFontSize},${maxFontSize},${resolution},${fitMode},${lineMode},${fontKey},${text}`;
};

const createTestClone = (
  textElement: HTMLElement,
  containerWidth: number,
  lineMode: LineMode
): HTMLElement => {
  const clone = textElement.cloneNode(true) as HTMLElement;

  const lineStyles = lineMode === 'single'
    ? 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'
    : 'white-space: normal; word-wrap: break-word; overflow-wrap: break-word;';

  clone.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${containerWidth}px;
    height: auto;
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    ${lineStyles}
  `;

  copyComputedFontStyles(textElement, clone);
  getMeasurementHost().appendChild(clone);
  return clone;
};

const calculateSingleLineFontSize = (
  clone: HTMLElement,
  minFontSize: number,
  maxFontSize: number,
  resolution: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): number => {
  clone.style.fontSize = `${maxFontSize}px`;
  const currentWidth = clone.scrollWidth;
  const currentHeight = clone.scrollHeight;

  if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
    return maxFontSize;
  }

  return binarySearchFontSize(clone, minFontSize, maxFontSize, resolution, containerWidth, containerHeight, fitMode);
};

const calculateMultiLineFontSize = (
  clone: HTMLElement,
  text: string,
  minFontSize: number,
  maxFontSize: number,
  resolution: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): number => {
  clone.style.fontSize = `${maxFontSize}px`;

  let currentWidth = clone.scrollWidth;
  let currentHeight = clone.scrollHeight;

  if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
    return maxFontSize;
  }

  const containerArea = containerWidth * containerHeight;
  const estimatedCharArea = text.length * 12;
  const areaRatio = Math.sqrt(containerArea / estimatedCharArea);
  const initialGuess = Math.max(minFontSize, Math.min(maxFontSize, areaRatio * 0.8));

  clone.style.fontSize = `${initialGuess}px`;
  currentWidth = clone.scrollWidth;
  currentHeight = clone.scrollHeight;

  if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
    return binarySearchFontSize(clone, initialGuess, maxFontSize, resolution, containerWidth, containerHeight, fitMode);
  } else {
    return binarySearchFontSize(clone, minFontSize, initialGuess, resolution, containerWidth, containerHeight, fitMode);
  }
};

export const calculateOptimalFontSize = (
  textElement: HTMLElement,
  containerWidth: number,
  containerHeight: number,
  minFontSize: number,
  maxFontSize: number,
  resolution: number,
  fitMode: FitMode,
  lineMode: LineMode = 'multi'
): number => {
  const text = textElement.textContent || '';
  const computed = window.getComputedStyle(textElement);
  const fontKey = `${computed.fontFamily}|${computed.fontWeight}|${computed.fontStyle}|${computed.letterSpacing}|${computed.lineHeight}`;
  const cacheKey = createCacheKey(containerWidth, containerHeight, text, fitMode, lineMode, minFontSize, maxFontSize, resolution, fontKey);

  const now = Date.now();
  const cached = fontSizeCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_LIFETIME_MS) {
    return cached.fontSize;
  }

  cleanupCache();

  const clone = createTestClone(textElement, containerWidth, lineMode);

  try {
    const bestSize = lineMode === 'single'
      ? calculateSingleLineFontSize(clone, minFontSize, maxFontSize, resolution, containerWidth, containerHeight, fitMode)
      : calculateMultiLineFontSize(clone, text, minFontSize, maxFontSize, resolution, containerWidth, containerHeight, fitMode);

    const clampedSize = Math.max(minFontSize, Math.min(maxFontSize, bestSize));
    fontSizeCache.set(cacheKey, { fontSize: clampedSize, timestamp: now });
    return clampedSize;
  } finally {
    clone.parentNode?.removeChild(clone);
  }
};
