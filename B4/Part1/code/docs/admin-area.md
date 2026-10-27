# Admin Area

## Route Structure

Defined in `routes/web.php`, the admin area uses two route groups:

- `role:admin` — full access routes for managing owners, tenants, and properties
- `role:admin,owner` — shared access routes for receipts and security deposit management

Admin routes require both authentication and the correct role.

## Resource Controllers

### Owners

- Controller: `app/Http/Controllers/OwnerController.php`
- Resource routes generated via `Route::resource('owners', OwnerController::class)`
- Admin can create, edit, delete, and view owner profiles

### Tenants

- Controller: `app/Http/Controllers/TenantController.php`
- Admin manages tenant records and user assignment

### Properties

- Controller: `app/Http/Controllers/PropertyController.php`
- Manages occupancy, rent, maintenance, and electricity rates
- Supports assigning tenants and owners
- Only tenants without an existing property are available for assignment

## Receipt Management

### Rent Receipts

- Controller: `app/Http/Controllers/RentReceiptController.php`
- Admin/Owners can create receipts for occupied properties
- Receipts are linked to property, tenant, and owner
- PDF exports available via route `rent-receipts/{rentReceipt}/pdf`

### Maintenance Receipts

- Controller: `app/Http/Controllers/MaintenanceReceiptController.php`
- Captures maintenance totals and split percentages
- Supports optional bill attachment upload
- Calculates tenant and owner shares on model save

### Electricity Receipts

- Controller: `app/Http/Controllers/ElectricityReceiptController.php`
- Uses main/sub meter readings to calculate cost split
- Supports attachment uploads and submeter photos
- Previous readings can be prefilled for convenience

## Security Deposits

- Controller: `app/Http/Controllers/SecurityDepositController.php`
- Tracks deposit lifecycle: held, partially refunded, fully refunded, forfeited
- Supports adding deductions and processing refunds
- Recalculation is centralized in `SecurityDeposit::recalculateDeductions()`
- PDF export available via route `security-deposits/{securityDeposit}/pdf`

## Data Scoping

### Owner Users

- Owner controllers are accessible to both admin and owner roles
- Owner-specific queries filter receipts by `owner_id` when the authenticated user is an owner
- Additional `authorizeOwnerAccess()` checks in receipt controllers enforce ownership

### Admin Users

- Admin users bypass owner filters and manage all system data
- Admin users can access owner, tenant, property, and receipt resources without restriction

## Dashboard

- Admin dashboard is rendered by `HomeController`
- Displays aggregated metrics for properties, receipts, and security deposits
- Recent receipts are merged from rent, maintenance, and electricity modules

## Notes

- The app does not define a separate admin namespace, but role-based route protection creates equivalent separation
- Management pages are likely implemented using Blade views under `resources/views`
- Admin pages include standard CRUD plus PDF downloads and attachment management
