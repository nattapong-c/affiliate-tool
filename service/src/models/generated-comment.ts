import mongoose, { Document, Schema } from 'mongoose';

export interface GeneratedCommentDocument extends Document {
  postId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  settings: {
    language: 'en' | 'th';
    emotion: string;
    length: 'short' | 'medium' | 'long';
    customPrompt?: string;
  };
  options: Array<{
    text: string;
    version: number;
  }>;
  selectedOptionIndex?: number;
  status: 'draft' | 'posted';
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedCommentSchema = new Schema<GeneratedCommentDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'ScrapedPost', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'KeywordHistory', required: true, index: true },
  settings: {
    language: { type: String, enum: ['en', 'th'], default: 'en' },
    emotion: { type: String, required: true },
    length: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
    customPrompt: { type: String }
  },
  options: [{
    text: { type: String, required: true },
    version: { type: Number, required: true }
  }],
  selectedOptionIndex: { type: Number },
  status: { type: String, enum: ['draft', 'posted'], default: 'draft' }
}, {
  timestamps: true
});

export const GeneratedCommentModel = mongoose.model<GeneratedCommentDocument>(
  'GeneratedComment',
  GeneratedCommentSchema
);
