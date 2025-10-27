"""
Test Eugene Tan query specifically
"""
import requests
import json

BACKEND_URL = "http://localhost:8001"

print("=" * 80)
print("TESTING: Mr Eugene Tan P6 Math Query")
print("=" * 80)

# Test: Ask about Eugene Tan P6 Math
test_data = {
    "message": "P6 Math class for Mr Eugene Tan",
    "session_id": None
}

response = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test_data)
print(f"\n📝 Query: 'P6 Math class for Mr Eugene Tan'")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print(f"\n✅ Response:\n{result['response']}")
    print(f"\n📊 Session ID: {result['session_id']}")
else:
    print(f"❌ Error: {response.text}")

print("\n" + "=" * 80)

# Test 2: Just Eugene Tan
test_data2 = {
    "message": "Tell me about Eugene Tan classes",
    "session_id": None
}

response2 = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test_data2)
print(f"\n📝 Query: 'Tell me about Eugene Tan classes'")
print(f"Status: {response2.status_code}")

if response2.status_code == 200:
    result2 = response2.json()
    print(f"\n✅ Response:\n{result2['response']}")
else:
    print(f"❌ Error: {response2.text}")

print("\n" + "=" * 80)
