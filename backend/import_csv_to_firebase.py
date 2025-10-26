"""
Import complete tutor/class data from CSV to Firebase
Handles duplicate consolidation automatically
"""
import firebase_admin
from firebase_admin import credentials, firestore
import csv

try:
    db = firestore.client()
    print("🔥 Using existing Firebase connection")
except:
    cred = credentials.Certificate('/app/backend/firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase initialized")

def normalize_tutor_name(name):
    """Extract base name and title"""
    clean = name.replace("Mr ", "").replace("Ms ", "").replace("Mrs ", "").replace("Dr ", "")
    
    title = None
    if "(HOD)" in clean:
        title = "HOD"
        clean = clean.replace("(HOD)", "").strip()
    elif "(DY HOD)" in clean:
        title = "DY HOD"
        clean = clean.replace("(DY HOD)", "").strip()
    
    base_id = clean.lower().replace(".", "").replace(" ", "_")
    
    if title:
        return f"{base_id}_{title.lower().replace(' ', '_')}", name
    return base_id, name

# Clear existing data
print("\n🗑️  Clearing existing class data...")
classes_ref = db.collection('classes')
for doc in classes_ref.stream():
    doc.reference.delete()

tutors_ref = db.collection('tutors')
for doc in tutors_ref.stream():
    doc.reference.delete()

print("✅ Existing data cleared")

# Read CSV
print("\n📖 Reading CSV data...")
csv_path = '/app/backend/rmss_complete_classes.csv'

classes_data = []
with open(csv_path, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Build schedule array
        schedule = []
        if row['Day1'] and row['Time1']:
            schedule.append({"day": row['Day1'], "time": row['Time1']})
        if row['Day2'] and row['Time2']:
            schedule.append({"day": row['Day2'], "time": row['Time2']})
        
        if schedule:  # Only add if has valid schedule
            classes_data.append({
                'level': row['Level'],
                'subject': row['Subject'],
                'location': row['Location'],
                'tutor_name': row['Tutor_Name'],
                'schedule': schedule
            })

print(f"✅ Loaded {len(classes_data)} classes from CSV")

# Upload classes
print("\n📚 Uploading classes to Firebase...")
tutor_stats = {}

for i, data in enumerate(classes_data):
    tutor_id, tutor_name = normalize_tutor_name(data['tutor_name'])
    
    # Track tutor stats
    if tutor_id not in tutor_stats:
        tutor_stats[tutor_id] = {
            'name': tutor_name,
            'locations': set(),
            'subjects': set(),
            'levels': set(),
            'class_count': 0
        }
    
    tutor_stats[tutor_id]['locations'].add(data['location'])
    tutor_stats[tutor_id]['subjects'].add(data['subject'])
    tutor_stats[tutor_id]['levels'].add(data['level'])
    tutor_stats[tutor_id]['class_count'] += 1
    
    # Create class document
    class_id = f"{data['level']}_{data['subject']}_{data['location']}_{tutor_id}_{i}".lower().replace(" ", "_")
    class_doc = {
        'class_id': class_id,
        'level': data['level'],
        'subject': data['subject'],
        'location': data['location'],
        'tutor_id': tutor_id,
        'tutor_name': tutor_name,
        'schedule': data['schedule'],
        'sessions_per_week': len(data['schedule'])
    }
    
    classes_ref.document(class_id).set(class_doc)
    
    if (i + 1) % 50 == 0:
        print(f"  ✅ Uploaded {i + 1}/{len(classes_data)} classes...")

print(f"✅ All {len(classes_data)} classes uploaded!")

# Upload tutors
print("\n👨‍🏫 Uploading tutor profiles...")
for tutor_id, stats in tutor_stats.items():
    tutor_doc = {
        'tutor_id': tutor_id,
        'name': stats['name'],
        'locations': sorted(list(stats['locations'])),
        'subjects': sorted(list(stats['subjects'])),
        'levels': sorted(list(stats['levels'])),
        'total_classes': stats['class_count']
    }
    tutors_ref.document(tutor_id).set(tutor_doc)
    print(f"  ✅ {stats['name']}: {stats['class_count']} classes across {len(stats['locations'])} locations")

print(f"\n🎉 Upload complete!")
print(f"📊 Final Firebase Database:")
print(f"   - Total classes: {len(classes_data)}")
print(f"   - Unique tutors: {len(tutor_stats)}")
print(f"   - Multi-session classes: {sum(1 for d in classes_data if len(d['schedule']) > 1)}")
