#!/usr/bin/env python3
"""
Tutor Name Normalization Test
Tests the /api/admin/available-tutors endpoint to ensure A/B suffixes are removed from tutor dropdowns.
"""

import requests
import json
from typing import Dict, Any

# Configuration
BACKEND_URL = "https://mealprep-dash.preview.emergentagent.com"
API_ENDPOINT = f"{BACKEND_URL}/api/admin/available-tutors"

class TutorNormalizationTester:
    def __init__(self):
        self.test_results = []
        
    def test_endpoint(self, level: str, subject: str, location: str) -> Dict[str, Any]:
        """Test the available-tutors endpoint with specific parameters"""
        try:
            params = {
                "level": level,
                "subject": subject,
                "location": location
            }
            
            response = requests.get(API_ENDPOINT, params=params, timeout=30)
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
    
    def test_s3_amath_bishan(self):
        """
        Test S3 AMath at Bishan (known to have multiple tutors with potential A/B suffixes)
        Expected: Should return tutors like "Sean Yeo (HOD)", "John Lee (DY_HOD)", "Jackie", "Lim W.M." WITHOUT any A/B suffixes
        """
        print("\n" + "="*80)
        print("TEST 1: S3 AMath at Bishan - Remove A/B Suffixes")
        print("="*80)
        
        result = self.test_endpoint("S3", "AMath", "Bishan")
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        tutors = data.get("tutors", [])
        count = data.get("count", 0)
        
        print(f"📊 RESPONSE DATA:")
        print(f"Tutors returned: {tutors}")
        print(f"Count: {count}")
        
        # Check for A/B suffixes in tutor names
        has_a_suffix = any(" A" in tutor or tutor.endswith(" A") for tutor in tutors)
        has_b_suffix = any(" B" in tutor or tutor.endswith(" B") for tutor in tutors)
        
        # Check for expected tutors (without A/B suffixes)
        expected_tutors = ["Sean Yeo (HOD)", "John Lee (DY_HOD)", "Jackie", "Lim W.M."]
        found_expected = [tutor for tutor in expected_tutors if tutor in tutors]
        
        # Check for duplicates
        has_duplicates = len(tutors) != len(set(tutors))
        
        print(f"\n📊 ANALYSIS:")
        print(f"❌ Has A suffixes: {has_a_suffix}")
        print(f"❌ Has B suffixes: {has_b_suffix}")
        print(f"✅ Expected tutors found: {len(found_expected)} ({', '.join(found_expected)})")
        print(f"❌ Has duplicates: {has_duplicates}")
        print(f"✅ Total unique tutors: {count}")
        
        # Test passes if NO A/B suffixes and has expected tutors
        test_passed = not (has_a_suffix or has_b_suffix) and len(found_expected) > 0 and not has_duplicates
        
        print(f"\n🎯 TEST 1 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "S3 AMath Bishan - A/B Suffix Removal",
            "passed": test_passed,
            "details": {
                "no_a_suffixes": not has_a_suffix,
                "no_b_suffixes": not has_b_suffix,
                "expected_tutors_found": len(found_expected),
                "no_duplicates": not has_duplicates,
                "total_tutors": count
            }
        })
        
        return test_passed
    
    def test_s2_math_marine_parade(self):
        """
        Test S2 Math at Marine Parade
        Expected: Should return tutors WITHOUT A/B suffixes
        """
        print("\n" + "="*80)
        print("TEST 2: S2 Math at Marine Parade - Remove A/B Suffixes")
        print("="*80)
        
        result = self.test_endpoint("S2", "Math", "Marine Parade")
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        tutors = data.get("tutors", [])
        count = data.get("count", 0)
        
        print(f"📊 RESPONSE DATA:")
        print(f"Tutors returned: {tutors}")
        print(f"Count: {count}")
        
        # Check for A/B suffixes in tutor names
        has_a_suffix = any(" A" in tutor or tutor.endswith(" A") for tutor in tutors)
        has_b_suffix = any(" B" in tutor or tutor.endswith(" B") for tutor in tutors)
        
        # Check for duplicates
        has_duplicates = len(tutors) != len(set(tutors))
        
        # Should have multiple tutors for S2 Math at Marine Parade
        has_multiple_tutors = count > 1
        
        print(f"\n📊 ANALYSIS:")
        print(f"❌ Has A suffixes: {has_a_suffix}")
        print(f"❌ Has B suffixes: {has_b_suffix}")
        print(f"❌ Has duplicates: {has_duplicates}")
        print(f"✅ Has multiple tutors: {has_multiple_tutors}")
        print(f"✅ Total unique tutors: {count}")
        
        # Test passes if NO A/B suffixes and has multiple tutors
        test_passed = not (has_a_suffix or has_b_suffix) and has_multiple_tutors and not has_duplicates
        
        print(f"\n🎯 TEST 2 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "S2 Math Marine Parade - A/B Suffix Removal",
            "passed": test_passed,
            "details": {
                "no_a_suffixes": not has_a_suffix,
                "no_b_suffixes": not has_b_suffix,
                "no_duplicates": not has_duplicates,
                "has_multiple_tutors": has_multiple_tutors,
                "total_tutors": count
            }
        })
        
        return test_passed
    
    def test_p6_math_punggol(self):
        """
        Test P6 Math at Punggol
        Expected: Should return tutors WITHOUT A/B suffixes
        """
        print("\n" + "="*80)
        print("TEST 3: P6 Math at Punggol - Remove A/B Suffixes")
        print("="*80)
        
        result = self.test_endpoint("P6", "Math", "Punggol")
        
        if not result["success"]:
            print(f"❌ API ERROR: {result['error']}")
            return False
            
        data = result["data"]
        tutors = data.get("tutors", [])
        count = data.get("count", 0)
        
        print(f"📊 RESPONSE DATA:")
        print(f"Tutors returned: {tutors}")
        print(f"Count: {count}")
        
        # Check for A/B suffixes in tutor names
        has_a_suffix = any(" A" in tutor or tutor.endswith(" A") for tutor in tutors)
        has_b_suffix = any(" B" in tutor or tutor.endswith(" B") for tutor in tutors)
        
        # Check for duplicates
        has_duplicates = len(tutors) != len(set(tutors))
        
        # Should have at least one tutor
        has_tutors = count > 0
        
        print(f"\n📊 ANALYSIS:")
        print(f"❌ Has A suffixes: {has_a_suffix}")
        print(f"❌ Has B suffixes: {has_b_suffix}")
        print(f"❌ Has duplicates: {has_duplicates}")
        print(f"✅ Has tutors: {has_tutors}")
        print(f"✅ Total unique tutors: {count}")
        
        # Test passes if NO A/B suffixes and has tutors
        test_passed = not (has_a_suffix or has_b_suffix) and has_tutors and not has_duplicates
        
        print(f"\n🎯 TEST 3 RESULT: {'✅ PASSED' if test_passed else '❌ FAILED'}")
        
        self.test_results.append({
            "test": "P6 Math Punggol - A/B Suffix Removal",
            "passed": test_passed,
            "details": {
                "no_a_suffixes": not has_a_suffix,
                "no_b_suffixes": not has_b_suffix,
                "no_duplicates": not has_duplicates,
                "has_tutors": has_tutors,
                "total_tutors": count
            }
        })
        
        return test_passed
    
    def run_all_tests(self):
        """Run all tutor normalization tests"""
        print("🚀 Starting Tutor Name Normalization Testing Suite")
        print(f"🔗 Testing endpoint: {API_ENDPOINT}")
        print("🎯 Focus: Ensure A/B suffixes are removed from tutor dropdowns")
        
        # Run the three critical test scenarios
        test1_passed = self.test_s3_amath_bishan()
        test2_passed = self.test_s2_math_marine_parade()
        test3_passed = self.test_p6_math_punggol()
        
        # Summary
        print("\n" + "="*80)
        print("📊 TUTOR NORMALIZATION TEST SUMMARY")
        print("="*80)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            print(f"{status}: {result['test']}")
            
        print(f"\n🎯 OVERALL RESULT: {passed_count}/{total_count} tests passed")
        
        if passed_count == total_count:
            print("🎉 ALL TESTS PASSED! Tutor name normalization is working correctly.")
            print("✅ A/B suffixes have been successfully removed from tutor dropdowns.")
        else:
            print("⚠️  SOME TESTS FAILED. Tutor name normalization needs attention.")
            print("❌ A/B suffixes may still be appearing in tutor dropdowns.")
            
        return passed_count == total_count

if __name__ == "__main__":
    tester = TutorNormalizationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)