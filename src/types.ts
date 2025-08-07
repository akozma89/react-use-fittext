import { RefObject } from 'react';

export type FitMode = 'width' | 'height' | 'both';
export type LineMode = 'single' | 'multi';

export interface UseFitTextOptions {
  /** Minimum font size in pixels @default 1 */
  minFontSize?: number;

  /** Maximum font size in pixels @default 100 */
  maxFontSize?: number;

  /** Binary search resolution @default 0.5 */
  resolution?: number;

  /** Fit mode: width, height, or both @default 'both' */
  fitMode?: FitMode;

  /** Line mode: single line or multi line @default 'multi' */
  lineMode?: LineMode;

  /** Debounce delay in ms for resize updates @default 100 */
  debounceDelay?: number;
}

export interface UseFitTextReturn {
  /** Ref to be applied to the container element */
  containerRef: RefObject<HTMLElement>;

  /** Ref to be applied to the text element */
  textRef: RefObject<HTMLElement>;

  /** The calculated font size */
  fontSize: number;
}
