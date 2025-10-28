"""
Seed data for Math Analysis System
Creates demo tutor (Mr. Sean Yeo) and sample student results
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from tutor_auth_api import math_db, hash_password
from datetime import datetime

async def seed_tutor_and_data():
    """Seed Mr. Sean Yeo tutor profile and sample student results"""
    
    if not math_db:
        print("❌ Firebase not initialized")
        return
    
    print("🌱 Seeding Math Analysis System with demo data...")
    
    # 1. Create Mr. Sean Yeo tutor profile
    tutor_data = {
        'tutor_id': 'seanyeo',
        'tutor_name': 'Sean Yeo',
        'login_id': 'seanyeo',
        'password_hash': hash_password('demo123'),  # Password: demo123
        'temp_password': None,
        'must_change_password': False,
        'locations': ['Marine Parade', 'Bishan'],
        'levels': ['S1', 'S2', 'S3', 'S4', 'J1', 'J2'],
        'subjects': ['Math', 'A Math', 'E Math'],
        'created_at': datetime.utcnow().isoformat(),
        'last_login': None
    }
    
    # Check if tutor exists
    existing = math_db.collection('tutors').document('seanyeo').get()
    if existing.exists:
        print("⚠️  Tutor 'seanyeo' already exists. Updating...")
        math_db.collection('tutors').document('seanyeo').update(tutor_data)
    else:
        math_db.collection('tutors').document('seanyeo').set(tutor_data)
    
    print(f"✅ Created tutor: Sean Yeo (login: seanyeo, password: demo123)")
    
    # 2. Create 3 sample student results
    sample_results = [
        {
            'student_id': 'demo_student_1',
            'student_name': 'John Tan',
            'location': 'RMSS - Marine Parade',
            'level': 'S3',
            'subject': 'A Math',
            'exam_type': 'Mid-Year Exam 2025',
            'exam_date': '2025-05-15',
            'overall_score': 72,
            'topics': [
                {'topic_name': 'Algebra', 'marks': 18, 'total_marks': 25, 'percentage': 72},
                {'topic_name': 'Trigonometry', 'marks': 16, 'total_marks': 25, 'percentage': 64},
                {'topic_name': 'Calculus', 'marks': 21, 'total_marks': 25, 'percentage': 84},
                {'topic_name': 'Geometry', 'marks': 17, 'total_marks': 25, 'percentage': 68}
            ],
            'created_at': datetime.utcnow().isoformat(),
            'tutor_id': 'seanyeo'
        },
        {
            'student_id': 'demo_student_2',
            'student_name': 'Emily Lim',
            'location': 'RMSS - Bishan',
            'level': 'S2',
            'subject': 'Math',
            'exam_type': 'Term 2 Assessment',
            'exam_date': '2025-06-10',
            'overall_score': 81,
            'topics': [
                {'topic_name': 'Algebra', 'marks': 22, 'total_marks': 25, 'percentage': 88},
                {'topic_name': 'Geometry', 'marks': 19, 'total_marks': 25, 'percentage': 76},
                {'topic_name': 'Statistics', 'marks': 23, 'total_marks': 25, 'percentage': 92},
                {'topic_name': 'Numbers', 'marks': 17, 'total_marks': 25, 'percentage': 68}
            ],
            'created_at': datetime.utcnow().isoformat(),
            'tutor_id': 'seanyeo'
        },
        {
            'student_id': 'demo_student_3',
            'student_name': 'Ryan Wong',
            'location': 'RMSS - Marine Parade',
            'level': 'J1',
            'subject': 'Math',
            'exam_type': 'Common Test 1',
            'exam_date': '2025-04-20',
            'overall_score': 65,
            'topics': [
                {'topic_name': 'Calculus', 'marks': 15, 'total_marks': 25, 'percentage': 60},
                {'topic_name': 'Vectors', 'marks': 16, 'total_marks': 25, 'percentage': 64},
                {'topic_name': 'Probability', 'marks': 18, 'total_marks': 25, 'percentage': 72},
                {'topic_name': 'Functions', 'marks': 16, 'total_marks': 25, 'percentage': 64}
            ],
            'created_at': datetime.utcnow().isoformat(),
            'tutor_id': 'seanyeo'
        }
    ]
    
    # Save sample results to Firebase
    for result in sample_results:
        student_id = result['student_id']
        
        # Check if student exists
        student_doc = math_db.collection('students').document(student_id).get()
        if not student_doc.exists:
            # Create student profile
            math_db.collection('students').document(student_id).set({
                'student_id': student_id,
                'name': result['student_name'],
                'location': result['location'],
                'level': result['level'],
                'subject': result['subject'],
                'tutor_id': 'seanyeo'
            })
            print(f"✅ Created student: {result['student_name']}")
        
        # Create result document
        result_id = f"{student_id}_{result['exam_type'].replace(' ', '_')}"
        result['result_id'] = result_id
        
        math_db.collection('student_results').document(result_id).set(result)
        print(f"✅ Added result: {result['student_name']} - {result['exam_type']} ({result['overall_score']}%)")
    
    print("\n🎉 Seeding complete!")
    print("\n📋 Demo Login Credentials:")
    print("   Login ID: seanyeo")
    print("   Password: demo123")
    print("\n📊 Sample Students:")
    print("   1. John Tan (S3 A Math, Marine Parade) - 72%")
    print("   2. Emily Lim (S2 Math, Bishan) - 81%")
    print("   3. Ryan Wong (J1 Math, Marine Parade) - 65%")

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_tutor_and_data())
