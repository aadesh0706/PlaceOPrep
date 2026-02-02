# 🎯 PlaceOPrep - Complete Interview Preparation Platform

An AI-powered interview preparation platform that helps users practice, analyze, and improve their interview performance across Technical, HR, Aptitude, and General interview rounds.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-required-green.svg)

## ✨ Features

### 🎨 Modern UI/UX
- Clean SaaS-style dashboard interface
- Purple/blue gradient theme
- Responsive design for all devices
- Smooth animations and transitions
- Card-based layout

### 🔐 Authentication System
- JWT-based authentication
- Secure user registration and login
- Protected routes
- Session management
- User profiles with avatars

### 📊 Comprehensive Dashboard
- **KPI Cards**: Total Interviews, Practice Time, Average Score, Best Score
- **Quick Start**: Instant access to all practice modes
- **Recent Sessions**: View last 5 practice sessions
- **Skill Assessment**: Radar chart showing Technical, HR, Aptitude, Communication skills
- **Progress Tracking**: Line chart showing improvement over time
- **Achievements Preview**: Display recently unlocked achievements

### 💻 Practice Modes
1. **Technical Round**
   - Multi-language coding support (Python, Java, C++, JavaScript)
   - Real-time code execution
   - Instant AI feedback
   - Company-tagged questions (Google, Amazon, Microsoft, etc.)
   - Difficulty levels: Beginner, Intermediate, Advanced, Pro

2. **HR Round**
   - Behavioral questions
   - STAR method analysis
   - Communication feedback
   - Voice recognition ready

3. **Aptitude Round**
   - Quantitative reasoning
   - Logical puzzles
   - Timed assessments
   - Pattern recognition
   - MCQ format

4. **General Interview**
   - Resume discussion
   - Motivational questions
   - Career planning
   - Self-introduction practice

5. **Full Simulation**
   - Complete end-to-end interview
   - Combines all rounds
   - Realistic interview flow
   - Comprehensive feedback

### 📚 Question Bank
- 20+ pre-seeded questions
- Filterable by:
  - Category (Technical, HR, Aptitude, General)
  - Difficulty (Beginner, Intermediate, Advanced, Pro)
  - Company tags
- Search functionality
- Direct practice from question bank

### 📈 History & Analytics
- Complete session history
- Summary statistics
- Filter by round type
- Detailed performance metrics
- Time tracking
- Score trends

### 🏆 Achievements & Gamification
12 unique achievements:
- 🎯 **First Steps**: Complete your first interview
- 🚀 **Getting Started**: Complete 5 interviews
- 💪 **Practice Makes Perfect**: Complete 10 interviews
- 🔥 **Consistency**: Practice 3 days in a row
- ⚡ **Week Warrior**: Practice 7 days in a row
- ⭐ **High Performer**: Score 80% or higher
- 🏆 **Excellence**: Score 90% or higher
- 💻 **Technical Master**: Complete 5 technical rounds
- 🗣️ **Communication Expert**: Complete 5 HR rounds
- 🧠 **Aptitude Ace**: Complete 5 aptitude rounds
- 🎖️ **Simulation Champion**: Complete a full simulation
- ⏰ **Time Warrior**: Practice for 10 hours

### 🤖 AI Integration
- Automated code evaluation
- Feedback generation
- Emotion analysis
- Performance scoring
- Improvement suggestions

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI library
- **React Router DOM 6.28.0** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin requests

### AI Engine
- **Python** - AI processing
- **Flask** - API server
- **Scikit-learn** - ML models
- **NLTK** - Natural language processing
- **Emotion detection** - Sentiment analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **MongoDB** (local or Atlas)
- **Python 3.8+**
- **npm** or **yarn**

### Installation

#### Option 1: Automated Setup (Windows)

```bash
# Run the setup script
setup.bat
```

This will:
1. Install all dependencies (backend, frontend, AI engine)
2. Create environment files
3. Seed the database

Then start all services:
```bash
start.bat
```

#### Option 2: Manual Setup

**1. Clone the repository**
```bash
cd SkillSpectrum
```

**2. Setup Backend**
```bash
cd backend
npm install

# Create .env file
copy .env.example .env

# Seed database (ensure MongoDB is running)
node seed.js

# Start backend
npm run dev
```
Backend runs on `http://localhost:4000`

**3. Setup Frontend**
```bash
cd frontend
npm install

# Create .env file
copy .env.example .env

# Start frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

**4. Setup AI Engine**
```bash
cd ai-engine
pip install -r requirements.txt

# (Optional) Train with exam question answers for better accuracy
# See ai-engine/TRAINING_GUIDE.md for details
cd training
python collect_exam_data.py  # Collect exam answers
python quick_train.py         # Process and train models

# Start AI engine
cd ..
python app.py
```
AI Engine runs on `http://localhost:5000`

**Note:** The AI engine works with default models, but training with your exam question answers will significantly improve evaluation accuracy. See `ai-engine/README_TRAINING.md` for quick start.

## 📁 Project Structure

```
PlaceOPrep/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── sessionController.js
│   │   ├── questionController.js
│   │   ├── achievementController.js
│   │   └── analyticsController.js
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Question.js
│   │   ├── Achievement.js
│   │   ├── Skill.js
│   │   └── Result.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── questions.js
│   │   ├── achievements.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── server.js            # Main server file
│   ├── seed.js              # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app with routing
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── InterviewSelect.jsx
│   │   ├── History.jsx
│   │   ├── Achievements.jsx
│   │   └── QuestionBank.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── VoiceRecorder.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── interview.js
│   └── package.json
└── ai-engine/
    ├── app.py              # Flask server
    ├── models/             # ML models
    │   ├── decision_dt.joblib
    │   ├── decision_rf.joblib
    │   ├── emotion_rf.joblib
    │   └── decision_xgb.json
    ├── decision_engine.py
    ├── emotion_analysis.py
    ├── nlp_evaluator.py
    └── requirements.txt
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Sessions
- `POST /api/sessions/start` - Start practice session
- `POST /api/sessions/submit` - Submit session
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/:id` - Get session by ID

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/random` - Get random question
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create question (admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/skills` - User skills
- `GET /api/analytics/detailed` - Detailed analytics

### Achievements
- `GET /api/achievements` - Get user achievements
- `GET /api/achievements/:type` - Get achievement by type

## 🔒 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://127.0.0.1:27017/placeoprep
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PY_ENGINE_URL=http://localhost:5000
PORT=4000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:4000/api
```

## 📊 Database Schema

### User
- email, password (hashed), name, avatar
- totalInterviews, practiceTime, averageScore, bestScore
- currentStreak, lastPracticeDate

### Session
- userId, type, difficulty, questionId
- userAnswer, code, language
- score, maxScore, duration
- feedback (overall, strengths, improvements)
- completed, startTime, endTime

### Question
- title, description, category, difficulty, type
- company tags, expectedApproach
- boilerplateCode (python, java, cpp, javascript)
- testCases, options, correctAnswer
- starMethodGuide, hints, timeLimit, points

### Achievement
- userId, type, name, description, icon
- progress, target, unlocked, unlockedAt

### Skill
- userId, technical, hr, aptitude, communication

## 🎨 UI Components

All components use Tailwind CSS with custom gradients:

- **Sidebar**: Fixed left navigation with logo, menu, user profile
- **Dashboard**: KPI cards, quick start, charts, recent sessions
- **Practice Cards**: Gradient cards for each round type
- **Achievement Cards**: Locked/unlocked states with progress bars
- **History Table**: Sortable, filterable session history
- **Question Cards**: Filterable with company tags and difficulty badges

## 🚢 Deployment

### Backend Deployment
1. Choose a hosting service (Heroku, DigitalOcean, AWS, Railway)
2. Set environment variables in production
3. Use MongoDB Atlas for database
4. Deploy backend code
5. Note the backend URL

### Frontend Deployment
1. Update API URL in `.env`:
   ```
   VITE_BACKEND_URL=https://your-backend-url.com/api
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy `dist` folder to Vercel, Netlify, or similar
4. Configure custom domain (optional)

### AI Engine Deployment
1. Deploy to Python-compatible hosting (Heroku, PythonAnywhere, AWS)
2. Ensure all dependencies are installed
3. Update PY_ENGINE_URL in backend

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```
Make sure MongoDB is running:
mongod
```

**Port Already in Use:**
```
Change PORT in backend .env
Update VITE_BACKEND_URL in frontend
```

**CORS Issues:**
```
Check CORS configuration in backend server.js
Ensure correct API URL in frontend
```

**Dependencies Not Installing:**
```
Clear cache and reinstall:
npm cache clean --force
npm install
```

## 📝 Features Implemented

✅ Complete authentication system with JWT
✅ User registration and login
✅ Dashboard with all KPI cards
✅ Skill assessment radar chart
✅ Progress over time line chart
✅ Quick start buttons for all modes
✅ Recent sessions display
✅ Achievements system with 12 types
✅ Question bank with 20+ questions
✅ Practice session tracking
✅ History page with filters
✅ Backend APIs for all features
✅ MongoDB schemas for all models
✅ AI engine integration ready
✅ Responsive UI design
✅ Protected routes
✅ Auto-seeding script
✅ Production-ready structure

## 🔜 Future Enhancements

- Monaco Code Editor integration for technical practice
- Voice recognition for HR round
- Real-time code execution sandbox
- More ML model integration
- Video recording for mock interviews
- Peer-to-peer practice
- Company-specific interview prep tracks
- Mobile app (React Native)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React ecosystem for amazing libraries
- MongoDB for flexible database
- Python ML community for AI tools
- Tailwind CSS for rapid styling
- Recharts for beautiful visualizations

---

**Built with ❤️ for Interview Preparation**

For questions or support, please open an issue on GitHub.

Production-ready AI-powered interview simulation platform with React frontend, NodeJS API backend, and Python FastAPI AI engine. See deployment steps and API docs below.
