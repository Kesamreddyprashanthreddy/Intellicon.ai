import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "documents.db"

def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # First, check if the table exists and get its schema
    cursor.execute("PRAGMA table_info(documents)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if not columns:
        # Table doesn't exist, create it
        cursor.execute("""
            CREATE TABLE documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                text TEXT NOT NULL,
                summary TEXT,
                summary_type TEXT DEFAULT 'standard',
                summary_length TEXT DEFAULT 'medium',
                analysis_data TEXT,
                file_size INTEGER,
                word_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Created new documents table")
    else:
        # Table exists, check if it has the required columns
        required_columns = ['text', 'summary', 'summary_type', 'summary_length', 'analysis_data', 'file_size', 'word_count']
        missing_columns = []
        
        for col in required_columns:
            if col not in column_names:
                missing_columns.append(col)
        
        # Add missing columns
        for col in missing_columns:
            if col == 'text':
                cursor.execute("ALTER TABLE documents ADD COLUMN text TEXT DEFAULT ''")
                print("Added text column")
            elif col == 'summary':
                cursor.execute("ALTER TABLE documents ADD COLUMN summary TEXT DEFAULT ''")
                print("Added summary column")
            elif col == 'summary_type':
                cursor.execute("ALTER TABLE documents ADD COLUMN summary_type TEXT DEFAULT 'standard'")
                print("Added summary_type column")
            elif col == 'summary_length':
                cursor.execute("ALTER TABLE documents ADD COLUMN summary_length TEXT DEFAULT 'medium'")
                print("Added summary_length column")
            elif col == 'analysis_data':
                cursor.execute("ALTER TABLE documents ADD COLUMN analysis_data TEXT")
                print("Added analysis_data column")
            elif col == 'file_size':
                cursor.execute("ALTER TABLE documents ADD COLUMN file_size INTEGER DEFAULT 0")
                print("Added file_size column")
            elif col == 'word_count':
                cursor.execute("ALTER TABLE documents ADD COLUMN word_count INTEGER DEFAULT 0")
                print("Added word_count column")
    
    conn.commit()
    conn.close()

def save_document(filename, text, summary="", summary_type="standard", summary_length="medium", analysis=None, file_size=0):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check which column name exists for the text field
    cursor.execute("PRAGMA table_info(documents)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    analysis_json = json.dumps(analysis) if analysis else None
    word_count = len(text.split()) if text else 0
    
    # Build dynamic query based on available columns
    # Handle both 'original_text' and 'text' columns
    if 'original_text' in column_names and 'text' in column_names:
        # Both columns exist - insert into both to avoid NOT NULL constraint
        query = """
            INSERT INTO documents (filename, original_text, text, summary, summary_type, summary_length, analysis_data, file_size, word_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (filename, text, text, summary, summary_type, summary_length, analysis_json, file_size, word_count))
    elif 'original_text' in column_names:
        # Only original_text column exists
        query = """
            INSERT INTO documents (filename, original_text, summary, summary_type, summary_length, analysis_data, file_size, word_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (filename, text, summary, summary_type, summary_length, analysis_json, file_size, word_count))
    else:
        # Only text column exists or default
        query = """
            INSERT INTO documents (filename, text, summary, summary_type, summary_length, analysis_data, file_size, word_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(query, (filename, text, summary, summary_type, summary_length, analysis_json, file_size, word_count))
    
    document_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return document_id

def get_document(document_id):
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
    row = cursor.fetchone()
    
    conn.close()
    
    if row:
        doc = dict(row)
        # Normalize column name: if 'original_text' exists but 'text' doesn't, create 'text' key
        if 'original_text' in doc and 'text' not in doc:
            doc['text'] = doc['original_text']
        if doc.get('analysis_data'):
            doc['analysis_data'] = json.loads(doc['analysis_data'])
        return doc
    return None

def get_all_documents(limit=50, offset=0):
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM documents ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset))
    
    rows = cursor.fetchall()
    conn.close()
    
    docs = []
    for row in rows:
        doc = dict(row)
        # Normalize column name
        if 'original_text' in doc and 'text' not in doc:
            doc['text'] = doc['original_text']
        docs.append(doc)
    
    return docs

def search_documents(query, limit=20):
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check which column name exists for the text field
    cursor.execute("PRAGMA table_info(documents)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    text_column = 'original_text' if 'original_text' in column_names else 'text'
    
    search_term = f"%{query}%"
    search_query = f"SELECT * FROM documents WHERE filename LIKE ? OR {text_column} LIKE ? ORDER BY created_at DESC LIMIT ?"
    cursor.execute(search_query, (search_term, search_term, limit))
    
    rows = cursor.fetchall()
    conn.close()
    
    docs = []
    for row in rows:
        doc = dict(row)
        # Normalize column name
        if 'original_text' in doc and 'text' not in doc:
            doc['text'] = doc['original_text']
        docs.append(doc)
    
    return docs

def delete_document(document_id):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    
    conn.commit()
    conn.close()

def get_document_stats():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Get total documents
    cursor.execute("SELECT COUNT(*) as total_documents FROM documents")
    total_docs = cursor.fetchone()[0]
    
    # Get total words processed
    cursor.execute("SELECT SUM(word_count) as total_words FROM documents")
    total_words = cursor.fetchone()[0] or 0
    
    # Get recent documents count (last 7 days)
    cursor.execute("SELECT COUNT(*) as recent_docs FROM documents WHERE created_at >= datetime('now', '-7 days')")
    recent_docs = cursor.fetchone()[0]
    
    # Get average document length
    cursor.execute("SELECT AVG(word_count) as avg_words FROM documents")
    avg_words = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_documents": total_docs,
        "total_words_processed": total_words,
        "recent_documents": recent_docs,
        "average_document_length": round(avg_words, 1)
    }

def get_document_tags(document_id):
    # Placeholder for tags functionality - return empty list for now
    return []

def add_document_tag(document_id, tag):
    # Placeholder for tags functionality
    pass

def reset_database():
    """Force reset the database schema"""
    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()
        print("Deleted existing database")
    init_database()
    print("Database reset complete")

# Initialize database on import
init_database()
