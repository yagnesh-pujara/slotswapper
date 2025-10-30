# SlotSwapper Frontend

A React-based frontend for SlotSwapper - A peer-to-peer time slot scheduling application built with Vite, React, and Tailwind CSS.

## 🚀 Features

- 🔐 **User Authentication** - JWT-based signup and login
- 📅 **Calendar Management** - Create, edit, and delete time slots
- 🛒 **Marketplace** - Browse and request available slots
- 🔄 **Swap System** - Request and respond to swap requests
- ⚡ **Real-time Updates** - Socket.IO integration for live notifications
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🌙 **Animations** - Smooth transitions and loading states

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing  
- **Tailwind CSS** - Styling
- **Axios** - API client
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/slotswapper.git
cd slotswapper/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Configure environment variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── pages/          # Route components
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── index.html
└── package.json
```

## 🔨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## 🎨 UI Components

### Layout Components

- `Layout` - Main layout with navigation
- `ProtectedRoute` - Route guard for authenticated users

### Feature Components

- `CreateEventModal` - Create new time slots
- `SwapRequestModal` - Request slot swaps
- `Marketplace` - Browse available slots
- `Dashboard` - Manage personal slots

### Context Providers

- `AuthProvider` - Authentication state
- `SocketProvider` - Real-time updates

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | <http://localhost:5000/api> |
| VITE_SOCKET_URL | Socket.IO server URL | <http://localhost:5000> |

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

### Deploying to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**

- GitHub: [@yagnesh-pujara](https://github.com/yagnesh-pujara)

## 🙏 Acknowledgments

- React and Vite teams for amazing tools
- Tailwind CSS for styling utilities
- Socket.IO for real-time capabilities
