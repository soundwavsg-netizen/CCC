#!/usr/bin/env python3
"""Fix email verification for customers who paid but can't log in"""

import os
import sys
sys.path.insert(0, '/app/backend')

from firebase_admin import credentials, firestore, auth
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

# Get email to fix
email_to_fix = input("Enter customer email to fix: ").strip()

print(f"\n🔧 Fixing email verification for: {email_to_fix}")
print("=" * 80)

try:
    # Get Firebase Auth user
    user = auth.get_user_by_email(email_to_fix, app=project62_app)
    print(f"\n✅ Firebase Auth User Found:")
    print(f"   UID: {user.uid}")
    print(f"   Email Verified: {user.email_verified}")
    
    # Update Firebase Auth to mark email as verified if not already
    if not user.email_verified:
        auth.update_user(user.uid, email_verified=True, app=project62_app)
        print(f"   ✅ Updated Firebase Auth email_verified to True")
    else:
        print(f"   ℹ️ Firebase Auth already verified")
    
    # Get Firestore customer record
    customer_id = email_to_fix.replace("@", "_at_").replace(".", "_")
    customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
    customer_doc = customer_ref.get()
    
    if customer_doc.exists:
        customer_data = customer_doc.to_dict()
        print(f"\n✅ Firestore Customer Record Found:")
        print(f"   Name: {customer_data.get('name')}")
        print(f"   Email Verified: {customer_data.get('email_verified', False)}")
        
        # Update Firestore to mark email as verified
        customer_ref.update({"email_verified": True})
        print(f"   ✅ Updated Firestore email_verified to True")
    else:
        print(f"\n❌ Firestore customer record not found")
    
    print(f"\n✅ ALL FIXED! Customer can now log in.")
    
except auth.UserNotFoundError:
    print(f"\n❌ Firebase Auth user not found for {email_to_fix}")
    print(f"   Customer needs to sign up or create account first")
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
