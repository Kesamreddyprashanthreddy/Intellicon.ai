# 🖼️ Image OCR Setup Guide

## Quick Fix for Image Upload Issues

If image uploads are failing with "OCR Error", you need to install Tesseract OCR:

### Windows Installation (5 minutes):

1. **Download Tesseract**:

   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-v5.3.1.20230401.exe` (latest version)

2. **Install**:

   - Run the downloaded `.exe` file
   - Install to default location: `C:\Program Files\Tesseract-OCR`
   - ✅ Check "Add to PATH" during installation

3. **Verify Installation**:

   ```powershell
   tesseract --version
   ```

   Should show: `tesseract 5.3.1`

4. **Restart Backend**:
   - Stop the backend server (Ctrl+C)
   - Restart: `npm run dev` (in backend folder)

### Alternative Solutions:

**Option 1: Use PDF Files**

- PDF files work perfectly without Tesseract
- Much better text extraction quality

**Option 2: Online OCR First**

- Use tools like Google Drive OCR
- Copy text and paste into the app

**Option 3: Manual Text Entry**

- Type or paste text directly for summarization

### Troubleshooting:

**Error: "Tesseract not found"**

- Make sure Tesseract is in your PATH
- Restart PowerShell/Command Prompt
- Try: `where tesseract`

**Error: "OCR processing failed"**

- Use clearer, high-contrast images
- Try JPG instead of PNG
- Ensure text is readable by humans first

---

**💡 Pro Tip**: PDF files give much better results than images for text extraction!
