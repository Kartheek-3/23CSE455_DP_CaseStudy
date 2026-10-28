# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-09-01

### Added

#### Dashboard

- Redesigned dashboard with a new metric-card layout for all live statistics
- Personalised page header ("Welcome back, {name}")
- **Properties Overview** panel showing a featured property (occupied properties preferred)
  with tenant, monthly rent, and a direct link to the property
- Restyled **Quick Actions** and **Recent Receipts** panels

#### Navigation & Layout

- Global top bar containing a search field (⌘K hint) and a notifications bell —
  both are presentational placeholders for now; no search or notification logic is wired up yet
- Rebuilt profile dropdown menu with avatar, name, role and email header, plus entries for
  Profile Settings, Account Security, Notification Preferences, admin User Management, and Logout
- "Go Premium" upgrade panel in the profile menu
- Sidebar **User Management** link for admins
- Sidebar promo card and "Need Help?" support card linking to GitHub issues
- Deep link from the profile menu straight to the Change Password card (`#change-password` anchor)

#### Forms & Validation

- Global validation error summary rendered above page content, so a failed submission on
  **any** form now lists every error instead of silently redirecting back
- Inline validation feedback on the electricity receipt **Notes** field (create and edit)

### Changed

- Electricity receipt `notes` limit raised from 500 to 5,000 characters (the column is `TEXT`,
  so the old cap was arbitrary)
- Notes textarea enlarged from 2 to 4 rows on the electricity receipt create/edit forms
- Receipt detail toolbars (rent, maintenance, electricity) now vertically align their action buttons

### Fixed

- **Electricity receipt could not be saved when the note was longer than 500 characters.**
  Validation failed on `notes`, but the textarea had no `@error` block, so the request was
  redirected back with no visible message and the form appeared to do nothing.

---

## [1.0.0] - 2026-03-12

### Added

#### Core Modules

- Owner management (full CRUD with user account creation)
- Tenant management (full CRUD with user account creation)
- Property management (owner/tenant assignment, rate history tracking)
- User & team management (admin-managed accounts with per-user role assignment)

#### Receipt Generation

- Rent receipt generation with auto amount-in-words (Pakistani Rupee format)
- Maintenance bill receipt with automatic owner/tenant split calculation
- Electricity bill receipt with auto rate calculation from WAPDA bill
- Professional PDF download for all receipt types (DomPDF)
- Month selector from January 2025 onwards

#### Financial Tracking

- Security deposit tracking with deduction management
- Deduction proof upload (photo evidence)
- Partial and full refund processing
- Rate history logging (electricity, maintenance, rent)
- Bill attachment upload for electricity and maintenance receipts

#### Sub-Meter Evidence

- Sub-meter previous reading photo upload
- Sub-meter current reading photo upload

#### User Roles & Access

- Admin role with full system access
- Owner role with data isolation (see only own data)
- Tenant portal with read-only access to own receipts
- Role-based middleware for route protection

#### Authentication & Security

- Modern login/register UI with gradient design
- Profile management (update name, email, password)
- CSRF protection on all forms
- Password hashing with bcrypt
- Security headers middleware
- Login rate limiting (5 attempts/minute)
- Public registration disabled (admin-only user creation)
- File upload validation (type + size restrictions)

#### Dashboard

- Live statistics (properties, tenants, rent collected, deposits held)
- Current month's rent collection tracking
- Recent receipts from all modules
- Quick action buttons
- Property overview with occupancy status

#### UI/UX

- Modern sidebar navigation with role-based menu
- Professional card-based layout
- Bootstrap 5 with Bootstrap Icons
- Responsive design
- Flash message notifications
- Auto-calculation previews on forms

---

## Future Releases

See [Roadmap](README.md#-roadmap) for planned features.
