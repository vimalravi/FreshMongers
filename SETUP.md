# FreshMongers Setup Guide

## Step-by-Step Installation

### Step 1: Prerequisites

**Windows:**
```bash
# Install Node.js 18+ from https://nodejs.org
# Install MySQL Community Server from https://dev.mysql.com/downloads/mysql/

# Verify installations
node --version
npm --version
mysql --version
```

**macOS (using Homebrew):**
```bash
brew install node
brew install mysql

# Start MySQL
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install nodejs npm
sudo apt-get install mysql-server

# Start MySQL
sudo systemctl start mysql
```

### Step 2: MySQL Database Setup

```bash
# Login to MySQL
mysql -u root -p
# Enter your MySQL root password

# Create database and user
CREATE DATABASE freshmongers_db;
CREATE USER 'freshmongers'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON freshmongers_db.* TO 'freshmongers'@'localhost';
FLUSH PRIVILEGES;

# Import schema
SOURCE /path/to/db/schema.sql;

# (Optional) Import sample data
SOURCE /path/to/db/seed.sql;

# Verify
SHOW TABLES;
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit .env file:**
```
DB_HOST=localhost
DB_USER=freshmongers
DB_PASSWORD=your_secure_password
DB_NAME=freshmongers_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

CORS_ORIGIN=http://localhost:3000

# Leave these empty for now (Firebase setup later)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PAYMENT_UPI_ID=freshmongers@upi
PAYMENT_BANK_ACCOUNT=1234567890
PAYMENT_BANK_IFSC=SBIN0001234

WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_PHONE_NUMBER=919999999999
```

**Start backend:**
```bash
npm run dev
# Server will run on http://localhost:5000
```

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Edit .env.local file:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Firebase (leave empty for now)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
NEXT_PUBLIC_UPI_ID=freshmongers@upi

NEXT_PUBLIC_APP_NAME=FreshMongers
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Start frontend:**
```bash
npm run dev
# Frontend will run on http://localhost:3000
```

## Testing the Application

### 1. Test Backend

**Check API is running:**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","message":"FreshMongers Backend is running"}
```

**Test Authentication:**
```bash
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"9999999999",
    "name":"Test User",
    "email":"test@example.com"
  }'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

### 2. Test Frontend

Visit `http://localhost:3000` in your browser

- Homepage should load with featured products
- Click "Products" to see product listing
- Click "Login" to test authentication
- Use phone: `9999999999` to login

## Optional: Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Name: "FreshMongers"
4. Enable Analytics (optional)
5. Wait for project creation

### 2. Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable "Phone" authentication
3. Enable "Google" authentication (optional)

### 3. Get Firebase Credentials

**For Backend:**
1. Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the JSON file contents
4. Extract fields into .env:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

**For Frontend:**
1. Project Settings → Your apps → Web
2. Copy the config
3. Add to .env.local:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## Optional: Cloudinary Setup

### 1. Create Cloudinary Account

1. Visit [Cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard

### 2. Get Credentials

1. Copy "Cloud Name"
2. Go to Settings → API Keys
3. Copy "API Key" and "API Secret"

### 3. Update Environment Variables

Backend .env:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend .env.local:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Common Issues & Solutions

### Issue: Database Connection Error

**Solution:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check credentials in .env file
# Make sure DB_USER and DB_PASSWORD are correct
```

### Issue: Port Already in Use

**Backend (Port 5000):**
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Issue: CORS Error

**Solution:**
Make sure `CORS_ORIGIN` in backend .env matches frontend URL:
```
CORS_ORIGIN=http://localhost:3000
```

### Issue: Module Not Found

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Database Backup & Restore

### Backup
```bash
mysqldump -u freshmongers -p freshmongers_db > backup.sql
```

### Restore
```bash
mysql -u freshmongers -p freshmongers_db < backup.sql
```

## Production Deployment

### Backend Deployment (Heroku)

```bash
# Initialize git in backend
cd backend
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create freshmongers-api

# Set environment variables
heroku config:set DB_HOST=db_host
heroku config:set DB_USER=db_user
heroku config:set DB_PASSWORD=db_password
heroku config:set JWT_SECRET=secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment (Vercel)

```bash
cd frontend
npm install -g vercel

vercel --prod
```

During deployment, add these environment variables in Vercel dashboard.

### Database (AWS RDS or DigitalOcean)

1. Create MySQL instance
2. Get connection details
3. Update .env with production credentials
4. Restore database with schema.sql

## Next Steps

1. ✅ Setup is complete!
2. Configure Firebase for authentication
3. Setup Cloudinary for image uploads
4. Add more products via admin panel
5. Setup payment gateway
6. Configure WhatsApp integration
7. Deploy to production

## Support

For issues or questions:
- Check logs: `npm run dev` output
- Enable debug mode in .env
- Check database: `mysql -u root -p freshmongers_db`
