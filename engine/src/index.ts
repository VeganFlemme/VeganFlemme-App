import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { menuRouter } from './routes/menu';
import { profileRouter } from './routes/profile';
import { nutritionRouter } from './routes/nutrition';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'VeganFlemme Engine API',
    version: '1.0.0',
    description: 'API for vegan nutrition and menu generation',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      profile: '/api/profile',
      nutrition: '/api/nutrition'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🌱 VeganFlemme Engine API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;