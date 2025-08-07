import { RefObject } from 'react';

export type FitMode = 'width' | 'height' | 'both';
export type LineMode = 'single' | 'multi';

export interface UseFitTextOptions {
  /**
   * The minimum font size in pixels
   * @default 1
   */
  minFontSize?: number;

  /**
   * The maximum font size in pixels
   * @default 100
   */
  maxFontSize?: number;

  /**
   * The resolution of the binary search algorithm
   * @default 0.5
   */
  resolution?: number;

  /**
   * The fit mode: width, height, or both
   * @default 'both'
   */
  fitMode?: FitMode;

  /**
   * The line mode: single line or multi line
   * @default 'multi'
   */
  lineMode?: LineMode;

  /**
   * Debounce delay in ms for resize updates
   * @default 100
   */
  debounceDelay?: number;
}

export interface UseFitTextReturn {
  /**
   * Ref to be applied to the container element
   */
  containerRef: RefObject<HTMLElement>;

  /**
   * Ref to be applied to the text element
   */
  textRef: RefObject<HTMLElement>;

  /**
   * The calculated font size
   */
  fontSize: number;
}
