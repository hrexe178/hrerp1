# 🚨 URGENT FIX: Incorrect Backend URL on Netlify

The error message proves that your Netlify site is trying to connect to a **placeholder URL**:
`https://your-backend.vercel.app`

This means the Environment Variable on Netlify is **WRONG**. You must change it to your actual Vercel URL.

### **Step 1: Copy Your Vercel URL**
Your actual backend URL is:
👉 **`https://hrerp1.vercel.app`**

### **Step 2: Go to Netlify Dashboard**
1. Open your site: **wonderful-haupia-647cea**
2. Click **Site configuration** (in the left menu or top tabs).
3. Click **Environment variables**.

### **Step 3: Fix the Variable**
1. Find `REACT_APP_API_URL`.
2. check its value. Is it "https://your-backend.vercel.app"? **IT IS WRONG.**
3. Click **Edit** (pencil icon).
4. Change the value to:
   **`https://hrerp1.vercel.app`**
5. Click **Save**.

### **Step 4: REDEPLOY (CRITICAL!)**
Changing the variable DOES NOT fix the live site automatically.

1. Go to the **Deploys** tab.
2. Click **Trigger deploy**.
3. Select **"Clear cache and deploy site"**.
4. **WAIT** for the build to finish (Status: Published).

### **Step 5: Verify**
Once the new deploy is live:
1. Reload your website.
2. Try to Login.

It should now connect to `hrerp1.vercel.app` instead of "your-backend".
