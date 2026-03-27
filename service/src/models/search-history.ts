import mongoose, { Document, Schema } from 'mongoose';

export interface SearchHistoryDocument extends Document {
  userId?: string;
  keywords: string[];
  pages?: string[];
  dateFrom: Date;
  dateTo: Date;
  results: Array<{
    url: string;
    snippet: string;
    relevanceScore: number;
  }>;
  totalFound: number;
  duration: number; // Search duration in ms
  status: 'completed' | 'failed' | 'partial';
  errorMessage?: string;
  searchedAt: Date;
}

export interface SearchHistoryModel extends mongoose.Model<SearchHistoryDocument> {
  findRecent(userId?: string, limit?: number): Promise<SearchHistoryDocument[]>;
  findByKeyword(keyword: string): Promise<SearchHistoryDocument[]>;
  getStatistics(userId?: string): Promise<any>;
}

const SearchHistorySchema = new Schema<SearchHistoryDocument, SearchHistoryModel>({
  userId: { type: String, index: true },
  keywords: { 
    type: [String], 
    required: true,
    index: true 
  },
  pages: [String],
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  results: [{
    url: { type: String, required: true },
    snippet: String,
    relevanceScore: { type: Number, default: 0 }
  }],
  totalFound: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['completed', 'failed', 'partial'],
    default: 'completed'
  },
  errorMessage: String,
  searchedAt: { type: Date, default: Date.now, index: true }
});

// Indexes for efficient queries
SearchHistorySchema.index({ keywords: 1, searchedAt: -1 });
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });
SearchHistorySchema.index({ status: 1, searchedAt: -1 });

// Text search index
SearchHistorySchema.index({ keywords: 'text' });

// Static method to find recent searches
SearchHistorySchema.statics.findRecent = function(
  userId?: string,
  limit: number = 10
) {
  const query: any = {};
  if (userId) {
    query.userId = userId;
  }
  return this.find(query).sort({ searchedAt: -1 }).limit(limit);
};

// Static method to find searches by keyword
SearchHistorySchema.statics.findByKeyword = function(keyword: string) {
  return this.find({ keywords: { $in: [new RegExp(keyword, 'i')] } })
    .sort({ searchedAt: -1 })
    .limit(20);
};

// Static method to get search statistics
SearchHistorySchema.statics.getStatistics = async function(userId?: string) {
  const match: any = {};
  if (userId) {
    match.userId = userId;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        totalResults: { $sum: '$totalFound' },
        averageDuration: { $avg: '$duration' },
        averageResults: { $avg: '$totalFound' }
      }
    }
  ]);

  return stats[0] || {
    totalSearches: 0,
    totalResults: 0,
    averageDuration: 0,
    averageResults: 0
  };
};

export const SearchHistoryModel = mongoose.model<SearchHistoryDocument>(
  'SearchHistory',
  SearchHistorySchema
);
