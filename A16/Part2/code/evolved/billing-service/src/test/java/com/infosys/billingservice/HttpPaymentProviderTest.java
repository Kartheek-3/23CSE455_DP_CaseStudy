package com.infosys.billingservice;
import com.infosys.billingservice.service.HttpPaymentProvider;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import static org.junit.jupiter.api.Assertions.*;
class HttpPaymentProviderTest {
 @Test void sendsPaymentAndReadsProviderReference() throws Exception {HttpServer server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);server.createContext("/payments",exchange->{byte[] body=exchange.getRequestBody().readAllBytes();assertTrue(new String(body,StandardCharsets.UTF_8).contains("invoiceId"));exchange.getResponseHeaders().add("X-Payment-Reference","provider-ref-42");exchange.sendResponseHeaders(201,-1);exchange.close();});server.start();try{HttpPaymentProvider provider=new HttpPaymentProvider("http://127.0.0.1:"+server.getAddress().getPort()+"/payments","");assertEquals("provider-ref-42",provider.charge(42L,new BigDecimal("125.50")));}finally{server.stop(0);}}
 @Test void rejectsUnsuccessfulProviderResponse() throws Exception {HttpServer server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);server.createContext("/payments",exchange->{exchange.sendResponseHeaders(503,-1);exchange.close();});server.start();try{HttpPaymentProvider provider=new HttpPaymentProvider("http://127.0.0.1:"+server.getAddress().getPort()+"/payments","");assertThrows(IllegalStateException.class,()->provider.charge(42L,new BigDecimal("125.50")));}finally{server.stop(0);}}
}
