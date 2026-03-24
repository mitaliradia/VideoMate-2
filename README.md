# VideoMate

> **Connect. Chat. Learn.**  
> A full-stack language learning social platform that connects language learners with native speakers worldwide through real-time video calls and smart matching.

## Key Features

### Language Matching
- Matches users based on native and target languages
- Match quality scoring and ranking
- Sorted discovery of optimal language partners

### Real-Time Communication
- One-to-one video calls using Stream.io Video SDK
- Real-time text messaging with chat history
- On-demand message translation support
- Direct video call initiation from chat interface

### Social Functionality
- User connection requests and management
- Real-time notifications
- User profiles with language preferences and bio
- Partner discovery feed based on learning goals

### User Interface
- Responsive design for desktop and mobile
- Theme support
- Smooth UI transitions
- Accessibility-compliant navigation

## Technology Stack

### Frontend
- React 19
- TanStack Query
- Zustand
- React Router
- Tailwind CSS
- DaisyUI
- Stream.io React SDK

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Stream.io Server SDK
- Google Translate API

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or cloud)
- Stream.io account

### Clone Repository
```bash
git clone https://github.com/mitaliradia/videomate-2.git
cd videomate-2
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

npm run dev
```

### Frontend Setup
```env
cd frontend
npm install

# Create .env file
cp .env.example .env

npm run dev
```

### Open Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Configuration
### Backend Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/videomate_db
JWT_SECRET_KEY=your-super-secret-jwt-key
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000
VITE_STREAM_API_KEY=your-stream-api-key
```

## Getting Stream.io Credentials
- Sign up at Stream.io
- Create a new app
- Copy API Key and Secret from the dashboard
- Add them to your environment variables




