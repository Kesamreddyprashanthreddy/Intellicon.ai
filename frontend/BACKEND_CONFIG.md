# Backend Configuration

## Current Backend URL
The frontend is configured to use the deployed backend at:
**https://intellicon-ai-2.onrender.com**

## Configuration Location
The backend URL is configured in `src/App.jsx`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://intellicon-ai-2.onrender.com";
```

## Environment Variable Override (Optional)
You can override the backend URL by creating a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
VITE_API_BASE_URL=https://your-custom-backend-url.com
```

## Local Development
If you want to use a local backend during development:

1. Create a `.env.local` file:
```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:4000
```

2. Or modify the default value in `src/App.jsx`

## Backend Health Check
The backend provides these endpoints:
- Health: `https://intellicon-ai-2.onrender.com/health`
- API Docs: `https://intellicon-ai-2.onrender.com/docs`

## Testing Connection
To test if the frontend can connect to the backend:
1. Start the frontend: `npm run dev`
2. Open the browser console and check for any API errors
3. Try uploading a test document

## Notes
- The backend URL should NOT have a trailing slash
- Environment variables must start with `VITE_` to be accessible in Vite
- Changes to `.env` files require a server restart

