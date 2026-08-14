import os

bad_tui = []
bad_T = []
bad_imp = []
for dp, _, fs in os.walk("src"):
    for fn in fs:
        if not fn.endswith(".tsx"):
            continue
        p = os.path.join(dp, fn)
        if p.replace("\\", "/").endswith("ui/t.tsx"):
            continue
        t = open(p, encoding="utf-8").read()
        L = t.split("\n")
        if "tUi(" in t and "const tUi" not in t:
            bad_tui.append(p)
        if "<T k=" in t and '@/components/ui/t";' not in t:
            bad_T.append(p)
        for i, ln in enumerate(L):
            s = ln.strip()
            if s.startswith("import {") and "}" not in s and i + 1 < len(L) and L[i + 1].strip().startswith("import "):
                bad_imp.append((p, i + 1))

print("missing tUi decl:", len(bad_tui), bad_tui)
print("missing T import :", len(bad_T), bad_T)
print("broken imports   :", len(bad_imp))
for b in bad_imp[:15]:
    print("   ", b)
