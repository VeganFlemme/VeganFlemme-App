import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  logger.info(`🌱 VeganFlemme Engine API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});