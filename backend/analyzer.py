import re
import math
from collections import Counter
from typing import Dict, List

def analyze_document(text: str) -> Dict:
    """Comprehensive document analysis with professional metrics"""
    if not text or not text.strip():
        return {"error": "No text provided for analysis"}
    
    # Basic text processing
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    # Character counts
    chars_total = len(text)
    chars_no_spaces = len(text.replace(' ', ''))
    
    # Advanced metrics
    reading_time_minutes = len(words) / 225  # Average reading speed
    flesch_score = calculate_flesch_score(text, words, sentences)
    keywords = extract_keywords(text)
    sentiment = analyze_sentiment(text)
    complexity_metrics = calculate_complexity_metrics(text, words, sentences)
    document_structure = analyze_document_structure(text, paragraphs)
    content_quality = assess_content_quality(text, words, sentences)
    
    return {
        "basic_statistics": {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "paragraph_count": len(paragraphs),
            "character_count": chars_total,
            "character_count_no_spaces": chars_no_spaces,
            "average_word_length": round(sum(len(word) for word in words) / len(words), 2) if words else 0,
            "average_sentence_length": round(len(words) / len(sentences), 1) if sentences else 0,
            "average_paragraph_length": round(len(sentences) / len(paragraphs), 1) if paragraphs else 0
        },
        "readability": {
            "flesch_reading_ease": flesch_score,
            "readability_level": get_readability_level(flesch_score),
            "grade_level": calculate_grade_level(flesch_score),
            "reading_time_minutes": round(reading_time_minutes, 1),
            "reading_time_seconds": round(reading_time_minutes * 60),
            "complexity_score": complexity_metrics["complexity_score"]
        },
        "content_analysis": {
            "keywords": keywords,
            "sentiment": sentiment,
            "topic_diversity": calculate_topic_diversity(keywords),
            "information_density": calculate_information_density(text, words),
            "vocabulary_richness": calculate_vocabulary_richness(words)
        },
        "document_structure": document_structure,
        "quality_metrics": content_quality,
        "linguistic_features": {
            "punctuation_density": calculate_punctuation_density(text),
            "capitalization_ratio": calculate_capitalization_ratio(text),
            "numeric_content_ratio": calculate_numeric_ratio(text),
            "question_ratio": calculate_question_ratio(sentences)
        }
    }

def calculate_flesch_score(text: str, words: list, sentences: list) -> float:
    if not words or not sentences:
        return 0
    
    syllable_count = sum(count_syllables(word) for word in words)
    
    if len(sentences) == 0 or len(words) == 0:
        return 0
    
    score = 206.835 - (1.015 * (len(words) / len(sentences))) - (84.6 * (syllable_count / len(words)))
    return round(max(0, min(100, score)), 1)

def count_syllables(word: str) -> int:
    word = word.lower()
    vowels = 'aeiouy'
    count = 0
    prev_char_was_vowel = False
    
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_char_was_vowel:
            count += 1
        prev_char_was_vowel = is_vowel
    
    if word.endswith('e'):
        count -= 1
    
    return max(1, count)

def get_readability_level(score: float) -> str:
    """Get readability level description"""
    if score >= 90:
        return "Very Easy"
    elif score >= 80:
        return "Easy" 
    elif score >= 70:
        return "Fairly Easy"
    elif score >= 60:
        return "Standard"
    elif score >= 50:
        return "Fairly Difficult"
    elif score >= 30:
        return "Difficult"
    else:
        return "Very Difficult"

def calculate_grade_level(flesch_score: float) -> str:
    """Calculate reading grade level based on Flesch score"""
    if flesch_score >= 90:
        return "5th Grade"
    elif flesch_score >= 80:
        return "6th Grade"
    elif flesch_score >= 70:
        return "7th Grade"
    elif flesch_score >= 60:
        return "8th-9th Grade"
    elif flesch_score >= 50:
        return "10th-12th Grade"
    elif flesch_score >= 30:
        return "College Level"
    else:
        return "Graduate Level"

def calculate_complexity_metrics(text: str, words: List[str], sentences: List[str]) -> Dict:
    """Calculate advanced complexity metrics"""
    if not words or not sentences:
        return {"complexity_score": 0, "sentence_variety": 0}
    
    # Sentence length variance
    sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
    if sentence_lengths:
        variance = sum((x - sum(sentence_lengths)/len(sentence_lengths))**2 for x in sentence_lengths) / len(sentence_lengths)
        sentence_variety = min(100, variance / 10)
    else:
        sentence_variety = 0
    
    # Word complexity (longer words = more complex)
    avg_word_length = sum(len(word) for word in words) / len(words)
    word_complexity = min(100, (avg_word_length - 3) * 20)
    
    # Overall complexity score
    complexity_score = round((word_complexity + sentence_variety) / 2, 1)
    
    return {
        "complexity_score": complexity_score,
        "sentence_variety": round(sentence_variety, 1),
        "word_complexity": round(word_complexity, 1)
    }

def analyze_document_structure(text: str, paragraphs: List[str]) -> Dict:
    """Analyze document structure and organization"""
    if not paragraphs:
        return {"structure_score": 0, "organization": "Poor"}
    
    # Paragraph length consistency
    para_lengths = [len(p.split()) for p in paragraphs]
    if para_lengths:
        avg_para_length = sum(para_lengths) / len(para_lengths)
        para_consistency = 100 - min(100, abs(max(para_lengths) - min(para_lengths)) / max(1, avg_para_length) * 50)
    else:
        para_consistency = 0
    
    # Headers and structure indicators
    headers = len(re.findall(r'\n[A-Z][A-Z\s]*:\s*', text))
    bullet_points = len(re.findall(r'[•\-\*]\s+', text))
    numbered_lists = len(re.findall(r'\d+\.\s+', text))
    
    structure_score = min(100, para_consistency + (headers * 5) + (bullet_points * 2) + (numbered_lists * 3))
    
    if structure_score >= 80:
        organization = "Excellent"
    elif structure_score >= 60:
        organization = "Good"
    elif structure_score >= 40:
        organization = "Fair"
    else:
        organization = "Poor"
    
    return {
        "structure_score": round(structure_score, 1),
        "organization": organization,
        "paragraph_consistency": round(para_consistency, 1),
        "headers_count": headers,
        "bullet_points_count": bullet_points,
        "numbered_lists_count": numbered_lists
    }

def assess_content_quality(text: str, words: List[str], sentences: List[str]) -> Dict:
    """Assess overall content quality"""
    if not words or not sentences:
        return {"quality_score": 0, "quality_level": "Poor"}
    
    # Vocabulary sophistication
    sophisticated_words = sum(1 for word in words if len(word) > 6)
    vocab_sophistication = min(100, (sophisticated_words / len(words)) * 300)
    
    # Information density (unique words / total words)
    unique_words = len(set(word.lower() for word in words))
    info_density = min(100, (unique_words / len(words)) * 100)
    
    # Sentence structure variety
    short_sentences = sum(1 for s in sentences if len(s.split()) < 10)
    long_sentences = sum(1 for s in sentences if len(s.split()) > 20)
    structure_variety = min(100, (abs(short_sentences - long_sentences) / len(sentences)) * 100)
    
    # Overall quality score
    quality_score = round((vocab_sophistication + info_density + structure_variety) / 3, 1)
    
    if quality_score >= 80:
        quality_level = "Excellent"
    elif quality_score >= 60:
        quality_level = "Good"
    elif quality_score >= 40:
        quality_level = "Fair"
    else:
        quality_level = "Poor"
    
    return {
        "quality_score": quality_score,
        "quality_level": quality_level,
        "vocabulary_sophistication": round(vocab_sophistication, 1),
        "information_density": round(info_density, 1),
        "structure_variety": round(structure_variety, 1)
    }

def calculate_topic_diversity(keywords: List[str]) -> float:
    """Calculate how diverse the topics are in the document"""
    if not keywords:
        return 0.0
    
    # Simple diversity metric based on keyword variety
    return min(100, len(keywords) * 10)

def calculate_information_density(text: str, words: List[str]) -> float:
    """Calculate information density (unique content ratio)"""
    if not words:
        return 0.0
    
    unique_words = len(set(word.lower() for word in words if word.isalpha()))
    return round((unique_words / len(words)) * 100, 2) if words else 0

def calculate_vocabulary_richness(words: List[str]) -> float:
    """Calculate vocabulary richness (Type-Token Ratio)"""
    if not words:
        return 0.0
    
    unique_words = len(set(word.lower() for word in words if word.isalpha()))
    total_words = len([word for word in words if word.isalpha()])
    
    return round((unique_words / total_words) * 100, 2) if total_words > 0 else 0

def calculate_punctuation_density(text: str) -> float:
    """Calculate punctuation density"""
    punctuation_chars = sum(1 for char in text if char in '.,;:!?')
    return round((punctuation_chars / len(text)) * 100, 2) if text else 0

def calculate_capitalization_ratio(text: str) -> float:
    """Calculate ratio of capital letters"""
    if not text:
        return 0.0
    
    capitals = sum(1 for char in text if char.isupper())
    letters = sum(1 for char in text if char.isalpha())
    
    return round((capitals / letters) * 100, 2) if letters > 0 else 0

def calculate_numeric_ratio(text: str) -> float:
    """Calculate ratio of numeric content"""
    if not text:
        return 0.0
    
    numbers = sum(1 for char in text if char.isdigit())
    return round((numbers / len(text)) * 100, 2)

def calculate_question_ratio(sentences: List[str]) -> float:
    """Calculate ratio of questions in the text"""
    if not sentences:
        return 0.0
    
    questions = sum(1 for sentence in sentences if sentence.strip().endswith('?'))
    return round((questions / len(sentences)) * 100, 2)

def extract_keywords(text: str, top_n: int = 10) -> list:
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    
    stop_words = {
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
        'had', 'use', 'his', 'has', 'who', 'oil', 'its', 'now', 'how', 'did', 'get', 'may',
        'him', 'old', 'see', 'two', 'way', 'she', 'day', 'man', 'boy', 'new', 'let', 'put'
    }
    
    filtered_words = [word for word in words if word not in stop_words and len(word) > 3]
    word_freq = Counter(filtered_words)
    
    return [word for word, _ in word_freq.most_common(top_n)]

def analyze_sentiment(text: str) -> Dict:
    positive_words = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive',
        'success', 'achieve', 'benefit', 'improve', 'effective', 'efficient'
    ]
    
    negative_words = [
        'bad', 'terrible', 'awful', 'horrible', 'negative', 'fail', 'problem',
        'issue', 'difficult', 'challenge', 'concern', 'risk', 'threat'
    ]
    
    words = text.lower().split()
    
    positive_count = sum(1 for word in words if word in positive_words)
    negative_count = sum(1 for word in words if word in negative_words)
    
    total_sentiment_words = positive_count + negative_count
    
    if total_sentiment_words == 0:
        return {"polarity": "neutral", "confidence": 0.5}
    
    polarity_score = (positive_count - negative_count) / len(words)
    
    if polarity_score > 0.01:
        polarity = "positive"
    elif polarity_score < -0.01:
        polarity = "negative"
    else:
        polarity = "neutral"
    
    confidence = min(0.9, abs(polarity_score) * 10 + 0.5)
    
    return {
        "polarity": polarity,
        "confidence": round(confidence, 2),
        "positive_words": positive_count,
        "negative_words": negative_count
    }