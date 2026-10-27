package com.infosys.appointmentservice.exception;
public class DoctorServiceUnavailableException extends RuntimeException { public DoctorServiceUnavailableException(Throwable cause){super("Doctor Service is currently unavailable.",cause);} }
