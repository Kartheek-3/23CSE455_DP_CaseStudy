# Hooks and Lifecycle Logic

## Model Boot Hooks

### `MaintenanceReceipt::boot()`

- Runs before a maintenance receipt is saved
- Calculates:
    - `owner_share = total_maintenance * (owner_percent / 100)`
    - `tenant_share = total_maintenance * (tenant_percent / 100)`
- Ensures share values remain consistent even when controller input omits manual totals

### `ElectricityReceipt::boot()`

- Runs before electricity receipt persistence
- Calculates:
    - `main_total_units = main_current_reading - main_previous_reading`
    - `tenant_units_consumed = sub_current_reading - sub_previous_reading`
    - `owner_units_consumed = main_total_units - tenant_units_consumed`
    - `tenant_bill = tenant_units_consumed * rate_per_unit`
    - `owner_bill = owner_units_consumed * rate_per_unit`

This implements the electricity billing split as a lifecycle hook rather than a controller responsibility.

### `SecurityDeposit::boot()`

- Recalculates security deposit `balance` on every save:
    - `balance = total_amount - total_deductions - refunded_amount`
- Centralizes deposit health logic inside the model

## Property Rate Change Hook

### `PropertyController::update()`

- Detects changes to `monthly_rent`, `maintenance_total`, and `electricity_rate_per_unit`
- Creates `RateHistory` entries when a value changes and an old rate existed
- Saves audit information using:
    - `type` (rent, maintenance, electricity)
    - `old_value` and `new_value`
    - `notes` describing the change

## Authorization Hooks

### `RoleMiddleware`

- Enforces route-level access for roles
- Used in `routes/web.php` with:
    - `role:tenant`
    - `role:admin`
    - `role:admin,owner`

### Controller Authorization

- Receipt controllers use owner-scoped access checks in `authorizeOwnerAccess()`
- Tenant dashboard actions verify receipt ownership via `tenant_id`
- `RoleMiddleware` plus explicit owner checks prevent data leakage across owners

## File Upload Lifecycle

- Maintenance and electricity receipts store attachments on create and update
- On update, existing files are deleted before storing new uploads
- Storage paths used:
    - `bill-attachments/maintenance`
    - `bill-attachments/electricity`
    - `submeter-photos`
    - `deduction-attachments`

## Validation Hooks

- Form requests validate input before controller actions execute
- Example flow:
    - `StoreRentReceiptRequest` validates required fields
    - `RentReceiptController::store()` uses validated request data
- Keeps controllers thin and reuse-friendly

## Routing Hooks

- `routes/web.php` bifurcates app behavior by role and prefix
- A tenant user hitting `/home` is redirected into the tenant portal
- Admin-only and admin/owner routes keep management flows separate from tenant-facing flows
