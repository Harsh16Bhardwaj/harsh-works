#!/usr/bin/env python3
"""Validate that each skill folder has a SKILL.md with name and description metadata."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
skills_root = root / ".agents" / "skills"

if not skills_root.exists():
    print("Missing .agents/skills directory")
    sys.exit(1)

errors = []
for skill_dir in sorted(p for p in skills_root.iterdir() if p.is_dir()):
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.exists():
        errors.append(f"{skill_dir.name}: missing SKILL.md")
        continue
    text = skill_file.read_text(encoding="utf-8")
    if not text.startswith("---"):
        errors.append(f"{skill_dir.name}: missing YAML frontmatter")
        continue
    match = re.match(r"---\n(.*?)\n---", text, flags=re.S)
    if not match:
        errors.append(f"{skill_dir.name}: malformed frontmatter")
        continue
    fm = match.group(1)
    if "name:" not in fm:
        errors.append(f"{skill_dir.name}: missing name")
    if "description:" not in fm:
        errors.append(f"{skill_dir.name}: missing description")

if errors:
    print("Skill pack validation failed:")
    for e in errors:
        print("-", e)
    sys.exit(1)

print(f"OK: {len(list(skills_root.iterdir()))} skill folders validated.")
