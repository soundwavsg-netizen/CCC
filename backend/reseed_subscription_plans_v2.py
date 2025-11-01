"""
Re-seed Meal-Prep Subscription Plans with Correct Pricing Tier Structure
Creates plans with volume-based pricing (more weeks = cheaper per meal)
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
        project62_app = firebase_admin.get_app("project62_seed_subs_v2")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, name="project62_seed_subs_v2")
    
    db = firestore.client(app=project62_app)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    sys.exit(1)

def clear_existing_plans():
    """Delete all existing subscription plans"""
    print("\n🗑️  Clearing existing plans...\n")
    try:
        subscriptions_ref = db.collection("project62").document("subscriptions_config").collection("all")
        docs = subscriptions_ref.stream()
        count = 0
        for doc in docs:
            doc.reference.delete()
            count += 1
        print(f"✅ Deleted {count} existing plans\n")
    except Exception as e:
        print(f"⚠️  Error clearing plans: {e}\n")

def seed_subscription_plans():
    """Create default meal-prep subscription plans with tiered pricing"""
    print("🍱 Creating Subscription Plans with Volume Pricing...\n")
    
    plans = [
        {
            "plan_name": "1 Meal/Day Plan",
            "meals_per_day": 1,
            "pricing_tiers": [
                {"weeks": 1, "price_per_meal": 15.00},
                {"weeks": 2, "price_per_meal": 14.00},
                {"weeks": 3, "price_per_meal": 13.00},
                {"weeks": 4, "price_per_meal": 12.00},
                {"weeks": 6, "price_per_meal": 10.00}
            ],
            "delivery_fee": 20.00,
            "description": "One prepared meal delivered daily, 6 days a week. Perfect for lunch or dinner. Save more with longer commitments!",
            "is_active": True,
            "stripe_plan_id": None,
            "image_url": None,
            "auto_renew_enabled": False
        },
        {
            "plan_name": "2 Meals/Day Plan",
            "meals_per_day": 2,
            "pricing_tiers": [
                {"weeks": 1, "price_per_meal": 13.00},
                {"weeks": 2, "price_per_meal": 12.00},
                {"weeks": 3, "price_per_meal": 11.00},
                {"weeks": 4, "price_per_meal": 10.00},
                {"weeks": 6, "price_per_meal": 9.00}
            ],
            "delivery_fee": 20.00,
            "description": "Two meals per day (lunch + dinner), 6 days a week. Best value for complete meal coverage. Bigger savings with longer plans!",
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
                "meals_per_day": plan["meals_per_day"],
                "pricing_tiers": plan["pricing_tiers"],
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
            print(f"     Meals/Day: {plan['meals_per_day']}")
            print(f"     Pricing Tiers:")
            for tier in plan['pricing_tiers']:
                print(f"       - {tier['weeks']} week(s): ${tier['price_per_meal']}/meal")
            print(f"     Delivery: ${plan['delivery_fee']}/week")
            print(f"     Active: {plan['is_active']}\n")
            
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating plan {plan['plan_name']}: {e}\n")
    
    print(f"✅ {created_count}/{len(plans)} subscription plans created\n")
    
    return created_count

def main():
    """Main seeding function"""
    print("\n" + "="*70)
    print("🌱 RE-SEEDING PROJECT 62 SUBSCRIPTION PLANS (V2)")
    print("="*70 + "\n")
    
    # Clear old plans
    clear_existing_plans()
    
    # Create new plans with correct structure
    plan_count = seed_subscription_plans()
    
    # Summary
    print("="*70)
    print("📋 RE-SEEDING COMPLETE")
    print("="*70)
    print(f"✅ {plan_count} subscription plans created with volume pricing")
    print("\n💡 PRICING STRUCTURE:")
    print("   - Longer commitments = Lower price per meal")
    print("   - Example: 1 week = $15/meal, 6 weeks = $10/meal")
    print("\n⚠️  NEXT STEPS:")
    print("1. Login to Admin Dashboard → Subscriptions tab")
    print("2. Review plans and pricing tiers")
    print("3. Upload plan images (optional)")
    print("4. Landing page will show dynamic pricing based on weeks selected")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
