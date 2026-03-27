import pino from 'pino';

const logger = pino();

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
}

export interface EngagementResult {
  total: number;
  density: number;
  score: number;
  rank: 'low' | 'medium' | 'high' | 'viral';
}

export class EngagementCalculator {
  /**
   * Calculate total engagement
   */
  static calculateTotal(metrics: EngagementMetrics): number {
    return metrics.likes + metrics.comments + metrics.shares;
  }

  /**
   * Calculate engagement density score
   * Formula: (likes + comments*2 + shares*3) / postAgeInHours
   * Higher weight for comments and shares as they indicate stronger engagement
   */
  static calculateDensity(
    metrics: EngagementMetrics,
    postTimestamp: Date
  ): number {
    const totalEngagement = 
      metrics.likes + 
      (metrics.comments * 2) + 
      (metrics.shares * 3);
    
    const ageInHours = (Date.now() - postTimestamp.getTime()) / (1000 * 60 * 60);
    
    // Avoid division by zero for very recent posts
    const normalizedAge = Math.max(ageInHours, 1);
    
    const density = totalEngagement / normalizedAge;
    
    logger.debug(
      { totalEngagement, ageInHours, normalizedAge, density },
      'Engagement density calculated'
    );
    
    return density;
  }

  /**
   * Calculate engagement score (0-100)
   * Based on percentile ranking
   */
  static calculateScore(
    metrics: EngagementMetrics,
    benchmark: {
      avgLikes: number;
      avgComments: number;
      avgShares: number;
    }
  ): number {
    const likeScore = Math.min(100, (metrics.likes / Math.max(benchmark.avgLikes, 1)) * 50);
    const commentScore = Math.min(100, (metrics.comments / Math.max(benchmark.avgComments, 1)) * 50);
    const shareScore = Math.min(100, (metrics.shares / Math.max(benchmark.avgShares, 1)) * 50);
    
    // Weighted average
    const score = (likeScore * 0.3) + (commentScore * 0.4) + (shareScore * 0.3);
    
    return Math.min(100, Math.round(score));
  }

  /**
   * Get engagement rank based on density
   */
  static getRank(density: number): 'low' | 'medium' | 'high' | 'viral' {
    if (density >= 100) return 'viral';
    if (density >= 10) return 'high';
    if (density >= 1) return 'medium';
    return 'low';
  }

  /**
   * Calculate complete engagement analysis
   */
  static analyze(
    metrics: EngagementMetrics,
    postTimestamp: Date,
    benchmark?: {
      avgLikes: number;
      avgComments: number;
      avgShares: number;
    }
  ): EngagementResult {
    const total = this.calculateTotal(metrics);
    const density = this.calculateDensity(metrics, postTimestamp);
    const rank = this.getRank(density);
    
    let score = 50; // Default score
    if (benchmark) {
      score = this.calculateScore(metrics, benchmark);
    } else {
      // Simple score based on rank
      switch (rank) {
        case 'viral': score = 95; break;
        case 'high': score = 75; break;
        case 'medium': score = 50; break;
        case 'low': score = 25; break;
      }
    }

    return {
      total,
      density: Math.round(density * 100) / 100,
      score,
      rank
    };
  }

  /**
   * Rank posts by engagement density
   */
  static rankPosts<T extends { engagementDensity: number }>(posts: T[]): T[] {
    return posts.sort((a, b) => b.engagementDensity - a.engagementDensity);
  }

  /**
   * Filter posts by minimum engagement
   */
  static filterByEngagement<T extends { engagement: { total: number } }>(
    posts: T[],
    minTotal: number
  ): T[] {
    return posts.filter(post => post.engagement.total >= minTotal);
  }

  /**
   * Filter posts by date (within last N days)
   */
  static filterByDate<T extends { timestamp: Date }>(
    posts: T[],
    daysBack: number
  ): T[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    return posts.filter(post => post.timestamp >= cutoffDate);
  }

  /**
   * Calculate engagement growth rate
   */
  static calculateGrowthRate(
    currentMetrics: EngagementMetrics,
    previousMetrics: EngagementMetrics,
    timePeriodHours: number
  ): number {
    const currentTotal = this.calculateTotal(currentMetrics);
    const previousTotal = this.calculateTotal(previousMetrics);
    
    if (previousTotal === 0) {
      return currentTotal > 0 ? 100 : 0;
    }
    
    const growth = ((currentTotal - previousTotal) / previousTotal) * 100;
    const hourlyRate = growth / Math.max(timePeriodHours, 1);
    
    return Math.round(hourlyRate * 100) / 100;
  }

  /**
   * Detect engagement anomalies (potential bot activity)
   */
  static detectAnomalies(metrics: EngagementMetrics): {
    isAnomalous: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // Check for unusual like/comment ratio
    const likeCommentRatio = metrics.likes / Math.max(metrics.comments, 1);
    if (likeCommentRatio > 50) {
      reasons.push('Unusually high like/comment ratio');
    }
    
    // Check for zero engagement
    if (metrics.likes === 0 && metrics.comments === 0 && metrics.shares === 0) {
      reasons.push('Zero engagement');
    }
    
    // Check for extremely high shares
    if (metrics.shares > metrics.likes) {
      reasons.push('Shares exceed likes (unusual)');
    }
    
    return {
      isAnomalous: reasons.length > 0,
      reasons
    };
  }

  /**
   * Get engagement quality score
   * Comments and shares are weighted higher as they indicate deeper engagement
   */
  static getQualityScore(metrics: EngagementMetrics): number {
    const total = this.calculateTotal(metrics);
    if (total === 0) return 0;
    
    const qualityWeighted = 
      (metrics.likes * 1) + 
      (metrics.comments * 3) + 
      (metrics.shares * 5);
    
    const maxQuality = total * 5; // If all were shares
    const score = (qualityWeighted / maxQuality) * 100;
    
    return Math.round(score);
  }
}

// Export singleton instance
export const engagementCalculator = EngagementCalculator;
