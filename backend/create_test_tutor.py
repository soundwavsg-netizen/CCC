"""
Create a test tutor (Jane Smith) to verify tutor isolation
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from tutor_auth_api import math_db, hash_password
from datetime import datetime

def create_test_tutor():
    """Create Jane Smith tutor profile for testing tutor isolation"""
    
    if not math_db:
        print("❌ Firebase not initialized")
        return
    
    print("🧪 Creating test tutor (Jane Smith) to verify tutor isolation...")
    
    # Create Jane Smith tutor profile
    tutor_data = {
        'tutor_id': 'janesmith',
        'tutor_name': 'Jane Smith',
        'login_id': 'janesmith',
        'password_hash': hash_password('test123'),  # Password: test123
        'temp_password': None,
        'must_change_password': False,
        'locations': ['Tampines', 'Jurong'],
        'levels': ['S1', 'S2', 'S3'],
        'subjects': ['Math', 'E Math'],
        'created_at': datetime.utcnow().isoformat(),
        'last_login': None
    }
    
    # Check if tutor exists
    existing = math_db.collection('tutors').document('janesmith').get()
    if existing.exists:
        print("⚠️  Tutor 'janesmith' already exists. Updating...")
        math_db.collection('tutors').document('janesmith').update(tutor_data)
    else:
        math_db.collection('tutors').document('janesmith').set(tutor_data)
    
    print(f"✅ Created test tutor: Jane Smith")
    print(f"   Login ID: janesmith")
    print(f"   Password: test123")
    print(f"   Locations: Tampines, Jurong")
    print(f"   Levels: S1, S2, S3")
    print(f"   Subjects: Math, E Math")
    print(f"   📝 Note: This tutor should have NO student data when logging in")

if __name__ == "__main__":
    create_test_tutor()