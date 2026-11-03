import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the TUF IDs not in geck
# Look for pattern around one of them, e.g. 768 or 898 or 3 or 4
for test_id in ['768', '898', '3', '900', '285']:
    pos = text.find(f',"{test_id}",')
    if pos == -1:
        pos = text.find(f',{test_id},')
    print(f"ID {test_id} pos: {pos}")
    if pos != -1:
        print(text[max(0, pos-100):min(len(text), pos+300)])
