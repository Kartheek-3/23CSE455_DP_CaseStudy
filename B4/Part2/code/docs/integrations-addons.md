# Integrations and Add-Ons

## Third-Party Packages

### `barryvdh/laravel-dompdf`

- Used for PDF generation across receipt and deposit exports
- Accessed in controllers through `app('dompdf.wrapper')`
- PDF views are likely stored under `resources/views/pdf/*`
- Output filenames are generated dynamically from receipt data

### Frontend Tooling

- `vite` — modern frontend build tool
- `@tailwindcss/vite` — Tailwind CSS integration for Vite
- `tailwindcss` — utility-first CSS framework
- `bootstrap` — UI components and layout styling
- `axios` — likely used for frontend HTTP interactions

### Laravel UI

- `laravel/ui` is installed in `composer.json`
- Provides authentication scaffolding and Blade templates for login/register flows

## Storage and Uploads

- Receipt attachments and photos are stored via Laravel's Storage API
- Uploaded files use `public` disk paths such as:
    - `bill-attachments/maintenance`
    - `bill-attachments/electricity`
    - `submeter-photos`
    - `deduction-attachments`
- The application may require `php artisan storage:link` to make uploaded files publicly accessible

## Potential Extensions

This app is structured to support additional integrations including:

- Payment gateway integration for online rent collection
- Email notifications for receipt issuance and deposit refunds
- Reporting dashboards with charts and export capabilities
- API endpoints for mobile or external dashboard access

## Notes

- There are no explicit external integrations beyond the packages declared in `composer.json` and `package.json`
- The app is intentionally lightweight and relies on Laravel core features with minimal add-ons
