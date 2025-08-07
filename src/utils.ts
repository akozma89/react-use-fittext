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

/**
 * Calculates available content space after accounting for padding.
 */
export const getAvailableContentSpace = (
  element: HTMLElement
): { width: number; height: number } => {
  const computedStyle = window.getComputedStyle(element);

  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

  const availableWidth = element.clientWidth - paddingLeft - paddingRight;
  const availableHeight = element.clientHeight - paddingTop - paddingBottom;

  return {
    width: Math.max(0, availableWidth),
    height: Math.max(0, availableHeight)
  };
};

/**
 * Determines if text fits within container bounds based on fit mode.
 */
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

/**
 * Performs binary search to find optimal font size.
 */
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

/**
 * Cleans up expired cache entries periodically.
 */
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

/**
 * Creates a cache key for font size calculations.
 */
const createCacheKey = (
  containerWidth: number,
  containerHeight: number,
  text: string,
  fitMode: FitMode,
  lineMode: LineMode
): string => {
  const textSample = text.length > 50 ? text.substring(0, 50) + text.length : text;
  return `${Math.round(containerWidth)},${Math.round(containerHeight)},${textSample},${fitMode},${lineMode}`;
};

/**
 * Creates and configures a clone element for font size testing.
 */
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
    visibility: hidden;
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

  document.body.appendChild(clone);
  return clone;
};

/**
 * Calculates optimal font size for single-line text.
 */
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

  return binarySearchFontSize(
    clone,
    minFontSize,
    maxFontSize,
    resolution,
    containerWidth,
    containerHeight,
    fitMode
  );
};

/**
 * Calculates optimal font size for multi-line text using area estimation.
 */
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
    return binarySearchFontSize(
      clone,
      initialGuess,
      maxFontSize,
      resolution,
      containerWidth,
      containerHeight,
      fitMode
    );
  } else {
    return binarySearchFontSize(
      clone,
      minFontSize,
      initialGuess,
      resolution,
      containerWidth,
      containerHeight,
      fitMode
    );
  }
};

/**
 * Calculates the optimal font size using binary search algorithm.
 *
 * @param textElement - The text element to resize
 * @param containerWidth - Available container width
 * @param containerHeight - Available container height
 * @param minFontSize - Minimum allowed font size
 * @param maxFontSize - Maximum allowed font size
 * @param resolution - Search precision
 * @param fitMode - How to fit the text (width, height, or both)
 * @param lineMode - Single or multi-line text handling
 * @returns Optimal font size in pixels
 */
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
  const cacheKey = createCacheKey(containerWidth, containerHeight, text, fitMode, lineMode);

  const now = Date.now();
  const cached = fontSizeCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_LIFETIME_MS)) {
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
    document.body.removeChild(clone);
  }
};
