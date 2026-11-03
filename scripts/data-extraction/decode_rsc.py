import re
import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_page.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the big RSC chunk
chunks = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', content, re.DOTALL)
chunk = chunks[0]

# Let's decode unicode escapes and see what JSON objects exist
# Often RSC chunks have JSON strings embedded or escaped strings
decoded = chunk.encode('utf-8').decode('unicode_escape')

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'w', encoding='utf-8') as f:
    f.write(decoded)

print("Decoded length:", len(decoded))

# Let's search for JSON-like structures with problems or sheet
lines = decoded.split("\n")
print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines[:30]):
    print(f"Line {i} ({len(line)} chars): {line[:120]}")
