#!/usr/bin/env python3
import os, sys
sys.path.insert(0, '/app/backend')
from firebase_admin import credentials, firestore
import firebase_admin

firebase_cred_path = "/app/backend/project62_assets/project62-firebase-credentials.json"
try:
    project62_app = firebase_admin.get_app("project62")
except ValueError:
    cred = credentials.Certificate(firebase_cred_path)
    project62_app = firebase_admin.initialize_app(cred, {'storageBucket': 'project62-ccc-digital.firebasestorage.app'}, name="project62")

db = firestore.client(app=project62_app)

# Delete the 6 old deliveries with order IDs as delivery IDs
old_delivery_ids = [
    "aad22da0-15dd-4998-8504-fe7f78a7c9a4_week_1",
    "aad22da0-15dd-4998-8504-fe7f78a7c9a4_week_2",
    "aad22da0-15dd-4998-8504-fe7f78a7c9a4_week_3",
    "f3785679-5000-47c1-b95e-87be78b712f0_week_1",
    "f3785679-5000-47c1-b95e-87be78b712f0_week_2",
    "f3785679-5000-47c1-b95e-87be78b712f0_week_3"
]

print(f"\n🗑️ Deleting {len(old_delivery_ids)} old deliveries...")
deliveries_ref = db.collection("project62").document("deliveries").collection("all")

for delivery_id in old_delivery_ids:
    print(f"   Deleting: {delivery_id}")
    deliveries_ref.document(delivery_id).delete()

print(f"\n✅ Deleted {len(old_delivery_ids)} old deliveries")
