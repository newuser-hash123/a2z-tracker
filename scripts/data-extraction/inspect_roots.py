import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_syllabus_raw.json', 'r', encoding='utf-8') as f:
    syllabus = json.load(f)

fields = syllabus['fields']
rows = syllabus['rows']
roots = syllabus['roots']

print(f"Total fields templates: {len(fields)}")
print(f"Total rows: {len(rows)}")
print(f"Roots ({len(roots)}): {roots}")

# Let's inspect each root row
for r_idx in roots:
    row = rows[r_idx]
    field_idx = row[0]
    field_keys = fields[field_idx]
    values = row[1:]
    obj = dict(zip(field_keys, values))
    print(f"Root row {r_idx}: id={obj.get('id')} slug={obj.get('slug')} label={obj.get('label')} children_count={len(obj.get('children', []))}")
