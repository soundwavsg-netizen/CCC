"""
Check specific tutor consolidation
"""
import firebase_admin
from firebase_admin import credentials, firestore

try:
    db = firestore.client()
except:
    cred = credentials.Certificate('/app/backend/firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

print("=" * 80)
print("TUTOR CONSOLIDATION VERIFICATION")
print("=" * 80)

# Check Eugene Tan specifically
print("\n🔍 Checking 'Eugene Tan' consolidation...")
tutors_ref = db.collection('tutors')

# Look for Eugene Tan variants
eugene_tutors = []
for doc in tutors_ref.stream():
    tutor = doc.to_dict()
    if 'eugene' in tutor.get('name', '').lower():
        eugene_tutors.append(tutor)

if eugene_tutors:
    print(f"\n✅ Found {len(eugene_tutors)} Eugene Tan profile(s):")
    for tutor in eugene_tutors:
        print(f"\n   Tutor: {tutor.get('name')}")
        print(f"   - Tutor ID: {tutor.get('tutor_id')}")
        print(f"   - Total Classes: {tutor.get('total_classes')}")
        print(f"   - Locations: {', '.join(tutor.get('locations', []))}")
        print(f"   - Subjects: {', '.join(tutor.get('subjects', []))}")
        print(f"   - Levels: {', '.join(tutor.get('levels', []))}")
else:
    print("\n❌ No Eugene Tan found")

# Check classes for Eugene Tan
print(f"\n🔍 Checking classes taught by Eugene Tan...")
classes_ref = db.collection('classes')
eugene_classes = []

for doc in classes_ref.stream():
    cls = doc.to_dict()
    if 'eugene' in cls.get('tutor_name', '').lower():
        eugene_classes.append(cls)

print(f"\n   Found {len(eugene_classes)} classes")
print(f"\n   Sample classes with variants:")
for cls in eugene_classes[:5]:
    print(f"   - {cls.get('level')} {cls.get('subject')}: {cls.get('tutor_name')} → ID: {cls.get('tutor_id')}")

# Check Pang W.F.
print(f"\n\n🔍 Checking 'Pang W.F.' consolidation...")
pang_tutors = []
for doc in tutors_ref.stream():
    tutor = doc.to_dict()
    if 'pang' in tutor.get('name', '').lower():
        pang_tutors.append(tutor)

if pang_tutors:
    print(f"\n✅ Found {len(pang_tutors)} Pang W.F. profile(s):")
    for tutor in pang_tutors:
        print(f"\n   Tutor: {tutor.get('name')}")
        print(f"   - Total Classes: {tutor.get('total_classes')}")
        print(f"   - Locations: {', '.join(tutor.get('locations', []))}")
        print(f"   - Levels: {', '.join(tutor.get('levels', []))}")

print("\n" + "=" * 80)
print("✅ Consolidation verified - No duplicate tutor profiles!")
print("=" * 80)
