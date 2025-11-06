#!/usr/bin/env python3
"""Test script to check subscription data in Firestore"""

import os
import sys
sys.path.insert(0, '/app/backend')

from firebase_admin import credentials, firestore
import firebase_admin

# Initialize Firebase
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "/app/backend/project62_assets/project62-firebase-credentials.json")
try:
    project62_app = firebase_admin.get_app("project62")
except ValueError:
    cred = credentials.Certificate(firebase_cred_path)
    project62_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'project62-ccc-digital.firebasestorage.app'
    }, name="project62")

db = firestore.client(app=project62_app)

# Test email - replace with actual customer email
test_email = input("Enter customer email to test: ").strip()

print(f"\n🔍 Checking subscriptions for: {test_email}")
print("=" * 60)

# Query subscriptions
subscriptions_ref = db.collection("project62").document("subscriptions").collection("active")
subscriptions_query = subscriptions_ref.where("customer_email", "==", test_email).stream()

subscriptions = []
total_weeks = 0

for sub_doc in subscriptions_query:
    sub_data = sub_doc.to_dict()
    weeks = sub_data.get("duration_weeks", 0)
    total_weeks += weeks
    subscriptions.append(sub_data)
    print(f"\n✅ Subscription {len(subscriptions)}:")
    print(f"   ID: {sub_data.get('subscription_id')}")
    print(f"   Plan: {sub_data.get('plan_name')}")
    print(f"   Duration: {weeks} weeks")
    print(f"   Meals/Day: {sub_data.get('meals_per_day')}")
    print(f"   Price/Meal: ${sub_data.get('price_per_meal')}")
    print(f"   Start Date: {sub_data.get('start_date')}")

print(f"\n📊 TOTAL SUBSCRIPTIONS: {len(subscriptions)}")
print(f"📊 TOTAL WEEKS: {total_weeks}")

# Query orders
print(f"\n🔍 Checking orders for: {test_email}")
print("=" * 60)

orders_ref = db.collection("project62").document("orders").collection("all")
orders_query = orders_ref.where("customer_email", "==", test_email).stream()

orders = []
for order_doc in orders_query:
    order_data = order_doc.to_dict()
    orders.append(order_data)
    print(f"\n📦 Order {len(orders)}:")
    print(f"   ID: {order_data.get('order_id')}")
    print(f"   Type: {order_data.get('product_type')}")
    print(f"   Amount: ${order_data.get('total_amount')}")
    print(f"   Payment Status: {order_data.get('payment_status')}")
    print(f"   Duration: {order_data.get('duration_weeks')} weeks")
    print(f"   Created: {order_data.get('created_at')}")

print(f"\n📊 TOTAL ORDERS: {len(orders)}")
