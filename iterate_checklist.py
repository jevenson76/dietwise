#!/usr/bin/env python3

import sys

def main():
    file_path = "docs/STRIPE_INTEGRATION_GUIDE.md"
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
    except Exception as e:
        print("Failed to open file:", e)
        sys.exit(1)

    in_section = False
    checklist = []
    for line in lines:
        if line.startswith("## "):
            if "Production Checklist" in line:
                in_section = True
                continue
            elif in_section:
                break
        if in_section:
            stripped = line.strip()
            if stripped.startswith("- [ ]"):
                checklist.append(stripped)

    if not checklist:
        print("No checklist items found.")
        sys.exit(0)

    for item in checklist:
        print(item)
    if sys.stdin.isatty():
        try:
            input("Press Enter for next item...")
        except EOFError:
            pass
    else:
        import time
        time.sleep(1)

if __name__ == '__main__':
    main()