# ResumAI - Professional Resume Analysis Platform

A full-stack web application that analyzes resumes using AI and provides actionable insights to improve your hiring chances.

## Features

✨ **AI-Powered Analysis** - Uses Google Gemini API to analyze resumes  
🎯 **ATS Optimization** - Scores how well your resume passes ATS systems  
💼 **Job Matching** - Suggests roles that fit your skills  
📊 **Detailed Metrics** - Market impact score, keyword density, formatting feedback  
🔐 **Secure Authentication** - JWT-based auth with MongoDB  
☁️ **Cloud Storage** - All analyses stored in MongoDB Atlas  

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite
- Tailwind CSS
- PDF.js, Mammoth (document parsing)
- Recharts (data visualization)

**Backend:**
- Node.js / Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone / Extract Project

```bash
cd "c:\Users\thanu\Downloads\smart-resume-analyzer (1)"
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Update with your Gemini API key and backend URL

# Start dev server
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Update with your MongoDB connection string and JWT secret

# Start server
npm start
```

Backend runs on: **http://localhost:4000**

## Environment Variables

### Frontend (.env)
```
GEMINI_API_KEY=your_google_gemini_key
VITE_API_URL=http://localhost:4000
```

### Backend (server/.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key
PORT=4000
```

## API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/me` - Get current user (requires token)
- `POST /api/analysis` - Save resume analysis
- `GET /api/analysis/:userId` - Get user's analysis history

## How to Use

1. **Visit http://localhost:3000**
2. **Join ResumAI** or **Sign In**
3. **Upload Resume** - Paste text, upload PDF/DOCX/TXT, or upload image
4. **Get Analysis** - AI analyzes and provides detailed feedback
5. **View Results** - See ATS score, job matches, and improvement recommendations

## Project Structure

```
smart-resume-analyzer/
├── App.tsx                 # Main React component
├── services/
│   ├── geminiService.ts   # AI analysis API
│   └── storageService.ts  # Database & auth
├── components/
│   ├── Layout.tsx         # Header/footer
│   ├── ResumeForm.tsx     # Upload & edit
│   ├── ResultsDashboard.tsx # Results display
│   └── ScoreChart.tsx     # Visualizations
├── types.ts               # TypeScript interfaces
├── vite.config.ts         # Build config
└── server/
    ├── index.js           # Express server
    ├── models/
    │   ├── User.js        # User schema
    │   └── Analysis.js    # Analysis schema
    └── package.json       # Server dependencies
```

## Development

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes to .tsx files auto-reload
- Backend: Use `npm run dev` to enable nodemon watching

### Building for Production

```bash
# Frontend
npm run build
npm run preview

# Backend
npm start
```

## Troubleshooting

**MongoDB Connection Error:**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure credentials are URL-encoded

**Gemini API Errors:**
- Verify API key is valid in Google AI Studio
- Check API key has Generative Language API enabled
- Try the test endpoint: `npm run test` (if available)

**CORS Issues:**
- Backend CORS is enabled for all origins in dev
- Modify `cors()` in server/index.js for production

## Production Checklist

- [ ] Change JWT_SECRET in server/.env
- [ ] Enable HTTPS
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Configure API rate limiting
- [ ] Enable password hashing validation
- [ ] Set up error logging
- [ ] Configure CORS properly
- [ ] Use environment-specific configs

## Support

For issues or feature requests, please open an issue in the repository.

---

Made with ❤️ by ResumAI Team

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
