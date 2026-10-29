# Architecture

## High-Level Structure

This application is a Laravel 12 MVC app with a traditional three-layer architecture:

- **Presentation layer:** Blade views and Vite-built frontend assets
- **Controller layer:** HTTP controllers handle requests, validation, and response rendering
- **Persistence layer:** Eloquent models backed by relational database migrations

## Core Modules

### Auth & Roles

- Uses Laravel built-in authentication scaffolding
- Adds `role` field on `users` for `admin`, `owner`, and `tenant`
- `app/Http/Middleware/RoleMiddleware.php` gates role-specific routes

### Dashboard & Tenant Portal

- `HomeController` renders the admin dashboard and redirects tenants to their portal
- `TenantDashboardController` exposes tenant-only pages under `/my/*`
- Tenant portal includes rent receipts, maintenance receipts, electricity receipts, and security deposit details

### Property Management

- `PropertyController` handles CRUD for rental units
- A property belongs to an owner and may belong to a tenant
- Status is derived from whether a tenant is assigned (`vacant` or `occupied`)

### Receipt Modules

- `RentReceiptController` for rent receipt CRUD + PDF export
- `MaintenanceReceiptController` for maintenance billing, attachment upload, and share split
- `ElectricityReceiptController` for meter readings, unit calculation, and tenant/owner bill division
- `SecurityDepositController` for deposit tracking, deductions, refunds, and PDF export

## Data Flow

1. User requests a route in `routes/web.php`
2. `auth` middleware verifies login
3. `role` middleware enforces admin/owner/tenant access
4. Controller fetches models via Eloquent
5. Request classes validate input before store/update operations
6. Models persist data and run `boot()` hooks for calculated fields
7. Views render HTML or PDF via DomPDF

## Storage and Attachments

- Attachments are stored via Laravel storage on the `public` disk
- Electricity and maintenance receipts support bill attachments
- Security deposit deductions support optional attachment uploads

## Dependencies

- Laravel 12
- `barryvdh/laravel-dompdf` for PDF generation
- Vite and Tailwind CSS for frontend build
- Bootstrap 5 for UI styling

## Important Files

- `routes/web.php` — route definitions and role groups
- `app/Models` — data models and relationships
- `app/Http/Controllers` — module controllers
- `database/migrations` — database schema
- `config/database.php` — DB connection settings
- `app/Http/Middleware/RoleMiddleware.php` — role enforcement

## Architecture Notes

- The app uses `auth()->user()->role` checks in both middleware and controller-level authorization
- The tenant portal is intentionally read-only; tenant users can view receipts and download PDFs
- Owner users are scoped to their own receipts using `owner_id` filters
- Admin users can manage all resources without extra scoping
