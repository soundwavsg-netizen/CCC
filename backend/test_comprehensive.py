"""
Test with more specific queries
"""
import requests

BACKEND_URL = "http://localhost:8001"

print("=" * 80)
print("COMPREHENSIVE TESTING")
print("=" * 80)

tests = [
    "Show me all P6 Math classes with Mr Eugene Tan",
    "What time does Eugene Tan teach P6 Math?",
    "Eugene Tan P6 Math schedule",
]

for query in tests:
    print(f"\n{'='*80}")
    print(f"📝 Query: '{query}'")
    print('='*80)
    
    test_data = {
        "message": query,
        "session_id": None
    }
    
    response = requests.post(f"{BACKEND_URL}/api/tuition/chat", json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Response:\n{result['response']}")
    else:
        print(f"❌ Error: {response.text}")
    
    print("\n")

print("=" * 80)
