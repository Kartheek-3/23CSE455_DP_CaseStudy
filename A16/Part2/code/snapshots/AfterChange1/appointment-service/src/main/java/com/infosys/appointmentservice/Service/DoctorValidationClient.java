package com.infosys.appointmentservice.Service;
import com.infosys.appointmentservice.exception.DoctorNotFoundException;
import com.infosys.appointmentservice.exception.DoctorServiceUnavailableException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
@Component
public class DoctorValidationClient {
 private final RestTemplate restTemplate; private final WebClient.Builder webClientBuilder;
 public DoctorValidationClient(RestTemplate restTemplate,WebClient.Builder webClientBuilder){this.restTemplate=restTemplate;this.webClientBuilder=webClientBuilder;}
 public void validateRestTemplate(Long id){try{if(restTemplate.getForObject("http://DOCTOR-SERVICE/doctors/{id}",Object.class,id)==null)throw new DoctorNotFoundException(id);}catch(HttpClientErrorException.NotFound e){throw new DoctorNotFoundException(id);}catch(RestClientException e){throw new DoctorServiceUnavailableException(e);}}
 public void validateWebClient(Long id){try{Object doctor=webClientBuilder.build().get().uri("http://DOCTOR-SERVICE/doctors/{id}",id).retrieve().bodyToMono(Object.class).block();if(doctor==null)throw new DoctorNotFoundException(id);}catch(WebClientResponseException.NotFound e){throw new DoctorNotFoundException(id);}catch(WebClientException e){throw new DoctorServiceUnavailableException(e);}}
}
