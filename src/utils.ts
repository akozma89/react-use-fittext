import { FitMode, LineMode } from './types';

/**
 * Get the available content dimensions after accounting for padding
 *
 * @param element The element to measure
 * @returns Object with available width and height
 */
export const getAvailableContentSpace = (
  element: HTMLElement
): { width: number; height: number } => {
  const computedStyle = window.getComputedStyle(element);

  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

  // For clientWidth/clientHeight, padding is already included, but not border or margin
  const availableWidth = element.clientWidth - paddingLeft - paddingRight;
  const availableHeight = element.clientHeight - paddingTop - paddingBottom;

  return {
    width: Math.max(0, availableWidth),
    height: Math.max(0, availableHeight)
  };
};

/**
 * Determines if the text fits within the container based on the fit mode
 *
 * @param textSize The text element size
 * @param containerWidth The width of the container
 * @param containerHeight The height of the container
 * @param fitMode The fit mode to use
 * @returns Whether the text fits within the container
 */
export const sizeFits = (
  textSize: { width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode
): boolean => {
  const fitsWidth = fitMode === 'height' || textSize.width <= containerWidth;
  const fitsHeight = fitMode === 'width' || textSize.height <= containerHeight;

  return fitsWidth && fitsHeight;
};

/**
 * Cache for previously calculated font sizes
 * Structure: Map<cacheKey, { fontSize: number, timestamp: number }>
 */
const fontSizeCache = new Map<string, { fontSize: number; timestamp: number }>();
const CACHE_LIFETIME_MS = 30000; // 30 seconds cache lifetime

/**
 * Performs binary search to find optimal font size
 */
const binarySearchFontSize = (
  clone: HTMLElement,
  low: number,
  high: number,
  resolution: number,
  containerWidth: number,
  containerHeight: number,
  fitMode: FitMode,
): number => {
  let bestSize = low;
  let iterations = 0;
  const maxIterations = 20; // Always use precise mode with full iterations

  // No buffers needed for precise mode
  while (iterations < maxIterations && high - low > resolution) {
    const mid = (low + high) / 2; // Always use precise decimal values

    clone.style.fontSize = `${mid}px`;
    const currentWidth = clone.scrollWidth;
    const currentHeight = clone.scrollHeight;

    if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
      bestSize = mid;
      low = mid + resolution; // Use resolution for precise stepping
    } else {
      high = mid - resolution; // Use resolution for precise stepping
    }

    iterations++;
  }

  return bestSize;
};

/**
 * Function to calculate the optimal font size using precise binary search
 *
 * @param textElement The text element to resize
 * @param containerWidth The width of the container
 * @param containerHeight The height of the container
 * @param minFontSize The minimum font size
 * @param maxFontSize The maximum font size
 * @param resolution The precision of the search
 * @param fitMode The fit mode to use
 * @param lineMode The line mode to use (single or multi)
 * @returns The optimal font size
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
  // Generate a cache key based on inputs and text content (no performance flag needed)
  const text = textElement.textContent || '';
  const textSample = text.length > 50 ? text.substring(0, 50) + text.length : text;
  const cacheKey = `${Math.round(containerWidth)},${Math.round(containerHeight)},${textSample},${fitMode},${lineMode}`;

  // Check cache with expiration
  const now = Date.now();
  const cached = fontSizeCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_LIFETIME_MS)) {
    return cached.fontSize;
  }

  // Clean up old cache entries occasionally
  if (Math.random() < 0.001) {
    const expiredTime = now - CACHE_LIFETIME_MS;
    for (const [key, entry] of fontSizeCache.entries()) {
      if (entry.timestamp < expiredTime) {
        fontSizeCache.delete(key);
      }
    }
  }

  // Create a clone for testing
  const clone = textElement.cloneNode(true) as HTMLElement;
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
    ${lineMode === 'single'
      ? 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'
      : 'white-space: normal; word-wrap: break-word; overflow-wrap: break-word;'
    }
  `;

  document.body.appendChild(clone);

  try {
    // For single-line mode
    if (lineMode === 'single') {
      let bestSize = minFontSize;

      // Quick check: if maxFontSize fits, use it
      clone.style.fontSize = `${maxFontSize}px`;
      let currentWidth = clone.scrollWidth;
      let currentHeight = clone.scrollHeight;

      if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
        bestSize = maxFontSize;
      } else {
        // Binary search for the largest that fits
        let low = minFontSize;
        let high = maxFontSize;
        let iterations = 0;
        const maxIterations = 20; // Always use full precision

        while (iterations < maxIterations && high - low > resolution) {
          const mid = (low + high) / 2; // Always use precise decimal values

          clone.style.fontSize = `${mid}px`;
          currentWidth = clone.scrollWidth;
          currentHeight = clone.scrollHeight;

          if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
            bestSize = mid;
            low = mid + resolution;
          } else {
            high = mid - resolution;
          }

          iterations++;
        }
      }

      // Final clamp
      bestSize = Math.max(minFontSize, Math.min(maxFontSize, bestSize));

      // Cache the result
      fontSizeCache.set(cacheKey, { fontSize: bestSize, timestamp: now });
      return bestSize;
    }

    // For multi-line mode, use initial guess then binary search
    const textLength = text.length;

    // Multi-line estimation
    const containerArea = containerWidth * containerHeight;
    const estimatedCharArea = textLength * 12;
    const areaRatio = Math.sqrt(containerArea / estimatedCharArea);
    let initialGuess = Math.min(maxFontSize, areaRatio * 0.8);

    // Clamp initial guess to bounds
    initialGuess = Math.max(minFontSize, Math.min(maxFontSize, initialGuess));

    // Test initial guess
    clone.style.fontSize = `${initialGuess}px`;
    let currentWidth = clone.scrollWidth;
    let currentHeight = clone.scrollHeight;

    let bestSize: number;

    // Check if initial guess fits
    if (sizeFits({ width: currentWidth, height: currentHeight }, containerWidth, containerHeight, fitMode)) {
      // Initial guess fits, try to grow
      bestSize = binarySearchFontSize(
        clone,
        initialGuess,
        maxFontSize,
        resolution,
        containerWidth,
        containerHeight,
        fitMode,
      );
    } else {
      // Initial guess too large, shrink
      bestSize = binarySearchFontSize(
        clone,
        minFontSize,
        initialGuess,
        resolution,
        containerWidth,
        containerHeight,
        fitMode,
      );
    }

    // Final clamp
    bestSize = Math.max(minFontSize, Math.min(maxFontSize, bestSize));

    // Cache the result
    fontSizeCache.set(cacheKey, { fontSize: bestSize, timestamp: now });

    return bestSize;

  } finally {
    // Clean up
    document.body.removeChild(clone);
  }
};
