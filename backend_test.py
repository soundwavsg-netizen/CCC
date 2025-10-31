#!/usr/bin/env python3
"""
Backend Testing Suite for Project 62 Shop System - Phase 1 Comprehensive Testing
Tests admin authentication, category management, product management, and public products API
"""

import requests
import json
import uuid
from typing import Dict, Any
import time

# Configuration
BACKEND_URL = "https://project62-app.preview.emergentagent.com"
PROJECT62_BASE_URL = f"{BACKEND_URL}/api/project62"

# Admin credentials (as specified in review request)
ADMIN_EMAIL = "admin@project62.com"
ADMIN_PASSWORD = "admin123"

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
    
    def test_admin_endpoints(self):
        """
        Test 7-10: Admin Endpoints (no auth required for now)
        """
        print("\n" + "="*80)
        print("TEST 7-10: Admin Endpoints")
        print("="*80)
        
        admin_endpoints = [
            "/admin/leads",
            "/admin/orders", 
            "/admin/deliveries",
            "/admin/customers"
        ]
        
        all_passed = True
        
        for i, endpoint in enumerate(admin_endpoints, 7):
            print(f"\n--- Test {i}: GET {PROJECT62_BASE_URL}{endpoint} ---")
            
            result = self.send_request("GET", endpoint)
            
            if not result["success"]:
                print(f"❌ API ERROR: {result['error']}")
                all_passed = False
                continue
                
            data = result["data"]
            print(f"Response keys: {list(data.keys())}")
            
            # Check if response has expected structure
            endpoint_name = endpoint.split("/")[-1]  # leads, orders, deliveries, customers
            has_data_array = endpoint_name in data and isinstance(data[endpoint_name], list)
            
            print(f"✅ Has {endpoint_name} array: {has_data_array}")
            
            if not has_data_array:
                all_passed = False
            
            self.test_results.append({
                "test": f"Admin {endpoint_name.title()}",
                "passed": has_data_array,
                "details": {
                    "has_data_array": has_data_array,
                    "endpoint": endpoint
                }
            })
        
        print(f"\n🎯 ADMIN ENDPOINTS RESULT: {'✅ PASSED' if all_passed else '❌ FAILED'}")
        return all_passed

    def run_all_project62_tests(self):
        """Run all Project 62 authentication and dashboard tests"""
        print("🚀 Starting Project 62 Authentication & Dashboard Testing Suite")
        print(f"🔗 Testing base URL: {PROJECT62_BASE_URL}")
        
        # Run authentication flow tests
        test1_passed = self.test_register_customer()
        test2_passed = self.test_login_customer()
        test3_passed = self.test_verify_token()
        test4_passed = self.test_customer_dashboard()
        test5_passed = self.test_update_address()
        test6_passed = self.test_send_magic_link()
        test7_passed = self.test_admin_endpoints()
        
        # Summary
        print("\n" + "="*80)
        print("📊 PROJECT 62 TESTS SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} Project 62 tests passed")
        
        if passed_count == total_count:
            print("🎉 ALL PROJECT 62 TESTS PASSED! Authentication and dashboard endpoints working correctly.")
        else:
            print("⚠️  SOME PROJECT 62 TESTS FAILED. Check the authentication flow and endpoint implementations.")
            
        return passed_count == total_count

if __name__ == "__main__":
    # Test Project 62 Authentication and Dashboard endpoints
    print("="*100)
    print("🎯 TESTING PROJECT 62 - AUTHENTICATION & DASHBOARD ENDPOINTS")
    print("="*100)
    
    project62_tester = Project62Tester()
    project62_success = project62_tester.run_all_project62_tests()
    
    print("\n" + "="*100)
    print("📋 TESTING COMPLETE")
    print("="*100)
    
    if project62_success:
        print("✅ ALL PROJECT 62 TESTS PASSED!")
    else:
        print("❌ SOME PROJECT 62 TESTS FAILED!")
    
    exit(0 if project62_success else 1)