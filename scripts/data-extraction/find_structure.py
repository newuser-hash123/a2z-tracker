import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for step definitions or table rows
# Look for "step" or "Step " or module titles
steps = re.findall(r'\[\d+,\s*(\d+),\s*"([^"]+)",\s*"step",\s*"([^"]+)"', text)
print("Steps found via regex 1:", steps)

steps2 = re.findall(r'"step",\s*"([^"]+)"', text)
print("Steps found via regex 2:", len(steps2), steps2[:10])

# Let's search for "Step 1" or similar
steps3 = re.findall(r'Step \d+[^"\\]*', text)
print("Steps with 'Step X':", set(steps3))

# Let's look for sheet_syllabus rows
# In RSC, rows are often defined like:
# [id, title, ... "step"] or "category"
# Let's search for "category" or "chapter" or "module"
types = set(re.findall(r',"(step|chapter|module|category|subCategory|item)",', text))
print("Node types in RSC:", types)
