# Clerk Authentication Setup for Pensift

## Quick Setup Instructions

### 1. Create a Clerk Account

1. Go to https://dashboard.clerk.com
2. Sign up for a free account
3. Click "Create Application"
4. Choose "Email" as your authentication method
5. Complete the setup

### 2. Get Your API Keys

1. Go to **API Keys** in the Clerk dashboard
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cd frontend
touch .env.local
```

Add these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Update Allowed URLs

In the Clerk dashboard:

1. Go to **Settings** → **Paths**
2. Add to **Allowed Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/sign-in`
   - `http://localhost:3000/sign-up`
   - `http://localhost:3000/sso-callback`

### 5. Start the Application

```bash
cd /Users/apple/Desktop/mini
./start.sh
```

## What You'll Get

✅ **Secure Authentication** - No manual JWT handling
✅ **User Management** - Clerk handles all user operations
✅ **Social Logins** - Easy to add Google, GitHub, etc.
✅ **Session Management** - Automatic session handling
✅ **User Profile** - Built-in user profiles

## Testing the Application

1. Navigate to http://localhost:3000
2. Click "Sign In" in the navbar
3. Create your account
4. Start using Pensift!

## Switching to SQLite

For now, the application uses SQLite for easy testing. The database file will be created automatically at `backend/pensift.db`.

No PostgreSQL setup required!
