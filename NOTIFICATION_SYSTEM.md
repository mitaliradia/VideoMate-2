# VideoMate - Notification System Explained

## 🔔 Overview

The VideoMate notification system tracks **friend requests** and notifies users when:
1. Someone sends them a friend request (Incoming)
2. Their friend request is accepted (Accepted)

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User A sends                  Database stores              │
│  friend request                FriendRequest                │
│       │                              │                      │
│       ▼                              ▼                      │
│   Frontend             ┌──────────────────────────┐        │
│   Button Click    ─────┤ FriendRequest Model:     │        │
│                        │  • sender (User A)       │        │
│                        │  • recipient (User B)    │        │
│                        │  • status: 'pending'     │        │
│                        │  • timestamps            │        │
│                        └──────────────────────────┘        │
│                              │                              │
│       ┌──────────────────────┴──────────────────────┐       │
│       │                                             │       │
│       ▼                                             ▼       │
│   User B Opens              Navbar shows badge    │
│   Notifications Page         (Red dot with count) │
│       │                                             │       │
│       └────────────────────┬────────────────────────┘       │
│                           │                                 │
│                    React Query Fetches                      │
│                    Friend Requests Data                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ FriendRequest Model (Backend)

**File:** `backend/src/models/FriendRequest.js`

```javascript
{
  sender: {
    type: ObjectId,        // Reference to User who sends request
    required: true
  },
  recipient: {
    type: ObjectId,        // Reference to User who receives request
    required: true
  },
  status: {
    type: String,          // 'pending' or 'accepted'
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  timestamps: true         // createdAt, updatedAt
}
```

---

## 2️⃣ Backend Routes (Express)

**File:** `backend/src/routes/user.route.js`

### Route 1: Send Friend Request
```
POST /api/users/friend-request/:id
Triggered When: User A clicks "Add Friend" button on User B's card
Payload: None (userId from URL param)
Auth: Required (JWT)

Function: sendFriendRequest()
├─ Check: Not sending to self
├─ Check: User not already friend
├─ Check: No existing request
└─ Create: New FriendRequest doc in DB
```

### Route 2: Get All Pending & Accepted Requests
```
GET /api/users/friend-requests
Triggered When: NotificationsPage component mounts
Auth: Required (JWT)

Function: getFriendRequest()
├─ Get Incoming Requests (pending, where current user = recipient)
│  └─ Populate: sender info (name, avatar, languages)
│
└─ Get Accepted Requests (accepted, where current user = sender)
   └─ Populate: recipient info (name, avatar)

Returns:
{
  incomingReqs: [
    {
      _id: "req123",
      sender: { fullName, profilePic, nativeLanguage, learningLanguage },
      status: "pending"
    }
  ],
  acceptedReqs: [
    {
      _id: "req456",
      recipient: { fullName, profilePic },
      status: "accepted"
    }
  ]
}
```

### Route 3: Accept Friend Request
```
PUT /api/users/friend-request/:id/accept
Triggered When: User B clicks "Accept" button in NotificationsPage
Payload: None (requestId from URL param)
Auth: Required (JWT)

Function: acceptFriendRequest()
├─ Verify: requester is the recipient
├─ Update: status = 'accepted'
├─ Add User A to User B's friends array
└─ Add User B to User A's friends array
    (Using MongoDB $addToSet operator - prevents duplicates)
```

---

## 3️⃣ Database Query Details

### Incoming Requests Query
```javascript
// User B's incoming friend requests
FriendRequest.find({
  recipient: currentUserId,      // Where I am the recipient
  status: 'pending'              // Only pending requests
}).populate('sender', 'fullName profilePic nativeLanguage learningLanguage')

// Returns array of requests FROM other users TO me
```

### Accepted Requests Query
```javascript
// Requests I sent that were accepted
FriendRequest.find({
  sender: currentUserId,         // Where I am the sender
  status: 'accepted'             // Only accepted requests
}).populate('recipient', 'fullName profilePic')

// Returns array of people who accepted MY requests
```

---

## 4️⃣ Frontend API Calls

**File:** `frontend/src/lib/api.js`

```javascript
export async function getFriendRequests() {
  const response = await axiosInstance.get('/users/friend-requests');
  return response.data;
  // Returns: { incomingReqs: [], acceptedReqs: [] }
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
  // Returns: FriendRequest object
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
  // Returns: { message: "Friend request accepted" }
}
```

---

## 5️⃣ Notification Display in Navbar

**File:** `frontend/src/components/Navbar.jsx`

### Step 1: Fetch Notifications
```javascript
const {data: friendRequests} = useQuery({
  queryKey: ['friendRequests'],
  queryFn: getFriendRequests,
  enabled: !!authUser                    // Only fetch if user logged in
});
```

### Step 2: Calculate Badge Count
```javascript
const notificationCount = 
  (friendRequests?.incomingReqs?.length || 0) +   // Pending requests to me
  (friendRequests?.acceptedReqs?.length || 0);    // Requests I sent that are accepted
```

### Step 3: Display Badge
```jsx
<Link to={'/notifications'} className='relative'>
  <button className='btn btn-ghost btn-circle'>
    <BellIcon className='h-6 w-6' />
    {notificationCount > 0 && (
      <span className='absolute -top-1 -right-1 
                       bg-red-500 text-white text-xs 
                       rounded-full h-5 w-5 
                       flex items-center justify-center'>
        {notificationCount > 9 ? '9+' : notificationCount}
      </span>
    )}
  </button>
</Link>
```

**Visual Result:**
```
🔔 (Bell icon with red dot showing "3")
```

---

## 6️⃣ Notifications Page

**File:** `frontend/src/pages/NotificationsPage.jsx`

### Step 1: Fetch & Cache Data
```javascript
const { data: friendRequests, isLoading } = useQuery({
  queryKey: ['friendRequests'],
  queryFn: getFriendRequests
});

const incomingRequests = friendRequests?.incomingReqs || [];
const acceptedRequests = friendRequests?.acceptedReqs || [];
```

### Step 2: Display Incoming Friend Requests
```jsx
{incomingRequests.length > 0 && (
  <section className='space-y-4'>
    <h2 className='text-xl font-semibold'>
      Friend Requests ({incomingRequests.length})
    </h2>
    
    {incomingRequests.map((request) => (
      <div className='card'>
        <div className='card-body'>
          {/* User Avatar & Info */}
          <img src={request.sender.profilePic} />
          <h3>{request.sender.fullName}</h3>
          
          {/* Language Badges */}
          <span>Native: {request.sender.nativeLanguage}</span>
          <span>Learning: {request.sender.learningLanguage}</span>
          
          {/* Accept Button */}
          <button onClick={() => acceptRequestMutation(request._id)}>
            Accept
          </button>
        </div>
      </div>
    ))}
  </section>
)}
```

### Step 3: Display Accepted Notifications
```jsx
{acceptedRequests.length > 0 && (
  <section className='space-y-4'>
    <h2 className='text-xl font-semibold'>
      New Connections ({acceptedRequests.length})
    </h2>
    
    {acceptedRequests.map((notification) => (
      <div className='card'>
        <img src={notification.recipient.profilePic} />
        <h3>{notification.recipient.fullName}</h3>
        <p>accepted your friend request</p>
        <span className='badge badge-success'>New Friend</span>
      </div>
    ))}
  </section>
)}
```

### Step 4: Handle Accept Action
```javascript
const { mutate: acceptRequestMutation } = useMutation({
  mutationFn: acceptFriendRequest,
  onSuccess: () => {
    // Refresh both notifications and friends list
    queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    queryClient.invalidateQueries({ queryKey: ['friends'] });
  }
});
```

---

## 📋 Complete User Flow Example

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP-BY-STEP FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: User A Sends Request                              │
│  ──────────────────────────────                             │
│  • User A browses Home Page                                │
│  • Sees User B in recommendations                          │
│  • Clicks "Add Friend" button                              │
│  • Frontend: POST /api/users/friend-request/userBId       │
│  • Backend: Creates FriendRequest doc                      │
│  • MongoDB: Stores:                                        │
│      {                                                     │
│        sender: userA_id,                                  │
│        recipient: userB_id,                               │
│        status: "pending"                                  │
│      }                                                     │
│                                                             │
│  STEP 2: Navbar Shows Badge                                │
│  ────────────────────────                                  │
│  • User B opens VideoMate                                  │
│  • Navbar mounts & fetches friend requests                │
│  • Backend: GET /api/users/friend-requests                │
│  • Frontend receives:                                      │
│      {                                                     │
│        incomingReqs: [                                     │
│          {                                                 │
│            _id: "req123",                                  │
│            sender: { fullName: "User A", ... },           │
│            status: "pending"                              │
│          }                                                 │
│        ],                                                  │
│        acceptedReqs: []                                    │
│      }                                                     │
│  • Navbar calculates: notificationCount = 1               │
│  • Shows red badge with "1"                               │
│                                                             │
│  STEP 3: User B Views Notifications                        │
│  ─────────────────────────────                             │
│  • User B clicks bell icon 🔔                              │
│  • Navigates to /notifications                            │
│  • NotificationsPage fetches friend requests             │
│  • Displays:                                              │
│      ┌─────────────────────────────┐                      │
│      │ Friend Requests             │                      │
│      │                             │                      │
│      │ [Avatar] User A             │                      │
│      │ Native: Spanish             │                      │
│      │ Learning: English           │                      │
│      │ [Accept Button]             │                      │
│      └─────────────────────────────┘                      │
│                                                             │
│  STEP 4: User B Accepts Request                            │
│  ────────────────────────────────                           │
│  • User B clicks "Accept"                                  │
│  • Frontend: PUT /api/users/friend-request/req123/accept │
│  • Backend:                                                │
│      1. Verifies User B is recipient ✓                    │
│      2. Updates status = "accepted"                       │
│      3. Adds User B to User A's friends array             │
│      4. Adds User A to User B's friends array             │
│  • MongoDB FriendRequest: status now = "accepted"         │
│  • MongoDB User A: friends array now includes User B      │
│  • MongoDB User B: friends array now includes User A      │
│                                                             │
│  STEP 5: Cache Invalidation & Refresh                      │
│  ──────────────────────────────────                         │
│  • React Query invalidates:                               │
│      - 'friendRequests' cache                             │
│      - 'friends' cache                                    │
│  • Components automatically refetch                       │
│  • User B sees:                                           │
│      ┌─────────────────────────────┐                      │
│      │ New Connections             │                      │
│      │                             │                      │
│      │ [Avatar] User A             │                      │
│      │ accepted your friend request│                      │
│      │ [New Friend Badge]          │                      │
│      └─────────────────────────────┘                      │
│                                                             │
│  STEP 6: Both Can Now Chat                                 │
│  ────────────────────────                                  │
│  • User A and User B appear in each other's friends list │
│  • Both can now:                                          │
│      - Open chat with each other                          │
│      - Start video calls                                  │
│      - See each other's full profiles                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Updates (How It Works)

> **Note:** VideoMate currently uses polling via React Query, NOT WebSockets

### How It Works Now:
```javascript
// Navbar fetches every time component mounts
const { data: friendRequests } = useQuery({
  queryKey: ['friendRequests'],
  queryFn: getFriendRequests,
  enabled: !!authUser
});

// Fresh data on every navigation or page refresh
```

### What Happens:
1. User A clicks "Add Friend" ✓
2. Request stored in DB ✓
3. User B needs to **refresh page** or **navigate** to see notification
4. Then badge appears 🔔

### Future Enhancement (WebSockets):
To make it **real-time** without refreshing:
```javascript
// Pseudo code - NOT implemented yet
useEffect(() => {
  socket.on('friendRequestReceived', (request) => {
    queryClient.invalidateQueries(['friendRequests']);
  });
}, []);
```

---

## 🎯 Key Points Summary

| Aspect | Details |
|--------|---------|
| **Model** | FriendRequest with sender, recipient, status |
| **Pending Status** | Request waiting for acceptance |
| **Accepted Status** | User accepted, both are now friends |
| **Storage** | MongoDB FriendRequest collection |
| **API Calls** | GET (fetch), POST (send), PUT (accept) |
| **Frontend Cache** | React Query manages data + invalidation |
| **Notification Badge** | Red dot in navbar with count |
| **Display** | Dedicated /notifications page |
| **Real-Time?** | NO - Requires page refresh/navigation |
| **Toasts** | Using react-hot-toast for feedback |

---

## 🚀 Future Improvements

1. **WebSocket Integration** - Real-time notifications without refresh
2. **Reject Friend Request** - Add reject functionality
3. **Sound Alerts** - Play sound when request received
4. **Desktop Notifications** - Browser push notifications
5. **Email Notifications** - Send email when request received
6. **Notification History** - Keep archive of all notifications
7. **Auto-accept Trusted Users** - Whitelist for auto-acceptance
8. **Block Users** - Block unwanted friend requests

---

**The notification system is simple but effective for MVP! 🎉**
