# Projex.pk — Admin Panel Frontend

A complete, self-contained frontend for the admin panel described in the
integration guide: login, one-time registration, stats overview, company
verification queue, academic project review queue, and student management.

## Files

```
src/
├── services/
│   └── adminApi.js        Axios client for all /api/admin endpoints
└── admin/
    ├── AdminApp.jsx        Entry point — mount this at your admin route
    ├── AdminLogin.jsx       Sign-in screen
    ├── AdminRegister.jsx    One-time "register first admin" screen (needs ADMIN_SECRET)
    ├── AdminDashboard.jsx   Sidebar shell + tab switching + badge counts
    ├── OverviewTab.jsx      Platform stats grid
    ├── CompaniesTab.jsx     Pending companies — approve / reject / suspend
    ├── ProjectsTab.jsx      Pending academic projects — approve / reject
    ├── StudentsTab.jsx      Student search/filter/deactivate
    └── AdminShared.jsx      Shared primitives (buttons, modals, badges, empty states)
```

Visual style matches `landing.jsx` — same `C` token import from
`src/assets/tokens.js`, same Sora/Inter font pairing, navy/gold/cream
palette, and rounded-card language.

## Wiring it in

1. **Router.** Add one route in `src/routing.jsx`:

   ```jsx
   import AdminApp from "./admin/AdminApp.jsx";
   // ...
   <Route path="/admin/*" element={<AdminApp />} />
   ```

   `AdminApp` manages its own login/register/dashboard state internally, so
   a single catch-all route is enough — no nested routes required.

2. **Base URL.** `src/services/adminApi.js` points at
   `http://localhost:5000/api/admin`. If your existing `src/services/api.js`
   already exports a base URL constant, swap it in there instead so both
   files stay in sync when you deploy.

3. **Token storage.** The admin panel stores its JWT under a dedicated
   `admin_token` key (and profile under `admin_info`) in `localStorage`,
   separate from whatever keys your student/company `api.js` uses. This
   means a founder can be logged in as admin in one tab and as a
   student/company in another without conflicts.

## First-time setup

Nobody can create an admin account without the `ADMIN_SECRET` from your
backend `.env`. From the login screen, click **"Register the first admin"**,
fill in the form including that secret, then sign in normally. There's no
UI for a second admin — reuse the same flow if you need one, since the
guide's endpoint doesn't restrict how many times `/register` can be called
(only duplicate emails are blocked).

## Notes on a few deliberate choices

- **Suspend** is exposed from the pending-companies list even though most
  suspensions will happen on already-verified companies. The guide's API
  doesn't require a company to be verified first, and there's currently no
  "list all companies" endpoint to build a separate view — so it lives here
  for completeness. If you add a full company directory endpoint later,
  move Suspend there instead.
- **No unsuspend / reactivate / undo** anywhere — the guide explicitly says
  these don't exist yet (Supabase dashboard only), so the UI doesn't imply
  otherwise.
- Every reject/suspend/deactivate action requires a non-empty reason before
  the confirm button enables, matching the API's `400` validation.
- Confirmation modals block accidental clicks on approve/reject/suspend/
  deactivate, since none of them are reversible from this panel.
