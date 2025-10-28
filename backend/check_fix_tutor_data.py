"""
Check and fix tutor_id in existing student data
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os

def check_and_fix_tutor_data():
    """Check what tutor_id is stored in existing data and fix it"""
    
    # Initialize Firebase
    try:
        app = firebase_admin.get_app()
        print("Using existing Firebase app")
    except ValueError:
        cred_path = '/app/backend/firebase-math-analysis-credentials.json'
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Initialized new Firebase app")
        else:
            print("❌ Firebase credentials not found")
            return

    db = firestore.client()
    
    print("🔍 Checking existing student results data...")
    
    # Check all student results
    results_ref = db.collection('student_results').stream()
    
    for result_doc in results_ref:
        result_data = result_doc.to_dict()
        result_id = result_doc.id
        
        print(f"\n📋 Result ID: {result_id}")
        print(f"   Student Name: {result_data.get('student_name', 'N/A')}")
        print(f"   Tutor ID: {result_data.get('tutor_id', 'MISSING!')}")
        print(f"   Location: {result_data.get('location', 'N/A')}")
        print(f"   Level: {result_data.get('level', 'N/A')}")
        
        # If tutor_id is missing or wrong, fix it
        if result_data.get('tutor_id') != 'seanyeo':
            print(f"   🔧 Fixing tutor_id: {result_data.get('tutor_id')} → seanyeo")
            db.collection('student_results').document(result_id).update({
                'tutor_id': 'seanyeo'
            })
    
    print("\n🔍 Checking students collection...")
    
    # Check all students
    students_ref = db.collection('students').stream()
    
    for student_doc in students_ref:
        student_data = student_doc.to_dict()
        student_id = student_doc.id
        
        print(f"\n👤 Student ID: {student_id}")
        print(f"   Student Name: {student_data.get('name', 'N/A')}")
        print(f"   Tutor ID: {student_data.get('tutor_id', 'MISSING!')}")
        print(f"   Location: {student_data.get('location', 'N/A')}")
        
        # If tutor_id is missing or wrong, fix it
        if student_data.get('tutor_id') != 'seanyeo':
            print(f"   🔧 Fixing tutor_id: {student_data.get('tutor_id')} → seanyeo")
            db.collection('students').document(student_id).update({
                'tutor_id': 'seanyeo'
            })
    
    print("\n✅ Data check and fix complete!")

if __name__ == "__main__":
    check_and_fix_tutor_data()