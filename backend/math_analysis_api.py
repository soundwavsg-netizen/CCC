"""
Math Results Analysis System API
Handles student result uploads, analysis, and revision plan generation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
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

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Firebase for Math Analysis (separate project)
ROOT_DIR = Path(__file__).parent

try:
    # Initialize Math Analysis Firebase app (separate from tuition chatbot)
    math_cred = credentials.Certificate(ROOT_DIR / 'firebase-math-analysis-credentials.json')
    math_app = firebase_admin.initialize_app(math_cred, {
        'projectId': 'student-result-analysis-c4c02',
        'storageBucket': 'student-result-analysis-c4c02.firebasestorage.app'
    }, name='math_analysis')
    math_db = firestore.client(math_app)
    math_storage = storage.bucket(app=math_app)
    logger.info("Math Analysis Firebase initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Math Analysis Firebase: {str(e)}")
    math_db = None
    math_storage = None

# Create router
math_router = APIRouter(prefix="/math-analysis", tags=["Math Analysis"])

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
    subject: Optional[str] = None
):
    """Get list of all students with optional filters"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        query = math_db.collection('students')
        
        # Apply filters
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
        
        # Get all results
        results = []
        for result_doc in student_ref.collection('results').order_by('date', direction=firestore.Query.DESCENDING).stream():
            result_data = result_doc.to_dict()
            result_data['result_id'] = result_doc.id
            results.append(result_data)
        
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
async def get_analytics(filters: AnalyticsFilter):
    """Get analytics data with filters for dashboard"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Build query
        query = math_db.collection('students')
        
        if filters.location:
            query = query.where('location', '==', filters.location)
        if filters.level:
            query = query.where('level', '==', filters.level)
        if filters.subject:
            query = query.where('subject', '==', filters.subject)
        
        # Get students matching filter
        students_data = []
        all_results = []
        
        for student_doc in query.stream():
            student_info = student_doc.to_dict()
            student_info['student_id'] = student_doc.id
            
            # Get results
            results_query = student_doc.reference.collection('results')
            if filters.exam_type:
                results_query = results_query.where('exam_type', '==', filters.exam_type)
            
            student_results = []
            for result_doc in results_query.stream():
                result_data = result_doc.to_dict()
                result_data['result_id'] = result_doc.id
                student_results.append(result_data)
                all_results.append({
                    **result_data,
                    'student_name': student_info['name'],
                    'student_id': student_doc.id
                })
            
            if student_results:  # Only include students with results
                student_info['results'] = student_results
                students_data.append(student_info)
        
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
        overall_avg = sum([r.get('overall_score', 0) for r in all_results]) / len(all_results) if all_results else 0
        
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
        
        # Get latest or specific exam results
        results_query = student_ref.collection('results').order_by('date', direction=firestore.Query.DESCENDING)
        if exam_type:
            results_query = results_query.where('exam_type', '==', exam_type)
        
        results = list(results_query.limit(1).stream())
        
        if not results:
            return {
                'success': True,
                'message': 'No results found for revision plan',
                'revision_plan': []
            }
        
        latest_result = results[0].to_dict()
        weak_topics = latest_result.get('analysis', {}).get('weaknesses', [])
        
        # Get topic library resources
        revision_items = []
        for weak in weak_topics:
            topic_name = weak['topic']
            
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
            'weak_topics_count': len(revision_items)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating revision plan: {str(e)}")
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
