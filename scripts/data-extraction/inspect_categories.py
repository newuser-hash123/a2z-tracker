import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all category rows
# e.g.: [0,2017,"patterns","category","Patterns",[17,18,19,20,...]]
# or similar
cat_matches = re.findall(r'\[\d+,\s*(\d+),\s*"([^"]+)",\s*"category",\s*"([^"]+)",\s*(\[[^\]]*\])', text)
print(f"Categories found: {len(cat_matches)}")
for c in cat_matches[:15]:
    print(c[0], c[1], c[2], c[3][:60])

# What surrounds these categories? Let's check where the categories themselves are referenced!
# Is there a higher level parent?
first_cat_id = cat_matches[0][0] if cat_matches else "2017"
pos = text.find(f"2017")
print(f"2017 occurrences:")
for m in re.finditer(r'2017', text):
    start = max(0, m.start() - 100)
    end = min(len(text), m.end() + 100)
    print("---", text[start:end])
