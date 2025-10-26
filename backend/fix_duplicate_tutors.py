"""
Clean up duplicate tutors in Firebase and fix tutor ID generation
Handles cases like "Sean Yeo" vs "Sean Yeo (HOD)" → Both become "Sean Yeo (HOD)"
"""
import firebase_admin
from firebase_admin import credentials, firestore

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
    Extract base name and title separately
    Returns: (base_name, title)
    Example: "Mr Sean Yeo (HOD)" → ("sean_yeo", "HOD")
    """
    # Remove prefixes
    clean = name.replace("Mr ", "").replace("Ms ", "").replace("Mrs ", "").replace("Dr ", "")
    
    # Extract title if present
    title = None
    if "(HOD)" in clean:
        title = "HOD"
        clean = clean.replace("(HOD)", "").strip()
    elif "(DY HOD)" in clean:
        title = "DY HOD"
        clean = clean.replace("(DY HOD)", "").strip()
    
    # Create base ID
    base_id = clean.lower().replace(".", "").replace(" ", "_")
    
    return base_id, title

def get_display_name(name, title):
    """Create consistent display name with title"""
    # Keep Mr/Ms/Mrs prefix
    prefix = ""
    if name.startswith("Mr "):
        prefix = "Mr "
        name = name[3:]
    elif name.startswith("Ms "):
        prefix = "Ms "
        name = name[3:]
    elif name.startswith("Mrs "):
        prefix = "Mrs "
        name = name[4:]
    elif name.startswith("Dr "):
        prefix = "Dr "
        name = name[3:]
    
    # Remove existing title
    name = name.replace("(HOD)", "").replace("(DY HOD)", "").strip()
    
    # Add title if present
    if title:
        return f"{prefix}{name} ({title})"
    return f"{prefix}{name}"

print("\n🔍 Scanning existing classes for duplicate tutors...")

# Get all classes
classes_ref = db.collection('classes')
classes = classes_ref.stream()

# Track tutor consolidation
tutor_map = {}  # base_id → {name, title, classes}

for doc in classes:
    data = doc.to_dict()
    tutor_name = data.get('tutor_name')
    
    base_id, title = normalize_tutor_name(tutor_name)
    
    if base_id not in tutor_map:
        tutor_map[base_id] = {
            'original_names': set(),
            'title': title,
            'classes': []
        }
    
    tutor_map[base_id]['original_names'].add(tutor_name)
    tutor_map[base_id]['classes'].append(doc.id)
    
    # Keep highest title
    existing_title = tutor_map[base_id]['title']
    if title == "HOD" or (title == "DY HOD" and existing_title != "HOD"):
        tutor_map[base_id]['title'] = title

print(f"\n📊 Found {len(tutor_map)} unique tutors")

# Show duplicates
print("\n🔄 Tutors with multiple name variations:")
for base_id, info in tutor_map.items():
    if len(info['original_names']) > 1:
        print(f"  → {base_id}:")
        for name in info['original_names']:
            print(f"     - {name}")
        final_title = info['title'] if info['title'] else "no title"
        print(f"     ✅ Will consolidate as: {base_id} ({final_title})")

# Update all classes with normalized tutor info
print("\n🔧 Updating classes with normalized tutor names...")
updated_count = 0

for base_id, info in tutor_map.items():
    # Get proper prefix from first original name
    sample_name = list(info['original_names'])[0]
    prefix = "Mr " if sample_name.startswith("Mr ") else \
             "Ms " if sample_name.startswith("Ms ") else \
             "Mrs " if sample_name.startswith("Mrs ") else \
             "Dr " if sample_name.startswith("Dr ") else ""
    
    # Extract clean name
    clean_name = sample_name.replace("Mr ", "").replace("Ms ", "").replace("Mrs ", "").replace("Dr ", "")
    clean_name = clean_name.replace("(HOD)", "").replace("(DY HOD)", "").strip()
    
    # Create final display name
    if info['title']:
        final_name = f"{prefix}{clean_name} ({info['title']})"
        final_id = f"{base_id}_{info['title'].lower().replace(' ', '_')}"
    else:
        final_name = f"{prefix}{clean_name}"
        final_id = base_id
    
    # Update all classes for this tutor
    for class_id in info['classes']:
        classes_ref.document(class_id).update({
            'tutor_id': final_id,
            'tutor_name': final_name
        })
        updated_count += 1

print(f"✅ Updated {updated_count} class documents")

# Rebuild tutors collection
print("\n👨‍🏫 Rebuilding tutors collection...")
tutors_ref = db.collection('tutors')

# Clear existing tutors
existing_tutors = tutors_ref.stream()
for doc in existing_tutors:
    doc.reference.delete()

# Recreate from updated classes
classes = classes_ref.stream()
tutor_stats = {}

for doc in classes:
    data = doc.to_dict()
    tutor_id = data['tutor_id']
    
    if tutor_id not in tutor_stats:
        tutor_stats[tutor_id] = {
            'name': data['tutor_name'],
            'locations': set(),
            'subjects': set(),
            'levels': set(),
            'class_count': 0
        }
    
    tutor_stats[tutor_id]['locations'].add(data['location'])
    tutor_stats[tutor_id]['subjects'].add(data['subject'])
    tutor_stats[tutor_id]['levels'].add(data['level'])
    tutor_stats[tutor_id]['class_count'] += 1

# Upload consolidated tutors
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
    print(f"  ✅ {stats['name']}: {stats['class_count']} classes")

print(f"\n✅ Consolidation complete!")
print(f"📊 Final stats:")
print(f"   - Unique tutors: {len(tutor_stats)}")
print(f"   - Total classes: {updated_count}")
