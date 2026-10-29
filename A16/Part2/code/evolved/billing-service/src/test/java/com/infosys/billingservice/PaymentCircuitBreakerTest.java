package com.infosys.billingservice;
import com.infosys.billingservice.service.PaymentCircuitBreaker;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.concurrent.atomic.AtomicLong;
import static org.junit.jupiter.api.Assertions.*;
class PaymentCircuitBreakerTest {
 @Test void opensAfterThresholdAndRecoversAfterCooldown(){AtomicLong time=new AtomicLong(0);Clock clock=new Clock(){public ZoneId getZone(){return ZoneOffset.UTC;}public Clock withZone(ZoneId zone){return this;}public Instant instant(){return Instant.ofEpochMilli(time.get());}};PaymentCircuitBreaker breaker=new PaymentCircuitBreaker(2,Duration.ofSeconds(5),clock);
  assertThrows(IllegalStateException.class,()->breaker.execute(()->{throw new IllegalStateException();}));assertThrows(IllegalStateException.class,()->breaker.execute(()->{throw new IllegalStateException();}));assertEquals("OPEN",breaker.state());assertThrows(PaymentCircuitBreaker.CircuitOpenException.class,()->breaker.execute(()->"no"));time.set(5000);assertEquals("HALF_OPEN",breaker.state());assertEquals("ok",breaker.execute(()->"ok"));assertEquals("CLOSED",breaker.state());}
}
