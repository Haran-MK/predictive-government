const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/offices', require('./routes/officeRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/counters', require('./routes/counterRoutes'));
app.use('/api/queue', require('./routes/queueRoutes'));
app.use('/api/training-data', require('./routes/trainingDataRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Queue Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
