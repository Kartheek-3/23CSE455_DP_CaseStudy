package com.infosys.billingservice.service;
import java.time.Clock;
import java.time.Duration;
import java.util.function.Supplier;
/** Small CLOSED/OPEN/HALF_OPEN breaker around the external provider call. */
public class PaymentCircuitBreaker {
 private final int failureThreshold;
 private final long openMillis;
 private final Clock clock;
 private int failures;
 private long openedAt=-1;
 public PaymentCircuitBreaker(int failureThreshold, Duration openDuration, Clock clock) { this.failureThreshold=failureThreshold; this.openMillis=openDuration.toMillis(); this.clock=clock; }
 public synchronized <T> T execute(Supplier<T> call) {
  long now=clock.millis();
  if(openedAt>=0 && now-openedAt<openMillis) throw new CircuitOpenException();
  try { T result=call.get(); failures=0; openedAt=-1; return result; }
  catch(RuntimeException failure) { failures++; if(failures>=failureThreshold) openedAt=clock.millis(); throw failure; }
 }
 public synchronized String state() { if(openedAt<0) return "CLOSED"; return clock.millis()-openedAt<openMillis ? "OPEN" : "HALF_OPEN"; }
 public static final class CircuitOpenException extends RuntimeException { public CircuitOpenException(){super("Payment provider circuit is open; retry later.");} }
}
