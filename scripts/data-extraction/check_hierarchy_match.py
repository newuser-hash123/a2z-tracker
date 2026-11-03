import json

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\tuf_syllabus_raw.json', 'r', encoding='utf-8') as f:
    syllabus = json.load(f)

fields = syllabus['fields']
rows = syllabus['rows']
roots = syllabus['roots']

with open(r'C:\Users\YUVA GANESH\.gemini\antigravity\scratch\striver-a2z-tracker\scripts\data-extraction\geckguy_data.json', 'r', encoding='utf-8') as f:
    geck = json.load(f)

geck_by_id = {}
geck_by_slug = {}
for p in geck['problems']:
    raw_id = p['id'].replace('a2z-', '')
    geck_by_id[raw_id] = p
    geck_by_slug[p.get('slug', '').lower()] = p

def decode_row(r_idx):
    row = rows[r_idx]
    field_idx = row[0]
    field_keys = fields[field_idx]
    values = row[1:]
    return dict(zip(field_keys, values))

# Collect all items with their full module & subtopic hierarchy
hierarchy_items = []

for mod_idx, root_idx in enumerate(roots):
    mod = decode_row(root_idx)
    mod_id = f"mod-{mod['id']}"
    mod_num = mod_idx + 1
    mod_name = mod['label'].strip()
    
    # Children can be categories or subcategories
    for sub_idx, sub_row_idx in enumerate(mod.get('children', [])):
        sub = decode_row(sub_row_idx)
        sub_type = sub.get('type')
        if sub_type == 'category':
            sub_id = f"sub-{sub['id']}"
            sub_name = sub['label'].strip()
            
            # Subtopic children
            for child_row_idx in sub.get('children', []):
                child = decode_row(child_row_idx)
                child_type = child.get('type')
                if child_type == 'category':
                    # Third-level nesting!
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
                elif child_type == 'item':
                    child['module_num'] = mod_num
                    child['module_name'] = mod_name
                    child['subtopic_id'] = sub_id
                    child['subtopic_name'] = sub_name
                    hierarchy_items.append(child)
        elif sub_type == 'item':
            sub['module_num'] = mod_num
            sub['module_name'] = mod_name
            sub['subtopic_id'] = f"sub-{mod['id']}-main"
            sub['subtopic_name'] = mod_name
            hierarchy_items.append(sub)

print(f"Total hierarchy items collected: {len(hierarchy_items)}")
practice_items = [it for it in hierarchy_items if it.get('layoutType') == 'practice']
learning_items = [it for it in hierarchy_items if it.get('layoutType') == 'learning']
print(f"Practice items: {len(practice_items)}")
print(f"Learning items: {len(learning_items)}")

# Check matching with geckguy
matched_count = 0
unmatched_practice = []

for p in practice_items:
    pid = str(p['id'])
    slug = p.get('slug', '').lower()
    g = geck_by_id.get(pid) or geck_by_slug.get(slug)
    if g:
        matched_count += 1
    else:
        unmatched_practice.append(p)

print(f"Matched with geckguy dataset: {matched_count} / {len(practice_items)}")
print(f"Unmatched practice items count: {len(unmatched_practice)}")
if unmatched_practice:
    print("\nSample unmatched practice items:")
    for up in unmatched_practice[:10]:
        print(f"ID: {up['id']}, Title: {up.get('label')}, Slug: {up.get('slug')}, LeetCode: {up.get('leetcode_link')}, Mod: {up.get('module_name')}")
