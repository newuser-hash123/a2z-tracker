import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\decoded_rsc.txt', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('"sheet_syllabus":')
if idx != -1:
    start_pos = idx + len('"sheet_syllabus":')
    # Find matching closing brace using bracket counting
    depth = 0
    in_string = False
    escape = False
    end_pos = start_pos
    for i in range(start_pos, len(text)):
        ch = text[i]
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if not in_string:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    end_pos = i + 1
                    break
    
    syllabus_str = text[start_pos:end_pos]
    print(f"Extracted syllabus string of length: {len(syllabus_str)}")
    with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_syllabus_raw.json', 'w', encoding='utf-8') as f:
        f.write(syllabus_str)
    
    try:
        syllabus = json.loads(syllabus_str)
        print("Successfully parsed as JSON!")
        print("Keys:", list(syllabus.keys()))
        print("Fields count:", len(syllabus.get('fields', [])))
        print("Rows count:", len(syllabus.get('rows', [])))
        print("Root / Top-level row indices:", syllabus.get('data', []))
    except Exception as e:
        print("JSON parse error:", e)
        # Let's inspect snippet
        print("Starts with:", syllabus_str[:200])
        print("Ends with:", syllabus_str[-200:])
