const { createClient } = require('@supabase/supabase-js');

// Supabase admin client — service role key use karta hai (backend only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service_role key — NOT anon key
);

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify Supabase JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get profile from Supabase DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Auto-expire subscription if end date passed
    if (profile.subscription_status === 'active' && profile.subscription_end) {
      if (new Date(profile.subscription_end) < new Date()) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'expired' })
          .eq('id', profile.id);
        profile.subscription_status = 'expired';
      }
    }

    // Attach to request — same shape as before so controllers work unchanged
    req.user = {
      id:                  profile.id,
      email:               profile.email,
      name:                profile.name,
      role:                profile.role,
      city:                profile.city,
      latitude:            profile.latitude,
      longitude:           profile.longitude,
      is_active:           profile.is_active,
      is_verified:         profile.is_verified,
      exam_passed:         profile.exam_passed,
      subscription_status: profile.subscription_status,
      subscription_end:    profile.subscription_end,
      profile_completed:   profile.profile_completed,
    };

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      return next();
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = profile || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

// generateToken no longer needed — Supabase handles token generation
// Kept as stub for backward compat if anything imports it
const generateToken = () => {
  throw new Error('generateToken deprecated — use Supabase auth');
};

module.exports = { authenticate, optionalAuth, generateToken };