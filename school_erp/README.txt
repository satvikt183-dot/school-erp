# School ERP

## Run the website
Open `index.html` in a browser, or serve this folder with any static file server.

## Deploy on Vercel
The repository root contains `vercel.json`, which configures Vercel to publish this folder as a static site. Import the Git repository into Vercel, keep the root directory as `.`, and deploy. No build command, dependencies, or framework are required.

## Included
- Admin dashboard
- Student and teacher directories with search, add, edit, and delete
- Attendance by date, with totals saved in this browser
- Fee records, payment status, and dashboard totals
- Examination schedule and notices with add, edit, and delete
- Editable weekly timetables and saved school settings
- Responsive sidebar for mobile

## Project files
- `index.html` – page structure
- `styles.css` – layout and responsive styles
- `app.js` – interface behavior and browser storage
- `../vercel.json` – Vercel deployment settings

## Important
This is a frontend website template. It starts empty and stores changes in the current browser using localStorage. Data is not shared between users or devices and may be cleared by the browser. It has no secure login, server, shared database, payment gateway, backups, or role permissions.

## Suggested next phase
Before using real school records, add a backend with secure authentication, role-based permissions, a shared database, audit logs, backups, and server-side validation.
