"""
Math Results Analysis System API
Handles student result uploads, analysis, and revision plan generation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, storage
import pandas as pd
import io
import json
import logging
from pathlib import Path

# JWT token verification
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
ALGORITHM = "HS256"

# Import SECRET_KEY from tutor_auth_api
def get_secret_key():
    """Get the secret key from tutor_auth_api module"""
    import sys
    import importlib.util
    
    spec = importlib.util.spec_from_file_location("tutor_auth", "/app/backend/tutor_auth_api.py")
    tutor_auth = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tutor_auth)
    return tutor_auth.SECRET_KEY

def verify_tutor_token(authorization_header):
    """Verify JWT token and return tutor data"""
    if not authorization_header:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        token = authorization_header.replace("Bearer ", "")
        SECRET_KEY = get_secret_key()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except (InvalidTokenError, Exception) as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Firebase for Math Analysis (separate project)
ROOT_DIR = Path(__file__).parent

math_db = None
math_storage = None

try:
    # Check if app already exists
    try:
        math_app = firebase_admin.get_app('math_analysis')
        logger.info("Math Analysis Firebase app already initialized")
    except ValueError:
        # App doesn't exist, create it
        cred_path = str(ROOT_DIR / 'firebase-math-analysis-credentials.json')
        
        # Load credentials directly as dict
        with open(cred_path, 'r') as f:
            cred_dict = json.load(f)
        
        # Create credential from dict
        math_cred = credentials.Certificate(cred_dict)
        
        # Initialize Math Analysis Firebase app (separate from tuition chatbot)
        math_app = firebase_admin.initialize_app(math_cred, {
            'projectId': 'student-result-analysis-c4c02',
            'storageBucket': 'student-result-analysis-c4c02.firebasestorage.app'
        }, name='math_analysis')
        logger.info("✅ Math Analysis Firebase initialized successfully")
    
    math_db = firestore.client(math_app)
    math_storage = storage.bucket(app=math_app)
    logger.info("✅ Math Analysis Firestore and Storage clients ready")
    
except Exception as e:
    logger.error(f"❌ Failed to initialize Math Analysis Firebase: {str(e)}")
    logger.error(f"Error type: {type(e).__name__}")
    import traceback
    logger.error(traceback.format_exc())
    math_db = None
    math_storage = None

# Create router
math_router = APIRouter(prefix="/api/math-analysis", tags=["Math Analysis"])

# Pydantic Models
class TopicScore(BaseModel):
    topic_name: str
    marks: float
    total_marks: float
    percentage: float

class ManualEntryRequest(BaseModel):
    student_name: str
    location: str
    level: str
    subject: str
    exam_type: str
    topics: List[TopicScore]

class StudentProfile(BaseModel):
    name: str
    location: str
    level: str
    subject: str

class AnalyticsFilter(BaseModel):
    student_name: Optional[str] = None
    location: Optional[str] = None
    level: Optional[str] = None
    subject: Optional[str] = None
    exam_type: Optional[str] = None

# Helper Functions
def calculate_analysis(topics: List[Dict]) -> Dict:
    """Calculate strengths and weaknesses from topic scores"""
    strengths = []
    weaknesses = []
    
    for topic in topics:
        percentage = topic.get('percentage', 0)
        topic_name = topic.get('topic_name', '')
        
        if percentage >= 75:
            strengths.append({
                'topic': topic_name,
                'percentage': percentage,
                'status': 'strong'
            })
        elif percentage < 60:
            weaknesses.append({
                'topic': topic_name,
                'percentage': percentage,
                'status': 'weak'
            })
    
    overall_avg = sum([t.get('percentage', 0) for t in topics]) / len(topics) if topics else 0
    
    return {
        'strengths': strengths,
        'weaknesses': weaknesses,
        'overall_average': round(overall_avg, 2),
        'total_topics': len(topics),
        'strong_count': len(strengths),
        'weak_count': len(weaknesses)
    }

def generate_student_id(name: str, location: str, level: str) -> str:
    """Generate consistent student ID"""
    return f"{name.replace(' ', '_')}_{location.replace(' ', '_')}_{level}".lower()

# API Endpoints

@math_router.post("/manual-entry")
async def manual_entry(data: ManualEntryRequest):
    """Handle manual entry of student results"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Generate student ID
        student_id = generate_student_id(data.student_name, data.location, data.level)
        
        # Prepare topics data
        topics_data = [
            {
                'topic_name': t.topic_name,
                'marks': t.marks,
                'total_marks': t.total_marks,
                'percentage': round((t.marks / t.total_marks * 100) if t.total_marks > 0 else 0, 2)
            }
            for t in data.topics
        ]
        
        # Calculate analysis
        analysis = calculate_analysis(topics_data)
        
        # Calculate overall score
        total_marks = sum([t.marks for t in data.topics])
        total_possible = sum([t.total_marks for t in data.topics])
        overall_score = round((total_marks / total_possible * 100) if total_possible > 0 else 0, 2)
        
        # Create or update student profile
        student_ref = math_db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            # Create new student profile
            student_ref.set({
                'name': data.student_name,
                'location': data.location,
                'level': data.level,
                'subject': data.subject,
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            })
        else:
            # Update last_updated
            student_ref.update({'last_updated': datetime.now().isoformat()})
        
        # Add result to subcollection
        result_data = {
            'exam_type': data.exam_type,
            'date': datetime.now().isoformat(),
            'topics': topics_data,
            'overall_score': overall_score,
            'total_marks': total_marks,
            'total_possible': total_possible,
            'analysis': analysis
        }
        
        result_ref = student_ref.collection('results').document()
        result_ref.set(result_data)
        
        return {
            'success': True,
            'message': f'Results added for {data.student_name}',
            'student_id': student_id,
            'result_id': result_ref.id,
            'analysis': analysis,
            'overall_score': overall_score
        }
        
    except Exception as e:
        logger.error(f"Error in manual entry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Handle CSV/Excel upload of student results"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Read file
        contents = await file.read()
        
        # Determine file type and read accordingly
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="File must be CSV or Excel format")
        
        # Validate required columns
        required_cols = ['Name', 'Location', 'Level', 'Subject', 'Exam Type', 'Topic', 'Marks', 'Total Marks']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing_cols)}")
        
        # Process data by grouping by student
        results_added = []
        errors = []
        
        for (name, location, level, subject, exam_type), group in df.groupby(['Name', 'Location', 'Level', 'Subject', 'Exam Type']):
            try:
                student_id = generate_student_id(name, location, level)
                
                # Prepare topics
                topics_data = []
                for _, row in group.iterrows():
                    marks = float(row['Marks'])
                    total = float(row['Total Marks'])
                    percentage = round((marks / total * 100) if total > 0 else 0, 2)
                    
                    topics_data.append({
                        'topic_name': str(row['Topic']),
                        'marks': marks,
                        'total_marks': total,
                        'percentage': percentage
                    })
                
                # Calculate analysis
                analysis = calculate_analysis(topics_data)
                
                # Calculate overall
                total_marks = sum([t['marks'] for t in topics_data])
                total_possible = sum([t['total_marks'] for t in topics_data])
                overall_score = round((total_marks / total_possible * 100) if total_possible > 0 else 0, 2)
                
                # Create or update student
                student_ref = math_db.collection('students').document(student_id)
                student_doc = student_ref.get()
                
                if not student_doc.exists:
                    student_ref.set({
                        'name': name,
                        'location': location,
                        'level': level,
                        'subject': subject,
                        'created_at': datetime.now().isoformat(),
                        'last_updated': datetime.now().isoformat()
                    })
                else:
                    student_ref.update({'last_updated': datetime.now().isoformat()})
                
                # Add result
                result_data = {
                    'exam_type': exam_type,
                    'date': datetime.now().isoformat(),
                    'topics': topics_data,
                    'overall_score': overall_score,
                    'total_marks': total_marks,
                    'total_possible': total_possible,
                    'analysis': analysis
                }
                
                result_ref = student_ref.collection('results').document()
                result_ref.set(result_data)
                
                results_added.append({
                    'student_name': name,
                    'exam_type': exam_type,
                    'student_id': student_id,
                    'result_id': result_ref.id
                })
                
            except Exception as e:
                errors.append({
                    'student': name,
                    'error': str(e)
                })
        
        return {
            'success': True,
            'message': f'Processed {len(results_added)} student results',
            'results_added': results_added,
            'errors': errors if errors else None
        }
        
    except Exception as e:
        logger.error(f"Error uploading CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/students")
async def get_students(
    location: Optional[str] = None,
    level: Optional[str] = None,
    subject: Optional[str] = None,
    authorization: str = Header(None)
):
    """Get list of all students with optional filters (tutor authenticated)"""
    try:
        # Verify tutor authentication
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization header required")
        
        try:
            tutor_data = verify_tutor_token(authorization)
            tutor_id = tutor_data.get('tutor_id')
            if not tutor_id:
                raise HTTPException(status_code=401, detail="Invalid tutor token")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
        
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        query = math_db.collection('students')
        
        # Filter by tutor_id first
        query = query.where('tutor_id', '==', tutor_id)
        
        # Apply additional filters
        if location:
            query = query.where('location', '==', location)
        if level:
            query = query.where('level', '==', level)
        if subject:
            query = query.where('subject', '==', subject)
        
        students = []
        for doc in query.stream():
            student_data = doc.to_dict()
            student_data['student_id'] = doc.id
            
            # Get result count
            results_count = len(list(doc.reference.collection('results').stream()))
            student_data['results_count'] = results_count
            
            students.append(student_data)
        
        return {
            'success': True,
            'count': len(students),
            'students': students
        }
        
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/student/{student_id}/results")
async def get_student_results(student_id: str):
    """Get all results for a specific student"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get student profile
        student_ref = math_db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_data = student_doc.to_dict()
        
        # Get all results from student_results collection
        results = []
        results_query = math_db.collection('student_results')\
            .where('student_id', '==', student_id)
        
        # Get all results and sort in Python
        all_results = list(results_query.stream())
        for result_doc in all_results:
            result_data = result_doc.to_dict()
            result_data['result_id'] = result_doc.id
            results.append(result_data)
        
        # Sort by created_at in Python (most recent first)
        results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            'success': True,
            'student': student_data,
            'student_id': student_id,
            'results': results,
            'results_count': len(results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.post("/analytics")
async def get_analytics(filters: AnalyticsFilter, authorization: str = Header(None)):
    """Get analytics data with filters for dashboard (tutor authenticated)"""
    try:
        # Verify tutor authentication
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization header required")
        
        try:
            tutor_data = verify_tutor_token(authorization)
            tutor_id = tutor_data.get('tutor_id')
            if not tutor_id:
                raise HTTPException(status_code=401, detail="Invalid tutor token")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
        
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get all results from student_results collection and filter by tutor_id
        all_results = []
        results_query = math_db.collection('student_results').where('tutor_id', '==', tutor_id)
        
        # Apply additional filters
        if filters.location:
            results_query = results_query.where('location', '==', filters.location)
        if filters.level:
            results_query = results_query.where('level', '==', filters.level)
        if filters.subject:
            results_query = results_query.where('subject', '==', filters.subject)
        if filters.exam_type:
            results_query = results_query.where('exam_type', '==', filters.exam_type)
        
        # Get filtered results
        for result_doc in results_query.stream():
            result_data = result_doc.to_dict()
            result_data['result_id'] = result_doc.id
            all_results.append(result_data)
        
        # Get unique students from the results
        unique_students = {}
        for result in all_results:
            student_id = result.get('student_id')
            if student_id and student_id not in unique_students:
                unique_students[student_id] = {
                    'student_id': student_id,
                    'name': result.get('student_name', ''),
                    'location': result.get('location', ''),
                    'level': result.get('level', ''),
                    'subject': result.get('subject', ''),
                    'results_count': 0
                }
            if student_id:
                unique_students[student_id]['results_count'] += 1
        
        students_data = list(unique_students.values())
        
        # Calculate aggregate analytics
        total_students = len(students_data)
        total_results = len(all_results)
        
        # Topic-wise aggregation
        topic_scores = {}
        for result in all_results:
            for topic in result.get('topics', []):
                topic_name = topic['topic_name']
                if topic_name not in topic_scores:
                    topic_scores[topic_name] = {
                        'total_percentage': 0,
                        'count': 0,
                        'scores': []
                    }
                topic_scores[topic_name]['total_percentage'] += topic['percentage']
                topic_scores[topic_name]['count'] += 1
                topic_scores[topic_name]['scores'].append(topic['percentage'])
        
        # Calculate averages
        topic_averages = {}
        for topic, data in topic_scores.items():
            topic_averages[topic] = {
                'average': round(data['total_percentage'] / data['count'], 2) if data['count'] > 0 else 0,
                'count': data['count'],
                'scores': data['scores']
            }
        
        # Overall average
        overall_avg = round(sum([r.get('overall_score', 0) for r in all_results]) / len(all_results), 2) if all_results else 0
        
        return {
            'success': True,
            'total_students': total_students,
            'total_results': total_results,
            'overall_average': overall_avg,
            'topic_averages': topic_averages,
            'students': students_data,
            'filtered_results': all_results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
        return {
            'success': True,
            'total_students': total_students,
            'total_results': total_results,
            'overall_average': round(overall_avg, 2),
            'topic_averages': topic_averages,
            'students': students_data,
            'all_results': all_results
        }
        
    except Exception as e:
        logger.error(f"Error generating analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/revision-plan/{student_id}")
async def get_revision_plan(student_id: str, exam_type: Optional[str] = None):
    """Generate revision plan for student based on weak topics"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get student
        student_ref = math_db.collection('students').document(student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_data = student_doc.to_dict()
        
        # Get latest or specific exam results from student_results collection
        results = []
        results_query = math_db.collection('student_results')\
            .where('student_id', '==', student_id)
        
        # Get all results and sort in Python to avoid index requirements
        all_results = list(results_query.stream())
        
        if not all_results:
            return {
                'success': True,
                'message': 'No results found for revision plan',
                'revision_plan': []
            }
        
        # Sort by created_at in Python (most recent first)
        sorted_results = sorted(all_results, 
                              key=lambda x: x.to_dict().get('created_at', ''), 
                              reverse=True)
        
        # Filter by exam_type if specified
        if exam_type:
            sorted_results = [r for r in sorted_results if r.to_dict().get('exam_type') == exam_type]
        
        if not sorted_results:
            return {
                'success': True,
                'message': 'No results found for revision plan',
                'revision_plan': []
            }
        
        latest_result = sorted_results[0].to_dict()
        result_id = sorted_results[0].id
        
        # Extract topics and identify weak ones (default threshold 70%)
        all_topics = latest_result.get('topics', [])
        weak_topics = [t for t in all_topics if t.get('percentage', 0) <= 70]
        
        # Get topic library resources
        revision_items = []
        for weak in weak_topics:
            topic_name = weak['topic_name']
            
            # Query topic library
            topic_query = math_db.collection('topic_library')\
                .where('level', '==', student_data['level'])\
                .where('subject', '==', student_data['subject'])\
                .where('topic_name', '==', topic_name)
            
            topic_docs = list(topic_query.stream())
            
            if topic_docs:
                topic_data = topic_docs[0].to_dict()
                revision_items.append({
                    'topic': topic_name,
                    'current_score': weak['percentage'],
                    'status': 'weak',
                    'resources': {
                        'pdf': topic_data.get('pdf_link', ''),
                        'video': topic_data.get('video_link', ''),
                        'worksheet': topic_data.get('worksheet_link', '')
                    }
                })
            else:
                # Topic not in library yet
                revision_items.append({
                    'topic': topic_name,
                    'current_score': weak['percentage'],
                    'status': 'weak',
                    'resources': {
                        'pdf': '',
                        'video': '',
                        'worksheet': '',
                        'note': 'Resources will be added soon'
                    }
                })
        
        return {
            'success': True,
            'student_name': student_data['name'],
            'level': student_data['level'],
            'subject': student_data['subject'],
            'exam_type': latest_result['exam_type'],
            'overall_score': latest_result['overall_score'],
            'revision_plan': revision_items,
            'weak_topics_count': len(revision_items),
            'result_id': result_id,
            'all_topics': all_topics  # Include all topics for frontend
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating revision plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/topic-library")
async def get_topic_library(level: Optional[str] = None, subject: Optional[str] = None):
    """Get topic library with optional filters"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        query = math_db.collection('topic_library')
        
        if level:
            query = query.where('level', '==', level)
        if subject:
            query = query.where('subject', '==', subject)
        
        topics = []
        for doc in query.stream():
            topic_data = doc.to_dict()
            topic_data['topic_id'] = doc.id
            topics.append(topic_data)
        
        return {
            'success': True,
            'count': len(topics),
            'topics': topics
        }
        
    except Exception as e:
        logger.error(f"Error fetching topic library: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.post("/seed-topic-library")
async def seed_topic_library():
    """Seed placeholder topic library structure"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Sample placeholder topics
        placeholder_topics = [
            {'level': 'S1', 'subject': 'Math', 'topic_name': 'Numbers and Operations', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'S1', 'subject': 'Math', 'topic_name': 'Algebra', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'S2', 'subject': 'Math', 'topic_name': 'Linear Equations', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'S3', 'subject': 'E.Math', 'topic_name': 'Functions', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'S3', 'subject': 'A.Math', 'topic_name': 'Vectors', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'S4', 'subject': 'A.Math', 'topic_name': 'Calculus', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'J1', 'subject': 'Pure Math', 'topic_name': 'Differentiation', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
            {'level': 'J2', 'subject': 'Statistics', 'topic_name': 'Probability', 'pdf_link': '', 'video_link': '', 'worksheet_link': ''},
        ]
        
        added_count = 0
        for topic in placeholder_topics:
            # Check if exists
            existing = list(math_db.collection('topic_library')\
                .where('level', '==', topic['level'])\
                .where('subject', '==', topic['subject'])\
                .where('topic_name', '==', topic['topic_name'])\
                .stream())
            
            if not existing:
                math_db.collection('topic_library').add(topic)
                added_count += 1
        
        return {
            'success': True,
            'message': f'Seeded {added_count} placeholder topics',
            'total_topics': len(placeholder_topics)
        }
        
    except Exception as e:
        logger.error(f"Error seeding topic library: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# PDF Analysis with AI
import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

class PDFAnalysisRequest(BaseModel):
    student_name: str
    location: str
    level: str
    subject: str
    exam_type: str

class ExtractedTopic(BaseModel):
    topic_name: str
    marks: float
    total_marks: float

class PDFAnalysisResponse(BaseModel):
    extracted_topics: List[ExtractedTopic]
    overall_score: float
    confidence: str
    preview_text: str

@math_router.post("/analyze-pdf")
async def analyze_pdf_test_paper(
    file: UploadFile = File(...),
    student_name: str = "",
    location: str = "",
    level: str = "",
    subject: str = "",
    exam_type: str = ""
):
    """
    AI-powered PDF test paper analysis
    Extracts questions, marks, and categorizes into topics using GPT-4o
    """
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Validate PDF file
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        # Read PDF content
        pdf_content = await file.read()
        
        # Convert PDF to images using PyMuPDF
        pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
        
        # Convert first few pages to base64 images (limit to 5 pages to save tokens)
        page_images = []
        max_pages = min(5, len(pdf_document))
        
        for page_num in range(max_pages):
            page = pdf_document[page_num]
            # Render page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
            img_bytes = pix.pil_tobytes(format="PNG")
            
            # Convert to base64
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            page_images.append(img_base64)
        
        pdf_document.close()
        
        # Extract text from PDF for context
        pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
        pdf_text = ""
        for page in pdf_document:
            pdf_text += page.get_text()
        pdf_document.close()
        
        # Initialize LLM Chat with GPT-4o
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"pdf_analysis_{datetime.now().timestamp()}",
            system_message=f"""You are an expert math teacher analyzing a {level} {subject} test paper for {exam_type}.

Your task:
1. Identify each question in the test paper
2. Extract the marks awarded by the teacher (handwritten marks)
3. Extract the total marks possible for each question
4. Categorize each question into appropriate math topics

Math topics you should recognize (examples):
- Functions
- Vectors  
- Calculus (Differentiation, Integration)
- Algebra
- Geometry
- Trigonometry
- Probability
- Statistics
- Linear Equations
- Quadratic Equations
- Coordinate Geometry
- Graphs
- Sets
- Numbers and Operations
- Mensuration
- And other standard math topics for {level} {subject}

Return your analysis in this EXACT JSON format:
{{
  "topics": [
    {{
      "topic_name": "Functions",
      "marks_obtained": 12.0,
      "total_marks": 20.0,
      "question_numbers": "Q1"
    }},
    {{
      "topic_name": "Vectors",
      "marks_obtained": 15.0,
      "total_marks": 20.0,
      "question_numbers": "Q2"
    }}
  ],
  "confidence": "high/medium/low",
  "notes": "Any observations or uncertainties"
}}

Be precise with marks extraction. Look for handwritten marks carefully."""
        ).with_model("openai", "gpt-4o")
        
        # Create message with first page image
        # Note: For production, you might want to send all pages or let AI determine relevance
        message_text = f"""Analyze this {subject} test paper for {level} level.

Extract:
1. Each question's topic (what math concept is being tested)
2. Marks obtained by the student (handwritten by teacher)
3. Total marks possible for each question

PDF Text Extract (for context):
{pdf_text[:2000]}

Provide your analysis in the JSON format specified."""

        # For now, analyze text only (vision would require different approach with emergentintegrations)
        # Let's use text extraction first
        user_message = UserMessage(text=message_text)
        
        logger.info(f"Sending PDF analysis request for {student_name}")
        response_text = await chat.send_message(user_message)
        logger.info(f"Received AI response: {response_text[:500]}")
        
        # Parse AI response
        # Extract JSON from response (AI might return markdown wrapped JSON)
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            analysis_json = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        # Convert to our format
        extracted_topics = []
        for topic in analysis_json.get('topics', []):
            extracted_topics.append({
                'topic_name': topic['topic_name'],
                'marks': float(topic['marks_obtained']),
                'total_marks': float(topic['total_marks']),
                'percentage': round((float(topic['marks_obtained']) / float(topic['total_marks']) * 100) if float(topic['total_marks']) > 0 else 0, 2)
            })
        
        # Calculate overall score
        total_marks_obtained = sum([t['marks'] for t in extracted_topics])
        total_marks_possible = sum([t['total_marks'] for t in extracted_topics])
        overall_score = round((total_marks_obtained / total_marks_possible * 100) if total_marks_possible > 0 else 0, 2)
        
        return {
            'success': True,
            'extracted_topics': extracted_topics,
            'overall_score': overall_score,
            'total_marks': total_marks_obtained,
            'total_possible': total_marks_possible,
            'confidence': analysis_json.get('confidence', 'medium'),
            'notes': analysis_json.get('notes', ''),
            'preview_text': pdf_text[:500],
            'student_info': {
                'name': student_name,
                'location': location,
                'level': level,
                'subject': subject,
                'exam_type': exam_type
            }
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        logger.error(f"Error analyzing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.post("/save-analyzed-results")
async def save_analyzed_results(data: ManualEntryRequest):
    """
    Save AI-analyzed results after tutor confirmation/editing
    Same as manual entry but from PDF analysis
    """
    try:
        # Reuse the manual entry logic
        return await manual_entry(data)
    except Exception as e:
        logger.error(f"Error saving analyzed results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Question Bank & Assessment Generation
from question_bank import (
    get_dummy_questions,
    generate_assessment_pdf,
    AssessmentRequest,
    DUMMY_QUESTION_BANK
)
from fastapi.responses import StreamingResponse

@math_router.get("/available-subtopics")
async def get_available_subtopics(level: str, subject: str, topics: str):
    """Get available subtopics for selected topics"""
    try:
        topic_list = topics.split(',') if topics else []
        bank_key = f"{level}_{subject.replace('.', '').replace(' ', '')}"
        
        if bank_key not in DUMMY_QUESTION_BANK:
            return {"success": True, "subtopics": []}
        
        subtopics = set()
        question_bank = DUMMY_QUESTION_BANK[bank_key]
        
        for topic in topic_list:
            if topic in question_bank:
                subtopics.update(question_bank[topic].keys())
        
        return {
            "success": True,
            "subtopics": sorted(list(subtopics))
        }
    except Exception as e:
        logger.error(f"Error fetching subtopics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.post("/generate-assessment")
async def generate_assessment(request: AssessmentRequest):
    """Generate revision assessment based on weak topics"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get student info
        student_ref = math_db.collection('students').document(request.student_id)
        student_doc = student_ref.get()
        
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student_data = student_doc.to_dict()
        
        # Get questions from dummy bank
        if request.generation_mode == "auto":
            # Auto-generate from weak topics
            questions = get_dummy_questions(
                student_data['level'],
                student_data['subject'],
                topics=request.selected_topics,
                subtopics=request.selected_subtopics if request.selected_subtopics else None
            )
            
            # Filter by time
            selected_questions = []
            total_time = 0
            
            # Shuffle for randomness
            random.shuffle(questions)
            
            for q in questions:
                if total_time + q['estimated_time_minutes'] <= request.duration_minutes:
                    selected_questions.append(q)
                    total_time += q['estimated_time_minutes']
                
                if total_time >= request.duration_minutes * 0.9:  # Use 90% of time
                    break
        else:
            # Manual selection
            all_questions = get_dummy_questions(student_data['level'], student_data['subject'])
            selected_questions = [q for q in all_questions if q['question_id'] in request.manual_question_ids]
        
        if not selected_questions:
            raise HTTPException(status_code=400, detail="No questions available for selected criteria")
        
        # Calculate total marks
        total_marks = sum([q['marks'] for q in selected_questions])
        
        # Create assessment ID
        assessment_id = f"assess_{datetime.now().strftime('%d%m%Y_%H%M%S')}"
        
        # Save assessment to Firebase
        assessment_data = {
            'assessment_id': assessment_id,
            'student_id': request.student_id,
            'result_id': request.result_id,
            'questions': selected_questions,
            'total_marks': total_marks,
            'duration_minutes': request.duration_minutes,
            'created_date': datetime.now().strftime('%d/%m/%Y'),
            'created_timestamp': datetime.now().isoformat(),
            'status': 'generated',  # generated, completed
            'topics': request.selected_topics,
            'subtopics': request.selected_subtopics
        }
        
        # Save to student's assessments subcollection
        student_ref.collection('assessments').document(assessment_id).set(assessment_data)
        
        return {
            'success': True,
            'assessment_id': assessment_id,
            'total_marks': total_marks,
            'question_count': len(selected_questions),
            'estimated_time': sum([q['estimated_time_minutes'] for q in selected_questions]),
            'message': 'Assessment generated successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/assessment/{student_id}/{assessment_id}/pdf")
async def download_assessment_pdf(student_id: str, assessment_id: str, version: str = "student"):
    """Download assessment PDF (student or tutor version)"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get assessment from Firebase
        assessment_ref = math_db.collection('students').document(student_id)\
            .collection('assessments').document(assessment_id)
        assessment_doc = assessment_ref.get()
        
        if not assessment_doc.exists:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        assessment_data = assessment_doc.to_dict()
        
        # Generate PDF
        include_solutions = (version == "tutor")
        pdf_bytes = generate_assessment_pdf(assessment_data, include_solutions)
        
        filename = f"Internal_Assessment_Test_{assessment_data['created_date'].replace('/', '')}"
        if include_solutions:
            filename += "_Solutions"
        filename += ".pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/student/{student_id}/assessments")
async def get_student_assessments(student_id: str):
    """Get all assessments for a student"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        assessments = []
        assessments_ref = math_db.collection('students').document(student_id).collection('assessments')
        
        for doc in assessments_ref.order_by('created_timestamp', direction=firestore.Query.DESCENDING).stream():
            assessment_data = doc.to_dict()
            # Don't include full questions in list, just summary
            assessments.append({
                'assessment_id': assessment_data['assessment_id'],
                'created_date': assessment_data['created_date'],
                'total_marks': assessment_data['total_marks'],
                'duration_minutes': assessment_data['duration_minutes'],
                'question_count': len(assessment_data['questions']),
                'status': assessment_data.get('status', 'generated'),
                'topics': assessment_data.get('topics', []),
                'result_id': assessment_data.get('result_id')
            })
        
        return {
            'success': True,
            'assessments': assessments
        }
        
    except Exception as e:
        logger.error(f"Error fetching assessments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/improvement-tracking/{student_id}/{result_id}")
async def get_improvement_tracking(student_id: str, result_id: str):
    """Get improvement metrics comparing original test with internal assessments"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Get original result
        student_ref = math_db.collection('students').document(student_id)
        original_result = student_ref.collection('results').document(result_id).get()
        
        if not original_result.exists:
            raise HTTPException(status_code=404, detail="Original result not found")
        
        original_data = original_result.to_dict()
        
        # Get internal assessments for this result
        assessments_ref = student_ref.collection('assessments')\
            .where('result_id', '==', result_id)\
            .where('status', '==', 'completed')
        
        assessment_results = []
        for doc in assessments_ref.stream():
            assessment_data = doc.to_dict()
            if 'completion_data' in assessment_data:
                assessment_results.append(assessment_data)
        
        # Calculate improvement metrics
        original_topics = {t['topic_name']: t['percentage'] for t in original_data['topics']}
        
        improvement_data = []
        for topic_name, original_score in original_topics.items():
            # Find latest assessment score for this topic
            latest_score = None
            for assessment in assessment_results:
                completion = assessment.get('completion_data', {})
                for topic in completion.get('topics', []):
                    if topic['topic_name'] == topic_name:
                        latest_score = topic['percentage']
            
            if latest_score is not None:
                improvement = latest_score - original_score
                improvement_data.append({
                    'topic': topic_name,
                    'original_score': original_score,
                    'latest_score': latest_score,
                    'improvement': improvement,
                    'improvement_percentage': round((improvement / original_score * 100) if original_score > 0 else 0, 2)
                })
        
        return {
            'success': True,
            'original_exam': original_data['exam_type'],
            'original_date': original_data['date'],
            'original_overall': original_data['overall_score'],
            'assessment_count': len(assessment_results),
            'improvements': improvement_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking improvement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.get("/all-results")
async def get_all_results(authorization: str = Header(None)):
    """Get all student results with scores for revision planning page (tutor authenticated)"""
    try:
        # Verify tutor authentication
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization header required")
        
        try:
            tutor_data = verify_tutor_token(authorization)
            tutor_id = tutor_data.get('tutor_id')
            if not tutor_id:
                raise HTTPException(status_code=401, detail="Invalid tutor token")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
        
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        all_results = []
        
        # Get all results directly from student_results collection, filtered by tutor_id
        results_ref = math_db.collection('student_results').where('tutor_id', '==', tutor_id).stream()
        
        for result_doc in results_ref:
            result_data = result_doc.to_dict()
            result_data['result_id'] = result_doc.id
            all_results.append(result_data)
        
        return {
            'success': True,
            'count': len(all_results),
            'results': all_results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching all results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.delete("/result/{result_id}")
async def delete_result(result_id: str):
    """Delete a specific result"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Check if result exists
        result_ref = math_db.collection('student_results').document(result_id)
        result_doc = result_ref.get()
        
        if not result_doc.exists:
            raise HTTPException(status_code=404, detail="Result not found")
        
        # Delete the result
        result_ref.delete()
        
        return {
            'success': True,
            'message': 'Result deleted successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@math_router.put("/result/{result_id}")
async def update_result(result_id: str, update_data: dict):
    """Update a specific result's topics and overall score"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Check if result exists
        result_ref = math_db.collection('student_results').document(result_id)
        result_doc = result_ref.get()
        
        if not result_doc.exists:
            raise HTTPException(status_code=404, detail="Result not found")
        
        # Update the result
        update_payload = {
            'topics': update_data.get('topics', []),
            'overall_score': update_data.get('overall_score', 0),
            'last_updated': datetime.utcnow().isoformat()
        }
        
        result_ref.update(update_payload)
        
        return {
            'success': True,
            'message': 'Result updated successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
