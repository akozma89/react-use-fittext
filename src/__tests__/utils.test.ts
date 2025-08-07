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

    it('should return optimal font size for width mode', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 100, 200, minFontSize, maxFontSize, resolution, 'width'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return optimal font size for height mode', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 200, 60, minFontSize, maxFontSize, resolution, 'height'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return optimal font size for both mode (width limited)', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 80, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return optimal font size for both mode (height limited)', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 100, 30, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return minFontSize when container is too small', () => {
      createMockWithScrollBehavior(2, 1);

      const result = calculateOptimalFontSize(
        mockElement, 1, 1, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBe(minFontSize);
    });

    it('should handle single-line mode', () => {
      createMockWithScrollBehavior(1.5, 1);

      const result = calculateOptimalFontSize(
        mockElement, 150, 100, minFontSize, maxFontSize, resolution, 'both', 'single'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should handle multi-line mode', () => {
      createMockWithScrollBehavior(1.2, 2);

      const result = calculateOptimalFontSize(
        mockElement, 100, 150, minFontSize, maxFontSize, resolution, 'both', 'multi'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should use caching for repeated calculations', () => {
      createMockWithScrollBehavior(2, 1);

      const result1 = calculateOptimalFontSize(
        mockElement, 100, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      const result2 = calculateOptimalFontSize(
        mockElement, 100, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result1).toBe(result2);
      expect(result1).toBeGreaterThanOrEqual(minFontSize);
      expect(result1).toBeLessThanOrEqual(maxFontSize);
    });

    it('should return maxFontSize when text fits perfectly', () => {
      createMockWithScrollBehavior(0.5, 0.5);

      const result = calculateOptimalFontSize(
        mockElement, 200, 200, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBe(maxFontSize);
    });

    it('should handle empty text content', () => {
      mockElement.textContent = '';
      createMockWithScrollBehavior(0, 0);

      const result = calculateOptimalFontSize(
        mockElement, 100, 100, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });

    it('should handle very long text', () => {
      mockElement.textContent = 'This is a very long text that should require smaller font sizes to fit properly in the container';
      createMockWithScrollBehavior(3, 2);

      const result = calculateOptimalFontSize(
        mockElement, 100, 50, minFontSize, maxFontSize, resolution, 'both'
      );

      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(maxFontSize);
    });
  });

  describe('getAvailableContentSpace', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      Object.defineProperty(mockElement, 'clientWidth', { value: 200, configurable: true });
      Object.defineProperty(mockElement, 'clientHeight', { value: 100, configurable: true });

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        paddingLeft: '10px',
        paddingRight: '15px',
        paddingTop: '5px',
        paddingBottom: '8px'
      } as CSSStyleDeclaration);
    });

    it('should calculate available space with padding', () => {
      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(175);
      expect(result.height).toBe(87);
    });

    it('should handle zero padding', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        paddingBottom: '0px'
      } as CSSStyleDeclaration);

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should handle invalid padding values', () => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        paddingLeft: 'invalid',
        paddingRight: 'invalid',
        paddingTop: 'invalid',
        paddingBottom: 'invalid'
      } as CSSStyleDeclaration);

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it('should return zero for negative dimensions', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 20, configurable: true });
      Object.defineProperty(mockElement, 'clientHeight', { value: 10, configurable: true });

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        paddingLeft: '30px',
        paddingRight: '30px',
        paddingTop: '30px',
        paddingBottom: '30px'
      } as CSSStyleDeclaration);

      const result = getAvailableContentSpace(mockElement);

      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });
  });

  describe('sizeFits', () => {
    it('should return true when text fits in both dimensions', () => {
      const result = sizeFits({ width: 50, height: 30 }, 100, 50, 'both');
      expect(result).toBe(true);
    });

    it('should return false when text exceeds width in both mode', () => {
      const result = sizeFits({ width: 150, height: 30 }, 100, 50, 'both');
      expect(result).toBe(false);
    });

    it('should return false when text exceeds height in both mode', () => {
      const result = sizeFits({ width: 50, height: 60 }, 100, 50, 'both');
      expect(result).toBe(false);
    });

    it('should ignore height when in width mode', () => {
      const result = sizeFits({ width: 50, height: 100 }, 100, 50, 'width');
      expect(result).toBe(true);
    });

    it('should ignore width when in height mode', () => {
      const result = sizeFits({ width: 150, height: 30 }, 100, 50, 'height');
      expect(result).toBe(true);
    });

    it('should return false when width exceeds in width mode', () => {
      const result = sizeFits({ width: 150, height: 30 }, 100, 50, 'width');
      expect(result).toBe(false);
    });

    it('should return false when height exceeds in height mode', () => {
      const result = sizeFits({ width: 50, height: 60 }, 100, 50, 'height');
      expect(result).toBe(false);
    });
  });
});
