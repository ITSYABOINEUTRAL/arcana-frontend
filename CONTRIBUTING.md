# Contributing to Arcana

Thanks for your interest in contributing. This document covers everything you need to know to go from zero to a merged pull request.

---

## Table of contents

1. [Before you start](#before-you-start)
2. [Fork and clone](#fork-and-clone)
3. [Run the project locally](#run-the-project-locally)
4. [Picking up an issue](#picking-up-an-issue)
5. [Branching](#branching)
6. [Commit messages](#commit-messages)
7. [Code style](#code-style)
8. [Opening a pull request](#opening-a-pull-request)
9. [What reviewers look for](#what-reviewers-look-for)
10. [Code of Conduct](#code-of-conduct)

---

## Before you start

- Browse the [open issues](../../issues) to find something you'd like to work on.
- Check that no one is already assigned to the issue before you claim it.
- If you want to propose something that isn't an existing issue, open a **Feature Request** or **Bug Report** issue first and wait for feedback before writing any code.

---

## Fork and clone

```bash
# 1. Fork the repo on GitHub (use the "Fork" button in the top-right corner)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/arcana-frontend.git
cd arcana-frontend

# 3. Add the upstream remote so you can pull future changes
git remote add upstream https://github.com/ITSYABOINEUTRAL/arcana-frontend.git
```

---

## Run the project locally

The project is a collection of static HTML files — no build step is needed.

### Recommended: VS Code Live Server

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
2. Right-click `index.html` → **Open with Live Server**.

### Alternative: npx serve

```bash
npx serve .
```

Open `http://localhost:3000`.

> **Note:** Features that talk to the backend (cart, login, products) will only work when served over HTTP — not when opened directly as a `file://` URL.

---

## Picking up an issue

1. Leave a comment on the issue saying you'd like to work on it.
2. Wait to be assigned before you start — this prevents duplicate effort.
3. If there's no response within a few days, feel free to nudge in the comments.
4. Once assigned, keep the issue updated if you get stuck or your timeline changes.

---

## Branching

Create a branch from `main` for every change. Use this naming pattern:

| Type | Pattern | Example |
|---|---|---|
| Bug fix | `fix/short-description` | `fix/cart-quantity-not-updating` |
| New feature | `feat/short-description` | `feat/order-confirmation-page` |
| Refactor | `refactor/short-description` | `refactor/extract-api-config` |
| Documentation | `docs/short-description` | `docs/update-readme` |
| Accessibility | `a11y/short-description` | `a11y/keyboard-nav-mobile-menu` |
| Tests | `test/short-description` | `test/cart-js-unit-tests` |

```bash
# Always start from an up-to-date main
git checkout main
git pull upstream main
git checkout -b fix/your-branch-name
```

---

## Commit messages

- Use the imperative mood: **"Fix cart total not updating"** not "Fixed" or "Fixes".
- Keep the first line under 72 characters.
- Reference the issue number in the body if relevant: `Closes #12`.
- One logical change per commit — avoid committing unrelated fixes together.

Good examples:
```
Fix mobile menu not closing on Escape key

The keydown listener was only attached once on DOMContentLoaded but the
menu overlay is injected dynamically; moved the listener so it is
registered after injection.

Closes #7
```

```
Add aria-label to cart quantity buttons

Closes #15
```

---

## Code style

Arcana is intentionally dependency-free. Please keep it that way.

- **Vanilla HTML, CSS, and JavaScript only.** Do not introduce a framework, library, bundler, or package manager.
- **No `npm install`.** If your change requires an external library, discuss it in the issue first.
- **Formatting:** Match the style of the file you're editing — 4-space indentation, consistent quote style (single quotes in JS, double quotes in HTML attributes).
- **CSS:** Add new rules to the relevant existing stylesheet rather than adding `<style>` blocks to HTML files. Prefer existing CSS variables (`--arcana-brown`, etc.) over hardcoded colour values.
- **JavaScript:** Use `const`/`let` (not `var`). Keep functions focused. Avoid global side-effects beyond what already exists.
- **No commented-out code** in your PR — clean it up before submitting.
- **No `console.log` left in production paths** — remove debug statements before submitting.
- **Accessibility:** Every interactive element you add must be keyboard-navigable and have appropriate ARIA attributes.

---

## Opening a pull request

1. Push your branch to your fork:
   ```bash
   git push origin fix/your-branch-name
   ```
2. Open a PR against the `main` branch of the upstream repository.
3. Fill in the PR template completely — incomplete PRs may be closed.
4. Link the issue your PR addresses (`Closes #N` in the description).
5. Keep PRs focused: one issue per PR. A large PR covering multiple unrelated issues is hard to review and will likely be asked to be split.

### PR description checklist

Your PR description should answer these questions:

- **What** does this change do?
- **Why** is it needed? (link the issue)
- **How** did you test it? (which pages / scenarios did you check in a browser?)
- **Screenshots** for any visible UI change.
- Does it introduce any new dependencies? (It shouldn't — see code style above.)

---

## What reviewers look for

- The change does what the linked issue says and nothing more.
- No regressions on other pages (check the ones you touched and any shared scripts).
- Code style is consistent with the rest of the codebase.
- All interactive elements work with keyboard only.
- No real credentials, API keys, or personal data committed.
- Commit history is clean (squash fixup commits before the PR is merged if asked).

---

## Code of Conduct

This project follows a simple rule: **be kind**. We welcome contributors of all experience levels. Constructive criticism is fine; personal attacks, harassment, or dismissive language are not.

If you experience or witness behaviour that violates this, please open a [GitHub issue](../../issues/new) marked as a conduct report, or send a direct message to the maintainer via GitHub. Reports will be handled confidentially.

By participating in this project you agree to maintain a welcoming and respectful environment for everyone.
