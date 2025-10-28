"""
Tutor Authentication & Management API
Handles tutor profiles, authentication, and permissions for Math Analysis System
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import hashlib
import secrets
import logging
import json
from pathlib import Path

# Import Firebase from math_analysis_api
from math_analysis_api import math_db

# Setup logging
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = "math_analysis_secret_key_2024"  # Use consistent secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Security
security = HTTPBearer()

# Create router
tutor_router = APIRouter(prefix="/api/tutor", tags=["Tutor Auth"])

# Pydantic Models
class TutorProfile(BaseModel):
    tutor_name: str
    locations: List[str]  # Marine Parade, Bishan, etc.
    levels: List[str]  # S1, S2, S3, S4, J1, J2
    subjects: List[str]  # Math, A Math, E Math

class TutorCreate(BaseModel):
    tutor_name: str
    locations: List[str]
    levels: List[str]
    subjects: List[str]

class TutorLogin(BaseModel):
    login_id: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    tutor_info: dict

# Helper Functions
def generate_login_id(tutor_name: str) -> str:
    """Generate login ID from tutor name (e.g., 'Sean Yeo' -> 'seanyeo')"""
    return tutor_name.lower().replace(' ', '')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_temp_password() -> str:
    """Generate a random temporary password"""
    return secrets.token_urlsafe(8)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return tutor data"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login_id: str = payload.get("sub")
        if login_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# API Endpoints

@tutor_router.post("/admin/create-tutor")
async def create_tutor(tutor_data: TutorCreate):
    """Admin endpoint: Create a new tutor profile"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Generate login credentials
        login_id = generate_login_id(tutor_data.tutor_name)
        temp_password = generate_temp_password()
        
        # Check if tutor already exists
        existing = math_db.collection('tutors').where('login_id', '==', login_id).limit(1).get()
        if len(list(existing)) > 0:
            raise HTTPException(status_code=400, detail=f"Tutor with login ID '{login_id}' already exists")
        
        # Create tutor document
        tutor_doc = {
            'tutor_id': login_id,  # Use login_id as unique identifier
            'tutor_name': tutor_data.tutor_name,
            'login_id': login_id,
            'password_hash': hash_password(temp_password),
            'temp_password': temp_password,  # Store for admin to share with tutor
            'must_change_password': True,
            'locations': tutor_data.locations,
            'levels': tutor_data.levels,
            'subjects': tutor_data.subjects,
            'created_at': datetime.utcnow().isoformat(),
            'last_login': None
        }
        
        # Save to Firebase
        math_db.collection('tutors').document(login_id).set(tutor_doc)
        
        return {
            'success': True,
            'message': 'Tutor profile created successfully',
            'tutor_id': login_id,
            'login_id': login_id,
            'temp_password': temp_password,
            'tutor_name': tutor_data.tutor_name
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating tutor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.post("/login", response_model=TokenResponse)
async def tutor_login(credentials: TutorLogin):
    """Tutor login endpoint"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Fetch tutor from Firebase
        tutor_doc = math_db.collection('tutors').document(credentials.login_id).get()
        
        if not tutor_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )
        
        tutor_data = tutor_doc.to_dict()
        
        # Verify password
        if tutor_data['password_hash'] != hash_password(credentials.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )
        
        # Update last login
        math_db.collection('tutors').document(credentials.login_id).update({
            'last_login': datetime.utcnow().isoformat()
        })
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": credentials.login_id,
                "tutor_id": tutor_data['tutor_id'],
                "tutor_name": tutor_data['tutor_name'],
                "must_change_password": tutor_data.get('must_change_password', False)
            }
        )
        
        return {
            'access_token': access_token,
            'token_type': 'bearer',
            'tutor_info': {
                'tutor_id': tutor_data['tutor_id'],
                'tutor_name': tutor_data['tutor_name'],
                'login_id': credentials.login_id,
                'must_change_password': tutor_data.get('must_change_password', False),
                'locations': tutor_data['locations'],
                'levels': tutor_data['levels'],
                'subjects': tutor_data['subjects']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    tutor_payload: dict = Depends(verify_token)
):
    """Change tutor password (authenticated)"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        login_id = tutor_payload['sub']
        
        # Fetch tutor from Firebase
        tutor_doc = math_db.collection('tutors').document(login_id).get()
        
        if not tutor_doc.exists:
            raise HTTPException(status_code=404, detail="Tutor not found")
        
        tutor_data = tutor_doc.to_dict()
        
        # Verify old password
        if tutor_data['password_hash'] != hash_password(password_data.old_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Update password
        math_db.collection('tutors').document(login_id).update({
            'password_hash': hash_password(password_data.new_password),
            'must_change_password': False,
            'temp_password': None,  # Clear temporary password
            'password_changed_at': datetime.utcnow().isoformat()
        })
        
        # Create new token without must_change_password flag
        new_token = create_access_token(
            data={
                "sub": login_id,
                "tutor_id": tutor_data['tutor_id'],
                "tutor_name": tutor_data['tutor_name'],
                "must_change_password": False
            }
        )
        
        return {
            'success': True,
            'message': 'Password changed successfully',
            'access_token': new_token,
            'token_type': 'bearer'
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.get("/profile")
async def get_tutor_profile(tutor_payload: dict = Depends(verify_token)):
    """Get authenticated tutor's profile"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        login_id = tutor_payload['sub']
        
        # Fetch tutor from Firebase
        tutor_doc = math_db.collection('tutors').document(login_id).get()
        
        if not tutor_doc.exists:
            raise HTTPException(status_code=404, detail="Tutor not found")
        
        tutor_data = tutor_doc.to_dict()
        
        # Remove sensitive data
        tutor_data.pop('password_hash', None)
        tutor_data.pop('temp_password', None)
        
        return {
            'success': True,
            'tutor': tutor_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching tutor profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.get("/admin/list-tutors")
async def list_all_tutors():
    """Admin endpoint: List all tutors"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        tutors_ref = math_db.collection('tutors').stream()
        tutors = []
        
        for doc in tutors_ref:
            tutor_data = doc.to_dict()
            # Remove sensitive data
            tutor_data.pop('password_hash', None)
            tutors.append(tutor_data)
        
        return {
            'success': True,
            'tutors': tutors
        }
    
    except Exception as e:
        logger.error(f"Error listing tutors: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.delete("/admin/delete-tutor/{login_id}")
async def delete_tutor(login_id: str):
    """Admin endpoint: Delete a tutor profile"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Check if tutor exists
        tutor_doc = math_db.collection('tutors').document(login_id).get()
        if not tutor_doc.exists:
            raise HTTPException(status_code=404, detail="Tutor not found")
        
        # Delete tutor
        math_db.collection('tutors').document(login_id).delete()
        
        return {
            'success': True,
            'message': f'Tutor {login_id} deleted successfully'
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting tutor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@tutor_router.post("/admin/reset-password/{login_id}")
async def reset_tutor_password(login_id: str):
    """Admin endpoint: Reset a tutor's password"""
    try:
        if not math_db:
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        # Check if tutor exists
        tutor_doc = math_db.collection('tutors').document(login_id).get()
        if not tutor_doc.exists:
            raise HTTPException(status_code=404, detail="Tutor not found")
        
        # Generate new temporary password
        temp_password = generate_temp_password()
        
        # Update tutor with new password
        math_db.collection('tutors').document(login_id).update({
            'password_hash': hash_password(temp_password),
            'temp_password': temp_password,
            'must_change_password': True,
            'password_reset_at': datetime.utcnow().isoformat(),
            'password_reset_by': 'admin'
        })
        
        return {
            'success': True,
            'message': f'Password reset successfully for {login_id}',
            'temp_password': temp_password,
            'login_id': login_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
