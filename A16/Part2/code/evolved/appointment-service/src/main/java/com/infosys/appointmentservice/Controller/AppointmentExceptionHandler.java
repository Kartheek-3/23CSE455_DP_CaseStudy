package com.infosys.appointmentservice.Controller;

import com.infosys.appointmentservice.exception.PatientNotFoundException;
import com.infosys.appointmentservice.exception.PatientServiceUnavailableException;
import com.infosys.appointmentservice.exception.DoctorNotFoundException;
import com.infosys.appointmentservice.exception.DoctorServiceUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AppointmentExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleInvalidRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(new ApiError("invalid_request", exception.getMessage()));
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ApiError> handlePatientNotFound(PatientNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("patient_not_found", exception.getMessage()));
    }

    @ExceptionHandler(PatientServiceUnavailableException.class)
    public ResponseEntity<ApiError> handlePatientServiceUnavailable(PatientServiceUnavailableException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiError("patient_service_unavailable", exception.getMessage()));
    }

    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<ApiError> handleDoctorNotFound(DoctorNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("doctor_not_found", exception.getMessage()));
    }

    @ExceptionHandler(DoctorServiceUnavailableException.class)
    public ResponseEntity<ApiError> handleDoctorServiceUnavailable(DoctorServiceUnavailableException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiError("doctor_service_unavailable", exception.getMessage()));
    }

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<ApiError> handleMissingAppointment(java.util.NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("appointment_not_found", exception.getMessage()));
    }

    public record ApiError(String error, String message) {
    }
}
