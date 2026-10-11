import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import clubsRoutes from './routes/clubs.js';
import eventsRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import inductionRoutes from './routes/induction.js';
import superAdminRoutes from './routes/super_admin.js';
import recommendationsRoutes from './routes/recommendations.js';
import uploadRoutes from './routes/upload.js';
import { getDb } from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory serving
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    await db.get('SELECT 1');
    res.json({
      status: 'ok',
      service: 'BIT Sindri Clubs Dashboard API',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'BIT Sindri Clubs Dashboard API',
      database: 'disconnected',
      message: err.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/induction', inductionRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` BIT Sindri Clubs Dashboard Backend Server Running`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
