"""
Question Bank Management for Math Results Analysis System
Handles question storage, retrieval, and assessment generation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import random
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io

# Models for Question Bank
class Question(BaseModel):
    question_id: Optional[str] = None
    topic: str
    subtopic: str
    question_text: str
    marks: float
    difficulty_level: str  # Easy, Medium, Hard (implied by subtopic)
    solution: str
    estimated_time_minutes: float  # How long this question typically takes

class QuestionBank(BaseModel):
    level: str
    subject: str
    questions: List[Question]

class AssessmentRequest(BaseModel):
    student_id: str
    result_id: str  # The original test result this assessment is for
    selected_topics: List[str]  # Topics to include
    selected_subtopics: List[str]  # Specific subtopics
    duration_minutes: int  # 45 or 90
    generation_mode: str  # "auto" or "manual"
    manual_question_ids: Optional[List[str]] = []  # If manual selection

class GeneratedAssessment(BaseModel):
    assessment_id: str
    student_id: str
    result_id: str
    questions: List[Question]
    total_marks: float
    duration_minutes: int
    created_date: str

# Dummy Question Bank for Testing
DUMMY_QUESTION_BANK = {
    "S4_AMath": {
        "Functions": {
            "Composite Functions": [
                {
                    "question_id": "func_comp_1",
                    "topic": "Functions",
                    "subtopic": "Composite Functions",
                    "question_text": "Given f(x) = 2x + 3 and g(x) = x², find fg(x) and gf(x).",
                    "marks": 4.0,
                    "difficulty_level": "Medium",
                    "solution": "fg(x) = f(g(x)) = f(x²) = 2x² + 3\ngf(x) = g(f(x)) = g(2x+3) = (2x+3)² = 4x² + 12x + 9",
                    "estimated_time_minutes": 5.0
                },
                {
                    "question_id": "func_comp_2",
                    "topic": "Functions",
                    "subtopic": "Composite Functions",
                    "question_text": "If h(x) = 3x - 1 and h⁻¹(x) is the inverse function, find h⁻¹(5).",
                    "marks": 3.0,
                    "difficulty_level": "Medium",
                    "solution": "Let y = 3x - 1\nx = (y+1)/3\nh⁻¹(x) = (x+1)/3\nh⁻¹(5) = (5+1)/3 = 2",
                    "estimated_time_minutes": 4.0
                }
            ],
            "Inverse Functions": [
                {
                    "question_id": "func_inv_1",
                    "topic": "Functions",
                    "subtopic": "Inverse Functions",
                    "question_text": "Find the inverse of f(x) = (2x - 1)/(x + 3), stating any restrictions.",
                    "marks": 6.0,
                    "difficulty_level": "Hard",
                    "solution": "Let y = (2x-1)/(x+3)\ny(x+3) = 2x-1\nyx + 3y = 2x - 1\nyx - 2x = -3y - 1\nx(y-2) = -3y-1\nx = (-3y-1)/(y-2)\nf⁻¹(x) = (-3x-1)/(x-2), x ≠ 2",
                    "estimated_time_minutes": 8.0
                }
            ]
        },
        "Vectors": {
            "Vector Operations": [
                {
                    "question_id": "vec_op_1",
                    "topic": "Vectors",
                    "subtopic": "Vector Operations",
                    "question_text": "Given vectors a = 2i + 3j and b = -i + 4j, find:\n(a) a + 2b\n(b) |a - b|",
                    "marks": 5.0,
                    "difficulty_level": "Medium",
                    "solution": "(a) a + 2b = (2i+3j) + 2(-i+4j) = 2i+3j-2i+8j = 11j\n(b) a-b = 3i-j, |a-b| = √(9+1) = √10",
                    "estimated_time_minutes": 6.0
                }
            ],
            "Dot Product": [
                {
                    "question_id": "vec_dot_1",
                    "topic": "Vectors",
                    "subtopic": "Dot Product",
                    "question_text": "Vectors p = 3i + 4j and q = 2i - j. Find the angle between p and q.",
                    "marks": 6.0,
                    "difficulty_level": "Hard",
                    "solution": "p·q = 6 - 4 = 2\n|p| = 5, |q| = √5\ncos θ = 2/(5√5) = 2√5/25\nθ = cos⁻¹(2√5/25) ≈ 82.9°",
                    "estimated_time_minutes": 7.0
                }
            ]
        },
        "Calculus": {
            "Differentiation": [
                {
                    "question_id": "calc_diff_1",
                    "topic": "Calculus",
                    "subtopic": "Differentiation",
                    "question_text": "Find dy/dx for y = (3x² + 2x - 1)⁵",
                    "marks": 4.0,
                    "difficulty_level": "Medium",
                    "solution": "Using chain rule:\ndy/dx = 5(3x²+2x-1)⁴ × (6x+2)\n= 10(3x+1)(3x²+2x-1)⁴",
                    "estimated_time_minutes": 5.0
                },
                {
                    "question_id": "calc_diff_2",
                    "topic": "Calculus",
                    "subtopic": "Differentiation",
                    "question_text": "Given y = x³ - 6x² + 9x + 2, find the stationary points and determine their nature.",
                    "marks": 8.0,
                    "difficulty_level": "Hard",
                    "solution": "dy/dx = 3x² - 12x + 9 = 0\nx² - 4x + 3 = 0\n(x-1)(x-3) = 0\nx = 1 or x = 3\nd²y/dx² = 6x - 12\nAt x=1: d²y/dx² = -6 < 0 → maximum\nAt x=3: d²y/dx² = 6 > 0 → minimum\nMax at (1, 6), Min at (3, 2)",
                    "estimated_time_minutes": 10.0
                }
            ],
            "Integration": [
                {
                    "question_id": "calc_int_1",
                    "topic": "Calculus",
                    "subtopic": "Integration",
                    "question_text": "Evaluate ∫(2x + 1)³ dx",
                    "marks": 4.0,
                    "difficulty_level": "Medium",
                    "solution": "Let u = 2x+1, du = 2dx\n∫u³ (du/2) = (1/2) × (u⁴/4) + c\n= (2x+1)⁴/8 + c",
                    "estimated_time_minutes": 5.0
                }
            ]
        }
    },
    "S3_EMath": {
        "Functions": {
            "Linear Functions": [
                {
                    "question_id": "s3_func_lin_1",
                    "topic": "Functions",
                    "subtopic": "Linear Functions",
                    "question_text": "Find the equation of the line passing through (2, 5) and (4, 9).",
                    "marks": 4.0,
                    "difficulty_level": "Easy",
                    "solution": "m = (9-5)/(4-2) = 2\ny - 5 = 2(x - 2)\ny = 2x + 1",
                    "estimated_time_minutes": 4.0
                }
            ]
        },
        "Algebra": {
            "Factorization": [
                {
                    "question_id": "s3_alg_fact_1",
                    "topic": "Algebra",
                    "subtopic": "Factorization",
                    "question_text": "Factorize completely: 2x² - 8x + 6",
                    "marks": 3.0,
                    "difficulty_level": "Easy",
                    "solution": "2(x² - 4x + 3)\n= 2(x - 1)(x - 3)",
                    "estimated_time_minutes": 3.0
                }
            ]
        }
    }
}

def get_dummy_questions(level: str, subject: str, topics: List[str] = None, subtopics: List[str] = None) -> List[Dict]:
    """Get dummy questions for testing"""
    bank_key = f"{level}_{subject.replace('.', '').replace(' ', '')}"
    
    if bank_key not in DUMMY_QUESTION_BANK:
        return []
    
    questions = []
    question_bank = DUMMY_QUESTION_BANK[bank_key]
    
    for topic, subtopic_dict in question_bank.items():
        if topics and topic not in topics:
            continue
            
        for subtopic, question_list in subtopic_dict.items():
            if subtopics and subtopic not in subtopics:
                continue
                
            questions.extend(question_list)
    
    return questions

def generate_assessment_pdf(assessment: Dict, include_solutions: bool = False) -> bytes:
    """Generate PDF for assessment"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor='black',
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Normal'],
        fontSize=10,
        textColor='black',
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    question_style = ParagraphStyle(
        'Question',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        leftIndent=0
    )
    
    solution_style = ParagraphStyle(
        'Solution',
        parent=styles['Normal'],
        fontSize=10,
        textColor='blue',
        spaceAfter=12,
        leftIndent=20
    )
    
    story = []
    
    # Title
    if include_solutions:
        story.append(Paragraph("Internal Assessment Test - Solutions", title_style))
    else:
        story.append(Paragraph("Internal Assessment Test", title_style))
    
    # Header info
    story.append(Paragraph(f"Date: {assessment['created_date']}", header_style))
    story.append(Paragraph(f"Duration: {assessment['duration_minutes']} minutes", header_style))
    story.append(Paragraph(f"Total Marks: {assessment['total_marks']}", header_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Questions
    for i, q in enumerate(assessment['questions'], 1):
        # Question text
        question_text = f"<b>Question {i}</b> ({q['marks']} marks)<br/>{q['question_text']}"
        story.append(Paragraph(question_text, question_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Solution (only if tutor version)
        if include_solutions:
            solution_text = f"<b>Solution:</b><br/>{q['solution'].replace(chr(10), '<br/>')}"
            story.append(Paragraph(solution_text, solution_style))
            story.append(Spacer(1, 0.2*inch))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

# Export functions
__all__ = [
    'Question',
    'QuestionBank',
    'AssessmentRequest',
    'GeneratedAssessment',
    'get_dummy_questions',
    'generate_assessment_pdf',
    'DUMMY_QUESTION_BANK'
]
