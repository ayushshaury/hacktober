import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start server for local dev. On Vercel, vercel.json points the backend service at src/app.js.
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` BIT Sindri Clubs Dashboard Backend Server Running`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
