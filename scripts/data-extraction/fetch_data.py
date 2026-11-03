import urllib.request
import json
import os

target_dir = r"C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction"
os.makedirs(target_dir, exist_ok=True)

# Fetch from geckguy's validated sheet data
url1 = "https://raw.githubusercontent.com/geckguy/striver-a2z-sheet/main/site/data.json"
print("Fetching from geckguy/striver-a2z-sheet...")
req = urllib.request.Request(url1, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    data1 = resp.read()
    with open(os.path.join(target_dir, "geckguy_data.json"), "wb") as f:
        f.write(data1)
    print("Saved geckguy_data.json, size:", len(data1))

# Also check TakeUForward HTML/scripts for any fresh updates
tuf_url = "https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet?page=sheet"
print("Fetching TakeUForward sheet page...")
tuf_req = urllib.request.Request(tuf_url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(tuf_req) as resp:
    tuf_data = resp.read()
    with open(os.path.join(target_dir, "tuf_page.html"), "wb") as f:
        f.write(tuf_data)
    print("Saved tuf_page.html, size:", len(tuf_data))
