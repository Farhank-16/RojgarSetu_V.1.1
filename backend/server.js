require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const config      = require('./config/config');

const paymentRoutes = require('./routes/payments');
const examRoutes    = require('./routes/exams');
const adminRoutes   = require('./routes/admin');

const app = express();

app.use(helmet());

// Support multiple origins split by comma, spaces, or '||'
const allowedOrigins = config.frontendUrl
  ? config.frontendUrl.split(/[\s,|||]+/).map(url => url.trim().replace(/\/$/, '')).filter(Boolean)
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === cleanOrigin);
    if (isAllowed || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy.`), false);
    }
  },
  credentials: true
}));

app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      config.nodeEnv === 'development' ? 2000 : 500,
  message:  { error: 'Too many requests, please try again later.' },
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

app.use('/api/payments', paymentRoutes);
app.use('/api/exams',    examRoutes);
app.use('/api/admin',    adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

module.exports = app;