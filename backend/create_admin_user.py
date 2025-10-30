#!/usr/bin/env python3
"""
Create an admin user for Project 62
"""
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

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

# Admin details
ADMIN_EMAIL = "admin@project62.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "Admin User"
ADMIN_PHONE = "+65 9999 9999"

print("Creating admin user...")

try:
    # Create Firebase user
    try:
        user = firebase_auth.create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_NAME,
            app=project62_app
        )
        print(f"✅ Firebase user created: {user.uid}")
    except firebase_auth.EmailAlreadyExistsError:
        print(f"⚠️ User already exists, updating...")
        user = firebase_auth.get_user_by_email(ADMIN_EMAIL, app=project62_app)
    
    # Create/update customer record in Firestore with admin role
    customer_id = ADMIN_EMAIL.replace("@", "_at_").replace(".", "_")
    customer_data = {
        "customer_id": customer_id,
        "firebase_uid": user.uid,
        "email": ADMIN_EMAIL,
        "name": ADMIN_NAME,
        "phone": ADMIN_PHONE,
        "role": "admin",  # THIS IS THE KEY DIFFERENCE
        "created_at": firestore.SERVER_TIMESTAMP
    }
    
    db.collection("project62").document("customers").collection("all").document(customer_id).set(customer_data)
    print(f"✅ Admin user saved to Firestore with role: admin")
    
    print("\n" + "="*60)
    print("ADMIN USER CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"Email: {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print(f"Role: admin")
    print("="*60)
    
except Exception as e:
    print(f"❌ Error: {e}")
