# Project 62 - Code Review Export

This export contains the core Project 62 application code with all secrets removed.

## Structure

```
project62-export/
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Project62Landing.jsx
│   │   │   ├── CustomerLogin.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminSubscriptions.jsx
│   │   │   ├── DigitalCheckout.jsx
│   │   │   ├── MealPrepCheckout.jsx
│   │   │   └── PaymentSuccess.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.js
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── server.py
│   └── project62_api.py
├── firebase/
│   ├── firestore.rules (placeholder)
│   └── firebase-credentials.json.example
└── README.md (this file)
```

## Technology Stack

### Backend (FastAPI + Python)
- **Framework**: FastAPI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT
- **Payments**: Stripe (via emergentintegrations)
- **Email**: SendGrid
- **Storage**: Firebase Storage

### Frontend (React)
- **Framework**: React 19
- **Routing**: React Router DOM v7
- **Styling**: CSS Modules
- **State Management**: Context API (AuthContext)
- **API Client**: Axios

## Key Features

### 1. Lead Generation
- Free 6-Day Starter Guide download
- Email capture with SendGrid integration
- Automatic PDF delivery via email

### 2. Product Management
- **Digital Products**: Downloadable plans (PDFs)
- **Physical Products**: With inventory tracking
- **Meal-Prep Subscriptions**: Week-based pricing tiers
- Dynamic product catalog with categories
- Featured products with smart reordering
- Image uploads to Firebase Storage

### 3. Meal-Prep Subscription System
- Week-based pricing (1, 2, 4, 6 weeks)
- 1 or 2 meals per day options
- Delivery scheduling (6 days/week)
- Loyalty tier system:
  - **Bronze**: 0% discount (0-12 weeks)
  - **Silver**: 5% discount (13-24 weeks)
  - **Gold**: 10% discount (25-36 weeks)
  - **Platinum**: 10% discount + free delivery (37+ weeks)

### 4. Customer Portal
- Firebase Authentication (email/password + magic link)
- Order history and tracking
- Delivery schedule
- Loyalty tier progress
- Address management
- Subscription upgrade/downgrade/cancel

### 5. Admin Dashboard
- Product CRUD (digital, physical, subscription)
- Category management
- Subscription plan configuration
- Lead tracking (CRM)
- Order management
- Delivery tracking
- Customer management
- Discount code creation

### 6. Payment Processing
- Stripe Checkout integration
- One-time payments (digital/physical products)
- Subscription billing (meal-prep plans)
- Webhook handling for payment confirmation
- Auto-renewal logic (scheduled)

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required API keys and credentials:
     - **Stripe**: Get keys from https://dashboard.stripe.com/apikeys
     - **SendGrid**: Get API key from https://app.sendgrid.com/settings/api_keys
     - **Firebase**: Download service account JSON from Firebase Console
     - **JWT Secret**: Generate a secure random string

3. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database
   - Enable Firebase Authentication (Email/Password provider)
   - Enable Firebase Storage
   - Download service account credentials JSON
   - Place credentials file in `backend/project62_assets/project62-firebase-credentials.json`

4. **Run Backend**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   yarn install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required keys:
     - `REACT_APP_BACKEND_URL`: Your backend API URL
     - Firebase config values from Firebase Console > Project Settings
     - Stripe publishable key (starts with `pk_test_` or `pk_live_`)

3. **Run Frontend**
   ```bash
   yarn start
   ```
   Frontend will run on http://localhost:3000

### Firebase Firestore Structure

```
project62/ (document)
├── leads/ (collection)
│   └── all/ (subcollection)
│       └── {lead_id} (document)
├── products/ (collection)
│   └── all/ (subcollection)
│       └── {product_id} (document)
├── categories/ (collection)
│   └── all/ (subcollection)
│       └── {category_id} (document)
├── subscription_plans/ (collection)
│   └── all/ (subcollection)
│       └── {plan_id} (document)
├── dishes/ (collection)
│   └── all/ (subcollection)
│       └── {dish_id} (document)
├── customers/ (collection)
│   └── all/ (subcollection)
│       └── {customer_id} (document)
├── orders/ (collection)
│   └── all/ (subcollection)
│       └── {order_id} (document)
├── deliveries/ (collection)
│   └── all/ (subcollection)
│       └── {delivery_id} (document)
├── payment_transactions/ (collection)
│   └── all/ (subcollection)
│       └── {session_id} (document)
└── discount_codes/ (collection)
    └── all/ (subcollection)
        └── {code_id} (document)
```

## API Endpoints

### Public Endpoints
- `POST /api/project62/leads` - Capture lead and send free guide
- `POST /api/project62/checkout/digital` - Create digital product checkout
- `POST /api/project62/checkout/meal-prep` - Create meal-prep checkout
- `GET /api/project62/checkout/status/{session_id}` - Check payment status
- `GET /api/project62/products/public` - Get public products
- `GET /api/project62/subscriptions/public` - Get subscription plans
- `POST /api/project62/auth/register` - Customer registration
- `POST /api/project62/auth/login` - Customer login
- `POST /api/project62/auth/magic-link` - Send magic link

### Customer Endpoints (Auth Required)
- `GET /api/project62/customer/dashboard` - Get dashboard data
- `PUT /api/project62/customer/address` - Update address
- `GET /api/project62/customer/subscription` - Get subscription details
- `POST /api/project62/customer/subscription/upgrade` - Upgrade plan
- `POST /api/project62/customer/subscription/downgrade` - Downgrade plan
- `POST /api/project62/customer/subscription/cancel` - Cancel auto-renewal

### Admin Endpoints (Admin Auth Required)
- `GET /api/project62/admin/products` - List all products
- `POST /api/project62/admin/products` - Create product
- `PUT /api/project62/admin/products/{id}` - Update product
- `DELETE /api/project62/admin/products/{id}` - Delete product
- `POST /api/project62/admin/products/{id}/upload` - Upload PDF
- `POST /api/project62/admin/products/{id}/upload-image` - Upload image
- `GET /api/project62/admin/subscriptions` - List subscription plans
- `POST /api/project62/admin/subscriptions` - Create subscription plan
- `PUT /api/project62/admin/subscriptions/{id}` - Update subscription
- `GET /api/project62/admin/categories` - List categories
- `POST /api/project62/admin/categories` - Create category
- `GET /api/project62/admin/leads` - List all leads
- `GET /api/project62/admin/orders` - List all orders
- `GET /api/project62/admin/deliveries` - List all deliveries
- `GET /api/project62/admin/customers` - List all customers
- `PUT /api/project62/admin/delivery/{id}/status` - Update delivery status
- `POST /api/project62/admin/discount-codes` - Create discount code
- `GET /api/project62/admin/discount-codes` - List discount codes

## Security Notes

### Production Checklist
1. ✅ All secrets moved to environment variables
2. ✅ Firebase credentials stored securely (not in git)
3. ✅ JWT tokens with expiration (30 days)
4. ✅ Admin role verification on protected endpoints
5. ✅ Stripe webhook signature verification (TODO)
6. ✅ CORS configured for production domain
7. ⚠️ Rate limiting not implemented (TODO)
8. ⚠️ Input sanitization (basic via Pydantic)

### Known Security Improvements Needed
- Implement rate limiting on auth endpoints
- Add Stripe webhook signature verification
- Implement password reset functionality
- Add 2FA for admin accounts
- Implement CSRF protection
- Add comprehensive input validation
- Implement API key rotation strategy

## Deployment Notes

### Backend Deployment
- Runs on FastAPI with Uvicorn
- Requires Python 3.9+
- Environment variables must be set in production
- Firebase credentials JSON must be securely stored
- Supervisor or PM2 recommended for process management

### Frontend Deployment
- Built with `yarn build`
- Static files served via CDN or web server
- Environment variables baked in at build time
- CORS must be configured on backend for production domain

### Scheduled Jobs
- **Auto-Renewal Processing**: Needs cron job or Cloud Scheduler
  - Function: `process_upcoming_renewals()` in `project62_api.py`
  - Frequency: Daily at 00:00 UTC
  - Purpose: Process subscription renewals and charge customers

## Stripe Integration Details

### Products Created
1. **Digital Products**: One-time payment
   - 6-Week Transformation Plan ($14.90 SGD)
   - Custom Plan with Ian ($29.90 SGD)

2. **Meal-Prep Subscriptions**: Week-based pricing
   - 1 Week: $12.00/meal
   - 2 Weeks: $11.50/meal
   - 4 Weeks: $10.80/meal
   - 6 Weeks: $10.00/meal
   - Delivery: $20.00/week

### Webhook Events
- `checkout.session.completed` - Payment successful
- `checkout.session.expired` - Payment failed/abandoned
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

## Testing

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`

### Test Admin Account
Create via backend script:
```bash
python backend/create_correct_admin.py
```

## Support & Contact

- **Project**: Project 62 (Health & Fitness)
- **Developer**: CCC Digital
- **Admin Email**: project62sg@gmail.com
- **WhatsApp**: +65 8982 1301

## License

Proprietary - All rights reserved
