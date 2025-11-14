import os
import shutil
import tempfile
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv

import utils
import database

load_dotenv()

app = FastAPI(title="Document Summary Assistant")

# Initialize database
database.init_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/database/reset")
async def reset_database():
    try:
        database.reset_database()
        return {"message": "Database reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    suffix = os.path.splitext(file.filename)[1].lower()
    tmp_dir = tempfile.mkdtemp()
    try:
        tmp_path = os.path.join(tmp_dir, file.filename)
        with open(tmp_path, "wb") as f:
            contents = await file.read()
            f.write(contents)

        text = await utils.extract_text_from_file(tmp_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            shutil.rmtree(tmp_dir)
        except Exception:
            pass

class SummarizeRequest(BaseModel):
    text: str
    type: str = "standard"
    length: str = "medium"

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Missing text to summarize")

    try:
        summary = await utils.summarize_text(req.text, req.length)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_document(req: SummarizeRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Missing text to analyze")

    try:
        analysis = utils.analyze_document(req.text)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AdvancedSummaryRequest(BaseModel):
    text: str
    summary_type: str = "standard"
    length: str = "medium"

@app.post("/advanced-summary")
async def advanced_summary(req: AdvancedSummaryRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Missing text to summarize")

    try:
        if req.summary_type == "bullet_points":
            summary = await utils.create_bullet_summary(req.text, req.length)
        elif req.summary_type == "executive":
            summary = await utils.create_executive_summary(req.text, req.length)
        elif req.summary_type == "qa":
            summary = await utils.create_qa_summary(req.text, req.length)
        elif req.summary_type == "topics":
            summary = await utils.create_topic_summary(req.text, req.length)
        elif req.summary_type == "detailed":
            # For detailed summary, use longer length and more comprehensive format
            summary = await utils.summarize_text(req.text, "long")
        else:
            summary = await utils.summarize_text(req.text, req.length)

        return {"summary": summary, "type": req.summary_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExportRequest(BaseModel):
    content: str
    format: str
    title: str = "Document Summary"

@app.post("/export")
async def export_document(req: ExportRequest):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Missing content to export")

    try:
        if req.format.lower() == "pdf":
            content = utils.export_to_pdf(req.content, req.title)
            return Response(
                content=content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={req.title}.pdf"}
            )
        elif req.format.lower() == "docx":
            content = utils.export_to_docx(req.content, req.title)
            return Response(
                content=content,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f"attachment; filename={req.title}.docx"}
            )
        elif req.format.lower() == "markdown" or req.format.lower() == "md":
            content = utils.export_to_markdown(req.content, req.title)
            return Response(
                content=content,
                media_type="text/markdown",
                headers={"Content-Disposition": f"attachment; filename={req.title}.md"}
            )
        elif req.format.lower() == "txt":
            content = utils.export_to_txt(req.content, req.title)
            return Response(
                content=content,
                media_type="text/plain",
                headers={"Content-Disposition": f"attachment; filename={req.title}.txt"}
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format. Use: pdf, docx, markdown, or txt")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-upload")
async def batch_upload(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    results = []

    for file in files:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
                shutil.copyfileobj(file.file, tmp_file)
                tmp_path = tmp_file.name

            text = await utils.extract_text_from_file(tmp_path)

            os.unlink(tmp_path)

            analysis = utils.analyze_document(text) if text else None

            results.append({
                "filename": file.filename,
                "success": True,
                "text": text,
                "word_count": len(text.split()) if text else 0,
                "analysis": analysis
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })

        finally:
            if 'tmp_path' in locals() and os.path.exists(tmp_path):
                os.unlink(tmp_path)

    return {"results": results, "total_files": len(files), "successful": sum(1 for r in results if r["success"])}

class BatchSummaryRequest(BaseModel):
    texts: List[str]
    length: str = "medium"
    summary_type: str = "standard"

@app.post("/batch-summary")
async def batch_summarize(req: BatchSummaryRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="No texts provided")

    results = []

    for i, text in enumerate(req.texts):
        try:
            if req.summary_type == "bullet_points":
                summary = await utils.create_bullet_summary(text, req.length)
            elif req.summary_type == "executive":
                summary = await utils.create_executive_summary(text, req.length)
            elif req.summary_type == "qa":
                summary = await utils.create_qa_summary(text, req.length)
            elif req.summary_type == "topics":
                summary = await utils.create_topic_summary(text, req.length)
            else:
                summary = await utils.summarize_text(text, req.length)

            results.append({
                "index": i,
                "success": True,
                "summary": summary,
                "original_length": len(text.split()),
                "summary_length": len(summary.split())
            })

        except Exception as e:
            results.append({
                "index": i,
                "success": False,
                "error": str(e)
            })

    return {"results": results, "total_texts": len(req.texts), "successful": sum(1 for r in results if r["success"])}

class SaveDocumentRequest(BaseModel):
    filename: str
    text: str
    summary: str = ""
    summary_type: str = "standard"
    summary_length: str = "medium"
    analysis: Optional[dict] = None
    file_size: int = 0

@app.post("/documents/save")
async def save_document_to_history(req: SaveDocumentRequest):
    try:
        print(f"Saving document: {req.filename}")
        print(f"Text length: {len(req.text)}")
        print(f"Summary length: {len(req.summary) if req.summary else 0}")
        print(f"Analysis present: {req.analysis is not None}")
        
        document_id = database.save_document(
            filename=req.filename,
            text=req.text,
            summary=req.summary,
            summary_type=req.summary_type,
            summary_length=req.summary_length,
            analysis=req.analysis,
            file_size=req.file_size
        )

        print(f"Document saved with ID: {document_id}")
        return {"document_id": document_id, "message": "Document saved successfully"}
    except Exception as e:
        print(f"Error saving document: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def get_documents(limit: int = 50, offset: int = 0):
    try:
        documents = database.get_all_documents(limit, offset)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}")
async def get_document_by_id(document_id: int):
    try:
        document = database.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        document["tags"] = database.get_document_tags(document_id)

        return {"document": document}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/search/{query}")
async def search_documents(query: str, limit: int = 20):
    try:
        results = database.search_documents(query, limit)
        return {"results": results, "query": query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(document_id: int):
    try:
        document = database.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        database.delete_document(document_id)
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/stats/overview")
async def get_document_stats():
    try:
        print("Fetching document stats...")
        stats = database.get_document_stats()
        print(f"Stats retrieved: {stats}")
        return {"stats": stats}
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class DocumentTagRequest(BaseModel):
    tags: List[str]

@app.post("/documents/{document_id}/tags")
async def add_document_tags(document_id: int, req: DocumentTagRequest):
    try:
        for tag in req.tags:
            database.add_document_tag(document_id, tag)
        return {"message": "Tags added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize-local")
async def summarize_local(req: SummarizeRequest):
    try:
        summary = utils.summarize_document(
            text=req.text,
            max_length=150 if req.length == "medium" else (80 if req.length == "short" else 250),
            min_length=30 if req.length == "short" else (50 if req.length == "medium" else 100)
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local summarization failed: {str(e)}")

@app.post("/summarize-fast")
async def summarize_fast(req: SummarizeRequest):
    try:
        summary = utils.create_extractive_summary(req.text, req.length)
        return {"summary": summary}
    except Exception as e:
        # Simple fallback
        words = req.text.split()
        if len(words) < 50:
            fallback = req.text
        else:
            fallback = " ".join(words[:50]) + "..."
        return {"summary": fallback}

@app.post("/advanced-summary-local")
async def advanced_summary_local(req: AdvancedSummaryRequest):
    try:
        summary = utils.summarize_document_advanced(
            text=req.text,
            summary_type=req.summary_type,
            length=req.length
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced local summarization failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 4000)), reload=True)
