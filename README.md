# SkillSwap Platform

SkillSwap is a platform that connects freelancers with clients seeking their services. This project is built using the MERN stack (MongoDB Atlas, Express, React, Node.js) and includes features like authentication, project management, real-time bidding, messaging, and more.

## Features

### Client Features
- Role-Based Authentication (JWT + Hashing)
- Freelancer Search & Filtering System
- Project Posting (CRUD)
- Real-Time Bidding System
- In-App Messaging
- Review & Rating System
- Analytics Dashboard

### Freelancer Features
- Profile Management (CRUD)
- Bid Management
- Project Management Tools
- Project Timeline

### Admin Features
- Freelancer Verification
- Platform Analytics
- Notification System

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- Socket.io for real-time features
- Chart.js for data visualization

### Backend
- Node.js with Express
- MongoDB Atlas for database
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for real-time communication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd WebA3
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../skillswap
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd ../skillswap
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

### Backend
- `server.js` - Entry point for the Express server
- `config/` - Configuration files (database connection, etc.)
- `models/` - MongoDB models (User, Project, Bid, etc.)
- `controllers/` - Route controllers
- `routes/` - API routes
- `middleware/` - Custom middleware (auth, error handling, etc.)
- `utils/` - Utility functions

### Frontend
- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/context/` - React context for state management
- `src/services/` - API services
- `src/layouts/` - Layout components
- `src/assets/` - Static assets

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `PUT /api/projects/:id/status` - Update project status
- `POST /api/projects/:id/milestones` - Add milestone to project
- `PUT /api/projects/:id/milestones/:milestoneId` - Update milestone status

### Bids
- `GET /api/projects/:projectId/bids` - Get all bids for a project
- `POST /api/projects/:projectId/bids` - Create a bid
- `GET /api/bids/:id` - Get a single bid
- `PUT /api/bids/:id` - Update a bid
- `DELETE /api/bids/:id` - Delete a bid
- `PUT /api/bids/:id/accept` - Accept a bid
- `PUT /api/bids/:id/reject` - Reject a bid
- `PUT /api/bids/:id/counter` - Counter offer on a bid
- `PUT /api/bids/:id/accept-counter` - Accept counter offer

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with a user
- `POST /api/messages/:userId` - Send a message
- `GET /api/messages/unread` - Get unread message count
- `PUT /api/messages/:userId/read` - Mark messages as read

## License

This project is licensed under the MIT License.

## Acknowledgements

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)
- [Chart.js](https://www.chartjs.org/)

