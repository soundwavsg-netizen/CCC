#!/usr/bin/env python3
"""List ALL deliveries in the system"""

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

print(f"\n📦 Listing ALL deliveries in system")
print("=" * 120)

# Get ALL deliveries
deliveries_ref = db.collection("project62").document("deliveries").collection("all")
all_deliveries = list(deliveries_ref.stream())

print(f"\nTotal deliveries found: {len(all_deliveries)}")
print("=" * 120)

for idx, doc in enumerate(all_deliveries, 1):
    delivery_data = doc.to_dict()
    delivery_id = doc.id
    
    print(f"\n{idx}. Delivery ID: {delivery_id}")
    print(f"   Customer Email: {delivery_data.get('customer_email', 'N/A')}")
    print(f"   Customer Name: {delivery_data.get('customer_name', 'N/A')}")
    print(f"   Week: {delivery_data.get('week_number', 'N/A')}")
    print(f"   Date: {delivery_data.get('delivery_date', 'N/A')}")
    print(f"   Address: {delivery_data.get('delivery_address', 'N/A')[:50]}...")
    print(f"   Subscription ID: {delivery_data.get('subscription_id', 'N/A')[:20]}...")
    print(f"   Status: {delivery_data.get('status', 'N/A')}")

# Check for duplicates by subscription_id and week
print(f"\n\n📊 Checking for duplicates...")
print("=" * 120)

from collections import defaultdict
by_sub_and_week = defaultdict(list)

for doc in all_deliveries:
    delivery_data = doc.to_dict()
    sub_id = delivery_data.get('subscription_id', 'unknown')
    week = delivery_data.get('week_number', 'unknown')
    key = f"{sub_id}_{week}"
    by_sub_and_week[key].append(doc.id)

duplicates_found = False
for key, ids in by_sub_and_week.items():
    if len(ids) > 1:
        duplicates_found = True
        print(f"\n⚠️ DUPLICATE: {key}")
        print(f"   IDs: {ids}")

if not duplicates_found:
    print("\n✅ No duplicates found")
