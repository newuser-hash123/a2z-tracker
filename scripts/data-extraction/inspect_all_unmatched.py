import json
import urllib.parse

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_syllabus_raw.json', 'r', encoding='utf-8') as f:
    syllabus = json.load(f)

fields = syllabus['fields']
rows = syllabus['rows']
roots = syllabus['roots']

def decode_row(r_idx):
    row = rows[r_idx]
    field_idx = row[0]
    field_keys = fields[field_idx]
    values = row[1:]
    return dict(zip(field_keys, values))

# Build full tree
hierarchy_items = []
for mod_idx, root_idx in enumerate(roots):
    mod = decode_row(root_idx)
    mod_id = f"mod-{mod['id']}"
    mod_num = mod_idx + 1
    mod_name = mod['label'].strip()
    for sub_idx, sub_row_idx in enumerate(mod.get('children', [])):
        sub = decode_row(sub_row_idx)
        sub_type = sub.get('type')
        if sub_type == 'category':
            sub_id = f"sub-{sub['id']}"
            sub_name = sub['label'].strip()
            for child_row_idx in sub.get('children', []):
                child = decode_row(child_row_idx)
                if child.get('type') == 'category':
                    sub_sub_id = f"sub-{child['id']}"
                    sub_sub_name = f"{sub_name} - {child['label'].strip()}"
                    for leaf_row_idx in child.get('children', []):
                        leaf = decode_row(leaf_row_idx)
                        if leaf.get('type') == 'item':
                            leaf['module_num'] = mod_num
                            leaf['module_name'] = mod_name
                            leaf['subtopic_id'] = sub_sub_id
                            leaf['subtopic_name'] = sub_sub_name
                            hierarchy_items.append(leaf)
                elif child.get('type') == 'item':
                    child['module_num'] = mod_num
                    child['module_name'] = mod_name
                    child['subtopic_id'] = sub_id
                    child['subtopic_name'] = sub_name
                    hierarchy_items.append(child)

practice_items = [it for it in hierarchy_items if it.get('layoutType') == 'practice']

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\geckguy_data.json', 'r', encoding='utf-8') as f:
    geck = json.load(f)
geck_by_id = {p['id'].replace('a2z-', ''): p for p in geck['problems']}
geck_by_slug = {p.get('slug', '').lower(): p for p in geck['problems']}

unmatched = []
for p in practice_items:
    pid = str(p['id'])
    slug = p.get('slug', '').lower()
    if pid not in geck_by_id and slug not in geck_by_slug:
        unmatched.append(p)

print(f"Total unmatched: {len(unmatched)}")
for i, up in enumerate(unmatched):
    print(f"[{i+1}] ID:{up['id']} | Title:{up.get('label')} | LC:{up.get('leetcode_link')} | FreeBlog:{up.get('free_blog_link')} | Mod:{up.get('module_name')}")
