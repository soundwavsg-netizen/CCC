"""
Firebase Data Upload Script for RMSS Tuition Centre
Uploads tutors, calendar, and pricing data to Firestore
"""
import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate('/app/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("🔥 Firebase initialized successfully!")

# ========================================
# CALENDAR DATA
# ========================================

calendar_data = [
    # Major Holidays (Black grids - no lessons, no replacement)
    {"type": "holiday", "name": "Chinese New Year", "date": "2026-02-16", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Hari Raya Puasa", "date": "2026-03-17", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Good Friday", "date": "2026-03-30", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Labour Day", "date": "2026-04-06", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Hari Raya Haji / Vesak Day", "date": "2026-05-27", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "National Day", "date": "2026-08-09", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Deepavali", "date": "2026-11-08", "no_lessons": True, "no_replacement": True, "color": "black"},
    {"type": "holiday", "name": "Christmas Day", "date": "2026-12-25", "no_lessons": True, "no_replacement": True, "color": "black"},
    
    # Rest Weeks (Grey grids - no normal lessons)
    {"type": "rest_week", "name": "June Rest Week", "start_date": "2026-05-31", "end_date": "2026-06-07", "no_normal_lessons": True, "color": "grey"},
    {"type": "rest_week", "name": "December Rest Week", "start_date": "2026-12-28", "end_date": "2027-01-03", "no_normal_lessons": True, "color": "grey"},
    
    # Exam Preparation Periods
    {"type": "exam_prep", "name": "MYE Preparation", "start_date": "2026-03-16", "end_date": "2026-03-21", "no_lessons": True},
    {"type": "exam_prep", "name": "FYE Preparation", "start_date": "2026-09-13", "end_date": "2026-09-20", "no_lessons": True},
    
    # Holiday Programs (Additional lessons available)
    {"type": "holiday_program", "name": "March Holiday Program (MHP)", "month": "March", "free_trials": True},
    {"type": "holiday_program", "name": "June Holiday Program Week 1 (JHP1)", "month": "June", "free_trials": True},
    {"type": "holiday_program", "name": "June Holiday Program Week 2 (JHP2)", "month": "June", "free_trials": True},
    {"type": "holiday_program", "name": "September Holiday Program (SHP)", "month": "September", "free_trials": True},
    
    # Fee Settlement Periods
    {"type": "fee_settlement", "month": "January", "start_date": "2026-01-26", "end_date": "2026-02-01"},
    {"type": "fee_settlement", "month": "February", "start_date": "2026-02-22", "end_date": "2026-02-28"},
    {"type": "fee_settlement", "month": "March", "start_date": "2026-03-29", "end_date": "2026-04-05"},
    {"type": "fee_settlement", "month": "April", "start_date": "2026-04-26", "end_date": "2026-04-30"},
    {"type": "fee_settlement", "month": "May", "start_date": "2026-05-24", "end_date": "2026-05-30"},
    {"type": "fee_settlement", "month": "June", "start_date": "2026-06-21", "end_date": "2026-06-27"},
    {"type": "fee_settlement", "month": "July", "start_date": "2026-07-26", "end_date": "2026-08-02"},
    {"type": "fee_settlement", "month": "August", "start_date": "2026-08-23", "end_date": "2026-08-29"},
    {"type": "fee_settlement", "month": "September", "start_date": "2026-09-27", "end_date": "2026-10-04"},
    {"type": "fee_settlement", "month": "October", "start_date": "2026-10-25", "end_date": "2026-10-31"},
    {"type": "fee_settlement", "month": "November", "start_date": "2026-11-22", "end_date": "2026-11-28"},
    {"type": "fee_settlement", "month": "December", "start_date": "2026-12-20", "end_date": "2026-12-26"},
]

print("\n📅 Uploading calendar data...")
calendar_ref = db.collection('calendar')
for i, event in enumerate(calendar_data):
    doc_id = f"{event['type']}_{i}"
    calendar_ref.document(doc_id).set(event)
    print(f"  ✅ Added: {event.get('name', event.get('month', event['type']))}")

print(f"✅ Calendar data uploaded: {len(calendar_data)} events")

# ========================================
# PRICING DATA
# ========================================

pricing_data = [
    # Primary School
    {"level": "P2", "subject": "Math", "monthly_fee": 261.60, "course_fee": 230, "material_fee": 10, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P2", "subject": "English", "monthly_fee": 261.60, "course_fee": 230, "material_fee": 10, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P2", "subject": "Chinese", "monthly_fee": 261.60, "course_fee": 230, "material_fee": 10, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "P3", "subject": "Math", "monthly_fee": 277.95, "course_fee": 240, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P3", "subject": "Science", "monthly_fee": 277.95, "course_fee": 240, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P3", "subject": "English", "monthly_fee": 277.95, "course_fee": 240, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P3", "subject": "Chinese", "monthly_fee": 277.95, "course_fee": 240, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "P4", "subject": "Math", "monthly_fee": 332.45, "course_fee": 290, "material_fee": 15, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "P4", "subject": "English", "monthly_fee": 288.85, "course_fee": 250, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P4", "subject": "Science", "monthly_fee": 288.85, "course_fee": 250, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P4", "subject": "Chinese", "monthly_fee": 288.85, "course_fee": 250, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "P5", "subject": "Math", "monthly_fee": 346.62, "course_fee": 300, "material_fee": 18, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "P5", "subject": "Science", "monthly_fee": 303.02, "course_fee": 260, "material_fee": 18, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P5", "subject": "English", "monthly_fee": 299.75, "course_fee": 260, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P5", "subject": "Chinese", "monthly_fee": 299.75, "course_fee": 260, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "P6", "subject": "Math", "monthly_fee": 357.52, "course_fee": 310, "material_fee": 18, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "P6", "subject": "Science", "monthly_fee": 313.92, "course_fee": 270, "material_fee": 18, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P6", "subject": "English", "monthly_fee": 310.65, "course_fee": 270, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "P6", "subject": "Chinese", "monthly_fee": 310.65, "course_fee": 270, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    # Secondary School
    {"level": "S1", "subject": "Math", "monthly_fee": 370.60, "course_fee": 320, "material_fee": 20, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "S1", "subject": "Science", "monthly_fee": 327.00, "course_fee": 280, "material_fee": 20, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S1", "subject": "English", "monthly_fee": 321.55, "course_fee": 280, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S1", "subject": "Chinese", "monthly_fee": 321.55, "course_fee": 280, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "S2", "subject": "Math", "monthly_fee": 381.50, "course_fee": 330, "material_fee": 20, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "S2", "subject": "Science", "monthly_fee": 327.00, "course_fee": 280, "material_fee": 20, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S2", "subject": "English", "monthly_fee": 321.55, "course_fee": 280, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S2", "subject": "Chinese", "monthly_fee": 321.55, "course_fee": 280, "material_fee": 15, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "S3", "subject": "EMath", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2, "new_2026_format": True},
    {"level": "S3", "subject": "AMath", "monthly_fee": 397.85, "course_fee": 340, "material_fee": 25, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "S3", "subject": "Chemistry", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S3", "subject": "Physics", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S3", "subject": "Biology", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "S4", "subject": "EMath", "monthly_fee": 408.75, "course_fee": 350, "material_fee": 25, "sessions_per_week": 2, "hours_per_session": 1.5, "existing_students_old_format": True},
    {"level": "S4", "subject": "AMath", "monthly_fee": 408.75, "course_fee": 350, "material_fee": 25, "sessions_per_week": 2, "hours_per_session": 1.5},
    {"level": "S4", "subject": "Chemistry", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S4", "subject": "Physics", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "S4", "subject": "Biology", "monthly_fee": 343.35, "course_fee": 290, "material_fee": 25, "sessions_per_week": 1, "hours_per_session": 2},
    
    # Junior College
    {"level": "J1", "subject": "Math", "monthly_fee": 401.12, "course_fee": 340, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2, "new_2026_format": True},
    {"level": "J1", "subject": "Chemistry", "monthly_fee": 401.12, "course_fee": 340, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J1", "subject": "Physics", "monthly_fee": 401.12, "course_fee": 340, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J1", "subject": "Biology", "monthly_fee": 401.12, "course_fee": 340, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J1", "subject": "Economics", "monthly_fee": 401.12, "course_fee": 340, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    
    {"level": "J2", "subject": "Math", "monthly_fee": 444.72, "course_fee": 380, "material_fee": 28, "sessions_per_week": 2, "hours_per_session": 1.5, "existing_students_old_format": True},
    {"level": "J2", "subject": "Chemistry", "monthly_fee": 412.02, "course_fee": 350, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J2", "subject": "Physics", "monthly_fee": 412.02, "course_fee": 350, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J2", "subject": "Biology", "monthly_fee": 412.02, "course_fee": 350, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
    {"level": "J2", "subject": "Economics", "monthly_fee": 412.02, "course_fee": 350, "material_fee": 28, "sessions_per_week": 1, "hours_per_session": 2},
]

print("\n💰 Uploading pricing data...")
pricing_ref = db.collection('pricing')
for price in pricing_data:
    doc_id = f"{price['level']}_{price['subject']}".lower().replace(" ", "_")
    pricing_ref.document(doc_id).set(price)
    print(f"  ✅ Added: {price['level']} {price['subject']} - ${price['monthly_fee']}")

print(f"✅ Pricing data uploaded: {len(pricing_data)} entries")

print("\n✅ Firebase data upload complete!")
print(f"📊 Summary:")
print(f"   - Calendar events: {len(calendar_data)}")
print(f"   - Pricing entries: {len(pricing_data)}")
print(f"   - Tutors: Will be uploaded separately (700+ records)")
