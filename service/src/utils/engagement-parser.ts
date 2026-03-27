import pino from 'pino';

const logger = pino();

/**
 * Utility for parsing engagement counts from Facebook's localized and formatted strings.
 * Handles English (K, M, B) and Thai (พัน, ล้าน) suffixes.
 */
export class EngagementParser {
  /**
   * Parse a string into a numeric interaction count.
   * Handles:
   * - "1.2K" -> 1200
   * - "1,500" -> 1500
   * - "1.2M" -> 1200000
   * - "ถูกใจ 1.2 พัน" -> 1200
   * - "15 ความคิดเห็น" -> 15
   * - "See who reacted to this: 1.2K" -> 1200
   */
  static parse(text: string | null | undefined): number {
    if (!text) return 0;

    const cleanText = text.trim();
    if (!cleanText) return 0;

    logger.debug({ text: cleanText }, 'Parsing engagement text');

    // 1. Extract the numeric part with its suffix
    // This regex looks for:
    // - Digits, possibly with dots or commas
    // - Followed by an optional suffix (K, M, B or Thai equivalents)
    // - Supports Thai suffixes: พัน (K), ล้าน (M)
    const numericMatch = cleanText.match(/([\d,.]+\s?[KMBพันล้าน]*)/i);
    if (!numericMatch) return 0;

    let valueStr = numericMatch[1].replace(/,/g, '').toUpperCase();
    
    // Normalize spaces between number and suffix
    valueStr = valueStr.replace(/\s+/g, '');

    let multiplier = 1;

    // Handle suffixes
    if (valueStr.includes('K') || valueStr.includes('พัน')) {
      multiplier = 1000;
      valueStr = valueStr.replace(/[Kพัน]/g, '');
    } else if (valueStr.includes('M') || valueStr.includes('ล้าน')) {
      multiplier = 1000000;
      valueStr = valueStr.replace(/[Mล้าน]/g, '');
    } else if (valueStr.includes('B')) {
      multiplier = 1000000000;
      valueStr = valueStr.replace(/[B]/g, '');
    }

    const baseValue = parseFloat(valueStr);
    if (isNaN(baseValue)) return 0;

    const result = Math.round(baseValue * multiplier);
    
    logger.debug({ original: cleanText, parsed: result }, 'Engagement text parsed');
    return result;
  }

  /**
   * Extracts counts from complex aria-labels like:
   * "See who reacted to this: 1.2K"
   * "Liked by John Doe and 1,234 others"
   */
  static parseAriaLabel(label: string | null | undefined): number {
    if (!label) return 0;

    // Strategy 1: Look for "and [number] others"
    const othersMatch = label.match(/and ([\d,.]+[KMB]?) others/i);
    if (othersMatch) {
      // If it's "Liked by X and Y", total is 2. If it's "Liked by X and 1,234 others", total is 1 + 1,234.
      const othersCount = this.parse(othersMatch[1]);
      return othersCount + 1;
    }

    // Strategy 2: Direct parse of the label
    return this.parse(label);
  }
}
