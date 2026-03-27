// @ts-ignore
import { describe, it, expect, beforeEach } from 'bun:test';
import { formatTime, formatDate, getRelevanceColor, getRelevanceBadgeColor } from '../lib/utils';

describe('Utility Functions', () => {
  describe('formatTime', () => {
    it('should format milliseconds', () => {
      expect(formatTime(500)).toBe('500ms');
      expect(formatTime(999)).toBe('999ms');
    });

    it('should format seconds', () => {
      expect(formatTime(1000)).toBe('1.00s');
      expect(formatTime(1500)).toBe('1.50s');
      expect(formatTime(2500)).toBe('2.50s');
    });
  });

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2026-03-27T10:00:00.000Z';
      const result = formatDate(date);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRelevanceColor', () => {
    it('should return green for high relevance', () => {
      expect(getRelevanceColor(90)).toContain('green');
      expect(getRelevanceColor(80)).toContain('green');
    });

    it('should return yellow for medium relevance', () => {
      expect(getRelevanceColor(70)).toContain('yellow');
      expect(getRelevanceColor(60)).toContain('yellow');
    });

    it('should return red for low relevance', () => {
      expect(getRelevanceColor(50)).toContain('red');
      expect(getRelevanceColor(30)).toContain('red');
    });
  });

  describe('getRelevanceBadgeColor', () => {
    it('should return green background for high relevance', () => {
      expect(getRelevanceBadgeColor(90)).toBe('bg-green-500');
      expect(getRelevanceBadgeColor(80)).toBe('bg-green-500');
    });

    it('should return yellow background for medium relevance', () => {
      expect(getRelevanceBadgeColor(70)).toBe('bg-yellow-500');
      expect(getRelevanceBadgeColor(60)).toBe('bg-yellow-500');
    });

    it('should return red background for low relevance', () => {
      expect(getRelevanceBadgeColor(50)).toBe('bg-red-500');
      expect(getRelevanceBadgeColor(30)).toBe('bg-red-500');
    });
  });
});
