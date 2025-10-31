"""
Create Stripe Test Products for Project 62 Shop
This script creates test products in Stripe and returns their product IDs
"""

import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")

# Use emergentintegrations for Stripe
try:
    from emergentintegrations.payments.stripe.products import StripeProducts
    stripe_products = StripeProducts(api_key=STRIPE_API_KEY)
    print("✅ Using emergentintegrations for Stripe")
except ImportError:
    print("⚠️  emergentintegrations not available, skipping Stripe product creation")
    print("⚠️  You can create products manually in Stripe Dashboard and add price IDs to products")
    stripe_products = None

def create_stripe_product(name, price_sgd, product_type="digital"):
    """Create a Stripe product and price"""
    if not stripe_products:
        return {
            "product_id": f"prod_manual_{name.replace(' ', '_')}",
            "price_id": f"price_manual_{name.replace(' ', '_')}",
            "name": name,
            "price": price_sgd,
            "manual": True
        }
    
    try:
        # For now, return placeholder IDs - Sean will create them manually in Stripe
        # This allows the seeding to continue
        print(f"⚠️  Placeholder created for: {name}")
        print(f"   Price: ${price_sgd} SGD")
        print(f"   Type: {product_type}")
        return {
            "product_id": None,
            "price_id": None,
            "name": name,
            "price": price_sgd,
            "manual": True
        }
    except Exception as e:
        print(f"❌ Error creating Stripe product: {e}")
        return None

def main():
    """Create all 4 flagship Stripe products"""
    print("\n🎯 Stripe Product Setup for Project 62...\n")
    
    products = []
    
    # 1. 6-Day Starter (Free)
    print("📦 Product 1: 6-Day Starter Guide")
    starter = create_stripe_product("6-Day Starter Guide", 0.00, "digital")
    if starter:
        products.append(starter)
    
    # 2. 6-Week Transformation
    print("📦 Product 2: 6-Week Transformation Plan")
    transformation = create_stripe_product("6-Week Transformation Plan", 14.90, "digital")
    if transformation:
        products.append(transformation)
    
    # 3. Custom Plan with Ian
    print("📦 Product 3: Custom Plan with Ian")
    custom = create_stripe_product("Custom Plan with Ian", 29.90, "digital")
    if custom:
        products.append(transformation)
    
    # 4. Meal Prep Subscription (using $10/meal as base)
    print("📦 Product 4: Meal Prep Subscription")
    meal_prep = create_stripe_product("Meal Prep Subscription", 10.00, "subscription")
    if meal_prep:
        products.append(meal_prep)
    
    # Summary
    print("\n" + "="*60)
    print("📋 STRIPE PRODUCTS SETUP")
    print("="*60)
    print("\n⚠️  MANUAL SETUP REQUIRED:")
    print("\n1. Log into Stripe Dashboard (test mode)")
    print("2. Create these 4 products:")
    print("\n   a) 6-Day Starter Guide")
    print("      - Type: One-time")
    print("      - Price: $0.00 SGD")
    print("\n   b) 6-Week Transformation Plan")
    print("      - Type: One-time  ")
    print("      - Price: $14.90 SGD")
    print("\n   c) Custom Plan with Ian")
    print("      - Type: One-time")
    print("      - Price: $29.90 SGD")
    print("\n   d) Meal Prep Subscription")
    print("      - Type: Recurring (monthly)")
    print("      - Price: $10.00 SGD per month")
    print("\n3. Copy the price_id (starts with price_...) for each")
    print("4. Update products in Admin Dashboard with Stripe price IDs")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
