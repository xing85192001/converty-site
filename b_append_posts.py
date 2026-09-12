"""一次性把 B 层新文章元数据追加进 posts.ts（修复 b_gen_engine 的 .format 花括号转义 bug）。"""
import re
import glob
import os

existing = set(re.findall(r'slug:\s*"([^"]+)"', open('src/lib/blog/posts.ts', encoding='utf-8').read()))
entries = []
for mf in sorted(glob.glob('b_data_*.py')):
    name = os.path.splitext(os.path.basename(mf))[0]
    if name == 'b_data_categories':
        continue
    m = __import__(name)
    for a in m.ARTICLES:
        if a['slug'] in existing:
            continue
        entries.append(
            '\t{{\n\t\tslug: "{slug}",\n\t\tdate: "{date}",\n\t\t'
            'category: "{category}",\n\t\treadingMinutes: {rm},\n\t}},'.format(
                slug=a['slug'], date=a['date'],
                category=a['category'], rm=a['readingMinutes']))
if not entries:
    print('no new entries to add')
    raise SystemExit
content = open('src/lib/blog/posts.ts', encoding='utf-8').read()
mm = re.search(r'(export const blogPosts: BlogPostBase\[\] = \[)(.*?)(\n\];)', content, re.DOTALL)
if not mm:
    print('marker not found')
    raise SystemExit
insert = '\n'.join(entries)
new = content[:mm.start(2)] + insert + '\n' + content[mm.start(2):]
open('src/lib/blog/posts.ts', 'w', encoding='utf-8').write(new)
print(f'added {len(entries)} entries to posts.ts')
