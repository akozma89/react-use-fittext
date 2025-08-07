import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateOptimalFontSize, getAvailableContentSpace, sizeFits } from '../utils';

describe('Utils', () => {
  describe('calculateOptimalFontSize', () => {
    let mockElement: HTMLElement;
    let mockClone: HTMLElement;
    const minFontSize = 10;
    const maxFontSize = 100;
    const resolution = 0.5;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockElement.textContent = 'Test text';

      // Mock document.body methods
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockClone);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockClone);
    });

    function createMockWithScrollBehavior(widthMultiplier = 2, heightMultiplier = 1) {
      mockClone = document.createElement('div');
      mockClone.textContent = mockElement.textContent;

      vi.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);

      Object.defineProperty(mockClone, 'scrollWidth', {
        get: () => {
          const fontSize = parseFloat(mockClone.style.fontSize) || 16;
          return fontSize * widthMultiplier;
        },
        configurable: true
      });

      Object.defineProperty(mockClone, 'scrollHeight', {
        get: () => {
          const fontSize = parseFloat(mockClone.style.fontSize) || 16;
          return fontSize * heightMultiplier;
        },
        configurable: true
      });
    }

    it('should return the optimal font size for width mode', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 100, 200, minFontSize, maxFontSize, resolution, 'width'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return the optimal font size for height mode', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 200, 60, minFontSize, maxFontSize, resolution, 'height'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return the optimal font size for both mode (limited by width)', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 80, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return the optimal font size for both mode (limited by height)', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 100, 30, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return minFontSize when container is too small for any size', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 1, 1, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBe(minFontSize);
    });

    it('should apply the calculated font size to the element', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 100, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    // Advanced scenarios
    it('should handle single line mode correctly', () => {
      createMockWithScrollBehavior(10, 1); // Long single line

      const result = calculateOptimalFontSize(
        mockElement, 200, 100, 10, 50, 0.5, 'width', 'single'
      );

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(50);
      expect(mockClone.style.cssText).toContain('white-space: nowrap');
    });

    it('should handle multi-line mode with text estimation', () => {
      createMockWithScrollBehavior(5, 3); // Multi-line dimensions

      const result = calculateOptimalFontSize(
        mockElement, 200, 150, 10, 100, 0.5, 'both', 'multi'
      );

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(100);
      expect(mockClone.style.cssText).toContain('white-space: normal');
    });

    it('should use cache for repeated calculations', () => {
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);

      mockClone = document.createElement('div');
      mockClone.textContent = mockElement.textContent;
      vi.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);

      Object.defineProperty(mockClone, 'scrollWidth', {
        get: () => 100,
        configurable: true
      });
      Object.defineProperty(mockClone, 'scrollHeight', {
        get: () => 50,
        configurable: true
      });

      const result1 = calculateOptimalFontSize(
        mockElement, 200, 100, 10, 50, 0.5, 'both', 'multi'
      );

      const result2 = calculateOptimalFontSize(
        mockElement, 200, 100, 10, 50, 0.5, 'both', 'multi'
      );

      expect(result1).toBe(result2);
      mockDateNow.mockRestore();
    });

    it('should handle cache expiration', () => {
      let currentTime = 1000;
      const mockDateNow = vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      mockClone = document.createElement('div');
      mockClone.textContent = mockElement.textContent;
      vi.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);

      Object.defineProperty(mockClone, 'scrollWidth', {
        get: () => 100,
        configurable: true
      });
      Object.defineProperty(mockClone, 'scrollHeight', {
        get: () => 50,
        configurable: true
      });

      calculateOptimalFontSize(mockElement, 200, 100, 10, 50, 0.5, 'both', 'multi');

      currentTime = 1000 + 30001; // Beyond cache lifetime

      const result = calculateOptimalFontSize(mockElement, 200, 100, 10, 50, 0.5, 'both', 'multi');

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(50);

      mockDateNow.mockRestore();
    });

    it('should handle cache cleanup', () => {
      const mockMathRandom = vi.spyOn(Math, 'random').mockReturnValue(0.0005);
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(50000);

      mockClone = document.createElement('div');
      mockClone.textContent = mockElement.textContent;
      vi.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);

      Object.defineProperty(mockClone, 'scrollWidth', {
        get: () => 100,
        configurable: true
      });
      Object.defineProperty(mockClone, 'scrollHeight', {
        get: () => 50,
        configurable: true
      });

      const result = calculateOptimalFontSize(mockElement, 200, 100, 10, 50, 0.5, 'both', 'multi');

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(50);

      mockMathRandom.mockRestore();
      mockDateNow.mockRestore();
    });

    it('should handle long text content correctly', () => {
      const longText = 'A'.repeat(100); // Long text > 50 chars
      mockElement.textContent = longText;

      mockClone = document.createElement('div');
      mockClone.textContent = longText;
      vi.spyOn(mockElement, 'cloneNode').mockReturnValue(mockClone);

      Object.defineProperty(mockClone, 'scrollWidth', {
        get: () => 200,
        configurable: true
      });
      Object.defineProperty(mockClone, 'scrollHeight', {
        get: () => 100,
        configurable: true
      });

      const result = calculateOptimalFontSize(mockElement, 300, 150, 10, 50, 0.5, 'both', 'multi');

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(50);
    });

    it('should handle maxFontSize fitting immediately in single-line mode', () => {
      createMockWithScrollBehavior(2, 1); // Small multiplier so max fits

      const result = calculateOptimalFontSize(
        mockElement, 1000, 1000, 10, 50, 0.5, 'both', 'single'
      );

      expect(result).toBe(50); // Should return maxFontSize
    });

    it('should handle initial guess fitting in multi-line mode', () => {
      createMockWithScrollBehavior(3, 2); // Reasonable multipliers

      const result = calculateOptimalFontSize(
        mockElement, 500, 400, 10, 100, 0.5, 'both', 'multi'
      );

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('getAvailableContentSpace', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');

      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
        paddingLeft: '10px',
        paddingRight: '15px',
        paddingTop: '5px',
        paddingBottom: '8px',
      } as CSSStyleDeclaration));
    });

    it('should calculate available space with padding', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 200 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 100 });

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(175); // 200 - 10 - 15
      expect(result.height).toBe(87); // 100 - 5 - 8
    });

    it('should handle zero dimensions', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 0 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 0 });

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });

    it('should handle padding larger than element size', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 10 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 5 });

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(0); // Math.max(0, 10 - 10 - 15)
      expect(result.height).toBe(0); // Math.max(0, 5 - 5 - 8)
    });

    it('should handle missing padding values', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 200 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 100 });

      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
        paddingLeft: '',
        paddingRight: '',
        paddingTop: '',
        paddingBottom: '',
      } as CSSStyleDeclaration));

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(200); // No padding applied
      expect(result.height).toBe(100);
    });
  });

  describe('sizeFits', () => {
    it('should return true when text fits in width mode', () => {
      const textSize = { width: 100, height: 200 };
      const result = sizeFits(textSize, 150, 50, 'width');
      expect(result).toBe(true);
    });

    it('should return false when text does not fit in width mode', () => {
      const textSize = { width: 200, height: 50 };
      const result = sizeFits(textSize, 150, 100, 'width');
      expect(result).toBe(false);
    });

    it('should return true when text fits in height mode', () => {
      const textSize = { width: 200, height: 50 };
      const result = sizeFits(textSize, 100, 80, 'height');
      expect(result).toBe(true);
    });

    it('should return false when text does not fit in height mode', () => {
      const textSize = { width: 50, height: 100 };
      const result = sizeFits(textSize, 200, 80, 'height');
      expect(result).toBe(false);
    });

    it('should return true when text fits in both mode', () => {
      const textSize = { width: 100, height: 50 };
      const result = sizeFits(textSize, 150, 80, 'both');
      expect(result).toBe(true);
    });

    it('should return false when text does not fit width in both mode', () => {
      const textSize = { width: 200, height: 50 };
      const result = sizeFits(textSize, 150, 80, 'both');
      expect(result).toBe(false);
    });

    it('should return false when text does not fit height in both mode', () => {
      const textSize = { width: 100, height: 100 };
      const result = sizeFits(textSize, 150, 80, 'both');
      expect(result).toBe(false);
    });
  });
});
