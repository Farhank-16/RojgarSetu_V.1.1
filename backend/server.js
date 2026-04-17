const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const config      = require('./config/config');

// ✅ Supabase client (important)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // backend me service key hi use hogi
);

// ── Routes ────────────────────────────────────────────────
const paymentRoutes = require('./routes/payments');
const examRoutes    = require('./routes/exams');
const adminRoutes   = require('./routes/admin');

const app = express();

// ── Security Middleware ───────────────────────────────────
app.use(helmet());

// ⚠️ CORS FIX (important warna frontend royega silently)
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173'],
  credentials: true
}));

app.use(compression());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.nodeEnv === 'development' ? 2000 : 500,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/uploads', express.static('uploads'));

// ── Supabase Auth Middleware ──────────────────────────────
// 🧠 Ye sabse important piece hai
app.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      req.user = null;
    } else {
      req.user = data.user;
    }

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    req.user = null;
    next();
  }
});

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
);

// ── API Routes ────────────────────────────────────────────
app.use('/api/payments', paymentRoutes);
app.use('/api/exams',    examRoutes);
app.use('/api/admin',    adminRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'development'
      ? err.message
      : 'Internal server error',
  });
});

// ── Server Start ──────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

module.exports = app;