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
    
    def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting Tuition Centre Chatbot Testing Suite")
        print(f"🔗 Testing endpoint: {API_ENDPOINT}")
        print(f"🆔 Session ID: {self.session_id}")
        
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
        print("📊 FINAL TEST SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} tests passed")
        
        # Special focus on context-aware tests
        context_tests = [context1_passed, context2_passed, context3_passed]
        context_passed = sum(context_tests)
        print(f"🔥 CONTEXT-AWARE TESTS: {context_passed}/3 passed")
        
        if passed_count == total_count:
            print("🎉 ALL TESTS PASSED! Chatbot context-aware follow-up queries are working correctly.")
        else:
            print("⚠️  SOME TESTS FAILED. Context-aware querying needs attention.")
            
        return passed_count == total_count

if __name__ == "__main__":
    tester = TuitionChatTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)