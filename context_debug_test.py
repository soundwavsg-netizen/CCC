#!/usr/bin/env python3
"""
Debug test for the specific J1 Math → Bishan context issue
"""

import requests
import json
import time

BACKEND_URL = "https://math-mastery-12.preview.emergentagent.com"
API_ENDPOINT = f"{BACKEND_URL}/api/tuition/chat"

def send_message(message, session_id):
    payload = {
        "message": message,
        "session_id": session_id,
        "user_type": "demo_visitor"
    }
    
    response = requests.post(API_ENDPOINT, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()

def test_j1_context_issue():
    session_id = "debug_j1_context"
    
    print("=== DEBUG: J1 Math Context Issue ===")
    
    # First message
    print("\n1. First message: 'Show me J1 Math classes'")
    result1 = send_message("Show me J1 Math classes", session_id)
    print(f"Response 1:\n{result1.get('response', '')}")
    
    # Wait for context to be stored
    time.sleep(3)
    
    # Second message - the problematic one
    print("\n2. Second message: 'list all tutors at Bishan'")
    result2 = send_message("list all tutors at Bishan", session_id)
    print(f"Response 2:\n{result2.get('response', '')}")
    
    # Let's try a more explicit follow-up
    time.sleep(2)
    print("\n3. Third message: 'show me J1 Math tutors at Bishan'")
    result3 = send_message("show me J1 Math tutors at Bishan", session_id)
    print(f"Response 3:\n{result3.get('response', '')}")

if __name__ == "__main__":
    test_j1_context_issue()