#!/usr/bin/env python3
"""
Test Firebase Auth directly
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

firebase_api_key = os.getenv("FIREBASE_WEB_API_KEY")
print(f"Firebase API Key: {firebase_api_key}")

# Test login with Firebase Auth REST API directly
auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_api_key}"

response = requests.post(auth_url, json={
    "email": "testadmin@project62.com",
    "password": "admin123",
    "returnSecureToken": True
})

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("✅ Firebase Auth working correctly")
else:
    print("❌ Firebase Auth failed")
    
# Also test with admin user
response2 = requests.post(auth_url, json={
    "email": "admin@project62.com",
    "password": "admin123",
    "returnSecureToken": True
})

print(f"\nAdmin login - Status Code: {response2.status_code}")
print(f"Admin login - Response: {response2.text}")