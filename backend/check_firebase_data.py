#!/usr/bin/env python3
"""
Check Firebase Firestore data for Project 62
"""
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, storage

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
print("FIREBASE PROJECT: project62-ccc-digital")
print("="*70)

# Check customers
print("\n📊 CUSTOMERS:")
print("-"*70)
customers_ref = db.collection("project62").document("customers").collection("all")
customers = list(customers_ref.stream())
print(f"Total customers: {len(customers)}")
for customer in customers:
    data = customer.to_dict()
    print(f"  • {data.get('name')} ({data.get('email')}) - Role: {data.get('role', 'customer')}")

# Check leads
print("\n📊 LEADS:")
print("-"*70)
leads_ref = db.collection("project62").document("leads").collection("all")
leads = list(leads_ref.stream())
print(f"Total leads: {len(leads)}")
for lead in leads[:5]:  # Show first 5
    data = lead.to_dict()
    print(f"  • {data.get('name')} ({data.get('email')}) - Status: {data.get('status')}")

# Check digital products
print("\n📊 DIGITAL PRODUCTS:")
print("-"*70)
products_ref = db.collection("project62").document("digital_products").collection("all")
products = list(products_ref.stream())
print(f"Total products: {len(products)}")
for product in products:
    data = product.to_dict()
    print(f"  • {data.get('name')} - ${data.get('price')} - Active: {data.get('active')}")
    print(f"    PDF: {data.get('file_url', 'Not uploaded')}")

# Check discount codes
print("\n📊 DISCOUNT CODES:")
print("-"*70)
codes_ref = db.collection("project62").document("discount_codes").collection("all")
codes = list(codes_ref.stream())
print(f"Total discount codes: {len(codes)}")
for code in codes:
    data = code.to_dict()
    print(f"  • {data.get('code')} - {data.get('percentage')}% off")
    print(f"    Uses: {data.get('current_uses', 0)}/{data.get('max_uses', 'unlimited')}")
    print(f"    Active: {data.get('active')}, Expires: {data.get('expires_at', 'Never')}")

# Check Firebase Storage
print("\n📊 FIREBASE STORAGE (PDFs):")
print("-"*70)
try:
    blobs = list(bucket.list_blobs(prefix='digital_products/'))
    print(f"Total files: {len(blobs)}")
    for blob in blobs:
        print(f"  • {blob.name} ({blob.size / 1024:.2f} KB)")
except Exception as e:
    print(f"  No files found or error: {e}")

# Check orders
print("\n📊 ORDERS:")
print("-"*70)
orders_ref = db.collection("project62").document("orders").collection("all")
orders = list(orders_ref.stream())
print(f"Total orders: {len(orders)}")

# Check deliveries
print("\n📊 DELIVERIES:")
print("-"*70)
deliveries_ref = db.collection("project62").document("deliveries").collection("all")
deliveries = list(deliveries_ref.stream())
print(f"Total deliveries: {len(deliveries)}")

print("\n" + "="*70)
print("🔗 Firebase Console Link:")
print("https://console.firebase.google.com/project/project62-ccc-digital/firestore")
print("="*70)
