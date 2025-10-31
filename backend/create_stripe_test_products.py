"""
Create Stripe Test Products for Project 62 Shop
This script creates test products in Stripe and returns their product IDs
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Manual Stripe API calls (no special library needed)
import requests

STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")

def create_stripe_product(name, price_sgd, product_type="digital"):
    """Create a Stripe product and price"""
    try:
        # Create Product
        product_response = requests.post(
            "https://api.stripe.com/v1/products",
            auth=(STRIPE_API_KEY, ""),
            data={
                "name": name,
                "type": "service" if product_type == "digital" else "good",
                "description": f"Project 62 - {name}"
            }
        )
        
        if product_response.status_code != 200:
            print(f"❌ Failed to create product: {product_response.text}")
            return None
        
        product_data = product_response.json()
        product_id = product_data["id"]
        print(f"✅ Product created: {name} (ID: {product_id})")
        
        # Create Price
        price_response = requests.post(
            "https://api.stripe.com/v1/prices",
            auth=(STRIPE_API_KEY, ""),
            data={
                "product": product_id,
                "unit_amount": int(price_sgd * 100),  # Convert to cents
                "currency": "sgd",
                "recurring[interval]": "month" if product_type == "subscription" else None
            } if product_type == "subscription" else {
                "product": product_id,
                "unit_amount": int(price_sgd * 100),
                "currency": "sgd"
            }
        )
        
        if price_response.status_code != 200:
            print(f"❌ Failed to create price: {price_response.text}")
            return None
        
        price_data = price_response.json()
        price_id = price_data["id"]
        print(f"✅ Price created: ${price_sgd} SGD (ID: {price_id})")
        
        return {
            "product_id": product_id,
            "price_id": price_id,
            "name": name,
            "price": price_sgd
        }
    except Exception as e:
        print(f"❌ Error creating Stripe product: {e}")
        return None

def main():
    """Create all 4 flagship Stripe products"""
    print("\n🎯 Creating Stripe Test Products for Project 62...\n")
    
    products = []
    
    # 1. 6-Day Starter (Free)
    print("📦 Creating: 6-Day Starter Guide")
    starter = create_stripe_product("6-Day Starter Guide", 0.00, "digital")
    if starter:
        products.append(starter)
        print(f"   Use price_id: {starter['price_id']}\n")
    
    # 2. 6-Week Transformation
    print("📦 Creating: 6-Week Transformation Plan")
    transformation = create_stripe_product("6-Week Transformation Plan", 14.90, "digital")
    if transformation:
        products.append(transformation)
        print(f"   Use price_id: {transformation['price_id']}\n")
    
    # 3. Custom Plan with Ian
    print("📦 Creating: Custom Plan with Ian")
    custom = create_stripe_product("Custom Plan with Ian", 29.90, "digital")
    if custom:
        products.append(custom)
        print(f"   Use price_id: {custom['price_id']}\n")
    
    # 4. Meal Prep Subscription (using $10/meal as base)
    print("📦 Creating: Meal Prep Subscription")
    meal_prep = create_stripe_product("Meal Prep Subscription", 10.00, "subscription")
    if meal_prep:
        products.append(meal_prep)
        print(f"   Use price_id: {meal_prep['price_id']}\n")
    
    # Summary
    print("\n" + "="*60)
    print("📋 STRIPE PRODUCT IDS SUMMARY")
    print("="*60)
    for p in products:
        print(f"{p['name']:35} | price_{p['price_id']}")
    print("="*60)
    print(f"\n✅ Successfully created {len(products)}/4 Stripe products\n")
    
    # Save to file for reference
    with open("/app/backend/stripe_product_ids.txt", "w") as f:
        f.write("STRIPE PRODUCT IDS FOR PROJECT 62\n")
        f.write("="*60 + "\n\n")
        for p in products:
            f.write(f"{p['name']}\n")
            f.write(f"  Product ID: {p['product_id']}\n")
            f.write(f"  Price ID: {p['price_id']}\n")
            f.write(f"  Amount: ${p['price']} SGD\n\n")
    
    print("💾 IDs saved to: /app/backend/stripe_product_ids.txt")

if __name__ == "__main__":
    main()
