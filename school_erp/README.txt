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
- Student directory with search
- Add student form (saved in this browser using localStorage)
- Teacher directory
- Attendance demo
- Fees overview
- Examination schedule
- Weekly timetable
- Notices
- Responsive sidebar for mobile

## Important
This is a frontend prototype. It uses sample data and browser localStorage. It is NOT production-ready and does not yet include secure login, a server, shared multi-user database, payment gateway, backups, or role permissions. Do not enter real student personal or financial information.

## Suggested next phase
Build a backend with secure authentication, role-based permissions, a database, audit logs, backups, and server-side validation. Test with fictional data before using real school records.
