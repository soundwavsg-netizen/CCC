"""
Check Eugene Tan data in Firebase
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
print("CHECKING EUGENE TAN DATA IN FIREBASE")
print("=" * 80)

# Check classes
print("\n📚 Classes taught by Eugene Tan:")
classes_ref = db.collection('classes')
eugene_classes = []

for doc in classes_ref.stream():
    cls = doc.to_dict()
    if 'eugene' in cls.get('tutor_base_name', '').lower() or 'eugene' in cls.get('tutor_name', '').lower():
        eugene_classes.append(cls)

print(f"\nFound {len(eugene_classes)} classes")

for cls in eugene_classes:
    print(f"\n- Level: {cls.get('level')}")
    print(f"  Subject: {cls.get('subject')}")
    print(f"  Location: {cls.get('location')}")
    print(f"  Tutor Name: {cls.get('tutor_name')}")
    print(f"  Tutor Base: {cls.get('tutor_base_name')}")
    print(f"  Schedule: {cls.get('schedule')}")
    print(f"  Fee: ${cls.get('monthly_fee')}")
    print(f"  Sessions/week: {cls.get('sessions_per_week')}")

print("\n" + "=" * 80)
