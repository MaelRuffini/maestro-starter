# Maestro — Next.js + Prismic boilerplate

GitHub **template repository** for marketing websites. Next.js 16 (App Router, JavaScript), Prismic (Type
Builder + CLI), Sass with design tokens, accessibility (RGAA/EAA) by default, and
an AI-agent workflow: **Figma frame (or live URL / prototype code) → `/new-slice` → commit on `main` → human CMS TODO**.

## Create a project from the template

```sh
# 1. GitHub → "Use this template" → clone the new repository, then:
npm install
npm run setup            # project name, description → rewrites the template identity
npx prismic login
# 2. Create the Prismic repository in the dashboard (you pick <domain>.prismic.io), then:
npm run prismic:connect -- <domain> --push --preview   # config + push models + dev preview + simulator
npm run dev              # http://localhost:3000
```

Then create and publish **Homepage** and **Settings** documents in the Page
Builder. Until then, `/` shows a setup notice. `/dev/slices` is empty on a fresh
project — reference slices live in `examples/slices/`.

`npm run setup` (`scripts/init.mjs`) is deterministic, dependency-free, accepts
flags for non-interactive use (`--name`, `--repo`, `--package`, `--description`)
and deletes itself once done.

> Push **before** any `npx prismic init` / `npx prismic pull` on a new repository:
> those commands treat the remote as the source of truth and would delete the
> template's local models.

## What is inside

```
src/app/                 layout (fonts, skip link, preview), page.js (homepage), [uid]/page.js,
                         not-found.js, sitemap.js, robots.js, slice-simulator, dev/slices (mocks gallery), api/* (preview, revalidate)
src/slices/              the project's slices (index.jsx, model.json, <name>.scss, mocks.json) — empty on a fresh template
examples/slices/         reference slices (Hero · FiftyFifty · Grid · CtaCards · StackedCards · Marquee · Faq · Articles ·
                         Testimonials): not pushed, not bundled, not in /dev/slices; imitate or copy them with slice:scaffold --from
examples/recipes/        opt-in custom types (article → /blog/:uid, testimonial) installed with type:install
examples/maestro-design/ Claude Code skill to send to designers who prototype sections (rules + copy of the tokens)
src/components/          SliceSection (section/container/settings), Button, Prose (rich text), SetupNotice
src/styles/base/         tokens, reset, fluid sizes, 12-col grid, type classes, utilities
src/styles/components/   stylesheets of the shared components (prose, setup-notice)
scripts/                 init.mjs (setup), prismic-connect.mjs, slice-scaffold.mjs, slice-land.mjs, slice-check.mjs,
                         type-install.mjs, prismic-fill-slice.mjs, slack-maestro.mjs
customtypes/             homepage (single) and page (repeatable) page types with SEO tab; settings singleton
                         (SEO defaults, favicons, head/body custom code, redirects)
stylelint.config.mjs     the CSS convention (tokens, BEM, no px/hex/!important) as lint rules
prismic.config.json      repository name + route resolver
SKILL.md                 the conventions every agent (and human) follows
AGENTS.md / CLAUDE.md    agent entry points
.claude/ + .cursor/      agents (dev-slice, reviewer, content-model-guardian), /new-slice command, skill
.github/workflows/ci.yml lint + build on push to `main`
```

## Daily workflow

| Task                         | Command                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| Develop                      | `npm run dev` — `/dev/slices?slice=hero` isolates a slice                 |
| Check (local)                | `npm run lint` — CI / Vercel run `next build`                             |
| Scaffold a slice             | `npm run slice:scaffold -- Name --fields file.json`                       |
| Land a batch worktree        | `npm run slice:land -- --name Name --from .worktrees/<id>`                |
| Install a custom type recipe | `npm run type:install -- article` (`--list` to see them)                  |
| Extend an existing model     | `npx prismic field add` / `add-variation` / … then `npx prismic gen types` |
| Local vs remote models       | `npx prismic status`                                                      |
| Publish models               | `npx prismic push` — after a single slice, or once at the end of a batch  |
| Fill a slice into a page     | `npm run prismic:fill -- --slice Cover` — Migration Release, not published |
| Client (no Cursor)           | `npm run slack` — Figma URL in Slack → brief → go → commit on `main` + fill (`SKILL.md` §11) |
| Create a slice with an agent | `/new-slice` — one or several frames → questions → go → one commit each on `main` |
| Docs                         | `npx prismic docs list`, `npx prismic docs view nextjs`                   |

Models (`customtypes/`, `src/slices/*/model.json`) are versioned on `main` like
any other code. `src/slices/index.js` and `prismicio-types.d.ts` are generated —
never edit them.

## Conventions

Everything is in [`SKILL.md`](./SKILL.md): architecture principles, anatomy of a
slice, the Prismic CLI workflow (share → questions → go → commit on `main` → human TODO), the CSS convention (Sass, BEM,
tokens, grid), page architecture, content doctrine, accessibility checklist,
Figma rule and other sources (live URL, prototype code — `SKILL.md` §8.1),
bootstrap checklist, Vercel go-live (`SKILL.md` §12), Slack connect
(`SKILL.md` §11), anti-patterns.

## Environment variables

None are required for a public Prismic repository. See
[`.env.local.example`](./.env.local.example) for `PRISMIC_ACCESS_TOKEN`
(private API), `PRISMIC_WRITE_TOKEN` (`npm run prismic:fill`),
`NEXT_PUBLIC_PRISMIC_ENVIRONMENT`, optional `NEXT_PUBLIC_SITE_URL` (canonical
origin for `/sitemap.xml` and `/robots.txt`), and the Slack / Cursor keys
(`npm run slack`).
In CI and on Vercel, set `PRISMIC_ACCESS_TOKEN` only if the API is private.
Do not put write or Slack tokens on Vercel unless you are hosting the bot there.

## Out of scope for the MVP

Header/footer/navigation, SEO/perf agents, automatic Figma → commit pipeline,
multi-locale. They are planned as later increments and must not be added
without an explicit request.
