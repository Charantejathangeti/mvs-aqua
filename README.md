# 🐟 MVS Aqua — Full E-Commerce Platform

> **Charan Aquarium** | Premium Aquatic Store with Admin Console + Real-Time Sync

---

## 🗂️ Project Structure

```
MVS_Aqua/
├── frontend/          → Customer-facing website
├── admin/             → Admin Console
├── backend/           → PHP REST API
├── database/          → SQL schema & seed data
└── docs/              → Documentation
```

---

## 🚀 Quick Start

### 1. Database Setup
```sql
mysql -u root -p < database/schema.sql
```

### 2. Backend Config
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 3. Update API URL
In `frontend/assets/js/api.js`, update:
```js
const API_BASE = 'https://your-backend-url.com';
```

### 4. Update WhatsApp Number
In `frontend/assets/js/checkout.js`:
```js
const WHATSAPP_NUMBER = '91XXXXXXXXXX';
```

---

## 📄 Pages

| Page | URL |
|------|-----|
| Home | `/frontend/index.html` |
| Shop | `/frontend/shop.html` |
| Product | `/frontend/product.html?id=1` |
| Cart | `/frontend/cart.html` |
| Checkout | `/frontend/checkout.html` |
| Confirmation | `/frontend/confirmation.html` |
| Track Order | `/frontend/tracking.html` |
| About | `/frontend/about.html` |
| Contact | `/frontend/contact.html` |
| **Admin** | `/admin/admin.html` |

---

## 🔐 Admin Login
- **URL:** `/admin/admin.html`
- **Username:** `admin`
- **Password:** `admin123`
> ⚠️ Change credentials before going live!

---

## 🛠️ Backend API Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/product.php` | List products |
| POST | `/product.php` | Create product |
| PUT | `/product.php?id=1` | Update product |
| DELETE | `/product.php?id=1` | Delete product |
| GET | `/order.php` | List orders |
| POST | `/order.php` | Create order |
| PUT | `/order.php?id=ORD001` | Update order status |
| GET | `/offers.php` | List active offers |
| PUT | `/stock.php?id=1` | Update stock |
| POST | `/invoice.php` | Create invoice |
| GET | `/tracking.php?order_id=ORD001` | Track order |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
npm install -g vercel
vercel --prod ./frontend
```

### Backend → AWS EC2 / DigitalOcean
- PHP 8.0+ with MySQL
- Configure Apache/Nginx with `/backend` as web root
- Set environment variables in `.env`

### Database → AWS RDS
- MySQL 8.0, db.t3.micro
- Configure security groups for backend access

---

## 🎨 Theme Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Ocean Blue | `#003366` | Primary, navbar, headings |
| Aqua Teal | `#009999` | Secondary, buttons, accents |
| Coral Red | `#FF4C4C` | Accents, offers, alerts |
| Light Gray | `#F5F5F5` | Backgrounds |

---

## 💬 WhatsApp Integration
Orders flow through WhatsApp:
1. Customer fills checkout form
2. Order saved to database
3. WhatsApp opens with pre-filled order message
4. Admin confirms and shares payment details

---

## ✅ Features
- [x] Multi-page responsive frontend
- [x] Admin console with CRUD
- [x] Real-time product/offer/stock sync
- [x] WhatsApp ordering flow
- [x] Order tracking
- [x] Invoice generation & print
- [x] Stock management with low-stock alerts
- [x] REST API backend (PHP/MySQL)
- [x] Works offline with demo data

---

*Built for MVS Aqua (Charan Aquarium) — Made with 🌊*
