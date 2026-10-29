# Core Classes

## Models

### `App\Models\User`

- Authenticatable user model
- `role` field drives access control
- Role helpers: `isAdmin()`, `isOwner()`, `isTenant()`
- Relationships: `owner()`, `tenant()`

### `App\Models\Owner`

- Belongs to `User`
- Has many `Property`, `RentReceipt`, `MaintenanceReceipt`, `ElectricityReceipt`

### `App\Models\Tenant`

- Belongs to `User`
- Has one `Property`
- Has many receipts and deposits

### `App\Models\Property`

- Belongs to `Owner` and optionally `Tenant`
- Maintains rent, maintenance, electricity rate, and occupancy status
- Has rate history tracking via `rateHistories()`

### Receipt Models

- `RentReceipt`
    - `property_id`, `tenant_id`, `owner_id`
    - `month`, `amount`, `amount_in_words`, `payment_method`

- `MaintenanceReceipt`
    - Auto-calculates `owner_share` and `tenant_share` on save
    - Stores `total_maintenance`, percentage split, bill attachment, and reference

- `ElectricityReceipt`
    - Auto-calculates main total units, tenant units, owner units, and bills
    - Stores meter readings, rate, main bill amount, attachment, and submeter photos

- `SecurityDeposit`
    - Tracks deposit total, months count, refund status, balance, and deductions
    - Auto-calculates `balance` on save

- `SecurityDepositDeduction`
    - Linked to a security deposit
    - Supports optional attachment storage

### `App\Models\RateHistory`

- Tracks changes to property rates and maintenance values
- Created in `PropertyController::update()` when values change

## Controllers

### `HomeController`

- Builds admin dashboard statistics
- Aggregates recent rent, maintenance, and electricity receipts
- Redirects tenant users to `/my/dashboard`

### `TenantDashboardController`

- Restricts access by tenant user identity
- Provides tenant-only listing and detail views
- Generates tenant PDF downloads through DomPDF wrapper

### `OwnerController`, `TenantController`, `PropertyController`

- Standard CRUD for owners, tenants, and properties
- `PropertyController` contains rate-change tracking logic
- Uses `Store*Request` and `Update*Request` validation classes

### Receipt Controllers

- `RentReceiptController`
- `MaintenanceReceiptController`
- `ElectricityReceiptController`

All follow the same pattern:

- Query receipts scoped to the current owner when required
- Use occupied properties for creation flows
- Load relationships for detail views
- Support file upload handling and deletion during updates
- Export receipts as PDF

### `SecurityDepositController`

- Handles deposit creation, editing, deletion
- Adds deductions and processes refunds
- Recalculates deposit totals on deduction events
- Exports deposit detail PDF

## Form Requests

- `Store*Request` and `Update*Request` classes validate input centrally
- Example: `StoreRentReceiptRequest` validates `property_id`, `month`, `amount`, `payment_method`, and `payment_date`
- These classes keep controller actions slim and consistent

## Middleware

### `App\Http\Middleware\RoleMiddleware`

- Checks `auth()->user()->role`
- Supports multiple role values like `role:admin,owner`
- Returns 403 for unauthorized access

## Key Patterns

- Eloquent relationships are used extensively for owner/tenant/property linkage
- Controllers often load related models with `with(['property', 'tenant', 'owner'])`
- Model `boot()` callbacks implement automatic calculations and data normalization
- File storage operations use Laravel's storage `public` disk

## Important Files

- `app/Models/User.php`
- `app/Models/Property.php`
- `app/Models/RentReceipt.php`
- `app/Models/MaintenanceReceipt.php`
- `app/Models/ElectricityReceipt.php`
- `app/Models/SecurityDeposit.php`
- `app/Models/RateHistory.php`
- `app/Http/Controllers/RentReceiptController.php`
- `app/Http/Controllers/MaintenanceReceiptController.php`
- `app/Http/Controllers/ElectricityReceiptController.php`
- `app/Http/Controllers/SecurityDepositController.php`
- `app/Http/Middleware/RoleMiddleware.php`
