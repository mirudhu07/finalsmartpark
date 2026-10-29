import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartpark',
  jwtSecret: process.env.JWT_SECRET || 'smartpark_dev_jwt_secret_key_9921_replace_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'smartpark_dev_refresh_token_secret_key_8842_replace_in_production',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:19006,http://localhost:8081').split(','),
};
