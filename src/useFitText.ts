import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UseFitTextOptions, UseFitTextReturn } from './types';
import { calculateOptimalFontSize, getAvailableContentSpace } from './utils';

/**
 * A hook to automatically adjust font size to fit its container
 */
export const useFitText = ({
  minFontSize = 1,
  maxFontSize = 100,
  resolution = 0.5,
  fitMode = 'both',
  lineMode = 'multi',
  debounceDelay = 100
}: UseFitTextOptions = {}): UseFitTextReturn => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const frameRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const calculatingRef = useRef<boolean>(false);
  const prevDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const prevTextContentRef = useRef<string | null>(null);

  const calculateFontSize = useCallback(() => {
    if (!containerRef.current || !textRef.current || calculatingRef.current) {
      return;
    }

    // Store current text content for comparison
    const currentTextContent = textRef.current.textContent || '';

    // Get available content space accounting for padding
    const availableSpace = getAvailableContentSpace(containerRef.current);

    // Don't proceed if container dimensions are zero
    if (availableSpace.width <= 0 || availableSpace.height <= 0) {
      return;
    }

    // Check if dimensions and text content are the same as last calculation
    const prevDimensions = prevDimensionsRef.current;
    if (
      prevDimensions &&
      prevDimensions.width === availableSpace.width &&
      prevDimensions.height === availableSpace.height &&
      prevTextContentRef.current === currentTextContent &&
      fontSize !== maxFontSize // Don't skip if we're using the max font size (initial state)
    ) {
      // Skip calculation if nothing changed
      return;
    }

    // Mark as calculating to prevent concurrent calculations
    calculatingRef.current = true;

    // Store current dimensions and text content for future comparisons
    prevDimensionsRef.current = { ...availableSpace };
    prevTextContentRef.current = currentTextContent;

    // Apply line mode styles to the text element
    if (textRef.current) {
      if (lineMode === 'single') {
        textRef.current.style.whiteSpace = 'nowrap';
        textRef.current.style.overflow = 'hidden';
        textRef.current.style.textOverflow = 'ellipsis';
      } else {
        textRef.current.style.whiteSpace = 'normal';
        textRef.current.style.wordWrap = 'break-word';
        textRef.current.style.overflowWrap = 'break-word';
        textRef.current.style.overflow = 'visible';
        textRef.current.style.textOverflow = 'unset';
      }
    }

    const best = calculateOptimalFontSize(
      textRef.current,
      availableSpace.width,
      availableSpace.height,
      minFontSize,
      maxFontSize,
      resolution,
      fitMode,
      lineMode
    );

    // Only update if the size changed
    if (best !== fontSize) {
      // Apply the best font size
      textRef.current.style.fontSize = `${best}px`;
      setFontSize(best);
    }

    calculatingRef.current = false;
  }, [minFontSize, maxFontSize, resolution, fitMode, lineMode, fontSize]);

  const handleResize = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        calculateFontSize();
      });
    }, debounceDelay);
  }, [calculateFontSize, debounceDelay]);

  // Initial calculation and setup
  useLayoutEffect(() => {
    // Use immediate calculation for initial render
    calculateFontSize();

    // Setup ResizeObserver
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(containerRef.current);
    }

    // Cleanup function
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [calculateFontSize, handleResize]);

  // Recalculate when dependencies change
  useEffect(() => {
    // Reset cached dimensions to force recalculation when params change
    prevDimensionsRef.current = null;

    calculateFontSize();
  }, [minFontSize, maxFontSize, resolution, fitMode, lineMode, calculateFontSize]);

  return { containerRef, textRef, fontSize };
};
