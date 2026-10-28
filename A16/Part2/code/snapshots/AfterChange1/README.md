# Evolved application source

Standalone Spring Boot microservice modules are aggregated by `pom.xml`. Build/test all modules with `mvn test`; build one service with `mvn -f <module>/pom.xml package`. Configuration secrets must be supplied as environment variables. See the team-root README for environment versions, startup instructions and external-provider settings.
