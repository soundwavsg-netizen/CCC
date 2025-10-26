"""
Upload all tutor and class data to Firebase
Correctly handles multi-session classes (2 schedules per week for Math)
"""
import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict

# Initialize Firebase (reuse existing app)
try:
    db = firestore.client()
    print("🔥 Using existing Firebase connection")
except:
    cred = credentials.Certificate('/app/backend/firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase initialized")

# Helper to create tutor_id from name
def create_tutor_id(name):
    return name.lower().replace("mr ", "").replace("ms ", "").replace("mrs ", "").replace("dr ", "").replace(".", "").replace(" ", "_")

# Track unique tutors
unique_tutors = {}

# Sample comprehensive tutor data (extracted from PDFs)
# Format: level, subject, location, tutor_name, schedule_list
classes_data = [
    # P6 Math - Multiple tutors at different locations
    ("P6", "Math", "Marine Parade", "Mr David Lim (DY HOD)", [{"day": "TUE", "time": "7:30pm-9:00pm"}, {"day": "FRI", "time": "7:30pm-9:00pm"}]),
    ("P6", "Math", "Marine Parade", "Mr Winston Loh", [{"day": "TUE", "time": "6:00pm-7:30pm"}, {"day": "FRI", "time": "6:00pm-7:30pm"}]),
    ("P6", "Math", "Marine Parade", "Mr Sean Yeo", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "11:00am-12:30pm"}]),
    
    ("P6", "Math", "Punggol", "Ms Lisa Tan (HOD)", [{"day": "TUE", "time": "7:30pm-9:00pm"}, {"day": "FRI", "time": "7:30pm-9:00pm"}]),
    ("P6", "Math", "Punggol", "Mr Jeremy Chong", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "9:30am-11:00am"}]),
    
    ("P6", "Math", "Jurong", "Mr Benjamin Lee", [{"day": "TUE", "time": "7:30pm-9:00pm"}, {"day": "FRI", "time": "7:30pm-9:00pm"}]),
    ("P6", "Math", "Jurong", "Mr Jason Tan", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "11:00am-12:30pm"}]),
    
    ("P6", "Math", "Bishan", "Mr Zech Zhuang", [{"day": "TUE", "time": "4:00pm-5:30pm"}, {"day": "THU", "time": "4:00pm-5:30pm"}]),
    ("P6", "Math", "Bishan", "Mr Franklin Neo", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "9:30am-11:00am"}]),
    
    ("P6", "Math", "Kovan", "Mr Eric Lim", [{"day": "TUE", "time": "7:30pm-9:00pm"}, {"day": "FRI", "time": "7:30pm-9:00pm"}]),
    
    # P6 Science - Single session per week
    ("P6", "Science", "Marine Parade", "Mr David Lim (DY HOD)", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    ("P6", "Science", "Marine Parade", "Mr Desmond Tham (HOD)", [{"day": "SUN", "time": "11:00am-1:00pm"}]),
    
    ("P6", "Science", "Punggol", "Ms Lisa Tan (HOD)", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    ("P6", "Science", "Punggol", "Mr Alex Wong", [{"day": "SUN", "time": "9:30am-11:30am"}]),
    
    ("P6", "Science", "Jurong", "Mr Benjamin Lee", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    ("P6", "Science", "Bishan", "Mr Zech Zhuang", [{"day": "SAT", "time": "2:00pm-4:00pm"}]),
    ("P6", "Science", "Kovan", "Mr Eric Lim", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    
    # P6 English
    ("P6", "English", "Marine Parade", "Ms Rachel Tan", [{"day": "SAT", "time": "2:00pm-4:00pm"}]),
    ("P6", "English", "Punggol", "Ms Jennifer Lee", [{"day": "SUN", "time": "2:00pm-4:00pm"}]),
    ("P6", "English", "Bishan", "Ms Ong L.T.", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    
    # P5 Math - 2 sessions per week
    ("P5", "Math", "Marine Parade", "Mr David Lim (DY HOD)", [{"day": "MON", "time": "7:30pm-9:00pm"}, {"day": "THU", "time": "7:30pm-9:00pm"}]),
    ("P5", "Math", "Punggol", "Ms Lisa Tan (HOD)", [{"day": "MON", "time": "7:30pm-9:00pm"}, {"day": "THU", "time": "7:30pm-9:00pm"}]),
    ("P5", "Math", "Jurong", "Ms Catherine Lim", [{"day": "MON", "time": "7:30pm-9:00pm"}, {"day": "THU", "time": "7:30pm-9:00pm"}]),
    ("P5", "Math", "Bishan", "Mr Zech Zhuang", [{"day": "MON", "time": "6:00pm-7:30pm"}, {"day": "WED", "time": "6:00pm-7:30pm"}]),
    ("P5", "Math", "Kovan", "Mr Eric Lim", [{"day": "MON", "time": "7:30pm-9:00pm"}, {"day": "THU", "time": "7:30pm-9:00pm"}]),
    
    # S3 EMath - 1 session per week (NEW 2026 format)
    ("S3", "EMath", "Marine Parade", "Mr Sean Yeo (HOD)", [{"day": "SAT", "time": "9:00am-11:00am"}]),
    ("S3", "EMath", "Marine Parade", "Mr John Lee (DY HOD)", [{"day": "SUN", "time": "9:00am-11:00am"}]),
    ("S3", "EMath", "Punggol", "Mr Ang C.X.", [{"day": "SAT", "time": "2:00pm-4:00pm"}]),
    ("S3", "EMath", "Jurong", "Mr Jason Tan", [{"day": "SUN", "time": "9:00am-11:00am"}]),
    ("S3", "EMath", "Bishan", "Mr Sean Yeo (HOD)", [{"day": "SAT", "time": "2:00pm-4:00pm"}]),
    
    # S3 AMath - 2 sessions per week
    ("S3", "AMath", "Marine Parade", "Mr Sean Yeo (HOD)", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "11:00am-12:30pm"}]),
    ("S3", "AMath", "Marine Parade", "Mr John Lee (DY HOD)", [{"day": "THU", "time": "6:30pm-8:00pm"}, {"day": "SUN", "time": "11:00am-12:30pm"}]),
    ("S3", "AMath", "Bishan", "Mr John Lee (DY HOD)", [{"day": "MON", "time": "6:30pm-8:00pm"}, {"day": "SAT", "time": "4:00pm-5:30pm"}]),
    
    # S4 EMath - 2 sessions per week (OLD format for existing students)
    ("S4", "EMath", "Marine Parade", "Ms Emily Koh", [{"day": "WED", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "2:00pm-3:30pm"}]),
    ("S4", "EMath", "Marine Parade", "Mr Sean Tan", [{"day": "THU", "time": "6:00pm-7:30pm"}, {"day": "SUN", "time": "9:00am-10:30am"}]),
    ("S4", "EMath", "Bishan", "Ms Emily Koh", [{"day": "TUE", "time": "6:00pm-7:30pm"}, {"day": "SAT", "time": "9:00am-10:30am"}]),
    
    # S3 Chemistry
    ("S3", "Chemistry", "Marine Parade", "Ms Melissa Lim (DY HOD)", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    ("S3", "Chemistry", "Jurong", "Ms Chan S.Q.", [{"day": "SUN", "time": "11:00am-1:00pm"}]),
    ("S3", "Chemistry", "Bishan", "Ms Melissa Lim (DY HOD)", [{"day": "SAT", "time": "12:00pm-2:00pm"}]),
    
    # S3 Physics
    ("S3", "Physics", "Marine Parade", "Mr Desmond Tham (HOD)", [{"day": "SUN", "time": "2:00pm-4:00pm"}]),
    ("S3", "Physics", "Bishan", "Mr Desmond Tham (HOD)", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    
    # J1 Math - 1 session per week (NEW 2026 format)
    ("J1", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", [{"day": "SUN", "time": "1:30pm-3:30pm"}]),
    ("J1", "Math", "Marine Parade", "Mr John Lee (DY HOD)", [{"day": "SAT", "time": "2:30pm-4:30pm"}]),
    ("J1", "Math", "Bishan", "Mr John Lee (DY HOD)", [{"day": "SUN", "time": "9:00am-11:00am"}]),
    ("J1", "Math", "Punggol", "Mr Ang C.X.", [{"day": "SAT", "time": "11:00am-1:00pm"}]),
    
    # J2 Math - 2 sessions per week (OLD format for existing students)
    ("J2", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", [{"day": "TUE", "time": "8:00pm-9:30pm"}, {"day": "SAT", "time": "4:30pm-6:00pm"}]),
    ("J2", "Math", "Marine Parade", "Mr John Lee (DY HOD)", [{"day": "THU", "time": "8:30pm-10:00pm"}, {"day": "SUN", "time": "3:30pm-5:00pm"}]),
    ("J2", "Math", "Bishan", "Mr Sean Yeo (HOD)", [{"day": "WED", "time": "8:30pm-10:00pm"}, {"day": "SUN", "time": "3:30pm-5:00pm"}]),
    ("J2", "Math", "Punggol", "Mr Ang C.X.", [{"day": "FRI", "time": "8:00pm-9:30pm"}, {"day": "SUN", "time": "11:30am-1:00pm"}]),
    
    # J1 Chemistry
    ("J1", "Chemistry", "Marine Parade", "Mr Leonard Teo", [{"day": "SUN", "time": "3:00pm-5:00pm"}]),
    ("J1", "Chemistry", "Jurong", "Ms Chan S.Q.", [{"day": "SAT", "time": "4:00pm-6:00pm"}]),
    ("J1", "Chemistry", "Bishan", "Mr Leonard Teo", [{"day": "SAT", "time": "4:30pm-6:30pm"}]),
    
    # J2 Economics
    ("J2", "Economics", "Marine Parade", "Mrs Cheong", [{"day": "SAT", "time": "4:30pm-6:30pm"}]),
    ("J2", "Economics", "Bishan", "Mrs Cheong", [{"day": "MON", "time": "6:00pm-8:00pm"}]),
]

print(f"\n📚 Processing {len(classes_data)} class assignments...")

# Upload classes
classes_ref = db.collection('classes')
for i, (level, subject, location, tutor_name, schedule) in enumerate(classes_data):
    tutor_id = create_tutor_id(tutor_name)
    
    # Track unique tutors
    if tutor_id not in unique_tutors:
        unique_tutors[tutor_id] = {
            "name": tutor_name,
            "locations": set(),
            "subjects": set(),
            "levels": set()
        }
    
    unique_tutors[tutor_id]["locations"].add(location)
    unique_tutors[tutor_id]["subjects"].add(subject)
    unique_tutors[tutor_id]["levels"].add(level)
    
    # Create class document
    class_id = f"{level}_{subject}_{location}_{tutor_id}_{i}".lower().replace(" ", "_")
    class_doc = {
        "class_id": class_id,
        "level": level,
        "subject": subject,
        "location": location,
        "tutor_id": tutor_id,
        "tutor_name": tutor_name,
        "schedule": schedule,
        "sessions_per_week": len(schedule)
    }
    
    classes_ref.document(class_id).set(class_doc)
    
    schedule_str = ", ".join([f"{s['day']} {s['time']}" for s in schedule])
    print(f"  ✅ {level} {subject} - {tutor_name} at {location}: {schedule_str}")

print(f"\n✅ Uploaded {len(classes_data)} class assignments")

# Upload unique tutors
print(f"\n👨‍🏫 Processing {len(unique_tutors)} unique tutors...")
tutors_ref = db.collection('tutors')
for tutor_id, data in unique_tutors.items():
    tutor_doc = {
        "tutor_id": tutor_id,
        "name": data["name"],
        "locations": list(data["locations"]),
        "subjects": list(data["subjects"]),
        "levels": list(data["levels"]),
        "total_classes": sum(1 for c in classes_data if create_tutor_id(c[3]) == tutor_id)
    }
    
    tutors_ref.document(tutor_id).set(tutor_doc)
    print(f"  ✅ {data['name']}: {tutor_doc['total_classes']} classes across {len(data['locations'])} locations")

print(f"\n✅ Upload complete!")
print(f"📊 Summary:")
print(f"   - Unique tutors: {len(unique_tutors)}")
print(f"   - Total class assignments: {len(classes_data)}")
print(f"   - Multi-session classes: {sum(1 for c in classes_data if len(c[4]) > 1)}")
