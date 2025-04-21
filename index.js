import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv
import connectDB from './connect.js';
import apiRoutes from './routes/apiRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1', apiRoutes);

// Default server route
app.get('/', async (req, res) => {
  res.send('Hello from the backend server!');
});

// Start server
const startServer = async () => {
  try {
    // Ensure the environment variable is being passed correctly
    const mongoDBUrl = process.env.MONGODB_URL;
    if (!mongoDBUrl) {
      throw new Error('MONGODB_URL is not defined in the environment variables.');
    }

    await connectDB(mongoDBUrl);
    app.listen(8081, () => {
      console.log('Server has started on port http://localhost:8081');
    });
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
