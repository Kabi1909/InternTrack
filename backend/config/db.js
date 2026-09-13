import mongoose from 'mongoose';
export async function connectDB(uri) {
  // Filters are built from validated scalar inputs; raw request objects never reach MongoDB.
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}
