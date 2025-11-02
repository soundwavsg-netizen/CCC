#!/usr/bin/env python3
"""
Create or update admin user: admin@project62.com
"""
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

load_dotenv()

# Initialize Firebase
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
try:
    project62_app = firebase_admin.get_app("project62_admin_correct")
except ValueError:
    cred = credentials.Certificate(firebase_cred_path)
    project62_app = firebase_admin.initialize_app(cred, {
        'storageBucket': 'project62-ccc-digital.firebasestorage.app'
    }, name="project62_admin_correct")

db = firestore.client(app=project62_app)

# Admin details
ADMIN_EMAIL = "admin@project62.com"
ADMIN_PASSWORD = "Admin@2025!"  # Strong password
ADMIN_NAME = "Project 62 Admin"
ADMIN_PHONE = "+65 9000 0000"

print(f"Creating/updating admin user: {ADMIN_EMAIL}...")

try:
    # Create or get Firebase user
    try:
        user = firebase_auth.create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_NAME,
            app=project62_app
        )
        print(f"✅ Firebase user created: {user.uid}")
    except firebase_auth.EmailAlreadyExistsError:
        print(f"⚠️  User already exists, updating password...")
        user = firebase_auth.get_user_by_email(ADMIN_EMAIL, app=project62_app)
        firebase_auth.update_user(
            user.uid,
            password=ADMIN_PASSWORD,
            app=project62_app
        )
        print(f"✅ Password updated for: {user.uid}")
    
    # Create/update customer record in Firestore with admin role
    customer_id = ADMIN_EMAIL.replace("@", "_at_").replace(".", "_")
    customer_data = {
        "customer_id": customer_id,
        "firebase_uid": user.uid,
        "email": ADMIN_EMAIL,
        "name": ADMIN_NAME,
        "phone": ADMIN_PHONE,
        "role": "admin",  # Admin role
        "created_at": firestore.SERVER_TIMESTAMP,
        # Initialize loyalty fields
        "total_weeks_subscribed": 0,
        "loyalty_tier": "Bronze",
        "loyalty_discount": 0,
        "free_delivery": False,
        "priority_dish": False
    }
    
    db.collection("project62").document("customers").collection("all").document(customer_id).set(customer_data, merge=True)
    print(f"✅ Admin user saved to Firestore with role: admin")
    
    print("\n" + "="*60)
    print("ADMIN USER READY!")
    print("="*60)
    print(f"Email: {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print(f"Role: admin")
    print("="*60)
    print("\nYou can now login at: /project62/login")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
