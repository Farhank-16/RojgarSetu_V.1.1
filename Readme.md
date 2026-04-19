# JobNest 🏢

A mobile-first hyperlocal job platform connecting local job seekers with employers.
connecting skilled workers with employers in their vicinity using GPS-based distance matching, skill certifications, and instant mobile-first experience.

---

## 📱 What is JobNest?

JobNest is a full-stack mobile-first job portal built specifically for the Indian blue-collar and grey-collar workforce. Unlike traditional job portals, JobNest focuses on **proximity-based job matching** — seekers and employers within a defined radius (up to 100 km for premium users) see each other's listings.

The platform supports three distinct roles — **Job Seeker**, **Employer**, and **Admin** — each with a dedicated experience, subscription model, and feature set.
---

## Tech Stack

**Frontend:** React 18 + Vite + TailwindCSS  
**Backend:** Node.js + Express (Razorpay only)  
**Auth + DB:** Supabase (PostgreSQL + Email OTP)  
**Payments:** Razorpay  
**Deploy:** Netlify (frontend) + Render (backend)

---

## Project Structure

```
jobnest/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/           # JobCard, CandidateCard
│   │   │   ├── forms/           # OTPInput
│   │   │   ├── layouts/         # AuthLayout, MainLayout
│   │   │   ├── navigation/      # BottomNav, Header
│   │   │   ├── ui/              # Input, Modal, Select, etc.
│   │   │   └── ErrorBoundary.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state + Supabase
│   │   │   └── useAuth.js
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   └── useLocation.js   # GPS location
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Users, Jobs, Skills, Questions, Payments
│   │   │   ├── auth/            # Login, VerifyOTP, SelectRole, CompleteProfile
│   │   │   ├── employer/        # Dashboard, PostJob, MyJobs, CandidateSearch, etc.
│   │   │   ├── seeker/          # Dashboard, JobSearch, JobDetails, Exams, etc.
│   │   │   ├── Home.jsx
│   │   │   ├── Subscription.jsx
│   │   │   └── PaymentSuccess.jsx
│   │   ├── services/
│   │   │   ├── supabase.js      # Supabase client
│   │   │   ├── api.js           # Axios for backend (Razorpay only)
│   │   │   ├── jobService.js    # Jobs CRUD via Supabase
│   │   │   ├── userService.js   # Profile CRUD via Supabase
│   │   │   ├── skillService.js  # Skills via Supabase
│   │   │   ├── examService.js   # Exams via Supabase
│   │   │   ├── paymentService.js # Razorpay via backend
│   │   │   └── adminService.js  # Admin ops via Supabase
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.
│   └── vite.config.js
│
└── backend/                     # Express server (Razorpay only)
    ├── config/
    │   └── config.js
    │   
    ├── controllers/
    │   ├── adminController.js   # Admin stats
    │   ├── examController.js    # Exam submit/grade
    │   └── paymentController.js # Razorpay order + verify
    ├── middleware/
    │   ├── auth.js              # Supabase JWT verify
    │   └── rateLimit.js
    ├── routes/
    │   ├── admin.js
    │   ├── exams.js
    │   └── payments.js
    ├── services/
    │   └── razorpay.js
    ├── utils/
    │   └── helpers.js
    └── server.js
```

---

## Auth Flow

```
Login (email) → OTP email → VerifyOTP
  ├── New user (no role) → SelectRole → CompleteProfile → Dashboard
  └── Existing user → Dashboard (seeker/employer/admin)
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://your-backend.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxx
```

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.netlify.app

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...   # service_role key

# MySQL (for payment history)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jobnest_db

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx

# Prices in paise
SUBSCRIPTION_FIRST_MONTH=900
SUBSCRIPTION_REGULAR=9900
SKILL_EXAM_PRICE=4900
VERIFIED_BADGE_PRICE=9900
```

---

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in SQL Editor
3. Run `add_phone_column.sql` in SQL Editor
4. **Authentication → Settings:**
   - Enable email confirmations: **OFF**
   - OTP expiry: `600` seconds
5. Set admin:
```sql
UPDATE public.profiles 
SET role = 'admin', profile_completed = TRUE
WHERE email = 'your-admin@email.com';
```

---

## Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173

# Backend
cd backend
npm install
npm run dev        # http://localhost:5000
```

---

## Deployment

### Frontend → Netlify
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`
   - `VITE_RAZORPAY_KEY_ID`
5. Add `public/_redirects`:
```
/*  /index.html  200
```

### Backend → Render
1. New Web Service → connect GitHub
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add all backend environment variables
5. Copy the Render URL → set as `VITE_API_URL` in Netlify

---

## Features

| Feature | Status |
|---|---|
| Email OTP login | ✅ |
| Job seeker + employer roles | ✅ |
| Post/edit/delete jobs | ✅ |
| Multi-skill job posting | ✅ |
| Candidate search with filters | ✅ |
| Skill exams + certification | ✅ |
| Subscription (Razorpay) | ✅ |
| Verified badge (auto on subscription) | ✅ |
| GPS-based job matching | ✅ |
| Admin panel | ✅ |
| Mobile-first UI | ✅ |

---

## Roles

| Role | Access |
|---|---|
| `job_seeker` | Browse jobs, apply, take exams, subscribe |
| `employer` | Post jobs, search candidates, subscribe |
| `admin` | Dashboard, manage users/jobs/skills/exams |
