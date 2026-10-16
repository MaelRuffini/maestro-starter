# maestro-design — skill for designers

A Claude Code skill to give designers who prototype sections for a Maestro
site. It teaches the design system (spacing, type, colors, grid, breakpoints),
the "one section = one slice" structure, what becomes editable, accessibility
and the handover format. `base/` is a copy of this project's
`src/styles/base/` — the real token values.

## Send it

Zip this folder (or share it) and tell the designer:

> Copy the folder into your project as `.claude/skills/maestro-design/`
> (or `~/.claude/skills/maestro-design/` to have it in every project).
> Claude Code loads it automatically when you work on a page or a section.

## Keep it current

When `src/styles/base/*.scss` changes (rebrand, new value at project start):

```sh
cp src/styles/base/{base,typography,grid,breakpoints,utilities,sizes}.scss examples/maestro-design/base/
```

and resend. The rules in `SKILL.md` and `handover.md` are static.

## On the import side

`/new-slice` accepts the prototype URL or folder (`SKILL.md` §8.1 of the
project). `data-slice` / `data-field` / `data-group` / `data-fixed`
attributes, and any `var(--…)` or type class from `base/`, are read as
already-translated intent.
