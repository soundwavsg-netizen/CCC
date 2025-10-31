#!/usr/bin/env python3
"""
Create all 3 digital products from the landing page
"""
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime

load_dotenv()

# Initialize Firebase
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
try:
    project62_app = firebase_admin.get_app("project62")
except ValueError:
    cred = credentials.Certificate(firebase_cred_path)
    project62_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'project62-ccc-digital.firebasestorage.app'
    }, name="project62")

db = firestore.client(app=project62_app)

print("="*70)
print("Creating Digital Products from Landing Page")
print("="*70)

# Define all 3 products
products = [
    {
        "name": "6 Days Free Plan",
        "description": "Simple meal plan + swaps. Free upon sign-up (name & email required). Complete 6-day nutrition and workout guide to kickstart your transformation journey.",
        "price": 0.00,
        "product_id_slug": "6-days-free"
    },
    {
        "name": "6 Weeks Transformation Plan",
        "description": "Full plan + grocery guide + recipes. Complete 6-week structured program with detailed meal plans, grocery lists, and simple recipes to follow.",
        "price": 14.90,
        "product_id_slug": "6-weeks-transformation"
    },
    {
        "name": "Custom Plan with Ian",
        "description": "Personalised plan + chat consultation. Work directly with Ian to create a customised nutrition and fitness plan tailored to your schedule, preferences, and goals.",
        "price": 29.90,
        "product_id_slug": "custom-plan-ian"
    }
]

try:
    for product_info in products:
        # Check if product already exists by name
        existing = db.collection("project62").document("digital_products").collection("all") \
            .where("name", "==", product_info["name"]).limit(1).stream()
        
        existing_docs = list(existing)
        
        if existing_docs:
            print(f"\n⚠️  Product already exists: {product_info['name']}")
            print(f"   Product ID: {existing_docs[0].id}")
            continue
        
        # Create new product
        product_id = str(uuid.uuid4())
        product_data = {
            "product_id": product_id,
            "product_id_slug": product_info["product_id_slug"],
            "name": product_info["name"],
            "description": product_info["description"],
            "price": product_info["price"],
            "product_type": "digital",
            "delivery_charge": 0.0,
            "stock_quantity": None,
            "file_url": None,  # Will be uploaded via admin dashboard
            "images": [],  # Can add photos via admin dashboard
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Save to Firestore
        db.collection("project62").document("digital_products").collection("all").document(product_id).set(product_data)
        
        print(f"\n✅ Created: {product_data['name']}")
        print(f"   Product ID: {product_id}")
        print(f"   Price: ${product_data['price']}")
        print(f"   Type: {product_data['product_type']}")
    
    print("\n" + "="*70)
    print("✅ All products created successfully!")
    print("="*70)
    print("\n📌 Next Steps:")
    print("1. Login to admin dashboard")
    print("2. Go to Products & Discounts")
    print("3. Upload PDFs for each product")
    print("4. Add product photos")
    print("\n🔗 Admin URL: https://fitness-nutrition-5.preview.emergentagent.com/project62/admin")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
