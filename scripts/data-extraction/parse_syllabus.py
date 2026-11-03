import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find sheet_syllabus
pos = text.find('sheet_syllabus')
print("Position:", pos)
print(text[pos-100:pos+500])

# Let's find the rows array definition
# RSC usually defines rows as:
# "rows":[[...],[...],...] or similar
match = re.search(r'"sheet_syllabus"\s*:\s*\{([^\{\}]+|\{[^\{\}]*\})*\}', text)
if match:
    print("Found syllabus JSON snippet:")
    print(match.group(0)[:500])
else:
    print("Regex didn't match directly, searching nearby...")
    idx = text.find('"sheet_syllabus"')
    print(text[idx:idx+1500])
