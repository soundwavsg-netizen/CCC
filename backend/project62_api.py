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
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "***REMOVED***")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "project62@gmail.com")
JWT_SECRET = os.getenv("PROJECT62_JWT_SECRET", "***REMOVED***")

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

# ========================
# Helper Functions
# ========================

def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate JWT token for authenticated users"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

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
        success_url = f"{checkout_req.origin_url}/project62/checkout/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
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
        # Validate duration
        if checkout_req.duration not in MEAL_PREP_PRICING:
            raise HTTPException(status_code=400, detail="Invalid duration")
        
        # Validate meals per day
        if checkout_req.meals_per_day not in [1, 2]:
            raise HTTPException(status_code=400, detail="Meals per day must be 1 or 2")
        
        # Calculate pricing
        price_per_meal = MEAL_PREP_PRICING[checkout_req.duration][f"{checkout_req.meals_per_day}_meal{'s' if checkout_req.meals_per_day == 2 else ''}"]
        
        # Calculate total meals
        duration_map = {"1_week": 1, "2_weeks": 2, "4_weeks": 4, "6_weeks": 6}
        weeks = duration_map[checkout_req.duration]
        total_meals = weeks * 6 * checkout_req.meals_per_day  # 6 days per week
        
        # Calculate total
        meal_cost = total_meals * price_per_meal
        delivery_cost = weeks * DELIVERY_FEE
        total_amount = meal_cost + delivery_cost
        
        # Initialize Stripe checkout
        webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create success/cancel URLs
        success_url = f"{checkout_req.origin_url}/project62/checkout/success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
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
                "meals_per_day": str(checkout_req.meals_per_day),
                "name": checkout_req.name,
                "email": checkout_req.email,
                "phone": checkout_req.phone,
                "address": checkout_req.address,
                "start_date": checkout_req.start_date
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
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
            "payment_status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("payment_transactions").collection("all").document(session.session_id).set(transaction_data)
        
        return {"checkout_url": session.url, "session_id": session.session_id}
    
    except Exception as e:
        print(f"Meal-prep checkout error: {e}")
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
        
        # Create order
        order_data = {
            "order_id": order_id,
            "session_id": session_id,
            "customer_name": transaction_data["customer_name"],
            "customer_email": transaction_data["customer_email"],
            "customer_phone": transaction_data["customer_phone"],
            "delivery_address": transaction_data["delivery_address"],
            "duration": transaction_data["duration"],
            "meals_per_day": transaction_data["meals_per_day"],
            "weeks": transaction_data["weeks"],
            "total_amount": transaction_data["total_amount"],
            "start_date": transaction_data["start_date"],
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("orders").collection("all").document(order_id).set(order_data)
        
        # Send notification email to admin
        try:
            admin_email_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>🎉 New Meal-Prep Subscription Order!</h2>
                    <p><strong>Order ID:</strong> {order_id}</p>
                    <p><strong>Customer:</strong> {transaction_data["customer_name"]}</p>
                    <p><strong>Email:</strong> {transaction_data["customer_email"]}</p>
                    <p><strong>Phone:</strong> {transaction_data["customer_phone"]}</p>
                    <p><strong>Delivery Address:</strong> {transaction_data["delivery_address"]}</p>
                    <p><strong>Duration:</strong> {transaction_data["duration"].replace('_', ' ').title()}</p>
                    <p><strong>Meals per Day:</strong> {transaction_data["meals_per_day"]}</p>
                    <p><strong>Total Amount:</strong> ${transaction_data["total_amount"]} SGD</p>
                    <p><strong>Start Date:</strong> {transaction_data["start_date"]}</p>
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
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            sg.send(admin_message)
            print(f"✅ Admin notification sent for order {order_id}")
        except Exception as e:
            print(f"❌ Admin email error: {e}")
        
        # Create customer record (or update if exists)
        customer_id = transaction_data["customer_email"].replace("@", "_at_").replace(".", "_")
        customer_data = {
            "customer_id": customer_id,
            "email": transaction_data["customer_email"],
            "name": transaction_data["customer_name"],
            "phone": transaction_data["customer_phone"],
            "address": transaction_data["delivery_address"],
            "orders": [order_id],
            "last_order_date": datetime.utcnow().isoformat()
        }
        
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        if customer_ref.get().exists:
            # Append order to existing customer
            customer_ref.update({
                "orders": firestore.ArrayUnion([order_id]),
                "last_order_date": datetime.utcnow().isoformat()
            })
        else:
            customer_ref.set(customer_data)
        
        # Create delivery schedule
        start_date = datetime.fromisoformat(transaction_data["start_date"])
        for week_num in range(1, transaction_data["weeks"] + 1):
            delivery_date = start_date + timedelta(weeks=week_num - 1)
            delivery_id = f"{order_id}_week_{week_num}"
            
            delivery_data = {
                "delivery_id": delivery_id,
                "order_id": order_id,
                "customer_id": customer_id,
                "week_number": week_num,
                "delivery_date": delivery_date.isoformat(),
                "delivery_address": transaction_data["delivery_address"],
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            db.collection("project62").document("deliveries").collection("all").document(delivery_id).set(delivery_data)
        
        print(f"✅ Order {order_id} processed successfully")
    except Exception as e:
        print(f"❌ Order processing error: {e}")

# ========================
# Customer Authentication
# ========================

@router.post("/auth/register")
async def register_customer(req: CustomerRegisterRequest):
    """Register new customer with Firebase Auth"""
    try:
        # Create Firebase user
        user = firebase_auth.create_user(
            email=req.email,
            password=req.password,
            display_name=req.name,
            app=project62_app
        )
        
        # Create customer record in Firestore
        customer_id = req.email.replace("@", "_at_").replace(".", "_")
        customer_data = {
            "customer_id": customer_id,
            "firebase_uid": user.uid,
            "email": req.email,
            "name": req.name,
            "phone": req.phone,
            "role": "customer",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("project62").document("customers").collection("all").document(customer_id).set(customer_data)
        
        # Generate JWT token
        token = generate_jwt_token(user.uid, req.email)
        
        return {
            "status": "success",
            "message": "Registration successful",
            "token": token,
            "user": {
                "uid": user.uid,
                "email": req.email,
                "name": req.name,
                "role": "customer"
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
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        auth_data = response.json()
        
        # Get customer data from Firestore
        customer_id = req.email.replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer_data = customer_doc.to_dict()
        
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
        raise HTTPException(status_code=500, detail=str(e))

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
            "deliveries": deliveries[:5],  # Next 5 deliveries
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
    """Get all deliveries for admin dashboard"""
    try:
        deliveries_ref = db.collection("project62").document("deliveries").collection("all")
        deliveries = [doc.to_dict() for doc in deliveries_ref.stream()]
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
    """Get current customer's subscription details with loyalty info"""
    try:
        customer_id = current_user["email"].replace("@", "_at_").replace(".", "_")
        customer_ref = db.collection("project62").document("customers").collection("all").document(customer_id)
        customer_doc = customer_ref.get()
        
        if not customer_doc.exists:
            return {"status": "no_subscription", "subscription": None}
        
        customer_data = customer_doc.to_dict()
        subscription_data = customer_data.get("subscription", {})
        
        # Add loyalty information
        response = {
            "status": "active" if subscription_data.get("auto_renew") else "inactive",
            "subscription": subscription_data,
            "loyalty": {
                "tier": customer_data.get("loyalty_tier", "Bronze"),
                "total_weeks": customer_data.get("total_weeks_subscribed", 0),
                "discount": customer_data.get("loyalty_discount", 0),
                "free_delivery": customer_data.get("free_delivery", False),
                "priority_dish": customer_data.get("priority_dish", False)
            }
        }
        
        return response
    except Exception as e:
        print(f"Get customer subscription error: {e}")
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
# Stripe Webhook Handler
# ========================

@router.post("/webhook/stripe")
async def handle_stripe_webhook(request: Request):
    """Handle Stripe webhooks for payment confirmations"""
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        origin_url = str(request.base_url)
        webhook_url = f"{origin_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        print(f"✅ Webhook received: {webhook_response.event_type} - Session: {webhook_response.session_id}")
        
        # Update transaction status
        if webhook_response.payment_status == "paid":
            transaction_ref = db.collection("project62").document("payment_transactions").collection("all").document(webhook_response.session_id)
            transaction_doc = transaction_ref.get()
            
            if transaction_doc.exists:
                transaction_data = transaction_doc.to_dict()
                transaction_ref.update({
                    "payment_status": "paid",
                    "webhook_received": True,
                    "updated_at": datetime.utcnow().isoformat()
                })
                
                # Process digital product order
                if transaction_data.get("product_type") == "digital" and not transaction_data.get("order_processed"):
                    await process_digital_product_order(transaction_data, webhook_response.session_id)
                    transaction_ref.update({"order_processed": True})
                
                # Process meal-prep order if not already processed
                if transaction_data.get("product_type") == "meal_prep" and not transaction_data.get("order_processed"):
                    await process_meal_prep_order(transaction_data, webhook_response.session_id)
                    transaction_ref.update({"order_processed": True})
        
        return {"status": "success"}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

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
