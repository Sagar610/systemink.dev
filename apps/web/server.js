import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const API_URL = process.env.VITE_API_URL || 'https://systemink-dev.onrender.com/api';
const API_BASE = API_URL.replace('/api', '');

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_BASE,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
}));

// Proxy uploads to backend
app.use('/uploads', createProxyMiddleware({
  target: API_BASE,
  changeOrigin: true,
}));

// Handle client-side routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📡 API URL: ${API_URL}`);
});
