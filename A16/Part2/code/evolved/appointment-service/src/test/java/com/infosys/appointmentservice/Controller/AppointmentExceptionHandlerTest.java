package com.infosys.appointmentservice.Controller;

import com.infosys.appointmentservice.exception.PatientNotFoundException;
import com.infosys.appointmentservice.exception.PatientServiceUnavailableException;
import com.infosys.appointmentservice.exception.DoctorNotFoundException;
import com.infosys.appointmentservice.exception.DoctorServiceUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AppointmentExceptionHandlerTest {

    private final AppointmentExceptionHandler exceptionHandler = new AppointmentExceptionHandler();

    @Test
    void invalidRequestMapsToBadRequest() {
        ResponseEntity<AppointmentExceptionHandler.ApiError> response =
                exceptionHandler.handleInvalidRequest(new IllegalArgumentException("Patient ID must be provided."));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("invalid_request", response.getBody().error());
    }

    @Test
    void missingPatientMapsToNotFound() {
        ResponseEntity<AppointmentExceptionHandler.ApiError> response =
                exceptionHandler.handlePatientNotFound(new PatientNotFoundException("Patient was not found."));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("patient_not_found", response.getBody().error());
    }

    @Test
    void patientServiceFailureMapsToServiceUnavailable() {
        ResponseEntity<AppointmentExceptionHandler.ApiError> response =
                exceptionHandler.handlePatientServiceUnavailable(new PatientServiceUnavailableException(
                        new IllegalStateException("connection refused")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("patient_service_unavailable", response.getBody().error());
    }

    @Test
    void missingDoctorMapsToNotFound() {
        ResponseEntity<AppointmentExceptionHandler.ApiError> response =
                exceptionHandler.handleDoctorNotFound(new DoctorNotFoundException(7L));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("doctor_not_found", response.getBody().error());
    }

    @Test
    void doctorServiceFailureMapsToServiceUnavailable() {
        ResponseEntity<AppointmentExceptionHandler.ApiError> response =
                exceptionHandler.handleDoctorServiceUnavailable(new DoctorServiceUnavailableException(
                        new IllegalStateException("connection refused")));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("doctor_service_unavailable", response.getBody().error());
    }
}
