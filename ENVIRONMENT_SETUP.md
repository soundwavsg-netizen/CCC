# Environment Setup Guide

This guide explains how to set up your local development environment for the Project 62 application.

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <repo-directory>
```

### 2. Set Up Environment Variables

#### Backend Environment Variables
```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` and fill in your actual API keys and credentials:

**Required Keys:**
- `STRIPE_API_KEY` - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret (starts with `whsec_`)
- `SENDGRID_API_KEY` - Your SendGrid API key (starts with `SG.`)
- `PROJECT62_JWT_SECRET` - A secure random string for JWT signing
- `FIREBASE_WEB_API_KEY` - Your Firebase Web API key
- `NOTION_TOKEN` - Your Notion integration token (starts with `ntn_`)

**Optional Keys (for additional features):**
- `SENDER_EMAIL` / `SENDER_PASSWORD` - Gmail SMTP credentials for email notifications
- `CALLMEBOT_API_KEY` / `CALLMEBOT_PHONE_NUMBER` - WhatsApp notification credentials
- `EMERGENT_LLM_KEY` - Universal key for OpenAI, Anthropic, Gemini LLMs

#### Frontend Environment Variables
```bash
cd frontend
cp .env.example .env
```

Then edit `frontend/.env` and fill in:

**Required Keys:**
- `REACT_APP_BACKEND_URL` - Your backend URL (e.g., `https://your-app.preview.emergentagent.com`)
- `REACT_APP_FIREBASE_API_KEY` - Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_test_` or `pk_live_`)

### 3. Install Dependencies

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
yarn install
```

## Where to Get API Keys

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy your **Secret key** for `STRIPE_API_KEY`
4. Copy your **Publishable key** for `REACT_APP_STRIPE_PUBLISHABLE_KEY`
5. For webhook secret: Developers → Webhooks → Add endpoint → Copy signing secret

### SendGrid
1. Go to [SendGrid](https://app.sendgrid.com/)
2. Navigate to Settings → API Keys
3. Create a new API key with "Full Access"
4. Copy the key for `SENDGRID_API_KEY`

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (project62-ccc-digital)
3. Go to Project Settings (⚙️ icon)
4. Under "General" tab, scroll to "Your apps" → Web app
5. Copy the config values:
   - `apiKey` → `REACT_APP_FIREBASE_API_KEY` and `FIREBASE_WEB_API_KEY`
   - `authDomain` → `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `REACT_APP_FIREBASE_PROJECT_ID` and `FIREBASE_PROJECT_ID`
   - `storageBucket` → `REACT_APP_FIREBASE_STORAGE_BUCKET`

### Firebase Admin SDK Credentials
1. In Firebase Console → Project Settings
2. Navigate to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `/app/backend/project62_assets/project62-firebase-credentials.json`

### Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration or use existing
3. Copy the "Internal Integration Token" for `NOTION_TOKEN`
4. Share your Notion databases with this integration

## Security Best Practices

### ⚠️ NEVER Commit Secrets
- `.env` files are gitignored and should **NEVER** be committed
- Always use `.env.example` as templates (without actual keys)
- If you accidentally commit secrets, rotate all keys immediately

### 🔐 Key Rotation
Regularly rotate your API keys, especially:
- After team member changes
- If keys are accidentally exposed
- Every 90 days for production keys

### 🔒 Environment-Specific Keys
- Use **test/development** keys for local development
- Use separate **production** keys for live deployment
- Never mix test and production keys

## Troubleshooting

### "Environment variable is required but not set"
This error means a required key is missing from your `.env` file. Check the error message to see which variable is needed, then add it to the appropriate `.env` file.

### Backend won't start
1. Verify all required environment variables are set in `backend/.env`
2. Check that Firebase credentials file exists at the path specified
3. Ensure MongoDB is running if using local MongoDB

### Frontend can't connect to backend
1. Check that `REACT_APP_BACKEND_URL` in `frontend/.env` matches your backend URL
2. Ensure backend is running
3. Check for CORS issues in backend logs

## Getting Help

- For Firebase setup: [Firebase Documentation](https://firebase.google.com/docs)
- For Stripe integration: [Stripe API Docs](https://stripe.com/docs/api)
- For SendGrid: [SendGrid Docs](https://docs.sendgrid.com/)
- For Notion API: [Notion API Docs](https://developers.notion.com/)

---

**Last Updated**: November 6, 2025
