import app from './app.js';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { env, validateEnv } from './config/env.js';

try {
  validateEnv();
  await connectDB(env.mongoUri);
  const server = app.listen(env.port);
  server.once('listening', () => {
    console.log(`InternTrack API listening on port ${env.port}; MongoDB connected.`);
  });
  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  server.on('error', async (error) => {
    const message =
      error.code === 'EADDRINUSE'
        ? `Port ${env.port} is already in use. Stop the other backend instance and restart this one.`
        : error.message;
    console.error('Server could not start:', message);
    await mongoose.disconnect();
    process.exit(1);
  });
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
