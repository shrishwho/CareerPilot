# 🚀 CareerPilot AI

> **"Prepare smarter. Apply better. Get hired."**  
> An AI-powered full-stack career acceleration platform combining an **AI Mock Interview Coach** and an interactive **Job Application Kanban Tracker**.

---

## 🌟 Key Modules & Features

### 1. 🤖 AI Mock Interview Coach
- **Dynamic Role Calibration**: Target roles include *Frontend Developer, Backend Developer, Full Stack Developer, Software Engineer, Data Analyst*, or *Custom Role*.
- **Interview Styles**: HR / Behavioral, Technical, or Mixed.
- **Custom Question Count**: Select 5, 10, or 15 targeted questions.
- **Job Description Context**: Paste specific JD requirements for tailored interview question generation.
- **Voice-to-Text Input**: Practice real verbal interviews using browser-native **Web Speech API** with audio wave animations.
- **Instant AI Feedback**: Immediate rubric scoring (1-10) with granularity across Relevance, Technical Correctness, Communication, Completeness, Feedback, and Actionable Improvement Suggestions.
- **Comprehensive Final Performance Report**: Overall Readiness %, Technical Score %, Communication %, Confidence Rating %, Strong Areas, Weak Areas, Actionable Next Steps, Recommended Study Topics, and celebratory confetti effects.
- **Persistent Interview History**: Review previous interview sessions with full score breakdowns and QA transcripts.

---

### 2. 📋 Job Application Tracker (Kanban Board)
- **Interactive Kanban Pipeline**: Columns for **Wishlist**, **Applied**, **Interview**, **Offer**, and **Rejected**.
- **Real Drag-and-Drop**: Powered by `@dnd-kit` with optimistic instant updates and automatic database sync.
- **Rich Card Metadata**: Company, Job Title, Salary, Location, Application Date, Follow-up Date, Recruiter Contact, and Custom Notes.
- **Smart Follow-up System**: Clear visual alerts for **Overdue**, **Due Today**, and **Upcoming** follow-ups.
- **AI Cold Email Generator**: 1-click personalized recruiter outreach emails crafted with Google Gemini AI based on target company, role, recruiter name, and applicant profile. Includes 1-click copy-to-clipboard.
- **Filtering & Search**: Real-time search across companies, roles, and job types (Full-time, Contract, Remote, etc.).

---

### 3. 📊 Analytics & Insights Dashboard
- **Pipeline Conversion Rates**: Overall Interview Rate, Offer Conversion Rate, Rejection Rate.
- **Interactive Visualizations (Recharts)**:
  - Applications by Kanban stage (Pie / Donut charts)
  - Weekly application volume vs mock sessions taken (Bar charts)
  - Interview score trajectory and mastery over time (Area / Line charts)

---

### 4. 👤 Candidate Profile & Settings
- **Profile Synchronization**: Name, Target Role, Education, Skills, and About Me Bio — automatically leveraged by Gemini for Cold Email generation.
- **Data Portability**: 1-click full JSON export of applications and interview history.
- **Backend & AI Health Diagnostics**: Live connection check and Gemini status indicator.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, @dnd-kit (Core & Sortable), Canvas Confetti |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, CORS, Dotenv |
| **Database** | MongoDB (with Mongoose) + Built-in High-Performance Embedded Memory Engine fallback |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash` / `@google/generative-ai`) |
| **Voice / Audio** | Browser Web Speech API (SpeechRecognition) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Clone and Setup Environment Variables
Create a `.env` file in the root directory (or use `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/careerpilot
JWT_SECRET=careerpilot_super_secret_jwt_key_2025
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
*(Note: If no Gemini API key is provided, the platform automatically utilizes its high-fidelity realistic intelligent engine so you can test all features seamlessly without any setup blocker!)*

---

### 3. Install Dependencies

#### Backend Server:
```bash
cd server
npm install
```

#### Frontend Client:
```bash
cd ../client
npm install
```

---

### 4. Run the Application

#### Start Backend:
```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

#### Start Frontend:
```bash
cd client
npm run dev
# Vite will open on http://localhost:5173
```

Open **http://localhost:5173** in your browser!

---

## 🔑 Demo Account Credentials
- **Email**: `demo@careerpilot.ai`
- **Password**: `demopass123`
- *Or click "Sign in with Demo Account" on the login screen.*

---

## 📡 API Reference Summary

### Authentication
- `POST /api/auth/register` - Create candidate account
- `POST /api/auth/login` - Authenticate & receive JWT
- `GET /api/auth/me` - Get current user profile *(Protected)*
- `PUT /api/auth/profile` - Update profile & skills *(Protected)*

### Job Applications
- `GET /api/applications` - Get user's application pipeline *(Protected)*
- `POST /api/applications` - Create new job application *(Protected)*
- `GET /api/applications/:id` - Get application details *(Protected)*
- `PUT /api/applications/:id` - Update status or application fields *(Protected)*
- `DELETE /api/applications/:id` - Delete application *(Protected)*

### Mock Interviews
- `POST /api/interviews` - Save completed interview session *(Protected)*
- `GET /api/interviews` - Get past interview history *(Protected)*
- `GET /api/interviews/:id` - Get specific interview report *(Protected)*

### AI (Gemini Engine)
- `POST /api/ai/questions` - Generate role-specific interview questions *(Protected)*
- `POST /api/ai/evaluate` - Evaluate single answer with granular score *(Protected)*
- `POST /api/ai/final-report` - Generate comprehensive performance report *(Protected)*
- `POST /api/ai/cold-email` - Generate personalized recruiter cold outreach *(Protected)*

---

## 🔒 Security Best Practices
- **API Key Protection**: The Gemini API key is exclusively stored in `.env` on the Node.js server and never exposed to the client.
- **Route Authorization**: Strict JWT Bearer token authentication middleware.
- **Data Isolation**: Database queries strictly scoped to the authenticated candidate's `userId`.
- **Password Hashing**: Strong bcrypt password hashing with auto-salting.
