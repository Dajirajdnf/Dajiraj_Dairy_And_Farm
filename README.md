# 🥛 Dajiraj Dairy & Farm — Full-Stack Dairy Management System

> **"Milking with Care, Farming with Love"**  
> A production-ready, full-stack management solution and public showcase for **Dajiraj Dairy & Farm** — featuring automated subscription deliveries, mobile delivery personnel interface, route tracking, monthly automated billing, inventory management, and customer lead generation.

---

## 🚀 Key Highlights & Features

### 🌐 1. Public Farm Showcase
- **Modern Brand Experience**: Hero with dynamic counter statistics, farm heritage story, Gir cow A2 benefits, and live customer reviews.
- **Product Showcase**: Real-time product catalog for A2 Milk, Vedic Bilona Ghee, Fresh Malai Paneer, Organic Curd, and Farm Butter.
- **Inquiry & Subscription Booking**: Contact and subscription lead form with instant validation and administrative notifications.
- **Story & Heritage**: Farm gallery, ethical milking practices, and pure Vedic dairy traditions.

### 📊 2. Admin & Staff Operations Panel
- **Executive Dashboard**: Real-time KPI cards, daily delivery bar charts, monthly revenue trend line charts, and delivery status pie charts.
- **Customer Directory**: Full CRUD, active/inactive toggles, custom daily milk volumes (in ml with litre equivalents), GPS coordinates, delivery sequence reordering, and delivery boy assignment.
- **Milk Delivery Matrix**: Generate daily delivery batches with one click, filter by date, delivery personnel, and delivery status (Pending, Delivered, Cancelled).
- **Delivery Boys Fleet**: Personnel management, contact details, vehicle numbers, assigned routes, and credentials.
- **Staff Access Control**: Granular permission modules (`customers`, `deliveries`, `products`, `invoices`, `reports`, `inquiries`).
- **Product & Stock Management**: Inventory tracking with real-time low-stock alerts, stock in/out logging with reason audit trails.
- **Billing & Invoices**: Auto-generation of monthly invoices from fulfilled deliveries, payment recording (UPI, Cash, Bank Transfer), printable invoices, and balance tracking.
- **Analytics & Reports**: Visual reports for milk distribution, revenue vs collection, customer growth, and delivery boy performance.
- **Farm Settings**: Business branding, default milk pricing, delivery adjustment step sizes, and SMTP configuration with connection test.

### 📱 3. Mobile Delivery Boy Panel
- **Tailored for On-the-Road Mobile Browsing**: Sticky progress bar showing daily fulfillment status.
- **Quick Quantity Adjustment**: Large `+` / `-` buttons (configurable in 250ml increments) for on-the-spot customer quantity requests.
- **One-Tap Actions**: Direct phone dialing and Google Maps navigation to customer drop-off points.
- **Delivery Confirmation**: One-tap delivery completion with instant feedback and toast alerts.
- **Delivery History & Profile**: Past delivery records review by date and personal password updates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Recharts, React Icons, React Hot Toast, Axios, Date-fns |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Helmet, Express Rate Limit, Express Validator |
| **PDF & Email** | Puppeteer / EJS HTML Invoice templates, Nodemailer SMTP, Node-cron for scheduled billing |
| **Styling & Aesthetics** | Natural Emerald Green (`#2d6a2e`), Golden Warmth (`#d4a843`), Inter and Outfit Google Fonts |

---

## 📁 Repository Structure

```
Dajiraj_Dairy_And_Farm/
├── package.json              # Monorepo scripts (concurrently dev, build, seed)
├── .env                      # Global environment configurations
├── .env.example              # Environment variables template
├── client/                   # Vite + React Frontend
│   ├── index.html            # SEO meta tags, Google Fonts
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite config with Tailwind CSS v4
│   └── src/
│       ├── App.jsx           # Master route registry & auth guards
│       ├── index.css         # Tailwind v4 theme tokens & keyframes
│       ├── components/       # Reusable UI & protected route guards
│       ├── context/          # AuthContext with token refresh & permissions
│       ├── layouts/          # PublicLayout, AdminLayout, DeliveryLayout
│       ├── pages/
│       │   ├── public/       # Home, About, Products, Contact, Inquiry
│       │   ├── auth/         # Login with role redirect
│       │   ├── admin/        # Dashboard, Customers, Deliveries, Boys, Staff, Products, Stock, Invoices, Reports, Settings
│       │   └── delivery/     # DeliveryDashboard, TodayDeliveries, History, Profile
│       └── services/api.js   # Axios instance with auth interceptors
└── server/                   # Node.js + Express + Mongoose Backend
    ├── server.js             # Entry point & port binding
    ├── app.js                # Express app middleware & route mounts
    ├── seed.js               # Database seeder with mock data
    ├── config/               # Database connection & env loader
    ├── controllers/          # Controllers for all business logic
    ├── models/               # Mongoose schemas (Customer, Delivery, Invoice, Product, User, etc.)
    ├── routes/               # API route definitions
    ├── services/             # PDF invoice generation & email mailer
    └── jobs/                 # Cron jobs for monthly billing
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local MongoDB community server running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Installation
Install all root, server, and client dependencies:
```bash
npm run install:all
```

### 3. Configure Environment Variables
Verify `.env` in the root (or `server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dajiraj_dairy
JWT_SECRET=dajiraj_dairy_secret_key_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

### 4. Seed Database with Initial Data
Run the seeder to populate admin, staff, delivery personnel, sample customers, products, and deliveries:
```bash
npm run seed
```

#### 🔑 Default Demo Credentials
| Role | Email / Phone | Password |
|---|---|---|
| **Super Admin** | `admin@dajiraj.com` | `admin123` |
| **Delivery Boy** | `driver@dajiraj.com` | `driver123` |
| **Staff Operator**| `staff@dajiraj.com` | `staff123` |

### 5. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

---

### 📦 Production Build & Deployment

#### 1. Full-Stack Vercel Deployment (Recommended)
This repository is pre-configured with `vercel.json` and `/api/index.js` for zero-configuration full-stack Vercel deployment:
1. Connect your repository to **Vercel**.
2. Set the following **Environment Variables** in Vercel Project Settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string (e.g. 64-byte hex or base64)
   - `CLIENT_URL`: Your Vercel production domain (e.g. `https://dajiraj-dairy.vercel.app`)
   - `CRON_SECRET`: Random string for securing Vercel Cron endpoints
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`: (Optional) For automated invoice emailing
3. Click **Deploy**. Vercel will automatically build the React Vite frontend, mount `/api` to the serverless function handler, and register daily delivery and monthly invoice crons.

#### 2. Traditional Node.js Server / Docker / VPS
For standalone servers:
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

---

## 🛡️ Security & Enterprise Architecture

- **NoSQL Injection Shield**: Deep recursive sanitization middleware on all inputs.
- **Strict Input Validation**: Express-validator schemas on all write endpoints.
- **Mass Assignment Protection**: Controller-level explicit field whitelisting.
- **IDOR Protection**: Role-scoped authorization restricting delivery personnel to assigned routes.
- **Audit Trail**: Persistent `AuditLog` collection tracking admin events, timestamps, and IP addresses.
- **Vercel Cron Automation**: Endpoints `/api/cron/daily-deliveries` and `/api/cron/monthly-invoices` protected by secret tokens.
- **Resilient Invoicing**: Serverless-aware PDF rendering with seamless HTML printable fallback.

For complete documentation:
- 📖 [API Documentation](file:///d:/Dajiraj_Dairy_And_Farm/API_DOCUMENTATION.md)
- 🔒 [Security Audit Report](file:///d:/Dajiraj_Dairy_And_Farm/SECURITY_AUDIT.md)

---

## 📄 License
© 2026 Dajiraj Dairy & Farm. All rights reserved.

