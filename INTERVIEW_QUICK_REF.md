# VideoMate - Interview Quick Reference & Cheat Sheet

## 🎯 30-Second Elevator Pitch

> **VideoMate is a real-time video calling and messaging platform for language learners to practice languages with native speakers. It uses Stream.io for WebRTC video/chat and an intelligent matching algorithm to connect users based on their language learning goals.**

---

## 🏗️ Tech Stack - Quick Overview

```
FRONTEND: React 19 + Vite + Tailwind CSS
BACKEND: Express.js + Node.js
DATABASE: MongoDB + Mongoose
REAL-TIME: Stream.io (Video + Chat)
TRANSLATION: Google Translate API
AUTH: JWT + bcryptjs + Cookie-Parser
DEPLOYMENT: (Ready for Docker/AWS/Azure)
```

---

## 🎬 5-Minute Feature Walkthrough

### 1. **Sign Up & Authentication** (30 sec)
- User registers with email, password, name
- Password hashed with bcryptjs (10 salt rounds)
- JWT token generated (7-day expiry)
- Token stored in HTTP-only cookie

### 2. **Onboarding** (30 sec)
- Collect: native language, learning language, location, bio
- Auto-generate avatar using DiceBear API
- Set `isOnboarded = true` in DB
- Create Stream.io user for real-time services

### 3. **Friend Recommendations** (1 min)
- **Perfect Match (Top Priority):**
  ```
  User A's native = User B's learning language
  User A's learning = User B's native language
  ```
- **Partial Match (Second):** One language overlap
- **Algorithm:** Filter + Sort in app layer
- Exclude: self, existing friends, unboarded users

### 4. **Friend Request System** (30 sec)
- User sends request → Receiver gets notification
- Receiver accepts → Both added to friends list
- FriendRequest model tracks: senderId, recipientId, status

### 5. **Real-Time Chat** (1 min)
- Get Stream Chat token from backend
- Connected to Stream.io via WebSocket
- Create/join DM channel with friend
- Real-time message sync, read receipts, typing indicators

### 6. **Video Calling** (1 min)
- Get Stream Video token from backend
- Initialize StreamVideoClient
- Create call by callId (other user's ID)
- WebRTC handles peer-to-peer video/audio
- SpeakerLayout displays both video streams

### 7. **Message Translation** (30 sec)
- User toggles "Translate" checkbox
- Frontend POSTs to `/api/translate/translate`
- Backend calls Google Translate API
- Display both original & translated message

---

## 💻 Key Code Patterns

### Authentication Pattern
```javascript
// Backend
const token = jwt.sign({userId: newUser._id}, JWT_SECRET, {expiresIn: '7d'});
const hashedPassword = await bcryptjs.hash(password, 10);

// Middleware
jwt.verify(token, JWT_SECRET); // Validates token
const userId = decoded.userId;
```

### API Call Pattern
```javascript
// Frontend
const {data} = useQuery({
  queryKey: ['friends'],
  queryFn: () => axios.get('/api/users/friends'),
  enabled: !!authUser  // Only fetch when user is authenticated
});

// Backend
app.get('/api/users/friends', authMiddleware, async (req, res) => {
  const currentUserId = req.user.id;  // From JWT
  const friends = await User.findById(currentUserId).populate('friends');
  res.json(friends);
});
```

### Real-Time Connection Pattern
```javascript
// Get token
const token = await getStreamToken();

// Initialize client
const client = new StreamVideoClient({
  apiKey: STREAM_API_KEY,
  token: token,
  user: authUser
});

// Join call
const call = client.call('default', callId);
await call.join();
```

---

## 🔐 Security Checklist

✅ **Password Security:** Hashed with bcryptjs (salt=10)  
✅ **JWT Security:** Signed with secret, 7-day expiry  
✅ **Token Storage:** HTTP-only cookies (not localStorage)  
✅ **Input Validation:** Email regex, password length, required fields  
✅ **CORS:** Enabled with credentials  
✅ **Middleware:** Auth check on protected routes  
✅ **Data Privacy:** Stream.io handles secure video/chat  

---

## 📊 Database Models (3 Main)

### User Model
```
{
  _id: ObjectId,
  fullName: string,
  email: string (unique),
  password: string (hashed),
  profilePic: string (avatar URL),
  nativeLanguage: string,
  learningLanguage: string,
  location: string,
  bio: string,
  friends: [ObjectId],        // Array of User IDs
  isOnboarded: boolean,
  createdAt, updatedAt
}
```

### FriendRequest Model
```
{
  _id: ObjectId,
  senderId: ObjectId (ref User),
  recipientId: ObjectId (ref User),
  status: "pending" | "accepted" | "rejected",
  createdAt, updatedAt
}
```

### Stream.io Models (Managed by Stream)
```
Chat Channel: DM between two users
Video Call: P2P video by callId
Messages: Stored in Stream infrastructure
```

---

## 🔄 Main API Endpoints (12 Total)

```
POST   /api/auth/signup           → Register
POST   /api/auth/login            → Login
POST   /api/auth/logout           → Logout

GET    /api/users/recommendations → Get friend suggestions (language-matched)
GET    /api/users/friends         → Get my friends list
POST   /api/users/friend-request/:id    → Send friend request
POST   /api/users/accept-request/:id    → Accept request
POST   /api/users/onboard         → Complete onboarding

POST   /api/chat/token            → Get Stream chat token
POST   /api/chat/get-stream-token → Get Stream video token

POST   /api/translate/translate   → Translate message
```

---

## 🎨 Component Tree (Frontend)

```
App.jsx (Router)
├── Layout
│   ├── Navbar
│   └── Sidebar
├── HomePage
│   ├── FriendCard (maps recommended users)
│   └── CallButton
├── ChatPage
│   ├── Chat (Stream.io component)
│   │   ├── MessageList
│   │   ├── MessageInput
│   │   └── CustomMessage (with translate)
│   └── CallButton
├── CallPage
│   ├── StreamVideo
│   │   └── SpeakerLayout
│   └── CallControls
├── FriendsPage
│   └── FriendCard (maps friends)
├── NotificationsPage
│   └── Friend requests
├── OnboardingPage
│   └── Multi-step form
└── LoginPage / SignUpPage
```

---

## ⚡ Performance Optimizations

| Optimization | How |
|---|---|
| **Build Size** | Vite for fast bundling |
| **Lazy Loading** | React Router code splitting |
| **Caching** | React Query caches API responses |
| **Real-time Sync** | WebSocket (no polling) |
| **Image Optimization** | DiceBear auto-generated avatars |
| **Theme State** | Lightweight Zustand store |
| **Database Queries** | Indexed email field, filtered queries |

---

## 🐛 Common Interview Q&A

### Q1: How would you handle 100K concurrent users?
**A:** 
- Horizontal scaling: Multiple Express instances behind load balancer
- Database: MongoDB sharding by userId
- Real-time: Stream.io auto-scales (that's their job)
- Cache: Redis for frequently accessed data
- CDN: Serve static assets from edge locations

### Q2: What if Stream.io goes down?
**A:**
- Implement fallback: Store messages locally in IndexedDB
- Retry logic with exponential backoff
- User notification: "Offline mode - messages will sync"
- Alternative: Self-host Jitsi for video or Socket.io for chat

### Q3: Security concerns?
**A:**
- Rate limiting on auth endpoints
- HTTPS communication only
- Input sanitization to prevent XSS
- SQL injection: Mongoose prevents (uses document validation)
- CSRF: JWT-based auth is stateless (no CSRF)
- Add: Rate limiter, helmet.js for headers

### Q4: What about message persistence?
**A:**
- Stream.io handles message storage
- Can backup to MongoDB if needed
- Read receipts & typing indicators are real-time
- Message history loaded on chat open

### Q5: How to improve recommendation algorithm?
**A:**
- Current: Perfect match → Partial → None
- Improvements:
  - Add: User rating/reviews
  - Add: Time zone compatibility
  - Add: Interest tags matching
  - ML: Collaborative filtering
  - A/B test different algorithms

### Q6: Offline support?
**A:**
- Service Worker for offline pages
- IndexedDB to store messages locally
- Sync queue when back online
- Currently: Online-only (future enhancement)

### Q7: What about video recording?
**A:**
- Stream.io supports recording
- Add POST endpoint for recording storage
- Requires user consent (UI checkbox)
- Store in Azure Blob/S3
- Privacy: Only record if both parties agree

### Q8: Scaling database from MongoDB to PostgreSQL?
**A:**
- Mongoose abstraction helps (ORM layer)
- Schema migration tool needed
- Business logic: ~80% portable
- Queries: Rewrite for SQL
- Relationships: Better with PostgreSQL
- Cost: Consider time vs money

---

## 🎓 Things to Emphasize in Interview

### ✨ **What You Built:**
1. Full-stack from scratch (not tutorial code)
2. Real-time communication (not just CRUD)
3. Complex matching algorithm
4. Third-party integrations (Stream.io, Google Translate)
5. Production-ready architecture (separate controllers, models, routes)

### 💡 **Lessons Learned:**
1. Importance of architecture (separation of concerns)
2. Real-time challenges & solutions
3. Trade-offs (Stream.io vs self-hosted)
4. Scaling considerations

### 🔍 **Problem-Solving:**
1. Identified pain point (language learning)
2. Designed solution (connectivity platform)
3. Implemented incrementally
4. Handled complexity (video, chat, translation)

### 📈 **What's Next:**
1. Analytics & progress tracking
2. Gamification (streaks, badges)
3. Mobile app (React Native)
4. AI-powered matching
5. Monetization (premium features)

---

## 📋 During Interview - Quick Checklist

- [ ] Start with elevator pitch
- [ ] Explain **problem & solution** first
- [ ] Deep dive on **technical implementation**
- [ ] Discuss **challenges & how you solved them**
- [ ] Mention **third-party integrations**
- [ ] Talk about **scalability**
- [ ] Ask **interviewer questions** to show interest
- [ ] Emphasize **learning & growth**
- [ ] Be honest about **what you'd do differently**

---

## 🚀 Ready for Interview? Checklist

```
[ ] Understand overall architecture
[ ] Know all 12 API endpoints by heart
[ ] Explain friend recommendation algorithm
[ ] Describe JWT auth flow
[ ] Explain Stream.io integration (why, not how)
[ ] Talk about database models
[ ] Discuss performance optimizations
[ ] Have examples ready (code snippets)
[ ] Prepare for "production readiness" Q
[ ] Think about scaling to 1M users
[ ] Be ready to trade-off suggestions
```

---

## 💬 Conversation Starters (If Needed)

1. **"Let me tell you about the matching algorithm..."**
2. **"The biggest challenge was real-time state management..."**
3. **"For scaling, we'd need..."**
4. **"If I were to rebuild this, I'd use..."**
5. **"The most interesting part was..."**

---

**Good luck with your interview! 🎉**

*Remember: Companies hire for potential. Show your problem-solving approach, not just code. Be honest. Ask questions. Listen.*
