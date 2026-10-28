# Part 1 — Baseline analysis

## Baseline identity and scope

Analysis uses the supplied archive `Hospital-Management-System-Using-MicroServices-And-SpringBoot-main.zip`, SHA-256 `fc355ebd1b3c5b4f94fb3dd39a71737ebf4f16610da10a5ae9ae29f71e4fc962`. The source copy at `../data/code/original/` preserves the original module paths and line numbers. Credential-bearing configuration values in the copy have been replaced by an environment placeholder; the supplied archive remains outside the submission folder.

## Architecture summary

The baseline contains Eureka Server, Hospital Gateway, Auth Service, Patient Service and Appointment Service. Gateway routes and a JWT global filter protect the API edge. Eureka provides service registration and discovery. Auth, Patient and Appointment use Spring Data JPA and PostgreSQL. Appointment validates patient IDs through load-balanced RestTemplate and WebClient alternatives.

The editable diagrams are `pattern_architecture.mmd` and `uml.mmd`; `pattern_architecture.svg` is the companion image. `Part1_prompt.txt` preserves the provided prompt. The local `llm.csv` contains the required audit schema with no data rows because no auditable Part 1 transcript was exported.

## Pattern inventory

`patterns.csv` follows the seven-column schema: `source_version`, `pattern_name`, `pattern_type`, `instance_name`, `participant_roles`, `source_locations`, `intent_and_evidence`. Each row records one confirmed Original code collaboration. Evidence paths point to `../data/code/original/` and retain source line ranges.

`Pattern_count.csv` follows the four-column schema: `source_version`, `summary`, `pattern_name`, `count`. It records the baseline's 11 confirmed instances across six pattern labels. `pattern_candidates.md` records rejected, uncertain and absent candidates.

## Separate remediation record

Phase 1 fixes return a safe registration response DTO instead of the User entity and distinguish invalid appointment input, missing patients and patient-service unavailability with 400/404/503 responses. They are remediation changes, not baseline evidence.

## Baseline gaps for Part 2

Doctor, Pharmacy, Laboratory, Billing and Notification are absent from the supplied baseline and were added in Part 2 as new features.

## References

- [Spring Cloud Netflix / Eureka reference](https://docs.spring.io/spring-cloud-netflix/reference/spring-cloud-netflix.html)
- [Spring Cloud Gateway Global Filters reference](https://docs.spring.io/spring-cloud-gateway/reference/5.1/spring-cloud-gateway-server-webflux/global-filters.html)
- [Spring Data JPA repository definitions](https://docs.spring.io/spring-data/jpa/reference/repositories/definition.html)
- [Spring Cloud release train compatibility](https://spring.io/projects/spring-cloud/)
- [JJWT README](https://github.com/jwtk/jjwt/blob/main/README.adoc)
