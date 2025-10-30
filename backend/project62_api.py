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
    product_type: str  # "digital" or "physical"
    delivery_charge: Optional[float] = 0  # Only for physical products
    stock_quantity: Optional[int] = None  # Only for physical products

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    delivery_charge: Optional[float] = None
    stock_quantity: Optional[int] = None
    active: Optional[bool] = None

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
        
        response = requests.post(auth_url, json={
            "email": req.email,
            "password": req.password,
            "returnSecureToken": True
        })
        
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
async def get_all_products(current_user: dict = Depends(get_current_admin)):
    """Get all digital products"""
    try:
        products_ref = db.collection("project62").document("digital_products").collection("all")
        products = [doc.to_dict() for doc in products_ref.stream()]
        products.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"products": products}
    except Exception as e:
        print(f"Get products error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/products")
async def create_product(product: ProductCreateRequest, current_user: dict = Depends(get_current_admin)):
    """Create a new product (digital or physical)"""
    try:
        product_id = str(uuid.uuid4())
        product_data = {
            "product_id": product_id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "product_type": product.product_type,  # "digital" or "physical"
            "delivery_charge": product.delivery_charge if product.product_type == "physical" else 0,
            "stock_quantity": product.stock_quantity if product.product_type == "physical" else None,
            "file_url": None if product.product_type == "digital" else "N/A",  # Physical products don't need PDF
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.collection("project62").document("digital_products").collection("all").document(product_id).set(product_data)
        
        return {"status": "success", "product_id": product_id, "product": product_data}
    except Exception as e:
        print(f"Create product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdateRequest, current_user: dict = Depends(get_current_admin)):
    """Update product details"""
    try:
        product_ref = db.collection("project62").document("digital_products").collection("all").document(product_id)
        
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if product.name is not None:
            update_data["name"] = product.name
        if product.description is not None:
            update_data["description"] = product.description
        if product.price is not None:
            update_data["price"] = product.price
        if product.delivery_charge is not None:
            update_data["delivery_charge"] = product.delivery_charge
        if product.stock_quantity is not None:
            update_data["stock_quantity"] = product.stock_quantity
        if product.active is not None:
            update_data["active"] = product.active
        
        product_ref.update(update_data)
        
        return {"status": "success", "message": "Product updated successfully"}
    except Exception as e:
        print(f"Update product error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/products/{product_id}/upload")
async def upload_product_file(product_id: str, request: Request, current_user: dict = Depends(get_current_admin)):
    """Upload PDF file for a product"""
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
        blob = bucket.blob(f"digital_products/{product_id}/{file.filename}")
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        
        # Update product with file URL
        product_ref = db.collection("project62").document("digital_products").collection("all").document(product_id)
        product_ref.update({
            "file_url": blob.public_url,
            "file_name": file.filename,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"status": "success", "file_url": blob.public_url}
    except Exception as e:
        print(f"Upload file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete a product"""
    try:
        db.collection("project62").document("digital_products").collection("all").document(product_id).delete()
        return {"status": "success", "message": "Product deleted successfully"}
    except Exception as e:
        print(f"Delete product error: {e}")
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
