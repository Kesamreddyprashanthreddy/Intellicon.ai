from text_processor import extract_text_from_file, extract_text_from_pdf, extract_text_from_image
from summarizer import summarize_text, create_extractive_summary, create_bullet_summary, create_executive_summary
from analyzer import analyze_document, calculate_flesch_score, extract_keywords, analyze_sentiment
from exporters import export_to_pdf, export_to_docx, export_to_markdown, export_to_txt
from database import save_document, get_document, get_all_documents, search_documents, delete_document

async def create_qa_summary(text, length="medium"):
    base_summary = await summarize_text(text, length)
    
    if not base_summary or "No meaningful content" in base_summary:
        return "Q&A SUMMARY\n\nQ: What is in this document?\nA: No readable content found."
    
    word_count = len(text.split())
    
    # Simple Q&A format
    qa_parts = []
    qa_parts.append("Q&A SUMMARY")
    qa_parts.append("=" * 30)
    qa_parts.append("")
    qa_parts.append("Q: What is the main content of this document?")
    qa_parts.append(f"A: {base_summary}")
    qa_parts.append("")
    qa_parts.append("Q: How long is the document?")
    qa_parts.append(f"A: The document contains {word_count:,} words.")
    
    if length in ["medium", "long"]:
        qa_parts.append("")
        qa_parts.append("Q: What type of information does it provide?")
        qa_parts.append(f"A: This is a {'comprehensive' if word_count > 500 else 'concise'} document that covers the key aspects of the topic.")
    
    return "\n".join(qa_parts)

async def create_topic_summary(text, length="medium"):
    base_summary = await summarize_text(text, length)
    
    if not base_summary or "No meaningful content" in base_summary:
        return "TOPIC SUMMARY\n\nNo identifiable topics found in the document."
    
    word_count = len(text.split())
    
    # Simple topic format
    topic_parts = []
    topic_parts.append("TOPIC SUMMARY")
    topic_parts.append("=" * 35)
    topic_parts.append("")
    topic_parts.append("MAIN TOPICS:")
    topic_parts.append(base_summary)
    topic_parts.append("")
    topic_parts.append("DOCUMENT INFORMATION:")
    topic_parts.append(f"• Length: {word_count:,} words")
    topic_parts.append(f"• Scope: {'Detailed coverage' if word_count > 500 else 'Focused discussion'}")
    
    return "\n".join(topic_parts)
