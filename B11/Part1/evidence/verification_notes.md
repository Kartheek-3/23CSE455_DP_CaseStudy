# Part 1 — Human verification notes

Every pattern below was verified by a team member reading the cited source line,
not accepted on the model's assertion. A class name or annotation alone is insufficient.

| Pattern | Claim | Verified at | Verdict |
|---------|-------|-------------|---------|
| Adapter | CustomUserDetails adapts Users -> UserDetails | modal/CustomUserDetails.java:10, getAuthorities:23 | CONFIRMED |
| Template Method | configure(...) overrides called by framework | config/SecurityConfiguration.java:23,29,35 | CONFIRMED |
| Strategy | PasswordEncoder injected into auth context | config/SecurityConfiguration.java:31,57 | CONFIRMED (concrete strategy stubbed) |
| Repository | CrudRepository/JpaRepository interfaces | repository/*.java (15 files) | CONFIRMED (1 type) |
| Copy Constructor | Users(Users) copies all fields | modal/Users.java:38 | CONFIRMED |
| Dependency Injection | constructor injection | service/CaseService.java:20 | CONFIRMED as framework idiom |
| Observer | scheduler -> email notification | LegalAppApplication.java:25 + EmailServiceImpl | UNCERTAIN — no Subject keeps an observer list; scheduler-triggered broadcast |

Rejected: Singleton (Spring singleton-scoped beans are not the GoF getInstance idiom),
Factory, Builder, Decorator — not found in the application's own code.
