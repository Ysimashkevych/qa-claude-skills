#!/usr/bin/env python3
"""Validate every skills/<name>/SKILL.md: exists, frontmatter parses, name matches dir, description present."""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent / "skills"
errors = []
dirs = sorted(p for p in root.iterdir() if p.is_dir())
if not dirs:
    errors.append("no skills found")
for d in dirs:
    f = d / "SKILL.md"
    if not f.exists():
        errors.append(f"{d.name}: missing SKILL.md"); continue
    m = re.match(r"^---\n(.*?)\n---\n", f.read_text(), re.S)
    if not m:
        errors.append(f"{d.name}: no frontmatter"); continue
    fm = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1); fm[k.strip()] = v.strip()
    if fm.get("name") != d.name:
        errors.append(f"{d.name}: name '{fm.get('name')}' != dir")
    if len(fm.get("description", "")) < 80:
        errors.append(f"{d.name}: description missing/too short")
    if not any(e.startswith(f"{d.name}:") for e in errors):
        print(f"ok  {d.name} (description {len(fm.get('description', ''))} chars)")
for e in errors:
    print("ERR", e)
sys.exit(1 if errors else 0)
