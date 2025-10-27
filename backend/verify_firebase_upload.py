"""
Verify Firebase Upload - Check Data
"""
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
try:
    db = firestore.client()
    print("🔥 Using existing Firebase connection")
except:
    cred = credentials.Certificate('/app/backend/firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase initialized")

print("\n" + "=" * 80)
print("FIREBASE DATA VERIFICATION")
print("=" * 80)

# Check classes collection
print("\n📚 Checking 'classes' collection...")
classes_ref = db.collection('classes')
classes_docs = list(classes_ref.limit(5).stream())
classes_count = len(list(classes_ref.stream()))

print(f"   Total classes in Firebase: {classes_count}")
print(f"\n   Sample class document:")
if classes_docs:
    sample = classes_docs[0].to_dict()
    print(f"   - Class ID: {sample.get('class_id')}")
    print(f"   - Level: {sample.get('level')}")
    print(f"   - Subject: {sample.get('subject')}")
    print(f"   - Location: {sample.get('location')}")
    print(f"   - Tutor: {sample.get('tutor_name')}")
    print(f"   - Schedule: {sample.get('schedule')}")
    print(f"   - Fee: ${sample.get('monthly_fee')}")

# Check tutors collection
print(f"\n👨‍🏫 Checking 'tutors' collection...")
tutors_ref = db.collection('tutors')
tutors_docs = list(tutors_ref.limit(3).stream())
tutors_count = len(list(tutors_ref.stream()))

print(f"   Total tutors in Firebase: {tutors_count}")
print(f"\n   Sample tutor profiles:")
for idx, doc in enumerate(tutors_docs, 1):
    tutor = doc.to_dict()
    print(f"   {idx}. {tutor.get('name')}")
    print(f"      - Classes: {tutor.get('total_classes')}")
    print(f"      - Locations: {', '.join(tutor.get('locations', []))}")
    print(f"      - Subjects: {', '.join(tutor.get('subjects', []))}")

print("\n" + "=" * 80)
print("✅ FIREBASE VERIFICATION COMPLETE")
print("=" * 80)
print(f"\n✨ Summary:")
print(f"   - Classes collection: {classes_count} documents")
print(f"   - Tutors collection: {tutors_count} documents")
print(f"   - Status: {'✅ READY' if classes_count > 0 and tutors_count > 0 else '❌ ERROR'}")
print("=" * 80)
