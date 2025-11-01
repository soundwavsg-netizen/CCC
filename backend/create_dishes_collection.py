"""
Create Dishes Collection Structure for Project 62
Placeholder for future dish selection feature
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
        project62_app = firebase_admin.get_app("project62_dishes")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, name="project62_dishes")
    
    db = firestore.client(app=project62_app)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    sys.exit(1)

def create_sample_dishes():
    """Create sample dishes for menu structure"""
    print("\n🥗 Creating Sample Dishes...\n")
    
    dishes = [
        {
            "dish_name": "Grilled Salmon with Broccoli",
            "calories": 450,
            "week_assigned": 1,
            "description": "Omega-rich salmon with steamed broccoli and lemon butter",
            "is_available": True
        },
        {
            "dish_name": "Chicken Breast with Sweet Potato",
            "calories": 520,
            "week_assigned": 1,
            "description": "Lean protein with roasted sweet potato and mixed vegetables",
            "is_available": True
        },
        {
            "dish_name": "Turkey Meatballs with Quinoa",
            "calories": 480,
            "week_assigned": 2,
            "description": "Herb turkey meatballs with quinoa and tomato sauce",
            "is_available": True
        }
    ]
    
    created_count = 0
    for dish in dishes:
        try:
            dish_id = str(uuid.uuid4())
            
            dish_data = {
                "dish_id": dish_id,
                "dish_name": dish["dish_name"],
                "image_url": None,  # To be uploaded later
                "calories": dish["calories"],
                "week_assigned": dish["week_assigned"],
                "is_available": dish["is_available"],
                "description": dish["description"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db.collection("project62").document("dishes").collection("all").document(dish_id).set(dish_data)
            
            print(f"  ✅ {dish['dish_name']}")
            print(f"     Calories: {dish['calories']}")
            print(f"     Week: {dish['week_assigned']}\n")
            
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating dish {dish['dish_name']}: {e}\n")
    
    print(f"✅ {created_count}/{len(dishes)} sample dishes created\n")
    
    return created_count

def main():
    """Main function"""
    print("\n" + "="*70)
    print("🥗 CREATING DISHES COLLECTION (PLACEHOLDER)")
    print("="*70 + "\n")
    
    # Create sample dishes
    dish_count = create_sample_dishes()
    
    # Summary
    print("="*70)
    print("📋 DISHES COLLECTION READY")
    print("="*70)
    print(f"✅ {dish_count} sample dishes created")
    print("\n💡 STRUCTURE:")
    print("   - dish_name: String")
    print("   - image_url: String (null for now)")
    print("   - calories: Number")
    print("   - week_assigned: Number")
    print("   - is_available: Boolean")
    print("   - description: String")
    print("\n⚠️  NEXT STEPS:")
    print("1. Admin can manage dishes via dashboard (future)")
    print("2. Upload dish images")
    print("3. Customers select dishes before cutoff (Phase 3)")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
