# Farmer-AgroScientist Application

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm init -y
   npm install express mongoose cors multer dotenv
   ```
3. Create an `uploads` folder in `backend/`
4. Create `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/farmer-agro
   FRONTEND_URL=http://localhost:3000
   ```
5. Start MongoDB locally
6. Run the server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Start the frontend:
   ```bash
   npm start
   ```

## Features
- User registration/login as Farmer or Agro-Scientist
- Farmers can post queries with images
- Scientists can view and respond to queries
- Image upload support
- Role-based dashboards

## Notes
- Ensure MongoDB is running before starting the backend
- The frontend will run on port 3000 by default
- Environment variables can be modified in respective `.env` files
