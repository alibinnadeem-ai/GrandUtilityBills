# Grand City Management System

A comprehensive building management dashboard for managing bills, owners, rent, and maintenance across multiple properties.

## 🏢 Features

- **28 Pre-loaded Bills**: Electricity, PTCL, Gas, and Water bills
- **5 Buildings**: Plaza 170, 171, 172, 38 N Cantt View, and 129/7 D
- **4 Owners**: Complete contact information and building assignments
- **Smart Notifications**: 7-day advance alerts and overdue tracking
- **Advanced Filtering**: Filter by building, type, and status
- **Mobile Responsive**: Works perfectly on all devices
- **Data Persistence**: LocalStorage for automatic saving
- **Export/Import**: Backup and restore your data

## 📊 Bill Types Covered

- ⚡ **Electricity** (16 bills) - Eurobiz Corporation & Guardian Developer
- 📞 **PTCL** (6 bills) - Telephone and Internet services
- 🔥 **Gas** (3 bills) - Natural gas utility
- 💧 **Water** (3 bills) - Municipal water supply

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm installed
- Git (optional, for version control)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Run Development Server**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

Follow the prompts to deploy. Your app will be live in seconds!

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build and Deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json scripts**
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/grand-city-dashboard/', // Your repo name
  // ... rest of config
})
```

4. **Deploy**
```bash
npm run deploy
```

### Option 4: Traditional Hosting (cPanel, etc.)

1. Build the project:
```bash
npm run build
```

2. Upload the contents of the `dist` folder to your web hosting

3. Make sure your server is configured to serve `index.html` for all routes

## 🔧 Configuration

### Customizing Bill Data

Edit the `preloadedBills` array in `src/components/GrandCityDashboard.jsx` to modify initial bill data.

### Customizing Owners

Edit the `initialOwners` array in the same file to update owner information.

### LocalStorage Keys

The app uses these localStorage keys:
- `gcBills` - Bills data
- `gcOwners` - Owners data
- `gcRent` - Rent tracking
- `gcMaintenance` - Maintenance items
- `gcComms` - Communications log

## 📱 Features Overview

### Bills Management
- Add/Edit/Delete bills
- Track payment status
- Filter by building, type, status
- View complete bill details
- Customer IDs and reference numbers

### Owners Management
- Contact information
- Building assignments
- Bill summaries per owner
- Communication tracking
- Quick contact actions

### Rent Tracking
- Current and previous rent
- Automatic percentage increase calculation
- Security deposit tracking
- Due date notifications
- Tenant information

### Maintenance
- Priority-based tracking (High/Medium/Low)
- Assignment and cost tracking
- Due date management
- Status updates

### Communications
- Log owner communications
- Email, phone, meeting, WhatsApp
- Communication history
- Last contact tracking

## 🎨 Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **LocalStorage** - Data persistence

## 📄 Project Structure

```
grand-city-dashboard/
├── public/
├── src/
│   ├── components/
│   │   └── GrandCityDashboard.jsx    # Main dashboard component
│   ├── App.jsx                        # App wrapper
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔒 Data Privacy

All data is stored locally in your browser's LocalStorage. No data is sent to external servers. Use the Export feature to backup your data regularly.

## 🆘 Troubleshooting

**App not loading?**
- Clear browser cache and localStorage
- Check browser console for errors
- Ensure all dependencies are installed

**Data disappeared?**
- Check if localStorage is enabled in your browser
- Restore from an exported JSON backup

**Build fails?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you have Node.js 18 or higher

## 📝 License

This project is private and proprietary to Grand City.

## 👨‍💻 Developer

Built for Grand City by Ali
- Email: ali@grandcity.pk
- Version: 2.0.0
- Last Updated: January 2025

## 🔄 Version History

### v2.0.0 (Current)
- Complete rewrite with all 28 bills
- Added PTCL, Gas, and Water bill types
- Enhanced owner management
- Improved mobile responsiveness
- Added rent tracking module
- Communication logging system
- Advanced filtering and search

### v1.0.0
- Initial release with basic bill management
