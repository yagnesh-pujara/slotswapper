# SlotSwapper Backend

Backend API for SlotSwapper - A peer-to-peer time slot scheduling application.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events

- `GET /api/events` - Get user's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Swaps

- `GET /api/swaps/swappable-slots` - Get available slots
- `POST /api/swaps/request` - Create swap request
- `GET /api/swaps/requests` - Get swap requests
- `POST /api/swaps/response/:id` - Respond to swap request

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
backend/
├── models/           # Mongoose models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── tests/            # Test files
├── server.js         # Entry point
└── package.json      # Dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT tokens | - |
| NODE_ENV | Environment (development/production) | development |
| FRONTEND_URL | Frontend URL for CORS | <http://localhost:5173> |

## License

