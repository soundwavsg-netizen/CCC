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
BACKEND_URL = "https://fitness-portal-18.preview.emergentagent.com"
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
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
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

    def test_admin_login(self):
        """
        Test Admin Login for Shop System Testing
        POST /api/project62/auth/login with admin credentials
        """
        print("\n" + "="*80)
        print("TEST: Admin Login for Shop System")
        print("="*80)
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        print(f"Request: POST {PROJECT62_BASE_URL}/auth/login")
        print(f"Data: {json.dumps({k: v if k != 'password' else '***' for k, v in login_data.items()}, indent=2)}")
        
        result = self.send_request("POST", "/auth/login", login_data)
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False, None
            
        data = result["data"]
        print(f"\nAPI Response:\n{json.dumps(data, indent=2)}")
        
        # Check response structure
        has_status = data.get("status") == "success"
        has_token = "token" in data and data["token"]
        has_user = "user" in data and data["user"]
        
        if has_user:
            user_data = data["user"]
            correct_email = user_data.get("email") == ADMIN_EMAIL
            has_uid = "uid" in user_data
        else:
            correct_email = has_uid = False
        
        print(f"\n📊 ANALYSIS:")
        print(f"✅ Status success: {has_status}")
        print(f"✅ Has JWT token: {has_token}")
        print(f"✅ Has user object: {has_user}")
        print(f"✅ Correct email: {correct_email}")
        print(f"✅ Has Firebase UID: {has_uid}")
        
        test_passed = has_status and has_token and has_user and correct_email and has_uid
        admin_token = data["token"] if test_passed else None
        
        print(f"\n🎯 ADMIN LOGIN RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Admin Login",
            "passed": test_passed,
            "details": {
                "has_status": has_status,
                "has_token": has_token,
                "has_user": has_user,
                "correct_email": correct_email,
                "has_uid": has_uid
            }
        })
        
        return test_passed, admin_token

    def test_category_management(self, admin_token):
        """
        Test Category Management CRUD Operations
        """
        if not admin_token:
            print("❌ No admin token available for category tests")
            return False
            
        print("\n" + "="*80)
        print("TEST: Category Management CRUD")
        print("="*80)
        
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        all_tests_passed = True
        
        # Test 1: GET Categories (should return 4 seeded categories)
        print("\n--- Test 1: GET /admin/categories ---")
        result = self.send_request("GET", "/admin/categories", headers=headers)
        
        if not result["success"]:
            print(f"❌ GET Categories failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            categories = data.get("categories", [])
            count = data.get("count", 0)
            
            print(f"✅ Categories returned: {count}")
            print(f"✅ Expected categories found:")
            expected_categories = ["Digital Guides", "Meal Plans", "Subscriptions", "Physical Products"]
            for expected in expected_categories:
                found = any(cat.get("name") == expected for cat in categories)
                print(f"   {'✅' if found else '❌'} {expected}")
                if not found:
                    all_tests_passed = False
        
        # Test 2: POST Create Category
        print("\n--- Test 2: POST /admin/categories ---")
        test_category = {
            "name": "Test Category",
            "slug": "test-category"
        }
        
        result = self.send_request("POST", "/admin/categories", test_category, headers)
        
        if not result["success"]:
            print(f"❌ Create Category failed: {result['error']}")
            all_tests_passed = False
            test_category_id = None
        else:
            data = result["data"]
            test_category_id = data.get("category_id")
            category_data = data.get("category")
            
            print(f"✅ Category created with ID: {test_category_id}")
            print(f"✅ Category name: {category_data.get('name')}")
            print(f"✅ Category slug: {category_data.get('slug')}")
        
        # Test 3: PUT Update Category
        if test_category_id:
            print("\n--- Test 3: PUT /admin/categories/{category_id} ---")
            update_data = {
                "name": "Updated Test Category"
            }
            
            result = self.send_request("PUT", f"/admin/categories/{test_category_id}", update_data, headers)
            
            if not result["success"]:
                print(f"❌ Update Category failed: {result['error']}")
                all_tests_passed = False
            else:
                print(f"✅ Category updated successfully")
        
        # Test 4: DELETE Category
        if test_category_id:
            print("\n--- Test 4: DELETE /admin/categories/{category_id} ---")
            result = self.send_request("DELETE", f"/admin/categories/{test_category_id}", headers=headers)
            
            if not result["success"]:
                print(f"❌ Delete Category failed: {result['error']}")
                all_tests_passed = False
            else:
                print(f"✅ Category deleted successfully")
        
        print(f"\n🎯 CATEGORY MANAGEMENT RESULT: {'✅ PASSED' if all_tests_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Category Management CRUD",
            "passed": all_tests_passed,
            "details": {"all_crud_operations": all_tests_passed}
        })
        
        return all_tests_passed

    def test_product_management(self, admin_token):
        """
        Test Product Management CRUD Operations
        """
        if not admin_token:
            print("❌ No admin token available for product tests")
            return False
            
        print("\n" + "="*80)
        print("TEST: Product Management CRUD")
        print("="*80)
        
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        all_tests_passed = True
        
        # Test 1: GET Products (should return 4 seeded products)
        print("\n--- Test 1: GET /admin/products ---")
        result = self.send_request("GET", "/admin/products", headers=headers)
        
        if not result["success"]:
            print(f"❌ GET Products failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            count = data.get("count", 0)
            
            print(f"✅ Products returned: {count}")
            print(f"✅ Expected flagship products:")
            expected_products = ["6-Day Starter Guide", "6-Week Transformation Plan", "Custom Plan with Ian", "Meal Prep Subscription"]
            for expected in expected_products:
                found = any(prod.get("name") == expected for prod in products)
                print(f"   {'✅' if found else '❌'} {expected}")
                if not found:
                    all_tests_passed = False
            
            # Check product structure
            if products:
                sample_product = products[0]
                required_fields = ["product_id", "name", "description", "price", "type", "category", "tags", "is_featured", "featured_order", "visibility"]
                print(f"\n✅ Product structure validation:")
                for field in required_fields:
                    has_field = field in sample_product
                    print(f"   {'✅' if has_field else '❌'} {field}")
                    if not has_field:
                        all_tests_passed = False
        
        # Test 2: GET Products with filters
        print("\n--- Test 2: GET /admin/products with filters ---")
        
        # Test category filter
        result = self.send_request("GET", "/admin/products?category=Digital+Guides", headers=headers)
        if result["success"]:
            digital_products = result["data"].get("products", [])
            print(f"✅ Digital Guides filter: {len(digital_products)} products")
        else:
            print(f"❌ Category filter failed: {result['error']}")
            all_tests_passed = False
        
        # Test type filter
        result = self.send_request("GET", "/admin/products?type=digital", headers=headers)
        if result["success"]:
            digital_type_products = result["data"].get("products", [])
            print(f"✅ Digital type filter: {len(digital_type_products)} products")
        else:
            print(f"❌ Type filter failed: {result['error']}")
            all_tests_passed = False
        
        # Test featured filter
        result = self.send_request("GET", "/admin/products?featured=true", headers=headers)
        if result["success"]:
            featured_products = result["data"].get("products", [])
            print(f"✅ Featured filter: {len(featured_products)} products")
        else:
            print(f"❌ Featured filter failed: {result['error']}")
            all_tests_passed = False
        
        # Test 3: POST Create Product
        print("\n--- Test 3: POST /admin/products ---")
        test_product = {
            "name": "Test Digital Product",
            "description": "Test description for digital product",
            "price": 19.90,
            "type": "digital",
            "category": "Digital Guides",
            "tags": ["test", "demo"],
            "is_featured": False,
            "featured_order": 999,
            "visibility": "public"
        }
        
        result = self.send_request("POST", "/admin/products", test_product, headers)
        
        if not result["success"]:
            print(f"❌ Create Product failed: {result['error']}")
            all_tests_passed = False
            test_product_id = None
        else:
            data = result["data"]
            test_product_id = data.get("product_id")
            product_data = data.get("product")
            
            print(f"✅ Product created with ID: {test_product_id}")
            print(f"✅ Product name: {product_data.get('name')}")
            print(f"✅ Product slug: {product_data.get('product_id_slug')}")
            print(f"✅ Product price: ${product_data.get('price')}")
        
        # Test 4: PUT Update Product
        if test_product_id:
            print("\n--- Test 4: PUT /admin/products/{product_id} ---")
            update_data = {
                "name": "Updated Test Product",
                "price": 24.90,
                "is_featured": True
            }
            
            result = self.send_request("PUT", f"/admin/products/{test_product_id}", update_data, headers)
            
            if not result["success"]:
                print(f"❌ Update Product failed: {result['error']}")
                all_tests_passed = False
            else:
                print(f"✅ Product updated successfully")
                updates = result["data"].get("updates", {})
                print(f"✅ Updated fields: {list(updates.keys())}")
        
        # Test 5: DELETE Product
        if test_product_id:
            print("\n--- Test 5: DELETE /admin/products/{product_id} ---")
            result = self.send_request("DELETE", f"/admin/products/{test_product_id}", headers=headers)
            
            if not result["success"]:
                print(f"❌ Delete Product failed: {result['error']}")
                all_tests_passed = False
            else:
                print(f"✅ Product deleted successfully")
        
        print(f"\n🎯 PRODUCT MANAGEMENT RESULT: {'✅ PASSED' if all_tests_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Product Management CRUD",
            "passed": all_tests_passed,
            "details": {"all_crud_operations": all_tests_passed}
        })
        
        return all_tests_passed

    def test_public_products_api(self):
        """
        Test Public Products API (No authentication required)
        """
        print("\n" + "="*80)
        print("TEST: Public Products API")
        print("="*80)
        
        all_tests_passed = True
        
        # Test 1: GET /products (basic)
        print("\n--- Test 1: GET /products ---")
        result = self.send_request("GET", "/products")
        
        if not result["success"]:
            print(f"❌ GET Products failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            count = data.get("count", 0)
            total = data.get("total", 0)
            
            print(f"✅ Products returned: {count}")
            print(f"✅ Total products: {total}")
            print(f"✅ Response structure: products, count, total, offset, limit")
            
            # Verify only public products are returned
            for product in products:
                visibility = product.get("visibility", "")
                if visibility not in ["public", "member-only"]:
                    print(f"❌ Hidden product found in public API: {product.get('name')}")
                    all_tests_passed = False
        
        # Test 2: GET /products with category filter
        print("\n--- Test 2: GET /products?category=Digital+Guides ---")
        result = self.send_request("GET", "/products?category=Digital+Guides")
        
        if not result["success"]:
            print(f"❌ Category filter failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            print(f"✅ Digital Guides products: {len(products)}")
            
            # Verify all products are from Digital Guides category
            for product in products:
                if product.get("category") != "Digital Guides":
                    print(f"❌ Wrong category product found: {product.get('name')} - {product.get('category')}")
                    all_tests_passed = False
        
        # Test 3: GET /products with type filter
        print("\n--- Test 3: GET /products?type=digital ---")
        result = self.send_request("GET", "/products?type=digital")
        
        if not result["success"]:
            print(f"❌ Type filter failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            print(f"✅ Digital type products: {len(products)}")
        
        # Test 4: GET /products with search
        print("\n--- Test 4: GET /products?search=starter ---")
        result = self.send_request("GET", "/products?search=starter")
        
        if not result["success"]:
            print(f"❌ Search failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            print(f"✅ Search 'starter' results: {len(products)}")
        
        # Test 5: GET /products with sorting
        print("\n--- Test 5: GET /products with sorting ---")
        
        # Test price_low sorting
        result = self.send_request("GET", "/products?sort_by=price_low")
        if result["success"]:
            products = result["data"].get("products", [])
            if len(products) >= 2:
                first_price = products[0].get("price", 0)
                second_price = products[1].get("price", 0)
                if first_price <= second_price:
                    print(f"✅ Price low sorting: ${first_price} <= ${second_price}")
                else:
                    print(f"❌ Price low sorting failed: ${first_price} > ${second_price}")
                    all_tests_passed = False
        else:
            print(f"❌ Price low sorting failed: {result['error']}")
            all_tests_passed = False
        
        # Test price_high sorting
        result = self.send_request("GET", "/products?sort_by=price_high")
        if result["success"]:
            products = result["data"].get("products", [])
            if len(products) >= 2:
                first_price = products[0].get("price", 0)
                second_price = products[1].get("price", 0)
                if first_price >= second_price:
                    print(f"✅ Price high sorting: ${first_price} >= ${second_price}")
                else:
                    print(f"❌ Price high sorting failed: ${first_price} < ${second_price}")
                    all_tests_passed = False
        else:
            print(f"❌ Price high sorting failed: {result['error']}")
            all_tests_passed = False
        
        # Test name sorting
        result = self.send_request("GET", "/products?sort_by=name")
        if result["success"]:
            products = result["data"].get("products", [])
            if len(products) >= 2:
                first_name = products[0].get("name", "").lower()
                second_name = products[1].get("name", "").lower()
                if first_name <= second_name:
                    print(f"✅ Name sorting: '{products[0].get('name')}' <= '{products[1].get('name')}'")
                else:
                    print(f"❌ Name sorting failed: '{products[0].get('name')}' > '{products[1].get('name')}'")
                    all_tests_passed = False
        else:
            print(f"❌ Name sorting failed: {result['error']}")
            all_tests_passed = False
        
        # Test 6: GET /products with pagination
        print("\n--- Test 6: GET /products?limit=2&offset=0 ---")
        result = self.send_request("GET", "/products?limit=2&offset=0")
        
        if not result["success"]:
            print(f"❌ Pagination failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            count = data.get("count", 0)
            total = data.get("total", 0)
            offset = data.get("offset", 0)
            limit = data.get("limit", 0)
            
            print(f"✅ Pagination: count={count}, total={total}, offset={offset}, limit={limit}")
            
            if count > limit:
                print(f"❌ Pagination failed: returned {count} items but limit was {limit}")
                all_tests_passed = False
        
        # Test 7: GET /products/featured
        print("\n--- Test 7: GET /products/featured ---")
        result = self.send_request("GET", "/products/featured")
        
        if not result["success"]:
            print(f"❌ Featured products failed: {result['error']}")
            all_tests_passed = False
        else:
            data = result["data"]
            products = data.get("products", [])
            print(f"✅ Featured products returned: {len(products)}")
            
            # Verify all products are featured and sorted by featured_order
            for i, product in enumerate(products):
                if not product.get("is_featured"):
                    print(f"❌ Non-featured product in featured endpoint: {product.get('name')}")
                    all_tests_passed = False
                
                if i > 0:
                    prev_order = products[i-1].get("featured_order", 999)
                    curr_order = product.get("featured_order", 999)
                    if prev_order > curr_order:
                        print(f"❌ Featured products not sorted by featured_order")
                        all_tests_passed = False
                        break
            
            if all_tests_passed and products:
                print(f"✅ Featured products properly sorted by featured_order")
        
        print(f"\n🎯 PUBLIC PRODUCTS API RESULT: {'✅ PASSED' if all_tests_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "Public Products API",
            "passed": all_tests_passed,
            "details": {"all_api_operations": all_tests_passed}
        })
        
        return all_tests_passed

    def run_all_project62_shop_tests(self):
        """Run all Project 62 Shop System Phase 1 tests"""
        print("🚀 Starting Project 62 Shop System - Phase 1 Comprehensive Testing")
        print(f"🔗 Testing base URL: {PROJECT62_BASE_URL}")
        
        # Step 1: Admin Authentication
        admin_login_passed, admin_token = self.test_admin_login()
        
        # Step 2: Category Management Testing
        category_tests_passed = self.test_category_management(admin_token) if admin_login_passed else False
        
        # Step 3: Product Management Testing
        product_tests_passed = self.test_product_management(admin_token) if admin_login_passed else False
        
        # Step 4: Public Products API Testing (no auth required)
        public_api_tests_passed = self.test_public_products_api()
        
        # Summary
        print("\n" + "="*80)
        print("📊 PROJECT 62 SHOP SYSTEM TESTS SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} Project 62 Shop tests passed")
        
        if passed_count == total_count:
            print("🎉 ALL PROJECT 62 SHOP TESTS PASSED! Phase 1 backend implementation working correctly.")
        else:
            print("⚠️  SOME PROJECT 62 SHOP TESTS FAILED. Check the implementation and database seeding.")
            
        return passed_count == total_count

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
    # Test Project 62 Shop System - Phase 1 Comprehensive Testing
    print("="*100)
    print("🎯 TESTING PROJECT 62 SHOP SYSTEM - PHASE 1 BACKEND COMPREHENSIVE TESTING")
    print("="*100)
    
    project62_tester = Project62Tester()
    project62_shop_success = project62_tester.run_all_project62_shop_tests()
    
    print("\n" + "="*100)
    print("📋 TESTING COMPLETE")
    print("="*100)
    
    if project62_shop_success:
        print("✅ ALL PROJECT 62 SHOP TESTS PASSED!")
        print("🎉 Phase 1 backend implementation is working correctly!")
    else:
        print("❌ SOME PROJECT 62 SHOP TESTS FAILED!")
        print("⚠️  Check the implementation and database seeding.")
    
    exit(0 if project62_shop_success else 1)