# Baseline participant counts (backing for report Section 2.1)

## Concrete participant classes (app-authored classes that play a role) — 10
1. CustomUserDetails            (Adapter)           modal/CustomUserDetails.java:10
2. Users                        (Adaptee)           modal/Users.java:8
3. CustomUserDetailsService     (Client)            service/CustomUserDetailsService.java:24
4. SecurityConfiguration        (ConcreteClass/Context) config/SecurityConfiguration.java:23
5. anonymous BCryptPasswordEncoder subclass (ConcreteStrategy, stubbed) config/SecurityConfiguration.java:57
6. CaseRepository               (ConcreteRepository, representative of 15) repository/CaseRepository.java:12
7. Case                         (Entity)            modal/Case.java
8. CaseService                  (DI Context)        service/CaseService.java:16
9. EmailServiceImpl             (Notifier)          mail/EmailServiceImpl.java
10. LegalAppApplication         (scheduler publisher) LegalAppApplication.java:25

## Unique participant symbols (distinct classes/interfaces/methods, shared counted once) — 14
App-authored (10 above) + framework roles referenced once each:
11. UserDetails           (Target interface, Spring)
12. WebSecurityConfigurerAdapter (AbstractClass, Spring)
13. PasswordEncoder       (Strategy interface, Spring)
14. CrudRepository/JpaRepository (Repository interface, Spring Data)

Rationale: the 15 repository interfaces share the Repository role and the CrudRepository
abstraction, so they are counted ONCE (one instance type, one representative concrete class).
