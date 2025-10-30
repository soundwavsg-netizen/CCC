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
                "name": req.name
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
                "name": customer_data.get("name", "")
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
                "name": customer_data.get("name", "")
            }
        }
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

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
async def get_all_leads():
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
async def get_all_orders():
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
async def get_all_deliveries():
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
async def get_all_customers():
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
async def update_delivery_status(delivery_id: str, status: str):
    """Update delivery status (pending/delivered)"""
    try:
        delivery_ref = db.collection("project62").document("deliveries").collection("all").document(delivery_id)
        delivery_ref.update({"status": status, "updated_at": datetime.utcnow().isoformat()})
        return {"status": "success", "message": f"Delivery status updated to {status}"}
    except Exception as e:
        print(f"Delivery status update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
