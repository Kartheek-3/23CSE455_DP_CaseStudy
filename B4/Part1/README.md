# Part 1 - Pattern discovery

`code/` is the source of the public MIT-licensed application at upstream commit `f127b4e218018715586a52cede08e182ca45c983`, accessed 2026-10-11. Git metadata, `vendor/`, `node_modules/`, and `.env` are intentionally excluded.

The inspected baseline patterns are MVC, Active Record, Chain of Responsibility, Template Method, and Laravel Facade. `../data/patterns.csv` is the authoritative participant-to-source mapping. The baseline implements property, owner, tenant, authentication, authorization, receipt/payment, and security-deposit modules. It has no dedicated lease entity or application notification workflow; those absences are recorded honestly.

The unchanged upstream test suite has one passing unit test and one stale feature expectation: the test expects `/` to return 200 although the route intentionally redirects to login. Syntax validation succeeds. The evolved snapshot corrects only that test expectation and adds feature-specific checks.
