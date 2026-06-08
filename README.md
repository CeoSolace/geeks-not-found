# ProperGeeks Database System

This repository contains a proof‑of‑concept implementation of the ProperGeeks Database System. It provides a Next.js 14 application skeleton with MongoDB models, authentication routes, a founder login flow, an eight‑page founder dashboard, and a hidden developer emergency control panel accessible via secret route and key.

> **Important:**
>
> - This project is a starting point. It scaffolds the core pages, models and API routes but does **not** include every feature fully implemented.
> - You must install the dependencies, set up environment variables and implement the remaining business logic.

## Getting Started

1. **Install dependencies** (requires Node.js ≥ 18 and npm):

   ```bash
   npm install
   ```

   Network access to the npm registry is required to install packages. If your environment blocks npm, you will need to download and install the dependencies manually.

2. **Configure environment variables** by creating a `.env` file based on `.env.example`:

   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/propergeeks
   AUTH_SECRET=your_long_random_secret
   APP_URL=http://localhost:3000
   DEV_CONTROL_ROUTE=pg-lockbox-x92kq-71safe-2026
   DEV_CONTROL_KEY=very-long-random-secret-key
   ```

   - `MONGO_URI` should point to your MongoDB database.
   - `AUTH_SECRET` is used to sign JSON Web Tokens.
   - `DEV_CONTROL_ROUTE` and `DEV_CONTROL_KEY` define the secret path and key for the developer emergency control panel.

3. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app. On first run, the app automatically creates a founder account with username `FounderMan2` and password `password123`. You will be prompted to change this password on first login.

4. **Build for production**:

   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
app/
├── globals.css              Global Tailwind styles
├── layout.js                Root layout
├── page.js                  Landing page with sign-in link
├── login/page.js            Login form
├── change-password/page.js  Password change page
├── dashboard/               Dashboard pages (founder)
│   ├── layout.js            Dashboard layout with sidebar
│   ├── page.js              Main dashboard overview
│   ├── audit/page.js        Audit log skeleton
│   ├── staff-create/page.js Staff account creation skeleton
│   ├── module-create/page.jsModule creation skeleton
│   ├── module-manage/page.jsModule management skeleton
│   ├── messaging/page.js    Internal messaging skeleton
│   ├── staff/page.js        Staff management skeleton
│   └── welcome/page.js      Welcome message
├── [...secret]/             Catch-all route for developer panel
│   └── page.js              Displays login form for secret route
│   └── dashboard/page.js    Developer emergency control dashboard
└── api/
    ├── auth/
    │   ├── login/route.js       Login endpoint
    │   └── change-password/route.js Password change endpoint
    └── dev-control/
        ├── login/route.js      Developer panel login endpoint
        └── action/route.js     Perform emergency actions

lib/
├── db.js                    Mongoose connection helper
├── ensureFounder.js         Ensure founder account exists on startup

models/
├── User.js                  User schema
├── Module.js                Database module schema and fields
├── Record.js                Record schema for module data
├── Message.js               Internal messaging schema
├── AuditLog.js              Audit logging schema
├── Notification.js          Notifications schema
└── SecurityEvent.js         Security events schema

postcss.config.js           PostCSS configuration for Tailwind
tailwind.config.js          Tailwind configuration

.env.example                 Example environment variables
package.json                Project metadata and scripts
next.config.js              Next.js configuration
README.md                   This documentation
```

## Next Steps

This skeleton provides the basic structure required to build the full ProperGeeks Database System. To complete the project, you should:

- Implement authentication middleware to protect routes and manage sessions properly.
- Build forms and API routes for creating modules, records and staff accounts.
- Add real-time messaging functionality using Socket.IO.
- Create dashboards to display statistics, recent activity and notifications.
- Implement search, filtering and sorting across modules and records.
- Add detailed audit logging and export functionality.
- Flesh out the developer emergency panel actions and security logging.
- Deploy to Render or an Ubuntu VPS following best practices.

This repository lays the groundwork and gives you a strong starting point for developing the comprehensive system described in the project brief.
