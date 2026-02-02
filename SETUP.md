# PlaceOPrep - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Python 3.8+

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
Create `.env` file:
```
MONGO_URI=mongodb://127.0.0.1:27017/placeoprep
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
PY_ENGINE_URL=http://localhost:5000
PORT=4000
NODE_ENV=development
```

3. **Seed Database**
```bash
node seed.js
```

4. **Start Backend**
```bash
npm run dev
```

Backend will run on `http://localhost:4000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Frontend**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### AI Engine Setup

1. **Install Python Dependencies**
```bash
cd ai-engine
pip install -r requirements.txt
```

2. **Start AI Engine**
```bash
python app.py
```

AI Engine will run on `http://localhost:5000`

## 📁 Project Structure

```
PlaceOPrep/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── server.js        # Main server file
│   └── seed.js          # Database seeding
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app
│   └── package.json
└── ai-engine/
    ├── app.py          # Flask server
    ├── models/         # ML models
    └── requirements.txt
```

## 🎯 Features Implemented

### ✅ Authentication System
- JWT-based authentication
- User registration & login
- Protected routes
- Session management

### ✅ Dashboard
- KPI cards (Total Interviews, Practice Time, Average Score, Best Score)
- Quick start buttons for each round type
- Recent sessions list
- Skill assessment radar chart
- Progress over time line chart
- Achievements preview

### ✅ Practice System
- Technical Round (with code editor)
- HR Round (behavioral questions)
- Aptitude Round (MCQ & reasoning)
- General Interview
- Full Simulation mode

### ✅ Question Bank
- Filterable questions
- Category, difficulty, company filters
- 20+ seeded questions

### ✅ History
- Session history
- Performance metrics
- Detailed feedback view

### ✅ Achievements
- 12 achievement types
- Progress tracking
- Gamification system

### ✅ Backend APIs
- `/api/auth` - Authentication
- `/api/sessions` - Practice sessions
- `/api/questions` - Question management
- `/api/achievements` - Achievement tracking
- `/api/analytics` - Dashboard & analytics

## 🗄️ Database Models

1. **User** - User profiles with stats
2. **Session** - Practice session records
3. **Question** - Question bank
4. **Achievement** - User achievements
5. **Skill** - Skill progress tracking
6. **Result** - Session results

## 🔑 Default Test User

After seeding, you can register a new user or create one manually.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Sessions
- `POST /api/sessions/start` - Start practice session
- `POST /api/sessions/submit` - Submit session
- `GET /api/sessions` - Get user sessions

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/random` - Get random question
- `GET /api/questions/:id` - Get question by ID

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/skills` - User skills
- `GET /api/analytics/detailed` - Detailed analytics

### Achievements
- `GET /api/achievements` - Get user achievements

## 🎨 UI Components

- Sidebar navigation
- Dashboard with charts (Recharts)
- Practice selection cards
- Code editor (Monaco Editor - coming in technical round)
- Achievement cards
- Session history table

## 🚢 Deployment

### Backend
1. Set production environment variables
2. Use PM2 or similar for process management
3. Deploy to any Node.js hosting (Heroku, DigitalOcean, AWS, etc.)

### Frontend
1. Run `npm run build`
2. Deploy `dist` folder to any static hosting (Vercel, Netlify, etc.)
3. Update API URL in production

### Database
- Use MongoDB Atlas for production
- Update MONGO_URI in backend .env

## 📝 Notes

- All backend APIs are secured with JWT
- Frontend uses Axios interceptors for auth
- Charts use Recharts library
- UI uses Tailwind CSS
- Icons from Lucide React

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env

**Port Already in Use:**
- Change PORT in backend .env
- Update API_URL in frontend

**CORS Issues:**
- Backend has CORS enabled for all origins in development
- Configure properly for production

## 📧 Support

For issues, check the console logs in both backend and frontend.

---

**Built with ❤️ for Interview Preparation**
