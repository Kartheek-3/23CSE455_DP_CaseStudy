package com.infosys.appointmentservice.Controller;

import com.infosys.appointmentservice.Entity.Appointment;
import com.infosys.appointmentservice.exception.PatientNotFoundException;
import com.infosys.appointmentservice.exception.PatientServiceUnavailableException;
import com.infosys.appointmentservice.exception.DoctorNotFoundException;
import com.infosys.appointmentservice.exception.DoctorServiceUnavailableException;
import com.infosys.appointmentservice.Service.DoctorValidationClient;
import com.infosys.appointmentservice.Service.NotificationClient;
import com.infosys.appointmentservice.Repository.AppointmentRepo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentRepo appointmentRepo;

    private final RestTemplate restTemplate;

    private final WebClient.Builder webClientBuilder;
    private final DoctorValidationClient doctorValidationClient;
    private final NotificationClient notificationClient;

    public AppointmentController(AppointmentRepo appointmentRepo, RestTemplate restTemplate,
                                 WebClient.Builder webClientBuilder, DoctorValidationClient doctorValidationClient,
                                 NotificationClient notificationClient) {
        this.appointmentRepo = appointmentRepo;
        this.restTemplate = restTemplate;
        this.webClientBuilder = webClientBuilder;
        this.doctorValidationClient = doctorValidationClient;
        this.notificationClient = notificationClient;
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentRepo.findById(id).orElse(null);
    }

    @PutMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        Appointment appointment = appointmentRepo.findById(id).orElseThrow(() -> new java.util.NoSuchElementException("Appointment not found."));
        appointment.setStatus("CANCELLED");
        Appointment saved = appointmentRepo.save(appointment);
        notificationClient.notify(saved.getPatientId(), saved.getId(), "APPOINTMENT_CANCELLED", "Your appointment has been cancelled.");
        return saved;
    }

    @PostMapping("/rest-template")
    public Appointment createAppointmentWithRestTemplate(@RequestBody Appointment appointment) {
        if (appointment.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID must be provided.");
        }

        // Validate patient existence using RestTemplate
        try {
            String url = "http://PATIENT-SERVICE/patients/" + appointment.getPatientId();
            Object patient = restTemplate.getForObject(url, Object.class);
            if (patient == null) {
                throw new PatientNotFoundException("Patient with ID " + appointment.getPatientId() + " does not exist.");
            }
        } catch (HttpClientErrorException.NotFound e) {
            throw new PatientNotFoundException("Patient with ID " + appointment.getPatientId() + " does not exist.");
        } catch (RestClientException e) {
            throw new PatientServiceUnavailableException(e);
        }

        if (appointment.getDoctorId() == null) {
            throw new IllegalArgumentException("Doctor ID must be provided.");
        }
        doctorValidationClient.validateRestTemplate(appointment.getDoctorId());
        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) appointment.setStatus("SCHEDULED");
        Appointment saved = appointmentRepo.save(appointment);
        notificationClient.notify(saved.getPatientId(), saved.getId(), "APPOINTMENT_CONFIRMED", "Your appointment has been scheduled.");
        return saved;
    }

    @PostMapping("/webclient")
    public Appointment createAppointmentWithWebClient(@RequestBody Appointment appointment) {
        if (appointment.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID must be provided.");
        }

        // Validate patient existence using WebClient
        try {
            String url = "http://PATIENT-SERVICE/patients/" + appointment.getPatientId();
            Object patient = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block(); // Synchronous block for simplicity
            
            if (patient == null) {
                throw new PatientNotFoundException("Patient with ID " + appointment.getPatientId() + " does not exist.");
            }
        } catch (WebClientResponseException.NotFound e) {
            throw new PatientNotFoundException("Patient with ID " + appointment.getPatientId() + " does not exist.");
        } catch (WebClientException e) {
            throw new PatientServiceUnavailableException(e);
        }

        if (appointment.getDoctorId() == null) {
            throw new IllegalArgumentException("Doctor ID must be provided.");
        }
        doctorValidationClient.validateWebClient(appointment.getDoctorId());
        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) appointment.setStatus("SCHEDULED");
        Appointment saved = appointmentRepo.save(appointment);
        notificationClient.notify(saved.getPatientId(), saved.getId(), "APPOINTMENT_CONFIRMED", "Your appointment has been scheduled.");
        return saved;
    }
}
