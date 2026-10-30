#!/usr/bin/env python3
"""Validate every skills/<name>/SKILL.md.

Checks: SKILL.md exists, frontmatter is valid YAML, `name` matches the folder and
is lowercase-kebab, `description` is present and within Claude Code's limit, and
every references/... or templates/... path the skill mentions exists.
"""
import pathlib
import re
import sys

import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent / "skills"
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
PATH_RE = re.compile(r"`((?:references|templates)/[^`\s]+)`")
MIN_DESC, MAX_DESC = 80, 1024


def check(skill_dir: pathlib.Path) -> list[str]:
    f = skill_dir / "SKILL.md"
    if not f.exists():
        return ["missing SKILL.md"]
    text = f.read_text(encoding="utf-8").replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return ["no frontmatter"]
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        return [f"frontmatter is not valid YAML: {e}"]
    errors = []
    name = fm.get("name")
    if name != skill_dir.name:
        errors.append(f"name {name!r} does not match folder")
    elif not NAME_RE.match(name):
        errors.append(f"name {name!r} is not lowercase-kebab")
    desc = str(fm.get("description") or "")
    if not MIN_DESC <= len(desc) <= MAX_DESC:
        errors.append(f"description length {len(desc)} outside {MIN_DESC}-{MAX_DESC}")
    for ref in sorted(set(PATH_RE.findall(text))):
        if not (skill_dir / ref).exists():
            errors.append(f"references missing file {ref}")
    return errors


def main() -> int:
    dirs = sorted(p for p in ROOT.iterdir() if p.is_dir())
    if not dirs:
        print("ERR no skills found")
        return 1
    failed = False
    for d in dirs:
        errors = check(d)
        if errors:
            failed = True
            for e in errors:
                print(f"ERR {d.name}: {e}")
        else:
            print(f"ok  {d.name}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
