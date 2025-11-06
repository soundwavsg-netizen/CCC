#!/usr/bin/env python3
"""Recalculate loyalty points based on meals per day"""

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
customer_id = test_email.replace("@", "_at_").replace(".", "_")

print(f"\n🔧 Recalculating loyalty points for: {test_email}")
print("=" * 80)
print("\nPoints System:")
print("  • 1 meal/day = 1 point per week")
print("  • 2 meals/day = 2 points per week")
print("=" * 80)

# Get all subscriptions
subscriptions_ref = db.collection("project62").document("subscriptions").collection("active")
subscriptions_query = subscriptions_ref.where("customer_email", "==", test_email).stream()

total_points = 0
subscriptions = []

for sub_doc in subscriptions_query:
    sub_data = sub_doc.to_dict()
    sub_id = sub_doc.id
    
    weeks = sub_data.get("duration_weeks", 0)
    meals_per_day = sub_data.get("meals_per_day", 1)
    
    # Calculate points: weeks × meals_per_day
    points = weeks * meals_per_day
    total_points += points
    
    subscriptions.append({
        "id": sub_id,
        "weeks": weeks,
        "meals_per_day": meals_per_day,
        "points": points
    })
    
    print(f"\n✅ Subscription {sub_id[:20]}...")
    print(f"   Weeks: {weeks}")
    print(f"   Meals/Day: {meals_per_day}")
    print(f"   Points: {weeks} weeks × {meals_per_day} meals/day = {points} points")
    
    # Update subscription with points
    subscriptions_ref.document(sub_id).update({
        "loyalty_points": points
    })

print(f"\n{'='*80}")
print(f"📊 TOTAL LOYALTY POINTS: {total_points}")
print(f"{'='*80}")

# Determine tier based on points
if total_points >= 24:
    tier = "Platinum"
    tier_emoji = "💎"
elif total_points >= 12:
    tier = "Gold"
    tier_emoji = "🥇"
elif total_points >= 6:
    tier = "Silver"
    tier_emoji = "🥈"
else:
    tier = "Bronze"
    tier_emoji = "🥉"

print(f"\n{tier_emoji} Loyalty Tier: {tier}")
print(f"   Bronze:   0-5 points")
print(f"   Silver:   6-11 points")
print(f"   Gold:     12-23 points (✓ Flexible delivery)")
print(f"   Platinum: 24+ points (✓ Flexible delivery)")

# Update customer record
customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
customer_ref.update({
    "loyalty_points": total_points,
    "loyalty_tier": tier,
    "total_weeks_subscribed": sum([s["weeks"] for s in subscriptions])
})

print(f"\n✅ Customer record updated with {total_points} points")
print(f"✅ RECALCULATION COMPLETE!")
