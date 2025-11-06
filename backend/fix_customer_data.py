#!/usr/bin/env python3
"""Fix customer subscription and order data"""

import os
import sys
sys.path.insert(0, '/app/backend')

from firebase_admin import credentials, firestore
import firebase_admin
from datetime import datetime, timedelta
import uuid

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
customer_id = test_email.replace("@", "_at_").replace(".", "_")

print(f"\n🔧 Fixing data for: {test_email}")
print("=" * 80)

# Get the two orders
orders_ref = db.collection("project62").document("orders").collection("all")
orders_query = orders_ref.where("customer_email", "==", test_email).stream()
orders = [{"id": doc.id, "data": doc.to_dict()} for doc in orders_query]
orders.sort(key=lambda x: x["data"].get("created_at", ""))

print(f"\n📦 Found {len(orders)} orders")

# Delete old incorrect subscription
print(f"\n🗑️ Deleting old subscription structure...")
old_sub_ref = db.collection("project62").document("subscriptions").collection("active").document(customer_id)
old_sub_ref.delete()
print(f"   ✅ Deleted old subscription: {customer_id}")

# Process each order and create proper subscription + deliveries
for idx, order_info in enumerate(orders, 1):
    order_id = order_info["id"]
    order_data = order_info["data"]
    
    print(f"\n{'='*80}")
    print(f"Processing Order {idx}: {order_id}")
    print(f"{'='*80}")
    
    # Extract order details
    amount = order_data.get("total_amount", 0)
    weeks = order_data.get("weeks", 3)  # Default to 3 if not set
    meals_per_day = order_data.get("meals_per_day", 1)
    customer_name = order_data.get("customer_name", "Customer")
    delivery_address = order_data.get("delivery_address", "")
    
    # Calculate weeks from amount if not set (3 weeks = $312, 6 weeks = $492 approximately)
    if not order_data.get("weeks"):
        if amount > 400:
            weeks = 6
        else:
            weeks = 3
    
    print(f"   Weeks: {weeks}, Amount: ${amount}, Meals/Day: {meals_per_day}")
    
    # Update order with missing fields
    print(f"   📝 Updating order fields...")
    orders_ref.document(order_id).update({
        "product_type": "meal_prep",
        "payment_status": "completed",
        "duration_weeks": weeks,
        "weeks": weeks,
        "frequency": "once/week",
        "stripe_session_id": order_data.get("session_id", ""),
        "amount": amount
    })
    print(f"   ✅ Order updated")
    
    # Create new subscription with unique ID
    subscription_id = str(uuid.uuid4())
    start_date = datetime.fromisoformat(order_data.get("start_date", datetime.utcnow().isoformat()))
    end_date = start_date + timedelta(weeks=weeks)
    
    # Calculate price per meal (approximately)
    price_per_meal = 14.0 if weeks == 3 else 12.0
    
    subscription_data = {
        "subscription_id": subscription_id,
        "customer_id": customer_id,
        "customer_email": test_email,
        "customer_name": customer_name,
        "plan_id": "meal_prep",
        "plan_name": f"{meals_per_day} Meal/Day Plan",
        "meals_per_day": meals_per_day,
        "duration_weeks": weeks,
        "commitment_weeks": weeks,
        "price_per_meal": price_per_meal,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "status": "active",
        "auto_renew": False,
        "delivery_address": delivery_address,
        "order_id": order_id,
        "created_at": order_data.get("created_at"),
        "payment_date": order_data.get("created_at"),
        "payment_amount": amount
    }
    
    print(f"   📝 Creating subscription {subscription_id}...")
    subscription_ref = db.collection("project62").document("subscriptions").collection("active").document(subscription_id)
    subscription_ref.set(subscription_data)
    print(f"   ✅ Subscription created: {weeks} weeks")
    
    # Create deliveries
    print(f"   📦 Creating {weeks} deliveries...")
    for week_num in range(1, weeks + 1):
        delivery_date = start_date + timedelta(weeks=week_num - 1)
        delivery_id = f"{subscription_id}_week_{week_num}"
        
        delivery_data = {
            "delivery_id": delivery_id,
            "subscription_id": subscription_id,
            "order_id": order_id,
            "customer_id": customer_id,
            "customer_email": test_email,
            "customer_name": customer_name,
            "week_number": week_num,
            "delivery_date": delivery_date.isoformat(),
            "delivery_address": delivery_address,
            "meals_per_day": meals_per_day,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.collection("project62").document("deliveries").collection("all").document(delivery_id).set(delivery_data)
        print(f"      ✅ Delivery Week {week_num} created")

# Update customer total weeks
print(f"\n📊 Updating customer total weeks...")
total_weeks = sum(o["data"].get("weeks", 3) for o in orders)
print(f"   Total weeks: {total_weeks}")

customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
customer_ref.update({
    "total_weeks_subscribed": total_weeks
})
print(f"   ✅ Customer updated")

print(f"\n✅ ALL FIXES COMPLETE!")
print(f"   - Created {len(orders)} subscriptions")
print(f"   - Total weeks: {total_weeks}")
print(f"   - Loyalty tier should now be: {'Silver' if total_weeks >= 6 else 'Bronze'}")
