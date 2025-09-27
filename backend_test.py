#!/usr/bin/env python3
"""
Backend API Testing for PDF Search System
Tests all critical API endpoints for the PDF search functionality
"""

import requests
import json
import time
import sys
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get backend URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"
print(f"Testing API at: {API_BASE}")

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, success, message=""):
    """Log test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"   {message}")
    
    if success:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {message}")

def test_api_root():
    """Test API root endpoint"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("API Root Endpoint", True, f"Response: {data['message']}")
                return True
            else:
                log_test("API Root Endpoint", False, "Missing message in response")
                return False
        else:
            log_test("API Root Endpoint", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("API Root Endpoint", False, f"Exception: {str(e)}")
        return False

def test_file_tree_root():
    """Test file tree API - root directory"""
    try:
        response = requests.get(f"{API_BASE}/files/tree", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "items" in data and "current_path" in data:
                items = data["items"]
                if len(items) > 0:
                    # Check if we have expected folders
                    folder_names = [item["name"] for item in items if item["type"] == "folder"]
                    expected_folders = ["documents", "reports", "manuals"]
                    found_folders = [f for f in expected_folders if f in folder_names]
                    
                    if len(found_folders) >= 2:  # At least 2 expected folders
                        log_test("File Tree - Root Directory", True, f"Found folders: {found_folders}")
                        return True
                    else:
                        log_test("File Tree - Root Directory", False, f"Expected folders not found. Got: {folder_names}")
                        return False
                else:
                    log_test("File Tree - Root Directory", False, "No items returned")
                    return False
            else:
                log_test("File Tree - Root Directory", False, "Missing items or current_path in response")
                return False
        else:
            log_test("File Tree - Root Directory", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("File Tree - Root Directory", False, f"Exception: {str(e)}")
        return False

def test_file_tree_subfolder():
    """Test file tree API - subfolder navigation"""
    try:
        response = requests.get(f"{API_BASE}/files/tree?path=documents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "items" in data:
                items = data["items"]
                if len(items) > 0:
                    # Should find research folder
                    folder_names = [item["name"] for item in items if item["type"] == "folder"]
                    if "research" in folder_names:
                        log_test("File Tree - Subfolder Navigation", True, f"Found research folder in documents")
                        return True
                    else:
                        log_test("File Tree - Subfolder Navigation", False, f"Research folder not found. Got: {folder_names}")
                        return False
                else:
                    log_test("File Tree - Subfolder Navigation", False, "No items in documents folder")
                    return False
            else:
                log_test("File Tree - Subfolder Navigation", False, "Missing items in response")
                return False
        else:
            log_test("File Tree - Subfolder Navigation", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("File Tree - Subfolder Navigation", False, f"Exception: {str(e)}")
        return False

def test_file_tree_deep_navigation():
    """Test file tree API - deeper navigation"""
    try:
        response = requests.get(f"{API_BASE}/files/tree?path=documents/research", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "items" in data:
                items = data["items"]
                if len(items) > 0:
                    # Should find TXT files
                    txt_files = [item["name"] for item in items if item["type"] == "file" and item["name"].endswith(".txt")]
                    expected_files = ["ai_research.txt", "quantum_computing.txt"]
                    found_files = [f for f in expected_files if f in txt_files]
                    
                    if len(found_files) >= 1:
                        log_test("File Tree - Deep Navigation", True, f"Found TXT files: {found_files}")
                        return True
                    else:
                        log_test("File Tree - Deep Navigation", False, f"Expected TXT files not found. Got: {txt_files}")
                        return False
                else:
                    log_test("File Tree - Deep Navigation", False, "No items in documents/research folder")
                    return False
            else:
                log_test("File Tree - Deep Navigation", False, "Missing items in response")
                return False
        else:
            log_test("File Tree - Deep Navigation", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("File Tree - Deep Navigation", False, f"Exception: {str(e)}")
        return False

def test_txt_serving():
    """Test TXT serving API"""
    test_files = [
        "documents/research/ai_research.txt",
        "manuals/user_guide.txt",
        "reports/annual/financial_report_2024.txt"
    ]
    
    success_count = 0
    for file_path in test_files:
        try:
            response = requests.get(f"{API_BASE}/files/serve/{file_path}", timeout=15)
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'text/plain' in content_type:
                    # Check if we got actual content
                    content = response.content
                    if content and len(content) > 0:
                        log_test(f"TXT Serving - {file_path}", True, f"TXT served correctly ({len(content)} bytes)")
                        success_count += 1
                    else:
                        log_test(f"TXT Serving - {file_path}", False, "Invalid TXT content")
                else:
                    log_test(f"TXT Serving - {file_path}", False, f"Wrong content type: {content_type}")
            else:
                log_test(f"TXT Serving - {file_path}", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            log_test(f"TXT Serving - {file_path}", False, f"Exception: {str(e)}")
    
    return success_count >= 2  # At least 2 files should work

def test_txt_indexing():
    """Test TXT indexing API"""
    try:
        print("Starting TXT indexing (this may take a moment)...")
        response = requests.post(f"{API_BASE}/files/index", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                message = data["message"]
                # Extract number of indexed files
                if "Indexed" in message and "document files" in message:
                    log_test("TXT Indexing", True, message)
                    return True
                else:
                    log_test("TXT Indexing", False, f"Unexpected message format: {message}")
                    return False
            else:
                log_test("TXT Indexing", False, "Missing message in response")
                return False
        else:
            log_test("TXT Indexing", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("TXT Indexing", False, f"Exception: {str(e)}")
        return False

def test_search_filename():
    """Test search API - filename search"""
    try:
        # Search for "ai" which should match ai_research.pdf
        response = requests.get(f"{API_BASE}/search?q=ai", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                results = data["results"]
                if len(results) > 0:
                    # Check if we found ai_research.pdf
                    ai_files = [r for r in results if "ai" in r["file_name"].lower()]
                    if len(ai_files) > 0:
                        log_test("Search - Filename", True, f"Found {len(ai_files)} files matching 'ai'")
                        return True
                    else:
                        log_test("Search - Filename", False, f"No files with 'ai' found. Results: {[r['file_name'] for r in results]}")
                        return False
                else:
                    log_test("Search - Filename", False, "No search results returned")
                    return False
            else:
                log_test("Search - Filename", False, "Missing results in response")
                return False
        else:
            log_test("Search - Filename", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Search - Filename", False, f"Exception: {str(e)}")
        return False

def test_search_content():
    """Test search API - content search (requires indexing first)"""
    try:
        # Search for common terms that might be in PDFs
        search_terms = ["research", "guide", "report"]
        
        for term in search_terms:
            response = requests.get(f"{API_BASE}/search?q={term}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    results = data["results"]
                    if len(results) > 0:
                        # Check if any results have content matches
                        content_matches = [r for r in results if r.get("match_type") in ["content", "both"]]
                        if len(content_matches) > 0:
                            log_test("Search - Content", True, f"Found {len(content_matches)} content matches for '{term}'")
                            return True
                    
        log_test("Search - Content", False, "No content matches found for any search term")
        return False
    except Exception as e:
        log_test("Search - Content", False, f"Exception: {str(e)}")
        return False

def test_search_live():
    """Test search API - live search with different query lengths"""
    try:
        # Test short query (should return empty or limited results)
        response = requests.get(f"{API_BASE}/search?q=a", timeout=10)
        if response.status_code == 200:
            data = response.json()
            short_results = len(data.get("results", []))
            
            # Test longer query
            response = requests.get(f"{API_BASE}/search?q=research", timeout=10)
            if response.status_code == 200:
                data = response.json()
                long_results = len(data.get("results", []))
                
                log_test("Search - Live Search", True, f"Short query: {short_results} results, Long query: {long_results} results")
                return True
            else:
                log_test("Search - Live Search", False, f"Long query failed: {response.status_code}")
                return False
        else:
            log_test("Search - Live Search", False, f"Short query failed: {response.status_code}")
            return False
    except Exception as e:
        log_test("Search - Live Search", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("PDF SEARCH SYSTEM - BACKEND API TESTING")
    print("=" * 60)
    print()
    
    # Test sequence based on priority from test_result.md
    tests = [
        ("API Root", test_api_root),
        ("File Tree - Root", test_file_tree_root),
        ("File Tree - Subfolder", test_file_tree_subfolder),
        ("File Tree - Deep Navigation", test_file_tree_deep_navigation),
        ("TXT Serving", test_txt_serving),
        #("TXT Indexing", test_txt_indexing),
        ("Search - Filename", test_search_filename),
        #("Search - Content", test_search_content),
        #("Search - Live", test_search_live),
    ]
    
    print("Running tests in priority order...")
    print()
    
    for test_name, test_func in tests:
        print(f"Running: {test_name}")
        test_func()
        print()
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results['errors']:
        print("\n🔍 FAILED TESTS:")
        for error in test_results['errors']:
            print(f"   • {error}")
    
    print()
    return test_results['failed'] == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)