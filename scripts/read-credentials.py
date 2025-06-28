#!/usr/bin/env python3
import csv
import sys
import subprocess

# Try to read Excel file using different methods
excel_path = "/mnt/c/Users/JRE.JasonMSI/Desktop/Credentials.xlsx"

try:
    # Try using xlsx2csv if available
    result = subprocess.run(['xlsx2csv', excel_path], capture_output=True, text=True)
    if result.returncode == 0:
        print(result.stdout)
    else:
        print("Cannot read Excel file. Please convert to CSV or provide credentials manually.")
except:
    print("Please provide your credentials in text format or as a CSV file.")
    print("\nExpected credentials:")
    print("- Gemini API Key")
    print("- Stripe Secret Key (sk_live_...)")
    print("- Stripe Publishable Key (pk_live_...)")
    print("- Stripe Monthly Price ID")
    print("- Stripe Yearly Price ID")
    print("- Supabase URL")
    print("- Supabase Anon Key")
    print("- Supabase Service Role Key")
    print("- Database URL")