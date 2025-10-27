"""
Test the tuition chat endpoint with Firebase integration
"""
import requests
import json

# Get backend URL from env
BACKEND_URL = "http://localhost:8001"

print("=" * 80)
print("TESTING TUITION CHAT ENDPOINT WITH FIREBASE")
print("=" * 80)

# Test 1: General query (should use system knowledge)
print("\n📝 Test 1: General pricing query")
test1_data = {
    "message": "How much is P6 Math?",
    "session_id": None
}

response1 = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test1_data)
print(f"Status: {response1.status_code}")
if response1.status_code == 200:
    result = response1.json()
    print(f"Response: {result['response'][:200]}...")
    session_id = result['session_id']
    print(f"Session ID: {session_id}")
else:
    print(f"Error: {response1.text}")
    session_id = None

# Test 2: Specific class query (should use Firebase)
print("\n\n📝 Test 2: Specific class at location query (Firebase)")
test2_data = {
    "message": "Show me P6 Math classes at Bishan",
    "session_id": session_id
}

response2 = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test2_data)
print(f"Status: {response2.status_code}")
if response2.status_code == 200:
    result = response2.json()
    print(f"Response: {result['response'][:300]}...")
else:
    print(f"Error: {response2.text}")

# Test 3: Tutor query (should use Firebase)
print("\n\n📝 Test 3: Tutor information query (Firebase)")
test3_data = {
    "message": "Who teaches S3 AMath?",
    "session_id": session_id
}

response3 = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test3_data)
print(f"Status: {response3.status_code}")
if response3.status_code == 200:
    result = response3.json()
    print(f"Response: {result['response'][:300]}...")
else:
    print(f"Error: {response3.text}")

# Test 4: Context awareness with Firebase
print("\n\n📝 Test 4: Follow-up query (should use context + Firebase)")
test4_data = {
    "message": "What about at Marine Parade?",
    "session_id": session_id
}

response4 = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test4_data)
print(f"Status: {response4.status_code}")
if response4.status_code == 200:
    result = response4.json()
    print(f"Response: {result['response'][:300]}...")
else:
    print(f"Error: {response4.text}")

print("\n" + "=" * 80)
print("✅ TESTING COMPLETE")
print("=" * 80)
