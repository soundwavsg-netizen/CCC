#!/usr/bin/env python3
"""
Create Admin User for Project 62 Shop System Testing
"""

import os
import sys
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from datetime import datetime

load_dotenv()

# Initialize Firebase
try:
    firebase_cred_path = "/app/backend/project62_assets/project62-firebase-credentials.json"
    if not os.path.exists(firebase_cred_path):
        raise Exception(f"Firebase credentials not found at {firebase_cred_path}")
    
    try:
        project62_app = firebase_admin.get_app("project62_admin")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, name="project62_admin")
    
    db = firestore.client(app=project62_app)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    sys.exit(1)

def create_admin_user():
    """Create admin user for testing"""
    admin_email = "admin@project62.com"
    admin_password = "admin123"
    admin_name = "Admin User"
    
    try:
        # Check if user already exists
        try:
            existing_user = firebase_auth.get_user_by_email(admin_email, app=project62_app)
            print(f"✅ Admin user already exists: {existing_user.uid}")
            # Update the password to ensure it's correct
            firebase_auth.update_user(
                existing_user.uid,
                password=admin_password,
                app=project62_app
            )
            print(f"✅ Admin password updated")
            firebase_uid = existing_user.uid
        except firebase_auth.UserNotFoundError:
            # Create Firebase user
            user = firebase_auth.create_user(
                email=admin_email,
                password=admin_password,
                display_name=admin_name,
                app=project62_app
            )
            print(f"✅ Admin user created in Firebase: {user.uid}")
            firebase_uid = user.uid
        
        # Create/update customer record in Firestore with admin role
        customer_id = admin_email.replace("@", "_at_").replace(".", "_")
        customer_data = {
            "customer_id": customer_id,
            "firebase_uid": firebase_uid,
            "email": admin_email,
            "name": admin_name,
            "role": "admin",  # This is the key field for admin access
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_ref.set(customer_data)
        
        print(f"✅ Admin customer record created/updated in Firestore")
        print(f"   Email: {admin_email}")
        print(f"   Role: admin")
        print(f"   Customer ID: {customer_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔧 Creating Admin User for Project 62 Shop System Testing")
    print("="*60)
    
    success = create_admin_user()
    
    if success:
        print("\n✅ Admin user setup complete!")
        print("   Email: admin@project62.com")
        print("   Password: admin123")
        print("   Role: admin")
    else:
        print("\n❌ Admin user setup failed!")
        sys.exit(1)