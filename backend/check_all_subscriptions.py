#!/usr/bin/env python3
"""Check ALL subscriptions for a customer in all possible locations"""

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

print(f"\n🔍 Checking ALL subscriptions for: {test_email}")
print("=" * 80)

# Check in subscriptions/active
print("\n1️⃣ Checking: subscriptions/active collection")
subs_active = db.collection("project62").document("subscriptions").collection("active")
for doc in subs_active.stream():
    data = doc.to_dict()
    if data.get("customer_email") == test_email:
        print(f"   ✅ Found: {doc.id}")
        print(f"      Duration: {data.get('duration_weeks')} weeks")
        print(f"      Order ID: {data.get('order_id')}")
        print(f"      Created: {data.get('created_at')}")

# Check for any subscription document with customer email
print("\n2️⃣ Checking: ALL subscription documents")
all_subs = list(subs_active.stream())
print(f"   Total subscriptions in active: {len(all_subs)}")
matching = [s for s in all_subs if s.to_dict().get("customer_email") == test_email]
print(f"   Matching customer email: {len(matching)}")

# Check customer document
print("\n3️⃣ Checking: customer document")
customer_id = test_email.replace("@", "_at_").replace(".", "_")
customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
customer_doc = customer_ref.get()
if customer_doc.exists:
    customer_data = customer_doc.to_dict()
    print(f"   ✅ Customer exists")
    print(f"      Total weeks: {customer_data.get('total_weeks_subscribed')}")
    print(f"      Orders: {customer_data.get('orders')}")
else:
    print(f"   ❌ Customer not found")

# Check deliveries
print("\n4️⃣ Checking: deliveries")
deliveries_ref = db.collection("project62").document("deliveries").collection("all")
deliveries_query = deliveries_ref.where("customer_email", "==", test_email).stream()
deliveries = list(deliveries_query)
print(f"   Total deliveries: {len(deliveries)}")
for d in deliveries:
    data = d.to_dict()
    print(f"      - Week {data.get('week_number')}, Subscription: {data.get('subscription_id')[:8]}...")
