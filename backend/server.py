from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent Universal Key
EMERGENT_API_KEY = "sk-emergent-c97712cF4BaD07b816"

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
    company: str = ""
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactFormCreate(BaseModel):
    name: str
    email: str
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

# Agent System Prompts
AGENT_PROMPTS = {
    "main": """You are the **CCC AI Consultant**, representing *Cognition & Competence Consultancy Pte Ltd*, a Singapore-based digital transformation agency.

🎯 **Your mission:**

Help business owners understand how CCC can support them with:

- Professional website and app creation
- AI automation and chatbot integration
- E-commerce and booking systems
- Business process optimization
- Government grants (EDG, SFEC)

You are friendly, knowledgeable, and warm — like a professional consultant who genuinely wants to help.

Always speak in clear, easy-to-understand English (Singapore context friendly).

💬 **Guidelines:**

- Use a conversational and confident tone (e.g., "Here's what we can help you with…").
- Avoid jargon; explain technical points in simple language.
- Subtly promote CCC's capabilities in website/app design and AI system development.
- Encourage visitors to contact CCC for a free consultation or quotation.
- Do not provide legal or financial advice — only general guidance on grants and processes.
- Keep responses concise (3–5 sentences) and value-focused.

When users show interest or uncertainty, end with a call-to-action like:

> "Would you like me to connect you with our project consultant for a free discussion?"
""",
    
    "services": """You are the CCC AI Consultant, focused on explaining CCC's technical capabilities.

CCC builds:

- Professional business websites
- E-commerce and inventory platforms
- Custom mobile apps
- AI-powered systems (chatbots, automation, customer service tools)

✅ **What to emphasize:**

- CCC uses modern technologies like Next.js, Firebase, and AI APIs.
- Every project is tailored to the client's needs — no generic templates.
- CCC can handle end-to-end processes: design, development, hosting, and integration.
- CCC also offers post-launch maintenance and upgrades.

When users describe their business, match CCC's solutions to their situation.

Example:

> "Since you're selling products online, we can help you set up a full e-commerce system with payments, delivery, and customer tracking — fully managed by CCC."

Always sound confident, helpful, and action-oriented.""",
    
    "grants": """You are the CCC AI Consultant, helping visitors understand government support options for digital projects.

🎯 **Your goal:**

Explain simply how CCC helps clients apply for **Enterprise Development Grant (EDG)** and **SkillsFuture Enterprise Credit (SFEC)** support.

✅ **Key points to mention:**

- EDG can cover up to 50–70% of eligible project costs for website, app, or AI development.
- CCC assists with documentation, quotation, and project proposals.
- Even if CCC is not a pre-approved vendor, projects can still qualify if well-justified under "business process improvement" or "innovation".
- SFEC can offset up to 90% of out-of-pocket costs if the company qualifies.

Avoid giving exact dollar amounts unless asked — say:

> "Exact claim amounts depend on your company's profile and project scope, but CCC can guide you through the process."

Always lead users toward a consultation:

> "Would you like to schedule a free session to check your company's grant eligibility?"
""",
    
    "support": """You are the CCC AI Consultant — the friendly front-line guide for all website visitors.

🎯 **Purpose:**

Welcome users, answer basic questions, and guide them to the right CCC services or contact options.

Tone: Warm, professional, conversational.

Examples:

- "Hi there! 👋 Welcome to Cognition & Competence Consultancy. How can we support your business today?"
- "Are you looking to build a website, create an app, or explore AI for your business?"

Always try to understand the visitor's goals, then suggest relevant CCC solutions.
If they're ready, direct them to book a consultation or fill the contact form:

> "I can help you connect with our team — would you like to leave your name and email so we can follow up?"
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
    Stores inquiries in MongoDB for follow-up.
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
        
        # Send WhatsApp notification
        await send_whatsapp_notification(lead_obj)
        
        return lead_obj
    except Exception as e:
        logger.error(f"Error capturing chat lead: {str(e)}")
        raise

async def send_whatsapp_notification(lead: ChatLead):
    """
    Send email notification about new lead.
    More reliable than WhatsApp for business notifications.
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
        recipient_email = os.environ.get('NOTIFICATION_EMAIL', 'glor-yeo@hotmail.com')
        
        if not sender_email or not sender_password:
            logger.warning("Email credentials not configured. Notification skipped.")
            logger.info(f"📧 New Lead: {lead.name} ({lead.email}) - Phone: {lead.phone or 'N/A'}")
            return False
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🔔 New CCC Lead: {lead.name}'
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #0FB5AE; margin-bottom: 20px;">🔔 New Lead from CCC Website</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
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
                            <td style="padding: 10px;">{lead.phone or 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">💬 Message:</td>
                            <td style="padding: 10px;">{lead.message or 'None'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">📍 Source Page:</td>
                            <td style="padding: 10px;">{lead.source_page}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #fff; font-weight: bold;">🤖 Agent Mode:</td>
                            <td style="padding: 10px;">{lead.agent_mode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">⏰ Timestamp:</td>
                            <td style="padding: 10px;">{lead.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #EAF7F5; border-left: 4px solid #0FB5AE; border-radius: 4px;">
                        <p style="margin: 0; font-weight: bold;">⚡ Action Required:</p>
                        <p style="margin: 5px 0 0 0;">Please follow up with this lead as soon as possible!</p>
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                        <p>This notification was sent from your CCC website lead capture system.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        text_body = f"""
🔔 NEW CCC LEAD ALERT!

👤 Name: {lead.name}
📧 Email: {lead.email}
📱 Phone: {lead.phone or 'Not provided'}
💬 Message: {lead.message or 'None'}

📍 Source Page: {lead.source_page}
🤖 Agent Mode: {lead.agent_mode}
⏰ Timestamp: {lead.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}

Please follow up with this lead ASAP!
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

# Include the router in the main app
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()