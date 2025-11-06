"""
Project 62 - Backend API
Handles leads, digital products, meal-prep subscriptions, customer auth, and admin dashboard
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth as firebase_auth
from datetime import datetime, timedelta
import jwt
import uuid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest
)

load_dotenv()

router = APIRouter(prefix="/api/project62", tags=["Project 62"])
security = HTTPBearer()

# Initialize Firebase Admin SDK for Project 62
try:
    firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if not firebase_cred_path or not os.path.exists(firebase_cred_path):
        raise Exception(f"Firebase credentials not found at {firebase_cred_path}")
    
    # Check if app already exists
    try:
        project62_app = firebase_admin.get_app("project62")
    except ValueError:
        cred = credentials.Certificate(firebase_cred_path)
        project62_app = firebase_admin.initialize_app(cred, {
            'storageBucket': 'project62-ccc-digital.firebasestorage.app'
        }, name="project62")
    
    db = firestore.client(app=project62_app)
    bucket = storage.bucket(app=project62_app)
    print("✅ Firebase initialized successfully for Project 62")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    db = None
    bucket = None

# Stripe Integration
import stripe
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY environment variable is required but not set")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
if not STRIPE_WEBHOOK_SECRET:
    raise ValueError("STRIPE_WEBHOOK_SECRET environment variable is required but not set")
stripe.api_key = STRIPE_API_KEY
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
if not SENDGRID_API_KEY:
    raise ValueError("SENDGRID_API_KEY environment variable is required but not set")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "project62@cccdigital.sg")
SENDGRID_REPLY_TO_EMAIL = os.getenv("SENDGRID_REPLY_TO_EMAIL", "project62sg@gmail.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://meal-management-1.preview.emergentagent.com")
JWT_SECRET = os.getenv("PROJECT62_JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("PROJECT62_JWT_SECRET environment variable is required but not set")

# Pricing Configuration (Server-side only - security best practice)
DIGITAL_PRODUCTS = {
    "starter": {"name": "6-Week Transformation Plan", "price": 14.90, "currency": "sgd"},
    "custom": {"name": "Custom Plan with Ian", "price": 29.90, "currency": "sgd"}
}

# Meal-prep pricing tiers
MEAL_PREP_PRICING = {
    "1_week": {"1_meal": 12.00, "2_meals": 12.00},
    "2_weeks": {"1_meal": 11.50, "2_meals": 11.50},
    "4_weeks": {"1_meal": 10.80, "2_meals": 10.80},
    "6_weeks": {"1_meal": 10.00, "2_meals": 10.00}
}
DELIVERY_FEE = 20.00  # per week

# ========================
# Pydantic Models
# ========================

class LeadRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class DigitalCheckoutRequest(BaseModel):
    product_id: str  # "starter" or "custom"
    origin_url: str

class MealPrepCheckoutRequest(BaseModel):
    duration: str  # "1_week", "2_weeks", "4_weeks", "6_weeks"
    meals_per_day: int  # 1 or 2
    origin_url: str
    name: str
    email: EmailStr
    phone: str
    address: str
    start_date: str

class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CustomerRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str

class UpdateAddressRequest(BaseModel):
    address: str
    phone: Optional[str] = None

class AdminResetPasswordRequest(BaseModel):
    customer_id: str
    new_password: str

class MagicLinkRequest(BaseModel):
    email: EmailStr

class ProductCreateRequest(BaseModel):
    name: str
    description: str
    price: float
    type: str  # "digital", "physical", "subscription"
    category: str
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    featured_order: Optional[int] = 999
    visibility: Optional[str] = "public"  # "public", "member-only", "hidden"
    stripe_product_id: Optional[str] = None
    inventory: Optional[int] = None  # For physical products
    image_url: Optional[str] = None  # Single featured image
    delivery_charge: Optional[float] = 0  # For physical products

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    featured_order: Optional[int] = None
    visibility: Optional[str] = None
    stripe_product_id: Optional[str] = None
    inventory: Optional[int] = None
    image_url: Optional[str] = None
    delivery_charge: Optional[float] = None
    active: Optional[bool] = None

class CategoryRequest(BaseModel):
    name: str
    slug: Optional[str] = None


class PricingTier(BaseModel):
    weeks: int
    price_per_meal: float

class SubscriptionConfigRequest(BaseModel):
    plan_name: str
    pricing_tiers: List[dict]  # [{"weeks": 1, "price_per_meal": 15}, ...]
    meals_per_day: int  # 1 or 2
    delivery_fee: float
    description: str
    is_active: Optional[bool] = True
    stripe_plan_id: Optional[str] = None
    image_url: Optional[str] = None
    auto_renew_enabled: Optional[bool] = False

class SubscriptionConfigUpdateRequest(BaseModel):
    plan_name: Optional[str] = None
    pricing_tiers: Optional[List[dict]] = None
    meals_per_day: Optional[int] = None
    delivery_fee: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    stripe_plan_id: Optional[str] = None
    image_url: Optional[str] = None
    auto_renew_enabled: Optional[bool] = None

class DiscountCodeRequest(BaseModel):
    code: str
    percentage: float  # 10 for 10% off
    description: Optional[str] = None
    expires_at: Optional[str] = None  # ISO date string
    max_uses: Optional[int] = None
    active: bool = True

class ValidateDiscountRequest(BaseModel):
    code: str
    amount: float

class DishCreateRequest(BaseModel):
    dish_name: str
    description: Optional[str] = None
    calories: Optional[int] = None
    week_assigned: Optional[int] = None  # Which week this dish is scheduled for
    is_available: Optional[bool] = True
    image_url: Optional[str] = None

class DishUpdateRequest(BaseModel):
    dish_name: Optional[str] = None
    description: Optional[str] = None
    calories: Optional[int] = None
    week_assigned: Optional[int] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None

class ChangeDeliveryDateRequest(BaseModel):
    delivery_id: str
    new_date: str  # ISO format date

class ValidateCouponRequest(BaseModel):
    code: str

# ========================
# Helper Functions
# ========================

def generate_jwt_token(user_id: str, email: str, expires_delta: timedelta = timedelta(days=30)):
    """Generate JWT token for authentication"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + expires_delta
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def generate_verification_token(email: str):
    """Generate email verification token"""
    payload = {
        "email": email,
        "purpose": "email_verification",
        "exp": datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def send_verification_email(email: str, name: str, verification_token: str):
    """Send email verification link to new user"""
    try:
        verification_link = f"{FRONTEND_URL}/project62/verify-email?token={verification_token}"
        
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject="Verify Your Project 62 Account",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00b894;">Welcome to Project 62, {name}!</h2>
                <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                <p>Click the button below to verify your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_link}" 
                       style="background-color: #00b894; color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 14px; word-break: break-all;">{verification_link}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This link will expire in 24 hours. If you didn't create an account with Project 62, 
                    you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    Best regards,<br>
                    Project 62 Team<br>
                    <a href="mailto:{SENDGRID_REPLY_TO_EMAIL}">{SENDGRID_REPLY_TO_EMAIL}</a>
                </p>
            </div>
            """
        )
        
        message.reply_to = SENDGRID_REPLY_TO_EMAIL
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Verification email sent to {email}: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current user and verify admin role"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    
    # Get user from Firestore to check role
    customer_id = payload["email"].replace("@", "_at_").replace(".", "_")
    customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
    customer_doc = customer_ref.get()
    
    if not customer_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    customer_data = customer_doc.to_dict()
    
    if customer_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return payload


# ========================
# Loyalty Tier System Functions
# ========================

def calculate_loyalty_tier(total_weeks: int):
    """
    Calculate loyalty tier based on continuous weeks subscribed
    Returns: (tier_name, discount_percentage, free_delivery, priority_dish)
    """
    if total_weeks >= 37:
        return "Platinum", 10, True, True
    elif total_weeks >= 25:
        return "Gold", 10, False, False
    elif total_weeks >= 13:
        return "Silver", 5, False, False
    else:
        return "Bronze", 0, False, False

def apply_loyalty_discount(base_price: float, loyalty_discount: int, free_delivery: bool, delivery_fee: float):
    """
    Apply loyalty discount to pricing
    Returns: (discounted_meal_price, final_delivery_fee)
    """
    discounted_price = base_price * (1 - loyalty_discount / 100)
    final_delivery = 0 if free_delivery else delivery_fee
    return discounted_price, final_delivery

def update_customer_loyalty_tier(customer_id: str, additional_weeks: int):
    """
    Update customer's loyalty tier after a renewal
    Adds weeks to total_weeks_subscribed and recalculates tier
    """
    try:
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            print(f"⚠️  Customer {customer_id} not found for loyalty update")
            return
        
        customer_data = customer_doc.to_dict()
        current_weeks = customer_data.get("total_weeks_subscribed", 0)
        new_total_weeks = current_weeks + additional_weeks
        
        # Calculate new tier
        tier_name, discount, free_delivery, priority_dish = calculate_loyalty_tier(new_total_weeks)
        
        # Update customer document
        customer_ref.update({
            "total_weeks_subscribed": new_total_weeks,
            "loyalty_tier": tier_name,
            "loyalty_discount": discount,
            "free_delivery": free_delivery,
            "priority_dish": priority_dish,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        print(f"✅ Customer {customer_id} loyalty updated:")
        print(f"   Total weeks: {new_total_weeks}")
        print(f"   New tier: {tier_name} ({discount}% off)")
        if free_delivery:
            print(f"   🎁 Free delivery unlocked!")
        
        return {
            "tier": tier_name,
            "total_weeks": new_total_weeks,
            "discount": discount,
            "free_delivery": free_delivery
        }
    except Exception as e:
        print(f"❌ Error updating loyalty tier: {e}")
        return None


async def send_free_guide_email(name: str, email: str):
    """Send free 6-Day Guide via SendGrid with PDF attachment"""
    try:
        # Read PDF file
        pdf_path = "/app/backend/project62_assets/6day_starter_guide.pdf"
        with open(pdf_path, 'rb') as f:
            pdf_data = f.read()
        
        # Create SendGrid attachment
        encoded_file = base64.b64encode(pdf_data).decode()
        
        attachment = Attachment(
            FileContent(encoded_file),
            FileName('Project62_6Day_Starter_Guide.pdf'),
            FileType('application/pdf'),
            Disposition('attachment')
        )
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111111;">Welcome to Project 62, {name}!</h2>
                <p>Thank you for downloading your <strong>FREE 6-Day Starter Meal Plan</strong>.</p>
                <p>This guide will introduce you to the <strong>60-20-20 framework</strong> that helped Ian drop from 80kg to 62kg in 7 months.</p>
                <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #00b894;">
                    <h3 style="margin-top: 0;">What's Inside:</h3>
                    <ul>
                        <li>Simple 6-day meal plan</li>
                        <li>Food swaps for flexibility</li>
                        <li>The 2 meals a day structure</li>
                        <li>Tips for staying consistent</li>
                    </ul>
                </div>
                <p><strong>Ready for more?</strong></p>
                <p>Explore our <a href="https://cccdigital.sg/project62" style="color: #00b894;">meal-prep subscription plans</a> to take the next step.</p>
                <p style="margin-top: 30px; color: #666;">
                    Best regards,<br>
                    <strong>Ian Tang</strong><br>
                    Project 62
                </p>
            </body>
        </html>
        """
        
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=email,
            subject='Your FREE 6-Day Starter Guide from Project 62',
            html_content=html_content
        )
        message.attachment = attachment
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Email sent to {email} - Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

# ========================
# Lead Capture Endpoint
# ========================

@router.post("/leads")
async def create_lead(lead: LeadRequest):
    """
    Capture lead form submission and send free guide
    """
    try:
        lead_id = str(uuid.uuid4())
        lead_data = {
            "lead_id": lead_id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone or "",
            "status": "free_guide",
            "created_at": datetime.utcnow().isoformat(),
            "source": "landing_page"
        }
        
        # Save to Firestore
        db.collection("project62").document("leads").collection("all").document(lead_id).set(lead_data)
        
        # Send email with PDF (async in background)
        await send_free_guide_email(lead.name, lead.email)
        
        return {
            "status": "success",
            "message": "Thank you! Check your email for the free guide.",
            "lead_id": lead_id
        }
    except Exception as e:
        print(f"Error creating lead: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Digital Products Checkout
# ========================

@router.post("/checkout/digital")
async def create_digital_checkout(checkout_req: DigitalCheckoutRequest):
    """
    Create Stripe checkout session for digital products ($14.90 or $29.90)
    """
    try:
        # Validate product ID
        if checkout_req.product_id not in DIGITAL_PRODUCTS:
            raise HTTPException(status_code=400, detail="Invalid product ID")
        
        product = DIGITAL_PRODUCTS[checkout_req.product_id]
        amount = product["price"]
        currency = product["currency"]
        
        # Initialize Stripe checkout
        webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create success/cancel URLs
        # Note: Stripe replaces {CHECKOUT_SESSION_ID} with actual session ID
        success_url = f"{checkout_req.origin_url}/project62/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{checkout_req.origin_url}/project62/checkout/cancel"
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency=currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "product_type": "digital",
                "product_id": checkout_req.product_id,
                "product_name": product["name"]
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Save transaction to Firestore
        transaction_data = {
            "session_id": session.session_id,
            "product_type": "digital",
            "product_id": checkout_req.product_id,
            "product_name": product["name"],
            "amount": amount,
            "currency": currency,
            "payment_status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("payment_transactions").collection("all").document(session.session_id).set(transaction_data)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
    
    except Exception as e:
        print(f"Digital checkout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Meal-Prep Subscription Checkout
# ========================

@router.post("/checkout/meal-prep")
async def create_meal_prep_checkout(checkout_req: MealPrepCheckoutRequest):
    """
    Create Stripe checkout session for meal-prep subscription
    """
    try:
        print(f"Meal-prep checkout request: duration={checkout_req.duration}, meals_per_day={checkout_req.meals_per_day}")
        
        # Fetch subscription plans dynamically to get pricing
        plans_ref = db.collection("project62").document("subscriptions_config").collection("all")
        plans = [doc.to_dict() for doc in plans_ref.stream()]
        print(f"Found {len(plans)} subscription plans")
        
        # Find the correct plan based on meals_per_day
        target_plan = None
        for plan in plans:
            print(f"Plan: {plan.get('plan_name')}, meals_per_day={plan.get('meals_per_day')}")
            if plan.get("meals_per_day") == checkout_req.meals_per_day:
                target_plan = plan
                break
        
        if not target_plan:
            print(f"ERROR: No plan found for meals_per_day={checkout_req.meals_per_day}")
            raise HTTPException(status_code=400, detail="Invalid meal plan")
        
        print(f"Selected plan: {target_plan.get('plan_name')}")
        
        # Extract weeks from duration string (e.g., "3_weeks" -> 3)
        try:
            weeks = int(checkout_req.duration.split('_')[0])
            print(f"Extracted weeks: {weeks}")
        except Exception as e:
            print(f"ERROR: Could not parse duration '{checkout_req.duration}': {e}")
            raise HTTPException(status_code=400, detail="Invalid duration format")
        
        # Find the pricing tier for the selected duration
        pricing_tiers = target_plan.get("pricing_tiers", [])
        print(f"Available pricing tiers: {[t.get('weeks') for t in pricing_tiers]}")
        
        pricing_tier = None
        for tier in pricing_tiers:
            if tier.get("weeks") == weeks:
                pricing_tier = tier
                break
        
        if not pricing_tier:
            print(f"ERROR: No pricing tier found for {weeks} weeks in plan {target_plan.get('plan_name')}")
            raise HTTPException(status_code=400, detail=f"No pricing available for {weeks} weeks")
        
        print(f"Selected pricing tier: {pricing_tier}")
        
        # Calculate pricing from the tier
        price_per_meal = pricing_tier.get("price_per_meal", 0)
        delivery_fee = target_plan.get("delivery_fee", 20.00)
        
        # Calculate total meals and costs
        total_meals = weeks * 6 * checkout_req.meals_per_day  # 6 days per week
        meal_cost = total_meals * price_per_meal
        
        # Check for loyalty discount (only applies to meal costs, not delivery)
        loyalty_discount_percent = 0
        loyalty_tier = "None"
        
        if checkout_req.email:
            try:
                customer_id = checkout_req.email.replace("@", "_at_").replace(".", "_")
                customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
                customer_doc = customer_ref.get()
                
                if customer_doc.exists:
                    customer_data = customer_doc.to_dict()
                    loyalty_points = customer_data.get("loyalty_points", 0)
                    
                    # Determine tier and discount based on points
                    if loyalty_points >= 49:
                        loyalty_tier = "Platinum"
                        loyalty_discount_percent = 10
                    elif loyalty_points >= 25:
                        loyalty_tier = "Gold"
                        loyalty_discount_percent = 10
                    elif loyalty_points >= 7:
                        loyalty_tier = "Silver"
                        loyalty_discount_percent = 5
                    
                    if loyalty_discount_percent > 0:
                        discount_amount = meal_cost * (loyalty_discount_percent / 100)
                        meal_cost = meal_cost - discount_amount
                        print(f"🎯 Loyalty Discount Applied: {loyalty_tier} tier - {loyalty_discount_percent}% off = ${discount_amount:.2f} discount")
            except Exception as e:
                print(f"Could not check loyalty status: {e}")
        
        delivery_cost = weeks * delivery_fee
        total_amount = meal_cost + delivery_cost
        
        print(f"Pricing: {total_meals} meals × ${price_per_meal} - {loyalty_discount_percent}% loyalty discount + {weeks} weeks × ${delivery_fee} = ${total_amount}")
        
        # Initialize Stripe checkout
        webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create success/cancel URLs
        # Note: Stripe replaces {CHECKOUT_SESSION_ID} with actual session ID
        success_url = f"{checkout_req.origin_url}/project62/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{checkout_req.origin_url}/project62/checkout/cancel"
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=total_amount,
            currency="sgd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "product_type": "meal_prep",
                "duration": checkout_req.duration,
                "weeks": str(weeks),
                "meals_per_day": str(checkout_req.meals_per_day),
                "name": checkout_req.name,
                "email": checkout_req.email,
                "phone": checkout_req.phone,
                "address": checkout_req.address,
                "start_date": checkout_req.start_date,
                "loyalty_tier": loyalty_tier,
                "loyalty_discount_percent": str(loyalty_discount_percent)
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        print(f"Stripe session created: {session.session_id}")
        
        # Save transaction to Firestore
        transaction_data = {
            "session_id": session.session_id,
            "product_type": "meal_prep",
            "duration": checkout_req.duration,
            "meals_per_day": checkout_req.meals_per_day,
            "weeks": weeks,
            "total_meals": total_meals,
            "meal_cost": meal_cost,
            "delivery_cost": delivery_cost,
            "total_amount": total_amount,
            "currency": "sgd",
            "customer_name": checkout_req.name,
            "customer_email": checkout_req.email,
            "customer_phone": checkout_req.phone,
            "delivery_address": checkout_req.address,
            "start_date": checkout_req.start_date,
            "loyalty_tier": loyalty_tier,
            "loyalty_discount_percent": loyalty_discount_percent,
            "payment_status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("payment_transactions").collection("all").document(session.session_id).set(transaction_data)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Meal-prep checkout error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Payment Status Check
# ========================

@router.get("/checkout/status/{session_id}")
async def check_payment_status(session_id: str, origin_url: str = Header(None, alias="origin")):
    """
    Poll payment status after Stripe redirect
    """
    try:
        # Initialize Stripe checkout
        webhook_url = f"{origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get checkout status
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction in Firestore
        transaction_ref = db.collection("project62").document("payment_transactions").collection("all").document(session_id)
        transaction_doc = transaction_ref.get()
        
        if not transaction_doc.exists:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        transaction_data = transaction_doc.to_dict()
        
        # Only update if payment status changed
        if transaction_data.get("payment_status") != status.payment_status:
            transaction_ref.update({
                "payment_status": status.payment_status,
                "stripe_status": status.status,
                "updated_at": datetime.utcnow().isoformat()
            })
            
            # If payment successful, create order and deliveries
            if status.payment_status == "paid" and transaction_data.get("product_type") == "meal_prep":
                await process_meal_prep_order(transaction_data, session_id)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "metadata": status.metadata
        }
    
    except Exception as e:
        print(f"Payment status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_digital_product_order(transaction_data: dict, session_id: str):
    """Process digital product order after successful payment - send PDF link"""
    try:
        # Get product details from slug
        product_id_slug = transaction_data.get("product_id")
        
        # Get product from Firestore to get the PDF URL
        products_ref = db.collection("project62").document("digital_products").collection("all")
        product_query = products_ref.where("product_id_slug", "==", product_id_slug).limit(1).stream()
        product_docs = list(product_query)
        
        pdf_link = None
        product_name = transaction_data.get("product_name", "Digital Product")
        
        if product_docs:
            product_data = product_docs[0].to_dict()
            pdf_link = product_data.get("file_url")
            product_name = product_data.get("name", product_name)
        
        # Check if this is the Custom Plan with Ian
        is_custom_plan = "custom" in product_id_slug.lower() or "custom" in product_name.lower()
        
        # Get customer email from metadata
        customer_email = transaction_data.get("customer_email") or transaction_data.get("email")
        customer_name = transaction_data.get("customer_name", "Customer")
        
        if not customer_email:
            print(f"⚠️ No customer email found in transaction data for session {session_id}")
            return
        
        # Send appropriate email based on product type
        if is_custom_plan:
            # Custom Plan - Send consultation instructions
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #111111;">Thank You for Your Purchase!</h2>
                    <p>Hi {customer_name},</p>
                    <p>You've successfully purchased the <strong>Custom Plan with Ian</strong>!</p>
                    
                    <div style="background: #e6fff9; padding: 20px; border-radius: 8px; border-left: 4px solid #00b894; margin: 20px 0;">
                        <h3 style="color: #00b894; margin-top: 0;">📋 What Happens Next?</h3>
                        <ol style="line-height: 1.8;">
                            <li><strong>Schedule Your Consultation:</strong> Contact Ian via WhatsApp at <a href="https://wa.me/6589821301" style="color: #00b894;">+65 8982 1301</a></li>
                            <li><strong>Prepare Your Info:</strong> Think about:
                                <ul>
                                    <li>Your current fitness level and goals</li>
                                    <li>Daily schedule and meal timing preferences</li>
                                    <li>Food preferences and dietary restrictions</li>
                                    <li>Any health conditions or concerns</li>
                                </ul>
                            </li>
                            <li><strong>Consultation Call:</strong> Ian will create your personalized plan during a 30-minute consultation</li>
                            <li><strong>Receive Your Plan:</strong> Get your custom meal and fitness plan within 48 hours</li>
                        </ol>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>📱 Contact Ian Now:</strong></p>
                        <p style="margin: 5px 0 0 0;">WhatsApp: <a href="https://wa.me/6589821301" style="color: #00b894;">+65 8982 1301</a></p>
                        <p style="margin: 5px 0 0 0;">Email: project62sg@gmail.com</p>
                    </div>
                    
                    <p>Ian is excited to work with you on your transformation journey!</p>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Best regards,<br>
                        <strong>Project 62 Team</strong>
                    </p>
                </body>
            </html>
            """
            subject = "Your Custom Plan - Let's Schedule Your Consultation!"
        else:
            # Regular digital product - Send PDF link
            pdf_section = ""
            if pdf_link:
                pdf_section = f"""
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{pdf_link}" 
                       style="background-color: #00b894; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 8px; display: inline-block; 
                              font-weight: bold;">
                        📥 Download Your Plan (PDF)
                    </a>
                </div>
                """
            else:
                pdf_section = """
                <div style="background: #ffe6e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #d63031;">⚠️ PDF is being prepared and will be sent to you within 24 hours.</p>
                </div>
                """
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #111111;">Thank You for Your Purchase!</h2>
                    <p>Hi {customer_name},</p>
                    <p>You've successfully purchased <strong>{product_name}</strong>!</p>
                    
                    {pdf_section}
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #111111; margin-top: 0;">📖 What's Inside:</h3>
                        <p style="line-height: 1.6; color: #666;">
                            Your complete guide includes meal plans, nutrition tips, grocery lists, 
                            and everything you need to start your transformation journey.
                        </p>
                    </div>
                    
                    <div style="background: #e6fff9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
                        <p style="margin: 0;"><strong>💡 Need More Support?</strong></p>
                        <p style="margin: 5px 0 0 0;">Join our meal-prep subscription for weekly pre-made meals delivered to your door!</p>
                        <p style="margin: 5px 0 0 0;"><a href="https://cccdigital.sg/project62#meal-prep" style="color: #00b894;">View Meal-Prep Plans →</a></p>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666;">
                        Best regards,<br>
                        <strong>Project 62 Team</strong>
                    </p>
                </body>
            </html>
            """
            subject = f"Your {product_name} is Ready!"
        
        # Send email to customer
        try:
            message = Mail(
                from_email=SENDGRID_FROM_EMAIL,
                to_emails=customer_email,
                subject=subject,
                html_content=html_content
            )
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            print(f"✅ Digital product email sent to {customer_email} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Email sending error: {e}")
        
        # Also notify admin
        try:
            admin_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>🎉 New Digital Product Purchase!</h2>
                    <p><strong>Product:</strong> {product_name}</p>
                    <p><strong>Customer:</strong> {customer_name}</p>
                    <p><strong>Email:</strong> {customer_email}</p>
                    <p><strong>Amount:</strong> ${transaction_data.get('amount', 0)} SGD</p>
                    <p><strong>Session ID:</strong> {session_id}</p>
                    <hr>
                    {f'<p><strong>Action Required:</strong> Schedule consultation call with customer!</p>' if is_custom_plan else '<p>PDF link sent to customer automatically.</p>'}
                </body>
            </html>
            """
            
            admin_message = Mail(
                from_email=SENDGRID_FROM_EMAIL,
                to_emails='project62sg@gmail.com',
                subject=f'New Purchase: {product_name} - {customer_name}',
                html_content=admin_content
            )
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            sg.send(admin_message)
            print(f"✅ Admin notification sent for digital product purchase")
        except Exception as e:
            print(f"❌ Admin email error: {e}")
            
    except Exception as e:
        print(f"❌ Process digital product error: {e}")
        import traceback
        traceback.print_exc()

async def process_meal_prep_order(transaction_data: dict, session_id: str):
    """Process meal-prep order after successful payment"""
    try:
        order_id = str(uuid.uuid4())
        customer_email = transaction_data["customer_email"]
        customer_id = customer_email.replace("@", "_at_").replace(".", "_")
        
        # Create order
        order_data = {
            "order_id": order_id,
            "session_id": session_id,
            "stripe_session_id": session_id,
            "customer_name": transaction_data["customer_name"],
            "customer_email": customer_email,
            "customer_phone": transaction_data["customer_phone"],
            "delivery_address": transaction_data["delivery_address"],
            "duration": transaction_data["duration"],
            "duration_weeks": transaction_data["weeks"],
            "meals_per_day": transaction_data["meals_per_day"],
            "weeks": transaction_data["weeks"],
            "total_amount": transaction_data["total_amount"],
            "amount": transaction_data["total_amount"],
            "meal_cost": transaction_data.get("meal_cost", 0),
            "delivery_cost": transaction_data.get("delivery_cost", 0),
            "total_meals": transaction_data.get("total_meals", 0),
            "start_date": transaction_data["start_date"],
            "status": "active",
            "payment_status": "completed",
            "product_type": "meal_prep",
            "frequency": "once/week",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("orders").collection("all").document(order_id).set(order_data)
        
        # Create subscription with unique ID (not overwriting existing ones)
        start_date = datetime.fromisoformat(transaction_data["start_date"])
        end_date = start_date + timedelta(weeks=transaction_data["weeks"])
        
        # Find the subscription plan to get price per meal
        plans_ref = db.collection("project62").document("subscriptions_config").collection("all")
        plans = [doc.to_dict() for doc in plans_ref.stream()]
        target_plan = None
        price_per_meal = 0
        
        for plan in plans:
            if plan.get("meals_per_day") == transaction_data["meals_per_day"]:
                target_plan = plan
                # Find the pricing tier for this duration
                pricing_tiers = plan.get("pricing_tiers", [])
                for tier in pricing_tiers:
                    if tier.get("weeks") == transaction_data["weeks"]:
                        price_per_meal = tier.get("price_per_meal", 0)
                        break
                break
        
        # Calculate loyalty points: weeks × meals_per_day
        loyalty_points = transaction_data["weeks"] * transaction_data["meals_per_day"]
        
        # Create NEW subscription with unique subscription_id
        subscription_id = str(uuid.uuid4())
        subscription_data = {
            "subscription_id": subscription_id,
            "customer_id": customer_id,
            "customer_email": customer_email,
            "customer_name": transaction_data["customer_name"],
            "plan_id": target_plan.get("subscription_id") if target_plan else "meal_prep",
            "plan_name": target_plan.get("plan_name") if target_plan else f"{transaction_data['meals_per_day']} Meal/Day Plan",
            "meals_per_day": transaction_data["meals_per_day"],
            "duration_weeks": transaction_data["weeks"],
            "commitment_weeks": transaction_data["weeks"],
            "price_per_meal": price_per_meal,
            "loyalty_points": loyalty_points,
            "start_date": transaction_data["start_date"],
            "end_date": end_date.isoformat(),
            "status": "active",
            "auto_renew": False,
            "delivery_address": transaction_data["delivery_address"],
            "order_id": order_id,
            "created_at": datetime.utcnow().isoformat(),
            "payment_date": datetime.utcnow().isoformat(),
            "payment_amount": transaction_data["total_amount"]
        }
        
        # Store subscription with unique subscription_id (NOT customer_id)
        subscription_ref = db.collection("project62").document("subscriptions").collection("active").document(subscription_id)
        subscription_ref.set(subscription_data)
        
        print(f"✅ Subscription {subscription_id} created for customer {customer_id}")
        
        # Update customer record with total weeks
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if customer_doc.exists:
            # Calculate total weeks from all subscriptions
            all_subs = db.collection("project62").document("subscriptions").collection("active").where("customer_email", "==", customer_email).stream()
            total_weeks = sum(sub.to_dict().get("duration_weeks", 0) for sub in all_subs)
            
            # Append order to existing customer
            customer_ref.update({
                "orders": firestore.ArrayUnion([order_id]),
                "last_order_date": datetime.utcnow().isoformat(),
                "address": transaction_data["delivery_address"],
                "total_weeks_subscribed": total_weeks
            })
        else:
            # Create new customer
            customer_data = {
                "customer_id": customer_id,
                "email": customer_email,
                "name": transaction_data["customer_name"],
                "phone": transaction_data["customer_phone"],
                "address": transaction_data["delivery_address"],
                "orders": [order_id],
                "last_order_date": datetime.utcnow().isoformat(),
                "total_weeks_subscribed": transaction_data["weeks"]
            }
            customer_ref.set(customer_data)
        
        # Send notification email to admin
        try:
            admin_email_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>🎉 New Meal-Prep Subscription Order!</h2>
                    <p><strong>Order ID:</strong> {order_id}</p>
                    <p><strong>Subscription ID:</strong> {subscription_id}</p>
                    <p><strong>Customer:</strong> {transaction_data["customer_name"]}</p>
                    <p><strong>Email:</strong> {customer_email}</p>
                    <p><strong>Phone:</strong> {transaction_data["customer_phone"]}</p>
                    <p><strong>Delivery Address:</strong> {transaction_data["delivery_address"]}</p>
                    <p><strong>Duration:</strong> {transaction_data["weeks"]} weeks</p>
                    <p><strong>Meals per Day:</strong> {transaction_data["meals_per_day"]}</p>
                    <p><strong>Price per Meal:</strong> ${price_per_meal}</p>
                    <p><strong>Total Amount:</strong> ${transaction_data["total_amount"]} SGD</p>
                    <p><strong>Start Date:</strong> {transaction_data["start_date"]}</p>
                    <p><strong>End Date:</strong> {end_date.date()}</p>
                    <hr>
                    <p>Please prepare the meal deliveries accordingly.</p>
                </body>
            </html>
            """
            
            admin_message = Mail(
                from_email=SENDGRID_FROM_EMAIL,
                to_emails='project62sg@gmail.com',
                subject=f'New Order: {order_id} - {transaction_data["customer_name"]}',
                html_content=admin_email_content
            )
            
            admin_message.reply_to = SENDGRID_REPLY_TO_EMAIL
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            sg.send(admin_message)
            print(f"✅ Admin notification sent for order {order_id}")
        except Exception as e:
            print(f"❌ Admin email error: {e}")
        
        # Create delivery schedule linked to subscription_id
        for week_num in range(1, transaction_data["weeks"] + 1):
            delivery_date = start_date + timedelta(weeks=week_num - 1)
            delivery_id = f"{subscription_id}_week_{week_num}"
            
            delivery_data = {
                "delivery_id": delivery_id,
                "subscription_id": subscription_id,
                "order_id": order_id,
                "customer_id": customer_id,
                "customer_email": customer_email,
                "customer_name": transaction_data["customer_name"],
                "week_number": week_num,
                "delivery_date": delivery_date.isoformat(),
                "delivery_address": transaction_data["delivery_address"],
                "meals_per_day": transaction_data["meals_per_day"],
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            db.collection("project62").document("deliveries").collection("all").document(delivery_id).set(delivery_data)
        
        print(f"✅ Order {order_id} processed successfully with {transaction_data['weeks']} deliveries")
    except Exception as e:
        print(f"❌ Order processing error: {e}")
        import traceback
        traceback.print_exc()

# ========================
# Customer Authentication
# ========================

@router.post("/auth/register")
async def register_customer(req: CustomerRegisterRequest):
    """Register new customer with Firebase Auth and send verification email"""
    try:
        # Create Firebase user (disabled until email verification)
        user = firebase_auth.create_user(
            email=req.email,
            password=req.password,
            display_name=req.name,
            email_verified=False,
            disabled=False,  # Keep enabled but block login via our backend logic
            app=project62_app
        )
        
        # Create customer record in Firestore with email_verified flag
        customer_id = req.email.replace("@", "_at_").replace(".", "_")
        customer_data = {
            "customer_id": customer_id,
            "firebase_uid": user.uid,
            "email": req.email,
            "name": req.name,
            "phone": req.phone,
            "role": "customer",
            "email_verified": False,
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("customers").collection("all").document(customer_id).set(customer_data)
        
        # Generate verification token
        verification_token = generate_verification_token(req.email)
        
        # Send verification email
        email_sent = await send_verification_email(req.email, req.name, verification_token)
        
        if not email_sent:
            print(f"Warning: Verification email failed to send to {req.email}")
        
        return {
            "status": "success",
            "message": "Registration successful! Please check your email to verify your account.",
            "email_sent": email_sent,
            "user": {
                "email": req.email,
                "name": req.name,
                "email_verified": False
            }
        }
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
async def login_customer(req: CustomerLoginRequest):
    """Login customer and return JWT token"""
    try:
        # Verify with Firebase Auth (using REST API since Admin SDK doesn't support password verification)
        import requests
        firebase_api_key = os.getenv("FIREBASE_WEB_API_KEY")
        auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"
        
        # Add referer header to match Firebase configuration
        headers = {
            "Referer": "https://emergentai.app/",
            "Content-Type": "application/json"
        }
        
        response = requests.post(auth_url, json={
            "email": req.email,
            "password": req.password,
            "returnSecureToken": True
        }, headers=headers)
        
        if response.status_code != 200:
            # Parse Firebase error for specific message
            try:
                error_data = response.json()
                error_message = error_data.get("error", {}).get("message", "")
                
                # Translate Firebase errors to user-friendly messages
                if "EMAIL_NOT_FOUND" in error_message:
                    raise HTTPException(status_code=401, detail="No account found with this email address")
                elif "INVALID_PASSWORD" in error_message:
                    raise HTTPException(status_code=401, detail="Incorrect password")
                elif "USER_DISABLED" in error_message:
                    raise HTTPException(status_code=403, detail="This account has been disabled")
                elif "TOO_MANY_ATTEMPTS_TRY_LATER" in error_message:
                    raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again later")
                else:
                    raise HTTPException(status_code=401, detail="Invalid email or password")
            except (ValueError, KeyError):
                raise HTTPException(status_code=401, detail="Invalid email or password")
        
        auth_data = response.json()
        
        # Get customer data from Firestore
        customer_id = req.email.replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Account exists but profile not found. Please contact support.")
        
        customer_data = customer_doc.to_dict()
        
        # Check if email is verified
        if not customer_data.get("email_verified", False):
            raise HTTPException(
                status_code=403, 
                detail="Please verify your email address before logging in. Check your inbox for the verification link."
            )
        
        # Generate JWT token
        token = generate_jwt_token(auth_data["localId"], req.email)
        
        return {
            "status": "success",
            "token": token,
            "user": {
                "uid": auth_data["localId"],
                "email": req.email,
                "name": customer_data.get("name", ""),
                "role": customer_data.get("role", "customer")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/auth/verify-email")
async def verify_email(token: str):
    """Verify user email address via token"""
    try:
        # Decode and verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Check if token is for email verification
        if payload.get("purpose") != "email_verification":
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        # Update customer record in Firestore
        customer_id = email.replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Account not found")
        
        # Check if already verified
        customer_data = customer_doc.to_dict()
        if customer_data.get("email_verified", False):
            return {
                "status": "success",
                "message": "Email already verified! You can now log in.",
                "already_verified": True
            }
        
        # Update verification status
        customer_ref.update({
            "email_verified": True,
            "verified_at": datetime.utcnow().isoformat()
        })
        
        # Also update Firebase Auth
        try:
            user = firebase_auth.get_user_by_email(email, app=project62_app)
            firebase_auth.update_user(
                user.uid,
                email_verified=True,
                app=project62_app
            )
        except Exception as e:
            print(f"Warning: Could not update Firebase Auth verification status: {e}")
        
        return {
            "status": "success",
            "message": "Email verified successfully! You can now log in.",
            "email": email
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Email verification error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Email verification failed")

@router.post("/auth/resend-verification")
async def resend_verification_email(req: dict):
    """Resend verification email to user"""
    try:
        email = req.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Get customer data from Firestore
        customer_id = email.replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Account not found")
        
        customer_data = customer_doc.to_dict()
        
        # Check if already verified
        if customer_data.get("email_verified", False):
            raise HTTPException(status_code=400, detail="Email is already verified")
        
        # Generate new verification token
        verification_token = generate_verification_token(email)
        
        # Send verification email
        email_sent = await send_verification_email(
            email, 
            customer_data.get("name", "User"),
            verification_token
        )
        
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send verification email")
        
        return {
            "status": "success",
            "message": "Verification email sent! Please check your inbox."
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Resend verification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend verification email")

@router.get("/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify JWT token and return user info"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer_data = customer_doc.to_dict()
        
        return {
            "status": "success",
            "user": {
                "uid": current_user["user_id"],
                "email": current_user["email"],
                "name": customer_data.get("name", ""),
                "role": customer_data.get("role", "customer")
            }
        }
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/customer/profile")
async def get_customer_profile(current_user: dict = Depends(get_current_user)):
    """Get customer profile with saved delivery information"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer profile not found")
        
        customer_data = customer_doc.to_dict()
        
        # Get subscription info if exists
        subscription_ref = db.collection("project62").document("subscriptions").collection("active").document(customer_id)
        subscription_doc = subscription_ref.get()
        subscription_data = subscription_doc.to_dict() if subscription_doc.exists else None
        
        # Parse the address string if it exists
        address_str = customer_data.get("address", "")
        
        return {
            "customer_id": customer_data.get("customer_id"),
            "name": customer_data.get("name", ""),
            "email": customer_data.get("email", ""),
            "phone": customer_data.get("phone", ""),
            "address": address_str,  # Full address string
            "postal_code": customer_data.get("postal_code", ""),
            "country": customer_data.get("country", "Singapore"),
            "role": customer_data.get("role", "customer"),
            "email_verified": customer_data.get("email_verified", False),
            "has_active_subscription": subscription_data is not None,
            "loyalty_tier": customer_data.get("loyalty_tier", "bronze")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.post("/auth/magic-link")
async def send_magic_link(req: MagicLinkRequest):
    """Send magic link for passwordless login"""
    try:
        # Check if customer exists
        customer_id = req.email.replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            # Create a new customer record without password
            firebase_user = firebase_auth.get_user_by_email(req.email, app=project62_app)
            customer_data = {
                "customer_id": customer_id,
                "firebase_uid": firebase_user.uid,
                "email": req.email,
                "name": firebase_user.display_name or req.email.split("@")[0],
                "role": "customer",
                "created_at": datetime.utcnow().isoformat()
            }
            customer_ref.set(customer_data)
        
        # Generate magic link token (expires in 15 minutes)
        magic_token = generate_jwt_token(customer_id, req.email)
        magic_link = f"https://cccdigital.sg/project62/auth/verify?token={magic_token}"
        
        # Send email with magic link
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111111;">Login to Project 62</h2>
                <p>Click the button below to securely log in to your Project 62 account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{magic_link}" 
                       style="background-color: #00b894; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block; 
                              font-weight: bold;">
                        Log In to Project 62
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 15 minutes for security reasons.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't request this login link, please ignore this email.
                </p>
                <p style="margin-top: 30px; color: #666;">
                    Best regards,<br>
                    <strong>Project 62 Team</strong>
                </p>
            </body>
        </html>
        """
        
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=req.email,
            subject='Your Magic Login Link - Project 62',
            html_content=html_content
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Magic link sent to {req.email} - Status: {response.status_code}")
        
        return {
            "status": "success",
            "message": "Magic link sent to your email. Please check your inbox."
        }
    except firebase_auth.UserNotFoundError:
        # For security, return success even if user doesn't exist
        return {
            "status": "success",
            "message": "If an account exists, a magic link has been sent to your email."
        }
    except Exception as e:
        print(f"Magic link error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send magic link")

@router.get("/auth/verify-magic-link")
async def verify_magic_link(token: str):
    """Verify magic link token and return JWT"""
    try:
        payload = verify_jwt_token(token)
        
        # Token is valid, return it for frontend to store
        return {
            "status": "success",
            "token": token,
            "user": {
                "uid": payload["user_id"],
                "email": payload["email"]
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Magic link verification error: {e}")
        raise HTTPException(status_code=400, detail="Invalid or expired magic link")

# ========================
# Customer Portal Endpoints
# ========================

@router.get("/customer/dashboard")
async def get_customer_dashboard(current_user: dict = Depends(get_current_user)):
    """Get customer dashboard data (active orders, upcoming deliveries)"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        
        # Get customer data
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            return {"orders": [], "deliveries": [], "plan_status": None}
        
        customer_data = customer_doc.to_dict()
        
        # Get orders
        orders = []
        if "orders" in customer_data and customer_data["orders"]:
            for order_id in customer_data["orders"]:
                order_ref = db.collection("project62").document("orders").collection("all").document(order_id)
                order_doc = order_ref.get()
                if order_doc.exists:
                    orders.append(order_doc.to_dict())
        
        # Get upcoming deliveries
        deliveries_ref = db.collection("project62").document("deliveries").collection("all")
        deliveries_query = deliveries_ref.where("customer_id", "==", customer_id).where("status", "==", "pending")
        deliveries = [doc.to_dict() for doc in deliveries_query.stream()]
        
        # Sort deliveries by date
        deliveries.sort(key=lambda x: x.get("delivery_date", ""))
        
        return {
            "customer": customer_data,
            "orders": orders,
            "deliveries": deliveries,  # All upcoming deliveries
            "plan_status": orders[0] if orders else None
        }
    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/customer/address")
async def update_customer_address(req: UpdateAddressRequest, current_user: dict = Depends(get_current_user)):
    """Update customer address and phone"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        
        update_data = {"address": req.address}
        if req.phone:
            update_data["phone"] = req.phone
        
        customer_ref.update(update_data)
        
        return {"status": "success", "message": "Address updated successfully"}
    except Exception as e:
        print(f"Address update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/customer/delivery/change-date")
async def change_delivery_date(req: ChangeDeliveryDateRequest, current_user: dict = Depends(get_current_user)):
    """Change delivery date for Gold/Platinum tier customers (within 3 business days)"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_email = current_user["email"]
        
        # Get customer to check loyalty tier
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Calculate total points from all subscriptions
        subscriptions_ref = db.collection("project62").document("subscriptions").collection("active")
        subscriptions_query = subscriptions_ref.where("customer_email", "==", customer_email).stream()
        
        total_points = 0
        for sub_doc in subscriptions_query:
            sub_data = sub_doc.to_dict()
            weeks = sub_data.get("duration_weeks", 0)
            meals_per_day = sub_data.get("meals_per_day", 1)
            total_points += weeks * meals_per_day
        
        # Calculate loyalty tier based on points
        if total_points >= 49:
            tier = "Platinum"
        elif total_points >= 25:
            tier = "Gold"
        else:
            raise HTTPException(status_code=403, detail="Only Gold and Platinum tier customers can change delivery dates")
        
        # Get the delivery
        delivery_ref = db.collection("project62").document("deliveries").collection("all").document(req.delivery_id)
        delivery_doc = delivery_ref.get()
        
        if not delivery_doc.exists:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        delivery_data = delivery_doc.to_dict()
        
        # Verify this delivery belongs to the customer
        if delivery_data.get("customer_email") != customer_email:
            raise HTTPException(status_code=403, detail="This delivery does not belong to you")
        
        # Verify delivery is still pending
        if delivery_data.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Cannot change date for completed or cancelled deliveries")
        
        # Validate new date is within 3 business days from original date
        from datetime import datetime, timedelta
        original_date = datetime.fromisoformat(delivery_data.get("delivery_date").replace('Z', '+00:00') if 'Z' in delivery_data.get("delivery_date", "") else delivery_data.get("delivery_date"))
        new_date = datetime.fromisoformat(req.new_date.replace('Z', '+00:00') if 'Z' in req.new_date else req.new_date)
        
        # Calculate business days difference
        days_diff = abs((new_date - original_date).days)
        if days_diff > 3:
            raise HTTPException(status_code=400, detail="New date must be within 3 business days of the original delivery date")
        
        # Update delivery date
        delivery_ref.update({
            "delivery_date": new_date.isoformat(),
            "date_changed": True,
            "date_changed_at": datetime.utcnow().isoformat(),
            "original_delivery_date": original_date.isoformat()
        })
        
        return {
            "status": "success",
            "message": "Delivery date updated successfully",
            "new_date": new_date.isoformat(),
            "tier": tier
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Change delivery date error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Admin Dashboard Endpoints
# ========================

@router.get("/admin/leads")
async def get_all_leads(current_user: dict = Depends(get_current_admin)):
    """Get all leads for admin dashboard"""
    try:
        leads_ref = db.collection("project62").document("leads").collection("all")
        leads = [doc.to_dict() for doc in leads_ref.stream()]
        leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"leads": leads}
    except Exception as e:
        print(f"Admin leads error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/orders")
async def get_all_orders(current_user: dict = Depends(get_current_admin)):
    """Get all orders for admin dashboard"""
    try:
        orders_ref = db.collection("project62").document("orders").collection("all")
        orders = [doc.to_dict() for doc in orders_ref.stream()]
        orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"orders": orders}
    except Exception as e:
        print(f"Admin orders error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/deliveries")
async def get_all_deliveries(current_user: dict = Depends(get_current_admin)):
    """Get all deliveries for admin dashboard with customer addresses"""
    try:
        deliveries_ref = db.collection("project62").document("deliveries").collection("all")
        deliveries = []
        
        for doc in deliveries_ref.stream():
            delivery_data = doc.to_dict()
            
            # Get customer address if not already in delivery data
            if "address" not in delivery_data and "customer_id" in delivery_data:
                customer_ref = db.collection("project62").document("customers").collection("all").document(delivery_data["customer_id"])
                customer_doc = customer_ref.get()
                if customer_doc.exists:
                    customer_data = customer_doc.to_dict()
                    delivery_data["address"] = customer_data.get("address", delivery_data.get("delivery_address", "N/A"))
            elif "delivery_address" in delivery_data and "address" not in delivery_data:
                delivery_data["address"] = delivery_data["delivery_address"]
            
            deliveries.append(delivery_data)
        
        deliveries.sort(key=lambda x: x.get("delivery_date", ""))
        return {"deliveries": deliveries}
    except Exception as e:
        print(f"Admin deliveries error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/customers")
async def get_all_customers(current_user: dict = Depends(get_current_admin)):
    """Get all customers for admin dashboard"""
    try:
        customers_ref = db.collection("project62").document("customers").collection("all")
        customers = [doc.to_dict() for doc in customers_ref.stream()]
        customers.sort(key=lambda x: x.get("last_order_date", ""), reverse=True)
        return {"customers": customers}
    except Exception as e:
        print(f"Admin customers error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/delivery/{delivery_id}/status")
async def update_delivery_status(delivery_id: str, status: str, current_user: dict = Depends(get_current_admin)):
    """Update delivery status (pending/delivered)"""
    try:
        delivery_ref = db.collection("project62").document("deliveries").collection("all").document(delivery_id)
        delivery_ref.update({"status": status, "updated_at": datetime.utcnow().isoformat()})
        return {"status": "success", "message": f"Delivery status updated to {status}"}
    except Exception as e:
        print(f"Delivery status update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Product Management Endpoints (Admin)
# ========================

@router.get("/admin/products")
async def get_all_products(
    current_user: dict = Depends(get_current_admin),
    category: Optional[str] = None,
    type: Optional[str] = None,
    visibility: Optional[str] = None,
    featured: Optional[bool] = None
):
    """Get all products with optional filters"""
    try:
        products_ref = db.collection("project62").document("products").collection("all")
        products = [doc.to_dict() for doc in products_ref.stream()]
        
        # Apply filters
        if category:
            products = [p for p in products if p.get("category") == category]
        if type:
            products = [p for p in products if p.get("type") == type]
        if visibility:
            products = [p for p in products if p.get("visibility") == visibility]
        if featured is not None:
            products = [p for p in products if p.get("is_featured") == featured]
        
        # Sort by created_at (newest first) or featured_order if featured
        if featured:
            products.sort(key=lambda x: x.get("featured_order", 999))
        else:
            products.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"products": products, "count": len(products)}
    except Exception as e:
        print(f"Get products error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/products")
async def create_product(product: ProductCreateRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new product (digital, physical, or subscription)"""
    try:
        product_id = str(uuid.uuid4())
        
        # Generate slug from name
        product_slug = product.name.lower().replace(" ", "-").replace("'", "").replace(",", "")
        
        # If featured and featured_order is set, reorder existing products
        if product.is_featured and product.featured_order:
            await reorder_featured_products(product.featured_order, None)
        
        product_data = {
            "product_id": product_id,
            "product_id_slug": product_slug,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "type": product.type,  # "digital", "physical", "subscription"
            "category": product.category,
            "tags": product.tags or [],
            "is_featured": product.is_featured or False,
            "featured_order": product.featured_order or 999,
            "visibility": product.visibility or "public",
            "stripe_product_id": product.stripe_product_id,
            "inventory": int(product.inventory) if product.inventory else None,
            "image_url": product.image_url or None,
            "delivery_charge": float(product.delivery_charge) if product.delivery_charge else 0.0,
            "file_url": None,  # Will be uploaded separately for digital products
            "images": [],  # Additional images array
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        print(f"📦 Creating product: {product.name}")
        print(f"   Type: {product.type}")
        print(f"   Category: {product.category}")
        print(f"   Price: ${product.price}")
        print(f"   Featured: {product_data['is_featured']} (Order: {product_data['featured_order']})")
        print(f"   Visibility: {product_data['visibility']}")
        
        db.collection("project62").document("products").collection("all").document(product_id).set(product_data)
        
        print(f"✅ Product created successfully: {product_id}")
        
        return {"status": "success", "product_id": product_id, "product": product_data}
    except Exception as e:
        print(f"❌ Create product error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def reorder_featured_products(new_order: int, exclude_product_id: str = None):
    """
    Automatically reorder featured products to prevent duplicates.
    When a product is set to position X, all products at position >= X are shifted up by 1.
    """
    try:
        # Get all featured products
        products_ref = db.collection("project62").document("products").collection("all")
        all_products = [doc for doc in products_ref.stream()]
        
        # Filter to only featured products, excluding the one being updated
        featured_products = [
            (doc.id, doc.to_dict()) 
            for doc in all_products 
            if doc.to_dict().get("is_featured") and doc.id != exclude_product_id
        ]
        
        # Shift products at or after the new position
        for product_id, product_data in featured_products:
            current_order = product_data.get("featured_order", 999)
            if current_order >= new_order:
                new_position = current_order + 1
                print(f"   Reordering: {product_data.get('name')} from position {current_order} to {new_position}")
                products_ref.document(product_id).update({
                    "featured_order": new_position,
                    "updated_at": datetime.utcnow().isoformat()
                })
        
        print(f"✅ Reordering complete for position {new_order}")
    except Exception as e:
        print(f"⚠️  Reordering error: {e}")
        # Don't fail the main operation if reordering fails

@router.put("/admin/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdateRequest, current_user: dict = Depends(get_current_admin)):
    """Update product details"""
    try:
        product_ref = db.collection("project62").document("products").collection("all").document(product_id)
        product_doc = product_ref.get()
        
        if not product_doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        
        current_product = product_doc.to_dict()
        
        # Check if featured_order is changing and product is featured
        if product.featured_order is not None and product.featured_order != current_product.get("featured_order"):
            is_featured = product.is_featured if product.is_featured is not None else current_product.get("is_featured", False)
            if is_featured:
                await reorder_featured_products(product.featured_order, product_id)
        
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if product.name is not None:
            update_data["name"] = product.name
            # Update slug when name changes
            update_data["product_id_slug"] = product.name.lower().replace(" ", "-").replace("'", "").replace(",", "")
        if product.description is not None:
            update_data["description"] = product.description
        if product.price is not None:
            update_data["price"] = float(product.price)
        if product.type is not None:
            update_data["type"] = product.type
        if product.category is not None:
            update_data["category"] = product.category
        if product.tags is not None:
            update_data["tags"] = product.tags
        if product.is_featured is not None:
            update_data["is_featured"] = product.is_featured
        if product.featured_order is not None:
            update_data["featured_order"] = product.featured_order
        if product.visibility is not None:
            update_data["visibility"] = product.visibility
        if product.stripe_product_id is not None:
            update_data["stripe_product_id"] = product.stripe_product_id
        if product.inventory is not None:
            update_data["inventory"] = product.inventory
        if product.image_url is not None:
            update_data["image_url"] = product.image_url
        if product.delivery_charge is not None:
            update_data["delivery_charge"] = float(product.delivery_charge)
        if product.active is not None:
            update_data["active"] = product.active
        
        product_ref.update(update_data)
        
        return {"status": "success", "message": "Product updated successfully", "updates": update_data}
    except Exception as e:
        print(f"Update product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/products/{product_id}/upload")
async def upload_product_file(product_id: str, request: Request, current_user: dict = Depends(get_current_admin)):
    """Upload PDF file for a digital product"""
    try:
        from fastapi import File, UploadFile, Form
        
        # Get the uploaded file from request
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"products/digital/{product_id}/{file.filename}")
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        
        # Update product with file URL
        product_ref = db.collection("project62").document("products").collection("all").document(product_id)
        product_ref.update({
            "file_url": blob.public_url,
            "file_name": file.filename,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "file_url": blob.public_url}
    except Exception as e:
        print(f"Upload file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/products/{product_id}/upload-image")
async def upload_product_image(product_id: str, request: Request, current_user: dict = Depends(get_current_admin)):
    """Upload product image"""
    try:
        from fastapi import File, UploadFile, Form
        
        # Get the uploaded file from request
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"products/images/{product_id}/{file.filename}")
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        
        # Get product and update images array
        product_ref = db.collection("project62").document("products").collection("all").document(product_id)
        product_doc = product_ref.get()
        
        if not product_doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product_doc.to_dict()
        images = product_data.get("images", [])
        images.append(blob.public_url)
        
        product_ref.update({
            "images": images,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "image_url": blob.public_url, "total_images": len(images)}
    except Exception as e:
        print(f"Upload image error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/products/{product_id}/image")
async def delete_product_image(product_id: str, image_url: str, current_user: dict = Depends(get_current_admin)):
    """Delete a product image"""
    try:
        product_ref = db.collection("project62").document("products").collection("all").document(product_id)
        product_doc = product_ref.get()
        
        if not product_doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product_doc.to_dict()
        images = product_data.get("images", [])
        
        if image_url in images:
            images.remove(image_url)
            product_ref.update({
                "images": images,
                "updated_at": datetime.utcnow().isoformat()
            })
        
        return {"status": "success", "message": "Image deleted successfully"}
    except Exception as e:
        print(f"Delete image error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a product"""
    try:
        db.collection("project62").document("products").collection("all").document(product_id).delete()
        return {"status": "success", "message": "Product deleted successfully"}
    except Exception as e:
        print(f"Delete product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Category Management (Admin)
# ========================

@router.get("/admin/categories")
async def get_all_categories(current_user: dict = Depends(get_current_admin)):
    """Get all product categories"""
    try:
        categories_ref = db.collection("project62").document("categories").collection("all")
        categories = [doc.to_dict() for doc in categories_ref.stream()]
        categories.sort(key=lambda x: x.get("name", ""))
        return {"categories": categories, "count": len(categories)}
    except Exception as e:
        print(f"Get categories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/categories")
async def create_category(category: CategoryRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new category"""
    try:
        # Generate slug from name if not provided
        slug = category.slug or category.name.lower().replace(" ", "-").replace("'", "").replace(",", "")
        category_id = str(uuid.uuid4())
        
        # Check if slug already exists
        categories_ref = db.collection("project62").document("categories").collection("all")
        existing_categories = [doc.to_dict() for doc in categories_ref.stream()]
        if any(c.get("slug") == slug for c in existing_categories):
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
        
        category_data = {
            "category_id": category_id,
            "name": category.name,
            "slug": slug,
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.collection("project62").document("categories").collection("all").document(category_id).set(category_data)
        
        print(f"✅ Category created: {category.name} (slug: {slug})")
        return {"status": "success", "category_id": category_id, "category": category_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create category error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, category: CategoryRequest, current_user: dict = Depends(get_current_admin)):
    """Update a category"""
    try:
        category_ref = db.collection("project62").document("categories").collection("all").document(category_id)
        category_doc = category_ref.get()
        
        if not category_doc.exists:
            raise HTTPException(status_code=404, detail="Category not found")
        
        update_data = {
            "name": category.name,
            "slug": category.slug or category.name.lower().replace(" ", "-").replace("'", "").replace(",", "")
        }
        
        category_ref.update(update_data)
        return {"status": "success", "message": "Category updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update category error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a category"""
    try:
        db.collection("project62").document("categories").collection("all").document(category_id).delete()
        return {"status": "success", "message": "Category deleted successfully"}
    except Exception as e:
        print(f"Delete category error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# Subscription Config Management (Admin)
# ========================

@router.get("/admin/subscriptions")
async def get_all_subscriptions(current_user: dict = Depends(get_current_admin)):
    """Get all meal-prep subscription plans"""
    try:
        subscriptions_ref = db.collection("project62").document("subscriptions_config").collection("all")
        subscriptions = [doc.to_dict() for doc in subscriptions_ref.stream()]
        subscriptions.sort(key=lambda x: x.get("plan_name", ""))
        return {"subscriptions": subscriptions, "count": len(subscriptions)}
    except Exception as e:
        print(f"Get subscriptions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/subscriptions")
async def create_subscription(subscription: SubscriptionConfigRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new subscription plan"""
    try:
        subscription_id = str(uuid.uuid4())
        
        subscription_data = {
            "subscription_id": subscription_id,
            "plan_name": subscription.plan_name,
            "pricing_tiers": subscription.pricing_tiers,  # Array of {weeks: int, price_per_meal: float}
            "meals_per_day": subscription.meals_per_day,
            "delivery_fee": float(subscription.delivery_fee),
            "description": subscription.description,
            "is_active": subscription.is_active if subscription.is_active is not None else True,
            "stripe_plan_id": subscription.stripe_plan_id,
            "image_url": subscription.image_url,
            "auto_renew_enabled": subscription.auto_renew_enabled if subscription.auto_renew_enabled is not None else False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        print(f"🍱 Creating subscription plan: {subscription.plan_name}")
        print(f"   Meals per day: {subscription.meals_per_day}")
        print(f"   Pricing tiers: {subscription.pricing_tiers}")
        print(f"   Delivery fee: ${subscription.delivery_fee}")
        print(f"   Auto-renew: {subscription_data['auto_renew_enabled']}")
        
        db.collection("project62").document("subscriptions_config").collection("all").document(subscription_id).set(subscription_data)
        
        print(f"✅ Subscription plan created successfully: {subscription_id}")
        
        return {"status": "success", "subscription_id": subscription_id, "subscription": subscription_data}
    except Exception as e:
        print(f"❌ Create subscription error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: str, subscription: SubscriptionConfigUpdateRequest, current_user: dict = Depends(get_current_admin)):
    """Update subscription plan details"""
    try:
        subscription_ref = db.collection("project62").document("subscriptions_config").collection("all").document(subscription_id)
        subscription_doc = subscription_ref.get()
        
        if not subscription_doc.exists:
            raise HTTPException(status_code=404, detail="Subscription plan not found")
        
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if subscription.plan_name is not None:
            update_data["plan_name"] = subscription.plan_name
        if subscription.pricing_tiers is not None:
            update_data["pricing_tiers"] = subscription.pricing_tiers
        if subscription.meals_per_day is not None:
            update_data["meals_per_day"] = subscription.meals_per_day
        if subscription.delivery_fee is not None:
            update_data["delivery_fee"] = float(subscription.delivery_fee)
        if subscription.description is not None:
            update_data["description"] = subscription.description
        if subscription.is_active is not None:
            update_data["is_active"] = subscription.is_active
        if subscription.stripe_plan_id is not None:
            update_data["stripe_plan_id"] = subscription.stripe_plan_id
        if subscription.image_url is not None:
            update_data["image_url"] = subscription.image_url
        if subscription.auto_renew_enabled is not None:
            update_data["auto_renew_enabled"] = subscription.auto_renew_enabled
        
        subscription_ref.update(update_data)
        
        return {"status": "success", "message": "Subscription plan updated successfully", "updates": update_data}
    except Exception as e:
        print(f"Update subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a subscription plan"""
    try:
        db.collection("project62").document("subscriptions_config").collection("all").document(subscription_id).delete()
        return {"status": "success", "message": "Subscription plan deleted successfully"}
    except Exception as e:
        print(f"Delete subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/subscriptions/{subscription_id}/upload-image")
async def upload_subscription_image(subscription_id: str, request: Request, current_user: dict = Depends(get_current_admin)):
    """Upload image for subscription plan"""
    try:
        from fastapi import File, UploadFile, Form
        
        # Get the uploaded file from request
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"subscriptions/images/{subscription_id}/{file.filename}")
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        
        # Update subscription with image URL
        subscription_ref = db.collection("project62").document("subscriptions_config").collection("all").document(subscription_id)
        subscription_ref.update({
            "image_url": blob.public_url,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "image_url": blob.public_url}
    except Exception as e:
        print(f"Upload subscription image error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Public Subscriptions Endpoint (for Landing Page)
# ========================

@router.get("/subscriptions/active")
async def get_active_subscriptions():
    """Get active subscription plans for landing page"""
    try:
        subscriptions_ref = db.collection("project62").document("subscriptions_config").collection("all")
        subscriptions = [doc.to_dict() for doc in subscriptions_ref.stream()]
        
        # Filter: only active subscriptions
        active_subscriptions = [
            s for s in subscriptions 
            if s.get("is_active", False)
        ]
        
        # Sort by plan_name
        active_subscriptions.sort(key=lambda x: x.get("plan_name", ""))
        
        print(f"🍱 Active subscriptions found: {len(active_subscriptions)}")
        for s in active_subscriptions:
            print(f"   - {s.get('plan_name')}: ${s.get('price_per_meal')}/meal, weeks: {s.get('weeks_available')}")
        
        return {"subscriptions": active_subscriptions, "count": len(active_subscriptions)}
    except Exception as e:
        print(f"Get active subscriptions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# Customer Subscription Management
# ========================

@router.get("/customer/subscription")
async def get_customer_subscription(current_user: dict = Depends(get_current_user)):
    """Get ALL customer subscriptions with loyalty info"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_email = current_user["email"]
        
        print(f"🔍 Fetching subscriptions for customer_email: {customer_email}")
        
        # Get ALL subscriptions for this customer
        subscriptions_ref = db.collection("project62").document("subscriptions").collection("active")
        subscriptions_query = subscriptions_ref.where("customer_email", "==", customer_email).stream()
        
        subscriptions = []
        total_weeks = 0
        total_points = 0
        
        for sub_doc in subscriptions_query:
            sub_data = sub_doc.to_dict()
            weeks = sub_data.get("duration_weeks", 0)
            meals_per_day = sub_data.get("meals_per_day", 1)
            points = weeks * meals_per_day
            
            total_weeks += weeks
            total_points += points
            subscriptions.append(sub_data)
            print(f"  ✅ Found subscription: {sub_data.get('subscription_id')} - {weeks} weeks × {meals_per_day} meals/day = {points} points")
        
        print(f"  📊 Total subscriptions: {len(subscriptions)}, Total weeks: {total_weeks}, Total points: {total_points}")
        
        # Sort by start_date
        subscriptions.sort(key=lambda x: x.get("start_date", ""))
        
        # Get customer data for order history
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        customer_data = customer_doc.to_dict() if customer_doc.exists else {}
        
        # Calculate loyalty tier based on POINTS (weeks × meals_per_day)
        # Bronze: 0-6 points
        # Silver: 7-24 points (5% off meal price)
        # Gold: 25-48 points (10% off meal price + free delivery + flexible delivery)
        # Platinum: 49+ points (10% off meal price + free delivery + flexible delivery)
        loyalty_tier = "Bronze"
        loyalty_discount = 0
        free_delivery = False
        
        if total_points >= 49:
            loyalty_tier = "Platinum"
            loyalty_discount = 10
            free_delivery = True
        elif total_points >= 25:
            loyalty_tier = "Gold"
            loyalty_discount = 10
            free_delivery = False  # Gold does not have free delivery
        elif total_points >= 7:
            loyalty_tier = "Silver"
            loyalty_discount = 5
            free_delivery = False
        
        # Get orders for this customer
        orders_ref = db.collection("project62").document("orders").collection("all")
        orders_query = orders_ref.where("customer_email", "==", customer_email).stream()
        orders = [order.to_dict() for order in orders_query]
        orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        print(f"  📦 Found {len(orders)} orders for customer")
        for order in orders:
            print(f"     - Order {order.get('order_id')}: Type={order.get('product_type')}, Amount=${order.get('total_amount')}, Status={order.get('payment_status')}")
        
        response = {
            "status": "active" if len(subscriptions) > 0 else "no_subscription",
            "subscription": subscriptions[0] if len(subscriptions) > 0 else None,  # Keep backward compatibility
            "subscriptions": subscriptions,  # Return ALL subscriptions (not just one)
            "subscription_count": len(subscriptions),
            "customer": customer_data,
            "orders": orders,
            "loyalty": {
                "tier": loyalty_tier,
                "total_weeks": total_weeks,
                "total_points": total_points,
                "discount": loyalty_discount,
                "free_delivery": free_delivery,
                "priority_dish": loyalty_tier in ["Gold", "Platinum"]
            }
        }
        
        return response
    except Exception as e:
        print(f"Get customer subscription error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer/subscription/upgrade")
async def upgrade_subscription(
    new_commitment_weeks: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Upgrade/downgrade customer subscription
    Takes effect at next billing cycle
    """
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer_data = customer_doc.to_dict()
        subscription = customer_data.get("subscription", {})
        
        if not subscription:
            raise HTTPException(status_code=400, detail="No active subscription")
        
        # Get the subscription plan to find new pricing
        plan_id = subscription.get("plan_id")
        plan_ref = db.collection("project62").document("subscriptions_config").collection("all").document(plan_id)
        plan_doc = plan_ref.get()
        
        if not plan_doc.exists:
            raise HTTPException(status_code=404, detail="Subscription plan not found")
        
        plan_data = plan_doc.to_dict()
        pricing_tiers = plan_data.get("pricing_tiers", [])
        
        # Find the price for new commitment
        new_tier = next((t for t in pricing_tiers if t["weeks"] == new_commitment_weeks), None)
        if not new_tier:
            raise HTTPException(status_code=400, detail=f"No pricing tier for {new_commitment_weeks} weeks")
        
        # Update subscription for next cycle
        subscription["pending_upgrade"] = {
            "commitment_weeks": new_commitment_weeks,
            "price_per_meal": new_tier["price_per_meal"],
            "effective_date": subscription.get("next_billing_date")
        }
        
        customer_ref.update({
            "subscription": subscription,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {
            "status": "success",
            "message": f"Upgrade scheduled to {new_commitment_weeks} weeks at next billing",
            "effective_date": subscription.get("next_billing_date"),
            "new_price": new_tier["price_per_meal"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upgrade subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer/subscription/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel auto-renewal (subscription continues until end of current period)"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer_data = customer_doc.to_dict()
        subscription = customer_data.get("subscription", {})
        
        if not subscription:
            raise HTTPException(status_code=400, detail="No active subscription")
        
        # Turn off auto-renewal
        subscription["auto_renew"] = False
        subscription["cancelled_at"] = datetime.utcnow().isoformat()
        
        customer_ref.update({
            "subscription": subscription,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {
            "status": "success",
            "message": "Auto-renewal cancelled. Your subscription will end after the current period.",
            "end_date": subscription.get("next_billing_date")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Cancel subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Admin Renewal Processing
# ========================

@router.post("/admin/process-renewals")
async def process_renewals(current_user: dict = Depends(get_current_admin)):
    """
    Process upcoming subscription renewals
    Detects renewals due in 1-2 days, creates Stripe session, updates loyalty
    """
    try:
        from datetime import timedelta
        
        # Get all customers with active subscriptions
        customers_ref = db.collection("project62").document("customers").collection("all")
        customers = [doc for doc in customers_ref.stream()]
        
        today = datetime.utcnow().date()
        renewals_processed = []
        errors = []
        
        for customer_doc in customers:
            customer_data = customer_doc.to_dict()
            subscription = customer_data.get("subscription", {})
            
            # Skip if no subscription or auto-renew is off
            if not subscription or not subscription.get("auto_renew"):
                continue
            
            # Parse next billing date
            next_billing_str = subscription.get("next_billing_date")
            if not next_billing_str:
                continue
            
            try:
                next_billing_date = datetime.fromisoformat(next_billing_str).date()
            except:
                continue
            
            # Check if renewal is due in 1-2 days
            days_until = (next_billing_date - today).days
            if days_until < 1 or days_until > 2:
                continue
            
            # Process renewal
            try:
                customer_id = customer_doc.id
                customer_email = customer_data.get("email")
                
                # Get subscription config for pricing
                plan_id = subscription.get("plan_id")
                commitment_weeks = subscription.get("commitment_weeks", 4)
                price_per_meal = subscription.get("price_per_meal", 12.00)
                meals_per_day = subscription.get("meals_per_day", 1)
                delivery_fee = subscription.get("delivery_fee", 20.00)
                
                # Check for pending upgrade
                if subscription.get("pending_upgrade"):
                    upgrade = subscription["pending_upgrade"]
                    commitment_weeks = upgrade["commitment_weeks"]
                    price_per_meal = upgrade["price_per_meal"]
                
                # Apply loyalty discount
                loyalty_discount = customer_data.get("loyalty_discount", 0)
                free_delivery = customer_data.get("free_delivery", False)
                
                discounted_price, final_delivery = apply_loyalty_discount(
                    price_per_meal, 
                    loyalty_discount, 
                    free_delivery, 
                    delivery_fee
                )
                
                # Calculate total
                total_meals = commitment_weeks * meals_per_day * 6  # 6 days per week
                meal_cost = total_meals * discounted_price
                total_cost = meal_cost + (commitment_weeks * final_delivery)
                
                # TODO: Create Stripe checkout session here
                # stripe_session = stripe.checkout.Session.create(...)
                
                # Update customer loyalty tier
                loyalty_update = update_customer_loyalty_tier(customer_id, commitment_weeks)
                
                # Update subscription for next cycle
                new_next_billing = next_billing_date + timedelta(weeks=commitment_weeks)
                subscription["next_billing_date"] = new_next_billing.isoformat()
                subscription["last_renewal_date"] = today.isoformat()
                if subscription.get("pending_upgrade"):
                    del subscription["pending_upgrade"]
                
                # Save updated subscription
                customer_doc.reference.update({
                    "subscription": subscription,
                    "updated_at": datetime.utcnow().isoformat()
                })
                
                renewals_processed.append({
                    "customer_id": customer_id,
                    "email": customer_email,
                    "commitment_weeks": commitment_weeks,
                    "total_cost": total_cost,
                    "loyalty_tier": loyalty_update.get("tier") if loyalty_update else None,
                    "new_billing_date": new_next_billing.isoformat()
                })
                
                print(f"✅ Processed renewal for {customer_email}")
                print(f"   Weeks: {commitment_weeks}, Total: ${total_cost}")
                if loyalty_update:
                    print(f"   New tier: {loyalty_update['tier']}")
                
            except Exception as e:
                errors.append({
                    "customer_id": customer_doc.id,
                    "error": str(e)
                })
                print(f"❌ Error processing renewal for {customer_doc.id}: {e}")
        
        # Log to Firestore
        log_id = str(uuid.uuid4())
        log_data = {
            "log_id": log_id,
            "executed_at": datetime.utcnow().isoformat(),
            "executed_by": current_user["email"],
            "total_processed": len(renewals_processed),
            "total_errors": len(errors),
            "details": renewals_processed,
            "errors": errors
        }
        db.collection("project62").document("ops").collection("renewal_logs").document(log_id).set(log_data)
        
        print(f"📝 Renewal log saved: {log_id}")
        
        return {
            "status": "success",
            "renewals_processed": len(renewals_processed),
            "details": renewals_processed,
            "errors": errors,
            "log_id": log_id
        }
    except Exception as e:
        print(f"Process renewals error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Public Products Endpoint (for Shop Page)
# ========================

@router.get("/products")
async def get_public_products(
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "newest",  # newest, price_low, price_high, name
    limit: Optional[int] = 12,
    offset: Optional[int] = 0
):
    """Get public products with filtering, searching, sorting, and pagination"""
    try:
        # Get all public and member-only products (hidden excluded)
        products_ref = db.collection("project62").document("products").collection("all")
        products = [doc.to_dict() for doc in products_ref.stream()]
        
        # Filter: only active products with public or member-only visibility
        products = [p for p in products if p.get("active", True) and p.get("visibility") in ["public", "member-only"]]
        
        # Apply category filter
        if category:
            products = [p for p in products if p.get("category") == category]
        
        # Apply type filter
        if type:
            products = [p for p in products if p.get("type") == type]
        
        # Apply search filter (name, description, tags)
        if search:
            search_lower = search.lower()
            products = [
                p for p in products 
                if search_lower in p.get("name", "").lower() 
                or search_lower in p.get("description", "").lower()
                or any(search_lower in tag.lower() for tag in p.get("tags", []))
            ]
        
        # Sort products
        if sort_by == "price_low":
            products.sort(key=lambda x: x.get("price", 0))
        elif sort_by == "price_high":
            products.sort(key=lambda x: x.get("price", 0), reverse=True)
        elif sort_by == "name":
            products.sort(key=lambda x: x.get("name", "").lower())
        else:  # newest (default)
            products.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Get total count before pagination
        total_count = len(products)
        
        # Apply pagination
        products = products[offset:offset+limit]
        
        return {
            "products": products,
            "count": len(products),
            "total": total_count,
            "offset": offset,
            "limit": limit
        }
    except Exception as e:
        print(f"Get public products error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/featured")
async def get_featured_products():
    """Get featured products for landing page"""
    try:
        products_ref = db.collection("project62").document("products").collection("all")
        products = [doc.to_dict() for doc in products_ref.stream()]
        
        print(f"🔍 Total products in DB: {len(products)}")
        
        # Filter: only active, featured, public products
        featured_products = [
            p for p in products 
            if p.get("active", True) 
            and p.get("is_featured", False) 
            and p.get("visibility") == "public"
        ]
        
        print(f"🔍 Featured products found: {len(featured_products)}")
        for p in featured_products:
            print(f"   - {p.get('name')}: featured={p.get('is_featured')}, order={p.get('featured_order')}, visibility={p.get('visibility')}, active={p.get('active')}")
        
        # Sort by featured_order
        featured_products.sort(key=lambda x: x.get("featured_order", 999))
        
        return {"products": featured_products, "count": len(featured_products)}
    except Exception as e:
        print(f"Get featured products error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# Discount Code Management (Admin)
# ========================

@router.get("/admin/discount-codes")
async def get_all_discount_codes(current_user: dict = Depends(get_current_admin)):
    """Get all discount codes"""
    try:
        codes_ref = db.collection("project62").document("discount_codes").collection("all")
        codes = [doc.to_dict() for doc in codes_ref.stream()]
        codes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"discount_codes": codes}
    except Exception as e:
        print(f"Get discount codes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/discount-codes")
async def create_discount_code(discount: DiscountCodeRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new discount code"""
    try:
        code_id = discount.code.upper().replace(" ", "")
        
        # Check if code already exists
        existing_code = db.collection("project62").document("discount_codes").collection("all").document(code_id).get()
        if existing_code.exists:
            raise HTTPException(status_code=400, detail="Discount code already exists")
        
        code_data = {
            "code_id": code_id,
            "code": code_id,
            "percentage": discount.percentage,
            "description": discount.description or "",
            "expires_at": discount.expires_at,
            "max_uses": discount.max_uses,
            "current_uses": 0,
            "active": discount.active,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.collection("project62").document("discount_codes").collection("all").document(code_id).set(code_data)
        
        return {"status": "success", "code_id": code_id, "discount_code": code_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Create discount code error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/discount-codes/{code_id}")
async def update_discount_code(code_id: str, active: bool, current_user: dict = Depends(get_current_admin)):
    """Update discount code (toggle active status)"""
    try:
        code_ref = db.collection("project62").document("discount_codes").collection("all").document(code_id.upper())
        code_ref.update({
            "active": active,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "message": "Discount code updated successfully"}
    except Exception as e:
        print(f"Update discount code error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/discount-codes/{code_id}")
async def delete_discount_code(code_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a discount code"""
    try:
        db.collection("project62").document("discount_codes").collection("all").document(code_id.upper()).delete()
        return {"status": "success", "message": "Discount code deleted successfully"}
    except Exception as e:
        print(f"Delete discount code error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Customer Discount Code Validation
# ========================

@router.post("/validate-discount")
async def validate_discount_code(request: ValidateDiscountRequest):
    """Validate a discount code and return discount amount"""
    try:
        code_id = request.code.upper().replace(" ", "")
        
        code_ref = db.collection("project62").document("discount_codes").collection("all").document(code_id)
        code_doc = code_ref.get()
        
        if not code_doc.exists:
            raise HTTPException(status_code=404, detail="Invalid discount code")
        
        code_data = code_doc.to_dict()
        
        # Check if active
        if not code_data.get("active", False):
            raise HTTPException(status_code=400, detail="This discount code is no longer active")
        
        # Check expiry
        if code_data.get("expires_at"):
            expiry_date = datetime.fromisoformat(code_data["expires_at"])
            if datetime.utcnow() > expiry_date:
                raise HTTPException(status_code=400, detail="This discount code has expired")
        
        # Check usage limit
        if code_data.get("max_uses"):
            if code_data.get("current_uses", 0) >= code_data["max_uses"]:
                raise HTTPException(status_code=400, detail="This discount code has reached its usage limit")
        
        # Calculate discount
        percentage = code_data.get("percentage", 0)
        discount_amount = (request.amount * percentage) / 100
        final_amount = request.amount - discount_amount
        
        return {
            "status": "success",
            "valid": True,
            "percentage": percentage,
            "discount_amount": round(discount_amount, 2),
            "final_amount": round(final_amount, 2),
            "code": code_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Validate discount code error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply-discount/{code_id}")
async def apply_discount_code(code_id: str):
    """Increment usage count for a discount code (called after successful payment)"""
    try:
        code_ref = db.collection("project62").document("discount_codes").collection("all").document(code_id.upper())
        code_doc = code_ref.get()
        
        if code_doc.exists:
            current_uses = code_doc.to_dict().get("current_uses", 0)
            code_ref.update({
                "current_uses": current_uses + 1,
                "last_used_at": datetime.utcnow().isoformat()
            })
        
        return {"status": "success"}
    except Exception as e:
        print(f"Apply discount code error: {e}")
        return {"status": "error", "message": str(e)}

# ========================
# Stripe Webhook Handler (Verified with Signature)
# ========================

@router.post("/webhook/stripe")
async def handle_stripe_webhook(request: Request):
    """
    Handle Stripe webhooks with signature verification and idempotency
    Events: checkout.session.completed, invoice.payment_succeeded, 
            invoice.payment_failed, customer.subscription.deleted
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            print("❌ Invalid webhook payload")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            print("❌ Invalid webhook signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        event_type = event["type"]
        event_id = event["id"]
        data = event["data"]["object"]
        
        print(f"🎯 Webhook received: {event_type} (ID: {event_id})")
        
        # ✅ Ensure idempotency using event_id
        event_ref = db.collection("project62").document("ops").collection("stripe_events").document(event_id)
        event_doc = event_ref.get()
        
        if event_doc.exists:
            print(f"⚠️  Duplicate event {event_id} - already processed")
            return {"status": "duplicate", "event_id": event_id}
        
        # Log the event
        event_ref.set({
            "event_id": event_id,
            "type": event_type,
            "created_at": datetime.utcnow().isoformat(),
            "processed": False,
            "data_summary": {
                "id": data.get("id"),
                "amount_total": data.get("amount_total"),
                "currency": data.get("currency"),
                "payment_status": data.get("payment_status")
            }
        })
        
        # Handle different event types
        if event_type == "checkout.session.completed":
            # Payment completed - process order
            session_id = data.get("id")
            payment_status = data.get("payment_status")
            
            print(f"💳 Checkout completed: {session_id} - Status: {payment_status}")
            
            # Get transaction from Firestore
            transaction_ref = db.collection("project62").document("payment_transactions").collection("all").document(session_id)
            transaction_doc = transaction_ref.get()
            
            if transaction_doc.exists:
                transaction_data = transaction_doc.to_dict()
                
                # Update transaction status
                transaction_ref.update({
                    "payment_status": "paid",
                    "webhook_received": True,
                    "webhook_event_id": event_id,
                    "updated_at": datetime.utcnow().isoformat()
                })
                
                # Process digital product order
                if transaction_data.get("product_type") == "digital" and not transaction_data.get("order_processed"):
                    await process_digital_product_order(transaction_data, session_id)
                    transaction_ref.update({"order_processed": True})
                    print(f"✅ Digital product order processed for session {session_id}")
                
                # Process meal-prep order
                if transaction_data.get("product_type") == "meal_prep" and not transaction_data.get("order_processed"):
                    await process_meal_prep_order(transaction_data, session_id)
                    transaction_ref.update({"order_processed": True})
                    print(f"✅ Meal-prep order processed for session {session_id}")
        
        elif event_type == "invoice.payment_succeeded":
            # Subscription payment succeeded - extend subscription
            invoice_id = data.get("id")
            customer_id = data.get("customer")
            subscription_id = data.get("subscription")
            
            print(f"💰 Invoice paid: {invoice_id} for subscription {subscription_id}")
            
            # TODO: Implement subscription extension and loyalty tier update
            # This would involve:
            # 1. Find customer by Stripe customer_id
            # 2. Update their subscription next_billing_date
            # 3. Increment total_weeks_subscribed
            # 4. Update loyalty tier
        
        elif event_type == "invoice.payment_failed":
            # Subscription payment failed - alert customer
            invoice_id = data.get("id")
            customer_email = data.get("customer_email")
            
            print(f"⚠️  Payment failed: {invoice_id} for {customer_email}")
            
            # TODO: Send notification email to customer about payment failure
        
        elif event_type == "customer.subscription.deleted":
            # Subscription cancelled
            subscription_id = data.get("id")
            customer_id = data.get("customer")
            
            print(f"🚫 Subscription cancelled: {subscription_id}")
            
            # TODO: Update customer subscription status to cancelled
        
        # Mark event as processed
        event_ref.update({"processed": True, "processed_at": datetime.utcnow().isoformat()})
        
        return {"status": "success", "event_id": event_id, "type": event_type}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
        
        return {"status": "success"}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ========================
# Public Subscriptions API (Dynamic Frontend Data)
# ========================

@router.get("/subscriptions/public")
async def get_public_subscriptions():
    """Get all active subscription plans for shop/checkout pages"""
    try:
        subscriptions_ref = db.collection("project62").document("subscriptions_config").collection("all")
        subscriptions = [doc.to_dict() for doc in subscriptions_ref.stream()]
        
        # Filter: only active subscriptions
        active_subscriptions = [
            s for s in subscriptions 
            if s.get("is_active", False)
        ]
        
        # Sort by plan_name
        active_subscriptions.sort(key=lambda x: x.get("plan_name", ""))
        
        return {"subscriptions": active_subscriptions, "count": len(active_subscriptions)}
    except Exception as e:
        print(f"Get public subscriptions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate-coupon")
async def validate_coupon(req: ValidateCouponRequest):
    """Validate coupon code (no auth required for checkout)"""
    try:
        coupon_code = req.code.upper()
        
        # Check if coupon exists in Firestore
        coupons_ref = db.collection("project62").document("coupons").collection("active")
        coupon_doc = coupons_ref.document(coupon_code).get()
        
        if not coupon_doc.exists:
            return {"valid": False, "message": "Invalid coupon code"}
        
        coupon_data = coupon_doc.to_dict()
        
        # Check if coupon is active
        if not coupon_data.get("active", False):
            return {"valid": False, "message": "This coupon is no longer active"}
        
        # Check expiry date
        expiry_date = coupon_data.get("expiry_date")
        if expiry_date:
            from datetime import datetime
            expiry = datetime.fromisoformat(expiry_date.replace('Z', '+00:00') if 'Z' in expiry_date else expiry_date)
            if datetime.utcnow() > expiry:
                return {"valid": False, "message": "This coupon has expired"}
        
        # Check usage limit
        usage_limit = coupon_data.get("usage_limit")
        times_used = coupon_data.get("times_used", 0)
        if usage_limit and times_used >= usage_limit:
            return {"valid": False, "message": "This coupon has reached its usage limit"}
        
        return {
            "valid": True,
            "coupon": {
                "code": coupon_code,
                "type": coupon_data.get("type", "percentage"),  # percentage or fixed
                "value": coupon_data.get("value", 0),
                "description": coupon_data.get("description", "")
            }
        }
    except Exception as e:
        print(f"Coupon validation error: {e}")
        return {"valid": False, "message": "Error validating coupon"}

@router.get("/subscriptions/{plan_id}")
async def get_subscription_by_id(plan_id: str):
    """Get single subscription plan by ID"""
    try:
        subscription_ref = db.collection("project62").document("subscriptions_config").collection("all").document(plan_id)
        subscription_doc = subscription_ref.get()
        
        if not subscription_doc.exists:
            raise HTTPException(status_code=404, detail="Subscription plan not found")
        
        subscription_data = subscription_doc.to_dict()
        
        if not subscription_data.get("is_active", False):
            raise HTTPException(status_code=404, detail="Subscription plan not available")
        
        return {"subscription": subscription_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Product Detail API (Dynamic Frontend Data)
# ========================

@router.get("/products/{product_slug}")
async def get_product_by_slug(product_slug: str):
    """Get single product by slug for product detail page"""
    try:
        products_ref = db.collection("project62").document("products").collection("all")
        products = [doc for doc in products_ref.stream()]
        
        # Find product by slug
        product_doc = None
        for doc in products:
            if doc.to_dict().get("product_id_slug") == product_slug:
                product_doc = doc
                break
        
        if not product_doc:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product_doc.to_dict()
        
        # Check if product is available
        if not product_data.get("active", True) or product_data.get("visibility") == "hidden":
            raise HTTPException(status_code=404, detail="Product not available")
        
        return {"product": product_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Dishes Management (Admin CRUD)
# ========================

@router.get("/admin/dishes")
async def get_all_dishes(current_user: dict = Depends(get_current_admin)):
    """Get all dishes for admin dashboard"""
    try:
        dishes_ref = db.collection("project62").document("dishes").collection("all")
        dishes = [doc.to_dict() for doc in dishes_ref.stream()]
        dishes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"dishes": dishes, "count": len(dishes)}
    except Exception as e:
        print(f"Get dishes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/dishes")
async def create_dish(dish: DishCreateRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new dish"""
    try:
        dish_id = str(uuid.uuid4())
        
        dish_data = {
            "dish_id": dish_id,
            "dish_name": dish.dish_name,
            "description": dish.description or "",
            "calories": dish.calories,
            "week_assigned": dish.week_assigned,
            "is_available": dish.is_available,
            "image_url": dish.image_url,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.collection("project62").document("dishes").collection("all").document(dish_id).set(dish_data)
        
        print(f"✅ Dish created: {dish.dish_name} (ID: {dish_id})")
        
        return {"status": "success", "dish_id": dish_id, "dish": dish_data}
    except Exception as e:
        print(f"Create dish error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/dishes/{dish_id}")
async def update_dish(dish_id: str, dish: DishUpdateRequest, current_user: dict = Depends(get_current_admin)):
    """Update dish details"""
    try:
        dish_ref = db.collection("project62").document("dishes").collection("all").document(dish_id)
        dish_doc = dish_ref.get()
        
        if not dish_doc.exists:
            raise HTTPException(status_code=404, detail="Dish not found")
        
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if dish.dish_name is not None:
            update_data["dish_name"] = dish.dish_name
        if dish.description is not None:
            update_data["description"] = dish.description
        if dish.calories is not None:
            update_data["calories"] = dish.calories
        if dish.week_assigned is not None:
            update_data["week_assigned"] = dish.week_assigned
        if dish.is_available is not None:
            update_data["is_available"] = dish.is_available
        if dish.image_url is not None:
            update_data["image_url"] = dish.image_url
        
        dish_ref.update(update_data)
        
        return {"status": "success", "message": "Dish updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Update dish error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/dishes/{dish_id}")
async def delete_dish(dish_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a dish"""
    try:
        db.collection("project62").document("dishes").collection("all").document(dish_id).delete()
        return {"status": "success", "message": "Dish deleted successfully"}
    except Exception as e:
        print(f"Delete dish error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/dishes/{dish_id}/upload-image")
async def upload_dish_image(dish_id: str, request: Request, current_user: dict = Depends(get_current_admin)):
    """Upload image for a dish"""
    try:
        from fastapi import File, UploadFile, Form
        
        # Get the uploaded file from request
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"dishes/{dish_id}/{file.filename}")
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        
        # Update dish with image URL
        dish_ref = db.collection("project62").document("dishes").collection("all").document(dish_id)
        dish_ref.update({
            "image_url": blob.public_url,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "image_url": blob.public_url}
    except Exception as e:
        print(f"Upload dish image error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# Renewal Logs (for Admin Dashboard)
# ========================

@router.get("/admin/renewal-logs")
async def get_renewal_logs(current_user: dict = Depends(get_current_admin), limit: int = 10):
    """Get recent renewal processing logs"""
    try:
        logs_ref = db.collection("project62").document("ops").collection("renewal_logs")
        logs = [doc.to_dict() for doc in logs_ref.stream()]
        logs.sort(key=lambda x: x.get("executed_at", ""), reverse=True)
        logs = logs[:limit]
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        print(f"Get renewal logs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve PayNow QR Code Image
@router.get("/assets/paynow-qr")
async def get_paynow_qr():
    """Serve the PayNow QR code image"""
    from fastapi.responses import FileResponse
    qr_path = "/app/backend/project62_assets/ccc_paynow_qr.png"
    if os.path.exists(qr_path):
        return FileResponse(qr_path, media_type="image/png")
    else:
        raise HTTPException(status_code=404, detail="QR code not found")
