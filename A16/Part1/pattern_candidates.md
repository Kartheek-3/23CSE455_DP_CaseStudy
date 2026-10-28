# Pattern candidates and exclusions

The baseline version is the supplied ZIP, identified by SHA-256 `fc355ebd1b3c5b4f94fb3dd39a71737ebf4f16610da10a5ae9ae29f71e4fc962`. Paths and lines below are relative to ZIP root.

| Candidate | Decision | Evidence and reason |
|---|---|---|
| Strategy | Rejected | No interchangeable application-owned algorithms or context selecting among them. Two appointment HTTP clients are separate endpoint implementations, not selected algorithms behind a common strategy interface. |
| Observer / event-driven messaging | Rejected | No event publisher/listener, broker, or asynchronous event flow in supplied modules. |
| Service Layer | Rejected as architectural pattern | Auth, Patient and Appointment controllers call repositories directly; `JwtService` is a focused token helper, not a business-service boundary. |
| Singleton | Rejected as GoF pattern | Spring-managed beans are singleton-scoped by default, but source does not explicitly implement an application-owned singleton lifecycle. |
| Factory | Rejected | No application-owned factory selects/creates varying products. Framework bean methods construct configured clients, but are configuration methods rather than a demonstrated GoF Factory instance. |
| Circuit Breaker / fallback | Rejected | No Resilience4j dependency/configuration, state machine, retry policy, or fallback. Appointment's try/catch translates errors but does not prevent repeated calls. |
| Config Server | Rejected | No Spring Cloud Config Server module or remote centralized configuration client. |
| Full Model-View-Controller | Uncertain / excluded from count | REST controllers and entities exist, but there is no View component. Recorded as REST-controller framework usage, not a full GoF MVC implementation. |
| Builder | Excluded from counts | Fluent builders occur in JJWT (`Jwts.builder()`; JwtService.java:16-23), Spring Security (`HttpSecurity`; SecurityConfig.java:19-25), and WebClient. They are dependency/framework APIs, not an application-owned Builder with a separately implemented product and construction process. |
| DTO | Absent in baseline | Original registration endpoint accepts and returns `User` entity (auth-service/.../AuthController.java:26-33). Phase 1 remediation added a response DTO in the working copy only; it is not baseline evidence. |
| Distributed tracing | Configured, runtime not verified end-to-end | Properties configure Micrometer tracing/Zipkin, but Zipkin server was not present during smoke run. Do not count as a verified operational pattern. |

## Known baseline gaps (not existing patterns/features)

No Doctor, Pharmacy, Laboratory, Billing, or Notification service exists in the archive. No Config Server, message broker, external integration adapter, or circuit breaker exists either. These absences are inputs to Part 2 design, not Part 1 instances.
