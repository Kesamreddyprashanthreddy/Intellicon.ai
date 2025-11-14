import re
import requests
import asyncio
from collections import Counter
from typing import Optional

HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"

async def summarize_text(text: str, length: str = "medium") -> str:
    extractive_summary = create_extractive_summary(text, length)
    
    if not extractive_summary or extractive_summary == "Unable to generate a meaningful summary from the provided content.":
        return "No meaningful content found to summarize. Please check that your document contains readable text."
    
    word_count = len(text.split())
    
    if length == "short":
        return extractive_summary
    elif length == "medium":
        return f"{extractive_summary}\n\n[Document contains {word_count:,} words]"
    else:  # long
        return f"{extractive_summary}\n\n[This {word_count:,}-word document provides detailed information on the topic. The summary above captures the key points and main ideas presented in the content.]"

async def get_huggingface_summary(text: str, length: str) -> Optional[str]:
    try:
        length_mapping = {
            "short": {"max_length": 100, "min_length": 50},
            "medium": {"max_length": 200, "min_length": 100}, 
            "long": {"max_length": 300, "min_length": 150}
        }
        
        params = length_mapping.get(length, length_mapping["medium"])
        
        # Use more text for better summaries
        input_text = text[:2048] if len(text) > 2048 else text
        
        payload = {
            "inputs": input_text,
            "parameters": {
                "max_length": params["max_length"],
                "min_length": params["min_length"],
                "do_sample": True,
                "temperature": 0.7,
                "repetition_penalty": 1.2,
                "length_penalty": 1.0
            }
        }
        
        response = requests.post(HF_API_URL, json=payload, timeout=45)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                summary = result[0].get("summary_text", "")
                
                if summary and len(summary) > 30:
                    word_count = len(text.split())
                    
                    structured_summary = f"**DOCUMENT SUMMARY**\n\n"
                    structured_summary += f"**Main Content:** {summary}\n\n"
                    
                    if length in ["medium", "long"]:
                        structured_summary += f"**Document Details:** {word_count:,} words | "
                        structured_summary += f"{'Comprehensive' if word_count > 500 else 'Focused'} Analysis\n\n"
                        
                        if length == "long":
                            structured_summary += f"**Professional Value:** This summary provides actionable insights suitable for strategic planning, research, and decision-making processes."
                    
                    return structured_summary
                    
                return summary
        
        return None
    except:
        return None

def create_extractive_summary(text: str, length: str = "medium") -> str:
    if not text or len(text.strip()) < 20:
        return "Insufficient content to generate a meaningful summary."
    
    text = text.strip()
    
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20 and len(s.split()) >= 3]
    
    if len(sentences) == 0:
        return "No complete sentences found in the document."
    
    if len(sentences) <= 2:
        return ' '.join(sentences)
    
    word_count = len(text.split())
    
    if length == "short":
        target_sentences = min(2, len(sentences))
    elif length == "medium":
        target_sentences = min(4, len(sentences))
    else:  # long
        target_sentences = min(6, len(sentences))
    
    sentence_scores = []
    
    all_words = text.lower().split()
    word_freq = {}
    for word in all_words:
        if len(word) > 3 and word.isalpha():
            word_freq[word] = word_freq.get(word, 0) + 1
    stop_words = {
        'this', 'that', 'these', 'those', 'with', 'from', 'they', 'them', 'their',
        'would', 'could', 'should', 'will', 'been', 'have', 'had', 'has', 'was',
        'were', 'are', 'is', 'be', 'being', 'do', 'does', 'did', 'done', 'the',
        'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as', 'by'
    }
    
    for i, sentence in enumerate(sentences):
        score = 0
        words = sentence.lower().split()
        
        important_words = 0
        for word in words:
            if word not in stop_words and len(word) > 3:
                if word in word_freq:
                    score += word_freq[word]
                    important_words += 1
        
        if len(words) > 0:
            score = score / len(words)
        
        if i == 0:
            score *= 1.5  
        elif i == len(sentences) - 1:
            score *= 1.2 
        elif i < len(sentences) * 0.3:
            score *= 1.1  
        
        if len(words) < 5 or len(words) > 40:
            score *= 0.5
        
        if any(word.isupper() or word[0].isupper() for word in words):
            score *= 1.1
        
        if any(char.isdigit() for char in sentence):
            score *= 1.1
        
        key_phrases = ['important', 'significant', 'shows', 'indicates', 'found', 
                      'results', 'conclusion', 'therefore', 'however', 'moreover',
                      'furthermore', 'additionally', 'consequently', 'specifically']
        
        for phrase in key_phrases:
            if phrase in sentence.lower():
                score *= 1.2
                break
        
        sentence_scores.append((score, i, sentence))
    
    sentence_scores.sort(reverse=True, key=lambda x: x[0])
    
    selected_sentences = sentence_scores[:target_sentences]
    selected_sentences.sort(key=lambda x: x[1])
    final_sentences = [sentence for _, _, sentence in selected_sentences]
    summary = ' '.join(final_sentences)
    summary = re.sub(r'\s+', ' ', summary) 
    summary = summary.strip()
    
    if summary and not summary[-1] in '.!?':
        summary += '.'
    
    return summary if summary else "Unable to generate a meaningful summary from the provided content."

async def create_bullet_summary(text: str, length: str = "medium") -> str:
    base_summary = create_extractive_summary(text, length)
    
    if not base_summary or "Unable to generate" in base_summary:
        return "• No meaningful content found to summarize"
    sentences = [s.strip() for s in base_summary.split('.') if s.strip() and len(s.strip()) > 10]
    
    if not sentences:
        return "• No key points identified"
    bullet_points = []
    for i, sentence in enumerate(sentences):
        clean_sentence = sentence.strip()
        if clean_sentence:
            bullet_points.append(f"• {clean_sentence}")
    
    if not bullet_points:
        return "• No key points could be extracted from the content"
    
    return "\n".join(bullet_points)

async def create_executive_summary(text: str, length: str = "medium") -> str:
    base_summary = create_extractive_summary(text, length)
    
    if not base_summary or "Unable to generate" in base_summary:
        return "EXECUTIVE SUMMARY\n\nNo meaningful content found to summarize."
    
    word_count = len(text.split())
    executive_parts = []
    executive_parts.append("EXECUTIVE SUMMARY")
    executive_parts.append("=" * 40)
    executive_parts.append("")
    executive_parts.append("OVERVIEW:")
    executive_parts.append(base_summary)
    executive_parts.append("")
    executive_parts.append(f"DOCUMENT DETAILS:")
    executive_parts.append(f"• Word Count: {word_count:,}")
    executive_parts.append(f"• Content Type: {'Detailed Analysis' if word_count > 500 else 'Summary Document'}")
    
    return "\n".join(executive_parts)