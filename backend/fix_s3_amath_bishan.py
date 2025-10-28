"""
Fix S3 AMath Bishan Data - Add Missing Tutors and Fix Schedules
Based on S3 2026 FORM_BLANK v.4Sep.pdf
"""
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path

print("=" * 80)
print("FIXING S3 AMath Bishan Data")
print("=" * 80)

# Initialize Firebase
try:
    db = firestore.client()
    print("🔥 Using existing Firebase connection")
except:
    cred = credentials.Certificate('/app/backend/firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase initialized")

# Correct S3 AMath Bishan data from PDF
correct_data = [
    {
        'tutor_name': 'Mr Sean Yeo (HOD)',
        'tutor_base_name': 'Sean Yeo (HOD)',
        'schedule': [
            {'day': 'THU', 'time': '5:00pm-6:30pm'},
            {'day': 'SUN', 'time': '12:30pm-2:00pm'}
        ]
    },
    {
        'tutor_name': 'Mr John Lee (DY HOD)',
        'tutor_base_name': 'John Lee (DY_HOD)',
        'schedule': [
            {'day': 'MON', 'time': '6:30pm-8:00pm'},
            {'day': 'SAT', 'time': '3:30pm-5:00pm'}
        ]
    },
    {
        'tutor_name': 'Mr Sean Tan',
        'tutor_base_name': 'Sean Tan',
        'schedule': [
            {'day': 'MON', 'time': '6:30pm-8:00pm'},
            {'day': 'SAT', 'time': '10:30am-12:00pm'}
        ]
    },
    {
        'tutor_name': 'Mr Lim W.M.',
        'tutor_base_name': 'Lim W.M.',
        'schedule': [
            {'day': 'WED', 'time': '5:00pm-6:30pm'},
            {'day': 'SAT', 'time': '3:00pm-4:30pm'}
        ]
    },
    {
        'tutor_name': 'Mr Ronnie Quek',
        'tutor_base_name': 'Ronnie Quek',
        'schedule': [
            {'day': 'WED', 'time': '7:30pm-9:00pm'},
            {'day': 'SUN', 'time': '12:00pm-1:30pm'}
        ]
    },
    {
        'tutor_name': 'Mr Sean Phua',
        'tutor_base_name': 'Sean Phua',
        'schedule': [
            {'day': 'THU', 'time': '5:00pm-6:30pm'},
            {'day': 'SAT', 'time': '11:30am-1:00pm'}
        ]
    },
    {
        'tutor_name': 'Mr Jackie',
        'tutor_base_name': 'Jackie',
        'schedule': [
            {'day': 'THU', 'time': '8:00pm-9:30pm'},
            {'day': 'SUN', 'time': '2:00pm-3:30pm'}
        ]
    },
    {
        'tutor_name': 'Mr Ng C.H.',
        'tutor_base_name': 'Ng C.H.',
        'schedule': [
            {'day': 'FRI', 'time': '8:00pm-9:30pm'},
            {'day': 'SUN', 'time': '2:00pm-3:30pm'}
        ]
    }
]

# Delete all existing S3 AMath Bishan classes
print("\n🗑️  Deleting existing S3 AMath Bishan classes...")
classes_ref = db.collection('classes')
existing = classes_ref.where('level', '==', 'S3').where('subject', '==', 'AMath').where('location', '==', 'Bishan').stream()
deleted_count = 0
for doc in existing:
    doc.reference.delete()
    deleted_count += 1
print(f"   Deleted {deleted_count} existing classes")

# Add correct data
print("\n✅ Adding correct S3 AMath Bishan classes...")
for idx, class_data in enumerate(correct_data, 1):
    class_doc = {
        'class_id': f"s3_amath_bishan_{class_data['tutor_base_name'].lower().replace(' ', '_').replace('.', '').replace('(', '').replace(')', '')}",
        'level': 'S3',
        'subject': 'AMath',
        'location': 'Bishan',
        'tutor_name': class_data['tutor_name'],
        'tutor_base_name': class_data['tutor_base_name'],
        'schedule': class_data['schedule'],
        'monthly_fee': 397.85,
        'sessions_per_week': 2
    }
    
    db.collection('classes').document(class_doc['class_id']).set(class_doc)
    print(f"   {idx}. Added {class_data['tutor_base_name']}")

# Update tutors collection
print("\n👥 Updating tutors collection...")
tutors_to_update = [
    ('Lim W.M.', ['S3'], ['AMath'], ['Bishan']),
    ('Ronnie Quek', ['S3'], ['AMath'], ['Bishan']),
    ('Jackie', ['S3'], ['AMath'], ['Bishan']),
    ('Ng C.H.', ['S3'], ['AMath'], ['Bishan'])
]

for tutor_name, levels, subjects, locations in tutors_to_update:
    tutor_id = tutor_name.lower().replace(' ', '_').replace('.', '')
    tutor_ref = db.collection('tutors').document(tutor_id)
    
    # Check if tutor exists
    tutor_doc = tutor_ref.get()
    if tutor_doc.exists:
        # Update existing
        data = tutor_doc.to_dict()
        existing_levels = set(data.get('levels', []))
        existing_subjects = set(data.get('subjects', []))
        existing_locations = set(data.get('locations', []))
        
        existing_levels.update(levels)
        existing_subjects.update(subjects)
        existing_locations.update(locations)
        
        tutor_ref.update({
            'levels': list(existing_levels),
            'subjects': list(existing_subjects),
            'locations': list(existing_locations)
        })
        print(f"   Updated {tutor_name}")
    else:
        # Create new
        tutor_ref.set({
            'name': tutor_name,
            'tutor_id': tutor_id,
            'levels': levels,
            'subjects': subjects,
            'locations': locations,
            'total_classes': 1
        })
        print(f"   Created {tutor_name}")

print("\n" + "=" * 80)
print("✅ S3 AMath Bishan data fixed!")
print("   Now has all 8 tutors with correct schedules")
print("=" * 80)
