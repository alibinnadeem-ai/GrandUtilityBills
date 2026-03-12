# Grand City Dashboard - Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Install Dependencies
```bash
cd grand-city-dashboard
npm install
```

### Step 2: Test Locally
```bash
npm run dev
```
Visit http://localhost:3000 to verify everything works.

### Step 3: Deploy to Vercel (Easiest & Recommended)

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Website
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository (or upload the folder)
4. Vercel will auto-detect Vite
5. Click "Deploy"

Your site will be live at: https://your-project-name.vercel.app

---

## 🌐 Alternative Deployment Options

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist` folder on https://app.netlify.com/drop

---

### cPanel / Traditional Hosting

1. Build the project:
```bash
npm run build
```

2. Upload contents of `dist` folder to your hosting via FTP

3. Configure `.htaccess` (for Apache):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### GitHub Pages

1. Add to package.json:
```json
"homepage": "https://yourusername.github.io/grand-city-dashboard",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Update vite.config.js:
```javascript
base: '/grand-city-dashboard/'
```

4. Deploy:
```bash
npm run deploy
```

---

## ⚙️ Environment-Specific Configurations

### For Production Build
The production build is already optimized:
- Minified code
- Code splitting
- Tree shaking
- Asset optimization

### Custom Domain Setup (Vercel)
1. Go to your project on Vercel
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

---

## 📊 Performance Optimization

The build includes:
- React vendor chunk separation
- Icon library chunk separation
- Terser minification
- No source maps in production

---

## 🔍 Troubleshooting

**Build fails?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Routing issues after deployment?**
- Ensure your hosting has SPA redirect rules
- Check vercel.json or netlify.toml is present

**Assets not loading?**
- Verify base path in vite.config.js
- Check public folder is included in build

---

## 📱 Testing Before Deployment

```bash
# Build and preview production build locally
npm run build
npm run preview
```

Visit http://localhost:4173 to test the production build.

---

## 🔒 Security Notes

- All data is stored in browser localStorage
- No backend or API calls
- No sensitive data exposed
- HTTPS recommended for production

---

## 📞 Support

For deployment issues, contact:
- Email: ali@grandcity.pk
- Check README.md for detailed documentation

---

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Local testing passed (`npm run dev`)
- [ ] Production build successful (`npm run build`)
- [ ] Preview build tested (`npm run preview`)
- [ ] Deployment method chosen
- [ ] Custom domain configured (if needed)
- [ ] HTTPS enabled
- [ ] Data backup created (Export feature)
- [ ] Browser testing (Chrome, Firefox, Safari, Mobile)

---

## 🎯 Recommended: Vercel Deployment

**Why Vercel?**
- Automatic HTTPS
- Global CDN
- Zero configuration
- Automatic deployments from Git
- Free for personal/commercial use
- Perfect for React/Vite apps

**Deployment Time: ~2 minutes**

Happy Deploying! 🚀
