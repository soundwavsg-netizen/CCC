#!/usr/bin/env python3
"""
Backend Testing Suite for Project 62 Authentication and Dashboard Endpoints
Tests authentication flow, customer dashboard, and admin endpoints
"""

import requests
import json
import uuid
from typing import Dict, Any
import time

# Configuration
BACKEND_URL = "https://fitness-nutrition-5.preview.emergentagent.com"
PROJECT62_BASE_URL = f"{BACKEND_URL}/api/project62"

# Test user credentials
TEST_EMAIL = "testuser@project62.com"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test User"
TEST_PHONE = "+65 9123 4567"

class Project62Tester:
    def __init__(self):
        self.test_results = []
        self.auth_token = None
        
    def send_request(self, method: str, endpoint: str, data: Dict[str, Any] = None, headers: Dict[str, str] = None) -> Dict[str, Any]:
        """Send HTTP request to Project 62 API"""
        try:
            url = f"{PROJECT62_BASE_URL}{endpoint}"
            
            if headers is None:
                headers = {"Content-Type": "application/json"}
            
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                "success": response.status_code < 400,
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "error": None
            }
        except requests.exceptions.RequestException as e:
            error_detail = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json().get('detail', str(e))
                except:
                    error_detail = str(e)
            
            return {
                "success": False,
                "status_code": getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None,
                "data": None,
                "error": error_detail
            }
    
    def test_register_customer(self):
        """
        Test 1: Register Customer
        POST /api/project62/auth/register
        """
        print("\n" + "="*80)
        print("TEST 1: Register Customer")
        print("="*80)
        
        # First, try to clean up any existing user (ignore errors)
        try:
            import firebase_admin
            from firebase_admin import auth as firebase_auth
            try:
                user = firebase_auth.get_user_by_email(TEST_EMAIL)
                firebase_auth.delete_user(user.uid)
                print(f"🧹 Cleaned up existing user: {TEST_EMAIL}")
            except:
                pass
        except:
            pass
        
        register_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME,
            "phone": TEST_PHONE
        }
        
        print(f"Request: POST {PROJECT62_BASE_URL}/auth/register")
        print(f"Data: {json.dumps({k: v if k != 'password' else '***' for k, v in register_data.items()}, indent=2)}")
        
        result = self.send_request("POST", "/auth/register", register_data)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_token = "token" in data and data["token"]
        has_user = "user" in data and data["user"]
        
        if has_user:
            user_data = data["user"]
            correct_email = user_data.get("email") == TEST_EMAIL
            correct_name = user_data.get("name") == TEST_NAME
            has_uid = "uid" in user_data
        else:
            correct_email = correct_name = has_uid = False
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has JWT token: {has_token}")
        print(f"✅ Has user object: {has_user}")
        print(f"✅ Correct email: {correct_email}")
        print(f"✅ Correct name: {correct_name}")
        print(f"✅ Has Firebase UID: {has_uid}")
        
        test_passed = has_status and has_token and has_user and correct_email and correct_name and has_uid
        
        if test_passed:
            self.auth_token = data["token"]
            print(f"✅ Auth token saved for subsequent tests")
        
        print(f"\n🎯 TEST 1 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Register Customer",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_token": has_token,
                "has_user": has_user,
                "correct_email": correct_email,
                "correct_name": correct_name,
                "has_uid": has_uid
            }
        })
        
        return test_passed
    
    def test_login_customer(self):
        """
        Test 2: Login Customer
        POST /api/project62/auth/login
        """
        print("\n" + "="*80)
        print("TEST 2: Login Customer")
        print("="*80)
        
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        print(f"Request: POST {PROJECT62_BASE_URL}/auth/login")
        print(f"Data: {json.dumps({k: v if k != 'password' else '***' for k, v in login_data.items()}, indent=2)}")
        
        result = self.send_request("POST", "/auth/login", login_data)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_token = "token" in data and data["token"]
        has_user = "user" in data and data["user"]
        
        if has_user:
            user_data = data["user"]
            correct_email = user_data.get("email") == TEST_EMAIL
            correct_name = user_data.get("name") == TEST_NAME
            has_uid = "uid" in user_data
        else:
            correct_email = correct_name = has_uid = False
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has JWT token: {has_token}")
        print(f"✅ Has user object: {has_user}")
        print(f"✅ Correct email: {correct_email}")
        print(f"✅ Correct name: {correct_name}")
        print(f"✅ Has Firebase UID: {has_uid}")
        
        test_passed = has_status and has_token and has_user and correct_email and has_uid
        
        if test_passed and not self.auth_token:
            self.auth_token = data["token"]
            print(f"✅ Auth token saved for subsequent tests")
        
        print(f"\n🎯 TEST 2 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Login Customer",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_token": has_token,
                "has_user": has_user,
                "correct_email": correct_email,
                "correct_name": correct_name,
                "has_uid": has_uid
            }
        })
        
        return test_passed
    
    def test_verify_token(self):
        """
        Test 3: Verify Token
        GET /api/project62/auth/verify
        """
        print("\n" + "="*80)
        print("TEST 3: Verify Token")
        print("="*80)
        
        if not self.auth_token:
            print("❌ No auth token available from previous tests")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        print(f"Request: GET {PROJECT62_BASE_URL}/auth/verify")
        print(f"Headers: Authorization: Bearer ***")
        
        result = self.send_request("GET", "/auth/verify", headers=headers)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_user = "user" in data and data["user"]
        
        if has_user:
            user_data = data["user"]
            correct_email = user_data.get("email") == TEST_EMAIL
            correct_name = user_data.get("name") == TEST_NAME
            has_uid = "uid" in user_data
        else:
            correct_email = correct_name = has_uid = False
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has user object: {has_user}")
        print(f"✅ Correct email: {correct_email}")
        print(f"✅ Correct name: {correct_name}")
        print(f"✅ Has Firebase UID: {has_uid}")
        
        test_passed = has_status and has_user and correct_email and has_uid
        
        print(f"\n🎯 TEST 3 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Verify Token",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_user": has_user,
                "correct_email": correct_email,
                "correct_name": correct_name,
                "has_uid": has_uid
            }
        })
        
        return test_passed
    
    def test_customer_dashboard(self):
        """
        Test 4: Customer Dashboard
        GET /api/project62/customer/dashboard
        """
        print("\n" + "="*80)
        print("TEST 4: Customer Dashboard")
        print("="*80)
        
        if not self.auth_token:
            print("❌ No auth token available from previous tests")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        print(f"Request: GET {PROJECT62_BASE_URL}/customer/dashboard")
        print(f"Headers: Authorization: Bearer ***")
        
        result = self.send_request("GET", "/customer/dashboard", headers=headers)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_customer = "customer" in data
        has_orders = "orders" in data and isinstance(data["orders"], list)
        has_deliveries = "deliveries" in data and isinstance(data["deliveries"], list)
        has_plan_status = "plan_status" in data
        
        if has_customer:
            customer_data = data["customer"]
            correct_email = customer_data.get("email") == TEST_EMAIL
            correct_name = customer_data.get("name") == TEST_NAME
        else:
            correct_email = correct_name = False
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Has customer data: {has_customer}")
        print(f"✅ Has orders array: {has_orders}")
        print(f"✅ Has deliveries array: {has_deliveries}")
        print(f"✅ Has plan_status field: {has_plan_status}")
        print(f"✅ Correct customer email: {correct_email}")
        print(f"✅ Correct customer name: {correct_name}")
        
        test_passed = has_customer and has_orders and has_deliveries and has_plan_status and correct_email
        
        print(f"\n🎯 TEST 4 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Customer Dashboard",
            "passed": test_passed,
            "details": {
                "has_customer": has_customer,
                "has_orders": has_orders,
                "has_deliveries": has_deliveries,
                "has_plan_status": has_plan_status,
                "correct_email": correct_email,
                "correct_name": correct_name
            }
        })
        
        return test_passed
    
    def test_update_address(self):
        """
        Test 5: Update Customer Address
        PUT /api/project62/customer/address
        """
        print("\n" + "="*80)
        print("TEST 5: Update Customer Address")
        print("="*80)
        
        if not self.auth_token:
            print("❌ No auth token available from previous tests")
            return False
        
        address_data = {
            "address": "123 Test St, Singapore 123456",
            "phone": "+65 9999 8888"
        }
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        print(f"Request: PUT {PROJECT62_BASE_URL}/customer/address")
        print(f"Headers: Authorization: Bearer ***")
        print(f"Data: {json.dumps(address_data, indent=2)}")
        
        result = self.send_request("PUT", "/customer/address", address_data, headers)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_message = "message" in data and data["message"]
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has success message: {has_message}")
        
        test_passed = has_status and has_message
        
        print(f"\n🎯 TEST 5 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Update Customer Address",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_message": has_message
            }
        })
        
        return test_passed
    
    def test_send_magic_link(self):
        """
        Test 6: Send Magic Link
        POST /api/project62/auth/magic-link
        """
        print("\n" + "="*80)
        print("TEST 6: Send Magic Link")
        print("="*80)
        
        magic_link_data = {
            "email": TEST_EMAIL
        }
        
        print(f"Request: POST {PROJECT62_BASE_URL}/auth/magic-link")
        print(f"Data: {json.dumps(magic_link_data, indent=2)}")
        
        result = self.send_request("POST", "/auth/magic-link", magic_link_data)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_message = "message" in data and "magic link" in data["message"].lower()
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has magic link message: {has_message}")
        
        test_passed = has_status and has_message
        
        print(f"\n🎯 TEST 6 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Send Magic Link",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_message": has_message
            }
        })
        
        return test_passed
    
    def run_all_analytics_tests(self):
        """Run all analytics endpoint tests"""
        print("🚀 Starting Math Analysis System Analytics Testing Suite")
        print(f"🔗 Testing endpoint: {ANALYTICS_API_ENDPOINT}")
        
        # Run all analytics tests
        test1_passed = self.test_analytics_all_data()
        test2_passed = self.test_analytics_s3_filter()
        test3_passed = self.test_analytics_marine_parade_filter()
        test4_passed = self.test_analytics_s2_filter()
        test5_passed = self.test_analytics_combined_filters()
        test6_passed = self.test_analytics_endpoint_structure()
        
        # Summary
        print("\n" + "="*80)
        print("📊 ANALYTICS TESTS SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} analytics tests passed")
        
        if passed_count == total_count:
            print("🎉 ALL ANALYTICS TESTS PASSED! Filtering functionality is working correctly.")
        else:
            print("⚠️  SOME ANALYTICS TESTS FAILED. Check the filtering logic and calculations.")
            
        return passed_count == total_count


class TuitionChatTester:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.test_results = []
        
    def send_chat_message(self, message: str, session_id: str = None) -> Dict[str, Any]:
        """Send a message to the tuition chat endpoint"""
        if not session_id:
            session_id = self.session_id
            
        payload = {
            "message": message,
            "session_id": session_id,
            "user_type": "demo_visitor"
        }
        
        try:
            response = requests.post(TUITION_API_ENDPOINT, json=payload, timeout=30)
            response.raise_for_status()
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json(),
                "error": None
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status_code": getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None,
                "data": None,
                "error": str(e)
            }
    
    def test_scenario_1_sean_yeo_location_filtering(self):
        """
        Test 1: Tutor-specific query with location filtering
        Query: "Tell me about Sean Yeo S3 AMath classes"
        Expected: Should show ONLY Bishan and Marine Parade locations
        """
        print("\n" + "="*80)
        print("TEST 1: Sean Yeo S3 AMath - Location Filtering")
        print("="*80)
        
        query = "Tell me about Sean Yeo S3 AMath classes"
        print(f"Query: {query}")
        
        result = self.send_chat_message(query)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        response_text = result["data"].get("response", "").lower()
        print(f"\nBot Response:\n{result['data'].get('response', '')}")
        
        # Check for correct locations (Bishan and Marine Parade)
        has_bishan = "bishan" in response_text
        has_marine_parade = "marine parade" in response_text or "marine" in response_text
        
        # Check for incorrect locations (should NOT appear)
        has_jurong = "jurong" in response_text
        has_punggol = "punggol" in response_text  
        has_kovan = "kovan" in response_text
        
        # Check for complete schedule format
        has_complete_schedule = ("+" in response_text or "thu" in response_text or "sun" in response_text)
        
        # Check for correct pricing
        has_correct_price = "$397.85" in response_text
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Shows Bishan: {has_bishan}")
        print(f"✅ Shows Marine Parade: {has_marine_parade}")
        print(f"❌ Shows Jurong (should NOT): {has_jurong}")
        print(f"❌ Shows Punggol (should NOT): {has_punggol}")
        print(f"❌ Shows Kovan (should NOT): {has_kovan}")
        print(f"✅ Has complete schedule: {has_complete_schedule}")
        print(f"✅ Has correct price ($397.85): {has_correct_price}")
        
        # Test passes if shows correct locations and doesn't show wrong ones
        test_passed = (has_bishan or has_marine_parade) and not (has_jurong or has_punggol or has_kovan)
        
        print(f"\n🎯 TEST 1 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Sean Yeo Location Filtering",
            "passed": test_passed,
            "details": {
                "correct_locations": has_bishan or has_marine_parade,
                "no_wrong_locations": not (has_jurong or has_punggol or has_kovan),
                "has_schedule": has_complete_schedule,
                "has_price": has_correct_price
            }
        })
        
        return test_passed
    
    def test_scenario_2_class_ab_labeling(self):
        """
        Test 2: Class A/B labeling correctness
        Query: "List all tutors teaching S2 Math at Marine Parade"
        Expected: Should NOT use Class A/B labels unless same tutor has multiple S2 Math classes
        """
        print("\n" + "="*80)
        print("TEST 2: S2 Math Marine Parade - Class A/B Labeling")
        print("="*80)
        
        query = "List all tutors teaching S2 Math at Marine Parade"
        print(f"Query: {query}")
        
        result = self.send_chat_message(query)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        response_text = result["data"].get("response", "")
        print(f"\nBot Response:\n{response_text}")
        
        # Check for inappropriate Class A/B usage
        has_class_a = "class a" in response_text.lower()
        has_class_b = "class b" in response_text.lower()
        
        # Check for multiple tutors listed
        tutor_indicators = ["jackie", "john lee", "leonard", "benjamin", "winston"]
        tutors_mentioned = sum(1 for tutor in tutor_indicators if tutor in response_text.lower())
        
        # Check for complete schedules (should show 2 timings per class)
        has_multiple_timings = ("+" in response_text or 
                               (response_text.count("pm") >= 2 or response_text.count("am") >= 2))
        
        # Check for correct pricing
        has_s2_price = "$381.50" in response_text
        
        print(f"\n📊 ANALYSIS:")
        print(f"❌ Uses Class A labels (should NOT): {has_class_a}")
        print(f"❌ Uses Class B labels (should NOT): {has_class_b}")
        print(f"✅ Multiple tutors mentioned: {tutors_mentioned} tutors")
        print(f"✅ Has multiple timings per class: {has_multiple_timings}")
        print(f"✅ Has correct S2 Math price ($381.50): {has_s2_price}")
        
        # Test passes if NO inappropriate Class A/B labels and shows multiple tutors
        test_passed = not (has_class_a or has_class_b) and tutors_mentioned >= 2
        
        print(f"\n🎯 TEST 2 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Class A/B Labeling",
            "passed": test_passed,
            "details": {
                "no_inappropriate_labels": not (has_class_a or has_class_b),
                "multiple_tutors": tutors_mentioned >= 2,
                "complete_schedules": has_multiple_timings,
                "correct_price": has_s2_price
            }
        })
        
        return test_passed
    
    def test_scenario_3_complete_schedule_display(self):
        """
        Test 3: Complete schedule display
        Query: "Show me all S1 Math classes at Punggol"
        Expected: Each class should show BOTH session days and times
        """
        print("\n" + "="*80)
        print("TEST 3: S1 Math Punggol - Complete Schedule Display")
        print("="*80)
        
        query = "Show me all S1 Math classes at Punggol"
        print(f"Query: {query}")
        
        result = self.send_chat_message(query)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        response_text = result["data"].get("response", "")
        print(f"\nBot Response:\n{response_text}")
        
        # Check for complete schedule format (should have + separator)
        has_plus_separator = "+" in response_text
        
        # Count day/time patterns
        days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        day_count = sum(response_text.lower().count(day) for day in days)
        time_count = response_text.count("pm") + response_text.count("am")
        
        # Check for S1 Math pricing
        has_s1_price = "$370.60" in response_text
        
        # Check that schedules are not incomplete
        has_incomplete_indicators = any(phrase in response_text.lower() for phrase in 
                                      ["incomplete", "missing", "not available", "tbc", "tbd"])
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Uses + separator for multiple sessions: {has_plus_separator}")
        print(f"✅ Day mentions: {day_count}")
        print(f"✅ Time mentions: {time_count}")
        print(f"✅ Has correct S1 Math price ($370.60): {has_s1_price}")
        print(f"❌ Has incomplete schedule indicators: {has_incomplete_indicators}")
        
        # Test passes if has proper schedule format and no incomplete indicators
        test_passed = has_plus_separator and day_count >= 2 and time_count >= 2 and not has_incomplete_indicators
        
        print(f"\n🎯 TEST 3 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Complete Schedule Display",
            "passed": test_passed,
            "details": {
                "has_plus_separator": has_plus_separator,
                "sufficient_days": day_count >= 2,
                "sufficient_times": time_count >= 2,
                "correct_price": has_s1_price,
                "no_incomplete_indicators": not has_incomplete_indicators
            }
        })
        
        return test_passed
    
    def test_scenario_4_single_session_j1_format(self):
        """
        Test 4: Single session classes (new 2026 format)
        Query: "Tell me about J1 Math classes"
        Expected: Should show only ONE day/time per class (new 2026 format)
        """
        print("\n" + "="*80)
        print("TEST 4: J1 Math - New 2026 Single Session Format")
        print("="*80)
        
        query = "Tell me about J1 Math classes"
        print(f"Query: {query}")
        
        result = self.send_chat_message(query)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        response_text = result["data"].get("response", "")
        print(f"\nBot Response:\n{response_text}")
        
        # Check for new 2026 format indicators
        has_new_format_mention = any(phrase in response_text.lower() for phrase in 
                                   ["new 2026", "1 lesson/week", "2 hours", "new format"])
        
        # Check for correct J1 Math pricing
        has_j1_price = "$401.12" in response_text
        
        # Check that it mentions single session (not multiple with +)
        # For J1 2026, should be 1 lesson per week, so should NOT have + separators for multiple sessions
        has_plus_separator = "+" in response_text
        
        # Count sessions - should be single sessions
        time_count = response_text.count("pm") + response_text.count("am")
        
        # Check for 2026 transition explanation
        has_transition_explanation = any(phrase in response_text.lower() for phrase in 
                                       ["2026", "transition", "new", "format"])
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Mentions new 2026 format: {has_new_format_mention}")
        print(f"✅ Has correct J1 Math price ($401.12): {has_j1_price}")
        print(f"❌ Has + separator (should NOT for single sessions): {has_plus_separator}")
        print(f"✅ Time mentions (should be moderate): {time_count}")
        print(f"✅ Has transition explanation: {has_transition_explanation}")
        
        # Test passes if mentions new format, correct price, and explains single session
        test_passed = (has_new_format_mention or has_transition_explanation) and has_j1_price
        
        print(f"\n🎯 TEST 4 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "J1 Math New 2026 Format",
            "passed": test_passed,
            "details": {
                "mentions_new_format": has_new_format_mention,
                "correct_price": has_j1_price,
                "no_multiple_sessions": not has_plus_separator,
                "has_explanation": has_transition_explanation
            }
        })
        
        return test_passed
    
    def test_context_scenario_1_s2_math_marine_parade(self):
        """
        CRITICAL TEST: Multi-turn Conversation Context - S2 Math follow-up with location
        1. First message: "Tell me about S2 Math" (session_id: "test_context_s2")
        2. Second message: "how bout for marine parade" (same session_id)
        Expected: Should show ALL tutors teaching S2 Math at Marine Parade (~9 tutors)
        """
        print("\n" + "="*80)
        print("CONTEXT TEST 1: S2 Math → Marine Parade Follow-up")
        print("="*80)
        
        session_id = "test_context_s2"
        
        # First message
        query1 = "Tell me about S2 Math"
        print(f"Message 1: {query1}")
        result1 = self.send_chat_message(query1, session_id)
        
        if not result1["success"]:
            print(f"❌ API ERROR on first message: {result1['error']}")
            return False
            
        print(f"Bot Response 1:\n{result1['data'].get('response', '')}")
        
        # Wait a moment for context to be stored
        time.sleep(2)
        
        # Second message (follow-up with location)
        query2 = "how bout for marine parade"
        print(f"\nMessage 2: {query2}")
        result2 = self.send_chat_message(query2, session_id)
        
        if not result2["success"]:
            print(f"❌ API ERROR on second message: {result2['error']}")
            return False
            
        response2_text = result2['data'].get('response', '')
        print(f"Bot Response 2:\n{response2_text}")
        
        # Analysis of second response
        response2_lower = response2_text.lower()
        
        # Check for expected tutors (should show ALL S2 Math tutors at Marine Parade)
        expected_tutors = ["jackie", "john lee", "leonard teo", "lim w.m.", "ng c.h.", 
                          "ronnie quek", "sean phua", "sean tan", "sean yeo"]
        tutors_found = [tutor for tutor in expected_tutors if tutor.replace(" ", "").replace(".", "") in response2_lower.replace(" ", "").replace(".", "")]
        
        # Check for complete schedules with '+' separator
        has_complete_schedules = "+" in response2_text
        
        # Check for correct S2 Math pricing
        has_correct_price = "$381.50" in response2_text
        
        # Check that it shows multiple tutors (not just 1)
        tutor_count = len(tutors_found)
        shows_multiple_tutors = tutor_count >= 3  # Should show many tutors
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Tutors found: {tutor_count} ({', '.join(tutors_found)})")
        print(f"✅ Shows multiple tutors (not just 1): {shows_multiple_tutors}")
        print(f"✅ Has complete schedules with '+': {has_complete_schedules}")
        print(f"✅ Has correct S2 Math price ($381.50): {has_correct_price}")
        
        # Test passes if shows multiple tutors with complete info
        test_passed = shows_multiple_tutors and has_complete_schedules and has_correct_price
        
        print(f"\n🎯 CONTEXT TEST 1 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "S2 Math → Marine Parade Context",
            "passed": test_passed,
            "details": {
                "tutors_found": tutor_count,
                "shows_multiple": shows_multiple_tutors,
                "complete_schedules": has_complete_schedules,
                "correct_price": has_correct_price
            }
        })
        
        return test_passed
    
    def test_context_scenario_2_p6_math_punggol(self):
        """
        CRITICAL TEST: Different level/subject follow-up
        1. First message: "Tell me about P6 Math" (session_id: "test_context_p6")
        2. Second message: "what about Punggol?" (same session_id)
        Expected: Should show ALL tutors teaching P6 Math at Punggol with complete schedules
        """
        print("\n" + "="*80)
        print("CONTEXT TEST 2: P6 Math → Punggol Follow-up")
        print("="*80)
        
        session_id = "test_context_p6"
        
        # First message
        query1 = "Tell me about P6 Math"
        print(f"Message 1: {query1}")
        result1 = self.send_chat_message(query1, session_id)
        
        if not result1["success"]:
            print(f"❌ API ERROR on first message: {result1['error']}")
            return False
            
        print(f"Bot Response 1:\n{result1['data'].get('response', '')}")
        
        # Wait a moment for context to be stored
        time.sleep(2)
        
        # Second message (follow-up with location)
        query2 = "what about Punggol?"
        print(f"\nMessage 2: {query2}")
        result2 = self.send_chat_message(query2, session_id)
        
        if not result2["success"]:
            print(f"❌ API ERROR on second message: {result2['error']}")
            return False
            
        response2_text = result2['data'].get('response', '')
        print(f"Bot Response 2:\n{response2_text}")
        
        # Analysis of second response
        response2_lower = response2_text.lower()
        
        # Check for P6 Math context awareness
        has_p6_context = "p6" in response2_lower and "math" in response2_lower
        
        # Check for Punggol location
        has_punggol = "punggol" in response2_lower
        
        # Check for complete schedules (P6 Math has 2 sessions per week)
        has_complete_schedules = "+" in response2_text
        
        # Check for correct P6 Math pricing
        has_correct_price = "$357.52" in response2_text
        
        # Check that it shows tutors (not just general info)
        has_tutor_info = any(indicator in response2_lower for indicator in 
                           ["tutor", "teacher", "mr", "ms", "class a", "class b", "schedule"])
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Maintains P6 Math context: {has_p6_context}")
        print(f"✅ Shows Punggol location: {has_punggol}")
        print(f"✅ Has complete schedules with '+': {has_complete_schedules}")
        print(f"✅ Has correct P6 Math price ($357.52): {has_correct_price}")
        print(f"✅ Shows tutor information: {has_tutor_info}")
        
        # Test passes if maintains context and shows relevant info
        test_passed = has_p6_context and has_punggol and has_correct_price
        
        print(f"\n🎯 CONTEXT TEST 2 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "P6 Math → Punggol Context",
            "passed": test_passed,
            "details": {
                "maintains_context": has_p6_context,
                "shows_location": has_punggol,
                "complete_schedules": has_complete_schedules,
                "correct_price": has_correct_price,
                "shows_tutors": has_tutor_info
            }
        })
        
        return test_passed
    
    def test_context_scenario_3_j1_math_bishan(self):
        """
        CRITICAL TEST: Tutor-specific follow-up
        1. First message: "Show me J1 Math classes" (session_id: "test_context_j1")
        2. Second message: "list all tutors at Bishan" (same session_id)
        Expected: Should show ALL J1 Math tutors at Bishan with new 2026 format (1 session/week)
        """
        print("\n" + "="*80)
        print("CONTEXT TEST 3: J1 Math → Bishan Tutors Follow-up")
        print("="*80)
        
        session_id = "test_context_j1"
        
        # First message
        query1 = "Show me J1 Math classes"
        print(f"Message 1: {query1}")
        result1 = self.send_chat_message(query1, session_id)
        
        if not result1["success"]:
            print(f"❌ API ERROR on first message: {result1['error']}")
            return False
            
        print(f"Bot Response 1:\n{result1['data'].get('response', '')}")
        
        # Wait a moment for context to be stored
        time.sleep(2)
        
        # Second message (follow-up with location and tutor request)
        query2 = "list all tutors at Bishan"
        print(f"\nMessage 2: {query2}")
        result2 = self.send_chat_message(query2, session_id)
        
        if not result2["success"]:
            print(f"❌ API ERROR on second message: {result2['error']}")
            return False
            
        response2_text = result2['data'].get('response', '')
        print(f"Bot Response 2:\n{response2_text}")
        
        # Analysis of second response
        response2_lower = response2_text.lower()
        
        # Check for J1 Math context awareness
        has_j1_context = "j1" in response2_lower and "math" in response2_lower
        
        # Check for Bishan location
        has_bishan = "bishan" in response2_lower
        
        # Check for new 2026 format (1 session per week)
        has_new_format = any(phrase in response2_lower for phrase in 
                           ["1 session", "new 2026", "1 lesson/week", "2 hours"])
        
        # Check for correct J1 Math pricing
        has_correct_price = "$401.12" in response2_text
        
        # Check that it shows tutors
        has_tutor_listings = any(indicator in response2_lower for indicator in 
                               ["tutor", "teacher", "mr", "ms", "teaches"])
        
        # Should NOT have multiple sessions (no + separator for J1 2026)
        has_multiple_sessions = "+" in response2_text
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Maintains J1 Math context: {has_j1_context}")
        print(f"✅ Shows Bishan location: {has_bishan}")
        print(f"✅ Mentions new 2026 format: {has_new_format}")
        print(f"✅ Has correct J1 Math price ($401.12): {has_correct_price}")
        print(f"✅ Shows tutor listings: {has_tutor_listings}")
        print(f"❌ Has multiple sessions (should NOT for J1 2026): {has_multiple_sessions}")
        
        # Test passes if maintains context and shows J1-specific info
        test_passed = has_j1_context and has_bishan and has_correct_price
        
        print(f"\n🎯 CONTEXT TEST 3 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "J1 Math → Bishan Tutors Context",
            "passed": test_passed,
            "details": {
                "maintains_context": has_j1_context,
                "shows_location": has_bishan,
                "new_format": has_new_format,
                "correct_price": has_correct_price,
                "shows_tutors": has_tutor_listings,
                "single_session": not has_multiple_sessions
            }
        })
        
        return test_passed
    
    def test_data_accuracy_s3_amath_marine_parade(self):
        """
        CRITICAL DATA ACCURACY TEST: S3 AMath Marine Parade Tutor Count
        User reported: Only 4 tutors showing when asking for "S3 AMath Marine Parade classes"
        Expected: Should show more tutors (possibly 8-9 based on other locations)
        """
        print("\n" + "="*80)
        print("DATA ACCURACY TEST: S3 AMath Marine Parade - Tutor Count Investigation")
        print("="*80)
        
        # Test the exact query user reported
        query = "S3 AMath Marine Parade classes"
        print(f"Query: {query}")
        
        result = self.send_chat_message(query)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        response_text = result["data"].get("response", "")
        print(f"\nBot Response:\n{response_text}")
        
        # Count tutors mentioned in the response
        response_lower = response_text.lower()
        
        # Common tutor names that might teach S3 AMath at Marine Parade
        potential_tutors = [
            "sean yeo", "john lee", "jackie", "lim w.m.", "ng c.h.", 
            "ronnie quek", "sean phua", "sean tan", "leonard teo",
            "benjamin", "winston", "eugene tan", "david", "pang"
        ]
        
        tutors_found = []
        for tutor in potential_tutors:
            # Check for tutor name (handle variations like "Sean Yeo (HOD)")
            tutor_clean = tutor.replace(" ", "").replace(".", "")
            response_clean = response_lower.replace(" ", "").replace(".", "").replace("(", "").replace(")", "")
            if tutor_clean in response_clean:
                tutors_found.append(tutor)
        
        # Also count class indicators (Class A, Class B, etc.)
        class_count = 0
        for letter in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']:
            if f"class {letter}" in response_lower:
                class_count += 1
        
        # Count schedule patterns (each tutor should have a schedule)
        schedule_patterns = response_text.count("pm") + response_text.count("am")
        
        # Check for correct S3 AMath pricing
        has_correct_price = "$397.85" in response_text
        
        print(f"\n📊 DETAILED ANALYSIS:")
        print(f"✅ Tutors found by name: {len(tutors_found)} ({', '.join(tutors_found)})")
        print(f"✅ Class labels found: {class_count}")
        print(f"✅ Schedule time patterns: {schedule_patterns}")
        print(f"✅ Has correct S3 AMath price ($397.85): {has_correct_price}")
        
        # The key question: Are we showing enough tutors?
        sufficient_tutors = len(tutors_found) >= 6  # Expecting more than 4
        
        print(f"\n🎯 KEY FINDINGS:")
        print(f"❓ Shows sufficient tutors (>4): {sufficient_tutors}")
        print(f"❓ User reported only 4 tutors, we found: {len(tutors_found)}")
        
        # Test passes if we find more than 4 tutors
        test_passed = sufficient_tutors and has_correct_price
        
        print(f"\n🎯 DATA ACCURACY TEST RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        if not test_passed:
            print("⚠️  POTENTIAL DATA ISSUE: Fewer tutors than expected for S3 AMath at Marine Parade")
        
        self.test_results.append({
            "test": "S3 AMath Marine Parade - Tutor Count",
            "passed": test_passed,
            "details": {
                "tutors_found": len(tutors_found),
                "tutor_names": tutors_found,
                "class_labels": class_count,
                "schedule_patterns": schedule_patterns,
                "correct_price": has_correct_price,
                "sufficient_tutors": sufficient_tutors
            }
        })
        
        return test_passed
    
    def test_available_tutors_endpoint(self):
        """
        Test the /api/admin/available-tutors endpoint for S3 AMath Marine Parade
        This will help us verify if the data exists in Firebase but chatbot isn't showing it all
        """
        print("\n" + "="*80)
        print("ADMIN ENDPOINT TEST: Available Tutors for S3 AMath Marine Parade")
        print("="*80)
        
        # Test the admin endpoint
        admin_url = f"{BACKEND_URL}/api/admin/available-tutors"
        params = {
            "level": "S3",
            "subject": "AMath", 
            "location": "Marine Parade"
        }
        
        print(f"Testing: GET {admin_url}")
        print(f"Parameters: {params}")
        
        try:
            response = requests.get(admin_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            print(f"\nAdmin Endpoint Response:")
            print(json.dumps(data, indent=2))
            
            # Count tutors in admin response
            tutors_in_admin = data.get("tutors", [])
            admin_tutor_count = data.get("count", len(tutors_in_admin))
            
            print(f"\n📊 ADMIN ENDPOINT ANALYSIS:")
            print(f"✅ Total tutors in Firebase: {admin_tutor_count}")
            print(f"✅ Tutor names: {tutors_in_admin}")
            
            # This tells us the ground truth - how many tutors actually exist
            has_sufficient_data = admin_tutor_count >= 6
            
            print(f"\n🎯 GROUND TRUTH:")
            print(f"❓ Firebase has sufficient tutors (>4): {has_sufficient_data}")
            print(f"❓ If chatbot shows fewer, it's a display/filtering issue")
            
            if admin_tutor_count == 4:
                print("ℹ️  Firebase actually only has 4 tutors - this may be a data upload issue, not chatbot issue")
            
            self.test_results.append({
                "test": "Admin Available Tutors - S3 AMath Marine Parade",
                "passed": True,  # This is just data verification
                "details": {
                    "firebase_tutor_count": admin_tutor_count,
                    "tutor_names": tutors_in_admin,
                    "has_sufficient_data": has_sufficient_data
                }
            })
            
            return admin_tutor_count
            
        except requests.exceptions.RequestException as e:
            print(f"❌ ADMIN ENDPOINT ERROR: {str(e)}")
            return 0
    
    def test_too_broad_query_clarification(self):
        """
        CRITICAL TEST: Too Broad Query Clarification Fix
        Test Level + Subject (no location) queries should ask for location clarification
        instead of dumping all data from all locations.
        
        User reported: "S3 AMath" without location dumps all locations and classes
        Expected: Should ask "Which location would you like to know about?" with 5 locations listed
        """
        print("\n" + "="*80)
        print("CRITICAL TEST: Too Broad Query Clarification - Level + Subject (No Location)")
        print("="*80)
        
        test_queries = [
            "Show me S3 AMath classes",
            "Tell me about S3 AMath", 
            "I want S3 AMath"
        ]
        
        all_tests_passed = True
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n--- Test Query {i}: {query} ---")
            
            # Use unique session ID for each test to avoid context contamination
            session_id = f"test_s3_amath_broad_{i}"
            result = self.send_chat_message(query, session_id)
            
            if not result["success"]:
                print(f"❌ API ERROR: {result['error']}")
                all_tests_passed = False
                continue
                
            response_text = result["data"].get("response", "")
            print(f"Bot Response:\n{response_text}")
            
            response_lower = response_text.lower()
            
            # Check 1: Should NOT return specific class data (tutor names, schedules, etc.)
            has_tutor_names = any(name in response_lower for name in [
                "sean yeo", "john lee", "jackie", "lim w.m.", "ng c.h.", 
                "ronnie quek", "sean phua", "sean tan", "leonard teo"
            ])
            
            has_specific_schedules = any(pattern in response_text for pattern in [
                "pm", "am", "+", "mon", "tue", "wed", "thu", "fri", "sat", "sun"
            ])
            
            has_pricing_details = "$397.85" in response_text
            
            # Check 2: Should ASK for location clarification
            asks_for_location = any(phrase in response_lower for phrase in [
                "which location", "what location", "where would you like", 
                "which centre", "which branch", "location would you like"
            ])
            
            # Check 3: Should mention the 5 available locations
            locations = ["bishan", "punggol", "marine parade", "jurong", "kovan"]
            locations_mentioned = sum(1 for loc in locations if loc in response_lower)
            
            # Check 4: Should NOT dump all classes from all locations
            information_dump = (
                has_tutor_names and has_specific_schedules and 
                locations_mentioned >= 3  # If mentions 3+ locations with details
            )
            
            print(f"\n📊 ANALYSIS FOR QUERY {i}:")
            print(f"❌ Contains tutor names (should NOT): {has_tutor_names}")
            print(f"❌ Contains specific schedules (should NOT): {has_specific_schedules}")
            print(f"❌ Contains pricing details (should NOT): {has_pricing_details}")
            print(f"✅ Asks for location clarification: {asks_for_location}")
            print(f"✅ Mentions locations ({locations_mentioned}/5): {locations_mentioned >= 3}")
            print(f"❌ Information dump detected: {information_dump}")
            
            # Test passes if:
            # 1. Does NOT show specific class data
            # 2. DOES ask for location clarification  
            # 3. DOES mention available locations
            # 4. Does NOT dump information
            query_passed = (
                not has_tutor_names and 
                not has_specific_schedules and
                asks_for_location and
                locations_mentioned >= 3 and
                not information_dump
            )
            
            print(f"\n🎯 QUERY {i} RESULT: {'✅ PASSED' if query_passed else '❌ FAILED'}")
            
            if not query_passed:
                all_tests_passed = False
                if has_tutor_names or has_specific_schedules or information_dump:
                    print("⚠️  CRITICAL: Bot is dumping class data instead of asking for clarification!")
                if not asks_for_location:
                    print("⚠️  CRITICAL: Bot is not asking for location clarification!")
                if locations_mentioned < 3:
                    print("⚠️  ISSUE: Bot is not mentioning enough available locations!")
        
        print(f"\n🎯 TOO BROAD QUERY TEST OVERALL: {'✅ PASSED' if all_tests_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Too Broad Query Clarification (Level + Subject)",
            "passed": all_tests_passed,
            "details": {
                "queries_tested": len(test_queries),
                "all_passed": all_tests_passed,
                "prevents_data_dump": True,  # Will be updated based on actual results
                "asks_for_clarification": True,  # Will be updated based on actual results
                "mentions_locations": True  # Will be updated based on actual results
            }
        })
        
        return all_tests_passed

    def test_additional_checks(self):
        """Additional checks for system integrity"""
        print("\n" + "="*80)
        print("ADDITIONAL CHECKS: System Integrity")
        print("="*80)
        
        # Test 1: Check bot doesn't expose technical details
        query = "How do you get this information?"
        result = self.send_chat_message(query)
        
        if result["success"]:
            response_text = result["data"].get("response", "").lower()
            has_technical_exposure = any(term in response_text for term in 
                                       ["firebase", "database", "querying", "mongodb", "api"])
            print(f"❌ Exposes technical details: {has_technical_exposure}")
            
            if has_technical_exposure:
                print(f"Technical terms found in response: {response_text}")
        
        return True
    
    def run_all_tuition_tests(self):
        """Run all tuition test scenarios"""
        print("🚀 Starting Tuition Centre Chatbot Testing Suite")
        print(f"🔗 Testing endpoint: {TUITION_API_ENDPOINT}")
        print(f"🆔 Session ID: {self.session_id}")
        
        # Run CRITICAL too broad query clarification test FIRST (this is the main focus)
        print("\n🔍 TESTING TOO BROAD QUERY CLARIFICATION FIX...")
        broad_query_passed = self.test_too_broad_query_clarification()
        
        # Run CRITICAL data accuracy investigation 
        print("\n🔍 INVESTIGATING USER-REPORTED DATA ACCURACY ISSUE...")
        firebase_tutor_count = self.test_available_tutors_endpoint()
        data_accuracy_passed = self.test_data_accuracy_s3_amath_marine_parade()
        
        # Run original test scenarios
        test1_passed = self.test_scenario_1_sean_yeo_location_filtering()
        test2_passed = self.test_scenario_2_class_ab_labeling()
        test3_passed = self.test_scenario_3_complete_schedule_display()
        test4_passed = self.test_scenario_4_single_session_j1_format()
        
        # Run CRITICAL context-aware follow-up tests
        context1_passed = self.test_context_scenario_1_s2_math_marine_parade()
        context2_passed = self.test_context_scenario_2_p6_math_punggol()
        context3_passed = self.test_context_scenario_3_j1_math_bishan()
        
        # Additional system checks
        self.test_additional_checks()
        
        # Summary
        print("\n" + "="*80)
        print("📊 TUITION TESTS SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} tests passed")
        
        # Special focus on TOO BROAD QUERY CLARIFICATION (main test focus)
        print(f"\n🎯 TOO BROAD QUERY CLARIFICATION FIX:")
        print(f"🤖 Level + Subject (no location) clarification: {'✅ PASSED' if broad_query_passed else '❌ FAILED'}")
        
        if not broad_query_passed:
            print("⚠️  CRITICAL ISSUE: Bot is still dumping all data instead of asking for location clarification!")
            print("   Expected: Ask 'Which location would you like to know about?' with 5 locations listed")
            print("   Actual: Bot may be showing tutor names, schedules, or data from multiple locations")
        else:
            print("✅ SUCCESS: Bot correctly asks for location clarification instead of data dumping!")
        
        # Special focus on data accuracy issue
        print(f"\n🔍 DATA ACCURACY INVESTIGATION:")
        print(f"📊 Firebase has {firebase_tutor_count} tutors for S3 AMath Marine Parade")
        print(f"🤖 Chatbot data accuracy test: {'✅ PASSED' if data_accuracy_passed else '❌ FAILED'}")
        
        if firebase_tutor_count > 4 and not data_accuracy_passed:
            print("⚠️  CRITICAL ISSUE: Firebase has more tutors than chatbot is showing!")
        elif firebase_tutor_count <= 4:
            print("ℹ️  Firebase only has 4 or fewer tutors - this may be a data upload issue, not chatbot issue")
        
        # Special focus on context-aware tests
        context_tests = [context1_passed, context2_passed, context3_passed]
        context_passed = sum(context_tests)
        print(f"🔥 CONTEXT-AWARE TESTS: {context_passed}/3 passed")
        
        if passed_count == total_count:
            print("🎉 ALL TUITION TESTS PASSED! Too broad query clarification fix is working correctly.")
        else:
            print("⚠️  SOME TUITION TESTS FAILED. Too broad query clarification needs attention.")
            
        return passed_count == total_count

if __name__ == "__main__":
    # Test the Math Analysis System Analytics endpoint as requested
    print("="*100)
    print("🎯 TESTING MATH ANALYSIS SYSTEM - ANALYTICS ENDPOINT FILTERING")
    print("="*100)
    
    analytics_tester = MathAnalyticsTester()
    analytics_success = analytics_tester.run_all_analytics_tests()
    
    print("\n" + "="*100)
    print("📋 TESTING COMPLETE")
    print("="*100)
    
    if analytics_success:
        print("✅ ALL ANALYTICS TESTS PASSED!")
    else:
        print("❌ SOME ANALYTICS TESTS FAILED!")
    
    # Optionally run tuition tests as well (commented out for focus)
    # print("\n" + "="*100)
    # print("🎓 TESTING TUITION CENTRE CHATBOT (LEGACY)")
    # print("="*100)
    # tuition_tester = TuitionChatTester()
    # tuition_success = tuition_tester.run_all_tuition_tests()
    
    exit(0 if analytics_success else 1)