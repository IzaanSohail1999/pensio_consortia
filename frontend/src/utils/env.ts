export function validateEnvironmentVariables() {
  const requiredVars = [
    'JWT_SECRET',
    'MONGO_URI'
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security reasons.'
    );
  }

  // Validate MONGO_URI format
  const mongoUri = process.env.MONGO_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGO_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://'
    );
  }
}

export function getEnvironmentConfig() {
  return {
    jwtSecret: process.env.JWT_SECRET!,
    mongoUri: process.env.MONGO_URI!,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}
