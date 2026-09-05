#!/usr/bin/env python3
# 书签结构分析：解析 Netscape 格式书签，输出目录树与各方向书签数量分布
import re
import sys
from collections import Counter
from html.parser import HTMLParser


class BookmarkParser(HTMLParser):
    """解析 Netscape 书签文件，产出 (路径, 标题, url) 三元组列表"""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.items = []  # [(path_tuple, title, url)]
        self.stack = []  # 文件夹栈
        self._pending_h3 = None
        self._cur_text = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h3':
            self._pending_h3 = True
            self._cur_text = []
        elif tag == 'a':
            self._cur_text = []
            self._link = a.get('href', '')
        elif tag == 'dl':
            # 进入下一层：若刚关闭 h3，则该 h3 文本已入栈
            pass

    def handle_endtag(self, tag):
        if tag == 'h3' and self._pending_h3:
            name = ''.join(self._cur_text).strip()
            self.stack.append(name)
            self._pending_h3 = False
        elif tag == 'a':
            title = ''.join(self._cur_text).strip()
            self.items.append((tuple(self.stack), title, getattr(self, '_link', '')))
        elif tag == 'dl':
            # 关闭一层文件夹；文件夹名在 h3 结束时已压栈，这里弹栈
            if self.stack:
                self.stack.pop()

    def handle_data(self, data):
        if self._pending_h3 or hasattr(self, '_link') and self._cur_text is not None:
            self._cur_text.append(data)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'source/bookmarks.html'
    with open(src, encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Netscape 书签的文件夹结构是 <H3>标题</H3><DL>...</DL>，
    # HTMLParser 会把 h3 的闭合标签丢失文本，这里用栈式正则更稳
    items = []
    stack = []
    pos = 0
    for m in re.finditer(r'<(/?)(H3|A)\b([^>]*)>(.*?)</\2>', content, re.I | re.S):
        close, tag, attrs_s, text = m.group(1), m.group(2).upper(), m.group(3), m.group(4)
        text = re.sub(r'<[^>]+>', '', text).strip()
        attrs = dict(re.findall(r'(\w+)\s*=\s*"([^"]*)"', attrs_s))
        if tag == 'H3' and not close:
            stack.append(text)
        elif tag == 'A' and not close:
            items.append((tuple(stack), text, attrs.get('HREF', '')))
        # H3 关闭标签不弹栈：弹栈发生在 </DL>
    # 用 DL 配对弹栈（与压栈顺序对应）
    stack2 = []
    result = []
    tokens = re.finditer(r'<(/?)DL\b[^>]*>|<(H3)\b[^>]*>(.*?)</H3>|<A\b([^>]*)>(.*?)</A>', content, re.I | re.S)
    depth = 0
    folder_stack = []
    for m in tokens:
        if m.group(1) is not None and m.group(1) == '':  # <DL>
            depth += 1
        elif m.group(1):  # </DL>
            if folder_stack:
                folder_stack.pop()
            depth -= 1
        elif m.group(2):  # H3
            t = re.sub(r'<[^>]+>', '', m.group(3) or '').strip()
            folder_stack.append(t)
        elif m.group(4) is not None:  # A
            attrs = dict(re.findall(r'(\w+)\s*=\s*"([^"]*)"', m.group(4)))
            title = re.sub(r'<[^>]+>', '', m.group(5) or '').strip()
            result.append((tuple(folder_stack), title, attrs.get('HREF', '')))
    items = result

    total = len(items)
    print(f'总书签数: {total}')

    # 去重
    seen = set()
    dedup = []
    for path, title, url in items:
        key = url.strip()
        if key and key not in seen:
            seen.add(key)
            dedup.append((path, title, url))
    print(f'URL 去重后: {len(dedup)}')

    # 顶层文件夹分布
    print('\n=== 顶层文件夹分布（一级目录）===')
    top = Counter(p[0] if p else '(根)' for p, t, u in items)
    for name, c in top.most_common(30):
        print(f'  {name}: {c}')

    # 二级分布（方向/*）
    print('\n=== 二级目录分布 ===')
    second = Counter('/'.join(p[:2]) if len(p) >= 2 else None for p, t, u in items)
    for name, c in second.most_common(40):
        if name:
            print(f'  {name}: {c}')


if __name__ == '__main__':
    main()