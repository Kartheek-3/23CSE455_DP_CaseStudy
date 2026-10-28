# B4 - Property Rental Application using Laravel

Case study: **Design Pattern Identification and Evolution in a Laravel-Based Property Rental Application**

## Team

| Student | Roll number | Batch |
|---|---|---:|
| Earlapally Sahith Siddarth | AM.SC.U4CSE23217 | 2 
| Bussa Surya | AM.SC.U4CSE23213 | 2 
| Eati Manoj | AM.SC.U4CSE23317 | 2 
| Kankanala Sanithya Reddy | AM.SC.U4CSE23327 | 2 

Each member has two prompt/output/verification records under `prompts/`. Technical allocation and evidence paths are recorded in `data/contributions.csv`.

## Selected real application

- Application: **Property Management**, an open-source Laravel rental-management application by Mohsin Rafique.
- Upstream URL: https://github.com/mohsin-rafique/property-management
- Baseline commit: `f127b4e218018715586a52cede08e182ca45c983`
- Baseline commit date: 2026-09-01.
- Access date: 2026-10-11.
- License: MIT (`Part1/code/LICENSE`).
- Framework: Laravel 12; PHP 8.2+; MySQL/MariaDB; Blade and Bootstrap 5.
- Faculty approval: pending human confirmation; it is not fabricated in this package.

`Part1/code` preserves the exact public baseline without its Git metadata, dependency cache, or environment file. `Part2/code` preserves the evolved source after the three required changes.

## Functional scope inspected

The baseline implements property, owner and tenant management, authentication, role authorization, rent/electricity/maintenance receipts, security deposits, and Blade views. Property search is a paginated listing before CH02. A dedicated lease entity, application notification workflow, and digital contract are absent in the baseline; that absence is recorded rather than hidden. CH03 adds digital-contract persistence and lifecycle behavior.

## Source versions

| Snapshot | Commit | Evidence |
|---|---|---|
| Public baseline | `f127b4e218018715586a52cede08e182ca45c983` | `Part1/code`, baseline manifest |
| After CH01 | `7e9bd9ded113e91cca10e727a7eeff29c88d0ed8` | Strategy pricing patch |
| After CH02 | `2b2dd6246dd50f4a53a991e5429b22da1b1a5c4f` | Specification filtering patch |
| After CH03 | `8e2af082067bb83aab7e40caf2b7a463fef8b643` | State contract patch |
| Verified final | `27b78c16c897c845efe052101e7f47f2ad7c25cf` | Corrected upstream example test plus evolution runner |

These commits were created in the preserved local evolution history. The final course-submission commit and pull-request URL must come from the team's GitHub fork.

## Three evolution scenarios

1. **CH01 - Dynamic pricing:** Strategy selects base or dynamic pricing. Dynamic pricing adds 20% in peak months 4, 5 and 12, adds 10% for occupancy at least 0.80, and subtracts 5% for leases of at least 12 months. `RentReceiptController` uses the injected strategy when dynamic pricing is requested.
2. **CH02 - Advanced filtering:** Specification composes case-insensitive address, maximum monthly rent, and status rules. `PropertyController` converts request filters into an AND specification.
3. **CH03 - Digital contracts:** State controls Draft to Sent to Signed/Expired transitions. A Laravel model and migration persist contract hashes and state.

## Pattern inventory

The public baseline contains five confirmed collaborations: MVC, Active Record, Chain of Responsibility, Template Method, and Laravel Facade. CH01 adds Strategy, CH02 adds Specification, and CH03 adds State. The final snapshot therefore contains eight pattern types and eight mapped instances.

## Environment and tests

- Laravel target: 12.x (`composer.lock` resolved Laravel 12.53.0 during verification).
- PHP: Composer 2 container and PHP 8.3 CLI container.
- Cross-language tools: versions are saved in `Part3/evidence/environment_versions.txt`.

From `B4/`:

```bash
# Syntax and the 10 evolution acceptance checks (no vendor folder required)
docker run --rm -v "$PWD/Part2/code:/app" -w /app php:8.3-cli \
  sh -lc 'find app database/migrations tests -type f -name "*.php" -print0 | xargs -0 -n1 php -l && php tests/pattern_evolution_runner.php'

# Full evolved Laravel test suite after installing dependencies in a disposable copy
docker run --rm -v "$PWD/Part2/code:/app" -w /app composer:2 install --no-interaction --no-progress --ignore-platform-reqs
docker run --rm -e APP_ENV=testing \
  -e APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
  -e DB_CONNECTION=sqlite -e DB_DATABASE=:memory: \
  -v "$PWD/Part2/code:/app" -w /app composer:2 php artisan test --colors=never

# Four-language checks and timings
bash Part3/run_all.sh

# Static metrics
python3 tools/metrics.py Part1/code/app
python3 tools/metrics.py Part2/code/app
```

Recorded results: evolved Laravel suite 2/2 passed, evolution acceptance runner 10/10 passed, Strategy 6/6 in every language, and Specification 5/5 in every language. The unchanged upstream baseline has one valid unit test and one stale example feature test that expects HTTP 200 even though `/` intentionally redirects to login; the final snapshot corrects that expectation.

## Measurement rules

- Production LOC: nonblank, noncomment physical PHP lines under `app/`; tests and dependencies excluded.
- Complexity upper bound: 1 plus decision tokens per file, using `tools/metrics.py` consistently.
- Timing: compile first, one warmup, five measured complete test processes, median reported.
- Pattern count: one independently collaborating set of participants equals one instance.

## Folder map

```text
B4/
  B4_Report.tex / B4_Report.pdf
  README.md / HUMAN_VERIFICATION.md
  data/                       CSV datasets and B4_Dataset.xlsx
  Part1/code/                 public baseline at the recorded commit
  Part1/diagrams, evidence/
  Part2/code/                 cumulative evolved application
  Part2/changes/CH01..CH03/   requirements and patches
  Part2/diagrams, evidence/
  Part3/                      two patterns in four languages
  prompts/                    two records per member
  tools/                      metrics, diagrams and workbook builder
```



## References

- Upstream application: https://github.com/mohsin-rafique/property-management
- Laravel 12 documentation: https://laravel.com/docs/12.x
- Gamma, Helm, Johnson, Vlissides, *Design Patterns*, Addison-Wesley, 1994.
