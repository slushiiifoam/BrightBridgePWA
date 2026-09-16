# Help flow — React port drafts

Prep work for `react-migration-pages-Arda`. **Nothing here has been compiled or
run** — the React base does not exist yet. Treat these as drafts to adapt and
test once Sebastian's Vite base lands, not as finished code.

Deliberately kept **outside** the git clone (`bb/`) so nothing touches the repo
until the base is ready.

## What this replaces

| Original (on `main`) | Lines | Becomes |
|---|---|---|
| `public/assets/help.html` | 573 | `Help.jsx` |
| `public/assets/friend.html` | 540 | `RelationshipHelp.jsx` + `relationships.js` |
| `public/assets/family.html` | 540 | ″ |
| `public/assets/romantic.html` | 540 | ″ |
| `public/assets/otherHelp.html` | 540 | ″ |
| **2,733** | | **~600 incl. the 311-line CSS** |

The four relationship pages differ in exactly three lines — the `<title>`, the
`.intro-text` paragraph, and the first card's `<h3>`. Their 304-line `<style>`
blocks are byte-identical, and `help.html`'s block is a subset of theirs, so
one CSS file covers all five pages.

## Files

- `relationships.js` — the per-type content (the three lines that varied)
- `crisisLines.js` — the five crisis hotlines, copied verbatim from the HTML
- `CrisisResources.jsx` — crisis list, was duplicated across all five pages
- `RelationshipHelp.jsx` — one component for all four relationship pages
- `Help.jsx` — the help hub, three views driven by `useState`
- `helpFlow.css` — merged style block

## Routes to add

```jsx
<Route path="/help" element={<Help />} />
<Route path="/help/:type" element={<RelationshipHelp />} />
```

`:type` is `romantic | friend | family | other`. An unknown type redirects to
`/help`.

## When the base lands

1. Pull Sebastian's base into your branch.
2. Check his folder convention — Ivan used `src/pages/`, `src/css/`,
   `src/smaller_components/`. Match whatever the base uses; don't invent one.
3. Copy these files in, fix the import paths.
4. If the base has a shared quick-exit component (Ivan's was
   `src/smaller_components/Emergency.js`), import it and delete the inline
   `quick exit` anchors in `Help.jsx` and `RelationshipHelp.jsx`.
5. Vite serves `.jsx` directly. If the base uses `.js` for components, rename.
6. `npm run dev`, then walk `/help` → each of the four types → back.

## Decisions worth flagging in review

- **Dropped unreachable markup.** Each relationship page carried a hidden copy
  of the crisis section and the relationship picker, but defined only
  `hideCrisisOptions()` / `hideRelationshipOptions()` and no matching `show`
  functions — so roughly 200 lines per file could never be displayed. Crisis
  content now lives in `CrisisResources`, reached from `Help`.
- **`body { opacity: 0 }` removed.** A fade-in hack the old pages undid with
  inline JS on window load. Left in place it would blank the whole SPA. Scoped
  to `.help-flow` with the `opacity: 0` dropped.
- **Per-type intro videos.** All four HTML pages pointed at
  `videos/romantic_intro.html`, so friend/family/other linked to the romantic
  video. `relationships.js` gives each type its own path.

## Blocked on other people

- `/videos/*` and `/quiz` don't exist in the repo — no `videos/` directory, no
  `quiz.html`, in any branch or any commit. The links are wired but will 404.
- `/grounding` and `/resources` are linked from `Help.jsx` and are not mine.

## Verify before this ships

The hotline numbers in `crisisLines.js` were copied from the HTML but nobody
has checked them against the providers. They're the most safety-critical
strings in the app — worth one pass by a second person.
