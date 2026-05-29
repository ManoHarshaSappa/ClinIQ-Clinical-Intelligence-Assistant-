# 🚀 ClinIQ Deployment Guide

## 📋 Overview
Deploy your ClinIQ Clinical Intelligence Assistant using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway/Render (FastAPI)

## 🎯 Prerequisites
- GitHub account
- Vercel account 
- Railway account (or Render)

---

## 🔧 Step 1: Deploy Backend to Railway

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. Deploy Backend
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to backend folder
cd backend

# Initialize Railway project
railway init

# Deploy
railway up
```

### 3. Set Environment Variables in Railway
In Railway dashboard, add these variables:
```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://pxtldxfprbrcuhnhzzcw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
SUPABASE_Publishable_key=your_supabase_publishable_key
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

### 4. Get Your Backend URL
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 1. Update Environment Variables
Edit `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

### 2. Push to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Import your ClinIQ project
4. Set these environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.railway.app`

### 4. Deploy
Click **Deploy** - Vercel will handle the rest!

---

## ⚡ Alternative: Manual Deployment

### Quick Railway Deploy (No CLI)
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Connect your repository
4. Select `/backend` folder
5. Add environment variables
6. Deploy!

### Quick Vercel Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub repository
4. Framework: **Next.js**
5. Root Directory: `frontend`
6. Add environment variables
7. Deploy!

---

## 🔄 Update Backend CORS

After getting your Vercel URL, update backend environment:

```env
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```

---

## ✅ Verification

1. **Backend Health**: `https://your-backend.railway.app/health`
2. **Frontend**: `https://your-app.vercel.app`
3. **API Connection**: Check dashboard shows patient data

---

## 🔧 Troubleshooting

### CORS Issues
- Ensure backend `ALLOWED_ORIGINS` includes your Vercel URL
- Check frontend `NEXT_PUBLIC_API_URL` points to Railway backend

### Environment Variables
- Backend: Set in Railway dashboard
- Frontend: Set in Vercel dashboard

### Build Failures
- Check `requirements.txt` for backend
- Verify `package.json` for frontend
- Ensure all files are committed to GitHub

---

## 🎉 Success!

Your ClinIQ application is now live:
- 🌐 **Frontend**: Professional healthcare dashboard
- 🔧 **Backend**: Secure AI-powered API  
- 🔒 **Database**: Supabase cloud database
- 🚀 **Performance**: Optimized for production

## 📱 Share Your App
- Frontend URL: `https://your-app.vercel.app`
- API Documentation: `https://your-backend.railway.app/docs`