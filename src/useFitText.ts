import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { UseFitTextOptions, UseFitTextReturn } from './types';
import { calculateOptimalFontSize, getAvailableContentSpace } from './utils';

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
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const frameRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const calculatingRef = useRef<boolean>(false);
  const prevDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const prevTextContentRef = useRef<string | null>(null);
  const initialCalcDoneRef = useRef<boolean>(false);

  const calculateFontSize = useCallback(() => {
    if (!containerRef.current || !textRef.current || calculatingRef.current) {
      return;
    }

    const currentTextContent = textRef.current.textContent || '';
    const availableSpace = getAvailableContentSpace(containerRef.current);

    if (availableSpace.width <= 0 || availableSpace.height <= 0) {
      return;
    }

    const prevDimensions = prevDimensionsRef.current;
    if (
      initialCalcDoneRef.current &&
      prevDimensions &&
      prevDimensions.width === availableSpace.width &&
      prevDimensions.height === availableSpace.height &&
      prevTextContentRef.current === currentTextContent
    ) {
      return;
    }

    calculatingRef.current = true;
    prevDimensionsRef.current = { ...availableSpace };
    prevTextContentRef.current = currentTextContent;

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

    const optimalSize = calculateOptimalFontSize(
      textRef.current,
      availableSpace.width,
      availableSpace.height,
      minFontSize,
      maxFontSize,
      resolution,
      fitMode,
      lineMode
    );

    if (optimalSize !== fontSize) {
      textRef.current.style.fontSize = `${optimalSize}px`;
      setFontSize(optimalSize);
    }

    initialCalcDoneRef.current = true;
    calculatingRef.current = false;
  // fontSize intentionally omitted: the initialCalcDoneRef guard replaces the old
  // `fontSize !== maxFontSize` check, keeping this callback stable across renders so
  // the useLayoutEffect below only reconnects observers when actual options change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFontSize, maxFontSize, resolution, fitMode, lineMode]);

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

  useLayoutEffect(() => {
    prevDimensionsRef.current = null;
    initialCalcDoneRef.current = false;
    calculateFontSize();

    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(containerRef.current);
    }

    if (textRef.current) {
      mutationObserverRef.current = new MutationObserver(handleResize);
      mutationObserverRef.current.observe(textRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserverRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [calculateFontSize, handleResize]);

  return { containerRef, textRef, fontSize };
};
