import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { menuRouter } from './routes/menu';
import { profileRouter } from './routes/profile';
import { nutritionRouter } from './routes/nutrition';
import qualityRouter from './routes/quality';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://veganflemme.vercel.app',
    'https://veganflemme.com'
  ].filter(Boolean),
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/menu', menuRouter);
app.use('/api/profile', profileRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/quality', qualityRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'VeganFlemme Engine API',
    version: '1.0.0',
    description: 'API for vegan nutrition and menu generation',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      profile: '/api/profile',
      nutrition: '/api/nutrition',
      quality: '/api/quality'
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use(errorHandler);

export default app;