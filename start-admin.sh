#!/bin/bash

# Start the backend server
cd backend
npm run dev &

# Start the admin panel
cd ../skillswap-admin
npm start &

# Wait for both processes
wait
