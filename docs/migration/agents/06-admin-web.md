# A6: Admin web panel (independent stream)

## Mission
Upgrade `admin/` from Create React App (deprecated) and Firebase 8 to a current web stack, **without changing the Firestore data contract**.

## Branch
`migration/a6-admin` (worktree `../tp-a6-admin`). Merged on its own schedule and never blocks the mobile app.

## Owns
`admin/**` only.

## Tasks
1. Replace CRA with **Vite** (React + TS template): `vite.config.ts`, `index.html` at the admin root, env vars renamed from `REACT_APP_*` to `VITE_*`. Remove `react-scripts`.
2. Upgrade **React 19**, **MUI** to the current major (follow MUI's migration guides; replace `@mui/styles`, which is deprecated, with `sx`/`styled`), **React Router** to the current major, and **TypeScript** to the current version.
3. Replace `node-sass` (deprecated, needs native builds) with `sass`, which is already in devDependencies. Keep `App.module.scss` working.
4. Move Firebase to the **modular API**. Use the same collection names and document shapes as A1. If A1 has merged, share constants (e.g. `FirebaseDBCollection`) by copying them; there's no shared package yet.
5. Add `npm run dev/build/preview/lint` scripts and a short `admin/README.md`.
6. Optional: deploy instructions (Firebase Hosting).

## Acceptance criteria
- [ ] `npm run build` succeeds, and `npm run dev` serves the panel.
- [ ] Log in, list publications, moderate or edit them: everything works against the real project, and the changes show up in the mobile app.
- [ ] No CRA, `node-sass`, `@mui/styles`, or Firebase 8 left.

## Handoff
Fill in `handoff/A6.md`.
