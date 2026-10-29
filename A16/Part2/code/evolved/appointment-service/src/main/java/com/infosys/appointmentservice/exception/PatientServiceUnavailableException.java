package com.infosys.appointmentservice.exception;

public class PatientServiceUnavailableException extends RuntimeException {
    public PatientServiceUnavailableException(Throwable cause) {
        super("Patient Service is currently unavailable.", cause);
    }
}
