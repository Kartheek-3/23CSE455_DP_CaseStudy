# Contributing to Property Management System

First off, thank you for considering contributing to Property Management System! It's people like you that make this project great.

## Code of Conduct

By participating in this project, you are expected to uphold a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/mohsin-rafique/property-management/issues) to avoid duplicates.

When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details:**
    - PHP version
    - Laravel version
    - MySQL version
    - Operating system
    - Browser (if frontend issue)

### Suggesting Features

Feature requests are welcome! Please [open an issue](https://github.com/mohsin-rafique/property-management/issues/new) with:

- **Clear description** of the feature
- **Use case** — why this feature would be useful
- **Possible implementation** — if you have ideas

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork:
    ```bash
    git clone https://github.com/YOUR-USERNAME/property-management.git
    cd property-management
    ```
3. **Install dependencies:**
    ```bash
    composer install
    npm install
    ```
4. **Create a feature branch:**
    ```bash
    git checkout -b feature/your-feature-name
    ```
5. **Make your changes** and test thoroughly
6. **Commit** with a meaningful message:
    ```bash
    git commit -m "Add: description of your changes"
    ```
7. **Push** to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
8. **Open a Pull Request** against the `main` branch

## Development Setup

### Prerequisites

- PHP 8.2+
- Composer 2.x
- MySQL 5.7+
- Node.js 20+

### Setup

```bash
# Clone and install
git clone https://github.com/mohsin-rafique/property-management.git
cd property-management
composer install
npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed
php artisan storage:link

# Build assets
npm run build

# Start development server
php artisan serve
```

### Useful Commands

```bash
# Clear caches during development
php artisan optimize:clear

# View all routes
php artisan route:list --except-vendor

# Fresh migration with demo data
php artisan migrate:fresh --seed

# Build assets for development (with hot reload)
npm run dev
```

## Coding Standards

- Follow [Laravel coding standards](https://laravel.com/docs/12.x/contributions#coding-style)
- Use meaningful variable and method names
- Add comments for complex business logic
- Keep controllers thin — move logic to models or services
- Use FormRequest classes for validation
- Use Eloquent relationships instead of raw queries

## Commit Message Format

Use descriptive commit messages:

- `Add: new feature description`
- `Fix: bug description`
- `Update: what was changed`
- `Remove: what was removed`
- `Refactor: what was refactored`

## Questions?

Feel free to [open an issue](https://github.com/mohsin-rafique/property-management/issues/new) for any questions about contributing.

Thank you for your contributions! 🙏
