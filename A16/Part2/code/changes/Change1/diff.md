# Change 1 — Doctor, Pharmacy and Laboratory

## Before / after

Before, appointments referenced patients but not a Doctor entity, and the archive contained no Doctor, Pharmacy or Laboratory service. After, Doctor profiles are registered with Eureka and routed by Gateway; both appointment client paths require and validate `doctorId`. Separate Pharmacy and Laboratory services persist their own medication/test orders linked by `patientId` and `appointmentId`.

## Source areas

`doctor-service/` (application, entity, repository, controller); `pharmacy-service/`; `laboratory-service/`; `appointment-service/src/main/java/com/infosys/appointmentservice/Entity/Appointment.java`; `appointment-service/src/main/java/com/infosys/appointmentservice/Service/DoctorValidationClient.java`; `appointment-service/src/main/java/com/infosys/appointmentservice/Controller/AppointmentController.java`; `hospital-gateway/src/main/resources/application.properties`; root `pom.xml`.

## Verification

See `../../../../data/test_result/part2-unit-tests.md` and `../../../../data/test_result/part2-smoke.md`: both appointment transports accepted a registered doctor, unknown doctor returned 404, Doctor CRUD route worked, and Pharmacy/Laboratory order routes returned HTTP 200. Doctor dependency exceptions map to 404/503 in unit tests.
