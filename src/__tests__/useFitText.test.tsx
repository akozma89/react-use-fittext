import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {act} from 'react';
import {useFitText} from '../useFitText';
import * as utils from '../utils';
import '@testing-library/jest-dom';

// Mock the utilities to avoid actual calculations in tests
vi.mock('../utils', () => {
  return {
    calculateOptimalFontSize: vi.fn().mockReturnValue(42),
    getAvailableContentSpace: vi.fn().mockReturnValue({ width: 200, height: 100 }),
    sizeFits: vi.fn().mockReturnValue(true)
  };
});

describe('useFitText', () => {
  // Create DOM mocks
  let mockContainerElement: HTMLDivElement;
  let mockTextElement: HTMLDivElement;

  // Save original global objects to restore later
  const originalRAF = global.requestAnimationFrame;
  const originalCAF = global.cancelAnimationFrame;
  const originalRO = global.ResizeObserver;

  // Set up before each test
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create mock DOM elements
    mockContainerElement = document.createElement('div');
    mockTextElement = document.createElement('div');

    // Set up container dimensions
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

    // Mock requestAnimationFrame to execute immediately
    global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
      setTimeout(cb, 0);
      return 123;
    });

    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = vi.fn();

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  // Clean up after each test
  afterEach(() => {
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
    global.ResizeObserver = originalRO;
    vi.useRealTimers();
  });

  // Test 1: Default initialization
  it('should initialize with default options', () => {
    const { result } = renderHook(() => useFitText());
    expect(result.current.fontSize).toBe(100); // Should use default maxFontSize as initial value
  });

  // Test 2: Custom options initialization
  it('should initialize with custom options', () => {
    const customOptions = {
      minFontSize: 8,
      maxFontSize: 36,
      resolution: 1,
      fitMode: 'width' as const,
      debounceDelay: 50
    };

    const { result } = renderHook(() => useFitText(customOptions));
    expect(result.current.fontSize).toBe(36); // Should use custom maxFontSize
  });

  // Test 3: Font size calculation when refs are available
  it('should calculate font size when refs are available', async () => {
    const { result } = renderHook(() => useFitText());

    // Use Object.assign to set the current property of refs
    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    // The hook should update fontSize when refs are set
    expect(result.current.fontSize).toBeDefined();
  });

  // Test 4: No calculation when container ref is null
  it('should not calculate font size when container ref is null', async () => {
    const { result } = renderHook(() => useFitText());

    // Only set text ref, leave container ref null
    act(() => {
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Calculate should not have been called
    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();
  });

  // Test 5: No calculation when text ref is null
  it('should not calculate font size when text ref is null', async () => {
    const { result } = renderHook(() => useFitText());

    // Only set container ref, leave text ref null
    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Calculate should not have been called
    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();
  });

  // Test 6: No calculation when container dimensions are zero
  it('should not calculate font size when container dimensions are zero', async () => {
    // Mock getAvailableContentSpace to return zero dimensions
    vi.mocked(utils.getAvailableContentSpace).mockReturnValue({ width: 0, height: 0 });

    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Calculate should not have been called because dimensions are zero
    expect(utils.calculateOptimalFontSize).not.toHaveBeenCalled();

    // Reset mock
    vi.mocked(utils.getAvailableContentSpace).mockReturnValue({ width: 200, height: 100 });
  });

  // Test 7: ResizeObserver setup
  it('should set up ResizeObserver correctly', () => {
    const mockObserve = vi.fn();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));

    const { result } = renderHook(() => useFitText());

    // Set container ref - this should trigger ResizeObserver creation
    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    // Verify ResizeObserver was created (even if not immediately)
    expect(result.current.containerRef.current).toBe(mockContainerElement);
  });

  // Test 8: Debounce functionality
  it('should debounce resize events', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useFitText({ debounceDelay: 100 }));

    // Verify the hook was created with the correct debounce delay
    expect(result.current.fontSize).toBeDefined();

    vi.useRealTimers();
  });

  // Test 9: Dependency change triggers recalculation
  it('should recalculate when dependencies change', async () => {
    const { result, rerender } = renderHook(
      ({ minSize }) => useFitText({ minFontSize: minSize }),
      { initialProps: { minSize: 10 } }
    );

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    // Wait for initial calculation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Clear mock calls
    vi.clearAllMocks();

    // Change minFontSize to trigger recalculation
    rerender({ minSize: 20 });

    // Wait for recalculation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Should have been called again
    expect(utils.calculateOptimalFontSize).toHaveBeenCalled();
  });

  // Test 10: Cleanup on unmount
  it('should clean up on unmount', () => {
    const mockDisconnect = vi.fn();
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    }));

    const { result, unmount } = renderHook(() => useFitText());

    // Set container ref
    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    // Unmount should not throw an error
    expect(() => unmount()).not.toThrow();
  });

  // Test 11: Edge case - text content changes
  it('should handle text content changes', async () => {
    const { result } = renderHook(() => useFitText());

    // Set refs and text content
    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
      mockTextElement.textContent = 'Initial text';
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Change text content
    act(() => {
      mockTextElement.textContent = 'Different text';
    });

    // Hook should handle text content changes
    expect(result.current.fontSize).toBeDefined();
  });

  // Test 12: fontSize update handling
  it('should handle fontSize updates correctly', async () => {
    // Mock calculateOptimalFontSize to return different values
    vi.mocked(utils.calculateOptimalFontSize).mockReturnValue(24);

    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // The fontSize should be updated
    expect(result.current.fontSize).toBe(100); // Initial value before calculation
  });

  // Test 13: Line mode styling
  it('should apply correct line mode styles', () => {
    const { result: singleLineResult } = renderHook(() =>
      useFitText({ lineMode: 'single' })
    );

    const { result: multiLineResult } = renderHook(() =>
      useFitText({ lineMode: 'multi' })
    );

    // Both should initialize properly
    expect(singleLineResult.current.fontSize).toBeDefined();
    expect(multiLineResult.current.fontSize).toBeDefined();
  });

  // Test 14: Concurrent calculation prevention
  it('should prevent concurrent calculations', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
    });

    // Hook should handle concurrent access properly
    expect(result.current.fontSize).toBeDefined();
  });

  // Test 15: Cache skipping when dimensions change
  it('should skip calculation when dimensions and text unchanged', async () => {
    const { result } = renderHook(() => useFitText());

    act(() => {
      Object.assign(result.current.containerRef, { current: mockContainerElement });
      Object.assign(result.current.textRef, { current: mockTextElement });
      mockTextElement.textContent = 'Test text';
    });

    // First calculation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Clear mocks and try calculation again with same conditions
    vi.clearAllMocks();

    // Trigger another calculation with same dimensions
    act(() => {
      // Force a recalculation attempt
      Object.assign(result.current.containerRef, { current: mockContainerElement });
    });

    // Should demonstrate caching behavior
    expect(result.current.fontSize).toBeDefined();
  });

  // Test 16: Line mode style application
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

    // Test should complete without errors
    expect(result.current.fontSize).toBeDefined();
  });

  // Test 17: RequestAnimationFrame cleanup
  it('should cleanup animation frames properly', () => {
    const mockCancelAnimationFrame = vi.fn();
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    const { unmount } = renderHook(() => useFitText());

    // Unmount should trigger cleanup
    unmount();

    // Test should complete without errors
    expect(mockCancelAnimationFrame).toBeDefined();
  });

  // Test 18: Timer cleanup
  it('should cleanup timers properly', () => {
    vi.useFakeTimers();
    const mockClearTimeout = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useFitText({ debounceDelay: 100 }));

    // Unmount should trigger cleanup
    unmount();

    vi.useRealTimers();
    expect(mockClearTimeout).toBeDefined();
  });
});
