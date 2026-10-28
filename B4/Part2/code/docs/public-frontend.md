# Public Frontend

## Tenant Portal

The tenant-facing app is served under the `/my` prefix.

### Routes

- `/my/dashboard` — tenant dashboard
- `/my/rent-receipts` — list of tenant rent receipts
- `/my/rent-receipts/{rentReceipt}` — rent receipt detail
- `/my/rent-receipts/{rentReceipt}/pdf` — rent receipt download
- `/my/maintenance-receipts` — maintenance receipts list
- `/my/maintenance-receipts/{maintenanceReceipt}` — maintenance detail
- `/my/maintenance-receipts/{maintenanceReceipt}/pdf` — maintenance PDF
- `/my/electricity-receipts` — electricity receipts list
- `/my/electricity-receipts/{electricityReceipt}` — electricity detail
- `/my/electricity-receipts/{electricityReceipt}/pdf` — electricity PDF
- `/my/security-deposit` — security deposit summary

### Access Control

- Guarded by `role:tenant` middleware in `routes/web.php`
- Tenant controllers verify that each requested receipt belongs to `auth()->user()->tenant`
- Unauthorized access returns HTTP 403

## UI and Asset Stack

- Frontend assets are built with Vite
- Dependencies include Bootstrap 5 and Tailwind CSS
- The tenant portal likely uses Blade view templates in `resources/views/tenant-portal/*`

## Data Presented to Tenants

- Summary totals for rent, maintenance, electricity, and security deposits
- Recent receipts with details pulled from `RentReceipt`, `MaintenanceReceipt`, and `ElectricityReceipt`
- Downloadable PDF receipts for all permitted resources

## Public Pages

- `/about` — static about page view
- Root `/` redirects to login page
- Authenticated users access dashboard or tenant portal based on role

## PDF Generation

- Tenant PDF downloads are implemented using `dompdf.wrapper` in `TenantDashboardController`
- The download endpoints are tenant-only and tied to the receipt ownership checks

## Notes

- Although the tenant portal is under `/my`, it is not a separate application: it shares authentication and the same Blade/asset stack
- Tenant views are isolated from admin flows using route prefixing and middleware
- The app implicitly expects tenants to view only their own assigned property receipts and security deposit history
