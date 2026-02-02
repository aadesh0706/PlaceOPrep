# MongoDB Setup Required

## ⚠️ MongoDB is not running

The PlaceOPrep project requires MongoDB to be running. Please start MongoDB before using the application.

## Quick Start MongoDB

### Option 1: If MongoDB is installed as a service

```powershell
# Start MongoDB service
Start-Service MongoDB

# Or if service name is different
net start MongoDB
```

### Option 2: If MongoDB is installed but not as a service

```powershell
# Find MongoDB installation (common locations)
# C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe
# C:\mongodb\bin\mongod.exe

# Start MongoDB manually
mongod --dbpath "C:\data\db"
```

### Option 3: Install MongoDB

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Create data directory: `mkdir C:\data\db`
4. Start MongoDB: `mongod --dbpath C:\data\db`

### Option 4: Use MongoDB Atlas (Cloud)

1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placeoprep
   ```

## After Starting MongoDB

Once MongoDB is running, run:

```powershell
cd backend
node seed.js
```

This will seed the database with initial questions and data.

## Verify MongoDB is Running

```powershell
# Test connection
Test-NetConnection -ComputerName localhost -Port 27017
```

Should return `TcpTestSucceeded : True`

## Current Services Status

- ✅ Backend: Starting on port 4000
- ✅ AI Engine: Starting on port 5000  
- ✅ Frontend: Starting on port 5173
- ❌ MongoDB: Not running (needs to be started)

Once MongoDB is running, all services will be ready!
