package com.infosys.billingservice.service;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;
import java.time.Duration;
@Configuration public class PaymentCircuitBreakerConfiguration {
 @Bean PaymentCircuitBreaker paymentCircuitBreaker(){return new PaymentCircuitBreaker(2,Duration.ofSeconds(30),Clock.systemUTC());}
}
