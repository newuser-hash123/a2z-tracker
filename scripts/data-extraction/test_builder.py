import json
import re

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_syllabus_raw.json', 'r', encoding='utf-8') as f:
    syllabus = json.load(f)

fields = syllabus['fields']
rows = syllabus['rows']
roots = syllabus['roots']

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\geckguy_data.json', 'r', encoding='utf-8') as f:
    geck = json.load(f)

geck_by_id = {str(p['id']).replace('a2z-', ''): p for p in geck['problems']}
geck_by_slug = {p.get('slug', '').lower(): p for p in geck['problems']}
geck_by_title = {re.sub(r'[^a-zA-Z0-9]', '', p.get('title', '').lower()): p for p in geck['problems']}

def decode_row(r_idx):
    row = rows[r_idx]
    field_idx = row[0]
    field_keys = fields[field_idx]
    values = row[1:]
    return dict(zip(field_keys, values))

print(f"Decoded roots count: {len(roots)}")
