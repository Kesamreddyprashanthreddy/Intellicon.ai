# Backend-Only Deployment to Vercel

This guide covers deploying **only the backend** FastAPI application to Vercel as serverless functions.

## Quick Deployment Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to** https://vercel.com/new
2. **Import** your GitHub repository
3. **Configure Project:**
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: *(leave empty)*
   - Output Directory: *(leave empty)*
   - **Override** `vercel.json` location or use `vercel-backend.json`

4. **Deploy!**

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy using the backend-only config
vercel --prod --config vercel-backend.json

# OR rename the config file
mv vercel-backend.json vercel.json
vercel --prod
```

## Your Backend API URL

After deployment, your backend will be accessible at:

```
https://your-project-name.vercel.app/
```

**All your API endpoints will be available at the root:**
- `https://your-project-name.vercel.app/health`
- `https://your-project-name.vercel.app/upload`
- `https://your-project-name.vercel.app/summarize`
- `https://your-project-name.vercel.app/analyze`
- `https://your-project-name.vercel.app/documents`
- etc.

## Environment Variables

If your backend needs any API keys or environment variables:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add any required variables:
   - `OPENAI_API_KEY` (if using OpenAI)
   - Any other API keys your app needs

## Update Frontend to Use Deployed Backend

After deploying, update your frontend to point to the Vercel backend URL.

In your frontend code, update the API base URL:

```javascript
// In your frontend configuration
const API_URL = 'https://your-project-name.vercel.app';

// Example API call
fetch(`${API_URL}/upload`, {
  method: 'POST',
  body: formData
});
```

## Project Structure

```
.
├── api/
│   └── index.py              # Vercel serverless function entry
├── backend/
│   ├── main.py              # Your FastAPI app
│   ├── requirements.txt     # Python dependencies
│   ├── database.py
│   ├── utils.py
│   └── ...                  # Other backend files
├── vercel-backend.json      # Backend-only Vercel config
└── BACKEND-DEPLOYMENT.md    # This file
```

## How It Works

1. **Vercel reads** `api/index.py` as the entry point
2. **`api/index.py` imports** your FastAPI app from `backend/main.py`
3. **All routes** are handled by the serverless function
4. **Each request** spawns a function instance (cold start on first request)

## Testing Your Deployment

```bash
# Test health endpoint
curl https://your-project-name.vercel.app/health

# Should return: {"status":"ok"}
```

## Important Notes

### ⚠️ Database Persistence

Your SQLite database (`documents.db`) **will NOT persist** on Vercel serverless functions. Each function invocation may get a fresh filesystem.

**Solutions for Production:**
- **Vercel Postgres** - Native integration
- **Supabase** - PostgreSQL with REST API
- **MongoDB Atlas** - Free cloud MongoDB
- **PlanetScale** - MySQL-compatible serverless DB
- **Neon** - Serverless PostgreSQL

### Cold Starts

First request after inactivity may take 2-5 seconds (cold start). Subsequent requests are fast.

### File Size Limits

- Max request size: **4.5 MB** (Free plan) / **100 MB** (Pro)
- Max function duration: **10 seconds** (Free) / **60 seconds** (Pro)

### CORS Configuration

Your backend already has CORS enabled for all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If you want to restrict to your frontend domain only:

```python
allow_origins=["https://your-frontend-domain.com"],
```

## Deployment Commands Cheat Sheet

```bash
# Deploy to production
vercel --prod

# Deploy to preview (staging)
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm your-deployment-url
```

## Frontend Deployment Options

Since you're deploying backend separately, you can host your frontend on:
- **Netlify** (great for React/Vite)
- **Vercel** (separate project)
- **GitHub Pages**
- **Cloudflare Pages**
- **Firebase Hosting**

## Troubleshooting

**Build Fails:**
- Check `requirements.txt` has all dependencies
- Verify Python version compatibility (3.9)
- Check Vercel build logs

**API Returns 404:**
- Ensure `api/index.py` exists
- Check routes configuration in `vercel-backend.json`

**Timeout Errors:**
- OCR/processing might exceed 10s limit on free plan
- Consider upgrading to Pro or optimizing code

**Database Issues:**
- Remember: SQLite won't persist
- Migrate to cloud database for production

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **FastAPI + Vercel:** https://vercel.com/docs/frameworks/python
- **Vercel Support:** https://vercel.com/support

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Get your backend URL
3. ✅ Update frontend API configuration
4. ✅ Deploy frontend separately (if needed)
5. ✅ Set up production database
6. ✅ Test all endpoints

