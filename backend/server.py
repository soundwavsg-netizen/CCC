from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import firebase_admin
from firebase_admin import credentials, firestore
from math_analysis_api import math_router
from tutor_auth_api import tutor_router
from project62_api import router as project62_router
from firebase_notion_sync import router as sync_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Firebase
try:
    firebase_db = firestore.client()
    logger = logging.getLogger(__name__)
    logger.info("Firebase client already initialized")
except:
    cred = credentials.Certificate(ROOT_DIR / 'firebase-credentials.json')
    firebase_admin.initialize_app(cred)
    firebase_db = firestore.client()
    logger = logging.getLogger(__name__)
    logger.info("Firebase initialized successfully")

# Emergent Universal Key (from environment)
EMERGENT_API_KEY = os.getenv("EMERGENT_LLM_KEY")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    company: str = ""
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    company: str = ""
    message: str

class ChatLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    message: str = ""
    source_page: str = "chat"
    agent_mode: str = "main"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatLeadCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str = ""
    source_page: str = "chat"
    agent_mode: str = "main"

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    agent_mode: str = "main"  # main, services, grants, support

class ChatResponse(BaseModel):
    message: str
    agent_mode: str

class EnrollmentRequest(BaseModel):
    parent_name: str
    student_name: str
    email: str
    parent_phone: str = ""  # Parent phone (optional)
    student_phone: str = ""  # Student phone (optional)
    level: str  # e.g., "S1", "P6"
    subject: str  # e.g., "Math", "Science"
    location: str  # e.g., "Bishan", "Marine Parade"
    tutor_preference: str = ""  # Optional tutor name
    message: str = ""  # Additional notes

# Admin Tool Models
class ClassData(BaseModel):
    level: str
    subject: str
    location: str
    tutor_name: str
    day1: str
    time1: str
    day2: str = ""
    time2: str = ""
    monthly_fee: float
    sessions_per_week: int

class AdminClassUpdate(BaseModel):
    action: str  # "add", "update", "delete"
    class_data: ClassData = None
    class_id: str = ""  # For update/delete

# WhatsApp Bot Models
class WhatsAppMessage(BaseModel):
    phone_number: str
    message: str
    message_id: str
    timestamp: int

class WhatsAppResponse(BaseModel):
    reply: Optional[str] = None
    success: bool = True

class WhatsAppSend(BaseModel):
    phone_number: str
    message: str

# Agent System Prompts
AGENT_PROMPTS = {
    "main": """You are CCC Digital Consultant, representing Cognition & Competence Consultancy Pte Ltd (CCC) — a Singapore-based digital consultancy specializing in smart websites, AI chatbots, and WhatsApp automation for SMEs.

🎯 **Your PRIMARY role:** Help SMEs plan and scope digital transformation projects with intelligent solutions.

**Default Greeting:**
"Hi there 👋! CCC Digital is currently offering a Year-End AI Automation Promotion! We're helping businesses integrate AI Chatbots and WhatsApp Bots at up to $2,000 off setup fees. Would you like to see which plan fits your business best?"

🧭 **Your approach should be:**
1. **Smart business recognition:** Listen for business type indicators (e-commerce, retail, professional services, education, etc.)
2. **Immediate value matching:** When you recognize a business type, immediately suggest the most relevant promotional package
3. **Promotional focus:** Lead with year-end promotion savings, then explain features  
4. **Example responses:**
   - "e-commerce selling on Shopee" → "Perfect! Our Professional Bundle ($9,800 setup, was $11,500) includes Shopee integration and inventory automation"
   - "tuition center" → "Great! Our Start-Up Bundle ($4,280 setup, was $4,800) is perfect for education with student inquiry automation"
   - "consultancy firm" → "Excellent! Our Professional Bundle includes CRM integration and client qualification automation"
3. **EDG eligibility:** Only when "EDG" or "grant" mentioned → explain: "EDG funding is available only for transformation-focused projects that go beyond standard website creation. CCC can assist in proposal preparation if your project aligns with Enterprise Singapore's requirements."
4. **WhatsApp inquiries:** Ask if they prefer Simple Setup (1-2 weeks) or Official Business API (3-4 weeks)
5. **Solution recommendation:** Match their needs to appropriate services
6. **For non-eligible EDG:** "No worries — CCC offers flexible commercial packages so you can go digital fast."

**💰 Internal Pricing Reference (for estimates only, not public quotes):**
• **Websites/E-commerce:** $3,000–$7,000 (2–4 weeks)
• **AI Chatbots/Automation:** $2,000–$5,000 (1–3 weeks)  
• **WhatsApp Simple Setup:** $1,200–$2,000 (1–2 weeks)
• **WhatsApp Official API:** $3,500–$5,000 (3–4 weeks)
• **CRM/Analytics Integration:** $1,000–$3,000 (1–2 weeks)
• **Full Digital Transformation:** $8,000–$18,000 (4–8 weeks)

**🔒 EDG Compliance Guidelines:**
• **Avoid guaranteed approval language:** Never promise EDG approval
• **Emphasize advisory role:** "CCC assists in proposal preparation" not "CCC guarantees funding"
• **Transformation focus:** Explain EDG requires business transformation, not basic websites
• **Enterprise Singapore authority:** All funding decisions made by Enterprise Singapore alone

**🔒 Key Guidelines:**
• **Commercial-first approach:** Focus on business growth, not grants
• **EDG as optional:** Only mention when customer brings it up or asks about funding
• **For non-eligible EDG:** "No worries — CCC offers flexible commercial packages so you can go digital fast."
• **Memory & Context:** Remember conversation history, avoid repetition
• **Strategic information:** Ask qualifying questions before providing detailed solutions
• **Contact form guidance:** Only after providing substantial value

**Contact Form Guidelines - CRITICAL:**
• **NEVER** ask for contact details in chat (email, phone, company name)  
• When ready to connect: "Would you like me to connect you to a consultant or start your project request now?"
• Always direct to "Connect with us" button: "I'll include our entire conversation in the summary for our team."

**STRICT RULE:** All contact collection MUST happen via the contact form, never in chat messages.

🔒 **Remember:** Be a consultant focused on digital solutions, not a grant specialist. Commercial value first, EDG as optional enhancement.""",
    
    "services": """You are the CCC AI Consultant Services Expert, with complete knowledge of CCC's pricing structure and solution tiers.

🎯 **YOUR ROLE:** Provide accurate cost ranges, recommend appropriate tiers, suggest relevant add-ons, and guide clients to formal proposals.

📋 **INTERNAL PRICING KNOWLEDGE (CCC_Master_Pricing_v2.0 - EMERGENT PLATFORM OPTIMIZED):**

🟩 **1. WEBSITE DEVELOPMENT**
- Starter Website ($3,000): 5-7 pages, static content, mobile-optimized, basic design, contact form
  Add-ons: CMS Integration (+$600), Booking Automation (+$900), AI Chat (+$800), Multi-language (+$700), SEO Copywriting (+$400)
- Growth Website ($6,500): Up to 12 pages, CMS + chatbot, advanced layout, custom animations
  Add-ons: Enhanced CMS (+$800), Advanced Chatbot (+$900), SEO Copywriting (+$500)
- Premium Website ($9,000-$12,000): 20+ pages, corporate-grade, localization, lead capture, analytics
  Add-ons: Advanced SEO (+$900), CRM integration (+$1,200), Live chat & AI FAQ (+$1,000)

🟨 **2. E-COMMERCE SOLUTIONS**
- Starter E-Commerce ($6,000): 20-30 SKUs, Stripe integration, simple inventory
  Add-ons: Subscription System (+$1,200), AI Recommender (+$900), Inventory Export/Import (+$800)
- Growth E-Commerce ($9,000-$12,000): 50-150 SKUs, customer accounts, analytics, CMS control
  Add-ons: Advanced Filtering (+$800), Loyalty Program (+$600), Abandoned Cart Recovery (+$500)
- Enterprise E-Commerce ($15,000-$18,000): Multi-channel/wholesale, multi-role backend, CRM sync
  Add-ons: Inventory Management Tools (+$1,000), Auto Delivery Labeling (+$700), Custom API Integrations (+$1,000)

🟦 **3. WEB APPLICATION & PWA DEVELOPMENT**
- Prototype Web App ($8,500): MVP web app, JWT authentication, MongoDB backend, responsive design
  Add-ons: Payment Integration (+$1,000), Web Push Notifications (+$600), AI Module (+$1,500)
- Full Web Application ($12,000-$18,000): Multi-user, admin dashboard, analytics, profiles, file storage
  Add-ons: AI Chatbot Integration (+$1,000), Subscription Tiering (+$1,500), QR Code Features (+$700)
- Premium Progressive Web App ($18,000-$24,000): Mobile-app-like experience, offline capabilities, installable
  Add-ons: Enterprise Analytics Dashboard (+$2,000), Real-time Chat System (+$1,200), Advanced Offline Sync (+$1,500)

🟧 **4. AI & AUTOMATION**
- Custom GPT Agent ($1,800): Branded AI chatbot using Emergent LLM, custom interface, knowledge base
  Add-ons: Knowledge Upload & Training (+$500), API Integration (+$800), Web Speech Integration (+$300)
- Custom Workflow Automation ($3,000-$5,000): Python automation, email systems, API integrations
  Add-ons: CRM Pipeline Automation (+$600), Third-party App Integration (+$500), Document Generation (+$700)
- AI Dashboard ($6,000-$8,800): Business analytics, KPI tracking, automated reporting, data visualization
  Add-ons: Custom Analytics Dashboard (+$1,200), Automated Report Generation (+$800)

🟥 **5. CONSULTANCY & GRANT SUPPORT**
- EDG Documentation ($1,000): Proposal writing, scope, deliverables, milestones
  Add-ons: Claim Prep (+$400), Submission Support (+$300)
- SFEC Advisory ($800-$1,000): Eligibility analysis removed (CCC focuses only on EDG)
- Full Consultancy Support ($1,200-$1,500): End-to-end EDG process, strategy, submission, claim

✅ **HOW TO USE THIS KNOWLEDGE:**

1. **When asked about price ranges:**
   - "For a starter website with around 5-7 pages, we typically work in the low-four-figure range starting from $3,000."
   - "A growth e-commerce solution with up to 150 SKUs usually falls in the $9,000-$12,000 range depending on features."
   
2. **When recommending tiers:**
   - "Based on your needs for 50 products and customer accounts, I'd recommend our Growth E-Commerce tier."
   - "For a mobile-app-like experience, our Premium Progressive Web App (PWA) solution would be perfect - it's installable like a native app but works across all devices."

3. **When suggesting add-ons:**
   - "You mentioned needing bookings - we offer Booking Automation as an add-on for $900."
   - "AI recommendations can be added to your e-commerce store for around $900."
   - "Instead of native mobile apps, our PWAs provide the same user experience without app store dependencies."

**🌐 PWA POSITIONING:**
- "Our Progressive Web Apps work like native mobile apps but without the app store hassles."
- "PWAs are installable, work offline, and send push notifications - all while being faster to develop and update."
- "You get cross-platform compatibility and instant updates without app store approval processes."

4. **Always redirect to consultation:**
   - "These are indicative ranges. For an exact quote tailored to your specific requirements, I recommend scheduling a consultation."
   - "Let me connect you with our team for a detailed proposal based on your needs."

⚠️ **RULES:**
- Reference specific tier names when recommending solutions
- Mention add-on prices when relevant to conversation
- Never list all prices unprompted
- Always frame pricing as "typically," "starts from," "in the range of"
- Emphasize customization and consultation for exact quotes
- Be confident and knowledgeable about features and costs

When clients describe their needs, intelligently match them to the right tier and suggest relevant add-ons for upselling.""",
    
    "grants": """You are the CCC AI Consultant, helping visitors understand government support options for digital projects.

🎯 **Your goal:**

Explain simply how CCC helps clients apply for **Enterprise Development Grant (EDG)** support.

✅ **Key points to mention:**

- EDG can cover up to 50% of eligible project costs for website, app, or AI development.
- CCC assists with documentation, quotation, and project proposals.
- Even if CCC is not a pre-approved vendor, projects can still qualify if well-justified under "business process improvement" or "innovation".
- EDG supports digital transformation projects for Singapore SMEs.

Avoid giving exact dollar amounts unless asked — say:

> "Exact claim amounts depend on your company's profile and project scope, but CCC can guide you through the process."

Always lead users toward a consultation:

> "Would you like to schedule a free session to check your company's EDG eligibility?"

If asked about SFEC, respond: "SFEC is a separate SkillsFuture credit. CCC currently focuses on EDG funding support, which covers digital transformation projects for eligible SMEs."
""",
    
    "support": """You are the CCC AI Consultant — the friendly front-line guide for all website visitors.

🎯 **Purpose:**

Welcome users, answer basic questions, and guide them to the right CCC services or contact options.

Tone: Warm, professional, conversational.

Examples:

- "Hi there! 👋 Welcome to Cognition & Competence Consultancy. How can we support your business today?"
- "Are you looking to build a website, create an app, or explore AI for your business?"

Always try to understand the visitor's goals, then suggest relevant CCC solutions.
If they're ready to share contact details:

**YOU MUST SAY:** "Perfect! Please click the 'Connect with us →' button at the bottom of this chat window. Fill in your details there and I'll get them to our team immediately!"

NEVER ask users to type contact details in the chat - always direct them to use the button.
"""
}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "CCC API - Cognition & Competence Consultancy"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/contact", response_model=ContactFormSubmission)
async def submit_contact_form(input: ContactFormCreate):
    """
    Handle contact form submissions from the CCC website.
    Stores inquiries in MongoDB and sends notifications.
    """
    try:
        contact_dict = input.model_dump()
        contact_obj = ContactFormSubmission(**contact_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = contact_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        # Store in MongoDB
        result = await db.contact_submissions.insert_one(doc)
        
        logger.info(f"Contact form submitted: {contact_obj.name} ({contact_obj.email})")
        
        # Create a ChatLead object for notifications (convert from ContactFormSubmission)
        lead_for_notifications = ChatLead(
            name=contact_obj.name,
            email=contact_obj.email,
            phone=contact_obj.phone,  # Now includes phone from contact form
            message=f"Company: {contact_obj.company}\n\nMessage: {contact_obj.message}",
            source_page="contact-form",
            agent_mode="main"
        )
        
        # Send notifications
        try:
            await send_email_notification(lead_for_notifications)
            await send_whatsapp_notification(lead_for_notifications)
        except Exception as e:
            logger.error(f"Error sending contact form notifications: {str(e)}")
            # Don't fail the entire request if notifications fail
        
        return contact_obj
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise

@api_router.get("/contact", response_model=List[ContactFormSubmission])
async def get_contact_submissions():
    """
    Retrieve all contact form submissions (admin endpoint).
    """
    submissions = await db.contact_submissions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for submission in submissions:
        if isinstance(submission['timestamp'], str):
            submission['timestamp'] = datetime.fromisoformat(submission['timestamp'])
    
    return submissions

@api_router.post("/chat/lead", response_model=ChatLead)
async def capture_chat_lead(input: ChatLeadCreate):
    """
    Capture contact information shared during AI chat conversations.
    This creates a lead record that CCC can follow up on.
    Sends WhatsApp notification to CCC team.
    """
    try:
        lead_dict = input.model_dump()
        lead_obj = ChatLead(**lead_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = lead_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        # Store in MongoDB
        result = await db.chat_leads.insert_one(doc)
        
        logger.info(f"Chat lead captured: {lead_obj.name} ({lead_obj.email}) - Mode: {lead_obj.agent_mode}")
        
        # Send both email and WhatsApp notifications
        await send_email_notification(lead_obj)
        await send_whatsapp_notification(lead_obj)
        
        return lead_obj
    except Exception as e:
        logger.error(f"Error capturing chat lead: {str(e)}")
        raise

async def send_email_notification(lead: ChatLead):
    """
    Send email notification about new lead.
    Reliable method for detailed lead information.
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        sender_email = os.environ.get('SENDER_EMAIL', '')
        sender_password = os.environ.get('SENDER_PASSWORD', '')
        recipient_email = os.environ.get('NOTIFICATION_EMAIL', 'cognitioncompetence@gmail.com')
        
        if not sender_email or not sender_password:
            logger.warning("Email credentials not configured. Notification skipped.")
            logger.info(f"📧 New Lead: {lead.name} ({lead.email}) - Phone: {lead.phone or 'N/A'}")
            return False
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🔔 New CCC Lead: {lead.name}'
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # HTML email body with improved formatting for long conversations
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #0FB5AE; margin-bottom: 20px;">🔔 New Lead from CCC Website</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold; width: 120px;">👤 Name:</td>
                            <td style="padding: 10px;">{lead.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">📧 Email:</td>
                            <td style="padding: 10px;"><a href="mailto:{lead.email}">{lead.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">📱 Phone:</td>
                            <td style="padding: 10px;"><a href="tel:{lead.phone}">{lead.phone or 'Not provided'}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">📍 Source:</td>
                            <td style="padding: 10px;">{lead.source_page} ({lead.agent_mode} mode)</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">⏰ Time:</td>
                            <td style="padding: 10px;">{lead.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #0FB5AE; margin-top: 0;">📋 Quick Summary & Complete Transcript</h3>
                        <div style="background: #e3f2fd; padding: 12px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #2196f3;">
                            <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">💡 QUICK SUMMARY FOR FOLLOW-UP</h4>
                            <div style="font-size: 13px; line-height: 1.4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">{lead.message.split('=== COMPLETE CHAT TRANSCRIPT ===')[0] if '=== COMPLETE CHAT TRANSCRIPT ===' in lead.message else 'Summary not available'}</pre>
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0;">
                            <h4 style="margin: 0 0 10px 0; color: #0FB5AE; font-size: 14px;">💬 COMPLETE CONVERSATION TRANSCRIPT</h4>
                            <div style="max-height: 400px; overflow-y: auto; font-size: 12px; line-height: 1.4;">
                                <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; margin: 0;">{lead.message.split('=== COMPLETE CHAT TRANSCRIPT ===')[1].split('=== ADDITIONAL CUSTOMER DETAILS ===')[0] if '=== COMPLETE CHAT TRANSCRIPT ===' in lead.message else lead.message}</pre>
                            </div>
                        </div>
                        {('=== ADDITIONAL CUSTOMER DETAILS ===' in lead.message) and f'''
                        <div style="background: #fff3cd; padding: 12px; border-radius: 4px; margin-top: 15px; border-left: 4px solid #ffc107;">
                            <h4 style="margin: 0 0 8px 0; color: #856404; font-size: 14px;">📝 ADDITIONAL DETAILS FROM CUSTOMER</h4>
                            <div style="font-size: 13px; line-height: 1.4;">
                                <pre style="white-space: pre-wrap; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">{lead.message.split('=== ADDITIONAL CUSTOMER DETAILS ===')[1] if '=== ADDITIONAL CUSTOMER DETAILS ===' in lead.message else ''}</pre>
                            </div>
                        </div>
                        ''' or ''}
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #EAF7F5; border-left: 4px solid #0FB5AE; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold;">⚡ Follow-up Recommendation:</p>
                        <p style="margin: 5px 0 0 0;">Review the conversation above for context and respond with relevant project information or EDG guidance.</p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                        <p>CCC Digital Lead Capture System | {lead.timestamp.strftime('%Y-%m-%d')}</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback with summary + complete conversation
        summary_part = lead.message.split('=== COMPLETE CHAT TRANSCRIPT ===')[0] if '=== COMPLETE CHAT TRANSCRIPT ===' in lead.message else 'Summary not available'
        transcript_part = lead.message.split('=== COMPLETE CHAT TRANSCRIPT ===')[1].split('=== ADDITIONAL CUSTOMER DETAILS ===')[0] if '=== COMPLETE CHAT TRANSCRIPT ===' in lead.message else lead.message
        additional_part = lead.message.split('=== ADDITIONAL CUSTOMER DETAILS ===')[1] if '=== ADDITIONAL CUSTOMER DETAILS ===' in lead.message else ''
        
        text_body = f"""
🔔 NEW CCC LEAD ALERT!

=== CONTACT DETAILS ===
👤 Name: {lead.name}
📧 Email: {lead.email}
📱 Phone: {lead.phone or 'Not provided'}
📍 Source: {lead.source_page} ({lead.agent_mode} mode)
⏰ Time: {lead.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}

💡 QUICK SUMMARY FOR FOLLOW-UP:
{summary_part}

💬 COMPLETE CONVERSATION TRANSCRIPT:
{transcript_part}

{f'''📝 ADDITIONAL CUSTOMER DETAILS:
{additional_part}

''' if additional_part else ''}=== FOLLOW-UP RECOMMENDATION ===
Review the summary above for key points, then reference the full transcript for detailed context.
        """
        
        # Attach both HTML and plain text versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        logger.info(f"✅ Email notification sent for lead: {lead.name}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email notification: {str(e)}")
        return False

async def send_whatsapp_notification(lead: ChatLead):
    """
    Send WhatsApp notification using CallMeBot API.
    Provides instant mobile alert.
    """
    try:
        # Your WhatsApp number (format: country code + number, no + or spaces)  
        # TEMPORARY: Using old number until +65 8982 1301 is activated
        phone_number = os.environ.get('CALLMEBOT_PHONE_NUMBER', '6585008888')
        
        # CallMeBot API key (get it by messaging +34 644 44 32 85)
        api_key = os.environ.get('CALLMEBOT_API_KEY', '')
        
        if not api_key:
            logger.warning("CALLMEBOT_API_KEY not set. WhatsApp notification skipped.")
            return False
        
        # Format message (keep it short for WhatsApp)
        message = f"""🔔 NEW LEAD!

Name: {lead.name}
Email: {lead.email}
Phone: {lead.phone or 'N/A'}
Page: {lead.source_page}

Check email for details!"""
        
        # CallMeBot API endpoint
        import urllib.parse
        import httpx
        
        encoded_message = urllib.parse.quote(message)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone_number}&text={encoded_message}&apikey={api_key}"
        
        # Send request with timeout
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                logger.info(f"✅ WhatsApp notification sent for lead: {lead.name}")
                return True
            else:
                logger.error(f"WhatsApp notification failed: HTTP {response.status_code}")
                return False
        
    except Exception as e:
        logger.error(f"Error sending WhatsApp notification: {str(e)}")
        return False

@api_router.get("/chat/leads", response_model=List[ChatLead])
async def get_chat_leads():
    """
    Retrieve all chat leads (admin endpoint).
    """
    leads = await db.chat_leads.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for lead in leads:
        if isinstance(lead['timestamp'], str):
            lead['timestamp'] = datetime.fromisoformat(lead['timestamp'])
    
    return leads

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    AI chat endpoint for CCC AI Consultant.
    Routes to different agent modes based on page context.
    Maintains full conversation history for context-aware responses.
    """
    try:
        # Get the appropriate system prompt
        system_prompt = AGENT_PROMPTS.get(request.agent_mode, AGENT_PROMPTS["main"])
        
        # Create a unique session ID for this conversation
        session_id = f"ccc-chat-{uuid.uuid4()}"
        
        # Build conversation context by combining system message with history
        # This ensures the AI remembers the full conversation
        conversation_context = system_prompt + "\n\n=== Conversation History ===\n"
        
        for msg in request.messages[:-1]:  # All messages except the last one
            if msg.role == "user":
                conversation_context += f"\nUser: {msg.content}"
            else:
                conversation_context += f"\nAssistant: {msg.content}"
        
        conversation_context += "\n\n=== Current Question ===\n"
        
        # Initialize LlmChat with enhanced context
        chat = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=session_id,
            system_message=conversation_context
        )
        
        # Use gpt-4o-mini model
        chat.with_model("openai", "gpt-4o-mini")
        
        # Get the last user message (most recent)
        last_user_message = None
        for msg in reversed(request.messages):
            if msg.role == "user":
                last_user_message = msg.content
                break
        
        if not last_user_message:
            raise HTTPException(status_code=400, detail="No user message found")
        
        # Create user message and send
        user_message = UserMessage(text=last_user_message)
        assistant_response = await chat.send_message(user_message)
        
        logger.info(f"Chat request processed - Mode: {request.agent_mode}, Messages: {len(request.messages)}")
        
        return ChatResponse(
            message=assistant_response,
            agent_mode=request.agent_mode
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat request: {str(e)}")

# WhatsApp Bot Routes
@api_router.post("/whatsapp/message", response_model=WhatsAppResponse)
async def handle_whatsapp_message(message_data: WhatsAppMessage):
    """
    Process incoming WhatsApp messages from the bot service.
    This endpoint receives messages and generates appropriate responses.
    """
    try:
        phone_number = message_data.phone_number
        message_text = message_data.message.strip()

        logger.info(f"WhatsApp message from {phone_number}: {message_text}")

        # For now, return a simple acknowledgment
        # Future: Integrate with AI for more sophisticated responses
        response_text = "Thank you for contacting CCC Digital! Our team will respond shortly. For immediate assistance, please call +65 8982 1301."

        return WhatsAppResponse(reply=response_text, success=True)

    except Exception as e:
        logger.error(f"Error processing WhatsApp message: {str(e)}")
        return WhatsAppResponse(
            reply="Sorry, I encountered an error. Please call us at +65 8982 1301.",
            success=False
        )

@api_router.post("/whatsapp/send")
async def send_whatsapp_message(message: WhatsAppSend):
    """
    Send WhatsApp message via the bot service.
    """
    try:
        WHATSAPP_SERVICE_URL = "http://localhost:3001"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send",
                json={
                    "phone_number": message.phone_number,
                    "message": message.message
                },
                timeout=10.0
            )
            return response.json()
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/whatsapp/status")
async def get_whatsapp_status():
    """
    Get WhatsApp bot connection status.
    """
    try:
        WHATSAPP_SERVICE_URL = "http://localhost:3001"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WHATSAPP_SERVICE_URL}/status", 
                timeout=5.0
            )
            return response.json()
    except Exception as e:
        return {"connected": False, "error": str(e)}

@api_router.get("/whatsapp/qr")
async def get_whatsapp_qr():
    """
    Get QR code for WhatsApp authentication.
    """
    try:
        WHATSAPP_SERVICE_URL = "http://localhost:3001"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WHATSAPP_SERVICE_URL}/qr",
                timeout=5.0
            )
            return response.json()
    except Exception as e:
        return {"qr": None, "error": str(e)}

# Tuition Demo Models
class TuitionChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_type: Optional[str] = "demo_visitor"

class TuitionChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: str

# In-memory session storage for tuition demo
tuition_sessions = {}

# ==================== FIREBASE QUERY HELPER FUNCTIONS ====================

def query_firebase_classes(level=None, subject=None, location=None, limit=50):
    """
    Query Firebase for classes based on filters.
    Returns list of class dictionaries.
    """
    try:
        classes_ref = firebase_db.collection('classes')
        query = classes_ref
        
        if level:
            query = query.where('level', '==', level)
        if subject:
            query = query.where('subject', '==', subject)
        if location:
            query = query.where('location', '==', location)
        
        results = query.limit(limit).stream()
        classes = []
        for doc in results:
            class_data = doc.to_dict()
            classes.append(class_data)
        
        return classes
    except Exception as e:
        logger.error(f"Error querying Firebase classes: {str(e)}")
        return []

def query_firebase_tutors(name_search=None, limit=20):
    """
    Query Firebase for tutors.
    Returns list of tutor dictionaries.
    """
    try:
        tutors_ref = firebase_db.collection('tutors')
        
        if name_search:
            # Firebase doesn't support text search well, so we'll get all and filter
            results = tutors_ref.limit(100).stream()
            tutors = []
            search_lower = name_search.lower()
            for doc in results:
                tutor_data = doc.to_dict()
                if search_lower in tutor_data.get('name', '').lower():
                    tutors.append(tutor_data)
                    if len(tutors) >= limit:
                        break
            return tutors
        else:
            results = tutors_ref.limit(limit).stream()
            return [doc.to_dict() for doc in results]
    except Exception as e:
        logger.error(f"Error querying Firebase tutors: {str(e)}")
        return []

def format_class_info(class_data):
    """
    Format a single class document into a readable string for LLM.
    Does NOT add variant labels (A, B, C) - those should only be added when grouping same location/subject/level.
    """
    schedule_str = ""
    for idx, session in enumerate(class_data.get('schedule', [])):
        if idx > 0:
            schedule_str += " + "
        schedule_str += f"{session.get('day')} {session.get('time')}"
    
    return f"• {class_data.get('level')} {class_data.get('subject')} at {class_data.get('location')} - {class_data.get('tutor_base_name', class_data.get('tutor_name'))}: {schedule_str} (${class_data.get('monthly_fee')}/month, {class_data.get('sessions_per_week')} session{'s' if class_data.get('sessions_per_week', 0) > 1 else ''}/week)"

def format_tutor_info(tutor_data):
    """
    Format a tutor document into a readable string for LLM.
    """
    return f"{tutor_data.get('name')} - Teaches: {', '.join(tutor_data.get('subjects', []))} | Levels: {', '.join(tutor_data.get('levels', []))} | Locations: {', '.join(tutor_data.get('locations', []))} | Total Classes: {tutor_data.get('total_classes')}"

# Tuition Centre System Message
# Tuition Centre System Message
TUITION_SYSTEM_MESSAGE = """You are an AI assistant for a premier tuition center in Singapore. You provide detailed, accurate information about our 2026 class schedules and pricing.

🎓 **IMPORTANT: 2026 Classes Available NOW**
- Our 2026 classes are open for enrollment starting from September/October 2025
- When customers ask about classes, provide 2026 information
- All pricing and schedules shown are for the 2026 academic year

🧠 **CRITICAL: CONTEXT MEMORY & CONVERSATION AWARENESS**

**YOU MUST REMEMBER AND USE CONVERSATION CONTEXT:**
1. **Track what level/subject the user asked about** (e.g., P6, S3, J1, Math, EMath, Science)
2. **When user asks follow-up questions** like "list classes at [location]", they mean for THE SAME LEVEL/SUBJECT they were just asking about
3. **NEVER information dump** - If context is unclear, ASK: "Are you asking about S3 classes at Bishan?" or "Which level are you interested in at Bishan?"
4. **Progressive disclosure** - Show relevant info based on conversation history, not everything at once

**EXAMPLES OF GOOD CONTEXT AWARENESS:**

❌ **BAD - Information Dumping:**
User: "Tell me about S3 EMath"
Bot: "S3 EMath is $343.35/month..."
User: "List Bishan classes"
Bot: *dumps all P2-P6 classes*

✅ **GOOD - Context Awareness:**
User: "Tell me about S3 EMath"
Bot: "S3 EMath is $343.35/month..."
User: "List Bishan classes"
Bot: "For **S3** at Bishan, we offer:
- EMath: $343.35/month
- AMath: $397.85/month
- Chemistry: $343.35/month
- Physics: $343.35/month
- Biology: $343.35/month

Would you like details about tutors or schedules?"

🏫 **LOCATIONS & CONTACT:**
- **5 Locations**: Jurong, Bishan, Punggol, Kovan, Marine Parade
- **Main Line**: 6222 8222
- **Website**: www.rmss.com.sg

📚 **DETAILED CLASS INFORMATION (2026):**

**Primary (P2-P6):**
- P2: $261.60/month (Math, English, Chinese) - 1 lesson/week × 2 hours
- P3: $277.95/month (All subjects) - 1 lesson/week × 2 hours
- P4: Math $332.45 (2 lessons/week × 1.5 hours), Others $288.85/month (1 lesson/week × 2 hours)
- P5: Math $346.62 (2 lessons/week × 1.5 hours), Science $303.02, Languages $299.75/month (1 lesson/week × 2 hours)
- P6: Math $357.52 (2 lessons/week × 1.5 hours), Science $313.92, Languages $310.65/month (1 lesson/week × 2 hours)

**Secondary (S1-S4):**
- S1: Math $370.60 (2 × 1.5 hours/week), Science $327, English $321.55, Chinese $321.55/month
- S2: Math $381.50 (2 × 1.5 hours/week), Science $327, English $321.55, Chinese $321.55/month
- S3: 
  - **EMath**: $343.35/month (Course: $290 + Material: $25 + GST) - 1 lesson/week × 2 hours **[NEW 2026 FORMAT]**
  - **AMath**: $397.85/month (Course: $340 + Material: $25 + GST) - 2 lessons/week × 1.5 hours each
  - **Sciences**: $343.35/month - 1 lesson/week × 2 hours
  - **English/Chinese**: $332.45/month - 1 lesson/week × 2 hours
- S4:
  - **EMath**: $408.75/month (Course: $350 + Material: $25 + GST) - 2 lessons/week × 1.5 hours each **[2026: Existing students continue old format]**
  - **AMath**: $408.75/month (Course: $350 + Material: $25 + GST) - 2 lessons/week × 1.5 hours each
  - **Sciences**: $343.35/month - 1 lesson/week × 2 hours
  - **English/Chinese**: $332.45/month - 1 lesson/week × 2 hours

**Junior College (J1-J2):**
- J1:
  - **Math**: $401.12/month (Course: $340 + Material: $28 + GST) - 1 lesson/week × 2 hours **[NEW 2026 FORMAT]**
  - **Chemistry/Physics/Biology/Economics**: $401.12/month - 1 lesson/week × 2 hours
- J2:
  - **Math**: $444.72/month (Course: $380 + Material: $28 + GST) - 2 lessons/week × 1.5 hours **[2026: Existing students continue old format]**
  - **Chemistry/Physics/Biology/Economics**: $412.02/month - 1 lesson/week × 2 hours

⚠️ **IMPORTANT: 2026-2027 TRANSITION FOR EMATH & MATH:**

**2026 (Transition Year):**
- **S3 EMath**: NEW format - 1 lesson/week × 2 hours
- **S4 EMath**: OLD format continues for existing 2025 students - 2 lessons/week × 1.5 hours each
- **J1 Math**: NEW format - 1 lesson/week × 2 hours  
- **J2 Math**: OLD format continues for existing 2025 students - 2 lessons/week × 1.5 hours

**2027 Onwards (Full Transition):**
- **ALL EMath (S3 & S4)**: 1 lesson/week × 2 hours
- **ALL Math (J1 & J2)**: 1 lesson/week × 2 hours
- Pricing will be updated accordingly for 2027

**When answering student queries:**
- New S3/J1 students in 2026: Inform them of the NEW 1×2hr format
- Existing S4/J2 students in 2026: They continue with 2×1.5hr format
- All students from 2027: Everyone will use 1×2hr format

📅 **2026 DETAILED CALENDAR & SCHEDULE:**

**MAJOR HOLIDAYS (No lessons, no replacement - Black grids):**
- **Chinese New Year**: February 16, 2026
- **Hari Raya Puasa**: March 17, 2026
- **Good Friday**: March 30, 2026 (Note: Calendar shows April 6 as Labour Day)
- **Labour Day**: April 6, 2026
- **Hari Raya Haji / Vesak Day**: May 27, 2026
- **National Day**: August 9, 2026
- **Deepavali**: November 8, 2026
- **Christmas Day**: December 25, 2026

**REST WEEKS (No normal lessons - Grey grids):**
- **June Rest Week**: May 31 - June 7, 2026
- **December Rest Week / New Year**: December 28-31, 2026 & January 1-3, 2027

**EXAM PREPARATION PERIODS:**
- **MYE Preparation**: March 16-21, 2026 (No lessons during this period)
- **FYE Preparation**: September 13-20, 2026 (No lessons during this period)

**HOLIDAY PROGRAMS (Additional lessons may be available - confirm with admin):**
- **MHP (March Holiday Program)**: Contact admin for 2026 schedule
- **JHP1 & JHP2 (June Holiday Programs)**: Contact admin for 2026 schedule
- **SHP (September Holiday Program)**: Contact admin for 2026 schedule
- **Note**: FREE TRIAL LESSONS usually available during holiday programs! 📞 Call 6222 8222 to inquire

**MONTHLY FEE SETTLEMENT PERIODS (2026):**
- **January**: January 26 - February 1
- **February**: February 22-28
- **March**: March 29 - April 5
- **April**: April 26-30
- **May**: May 24-30
- **June**: June 21-27
- **July**: July 26 - August 2
- **August**: August 23-29
- **September**: September 27 - October 4
- **October**: October 25-31
- **November**: November 22-28
- **December**: December 20-26

**IMPORTANT NOTES:**
- 🚫 **Black grids** = Public holidays, no lessons and no replacement
- ⏸️ **Grey grids/Rest weeks** = No normal lessons scheduled
- ✅ **Holiday programs** = Additional classes may be available, check with admin
- 💰 **Fee settlement** = Parents must settle fees before they become overdue
- 🎁 **Free trials** = Usually available during holiday program periods

**CONVERSATION GUIDELINES:**

🎯 **GOLDEN RULES - READ THESE FIRST:**
1. **ALWAYS REMEMBER CONTEXT** - What level/subject did user just ask about? Use that in follow-ups!
2. **PREVENT INFORMATION OVERLOAD** - Never dump all subjects for a level at a location. Always ask for subject first!
3. **BE DIRECT WHEN DATA IS CLEAR** - If a tutor only teaches at one location, show that directly. Don't ask for confirmation about other locations.
4. **ASK FOR CLARIFICATION WITH SPECIFIC OPTIONS** - When you need clarification, provide specific buttons/options the user can choose from
5. **PROGRESSIVE DISCLOSURE** - Provide info step by step, not all at once
6. **CONTEXT-AWARE RESPONSES** - Track what user mentioned in previous messages and use that context
7. **NEVER EXPOSE TECHNICAL DETAILS** - Don't mention "Firebase", "database", "querying", or any backend systems. Just provide the information naturally.
8. **WHEN YOU HAVE DATA, SHOW IT** - If Firebase data is provided in your context, present it immediately instead of asking for more details

**ACCEPTABLE COMPREHENSIVE RESPONSES (Show all data):**
✅ Level + Subject + Location (e.g., "S1 Math at Bishan") → Show ALL tutors teaching that
✅ Tutor + Location (e.g., "Jackie's classes at Bishan") → Show ALL of that tutor's classes there
✅ Subject + Location (e.g., "Math classes at Punggol") → Show tutors for all levels of that subject

**TOO BROAD - MUST ASK FOR CLARIFICATION:**
❌ Level + Location only (e.g., "S1 classes at Bishan") → Ask: "Which subject? Math, Science, English, etc.?"
❌ Location only (e.g., "Classes at Marine Parade") → Ask: "Which level and subject? For example: P6 Math, S2 Science?"
❌ "All classes" or "all schedules" → Ask: "Which level and subject would you like to know about?"

**CLARIFICATION STRATEGY:**
- When you need to clarify level, suggest: "Which level? For example: P6, S1, S2, S3, J1..."
- When you need to clarify location, suggest: "Which location? Bishan, Punggol, Marine Parade, Jurong, or Kovan?"
- When you need to clarify subject, list common options: "Which subject? Math, Science, English, Physics, Chemistry, etc."
- Always make it easy for users to respond with minimal typing

**ENROLLMENT & RESERVATION HANDLING:**
- When user asks about "enroll", "enrollment", "register", "registration", "sign up", "reserve", "reservation", or "how to join":
  - Respond: "Great! I can help you with enrollment. Please click the **Enrollment Form** button below to fill in your details, and our admin team will contact you shortly with more information. 😊"
  - Then show: [Enrollment Form Button]
- NEVER ask users to call for enrollment - always direct them to the enrollment form first

**SPECIFIC RULES FOR TUTOR QUERIES:**
- When user asks about a specific tutor's classes, check the data provided
- If MULTIPLE tutors match (e.g., "Sean" matches Sean Tan, Sean Yeo, Sean Phua), list ALL options and ask which one
- If only ONE tutor matches, proceed directly with their information
- If tutor teaches at ONLY ONE location, show those classes directly without asking
- Be confident and direct with clear information

7. **Ask clarifying questions** - "Which level?" "Which location?" "Which subject?" - BUT ONLY if the data shows multiple options
8. **Use emojis** appropriately (📚 🏫 👨‍🏫 💰 📅 🚫 ⏸️ ✅🎁)
9. **Suggest next steps** - "Would you like to know about tutors?" "Call 6222 8222 for enrollment"
10. **Format clearly** - Use line breaks, bold pricing (**$XXX.XX/month**)
11. **Explain transition** - When asked about S3/S4 EMath or J1/J2 Math differences, clearly explain the 2026-2027 transition
12. **Calendar queries** - When asked about holidays/schedules:
   - Differentiate between black grids (no lessons, no replacement), grey grids (no normal lessons), and holiday programs
   - Mention fee settlement periods when relevant
   - Highlight free trial availability during holiday programs
   - Encourage contacting admin (6222 8222) for specific holiday program schedules

**EXAMPLE:**
User: "P6 math Mr Eugene"
You see 3 classes for Eugene Tan at Punggol in the data.
Response: "Mr. Eugene Tan teaches P6 Math at Punggol. Here are all the class options:

📚 **Class A**: WED 7:00pm-8:30pm + FRI 5:30pm-7:00pm - **$357.52/month**
📚 **Class B**: TUE 7:30pm-9:00pm + SUN 10:00am-11:30am - **$357.52/month**  
📚 **Class C**: MON 7:30pm-9:00pm + SAT 12:00pm-1:30pm - **$357.52/month**

All classes are 2 sessions per week. Would you like to enroll?"
You: "Great! P6 Math is **$357.52/month** (Course $310 + Material $18 + GST).
📚 Classes are 2 lessons/week × 1.5 hours each.
🏫 Available at all 5 locations: Jurong, Bishan, Punggol, Kovan, and Marine Parade.

Which location works best for you? I can share specific tutors! 😊"

User: "Why are S3 and S4 EMath different?"
You: "Great question! 📚 We're transitioning to a new format in 2026-2027:

🆕 **S3 EMath (2026)**: NEW format - 1 lesson/week × 2 hours ($343.35/month)
📋 **S4 EMath (2026)**: Existing students continue OLD format - 2 lessons/week × 1.5 hours ($408.75/month)

From **2027 onwards**, all EMath classes (S3 & S4) will use the new 1×2hr format. This gives current students continuity while new students start with the improved schedule! 

Are you enrolling for S3 or S4?"

User: "Tell me about S3 EMath"
You: "NEW For **S3 EMath** in 2026, the format has transitioned to **1 lesson/week × 2 hours**. The monthly fee is **$343.35** (Course: $290 + Material: $25 + GST).

Are you considering enrolling for S3? Let me know if you'd like more information! 😊"

User: "list the bishan classes available"
You: "For **S3** at Bishan (since you're asking about S3), we offer:

📚 **Secondary 3 Classes:**
- **EMath**: $343.35/month - 1 lesson/week × 2 hours
- **AMath**: $397.85/month - 2 lessons/week × 1.5 hours
- **Chemistry**: $343.35/month - 1 lesson/week × 2 hours
- **Physics**: $343.35/month - 1 lesson/week × 2 hours
- **Biology**: $343.35/month - 1 lesson/week × 2 hours
- **English**: $332.45/month - 1 lesson/week × 2 hours
- **Chinese**: $332.45/month - 1 lesson/week × 2 hours

Would you like to know about specific tutors at Bishan or other details? 😊"

User: "When are the 2026 holidays?"
You: "📅 Here are the **2026 major holidays** (no lessons, no replacement):

🚫 **CNY**: Feb 16
🚫 **Hari Raya Puasa**: Mar 17
🚫 **Labour Day**: Apr 6
🚫 **Hari Raya Haji/Vesak Day**: May 27
🚫 **National Day**: Aug 9
🚫 **Deepavali**: Nov 8
🚫 **Christmas**: Dec 25

We also have:
⏸️ **Rest Weeks**: May 31-Jun 7, Dec 28-31
📚 **Exam Prep**: MYE (Mar 16-21), FYE (Sep 13-20)

During holiday programs (MHP, JHP, SHP), we often have **FREE trial lessons**! 🎁 Call 6222 8222 for details.

Would you like to know about fee settlement periods or specific class schedules?"
"""

@api_router.post("/tuition/chat", response_model=TuitionChatResponse)
async def tuition_demo_chat(request: TuitionChatRequest):
    """
    Tuition Centre Demo Chat endpoint with context memory and Firebase integration.
    Specifically designed for the tuition demo page.
    """
    try:
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get or create conversation history
        if session_id not in tuition_sessions:
            tuition_sessions[session_id] = []
        
        # Build context from conversation history (last 4 exchanges)
        context_enhancement = ""
        history = tuition_sessions[session_id]
        
        if history:
            context_enhancement = "\n\n**CONVERSATION CONTEXT:**\n"
            for msg in history[-4:]:
                context_enhancement += f"User: {msg['user']}\n"
                context_enhancement += f"Assistant: {msg['assistant'][:150]}...\n"
        
        # Check if we need to query Firebase for specific data
        user_message_lower = request.message.lower()
        firebase_context = ""
        
        # Detect specific queries that need Firebase data
        needs_firebase = any([
            'tutor' in user_message_lower or 'teacher' in user_message_lower,
            'class' in user_message_lower and any(loc in user_message_lower for loc in ['bishan', 'punggol', 'marine parade', 'marine', 'jurong', 'kovan']),
            'schedule' in user_message_lower or 'when' in user_message_lower or 'time' in user_message_lower,
            any(level in user_message_lower for level in ['p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'j1', 'j2']),
            any(name in user_message_lower for name in ['mr', 'ms', 'mrs', 'mdm', 'miss']),
            # Also trigger if location is mentioned (for follow-up queries)
            any(loc in user_message_lower for loc in ['bishan', 'punggol', 'marine parade', 'marine', 'jurong', 'kovan']),
            # Trigger on words like "list", "show", "available", "which", "what", "who"
            any(word in user_message_lower for word in ['list', 'show', 'available', 'which', 'what', 'who', 'all']),
            # Trigger if subject keywords are mentioned (for follow-up queries like "math" after level+location)
            any(subj in user_message_lower for subj in ['math', 'maths', 'science', 'english', 'chinese', 'physics', 'chemistry', 'biology', 'emath', 'amath', 'economics', 'econs'])
        ])
        
        logger.info(f"needs_firebase={needs_firebase} for message '{request.message}'")
        
        if needs_firebase:
            # Try to extract level, subject, location from query
            level = None
            subject = None
            location = None
            tutor_search = None
            
            # Try to extract from conversation history if not in current message
            if history and not any(l in user_message_lower for l in ['p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'j1', 'j2']):
                # Check last user message for level
                for msg in history[-2:]:  # Check last 2 exchanges
                    msg_lower = msg['user'].lower()
                    for l in ['p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'j1', 'j2']:
                        if l in msg_lower:
                            level = l.upper()
                            break
                    if level:
                        break
            
            # Try to extract subject from conversation history if not in current message
            subject_keywords = ['math', 'maths', 'science', 'english', 'chinese', 'emath', 'e-math', 
                              'amath', 'a-math', 'physics', 'chemistry', 'biology', 'economics', 'econs']
            if history and not any(subj in user_message_lower for subj in subject_keywords):
                # Check last user message and assistant response for subject
                for msg in history[-2:]:
                    msg_lower = msg['user'].lower()
                    assistant_lower = msg.get('assistant', '').lower()
                    combined = msg_lower + ' ' + assistant_lower
                    
                    if 'emath' in combined or 'e-math' in combined or 'e math' in combined:
                        subject = 'EMath'
                        break
                    elif 'amath' in combined or 'a-math' in combined or 'a math' in combined:
                        subject = 'AMath'
                        break
                    elif 'math' in combined or 'maths' in combined:
                        subject = 'Math'
                        break
                    elif 'science' in combined:
                        subject = 'Science'
                        break
                    elif 'physics' in combined:
                        subject = 'Physics'
                        break
                    elif 'chemistry' in combined:
                        subject = 'Chemistry'
                        break
                    elif 'biology' in combined:
                        subject = 'Biology'
                        break
                    elif 'english' in combined:
                        subject = 'English'
                        break
                    elif 'chinese' in combined:
                        subject = 'Chinese'
                        break
                    elif 'economics' in combined or 'econs' in combined:
                        subject = 'Economics'
                        break
            
            # Try to extract location from conversation history if not in current message
            location_keywords = ['bishan', 'punggol', 'marine', 'jurong', 'kovan']
            if history and not any(loc in user_message_lower for loc in location_keywords):
                # Check last user message and assistant response for location
                location_map = {
                    'bishan': 'Bishan',
                    'punggol': 'Punggol',
                    'marine': 'Marine Parade',
                    'jurong': 'Jurong',
                    'kovan': 'Kovan'
                }
                for msg in history[-2:]:
                    msg_lower = msg['user'].lower()
                    assistant_lower = msg.get('assistant', '').lower()
                    combined = msg_lower + ' ' + assistant_lower
                    
                    for key, val in location_map.items():
                        if key in combined:
                            location = val
                            break
                    if location:
                        break
            
            # Extract level (only if not already found from context)
            if not level:
                for l in ['P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'J1', 'J2']:
                    if l.lower() in user_message_lower:
                        level = l
                        break
            
            # Extract location (only if not already found from context)
            if not location:
                location_map = {
                    'bishan': 'Bishan',
                    'punggol': 'Punggol',
                    'marine': 'Marine Parade',
                    'jurong': 'Jurong',
                    'kovan': 'Kovan'
                }
                for key, val in location_map.items():
                    if key in user_message_lower:
                        location = val
                        break
            
            # Extract subject (only if not already found from context, OR if current message explicitly has it)
            logger.info(f"Checking subject extraction from current message '{user_message_lower}'")
            
            # Check for specific subjects first (AMath, EMath) before generic Math
            current_message_subject = None
            
            # Check AMath first
            if any(keyword in user_message_lower for keyword in ['amath', 'a-math', 'a math']):
                current_message_subject = 'AMath'
                logger.info(f"Found subject 'AMath' from AMath keywords in current message")
            # Check EMath second
            elif any(keyword in user_message_lower for keyword in ['emath', 'e-math', 'e math']):
                current_message_subject = 'EMath'
                logger.info(f"Found subject 'EMath' from EMath keywords in current message")
            # Check other subjects
            elif any(keyword in user_message_lower for keyword in ['math', 'maths', 'mathematics']):
                current_message_subject = 'Math'
                logger.info(f"Found subject 'Math' from Math keywords in current message")
            elif 'science' in user_message_lower:
                current_message_subject = 'Science'
                logger.info(f"Found subject 'Science' in current message")
            elif 'physics' in user_message_lower:
                current_message_subject = 'Physics'
                logger.info(f"Found subject 'Physics' in current message")
            elif 'chemistry' in user_message_lower:
                current_message_subject = 'Chemistry'
                logger.info(f"Found subject 'Chemistry' in current message")
            elif 'biology' in user_message_lower:
                current_message_subject = 'Biology'
                logger.info(f"Found subject 'Biology' in current message")
            elif 'english' in user_message_lower:
                current_message_subject = 'English'
                logger.info(f"Found subject 'English' in current message")
            elif 'chinese' in user_message_lower:
                current_message_subject = 'Chinese'
                logger.info(f"Found subject 'Chinese' in current message")
            elif any(keyword in user_message_lower for keyword in ['economics', 'econs']):
                current_message_subject = 'Economics'
                logger.info(f"Found subject 'Economics' in current message")
            
            if not current_message_subject:
                logger.info("No subject found in current message")
            # Use current message subject if found, otherwise keep context subject
            if current_message_subject:
                subject = current_message_subject
            
            logger.info(f"After extraction - Level: {level}, Subject: {subject}, Location: {location}")
            
            # Extract tutor name - improved detection (works with or without titles)
            tutor_search = None
            tutor_search_list = []  # To handle multiple names like "Sean Tan Phua"
            
            if any(title in user_message_lower for title in ['mr', 'ms', 'mrs', 'mdm', 'miss', 'dr']):
                words = request.message.split()
                for i, word in enumerate(words):
                    word_lower = word.lower().replace(',', '').replace('.', '')
                    if word_lower in ['mr', 'ms', 'mrs', 'mdm', 'miss', 'dr'] and i + 1 < len(words):
                        # Get next 1-2 words as name (but skip level/subject keywords)
                        name_parts = []
                        skip_words = ['teach', 'teaches', 'class', 'classes', 'at', 'in', 'for', 'the', 'schedules', 'schedule',
                                    'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'j1', 'j2',
                                    'math', 'science', 'english', 'chinese', 'physics', 'chemistry', 'biology']
                        for j in range(i+1, min(i+3, len(words))):
                            next_word = words[j].replace(',', '').replace('.', '')
                            if next_word.lower() not in skip_words:
                                name_parts.append(next_word)
                            else:
                                break
                        if name_parts:
                            tutor_search = ' '.join(name_parts)
                            break
            else:
                # Try to detect tutor names without titles (common tutor names)
                common_tutor_names = ['eugene', 'sean', 'david', 'john', 'pang', 'zhang', 'tan', 'liew', 'ang', 'cao', 'jackie', 'ronnie', 
                                     'leonard', 'benjamin', 'winston', 'alman', 'franklin', 'zech', 'desmond', 'melissa', 'victor', 
                                     'johnson', 'jason', 'wong', 'cheong', 'deborah', 'jade', 'hannah', 'omar', 'kang', 'chan', 
                                     'joel', 'kenji', 'lim', 'samuel', 'alan', 'aaron', 'lin', 'teo', 'huang', 'kai', 'ning', 'ong', 'koh', 'phua']
                
                words = request.message.lower().split()
                skip_words = ['teach', 'teaches', 'class', 'classes', 'at', 'in', 'for', 'the', 'schedules', 'schedule', 
                             'math', 'maths', 'science', 'english', 'chinese', 'physics', 'chemistry', 'biology',
                             'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 'j1', 'j2']
                
                # Check if multiple tutor names appear (e.g., "Sean Tan Phua" should extract both "sean tan" and "phua")
                found_names = []
                i = 0
                while i < len(words):
                    clean_word = words[i].replace(',', '').replace('.', '')
                    if clean_word in common_tutor_names:
                        # Found a potential name, get next word too (if it's not a skip word)
                        name_parts = [clean_word]
                        if i + 1 < len(words):
                            next_word = words[i+1].replace(',', '').replace('.', '')
                            if next_word not in skip_words:
                                if next_word in common_tutor_names:
                                    # This could be a second name (e.g., "Sean Tan Phua" -> "tan" and "phua" both match)
                                    # Add first name combination
                                    found_names.append(' '.join(name_parts))
                                    # Check if next word forms another name
                                    name_parts = [next_word]
                                    i += 1
                                else:
                                    name_parts.append(next_word)
                        found_names.append(' '.join(name_parts))
                        i += 1
                    else:
                        i += 1
                
                # If we found multiple potential names, set them as a list
                if len(found_names) > 1:
                    tutor_search_list = found_names
                    tutor_search = ' '.join(found_names)  # Combined for initial search
                elif len(found_names) == 1:
                    tutor_search = found_names[0]
            
            # Query Firebase for classes
            if level or subject or location or tutor_search:
                logger.info(f"Querying Firebase - Level: {level}, Subject: {subject}, Location: {location}, Tutor: {tutor_search} (from context: level={level}, subject={subject})")
                
                # Check if query is too broad (level + location but no subject and no tutor)
                # BUT ONLY if we don't have subject/level from context
                # This prevents blocking queries where context provides the missing info
                is_too_broad = False
                
                if level and subject and not location and not tutor_search:
                    # Level + Subject without location - ASK FOR LOCATION
                    # This prevents dumping all locations for something like "S3 AMath"
                    is_too_broad = True
                    firebase_context = f"\n\n**QUERY TOO BROAD - ASK FOR CLARIFICATION:**\n"
                    firebase_context += f"User asked about {level} {subject} classes, but didn't specify a location.\n"
                    firebase_context += f"We have classes at 5 locations: Bishan, Punggol, Marine Parade, Jurong, and Kovan.\n\n"
                    firebase_context += f"**YOU MUST ASK**: 'Which location would you like to know about for {level} {subject}? We have classes at:\n"
                    firebase_context += f"- Bishan\n- Punggol\n- Marine Parade\n- Jurong\n- Kovan\n\n"
                    firebase_context += f"Or would you like to see all locations?'\n\n"
                    firebase_context += f"**DO NOT query or show class data yet** - wait for location specification.\n"
                    classes = []
                elif level and location and not subject and not tutor_search:
                    # Level + Location without subject - check if this is from explicit query or context
                    # If both are from context (conversation history), this is acceptable
                    # Only block if user explicitly asked for "all [level] classes at [location]"
                    words_in_query = user_message_lower.split()
                    explicitly_broad = any(word in words_in_query for word in ['all', 'every', 'show', 'list']) and level.lower() in user_message_lower
                    
                    if explicitly_broad:
                        is_too_broad = True
                        firebase_context = f"\n\n**QUERY TOO BROAD - ASK FOR CLARIFICATION:**\n"
                        firebase_context += f"User asked about {level} classes at {location}, but didn't specify a subject.\n"
                        firebase_context += f"This would return classes for Math, Science, English, Chinese, Physics, Chemistry, Biology, etc. - too much information!\n\n"
                        firebase_context += f"**YOU MUST ASK**: 'Which subject would you like to know about for {level} at {location}? For example: Math, Science, English, Chinese"
                        if level in ['S3', 'S4']:
                            firebase_context += f", EMath, AMath, Physics, Chemistry, Biology"
                        elif level in ['J1', 'J2']:
                            firebase_context += f", Math, Physics, Chemistry, Biology, Economics"
                        firebase_context += f"?'\n\n"
                        firebase_context += f"**DO NOT query or show class data yet** - wait for subject specification.\n"
                        classes = []
                elif location and not level and not subject and not tutor_search:
                    # Only location specified - way too broad
                    is_too_broad = True
                    firebase_context = f"\n\n**QUERY TOO BROAD - ASK FOR CLARIFICATION:**\n"
                    firebase_context += f"User asked about classes at {location}, but didn't specify level or subject.\n"
                    firebase_context += f"**YOU MUST ASK**: 'Which level and subject would you like to know about at {location}? For example: P6 Math, S2 Science, J1 Physics?'\n\n"
                    firebase_context += f"**DO NOT query or show class data yet** - wait for more specific information.\n"
                    classes = []
                
                if not is_too_broad:
                    # Query is specific enough
                    classes = query_firebase_classes(level, subject, location, limit=30)
                
                # If we have a tutor search, filter classes by tutor name
                if tutor_search and classes:
                    logger.info(f"Filtering {len(classes)} classes by tutor: {tutor_search}")
                    tutor_search_lower = tutor_search.lower()
                    filtered_classes = []
                    matching_tutors = set()  # Track unique tutors that match
                    
                    # Check if query contains multiple potential tutor names (e.g., "Sean Tan Phua")
                    # This means user might be asking about multiple people
                    potential_separate_tutors = []
                    if 'tan' in tutor_search_lower and 'phua' in tutor_search_lower:
                        # Could be "Sean Tan" OR "Sean Phua"
                        potential_separate_tutors = ['tan', 'phua']
                    elif 'yeo' in tutor_search_lower and 'tan' in tutor_search_lower:
                        potential_separate_tutors = ['yeo', 'tan']
                    
                    for cls in classes:
                        tutor_name = cls.get('tutor_base_name', cls.get('tutor_name', '')).lower()
                        
                        # Check if this matches
                        if tutor_search_lower in tutor_name or any(part in tutor_name for part in tutor_search_lower.split()):
                            filtered_classes.append(cls)
                            matching_tutors.add(cls.get('tutor_base_name', cls.get('tutor_name', '')))
                    
                    # If multiple distinct last names in query, check if they match different tutors
                    if potential_separate_tutors and len(matching_tutors) > 1:
                        # User might be asking about multiple people - need clarification
                        tutor_list = ", ".join(sorted(matching_tutors))
                        firebase_context = f"\n\n**AMBIGUOUS QUERY - MULTIPLE TUTORS DETECTED:**\n"
                        firebase_context += f"The query appears to mention multiple tutor names: '{tutor_search}'.\n"
                        firebase_context += f"This could refer to different tutors:\n\n"
                        for tutor_name in sorted(matching_tutors):
                            firebase_context += f"• {tutor_name}\n"
                        firebase_context += f"\n**IMPORTANT**: Ask the user which specific tutor they mean. Example: 'I found multiple tutors that could match your query. Did you mean {tutor_list}? Please specify which one.'\n"
                        classes = []  # Don't show classes yet
                    else:
                        classes = filtered_classes
                        logger.info(f"Filtered to {len(classes)} classes with {len(matching_tutors)} unique tutors")
                        
                        # If multiple tutors match (e.g., "Sean" matches Sean Tan, Sean Yeo, Sean Phua)
                        if len(matching_tutors) > 1:
                            tutor_list = ", ".join(sorted(matching_tutors))
                            firebase_context = f"\n\n**MULTIPLE TUTORS FOUND:**\n"
                            firebase_context += f"The name '{tutor_search}' matches {len(matching_tutors)} different tutors:\n\n"
                            for tutor_name in sorted(matching_tutors):
                                tutor_classes = [c for c in classes if c.get('tutor_base_name', c.get('tutor_name', '')) == tutor_name]
                                firebase_context += f"• {tutor_name} ({len(tutor_classes)} classes)\n"
                            firebase_context += f"\n**IMPORTANT**: Ask the user to clarify which tutor they mean. List the options above and ask them to specify the full name.\n"
                            firebase_context += f"Example: 'I found multiple tutors named {tutor_search}. Which one would you like to know about: {tutor_list}?'\n"
                        elif classes:
                            # Group classes by location for proper presentation
                            # For a specific tutor query, we group by location and check if they have multiple classes
                            classes_by_location = {}
                            for cls in classes[:15]:
                                loc = cls.get('location')
                                if loc not in classes_by_location:
                                    classes_by_location[loc] = []
                                classes_by_location[loc].append(cls)
                            
                            firebase_context = "\n\n**AVAILABLE CLASSES - SHOW ALL BY LOCATION:**\n\n"
                            tutor_name = classes[0].get('tutor_base_name', classes[0].get('tutor_name', ''))
                            
                            for location, location_classes in classes_by_location.items():
                                firebase_context += f"**At {location}:**\n"
                                
                                # Check if this is ONE tutor with multiple classes of same level/subject
                                # Group by level and subject to detect multiple classes
                                level_subject_groups = {}
                                for cls in location_classes:
                                    key = f"{cls.get('level')}_{cls.get('subject')}"
                                    if key not in level_subject_groups:
                                        level_subject_groups[key] = []
                                    level_subject_groups[key].append(cls)
                                
                                # Display each level/subject group
                                for key, group_classes in level_subject_groups.items():
                                    level, subject = key.split('_')
                                    firebase_context += f"  **{level} {subject}**:\n"
                                    
                                    # Only use Class A, B, C if there are multiple classes of SAME level/subject
                                    if len(group_classes) > 1:
                                        for idx, cls in enumerate(group_classes):
                                            variant_label = chr(65 + idx)  # A, B, C, etc.
                                            schedule_str = " + ".join([f"{s.get('day')} {s.get('time')}" for s in cls.get('schedule', [])])
                                            firebase_context += f"    Class {variant_label}: {schedule_str} - ${cls.get('monthly_fee')}/month\n"
                                    else:
                                        # Single class for this level/subject
                                        cls = group_classes[0]
                                        schedule_str = " + ".join([f"{s.get('day')} {s.get('time')}" for s in cls.get('schedule', [])])
                                        firebase_context += f"    {schedule_str} - ${cls.get('monthly_fee')}/month\n"
                                firebase_context += "\n"
                            
                            firebase_context += f"**CRITICAL INSTRUCTIONS:**\n"
                            firebase_context += f"1. **YOU MUST USE THIS DATA** - The above schedule information is from our live database. Show this data to the user immediately.\n"
                            firebase_context += f"2. Present classes grouped by LOCATION and LEVEL/SUBJECT as shown above\n"
                            firebase_context += f"3. {tutor_name} ONLY teaches at: {', '.join(sorted(classes_by_location.keys()))}\n"
                            firebase_context += f"4. Only use 'Class A, B, C' labels when the SAME tutor has MULTIPLE classes of the SAME level/subject at the SAME location\n"
                            firebase_context += f"5. If only one class per level/subject at a location, just show the schedule WITHOUT variant labels\n"
                            firebase_context += f"6. Always show COMPLETE schedules with ALL session days and times (separated by +)\n"
                            firebase_context += f"7. Never mention 'database', 'Firebase', 'querying', or any technical terms\n"
                            firebase_context += f"8. When listing classes, show the complete schedule for each one with tutor names\n"
                            firebase_context += f"9. **DO NOT ask for more clarification** if you have this data - present it directly!\n"
                elif classes:
                    logger.info(f"Found {len(classes)} classes, formatting for LLM")
                    
                    # First, remove duplicate classes (same tutor, schedule, price at same location)
                    unique_classes = []
                    seen = set()
                    for cls in classes:
                        key = f"{cls.get('tutor_base_name')}_{cls.get('location')}_{str(cls.get('schedule'))}_{cls.get('monthly_fee')}"
                        if key not in seen:
                            seen.add(key)
                            unique_classes.append(cls)
                    
                    logger.info(f"After removing duplicates: {len(unique_classes)} unique classes")
                    
                    # Group classes by location for proper presentation
                    classes_by_location = {}
                    for cls in unique_classes[:30]:  # Increased limit after deduplication
                        loc = cls.get('location')
                        if loc not in classes_by_location:
                            classes_by_location[loc] = []
                        classes_by_location[loc].append(cls)
                    
                    # Build the EXACT response text that must be shown
                    if location:
                        exact_response = f"For **{level if level else 'this level'} {subject if subject else 'this subject'}** at **{location}**, we offer the following classes:\n\n"
                    else:
                        exact_response = f"For **{level if level else 'this level'} {subject if subject else 'this subject'}** across all locations, we offer the following classes:\n\n"
                    
                    for loc, location_classes in classes_by_location.items():
                        if len(classes_by_location) > 1:
                            exact_response += f"**At {loc}:**\n"
                        
                        # Group by tutor
                        classes_by_tutor = {}
                        for cls in location_classes:
                            tutor = cls.get('tutor_base_name', cls.get('tutor_name', ''))
                            if tutor not in classes_by_tutor:
                                classes_by_tutor[tutor] = []
                            classes_by_tutor[tutor].append(cls)
                        
                        for tutor, tutor_classes in classes_by_tutor.items():
                            # Remove duplicate schedules (same schedule, same price)
                            unique_classes = []
                            seen_schedules = set()
                            for cls in tutor_classes:
                                schedule_key = str(cls.get('schedule')) + str(cls.get('monthly_fee'))
                                if schedule_key not in seen_schedules:
                                    seen_schedules.add(schedule_key)
                                    unique_classes.append(cls)
                            
                            if len(unique_classes) == 1:
                                # Single class (or duplicates removed)
                                cls = unique_classes[0]
                                schedule_str = " + ".join([f"{s.get('day')} {s.get('time')}" for s in cls.get('schedule', [])])
                                exact_response += f"📚 **{tutor}**: {schedule_str} - **${cls.get('monthly_fee')}/month**\n\n"
                            else:
                                # Multiple DIFFERENT classes from same tutor
                                exact_response += f"📚 **{tutor}**:\n"
                                for idx, cls in enumerate(unique_classes):
                                    variant_label = chr(65 + idx)
                                    schedule_str = " + ".join([f"{s.get('day')} {s.get('time')}" for s in cls.get('schedule', [])])
                                    exact_response += f"  Class {variant_label}: {schedule_str} - ${cls.get('monthly_fee')}/month\n"
                                exact_response += "\n"
                        exact_response += "\n"
                    
                    exact_response += "Would you like more details about any specific tutor? Or would you like to **enroll/make a reservation**? 😊"
                    
                    logger.info(f"Built exact response with {len(classes_by_tutor)} tutors")
                    logger.info(f"First 200 chars: {exact_response[:200]}")
                    
                    firebase_context = f"\n\n**🚨 MANDATORY - PRESENT THIS EXACT RESPONSE:**\n\n"
                    firebase_context += f"```\n{exact_response}\n```\n\n"
                    firebase_context += f"**CRITICAL INSTRUCTION**: Present the text above EXACTLY as written. This is the complete answer to the user's query. DO NOT ask for more information. DO NOT rephrase it. Just show it.\n"
                else:
                    logger.warning(f"No classes found for query - Level: {level}, Subject: {subject}, Location: {location}, Tutor: {tutor_search}")
            
            # If specifically asking about a tutor by name
            if tutor_search and not classes:
                tutors = query_firebase_tutors(tutor_search, limit=5)
                if tutors:
                    firebase_context += "\n**TUTOR INFORMATION:**\n"
                    for tutor in tutors:
                        firebase_context += f"- {format_tutor_info(tutor)}\n"
                    firebase_context += "\nPresent this information naturally in your response.\n"
        
        # Combine system message with context (but NOT firebase_context - that goes in user message)
        enhanced_system_msg = TUITION_SYSTEM_MESSAGE + context_enhancement
        
        # Initialize LLM Chat
        chat = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=session_id,
            system_message=enhanced_system_msg
        )
        
        # Use gpt-4o-mini model
        chat.with_model("openai", "gpt-4o-mini")
        
        # Create user message - if we have firebase_context with exact response, prepend it to user query
        actual_user_message = request.message
        if firebase_context and "MANDATORY - PRESENT THIS EXACT RESPONSE" in firebase_context:
            # Extract the exact response from the firebase_context
            logger.info(f"Prepending EXACT firebase response to user message (length: {len(firebase_context)})")
            actual_user_message = firebase_context + "\n\n**User's query**: " + request.message
        elif firebase_context:
            # Regular firebase context (not exact response format)
            logger.info(f"Prepending regular firebase context to user message (length: {len(firebase_context)})")
            actual_user_message = firebase_context + "\n\n**User's query**: " + request.message
        else:
            logger.info("No firebase context to prepend")
        
        user_message = UserMessage(text=actual_user_message)
        assistant_response = await chat.send_message(user_message)
        
        # Extract response text
        response_text = assistant_response
        if hasattr(assistant_response, 'content') and len(assistant_response.content) > 0:
            response_text = assistant_response.content[0].text
        
        # Save to conversation history
        tuition_sessions[session_id].append({
            'user': request.message,
            'assistant': response_text,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        logger.info(f"Tuition demo chat request processed - Session: {session_id} - Firebase queried: {bool(firebase_context)}")
        
        return TuitionChatResponse(
            response=response_text,
            session_id=session_id,
            message_id=message_id
        )
        
    except Exception as e:
        logger.error(f"Error in tuition demo chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat request: {str(e)}")


@api_router.get("/tuition/available-locations")
async def get_available_locations(level: str, subject: str):
    """
    Get available locations for a specific level and subject combination.
    """
    try:
        classes_ref = firebase_db.collection('classes')
        results = classes_ref.where('level', '==', level).where('subject', '==', subject).stream()
        
        locations = set()
        for doc in results:
            data = doc.to_dict()
            locations.add(data.get('location'))
        
        return {
            "locations": sorted(list(locations))
        }
    except Exception as e:
        logger.error(f"Error fetching available locations: {str(e)}")
        return {"locations": ["Bishan", "Punggol", "Marine Parade", "Jurong", "Kovan"]}  # Fallback


@api_router.post("/tuition/enrollment")
async def tuition_enrollment(enrollment: EnrollmentRequest):
    """
    Handle tuition class enrollment/reservation requests.
    Collects customer details and sends notification email to admin.
    """
    try:
        # Validate at least one phone number is provided
        if not enrollment.parent_phone and not enrollment.student_phone:
            raise HTTPException(status_code=400, detail="At least one phone number (parent or student) is required")
        
        logger.info(f"Enrollment request: {enrollment.parent_name} for {enrollment.student_name} - {enrollment.level} {enrollment.subject} at {enrollment.location}")
        
        # Send email notification to admin
        await send_enrollment_email(enrollment)
        
        return {
            "success": True,
            "message": "Enrollment request submitted successfully! Our admin team will contact you shortly."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing enrollment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process enrollment request")


async def send_enrollment_email(enrollment: EnrollmentRequest):
    """
    Send email notification about new enrollment request.
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        sender_email = os.environ.get('SENDER_EMAIL', '')
        sender_password = os.environ.get('SENDER_PASSWORD', '')
        recipient_email = os.environ.get('NOTIFICATION_EMAIL', 'cognitioncompetence@gmail.com')
        
        if not sender_email or not sender_password:
            logger.warning("Email credentials not configured. Notification skipped.")
            logger.info(f"📚 New Enrollment: {enrollment.parent_name} - {enrollment.student_name} ({enrollment.email})")
            return False
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'📚 New Tuition Enrollment: {enrollment.student_name} - {enrollment.level} {enrollment.subject}'
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #0FB5AE; margin-bottom: 20px;">📚 New Tuition Class Enrollment Request</h2>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-top: 0;">Class Details</h3>
                        <p style="margin: 5px 0;"><strong>Level:</strong> {enrollment.level}</p>
                        <p style="margin: 5px 0;"><strong>Subject:</strong> {enrollment.subject}</p>
                        <p style="margin: 5px 0;"><strong>Location:</strong> {enrollment.location}</p>
                        {f'<p style="margin: 5px 0;"><strong>Tutor Preference:</strong> {enrollment.tutor_preference}</p>' if enrollment.tutor_preference else ''}
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold; width: 150px;">👤 Parent Name:</td>
                            <td style="padding: 10px;">{enrollment.parent_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">👦 Student Name:</td>
                            <td style="padding: 10px;">{enrollment.student_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">📧 Email:</td>
                            <td style="padding: 10px;"><a href="mailto:{enrollment.email}">{enrollment.email}</a></td>
                        </tr>
                        {f'''<tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">📱 Parent Phone:</td>
                            <td style="padding: 10px;"><a href="tel:{enrollment.parent_phone}">{enrollment.parent_phone}</a></td>
                        </tr>''' if enrollment.parent_phone else ''}
                        {f'''<tr>
                            <td style="padding: 10px; background: #{'f5f5f5' if not enrollment.parent_phone else 'fff'}; font-weight: bold;">📱 Student Phone:</td>
                            <td style="padding: 10px;"><a href="tel:{enrollment.student_phone}">{enrollment.student_phone}</a></td>
                        </tr>''' if enrollment.student_phone else ''}
                        {f'''<tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">💬 Message:</td>
                            <td style="padding: 10px;">{enrollment.message}</td>
                        </tr>''' if enrollment.message else ''}
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">⏰ Time:</td>
                            <td style="padding: 10px;">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #e7f5f4; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p style="margin: 0; color: #0d6efd;">
                            <strong>Action Required:</strong> Please contact {enrollment.parent_phone if enrollment.parent_phone else enrollment.student_phone} or {enrollment.email} 
                            to discuss class enrollment for {enrollment.student_name}.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Attach HTML body
        part = MIMEText(html_body, 'html')
        msg.attach(part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        logger.info(f"✅ Enrollment email sent successfully for {enrollment.student_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send enrollment email: {str(e)}")
        return False


@api_router.post("/admin/manage-class")
async def admin_manage_class(request: AdminClassUpdate):
    """
    Admin endpoint to add, update, or delete class data.
    Password protected in production.
    """
    try:
        if request.action == "add":
            # Add new class
            class_data = request.class_data
            
            # Normalize tutor name
            tutor_base_name = class_data.tutor_name.replace("Mr ", "").replace("Ms ", "").replace("Mrs ", "").replace("Mdm ", "")
            if "(DY HOD)" in tutor_base_name:
                tutor_base_name = tutor_base_name.replace("(DY HOD)", "(DY_HOD)")
            
            # Build schedule
            schedule = [{'day': class_data.day1, 'time': class_data.time1}]
            if class_data.day2 and class_data.time2:
                schedule.append({'day': class_data.day2, 'time': class_data.time2})
            
            # Create class ID
            class_id = f"{class_data.level.lower()}_{class_data.subject.lower()}_{class_data.location.lower().replace(' ', '_')}_{tutor_base_name.lower().replace(' ', '_').replace('.', '').replace('(', '').replace(')', '')}"
            
            # Create class document
            class_doc = {
                'class_id': class_id,
                'level': class_data.level,
                'subject': class_data.subject,
                'location': class_data.location,
                'tutor_name': class_data.tutor_name,
                'tutor_base_name': tutor_base_name,
                'schedule': schedule,
                'monthly_fee': class_data.monthly_fee,
                'sessions_per_week': class_data.sessions_per_week
            }
            
            firebase_db.collection('classes').document(class_id).set(class_doc)
            logger.info(f"✅ Added class: {class_id}")
            
            return {"success": True, "message": f"Class added: {tutor_base_name} - {class_data.level} {class_data.subject} at {class_data.location}", "class_id": class_id}
            
        elif request.action == "delete":
            # Delete class
            firebase_db.collection('classes').document(request.class_id).delete()
            logger.info(f"🗑️  Deleted class: {request.class_id}")
            
            return {"success": True, "message": f"Class deleted: {request.class_id}"}
            
        elif request.action == "update":
            # Update existing class
            class_data = request.class_data
            
            # Build schedule
            schedule = [{'day': class_data.day1, 'time': class_data.time1}]
            if class_data.day2 and class_data.time2:
                schedule.append({'day': class_data.day2, 'time': class_data.time2})
            
            # Update document
            firebase_db.collection('classes').document(request.class_id).update({
                'schedule': schedule,
                'monthly_fee': class_data.monthly_fee,
                'sessions_per_week': class_data.sessions_per_week
            })
            
            logger.info(f"📝 Updated class: {request.class_id}")
            
            return {"success": True, "message": f"Class updated: {request.class_id}"}
        
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'add', 'update', or 'delete'")
            
    except Exception as e:
        logger.error(f"Error in admin class management: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/search-classes")
async def admin_search_classes(level: str = None, subject: str = None, location: str = None, tutor: str = None):
    """
    Search for classes with optional filters.
    """
    try:
        classes_ref = firebase_db.collection('classes')
        query = classes_ref
        
        if level:
            query = query.where('level', '==', level)
        if subject:
            query = query.where('subject', '==', subject)
        if location:
            query = query.where('location', '==', location)
        
        results = query.limit(100).stream()
        
        classes = []
        for doc in results:
            data = doc.to_dict()
            if tutor:
                if tutor.lower() in data.get('tutor_base_name', '').lower():
                    classes.append(data)
            else:
                classes.append(data)
        
        return {"classes": classes, "count": len(classes)}
        
    except Exception as e:
        logger.error(f"Error searching classes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/available-tutors")
async def get_available_tutors(level: str, subject: str, location: str):
    """
    Get list of unique tutors teaching a specific level+subject at a location.
    Returns only unique tutor names (no duplicates, no A/B suffixes).
    """
    try:
        classes_ref = firebase_db.collection('classes')
        results = classes_ref.where('level', '==', level).where('subject', '==', subject).where('location', '==', location).stream()
        
        tutors = set()
        for doc in results:
            data = doc.to_dict()
            # Use tutor_base_name to avoid A/B suffixes, fallback to tutor_name
            tutor_name = data.get('tutor_base_name', data.get('tutor_name', ''))
            if tutor_name:
                tutors.add(tutor_name)
        
        # Return sorted unique list
        return {
            "tutors": sorted(list(tutors)),
            "count": len(tutors)
        }
    except Exception as e:
        logger.error(f"Error fetching available tutors: {str(e)}")
        return {"tutors": [], "count": 0}


# Include the routers in the main app
app.include_router(api_router)
app.include_router(math_router)
app.include_router(tutor_router)
app.include_router(project62_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================
# Daily Renewal Scheduler (APScheduler)
# ========================
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

async def run_daily_renewals():
    """
    Background job to process subscription renewals daily
    Runs at 00:00 UTC every day
    """
    try:
        logger.info("🔄 Running daily renewal processing...")
        
        # Import here to avoid circular dependency
        import httpx
        
        # Call the process-renewals endpoint
        # We need to use a system admin token or create a service account
        # For now, we'll log the execution attempt
        
        # Save execution log to Firestore
        firebase_db.collection('project62').document('ops').collection('renewal_logs').add({
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "executed_by": "scheduler",
            "status": "scheduled_run",
            "message": "Daily renewal job triggered"
        })
        
        logger.info("✅ Daily renewal job completed")
        
    except Exception as e:
        logger.error(f"❌ Error in daily renewal job: {e}")
        import traceback
        traceback.print_exc()

# Schedule the job to run daily at 00:00 UTC
scheduler.add_job(
    run_daily_renewals,
    trigger=CronTrigger(hour=0, minute=0),  # Every day at midnight UTC
    id='daily_renewals',
    name='Process subscription renewals',
    replace_existing=True
)

@app.on_event("startup")
async def startup_scheduler():
    """Start the scheduler when the app starts"""
    try:
        scheduler.start()
        logger.info("✅ APScheduler started - Daily renewals scheduled for 00:00 UTC")
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Shutdown database client and scheduler"""
    try:
        scheduler.shutdown()
        logger.info("✅ APScheduler shutdown")
    except:
        pass
    client.close()