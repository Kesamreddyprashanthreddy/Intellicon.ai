# Deployment Guide for Intellicon.ai

## Vercel Deployment

This project is configured to deploy both frontend and backend to Vercel.

### Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub repository connected to Vercel
3. Required environment variables

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository: `Kesamreddyprashanthreddy/Intellicon.ai`
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: (leave default, uses vercel.json)
   - **Output Directory**: (leave default, uses vercel.json)

4. Add Environment Variables (if needed):
   - `OPENAI_API_KEY` - Your OpenAI API key (if using GPT models)
   - Any other API keys your backend requires

5. Click **Deploy**

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Environment Variables

For the backend to work properly on Vercel, you need to set these environment variables in your Vercel project settings:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Project Structure

```
.
├── api/
│   └── index.py          # Vercel serverless function entry point
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt # Python dependencies
│   └── ...              # Other backend files
├── frontend/
│   ├── src/            # React source code
│   ├── dist/           # Build output
│   └── package.json    # Node dependencies
├── vercel.json         # Vercel configuration
└── README.md
```

### How It Works

1. **Frontend**: Built as a static site using Vite
   - All React code is compiled to static HTML/JS/CSS
   - Served from `frontend/dist/`

2. **Backend**: Runs as Vercel Serverless Functions
   - Python FastAPI app is wrapped as a serverless function
   - Accessible at `/api/*` routes
   - Each request spawns a new function instance

### API Endpoints

Once deployed, your API will be available at:
- Production: `https://your-project.vercel.app/api/`
- Development: `http://localhost:4000/` (when running locally)

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Troubleshooting

**Build Fails:**
- Check that all dependencies are listed in `requirements.txt` and `package.json`
- Verify Node.js version (requires >=18.0.0)

**API Not Working:**
- Ensure environment variables are set in Vercel dashboard
- Check serverless function logs in Vercel dashboard

**CORS Issues:**
- The backend is configured to allow all origins
- If you need to restrict, update CORS settings in `backend/main.py`

### Database Considerations

Note: The SQLite database used locally won't persist on Vercel (serverless functions are stateless).

For production, consider:
1. **Vercel Postgres** - Native Vercel database
2. **MongoDB Atlas** - Cloud MongoDB
3. **Supabase** - Open-source Firebase alternative
4. **PlanetScale** - MySQL-compatible serverless database

### Performance Optimization

- Frontend assets are automatically cached and served via Vercel's CDN
- API responses can be cached using Vercel's Edge Cache
- Consider upgrading to Vercel Pro for better performance

### Support

For issues or questions:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Repository: https://github.com/Kesamreddyprashanthreddy/Intellicon.ai

