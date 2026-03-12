# Grand City Dashboard - Neon + Vercel Deployment Guide

This guide will help you deploy the Grand City Dashboard with Neon PostgreSQL database on Vercel.

## 📋 Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- A [Neon account](https://console.neon.tech/signup) (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

---

## 🚀 Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Project

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click "Create a project"
4. Choose:
   - **Project name**: `grand-city-dashboard`
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
5. Click "Create project"

### 1.2 Get Connection String

1. After project creation, you'll see the dashboard
2. Find "Connection Details" section
3. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 Run Database Schema

1. Go to the **SQL Editor** in Neon console
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** or press `Ctrl+Enter`

This will create all tables, indexes, and triggers needed for the application.

### 1.4 Seed Initial Data (Optional)

After creating the schema, you can seed the initial bills data:

1. After deployment, visit: `https://your-app.vercel.app/api/seed`
2. This will insert the 28 pre-loaded bills into the database

---

## 🔧 Step 2: Configure Environment Variables

### 2.1 For Vercel Deployment

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Value | Environment |
|-----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | All |
| `NODE_ENV` | `production` | Production |

**Important**: Never commit `.env` files to Git!

### 2.2 For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Neon connection string:
   ```
   DATABASE_URL=postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require
   NODE_ENV=development
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

---

## 📦 Step 3: Push Code to Git

1. Initialize Git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Grand City Dashboard with Neon integration"
   ```

2. Create a repository on GitHub/GitLab/Bitbucket
3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/grand-city-dashboard.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Step 4: Deploy to Vercel

### 4.1 Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Your username
   - **Link to existing project?** No
   - **What's your project's name?** `grand-city-dashboard` (or your preferred name)
   - **In which directory is your code located?** `./`
   - **Want to override settings?** No

5. For production:
   ```bash
   vercel --prod
   ```

### 4.2 Using Vercel Dashboard

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect:
   - **Framework**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Click **Deploy**

---

## ⚙️ Step 5: Configure Vercel Project

### 5.1 Add Environment Variables

After project is created:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `DATABASE_URL`: Your Neon connection string
   - `NODE_ENV`: `production`

### 5.2 Verify Build Settings

Go to **Settings** → **Build & Development Settings**:

**Framework Preset**: Vite
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `dist`

---

## ✅ Step 6: Verify Deployment

1. Wait for deployment to complete (usually 1-2 minutes)
2. Visit your app: `https://grand-city-dashboard.vercel.app`
3. Test:
   - [ ] Bills load correctly
   - [ ] Owners load correctly
   - [ ] Can add/edit/delete bills
   - [ ] Can add/edit/delete owners
   - [ ] Maintenance tracking works
   - [ ] Communications work

4. Test API health:
   ```bash
   curl https://grand-city-dashboard.vercel.app/api/health
   ```

Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-xx-xx...",
     "database": "connected",
     "environment": "production"
   }
   ```

5. Seed initial data (optional):
   ```bash
   curl -X POST https://grand-city-dashboard.vercel.app/api/seed
   ```

---

## 📊 Step 7: Monitor and Scale

### Neon Database

- **Free tier**: 0.5 GB storage, 100 hours compute/month
- **Dashboard**: Monitor usage at [https://console.neon.tech](https://console.neon.tech)
- **Scaling**: Upgrade when needed

### Vercel

- **Free tier**: Unlimited deployments, 100GB bandwidth/month
- **Dashboard**: Monitor at [https://vercel.com](https://vercel.com)
- **Logs**: Check deployment logs in Vercel dashboard

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `connection refused` or `password authentication failed`

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check for extra spaces in the connection string
3. Ensure your IP allows outbound connections (usually not needed for Neon)

### API Routes Not Working

**Error**: `404` on API routes

**Solution**:
1. Verify `vercel.json` is in project root
2. Check API files are in `api/` directory
3. Ensure `api/` directory is committed to Git

### Build Failures

**Error**: Build fails in Vercel

**Solution**:
1. Check Vercel deployment logs
2. Verify `package.json` has `type: "module"`
3. Ensure `pg` is in devDependencies
4. Check for syntax errors in API files

### CORS Issues

**Error**: CORS errors in browser console

**Solution**:
1. API routes already include CORS headers
2. If using custom domain, add it to CORS origins
3. Check browser console for specific CORS errors

---

## 🔄 Updates and Re-deployment

### Updating the Application

1. Make changes locally
2. Test: `npm run dev`
3. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. Vercel will auto-deploy on push to main branch

### Updating Database Schema

To modify the database:

1. **NEVER** modify schema directly in production
2. Create a migration script in `database/migrations/`
3. Test migration locally first
4. Apply to production via:
   - Neon SQL Editor, OR
   - Create a migration API endpoint

---

## 🔒 Security Best Practices

1. **Never commit** `.env` files or connection strings
2. **Use different credentials** for dev/staging/production
3. **Regular backups** - Neon provides automatic backups
4. **Monitor access** - Check Vercel analytics
5. **Keep dependencies updated** - `npm audit` and `npm update`

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 💡 Architecture Overview

```
┌─────────────┐         ┌──────────────┐
│   Vercel    │───────▶│   Neon DB    │
│  (Frontend) │  HTTP  │ (PostgreSQL) │
└─────────────┘         └──────────────┘
     │                         │
     ▼                         │
┌─────────────┐         ┌──────────────┐
│  API Routes  │◀──────│  Serverless   │
│ (/api/*)    │         │  Functions   │
└─────────────┘         └──────────────┘
```

- **Vercel** hosts the React frontend (static files)
- **API Routes** (serverless functions) handle database operations
- **Neon** provides PostgreSQL database storage
- **No backend server needed** - Vercel serverless functions handle requests

---

## 📞 Support

For issues or questions:
- **Email**: ali@grandcity.pk
- **Project**: Grand City Building Management System v2.0

---

## ✅ Deployment Checklist

Before deploying, verify:

- [ ] Neon database project created
- [ ] Database schema applied (SQL ran)
- [ ] `.env` file created (local) or variables set (Vercel)
- [ ] Code pushed to Git repository
- [ ] Vercel project connected to Git
- [ ] Environment variables configured in Vercel
- [ ] Build completes successfully
- [ ] API health check passes
- [ ] Frontend loads correctly
- [ ] Can perform CRUD operations

---

**Happy Deploying! 🚀**
