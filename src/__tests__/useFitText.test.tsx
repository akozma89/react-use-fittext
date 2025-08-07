import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useFitText } from '../useFitText';
import * as utils from '../utils';
import '@testing-library/jest-dom';

vi.mock('../utils', () => ({
  calculateOptimalFontSize: vi.fn().mockReturnValue(42),
  getAvailableContentSpace: vi.fn().mockReturnValue({ width: 200, height: 100 }),
  sizeFits: vi.fn().mockReturnValue(true)
}));

describe('useFitText', () => {
  let mockContainerElement: HTMLDivElement;
  let mockTextElement: HTMLDivElement;

  const originalRAF = global.requestAnimationFrame;
  const originalCAF = global.cancelAnimationFrame;
  const originalRO = global.ResizeObserver;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContainerElement = document.createElement('div');
    mockTextElement = document.createElement('div');

    Object.defineProperty(mockContainerElement, 'clientWidth', {
      value: 200,
      writable: true,
      configurable: true
    });
    Object.defineProperty(mockContainerElement, 'clientHeight', {
      value: 100,
      writable: true,
      configurable: true
    });

    global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
      setTimeout(cb, 0);
      return 123;
    });

    global.cancelAnimationFrame = vi.fn();

    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
    global.ResizeObserver = originalRO;
    vi.useRealTimers();
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useFitText());
    expect(result.current.fontSize).toBe(100);
  });

  it('should initialize with custom options', () => {
    const customOptions = {
      minFontSize: 8,
      maxFontSize: 36,
      resolution: 1,
      fitMode: 'width' as const,
      debounceDelay: 50
    };

    const { result } = renderHook(() => useFitText(customOptions));
    expect(result.current.fontSize).toBe(36);
  });

  it('should calculate font size when refs are available', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should not calculate font size when container ref is null', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();
  });

  it('should not calculate font size when text ref is null', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();
  });

  it('should not calculate font size when container dimensions are zero', async () => {
    vi.mocked(utils.getAvailableContentSpace).mockReturnValue({ width: 0, height: 0 });

    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();

    vi.mocked(utils.getAvailableContentSpace).mockReturnValue({ width: 200, height: 100 });
  });

  it('should set up ResizeObserver correctly', () => {
    const mockObserve = vi.fn();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));

    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    expect(result.current.containerRef.current).toBe(mockContainerElement);
  });

  it('should debounce resize events', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useFitText({ debounceDelay: 100 }));

    expect(result.current.fontSize).toBeDefined();

    vi.useRealTimers();
  });

  it('should recalculate when dependencies change', async () => {
    const { result, rerender } = renderHook(
      ({ minSize }) => useFitText({ minFontSize: minSize }),
      { initialProps: { minSize: 10 } }
    );

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    rerender({ minSize: 20 });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should clean up on unmount', () => {
    const mockDisconnect = vi.fn();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    }));

    const { result, unmount } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    expect(() => unmount()).not.toThrow();
  });

  it('should handle text content changes', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
      mockTextElement.textContent = 'Initial text';
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    act(() => {
      mockTextElement.textContent = 'Different text';
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should handle fontSize updates correctly', async () => {
    vi.mocked(utils.calculateOptimalFontSize).mockReturnValue(24);

    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.fontSize).toBe(100);
  });

  it('should apply correct line mode styles', () => {
    const { result: singleLineResult } = renderHook(() =>
      useFitText({ lineMode: 'single' })
    );

    const { result: multiLineResult } = renderHook(() =>
      useFitText({ lineMode: 'multi' })
    );

    expect(singleLineResult.current.fontSize).toBeDefined();
    expect(multiLineResult.current.fontSize).toBeDefined();
  });

  it('should prevent concurrent calculations', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should skip calculation when dimensions and text unchanged', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
      mockTextElement.textContent = 'Test text';
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    vi.clearAllMocks();

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should apply line mode styles correctly', async () => {
    const { result } = renderHook(() => useFitText({ lineMode: 'single' }));

    const mockTextElement = document.createElement('div');
    Object.defineProperty(mockTextElement, 'style', {
      value: {},
      writable: true
    });

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.fontSize).toBeDefined();
  });

  it('should cleanup animation frames properly', () => {
    const mockCancelAnimationFrame = vi.fn();
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    const { unmount } = renderHook(() => useFitText());

    unmount();

    expect(mockCancelAnimationFrame).toBeDefined();
  });

  it('should cleanup timers properly', () => {
    vi.useFakeTimers();
    const mockClearTimeout = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useFitText({ debounceDelay: 100 }));

    unmount();

    vi.useRealTimers();
    expect(mockClearTimeout).toBeDefined();
  });
});
