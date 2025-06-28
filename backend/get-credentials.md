# Get New Project Credentials

You need to get 2 missing values from your NEW Supabase project:

## 🔑 **Get Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/ozuuombybpfluztjvzdc/settings/api
2. Under **Project API keys**
3. Copy the **service_role** key (secret)
4. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `.env`

## 🔑 **Get JWT Secret:**
1. Same page: https://supabase.com/dashboard/project/ozuuombybpfluztjvzdc/settings/api
2. Under **JWT Settings**
3. Copy the **JWT Secret**
4. Replace `YOUR_JWT_SECRET_HERE` in `.env`

## 📧 **Configure Authentication:**
1. Go to: https://supabase.com/dashboard/project/ozuuombybpfluztjvzdc/auth/providers
2. Click **Email**
3. **Turn OFF** "Confirm email" toggle
4. Save changes

## 🗃️ **Setup Database:**
1. Go to: https://supabase.com/dashboard/project/ozuuombybpfluztjvzdc/sql
2. Copy and paste the contents from `/home/jevenson/dietwise/backend/sql/safe-fresh-setup.sql`
3. Click **RUN**

Once you complete these 4 steps, your fresh DietWise project will be ready to test!