import { describe, it, expect } from 'bun:test';
import { EngagementParser } from '../src/utils/engagement-parser';

describe('EngagementParser', () => {
  describe('parse', () => {
    it('should parse simple numbers', () => {
      expect(EngagementParser.parse('15')).toBe(15);
      expect(EngagementParser.parse('1,500')).toBe(1500);
      expect(EngagementParser.parse('12,345')).toBe(12345);
    });

    it('should parse English suffixes', () => {
      expect(EngagementParser.parse('1.2K')).toBe(1200);
      expect(EngagementParser.parse('15K')).toBe(15000);
      expect(EngagementParser.parse('1.5M')).toBe(1500000);
      expect(EngagementParser.parse('1B')).toBe(1000000000);
    });

    it('should handle spaces before suffix', () => {
      expect(EngagementParser.parse('1.2 K')).toBe(1200);
      expect(EngagementParser.parse('15 K')).toBe(15000);
    });

    it('should parse Thai suffixes', () => {
      expect(EngagementParser.parse('1.2 พัน')).toBe(1200);
      expect(EngagementParser.parse('15 พัน')).toBe(15000);
      expect(EngagementParser.parse('1.5 ล้าน')).toBe(1500000);
    });

    it('should handle text with numbers', () => {
      expect(EngagementParser.parse('15 likes')).toBe(15);
      expect(EngagementParser.parse('ถูกใจ 1.2 พัน')).toBe(1200);
      expect(EngagementParser.parse('15 ความคิดเห็น')).toBe(15);
      expect(EngagementParser.parse('20 แชร์')).toBe(20);
    });

    it('should return 0 for invalid input', () => {
      expect(EngagementParser.parse('')).toBe(0);
      expect(EngagementParser.parse(null)).toBe(0);
      expect(EngagementParser.parse(undefined)).toBe(0);
      expect(EngagementParser.parse('no numbers here')).toBe(0);
    });
  });

  describe('parseAriaLabel', () => {
    it('should parse complex aria-labels', () => {
      expect(EngagementParser.parseAriaLabel('See who reacted to this: 1.2K')).toBe(1200);
      expect(EngagementParser.parseAriaLabel('Liked by John Doe and 1,234 others')).toBe(1235);
      expect(EngagementParser.parseAriaLabel('Liked by John Doe and 1.5K others')).toBe(1501);
    });

    it('should fallback to regular parse if no "and X others" pattern', () => {
      expect(EngagementParser.parseAriaLabel('15 comments')).toBe(15);
      expect(EngagementParser.parseAriaLabel('ถูกใจ 1.2 พัน')).toBe(1200);
    });
  });
});
