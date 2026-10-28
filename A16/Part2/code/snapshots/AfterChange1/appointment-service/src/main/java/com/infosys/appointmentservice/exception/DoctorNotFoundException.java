package com.infosys.appointmentservice.exception;
public class DoctorNotFoundException extends RuntimeException { public DoctorNotFoundException(Long id){super("Doctor with ID "+id+" does not exist.");} }
