# SlotSwapper - Peer-to-Peer Time Slot Scheduling

A full-stack application that allows users to swap calendar time slots with each other through a marketplace-style interface.

## 🚀 Live Demo

- **Frontend:** [Your Vercel URL]
- **Backend:** [Your Render URL]

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)
- [Challenges & Solutions](#challenges--solutions)

## ✨ Features

### Core Features

- 🔐 **User Authentication** - JWT-based signup and login
- 📅 **Event Management** - Create, update, and delete calendar events
- 🔄 **Status Management** - Mark events as BUSY, SWAPPABLE, or SWAP_PENDING
- 🛒 **Marketplace** - Browse and request swappable slots from other users
- 🤝 **Swap System** - Request, accept, or reject slot swaps
- 📬 **Notifications** - View incoming and outgoing swap requests
- ⚡ **Real-time Updates** - State automatically updates after swap actions
- 🔔 **Real-time Notifications (Socket.IO)**

## 🛠 Tech Stack

### Frontend

- **React 18** with Vite
- **React Router** v6 for routing
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Socket.IO Client** for real-time updates

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Socket.IO** for real-time communication

### DevOps

- **Vercel** for frontend deployment
- **Render** for backend deployment
- **MongoDB Atlas** for database hosting

## 🏗 Architecture Overview

### Database Schema

```
User
├── name: String
├── email: String (unique, indexed)
├── password: String (hashed)
└── createdAt: Date

Event
├── title: String
├── startTime: Date
├── endTime: Date
├── status: Enum ['BUSY', 'SWAPPABLE', 'SWAP_PENDING']
├── userId: ObjectId (ref: User)
└── createdAt: Date

SwapRequest
├── requesterId: ObjectId (ref: User)
├── requestedUserId: ObjectId (ref: User)
├── requesterSlotId: ObjectId (ref: Event)
├── requestedSlotId: ObjectId (ref: Event)
├── status: Enum ['PENDING', 'ACCEPTED', 'REJECTED']
└── createdAt: Date
```

### Key Design Decisions

1. **Atomic Swap Transactions**: Used MongoDB transactions to ensure both events are swapped atomically, preventing inconsistent states.

2. **SWAP_PENDING Status**: Prevents slots from being involved in multiple simultaneous swap requests, avoiding race conditions.

3. **JWT Authentication**: Stateless authentication with tokens stored in localStorage and sent via Authorization headers.

4. **Socket.IO Rooms**: Each user joins a room with their userId for targeted real-time notifications.

5. **Separate Frontend/Backend**: Decoupled architecture allows independent scaling and deployment.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/slotswapper.git
cd slotswapper
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

**Backend Environment Variables** (create `backend/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/slotswapper
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/slotswapper
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Start Backend:**

```bash
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

**Frontend Environment Variables** (create `frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Start Frontend:**

```bash
npm run dev
# App runs on http://localhost:5173
```

## 📡 API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: "jwt_token", user: { id, name, email } }
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: "jwt_token", user: { id, name, email } }
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { id, name, email }
```

### Events

#### Get My Events

```http
GET /api/events
Authorization: Bearer <token>

Response: [{ id, title, startTime, endTime, status, userId }]
```

#### Create Event

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "startTime": "2025-11-01T10:00:00Z",
  "endTime": "2025-11-01T11:00:00Z"
}

Response: { id, title, startTime, endTime, status: "BUSY", userId }
```

#### Update Event

```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "SWAPPABLE"
}

Response: { id, title, startTime, endTime, status, userId }
```

#### Delete Event

```http
DELETE /api/events/:id
Authorization: Bearer <token>

Response: { message: "Event deleted" }
```

### Swaps

#### Get Swappable Slots (Marketplace)

```http
GET /api/swaps/swappable-slots
Authorization: Bearer <token>

Response: [{
  id,
  title,
  startTime,
  endTime,
  status: "SWAPPABLE",
  userId,
  user: { name, email }
}]
```

#### Create Swap Request

```http
POST /api/swaps/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "mySlotId": "event_id_1",
  "theirSlotId": "event_id_2"
}

Response: {
  id,
  requesterId,
  requestedUserId,
  requesterSlotId,
  requestedSlotId,
  status: "PENDING"
}
```

#### Get My Swap Requests

```http
GET /api/swaps/requests
Authorization: Bearer <token>

Response: {
  incoming: [{ id, requester: {...}, requesterSlot: {...}, requestedSlot: {...}, status }],
  outgoing: [{ id, requestedUser: {...}, requesterSlot: {...}, requestedSlot: {...}, status }]
}
```

#### Respond to Swap Request

```http
POST /api/swaps/response/:requestId
Authorization: Bearer <token>
Content-Type: application/json

{
  "accept": true  // or false to reject
}

Response: { message: "Swap accepted", swapRequest: {...} }
```

## 🔐 Security Considerations

- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens expire after 30 days
- API endpoints are protected with authentication middleware
- Input validation on all endpoints
- CORS configured to allow only frontend origin
- MongoDB injection prevention via Mongoose
- Rate limiting should be added for production

## 🐛 Challenges & Solutions

### Challenge 1: Race Conditions in Swap Requests

**Problem:** Two users could simultaneously request the same slot, causing conflicts.

**Solution:** Implemented `SWAP_PENDING` status that locks slots immediately upon request creation. Used MongoDB transactions to ensure atomicity.

### Challenge 2: State Synchronization

**Problem:** Frontend state becoming stale after swap operations.

**Solution:** Implemented Socket.IO for real-time notifications and automatic state refresh after all swap-related actions.

### Challenge 3: Ownership Transfer Logic

**Problem:** Swapping slot ownership while maintaining referential integrity.

**Solution:** During swap acceptance, we swap the `userId` fields of both events rather than moving data, preserving all event details and relationships.

### Challenge 4: Handling Rejected Swaps

**Problem:** Returning slots to marketplace after rejection.

**Solution:** Reset both event statuses from `SWAP_PENDING` back to `SWAPPABLE` when a swap is rejected, making them available again.

## 🚀 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`

### Frontend (Vercel)

1. Import GitHub repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

### Database (MongoDB Atlas)

1. Create free cluster on MongoDB Atlas
2. Add database user
3. Whitelist IP addresses (0.0.0.0/0 for testing)
4. Get connection string and update `MONGODB_URI`


## 📄 License

MIT License - feel free to use this project for learning purposes.

## 👤 Author

**Your Name**

- GitHub: [@yagnesh-pujara](https://github.com/yagnesh-pujara)

## 🙏 Acknowledgments

- ServiceHive for the interesting technical challenge
- The open-source community for amazing tools and libraries

---
