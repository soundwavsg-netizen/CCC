#!/usr/bin/env python3
"""Delete old deliveries without customer names"""

import os
import sys
sys.path.insert(0, '/app/backend')

from firebase_admin import credentials, firestore
import firebase_admin

# Initialize Firebase
firebase_cred_path = "/app/backend/project62_assets/project62-firebase-credentials.json"
try:
    project62_app = firebase_admin.get_app("project62")
except ValueError:
    cred = credentials.Certificate(firebase_cred_path)
    project62_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'project62-ccc-digital.firebasestorage.app'
    }, name="project62")

db = firestore.client(app=project62_app)

test_email = "project62sg@gmail.com"

print(f"\n🗑️ Deleting old deliveries without customer names for: {test_email}")
print("=" * 80)

# Get all deliveries for this customer
deliveries_ref = db.collection("project62").document("deliveries").collection("all")
deliveries_query = deliveries_ref.where("customer_email", "==", test_email).stream()

deliveries_to_delete = []
deliveries_to_keep = []

for doc in deliveries_query:
    delivery_data = doc.to_dict()
    delivery_id = doc.id
    customer_name = delivery_data.get("customer_name")
    
    # If customer_name is missing or empty, mark for deletion
    if not customer_name or customer_name == "N/A":
        deliveries_to_delete.append({
            "id": delivery_id,
            "data": delivery_data
        })
    else:
        deliveries_to_keep.append({
            "id": delivery_id,
            "data": delivery_data
        })

print(f"\n📊 Found {len(deliveries_to_keep)} deliveries to KEEP (with customer names)")
print(f"📊 Found {len(deliveries_to_delete)} deliveries to DELETE (without customer names)")

if deliveries_to_delete:
    print(f"\n🗑️ Deleting {len(deliveries_to_delete)} old deliveries...")
    for delivery in deliveries_to_delete:
        print(f"   Deleting: {delivery['id']} (Week {delivery['data'].get('week_number', 'N/A')})")
        deliveries_ref.document(delivery['id']).delete()
    print(f"   ✅ Deleted {len(deliveries_to_delete)} old deliveries")
else:
    print(f"\n✅ No deliveries to delete")

print(f"\n📊 Final count: {len(deliveries_to_keep)} deliveries remaining")
print(f"\n✅ CLEANUP COMPLETE!")
