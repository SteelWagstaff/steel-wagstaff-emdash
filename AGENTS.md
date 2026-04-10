---
title: Copilot / Agent Instructions
---

# steelwagstaff.info — Personal Blog & Publishing Space

This repository powers steelwagstaff.info, a personal website and blog built on EmDash (a CMS built on Astro with a full admin UI). The site includes blog posts, playlists, and other creative or technical projects. It is a long-lived personal publishing space that should feel personal, readable, fast, and maintainable.

Preserve the author's voice and existing content structure unless a task explicitly asks for larger editorial or architectural changes.

## Project Overview

**Purpose:** A personal publishing platform for long-form writing, playlists, and project documentation.

**Key characteristics:**
- Lightweight, maintainable architecture
- Personal voice and editorial perspective
- Long-term preservation of content and URLs
- Performance and discoverability focus

## Goals

- Keep the site lightweight and easy to maintain
- Improve discoverability of older posts, playlists, and projects
- Favor clarity, accessibility, and longevity over novelty
- Make small, reversible changes by default
- Preserve the author's authentic voice

## Commands

```bash
npx emdash dev        # Start dev server (runs migrations, seeds, generates types)
npx emdash types      # Regenerate TypeScript types from schema
npx emdash seed seed/seed.json --validate  # Validate seed file
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Tech Stack

### Core Framework
- **Astro** — Static site generator with server rendering for CMS content
- **EmDash** — Headless CMS built on Astro with admin UI
- **TypeScript** — Type safety for content and components

### Data & Content
- **seed/seed.json** — Schema definition and demo content (collections, fields, taxonomies, menus, widgets)
- **emdash-env.d.ts** — Auto-generated TypeScript types for all collections
- **Portable Text** — Rich content format used throughout

### Previous Stack
- Previously migrated from WordPress
- VS Code is the primary editor
- GitHub Copilot may be used for planning, editing, and review

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                  |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                         |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`      | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)               |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.

## If You Need Help

Contact the repository owner for review, deployment details, or editorial decisions.


## Technical Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- Always call `Astro.cache.set(cacheHint)` on pages that query content.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).

## Content Guidelines

### Voice & Authenticity
- Preserve the author's tone; do not make blog posts sound generic, corporate, or AI-written
- Do not invent facts, publication history, playlist context, or project descriptions
- When editing copy, prefer minimal edits for clarity, grammar, consistency, and accessibility
- Keep titles, excerpts, slugs, dates, and metadata aligned with actual content

### Metadata & Structure
- Preserve front matter, permalinks, slugs, and dates unless the task explicitly requires changing them
- Preserve existing URL structure unless explicitly asked to change it
- When adding or editing entries, maintain the author's metadata conventions
- If source material is unclear, ask instead of guessing

## Design & Frontend Guidelines

### UI/UX Principles
- Prefer simple, readable, performant UI changes
- Preserve semantic HTML and strong heading hierarchy
- Maintain keyboard accessibility throughout
- Avoid adding heavy dependencies without approval
- Avoid decorative UI churn unless the task is explicitly about redesign
- Favor patterns that support long-term maintenance across diverse content types

### Code Practices
- Match the existing project conventions before introducing new patterns
- Reuse existing layouts, components, collections, filters, or shortcodes when possible
- Keep CSS and template logic straightforward
- Do not introduce a framework or major build-process change without explicit approval
- If suggesting a structural refactor, explain the tradeoffs first

## Working Style

### Before Starting
- Start by reading the relevant templates, content files, and config before proposing changes
- For any non-trivial task, propose a short plan before editing files
- Prefer small diffs and incremental refactors over large rewrites

### During Development
- Run the dev server if content or rendering changes are involved: `npx emdash dev`
- Check existing patterns in similar content or components
- Run targeted builds to verify changes

### Validation
Before finishing, when relevant:
- Run `npx emdash dev` to verify the dev server starts cleanly
- Check for template or content errors in the admin UI
- Confirm changed pages render correctly in the browser
- Verify seed.json is valid if schema changes are involved
- Note any areas you could not verify

## Safe Actions

**Allowed without asking:**
- Read files and explore the codebase
- Edit existing content, templates, and components
- Run targeted builds and validations
- Test changes locally

**Ask before:**
- Installing new dependencies
- Deleting or renaming many files
- Changing site structure or URL patterns
- Large content rewrites or editorial changes
- Broad visual redesigns or architecture changes
- Pushing commits or opening PRs
- Modifying seed.json in ways that affect existing entries

## When Stuck

- Ask one focused clarifying question
- Or propose 2-3 options with tradeoffs
- Do not guess about content intent, editorial voice, or historical context

---

Generated for automated agents; keep this file up to date when workflows change.
