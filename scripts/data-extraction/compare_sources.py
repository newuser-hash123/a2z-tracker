import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the sheet syllabus in TUF
match = re.search(r'props:data:sheet:sheet_syllabus', text)
print("Found syllabus mention:", bool(match))

# Let's find all item tuples: [number, id, slug, "item", "practice", title, duration, ...]
# e.g.: [9,37,"two-sum","item","practice","Two Sum"
# or [4,401,"pattern-1","item","practice","Pattern 1"
items = re.findall(r'\[\d+,\s*(\d+),\s*"([^"]+)",\s*"item",\s*"practice",\s*"([^"]+)"', text)
print(f"Extracted {len(items)} items from TUF RSC!")
if items:
    print("First 5 items:", items[:5])
    print("Last 5 items:", items[-5:])

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\geckguy_data.json', 'r', encoding='utf-8') as f:
    geck = json.load(f)

geck_problems = geck['problems']
print(f"Geckguy problems count: {len(geck_problems)}")

# Check ID overlap
tuf_ids = set(int(item[0]) for item in items)
geck_ids = set(int(p['id'].replace('a2z-', '')) for p in geck_problems if p['id'].replace('a2z-', '').isdigit())
print(f"TUF unique item IDs: {len(tuf_ids)}")
print(f"Geck unique IDs: {len(geck_ids)}")
print(f"Intersection: {len(tuf_ids.intersection(geck_ids))}")
if len(tuf_ids - geck_ids) > 0:
    print("TUF IDs not in geck:", list(tuf_ids - geck_ids)[:10])
if len(geck_ids - tuf_ids) > 0:
    print("Geck IDs not in TUF:", list(geck_ids - tuf_ids)[:10])
