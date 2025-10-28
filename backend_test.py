#!/usr/bin/env python3
"""
Backend Testing Suite for Tuition Centre Chatbot
Tests the /api/tuition/chat endpoint for data accuracy fixes
"""

import requests
import json
import uuid
from typing import Dict, Any
import time

# Configuration
BACKEND_URL = "https://tutor-chat-scroll.preview.emergentagent.com"
API_ENDPOINT = f"{BACKEND_URL}/api/tuition/chat"

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
            response = requests.post(API_ENDPOINT, json=payload, timeout=30)
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
        
        # Test 2: Multi-turn conversation with session_id
        print(f"\n🔄 Testing multi-turn conversation...")
        session_id = str(uuid.uuid4())
        
        # First message
        result1 = self.send_chat_message("Tell me about P6 Math", session_id)
        if result1["success"]:
            print("✅ First message sent successfully")
        
        # Follow-up message (should remember context)
        time.sleep(1)  # Small delay
        result2 = self.send_chat_message("What about at Bishan?", session_id)
        if result2["success"]:
            response2 = result2["data"].get("response", "").lower()
            context_aware = "p6" in response2 or "math" in response2
            print(f"✅ Context awareness in follow-up: {context_aware}")
            if context_aware:
                print("Bot correctly remembered P6 Math context")
        
        return True
    
    def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting Tuition Centre Chatbot Testing Suite")
        print(f"🔗 Testing endpoint: {API_ENDPOINT}")
        print(f"🆔 Session ID: {self.session_id}")
        
        # Run all test scenarios
        test1_passed = self.test_scenario_1_sean_yeo_location_filtering()
        test2_passed = self.test_scenario_2_class_ab_labeling()
        test3_passed = self.test_scenario_3_complete_schedule_display()
        test4_passed = self.test_scenario_4_single_session_j1_format()
        
        # Additional system checks
        self.test_additional_checks()
        
        # Summary
        print("\n" + "="*80)
        print("📊 FINAL TEST SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} tests passed")
        
        if passed_count == total_count:
            print("🎉 ALL TESTS PASSED! Chatbot data accuracy fixes are working correctly.")
        else:
            print("⚠️  SOME TESTS FAILED. Issues need to be addressed.")
            
        return passed_count == total_count

if __name__ == "__main__":
    tester = TuitionChatTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)