#!/usr/bin/env python3
"""
Quick script to validate environment configuration
"""
import os
import sys

def check_env():
    """Check if environment is properly configured"""
    issues = []
    warnings = []
    
    # Check API key based on provider
    llm_provider = os.getenv("LETTA_LLM_PROVIDER", "google_ai")
    
    if llm_provider == "google_ai":
        # Check Google/Gemini API key
        api_key = os.getenv("GOOGLE_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            issues.append("GOOGLE_API_KEY or GEMINI_API_KEY is not set (required for Gemini)")
        elif api_key.startswith("AIzaSy-your-") or "placeholder" in api_key.lower() or "example" in api_key.lower():
            issues.append("Google API key appears to be a placeholder. Please set a real API key.")
        elif len(api_key) < 30:
            warnings.append("Google API key seems too short. Please verify it's correct.")
        elif not api_key.startswith("AIzaSy"):
            warnings.append("Google API key should start with 'AIzaSy'. Please verify it's correct.")
    else:
        # Check OpenAI API key
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            issues.append("OPENAI_API_KEY is not set (required for OpenAI)")
        elif api_key.startswith("sk-your-") or "placeholder" in api_key.lower():
            issues.append("OPENAI_API_KEY appears to be a placeholder. Please set a real API key.")
        elif len(api_key) < 20:
            warnings.append("OPENAI_API_KEY seems too short. Please verify it's correct.")
    
    # Check Letta URL
    letta_url = os.getenv("LETTA_URL", "http://localhost:8283")
    if not letta_url.startswith("http"):
        warnings.append(f"LETTA_URL format might be incorrect: {letta_url}")
    
    # Print results
    if issues:
        print("❌ CRITICAL ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
        print("\nPlease fix these issues before running the demo.")
        return False
    
    if warnings:
        print("⚠ WARNINGS:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not issues and not warnings:
        print("✓ Environment configuration looks good!")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = check_env()
    sys.exit(0 if success else 1)

