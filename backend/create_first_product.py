#!/usr/bin/env python3
"""
Create the first digital product: "6 Days Free Plan"
"""
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, storage
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
bucket = storage.bucket(app=project62_app)

print("="*70)
print("Creating First Digital Product: '6 Days Free Plan'")
print("="*70)

try:
    # Create product
    product_id = str(uuid.uuid4())
    product_data = {
        "product_id": product_id,
        "name": "6 Days Free Plan",
        "description": "Complete 6-day nutrition and workout guide to kickstart your transformation journey. Includes meal plans, workout routines, and progress tracking.",
        "price": 0.00,  # Free
        "product_type": "digital",
        "delivery_charge": 0,
        "stock_quantity": None,
        "file_url": None,  # Will be uploaded separately
        "active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Save to Firestore
    db.collection("project62").document("digital_products").collection("all").document(product_id).set(product_data)
    
    print("\n✅ Product created successfully!")
    print("-"*70)
    print(f"Product ID: {product_id}")
    print(f"Name: {product_data['name']}")
    print(f"Price: ${product_data['price']}")
    print(f"Type: {product_data['product_type']}")
    print(f"Status: {'Active' if product_data['active'] else 'Inactive'}")
    print("-"*70)
    
    print("\n📤 To upload PDF file:")
    print("1. Go to admin dashboard")
    print("2. Click 'Products & Discounts' tab")
    print("3. Find '6 Days Free Plan' product")
    print("4. Click 'Choose PDF' and select your file")
    print("5. Click 'Upload'")
    
    print("\n📂 Or use this command to upload via backend:")
    print(f"   Upload file to: /digital_products/{product_id}/6-days-plan.pdf")
    
    print("\n✅ Product ready! Just needs PDF upload.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
