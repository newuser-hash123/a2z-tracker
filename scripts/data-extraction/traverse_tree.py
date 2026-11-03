import json

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

print(f"Total rows: {len(rows)}")

items = []
categories = []

def traverse(r_idx, path=[]):
    node = decode_row(r_idx)
    node_type = node.get('type')
    node['row_idx'] = r_idx
    if node_type == 'category':
        categories.append((node, path))
        children = node.get('children', [])
        for ch in children:
            traverse(ch, path + [node.get('label', '')])
    elif node_type == 'item':
        items.append((node, path))
    else:
        print(f"Unknown node type at row {r_idx}: {node_type}")

for r_idx in roots:
    traverse(r_idx)

print(f"Total categories traversed: {len(categories)}")
print(f"Total items traversed: {len(items)}")

# Check item types and layoutTypes
layout_types = {}
for item, path in items:
    lt = item.get('layoutType', 'unknown')
    layout_types[lt] = layout_types.get(lt, 0) + 1

print("Layout types:", layout_types)

# Inspect first 10 items
print("\nFirst 5 items:")
for item, path in items[:5]:
    print("Path:", " -> ".join(path))
    print("Item:", {k: v for k, v in item.items() if k not in ['children']})

print("\nSample practice item with LeetCode/GFG link:")
for item, path in items:
    # check for links
    vals = str(item)
    if 'leetcode' in vals.lower() or 'geeksforgeeks' in vals.lower():
        print("Path:", " -> ".join(path))
        print("Item:", {k: v for k, v in item.items()})
        break
