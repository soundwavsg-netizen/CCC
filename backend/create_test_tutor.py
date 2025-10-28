"""
Create a test tutor (Jane Smith) to verify tutor isolation
"""

import hashlib
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
import json

def create_test_tutor():
    """Create Jane Smith tutor profile for testing tutor isolation"""
    
    # Initialize Firebase if not already done
    try:
        # Try to get the existing app
        app = firebase_admin.get_app()
        print("Using existing Firebase app")
    except ValueError:
        # No app exists, create one
        cred_path = '/app/backend/firebase-math-analysis-credentials.json'
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Initialized new Firebase app")
        else:
            print("❌ Firebase credentials not found")
            return

    db = firestore.client()
    
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    print("🧪 Creating test tutor (Jane Smith) to verify tutor isolation...")
    
    # Create Jane Smith tutor profile
    tutor_data = {
        'tutor_id': 'janesmith',
        'tutor_name': 'Jane Smith',
        'login_id': 'janesmith',
        'password_hash': hash_password('test123'),  # Password: test123
        'temp_password': 'test123',  # Store for admin viewing
        'must_change_password': False,
        'locations': ['Punggol', 'Kovan', 'Jurong'],
        'levels': ['S1', 'S2', 'S3'],
        'subjects': ['Math', 'E Math'],
        'created_at': datetime.utcnow().isoformat(),
        'last_login': None
    }
    
    # Check if tutor exists
    existing = db.collection('tutors').document('janesmith').get()
    if existing.exists:
        print("⚠️  Tutor 'janesmith' already exists. Updating...")
        db.collection('tutors').document('janesmith').update(tutor_data)
    else:
        db.collection('tutors').document('janesmith').set(tutor_data)
    
    print(f"✅ Created test tutor: Jane Smith")
    print(f"   Login ID: janesmith")
    print(f"   Password: test123")
    print(f"   Locations: RMSS - Tampines, RMSS - Jurong")
    print(f"   Levels: S1, S2, S3")
    print(f"   Subjects: Math, E Math")
    print(f"   📝 Note: This tutor should have NO student data when logging in")

if __name__ == "__main__":
    create_test_tutor()