with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find('Pattern 1')
print("Position of 'Pattern 1':", pos)
if pos != -1:
    snippet = text[max(0, pos-200):min(len(text), pos+400)]
    print("Around Pattern 1:\n", repr(snippet))

pos2 = text.find('Two Sum')
print("Position of 'Two Sum':", pos2)
if pos2 != -1:
    snippet2 = text[max(0, pos2-200):min(len(text), pos2+400)]
    print("Around Two Sum:\n", repr(snippet2))
