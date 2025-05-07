const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Print current directory
console.log('Current directory:', process.cwd());

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log('Checking for .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Try to load .env file
dotenv.config();
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
