# Contributing to Ghost Notes

Thank you for your interest in contributing to Ghost Notes!

Ghost Notes is an Electron app that lets users keep private, translucent sticky notes that are invisible to screen sharing and recording. Contributions that improve the app's reliability, platform support, or user experience are very welcome.

---

## Before You Start

> **Please comment on an issue before writing any code.**

If you start working on something without commenting first, another contributor may already be working on it and you could end up duplicating effort. Once you leave a comment expressing interest, a maintainer will assign the issue to you — that's your green light to start building.

If you have a new idea or found a bug that isn't already filed, **open a new issue first** and describe it. Wait for feedback before submitting a PR.

---

## Workflow

1. **Find an issue** — browse the [open issues](https://github.com/navyabijoy/invisible-notes/issues) and pick one that interests you.
2. **Comment** — leave a comment on the issue saying you'd like to work on it (e.g., *"I'd like to take this one"*). Wait for a maintainer to assign it to you.
3. **Fork & branch** — fork the repo and create a branch named after the issue: `feat/issue-3-custom-shortcuts` or `fix/issue-2-windows-protection`.
4. **Build & test** — make your changes locally, run the app, and make sure nothing is broken.
5. **Open a PR** — submit a pull request against `main` and fill out the PR template. Reference the issue in your description (e.g., `Closes #3`).
6. **Review** — a maintainer will review your PR. Address any feedback and the PR will be merged once it's approved.

---

## Setting Up Locally

```bash
git clone https://github.com/navyabijoy/invisible-notes.git
cd invisible-notes
npm install
npm start
```

The app runs as a tray-only utility — look for the ghost icon in your menu bar or system tray.

To build a distributable:
```bash
npm run dist:mac   # macOS
npm run dist:win   # Windows
```

---

## Code Style

- This is a vanilla Node.js + Electron project. No bundler, no TypeScript.
- Keep platform-specific logic inside `platform.js`. Avoid branching on `process.platform` anywhere else.
- Write plain comments that explain the *why*, not just the *what*.
- Keep PRs focused — one feature or fix per PR. Avoid mixing unrelated changes.

---

## Commit Messages

Use short, descriptive commit messages in the imperative mood:

- ✅ `Add monospace font toggle to note toolbar`
- ✅ `Fix content protection not re-applied after sleep on Windows`
- ❌ `fixed stuff`
- ❌ `WIP`

---

## Reporting Bugs

Open an issue using the **Bug Report** template. Include your OS version, Electron version (`npm list electron`), and clear steps to reproduce.

---

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing. Be kind and respectful — everyone here is volunteering their time.

---

## Questions?

Feel free to open a [Discussion](https://github.com/navyabijoy/invisible-notes/discussions) or leave a comment on the relevant issue.
