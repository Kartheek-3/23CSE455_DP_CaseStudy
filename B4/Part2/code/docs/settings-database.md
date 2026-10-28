# Settings and Database

## Environment Configuration

The project uses Laravel's default `.env` system for runtime settings.

Key environment variables include:

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_URL`
- `DB_CONNECTION` (default: `sqlite`)
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `FILESYSTEM_DISK` (not required, but public storage is used for attachments)

## Database Configuration

File: `config/database.php`

- Default connection is environment-driven; fallback to `sqlite`
- Supports `sqlite`, `mysql`, `mariadb`, `pgsql`, and `sqlsrv`
- MySQL/MariaDB use `utf8mb4` charset and strict mode
- Redis connection config is also present for caching/queue capabilities

## Core Schema

### `properties`

- `owner_id`, `tenant_id`
- `address`
- `monthly_rent`
- `maintenance_total`
- `owner_maintenance_percent`, `tenant_maintenance_percent`
- `electricity_rate_per_unit`
- `status` (`vacant`, `occupied`)

### `rent_receipts`

- Links to `property_id`, `tenant_id`, `owner_id`
- `month`, `amount`, `amount_in_words`
- `payment_method`, `payment_date`
- `notes`

### `maintenance_receipts`

- Total maintenance bill, owner/tenant split percentages
- Calculated `owner_share`, `tenant_share`
- `tenant_amount_in_words`
- Bill reference and file attachment

### `electricity_receipts`

- Main meter readings and dates
- Submeter readings
- Calculated `main_total_units`, `tenant_units_consumed`, `owner_units_consumed`
- `rate_per_unit`, `tenant_bill`, `owner_bill`
- `main_bill_amount`, `tenant_amount_in_words`
- Bill attachments and submeter photos

### `security_deposits`

- `total_amount`, `months_count`, `monthly_rent_at_time`
- `status` values: `held`, `partially_refunded`, `fully_refunded`, `forfeited`
- `total_deductions`, `refunded_amount`, `balance`
- `refund_date` and notes

### `rate_histories`

- Audit trail for property rate changes
- Stores `type`, `old_value`, `new_value`, and `effective_date`

## Relationships and Integrity

- Foreign keys enforce cascades for property and receipt cleanup
- `tenant_id` is nullable on properties to support vacant units
- `SecurityDeposit` and receipts belong to property/tenant/owner
- The app enforces owner scoping and tenant ownership at the controller level

## Storage and Files

- Attachments use Laravel storage, often on the `public` disk
- Documented upload paths:
    - `bill-attachments/maintenance`
    - `bill-attachments/electricity`
    - `submeter-photos`
    - `deduction-attachments`
- `config/filesystems.php` defines the public disk and default storage settings

## Dependency Configuration

- `composer.json` declares PHP dependencies including Laravel and DomPDF
- `package.json` defines Vite, Tailwind, Bootstrap, Axios, and build scripts
- `npm run build` compiles frontend assets; `npm run dev` starts Vite

## Notes for Deployment

- Ensure the database connection in `.env` is configured
- Run migrations with `php artisan migrate`
- Set up storage linking with `php artisan storage:link` if attachments are served publicly
- Generate the app key with `php artisan key:generate`
