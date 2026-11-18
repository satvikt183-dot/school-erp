# School ERP – Starter Project

## Run the website
1. Download and extract `school_erp_starter.zip`.
2. Open the `school_erp` folder.
3. Double-click `index.html` to open it in Chrome, Edge, or Firefox.

No installation or internet connection is required for this frontend demo.

## Deploy on Render
1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will use `render.yaml` to create a static site.
4. The publish directory is `school_erp`; no build command or dependencies are required.

You can also deploy manually:
- Service type: **Static Site**
- Build command: leave blank or use `echo "Static website - no build required"`
- Publish directory: `school_erp`

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

## Important
This is a frontend demo. It starts with fictional sample data and stores changes in the current browser using localStorage. Data is not shared between users or devices and may be cleared by the browser. It has no secure login, server, shared database, payment gateway, backups, or role permissions. Do not enter real student personal or financial information.

## Suggested next phase
Before using real school records, add a backend with secure authentication, role-based permissions, a shared database, audit logs, backups, and server-side validation. Test with fictional data first.
