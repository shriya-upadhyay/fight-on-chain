# Deploy to Vercel - Step by Step

## Prerequisites
- Your contract deployed to Sepolia (already done ✅)
- Environment variables ready

## Method 1: Using Vercel CLI (Fastest)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```
This will open your browser to authenticate.

### Step 3: Navigate to web directory
```bash
cd web
```

### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Choose your account
- **Link to existing project?** → `N` (No, create new)
- **Project name?** → `fight-on-chain` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → `N` (No)

### Step 5: Add Environment Variables

After the first deployment, add your environment variables:

1. Go to https://vercel.com/dashboard
2. Click on your project (`fight-on-chain`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

```
NEXT_PUBLIC_CONTRACT_ADDRESS = 0xYourContractAddress
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_project_id (or leave empty for placeholder)
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
NEXT_PUBLIC_ENABLE_TESTNETS = true
```

5. **Important:** Make sure to select **Production**, **Preview**, and **Development** for each variable

### Step 6: Redeploy
```bash
vercel --prod
```

Your app is now live! 🎉

---

## Method 2: Using GitHub (Recommended for Updates)

### Step 1: Push to GitHub
```bash
# From the root of your project
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub account and repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `web` ⚠️ **Important!**
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Step 3: Add Environment Variables
Before clicking "Deploy", click **Environment Variables** and add:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENABLE_TESTNETS`

### Step 4: Deploy
Click **Deploy** and wait for the build to complete.

---

## After Deployment

### Your app URL will be:
`https://your-project-name.vercel.app`

### To update your app:
**Method 1 (CLI):**
```bash
cd web
vercel --prod
```

**Method 2 (GitHub):**
Just push to your main branch:
```bash
git push origin main
```
Vercel will automatically redeploy! 🚀

---

## Troubleshooting

### Build fails with "Cannot find module"
- Make sure you're deploying from the `web` directory
- Or set **Root Directory** to `web` in Vercel settings

### Environment variables not working
- Make sure they start with `NEXT_PUBLIC_` for client-side variables
- Check that they're set for **Production**, **Preview**, and **Development**
- Redeploy after adding variables

### Contract not found
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct
- Make sure the contract is deployed on Sepolia

### Wallet connection issues
- Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set (or using placeholder)
- Users must be on Sepolia network

---

## Quick Checklist

- [ ] Vercel CLI installed or GitHub repo ready
- [ ] Environment variables prepared
- [ ] Deployed to Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] Redeployed after adding variables
- [ ] Tested the live URL
- [ ] Shared with your club! 🎉

