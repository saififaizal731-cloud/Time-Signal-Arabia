# TSA Time Signal Arabia - Deployment Guide

## Deployment Steps

### 1. MongoDB Atlas Setup (Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or sign in
3. Create a new cluster
4. Get your connection string: mongodb+srv://username:password@cluster0.mongodb.net/tsa-ecommerce
5. Save this for environment variables

### 2. Choose Your Hosting Platform

#### Option A: Railway (Recommended)
Railway is simple and supports Node.js + MongoDB perfectly.

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Select your TSA-Time-Signal-Arabia repository
5. Add environment variables:
   - MONGO_URI - Your MongoDB Atlas connection string
   - NODE_ENV - production
   - JWT_SECRET - Generate a strong random string
   - ALLOWED_ORIGINS - Your Railway domain
6. Deploy

#### Option B: Vercel (Frontend Only)
If you want to deploy frontend on Vercel and backend elsewhere:

1. Separate your frontend and backend
2. Deploy frontend to Vercel
3. Deploy backend to Railway/Render
4. Update ALLOWED_ORIGINS to include Vercel domain

#### Option C: Render
Similar to Railway, very beginner friendly.

### 3. Environment Variables

Before deploying, set these on your platform:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/tsa-ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_key_here
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 4. GitHub Push

Make sure to push all changes to GitHub:

```bash
git add .
git commit -m "fix: deployment configuration and environment variables"
git push origin main
```

### 5. Important Notes

⚠️ **File Uploads**: Currently uses local /public/uploads directory.
- For production, consider using:
  - AWS S3
  - Cloudinary (free tier available)
  - MongoDB GridFS
- For now, uploads work on platforms that support persistent storage

✅ **API URL**: Frontend now auto-detects API URL based on current domain
- No need to hardcode URLs
- Works on localhost and production

✅ **CORS**: Now configurable via environment variables
- Add your domain to ALLOWED_ORIGINS

### 6. Post-Deployment Checklist

- [ ] Database is accessible
- [ ] Can create products
- [ ] Can upload images
- [ ] Can register users
- [ ] Admin login works
- [ ] Products display correctly
- [ ] CORS errors? Add domain to ALLOWED_ORIGINS

## Troubleshooting

**"Cannot connect to MongoDB"**
- Check MONGO_URI is correct
- Check MongoDB Atlas network access includes your server's IP

**"CORS error"**
- Add your domain to ALLOWED_ORIGINS environment variable
- Format: https://yourdomain.com,https://www.yourdomain.com

**"Images not loading"**
- Check upload directory has write permissions
- For serverless, upload to external service instead

**"API not responding"**
- Check server logs in deployment platform
- Verify NODE_ENV is set correctly
- Check JWT_SECRET is set

## Production Recommendations

1. Use strong JWT_SECRET (min 32 characters)
2. Enable HTTPS on your domain
3. Set NODE_ENV=production
4. Use MongoDB Atlas (not local MongoDB)
5. Consider adding SSL certificate
6. Monitor error logs regularly
7. Set up backup for database

## Quick Start with Railway

```bash
# 1. Push to GitHub (already done)
# 2. Go to https://railway.app
# 3. New Project → Deploy from GitHub
# 4. Select your repo
# 5. Add env vars (MONGO_URI, JWT_SECRET, ALLOWED_ORIGINS)
# 6. Done! ✅
```

Your app will be live in minutes!
