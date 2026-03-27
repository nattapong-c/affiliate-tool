import mongoose, { Document, Schema } from 'mongoose';

export interface ScrapedPostDocument extends Document {
  url: string;
  postId: string;
  content: string;
  author: {
    name: string;
    profileUrl: string;
  };
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  engagementDensity: number;
  images: string[];
  videos: string[];
  keywords: string[];
  language: 'en' | 'th';
  scrapedAt: Date;
  status: 'new' | 'processed' | 'engaged' | 'skipped';
}

const ScrapedPostSchema = new Schema<ScrapedPostDocument>({
  url: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  postId: { 
    type: String, 
    required: true, 
    index: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: {
    name: String,
    profileUrl: String
  },
  timestamp: { 
    type: Date, 
    required: true,
    index: true 
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  engagementDensity: { 
    type: Number, 
    default: 0,
    index: true 
  },
  images: [String],
  videos: [String],
  keywords: [String],
  language: { 
    type: String, 
    enum: ['en', 'th'], 
    default: 'en' 
  },
  scrapedAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['new', 'processed', 'engaged', 'skipped'],
    default: 'new',
    index: true
  }
});

// Indexes for efficient queries
ScrapedPostSchema.index({ status: 1, scrapedAt: -1 });
ScrapedPostSchema.index({ engagementDensity: -1 });
ScrapedPostSchema.index({ language: 1, status: 1 });
ScrapedPostSchema.index({ keywords: 1 });

// Text search index
ScrapedPostSchema.index({ content: 'text', keywords: 'text' });

// Static method to find high-engagement posts
ScrapedPostSchema.statics.findHighEngagement = function(
  minDensity: number = 1,
  limit: number = 20
) {
  return this.find({ 
    engagementDensity: { $gte: minDensity },
    status: { $in: ['new', 'processed'] }
  })
    .sort({ engagementDensity: -1 })
    .limit(limit);
};

// Static method to find recent posts
ScrapedPostSchema.statics.findRecent = function(
  daysBack: number = 30,
  limit: number = 50
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  return this.find({ 
    timestamp: { $gte: cutoffDate },
    status: { $in: ['new', 'processed'] }
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to find posts by keyword
ScrapedPostSchema.statics.findByKeyword = function(keyword: string) {
  return this.find({
    $or: [
      { keywords: { $in: [new RegExp(keyword, 'i')] } },
      { content: new RegExp(keyword, 'i') }
    ]
  })
    .sort({ engagementDensity: -1 })
    .limit(20);
};

// Static method to get engagement statistics
ScrapedPostSchema.statics.getEngagementStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        avgLikes: { $avg: '$engagement.likes' },
        avgComments: { $avg: '$engagement.comments' },
        avgShares: { $avg: '$engagement.shares' },
        avgDensity: { $avg: '$engagementDensity' },
        maxDensity: { $max: '$engagementDensity' }
      }
    }
  ]);
  
  return stats[0] || {
    totalPosts: 0,
    avgLikes: 0,
    avgComments: 0,
    avgShares: 0,
    avgDensity: 0,
    maxDensity: 0
  };
};

// Static method to get posts by status
ScrapedPostSchema.statics.findByStatus = function(status: string) {
  return this.find({ status })
    .sort({ scrapedAt: -1 })
    .limit(50);
};

// Static method to update post status
ScrapedPostSchema.statics.updateStatus = function(id: string, status: string) {
  return this.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );
};

// Instance method to calculate engagement density
ScrapedPostSchema.methods.calculateDensity = function() {
  const ageInHours = (Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60);
  const normalizedAge = Math.max(ageInHours, 1);
  
  // Weighted engagement: shares > comments > likes
  const weightedEngagement = 
    this.engagement.likes + 
    (this.engagement.comments * 2) + 
    (this.engagement.shares * 3);
  
  this.engagementDensity = weightedEngagement / normalizedAge;
  return this.engagementDensity;
};

export const ScrapedPostModel = mongoose.model<ScrapedPostDocument>(
  'ScrapedPost',
  ScrapedPostSchema
);
