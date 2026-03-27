import mongoose, { Document, Schema } from 'mongoose';
import { Keyword, LanguageCode } from '../types/keyword';

export interface KeywordHistoryDocument extends Document {
  productTitle: string;
  productDescription: string;
  category?: string;
  targetAudience?: string;
  language: LanguageCode;
  keywords: Keyword[];
  processingTimeMs: number;
  cacheHit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const KeywordHistorySchema = new Schema<KeywordHistoryDocument>({
  productTitle: { type: String, required: true },
  productDescription: { type: String, required: true },
  category: String,
  targetAudience: String,
  language: { 
    type: String, 
    default: 'en',
    required: true 
  },
  keywords: [{
    text: { type: String, required: true },
    category: { type: String, enum: ['intent', 'topic'], required: true },
    relevanceScore: { type: Number, min: 0, max: 100 },
    searchVolume: { type: String, enum: ['low', 'medium', 'high'] },
    language: { type: String }
  }],
  processingTimeMs: { type: Number, default: 0 },
  cacheHit: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for efficient queries - using regular index instead of text index to support all languages
KeywordHistorySchema.index({ productTitle: 1 });
KeywordHistorySchema.index({ createdAt: -1 });
KeywordHistorySchema.index({ language: 1 });
// Compound index for common queries
KeywordHistorySchema.index({ language: 1, createdAt: -1 });

export const KeywordHistoryModel = mongoose.model<KeywordHistoryDocument>(
  'KeywordHistory',
  KeywordHistorySchema
);
