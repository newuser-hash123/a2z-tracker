import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_page.html', 'r', encoding='utf-8') as f:
    content = f.read()

chunks = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', content, re.DOTALL)
print(f"Found {len(chunks)} RSC chunks")
full_text = "\n".join(chunks)
print("Total RSC length:", len(full_text))

for kw in ["strivers-a2z", "Two Sum", "Pattern 1", "topics", "subTopics", "problems", "leetcode", "geeksforgeeks"]:
    matches = len(re.findall(re.escape(kw), full_text, re.IGNORECASE))
    print(f"Keyword '{kw}': {matches} matches")
