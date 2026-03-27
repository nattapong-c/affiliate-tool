import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import mongoose from 'mongoose';
import pino from 'pino';
import { config } from 'dotenv';
import { KeywordStrategist } from './services/keyword-strategist';
import { createKeywordRoutes } from './routes/keyword-routes';
import { createSearchRoutes } from './routes/search-routes';
import { createPostRoutes } from './routes/post-routes';
import { createProductScraperRoutes } from './routes/product-scraper-routes';
import { errorHandler } from './middleware/error-handler';
import { loggerMiddleware } from './middleware/logger';

// Load environment variables
config();

const logger = pino();

const PORT = parseInt(process.env.PORT || '8080');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook-automation';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate required environment variables
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-your-api-key-here') {
  logger.warn('OPENAI_API_KEY not configured. Keyword generation will fail.');
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error({ err }, 'MongoDB connection failed'));

// Initialize services
const strategist = new KeywordStrategist(OPENAI_API_KEY || '');

// Create app
const app = new Elysia()
  .use(cors())
  .use(errorHandler())
  .use(loggerMiddleware())
  // Health check endpoint
  .get('/api/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'facebook-automation-service',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  }))
  // Root endpoint
  .get('/', () => ({
    name: 'Facebook Automation Service',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      keywords: '/api/keywords',
      search: '/api/search',
      posts: '/api/posts',
      products: '/api/products'
    }
  }))
  // Keyword routes
  .use(createKeywordRoutes(strategist))
  // Search routes
  .use(createSearchRoutes())
  // Post routes
  .use(createPostRoutes())
  // Product scraper routes
  .use(createProductScraperRoutes())
  .listen(PORT);

logger.info(`🚀 Server running on http://localhost:${PORT}`);
logger.info(`📝 API Documentation: http://localhost:${PORT}/`);
logger.info(`❤️  Health check: http://localhost:${PORT}/api/health`);

export type App = typeof app;
