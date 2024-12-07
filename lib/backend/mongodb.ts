import mongoose from 'mongoose';

const connectToDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('Using existing database connection');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Tambahkan timeout
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Biarkan error diteruskan ke API handler
  }
};

export default connectToDatabase;
