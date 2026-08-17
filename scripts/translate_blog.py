import json
import re
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Import translation helpers from translate_all.py
sys.path.insert(0, str(Path(__file__).resolve().parent))
import translate_all as tr

ROOT = Path(__file__).resolve().parent.parent
MSG = ROOT / "src/messages"
CACHE_FILE = Path(__file__).resolve().parent / "translation_cache.json"

# markdown markers we must preserve across translation
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")


def atomic_write(path: Path, text: str, retries: int = 10):
    tmp = path.with_suffix(path.suffix + ".tmp")
    for attempt in range(retries):
        try:
            tmp.write_text(text, encoding="utf-8")
            tmp.replace(path)
            return
        except PermissionError:
            if attempt == retries - 1:
                raise
            time.sleep(0.05 * (attempt + 1))


def protect_md(s: str):
    """Replace markdown links/bold with unique tokens. Returns protected string
    and two dicts mapping token -> (label, href) for links and token -> text for bold."""
    links: dict[str, tuple[str, str]] = {}
    bolds: dict[str, str] = {}
    idx = 0

    def link_repl(m: re.Match) -> str:
        nonlocal idx
        tok = f"<<<LINK{idx}>>>"
        links[tok] = (m.group(1), m.group(2))
        idx += 1
        return tok

    def bold_repl(m: re.Match) -> str:
        nonlocal idx
        tok = f"<<<BOLD{idx}>>>"
        bolds[tok] = m.group(1)
        idx += 1
        return tok

    s = LINK_RE.sub(link_repl, s)
    s = BOLD_RE.sub(bold_repl, s)
    return s, links, bolds


def restore_md(s: str, links: dict, bolds: dict, tl: str) -> str:
    """Restore links/bold by translating their inner text and reassembling."""
    for tok, (label, href) in links.items():
        trans_label = tr.translate_one(label, tl)
        s = s.replace(tok, f"[{trans_label}]({href})")
    for tok, text in bolds.items():
        trans_text = tr.translate_one(text, tl)
        s = s.replace(tok, f"**{trans_text}**")
    return s


def translate_text(s: str, tl: str) -> str:
    if not s or not re.search(r"[A-Za-z]", s):
        return s
    protected, links, bolds = protect_md(s)
    translated = tr.translate_one(protected, tl)
    return restore_md(translated, links, bolds, tl)


def collect_texts(posts: dict) -> list[tuple[str, str, list[str]]]:
    """Collect all translatable leaf strings as (post_slug, field_path, []).
    field_path examples: title, excerpt, blocks.0.text, blocks.2.items.1"""
    out: list[tuple[str, str, list[str]]] = []
    for slug, post in posts.items():
        out.append((slug, "title", []))
        out.append((slug, "excerpt", []))
        for i, block in enumerate(post.get("blocks", [])):
            if block["type"] in ("p", "h2", "callout"):
                out.append((slug, f"blocks.{i}.text", []))
            elif block["type"] == "ul":
                for j, _ in enumerate(block.get("items", [])):
                    out.append((slug, f"blocks.{i}.items.{j}", []))
    return out


def get_text(posts: dict, slug: str, path: str) -> str:
    obj = posts[slug]
    if path == "title":
        return obj["title"]
    if path == "excerpt":
        return obj["excerpt"]
    parts = path.split(".")
    # parts like ['blocks', '0', 'text'] or ['blocks', '2', 'items', '1']
    cur = obj
    for p in parts:
        if p.isdigit():
            cur = cur[int(p)]
        else:
            cur = cur[p]
    return cur


def set_text(posts: dict, slug: str, path: str, value: str):
    obj = posts[slug]
    if path == "title":
        obj["title"] = value
        return
    if path == "excerpt":
        obj["excerpt"] = value
        return
    parts = path.split(".")
    cur = obj
    for p in parts[:-1]:
        if p.isdigit():
            cur = cur[int(p)]
        else:
            cur = cur[p]
    last = parts[-1]
    if last.isdigit():
        cur[int(last)] = value
    else:
        cur[last] = value


def load_cache():
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    return {}


def save_cache(cache: dict):
    atomic_write(CACHE_FILE, json.dumps(cache, ensure_ascii=False, indent=2))


def main():
    en = json.loads((MSG / "en.json").read_text(encoding="utf-8"))
    en_posts = en["blog"]["posts"]
    texts = collect_texts(en_posts)
    cache = load_cache()

    failed_locales: list[str] = []

    for loc in tr.LOCALES:
        tl = loc
        if tl == "zh":
            tl = "zh-CN"
        elif tl == "zh-TW":
            tl = "zh-TW"

        lcache = cache.setdefault(loc, {})
        target = json.loads((MSG / f"{loc}.json").read_text(encoding="utf-8"))
        target.setdefault("blog", {})
        target["blog"]["posts"] = json.loads(json.dumps(en_posts))  # deep copy structure

        todo = [
            (slug, path)
            for slug, path, _ in texts
            if get_text(en_posts, slug, path) != get_text(target["blog"]["posts"], slug, path)
            or True  # always translate from English
        ]
        # dedupe strings for batching
        seen: dict[str, tuple[str, str]] = {}
        for slug, path in todo:
            src = get_text(en_posts, slug, path)
            if src not in seen:
                seen[src] = (slug, path)
        unique = list(seen.keys())
        print(f"[{loc}] {len(todo)} fields, {len(unique)} unique strings", flush=True)

        translations: dict[str, str] = {}
        misses = [s for s in unique if s not in lcache]
        if misses:
            with ThreadPoolExecutor(max_workers=3) as ex:
                futs = {ex.submit(translate_text, s, tl): s for s in misses}
                done = 0
                for fut in as_completed(futs):
                    src = futs[fut]
                    try:
                        translations[src] = fut.result()
                    except Exception as e:
                        print(f"  ERROR translating: {e}", flush=True)
                        translations[src] = src
                    lcache[src] = translations[src]
                    done += 1
                    if done % 20 == 0:
                        save_cache(cache)
                        print(f"  [{loc}] {done}/{len(misses)} translated", flush=True)
            save_cache(cache)

        for src in unique:
            if src not in translations:
                translations[src] = lcache[src]

        for slug, path in todo:
            src = get_text(en_posts, slug, path)
            set_text(target["blog"]["posts"], slug, path, translations[src])

        try:
            atomic_write(MSG / f"{loc}.json", json.dumps(target, ensure_ascii=False, indent=2))
            print(f"[{loc}] wrote", flush=True)
        except Exception as e:
            print(f"[{loc}] FAILED to write: {e}", flush=True)
            failed_locales.append(loc)

    if failed_locales:
        print("FAILED locales:", failed_locales)
        sys.exit(1)
    print("All blog locales translated.")


if __name__ == "__main__":
    main()
