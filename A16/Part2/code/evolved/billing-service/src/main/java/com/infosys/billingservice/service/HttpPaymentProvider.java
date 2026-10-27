package com.infosys.billingservice.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
@Component @Profile("external-payments")
public class HttpPaymentProvider implements PaymentProvider {
 private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
 private final URI endpoint;
 private final String token;
 public HttpPaymentProvider(@Value("${payments.api-url}") String apiUrl,@Value("${payments.api-token:}") String token) { this.endpoint=URI.create(apiUrl); this.token=token; }
 @Override public String charge(Long invoiceId, BigDecimal amount) {
  try {
   String body="{\"invoiceId\":"+invoiceId+",\"amount\":"+amount.toPlainString()+"}";
   HttpRequest.Builder request=HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(5)).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body));
   if(!token.isBlank()) request.header("Authorization","Bearer "+token);
   HttpResponse<String> response=client.send(request.build(),HttpResponse.BodyHandlers.ofString());
   if(response.statusCode()<200 || response.statusCode()>=300) throw new IllegalStateException("Payment provider returned HTTP "+response.statusCode());
   return response.headers().firstValue("X-Payment-Reference").orElse("EXTERNAL-"+invoiceId);
  } catch(InterruptedException e){Thread.currentThread().interrupt(); throw new IllegalStateException("Payment request interrupted.",e);} catch(java.io.IOException e){throw new IllegalStateException("Payment provider unavailable.",e);}
 }
}
