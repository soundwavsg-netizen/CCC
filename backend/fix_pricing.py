#!/usr/bin/env python3
"""Fix pricing for 2 meals/day subscription"""

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

print(f"\n🔧 Fixing pricing for 2 meals/day subscription")
print("=" * 80)

# Get all subscriptions
subscriptions_ref = db.collection("project62").document("subscriptions").collection("active")
subscriptions_query = subscriptions_ref.where("customer_email", "==", test_email).stream()

for sub_doc in subscriptions_query:
    sub_data = sub_doc.to_dict()
    sub_id = sub_doc.id
    meals_per_day = sub_data.get("meals_per_day", 0)
    current_price = sub_data.get("price_per_meal", 0)
    
    # 2 meals/day should be $12, 1 meal/day should be $14
    correct_price = 12.0 if meals_per_day == 2 else 14.0
    
    if current_price != correct_price:
        print(f"\n✏️ Updating subscription: {sub_id}")
        print(f"   Meals/Day: {meals_per_day}")
        print(f"   Current Price: ${current_price}")
        print(f"   Correct Price: ${correct_price}")
        
        subscriptions_ref.document(sub_id).update({
            "price_per_meal": correct_price
        })
        print(f"   ✅ Updated to ${correct_price}")
    else:
        print(f"\n✅ Subscription {sub_id} already has correct pricing (${correct_price})")

print(f"\n✅ PRICING FIX COMPLETE!")
