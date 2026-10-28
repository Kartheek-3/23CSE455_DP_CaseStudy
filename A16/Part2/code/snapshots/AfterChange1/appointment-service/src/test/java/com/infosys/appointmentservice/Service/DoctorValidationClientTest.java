package com.infosys.appointmentservice.Service;
import com.infosys.appointmentservice.exception.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class DoctorValidationClientTest {
 private final RestTemplate rest=mock(RestTemplate.class);
 private final DoctorValidationClient client=new DoctorValidationClient(rest,WebClient.builder());
 @Test void acceptsExistingDoctor(){when(rest.getForObject("http://DOCTOR-SERVICE/doctors/{id}",Object.class,5L)).thenReturn(java.util.Map.of("id",5));assertDoesNotThrow(()->client.validateRestTemplate(5L));}
 @Test void mapsMissingDoctor(){when(rest.getForObject("http://DOCTOR-SERVICE/doctors/{id}",Object.class,5L)).thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND,"missing",org.springframework.http.HttpHeaders.EMPTY,null,null));assertThrows(DoctorNotFoundException.class,()->client.validateRestTemplate(5L));}
 @Test void mapsDoctorServiceOutage(){when(rest.getForObject("http://DOCTOR-SERVICE/doctors/{id}",Object.class,5L)).thenThrow(new ResourceAccessException("offline"));assertThrows(DoctorServiceUnavailableException.class,()->client.validateRestTemplate(5L));}
}
