#!/usr/bin/env python3
"""
Test script for voice assistant API
"""

import requests
import json

def test_voice_assistant():
    base_url = "http://localhost:8000"
    
    # Step 1: Login to get authentication token
    print("🔐 Logging in...")
    login_data = {
        "email": "admin@fintwin.com",
        "password": "admin123"
    }
    
    login_response = requests.post(
        f"{base_url}/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    auth_data = login_response.json()
    access_token = auth_data.get("access_token")
    
    if not access_token:
        print("❌ No access token received")
        return
    
    print("✅ Login successful!")
    
    # Step 2: Test voice assistant API
    print("🎤 Testing voice assistant...")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    test_messages = [
        {"message": "Hello, how can you help me?", "language": "English"},
        {"message": "Tell me about savings", "language": "English"},
        {"message": "What government schemes are available?", "language": "English"}
    ]
    
    for i, test_data in enumerate(test_messages, 1):
        print(f"\n📝 Test {i}: {test_data['message']}")
        
        response = requests.post(
            f"{base_url}/ai/chat",
            json=test_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {result.get('content', 'No content')[:100]}...")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    
    print("\n🎉 Voice assistant test completed!")

if __name__ == "__main__":
    test_voice_assistant()