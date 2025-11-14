Technical approach (200 words)

This application separates concerns between a lightweight Express backend and a modern React frontend. The backend accepts file uploads, determines the file type, and extracts text using two proven approaches: `pdf-parse` to parse textual PDFs and `tesseract.js` for OCR on images. Using tesseract.js keeps the stack JavaScript-only and avoids a Python dependency, simplifying deployment.

Summarization leverages the Hugging Face Inference API (model: `facebook/bart-large-cnn`) through server-side calls. The backend maps user-selected summary lengths (short/medium/long) to inference parameters (min/max lengths) and returns the generated summary. If a Hugging Face key is not configured, the server returns a safe fallback summary to preserve UX while signaling the missing key.

The frontend is built with Vite, React hooks, and Tailwind for a clean, responsive UI. Users drag-and-drop or pick a file; the client sends the file to `/upload`, displays extracted text, and offers a summary length control. The `/summarize` route returns the AI summary. No user data is stored long-term (uploads are removed immediately). The architecture supports swapping models (OpenAI or HF) by adding env keys, and it’s designed for deployment to Vercel/Netlify (frontend) and Render/Cyclic (backend).
