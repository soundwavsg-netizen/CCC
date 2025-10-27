"""
Firebase Upload Script - FIXED Tutor Normalization
Consolidates tutor variants (A), (B), (C) into single profiles
"""
import firebase_admin
from firebase_admin import credentials, firestore
import csv
from collections import defaultdict

print("=" * 80)
print("FIREBASE UPLOAD - FIXED TUTOR NORMALIZATION")
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

def normalize_tutor_name(name):
    """
    Extract base tutor name and create unique tutor ID
    Removes (A), (B), (C) variants to consolidate into single tutor
    """
    # Store original name for classes
    original_name = name
    
    # Remove title prefixes
    clean = name.replace("Mr ", "").replace("Ms ", "").replace("Mrs ", "").replace("Mdm ", "").replace("Dr ", "")
    
    # Extract special titles (HOD, DY HOD) - these ARE part of identity
    title = None
    if "(HOD)" in clean:
        title = "HOD"
        clean = clean.replace("(HOD)", "").strip()
    elif "(DY HOD)" in clean:
        title = "DY_HOD"
        clean = clean.replace("(DY HOD)", "").strip()
    
    # Remove class section variants (A), (B), (C), (D), (E) - these are NOT part of identity
    clean = clean.replace("(A)", "").replace("(B)", "").replace("(C)", "").replace("(D)", "").replace("(E)", "").strip()
    clean = clean.replace("(Α)", "").replace("(Β)", "").strip()  # Greek letters too
    
    # Create base tutor name (without Mr/Ms prefix, without variants)
    if title:
        base_name = f"{clean} ({title})"
    else:
        base_name = clean
    
    # Create tutor ID
    base_id = clean.lower().replace(".", "").replace(" ", "_").replace("bin", "bin")
    if title:
        base_id = f"{base_id}_{title.lower()}"
    
    return base_id, base_name, original_name

# Read CSV data
print("\n📥 Reading CSV file...")
csv_file = '/app/tuition_COMPLETE_FINAL_ALL_LEVELS.csv'
all_classes = []

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        all_classes.append(row)

print(f"   ✅ Loaded {len(all_classes)} classes from CSV")

# Clear existing data
print("\n🗑️  Clearing existing Firebase data...")
classes_ref = db.collection('classes')
tutors_ref = db.collection('tutors')

batch_size = 100
classes_deleted = 0
for doc in classes_ref.stream():
    doc.reference.delete()
    classes_deleted += 1
    if classes_deleted % batch_size == 0:
        print(f"   Deleted {classes_deleted} class documents...")

tutors_deleted = 0
for doc in tutors_ref.stream():
    doc.reference.delete()
    tutors_deleted += 1

print(f"   ✅ Cleared {classes_deleted} classes and {tutors_deleted} tutors")

# Track tutor statistics
tutor_stats = {}
uploaded_count = 0

print("\n📚 Uploading classes to Firebase...")
print("   Progress: ", end="", flush=True)

for idx, row in enumerate(all_classes):
    level = row['Level']
    subject = row['Subject']
    location = row['Location']
    tutor_name_original = row['Tutor_Name']
    day1 = row['Day1']
    time1 = row['Time1']
    day2 = row['Day2']
    time2 = row['Time2']
    monthly_fee = float(row['Monthly_Fee'])
    sessions_per_week = int(row['Sessions_Per_Week'])
    
    # Create tutor ID (consolidated)
    tutor_id, tutor_base_name, tutor_display_name = normalize_tutor_name(tutor_name_original)
    
    # Track tutor stats (using consolidated ID)
    if tutor_id not in tutor_stats:
        tutor_stats[tutor_id] = {
            'name': tutor_base_name,
            'locations': set(),
            'subjects': set(),
            'levels': set(),
            'class_count': 0
        }
    
    tutor_stats[tutor_id]['locations'].add(location)
    tutor_stats[tutor_id]['subjects'].add(subject)
    tutor_stats[tutor_id]['levels'].add(level)
    tutor_stats[tutor_id]['class_count'] += 1
    
    # Build schedule
    schedule = [{'day': day1, 'time': time1}]
    if day2 and time2:
        schedule.append({'day': day2, 'time': time2})
    
    # Create class document (keep original variant name for display)
    class_id = f"{level}_{subject}_{location}_{tutor_id}_{idx}".lower().replace(" ", "_").replace("/", "_").replace("(", "").replace(")", "")
    
    class_doc = {
        'class_id': class_id,
        'level': level,
        'subject': subject,
        'location': location,
        'tutor_id': tutor_id,
        'tutor_name': tutor_display_name,  # Keep original with (A), (B) for reference
        'tutor_base_name': tutor_base_name,  # Consolidated name
        'schedule': schedule,
        'sessions_per_week': sessions_per_week,
        'monthly_fee': monthly_fee
    }
    
    # Upload to Firestore
    classes_ref.document(class_id).set(class_doc)
    uploaded_count += 1
    
    # Progress indicator
    if uploaded_count % 50 == 0:
        print(f"{uploaded_count}...", end="", flush=True)

print(f"\n   ✅ Uploaded {uploaded_count} classes!")

# Upload tutors (consolidated profiles)
print(f"\n👨‍🏫 Creating consolidated tutor profiles...")
tutor_count = 0
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
    tutor_count += 1
    
    if tutor_count % 10 == 0:
        print(f"   Created {tutor_count} tutor profiles...", flush=True)

print(f"   ✅ Created {tutor_count} consolidated tutor profiles!")

# Final summary
print(f"\n" + "=" * 80)
print("🎉 FIREBASE UPLOAD COMPLETE - FIXED NORMALIZATION")
print("=" * 80)
print(f"\n📊 Upload Summary:")
print(f"   • Total classes uploaded: {uploaded_count}")
print(f"   • Unique tutors (CONSOLIDATED): {tutor_count}")
print(f"   • Previous tutor count: 63")
print(f"   • Reduction: {63 - tutor_count} duplicate variants removed")

print(f"\n📋 Level Breakdown:")
for level in ['P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'J1', 'J2']:
    count = len([c for c in all_classes if c['Level'] == level])
    print(f"   {level}: {count} classes")

print(f"\n✅ Firebase collections populated:")
print(f"   • 'classes' collection: {uploaded_count} documents")
print(f"   • 'tutors' collection: {tutor_count} documents (consolidated)")

print(f"\n📝 Sample consolidated tutors:")
sample_tutors = list(tutor_stats.items())[:5]
for tutor_id, stats in sample_tutors:
    print(f"   • {stats['name']}: {stats['class_count']} classes across {len(stats['locations'])} location(s)")

print("\n🔥 Data is now live in Firebase with consolidated tutors!")
print("=" * 80)
