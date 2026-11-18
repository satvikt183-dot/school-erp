# School ERP

A static school administration dashboard built with HTML, CSS, and vanilla JavaScript.

## Deploy to Vercel

This repository includes `vercel.json`. It tells Vercel to serve the `school_erp` folder directly; no build command, framework, or dependency installation is needed.

1. Import this repository into Vercel and connect your GitHub account.
2. Keep the project root directory set to `.` (the repository root).
3. Deploy. Vercel reads `vercel.json` and publishes `school_erp`.

If configuring the project manually, use:
- Framework preset: **Other**
- Build command: leave blank
- Output directory: `school_erp`
- Install command: leave blank

## Run locally

Open `school_erp/index.html` in a browser, or serve the `school_erp` folder with any static file server.

## Project files

- `vercel.json` – Vercel static deployment settings
- `school_erp/index.html` – page structure
- `school_erp/styles.css` – layout and responsive styles
- `school_erp/app.js` – dashboard behavior and browser storage

## Demo data and privacy

The site starts with fictional sample data. Changes are saved in that browser's `localStorage`; they are not shared across browsers or devices. This demo has no authentication, backend, shared database, backups, payment gateway, or role permissions. Do not enter real student personal or financial information.
