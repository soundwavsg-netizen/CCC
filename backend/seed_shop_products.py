"""
Seed Initial Categories and Products for Project 62 Shop
This script creates:
- Initial product categories
- 4 flagship products (6-Day Starter, 6-Week Transformation, Custom Plan, Meal Prep)
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
        project62_app = firebase_admin.get_app("project62_seed")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, name="project62_seed")
    
    db = firestore.client(app=project62_app)
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    sys.exit(1)

def create_categories():
    """Create initial product categories"""
    print("\n📁 Creating Categories...")
    
    categories = [
        {"name": "Digital Guides", "slug": "digital-guides"},
        {"name": "Meal Plans", "slug": "meal-plans"},
        {"name": "Subscriptions", "slug": "subscriptions"},
        {"name": "Physical Products", "slug": "physical-products"}
    ]
    
    for cat in categories:
        try:
            category_id = str(uuid.uuid4())
            category_data = {
                "category_id": category_id,
                "name": cat["name"],
                "slug": cat["slug"],
                "created_at": datetime.utcnow().isoformat()
            }
            
            db.collection("project62").document("categories").collection("all").document(category_id).set(category_data)
            print(f"  ✅ {cat['name']} (slug: {cat['slug']})")
        except Exception as e:
            print(f"  ❌ Error creating category {cat['name']}: {e}")
    
    print(f"\n✅ {len(categories)} categories created\n")

def seed_flagship_products():
    """Create 4 flagship products"""
    print("📦 Creating Flagship Products...\n")
    
    # Note: Replace these with actual Stripe price IDs after running create_stripe_test_products.py
    # For now, using placeholders
    
    products = [
        {
            "name": "6-Day Starter Guide",
            "description": "Free 6-day meal plan introducing the 60-20-20 framework. Perfect for beginners to understand sustainable eating patterns.",
            "price": 0.00,
            "type": "digital",
            "category": "Digital Guides",
            "tags": ["free", "beginner", "meal-plan", "starter"],
            "is_featured": True,
            "featured_order": 1,
            "visibility": "public",
            "stripe_product_id": None,  # Will be added manually after Stripe creation
            "inventory": None,
            "image_url": None,
            "delivery_charge": 0.00
        },
        {
            "name": "6-Week Transformation Plan",
            "description": "Comprehensive 6-week program with detailed meal plans, workout guides, and weekly check-ins. Transform your body and habits.",
            "price": 14.90,
            "type": "digital",
            "category": "Digital Guides",
            "tags": ["transformation", "6-weeks", "complete-program", "workout"],
            "is_featured": True,
            "featured_order": 2,
            "visibility": "public",
            "stripe_product_id": None,
            "inventory": None,
            "image_url": None,
            "delivery_charge": 0.00
        },
        {
            "name": "Custom Plan with Ian",
            "description": "Personalized 1-on-1 consultation with Ian. Get a custom meal and fitness plan tailored to your goals, lifestyle, and preferences.",
            "price": 29.90,
            "type": "digital",
            "category": "Digital Guides",
            "tags": ["custom", "personalized", "1-on-1", "consultation"],
            "is_featured": True,
            "featured_order": 3,
            "visibility": "public",
            "stripe_product_id": None,
            "inventory": None,
            "image_url": None,
            "delivery_charge": 0.00
        },
        {
            "name": "Meal Prep Subscription",
            "description": "Fresh, prepared meals delivered to your door 6 days a week. Choose 1 or 2 meals per day. Plans from 1 week to 6 weeks.",
            "price": 10.00,  # Base price per meal (actual price calculated dynamically)
            "type": "subscription",
            "category": "Subscriptions",
            "tags": ["meal-prep", "delivery", "subscription", "fresh-meals"],
            "is_featured": True,
            "featured_order": 4,
            "visibility": "public",
            "stripe_product_id": None,
            "inventory": None,
            "image_url": None,
            "delivery_charge": 20.00  # Per week
        }
    ]
    
    created_count = 0
    for product in products:
        try:
            product_id = str(uuid.uuid4())
            product_slug = product["name"].lower().replace(" ", "-").replace("'", "").replace(",", "")
            
            product_data = {
                "product_id": product_id,
                "product_id_slug": product_slug,
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "type": product["type"],
                "category": product["category"],
                "tags": product["tags"],
                "is_featured": product["is_featured"],
                "featured_order": product["featured_order"],
                "visibility": product["visibility"],
                "stripe_product_id": product["stripe_product_id"],
                "inventory": product["inventory"],
                "image_url": product["image_url"],
                "delivery_charge": product["delivery_charge"],
                "file_url": None,  # Will be uploaded later via admin dashboard
                "images": [],
                "active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db.collection("project62").document("products").collection("all").document(product_id).set(product_data)
            
            print(f"  ✅ {product['name']}")
            print(f"     Type: {product['type']} | Price: ${product['price']}")
            print(f"     Featured: {product['is_featured']} (Order: {product['featured_order']})")
            print(f"     Category: {product['category']}\n")
            
            created_count += 1
        except Exception as e:
            print(f"  ❌ Error creating product {product['name']}: {e}\n")
    
    print(f"✅ {created_count}/{len(products)} flagship products created\n")
    
    return created_count

def main():
    """Main seeding function"""
    print("\n" + "="*70)
    print("🌱 SEEDING PROJECT 62 SHOP - CATEGORIES & PRODUCTS")
    print("="*70 + "\n")
    
    # Create categories
    create_categories()
    
    # Create products
    product_count = seed_flagship_products()
    
    # Summary
    print("="*70)
    print("📋 SEEDING COMPLETE")
    print("="*70)
    print(f"✅ 4 categories created")
    print(f"✅ {product_count} flagship products created")
    print("\n⚠️  NEXT STEPS:")
    print("1. Run: python create_stripe_test_products.py")
    print("2. Update products with Stripe price IDs via Admin Dashboard")
    print("3. Upload product images via Admin Dashboard")
    print("4. Upload PDFs for digital products via Admin Dashboard")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
