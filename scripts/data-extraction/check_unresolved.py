import json
import re

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

# Collect all practice items
practice_items = []
for mod_idx, root_idx in enumerate(roots):
    mod = decode_row(root_idx)
    mod_id = f"mod-{mod['id']}"
    mod_num = mod_idx + 1
    mod_name = mod['label'].strip()
    for sub_row_idx in mod.get('children', []):
        sub = decode_row(sub_row_idx)
        if sub.get('type') == 'category':
            sub_id = f"sub-{sub['id']}"
            sub_name = sub['label'].strip()
            for child_row_idx in sub.get('children', []):
                child = decode_row(child_row_idx)
                if child.get('type') == 'category':
                    sub_sub_id = f"sub-{child['id']}"
                    sub_sub_name = f"{sub_name} - {child['label'].strip()}"
                    for leaf_row_idx in child.get('children', []):
                        leaf = decode_row(leaf_row_idx)
                        if leaf.get('type') == 'item' and leaf.get('layoutType') == 'practice':
                            leaf['mod_num'] = mod_num
                            leaf['mod_name'] = mod_name
                            leaf['sub_name'] = sub_sub_name
                            practice_items.append(leaf)
                elif child.get('type') == 'item' and child.get('layoutType') == 'practice':
                    child['mod_num'] = mod_num
                    child['mod_name'] = mod_name
                    child['sub_name'] = sub_name
                    practice_items.append(child)

print(f"Total practice items in sheet: {len(practice_items)}")

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\geckguy_data.json', 'r', encoding='utf-8') as f:
    geck = json.load(f)

geck_by_id = {str(p['id']).replace('a2z-', ''): p for p in geck['problems']}
geck_by_slug = {p.get('slug', '').lower(): p for p in geck['problems']}

# Check each practice item
unresolved = []
for p in practice_items:
    pid = str(p['id'])
    slug = p.get('slug', '').lower()
    g = geck_by_id.get(pid) or geck_by_slug.get(slug)
    
    lc = p.get('leetcode_link')
    if not lc and g:
        lc = g.get('url') if g.get('platform') == 'leetcode' else None
    
    gfg = None
    if g and g.get('platform') == 'gfg':
        gfg = g.get('url')
    elif g and g.get('altUrls'):
        for u in g.get('altUrls'):
            if 'geeksforgeeks' in u:
                gfg = u
                break
    
    tuf_url = f"https://takeuforward.org/practice/dsa/{p['slug']}?category={p.get('redirectTo', {}).get('category', '')}&source=strivers-a2z-dsa-sheet"
    
    if not lc and not gfg:
        unresolved.append({
            'id': p['id'],
            'title': p['label'],
            'slug': p['slug'],
            'mod': p['mod_name'],
            'sub': p['sub_name'],
            'tuf_url': tuf_url
        })

print(f"Total without direct LeetCode or GFG from existing mapping: {len(unresolved)}")
for u in unresolved:
    print(f"ID: {u['id']} | Title: {u['title']} | Mod: {u['mod']}")
