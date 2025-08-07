import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateOptimalFontSize } from '../utils';

describe('Utils', () => {
  describe('calculateOptimalFontSize', () => {
    let mockElement: HTMLElement;
    const minFontSize = 10;
    const maxFontSize = 100;
    const resolution = 0.5;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockElement.style.fontSize = '';

      // Mock scrollWidth and scrollHeight based on fontSize
      vi.spyOn(mockElement, 'scrollWidth', 'get').mockImplementation(() => {
        const currentSize = parseFloat(mockElement.style.fontSize) || 0;
        return currentSize * 2; // Simple scaling for test
      });

      vi.spyOn(mockElement, 'scrollHeight', 'get').mockImplementation(() => {
        const currentSize = parseFloat(mockElement.style.fontSize) || 0;
        return currentSize; // Simple scaling for test
      });
    });

    it('should return the optimal font size for width mode', () => {
      // Container can fit text with fontSize <= 50
      const result = calculateOptimalFontSize(
        mockElement,
        100, // width 100 / 2 = max fontSize 50
        200, // height won't matter for width mode
        minFontSize,
        maxFontSize,
        resolution,
        'width'
      );

      // Should find fontSize that fits (just under 50)
      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(50);
    });

    it('should return the optimal font size for height mode', () => {
      // Container can fit text with fontSize <= 60
      const result = calculateOptimalFontSize(
        mockElement,
        200, // width won't matter for height mode
        60, // height 60 = max fontSize 60
        minFontSize,
        maxFontSize,
        resolution,
        'height'
      );

      // Should find fontSize that fits (just under 60)
      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(60);
    });

    it('should return the optimal font size for both mode (limited by width)', () => {
      // Container can fit text with fontSize <= 40 (width is limiting factor)
      const result = calculateOptimalFontSize(
        mockElement,
        80, // width 80 / 2 = max fontSize 40
        100, // height 100 = max fontSize 100
        minFontSize,
        maxFontSize,
        resolution,
        'both'
      );

      // Should find fontSize that fits (just under 40)
      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(40);
    });

    it('should return the optimal font size for both mode (limited by height)', () => {
      // Container can fit text with fontSize <= 30 (height is limiting factor)
      const result = calculateOptimalFontSize(
        mockElement,
        100, // width 100 / 2 = max fontSize 50
        30, // height 30 = max fontSize 30
        minFontSize,
        maxFontSize,
        resolution,
        'both'
      );

      // Should find fontSize that fits (just under 30)
      expect(result).toBeGreaterThanOrEqual(minFontSize);
      expect(result).toBeLessThanOrEqual(30);
    });

    it('should return minFontSize when container is too small for any size', () => {
      // Make both dimensions too small
      const result = calculateOptimalFontSize(
        mockElement,
        5, // width too small for even minFontSize
        5, // height too small for even minFontSize
        minFontSize,
        maxFontSize,
        resolution,
        'both'
      );

      // Should return minFontSize as fallback
      expect(result).toBe(minFontSize);
    });

    it('should apply the calculated font size to the element', () => {
      calculateOptimalFontSize(
        mockElement,
        100,
        100,
        minFontSize,
        maxFontSize,
        resolution,
        'both'
      );

      // Verify fontSize was actually applied to the element
      expect(mockElement.style.fontSize).not.toBe('');
    });
  });
});
