"""
Seed Default Meal-Prep Subscription Plans for Project 62
Creates 2 default plans: 1 Meal/Day and 2 Meals/Day
"""

import os
import sys
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid

load_dotenv()

# Initialize Firebase
try:
    firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if not firebase_cred_path or not os.path.exists(firebase_cred_path):
        raise Exception(f"Firebase credentials not found at {firebase_cred_path}")
    
    try:
        project62_app = firebase_admin.get_app("project62_seed_subs")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, name="project62_seed_subs")
    
    db = firestore.client(app=project62_app)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    sys.exit(1)

def seed_subscription_plans():
    """Create default meal-prep subscription plans"""
    print("\n🍱 Creating Default Subscription Plans...\n")
    
    plans = [
        {
            "plan_name": "1 Meal/Day Plan",
            "weeks_available": [1, 2, 3, 4, 6],
            "price_per_meal": 12.00,
            "delivery_fee": 20.00,
            "description": "One prepared meal delivered daily, 6 days a week. Perfect for lunch or dinner.",
            "is_active": True,
            "stripe_plan_id": None,  # To be added manually
            "image_url": None,
            "auto_renew_enabled": False
        },
        {
            "plan_name": "2 Meals/Day Plan",
            "weeks_available": [1, 2, 3, 4, 6],
            "price_per_meal": 10.00,
            "delivery_fee": 20.00,
            "description": "Two meals per day (lunch + dinner), 6 days a week. Best value for complete meal coverage.",
            "is_active": True,
            "stripe_plan_id": None,
            "image_url": None,
            "auto_renew_enabled": False
        }
    ]
    
    created_count = 0
    for plan in plans:
        try:
            subscription_id = str(uuid.uuid4())
            
            plan_data = {
                "subscription_id": subscription_id,
                "plan_name": plan["plan_name"],
                "weeks_available": plan["weeks_available"],
                "price_per_meal": plan["price_per_meal"],
                "delivery_fee": plan["delivery_fee"],
                "description": plan["description"],
                "is_active": plan["is_active"],
                "stripe_plan_id": plan["stripe_plan_id"],
                "image_url": plan["image_url"],
                "auto_renew_enabled": plan["auto_renew_enabled"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db.collection("project62").document("subscriptions_config").collection("all").document(subscription_id).set(plan_data)
            
            print(f"  ✅ {plan['plan_name']}")
            print(f"     Price: ${plan['price_per_meal']}/meal")
            print(f"     Delivery: ${plan['delivery_fee']}/week")
            print(f"     Weeks: {plan['weeks_available']}")
            print(f"     Active: {plan['is_active']}\n")
            
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating plan {plan['plan_name']}: {e}\n")
    
    print(f"✅ {created_count}/{len(plans)} subscription plans created\n")
    
    return created_count

def main():
    """Main seeding function"""
    print("\n" + "="*70)
    print("🌱 SEEDING PROJECT 62 SUBSCRIPTION PLANS")
    print("="*70 + "\n")
    
    # Create subscription plans
    plan_count = seed_subscription_plans()
    
    # Summary
    print("="*70)
    print("📋 SEEDING COMPLETE")
    print("="*70)
    print(f"✅ {plan_count} subscription plans created")
    print("\n⚠️  NEXT STEPS:")
    print("1. Login to Admin Dashboard → Subscriptions tab")
    print("2. Review and edit plans as needed")
    print("3. Upload plan images (optional)")
    print("4. Add Stripe plan IDs if using recurring billing")
    print("5. Landing page will automatically load active plans")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
