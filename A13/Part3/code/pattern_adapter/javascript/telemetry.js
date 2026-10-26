const DEFAULT_SHUTDOWN_TIMEOUT = 5000;

// Translates the application's telemetry calls into the Sentry SDK's API.
class SentryTelemetryAdapter {
  constructor(sentry) { this.sentry = sentry; }

  captureMessage(message, userId) {
    const options = { level: 'error' };
    if (userId != null) options['user.id'] = userId;
    this.sentry.captureMessage(message, options);
  }

  startSpan(name, fn) { return this.sentry.startSpan({ name }, fn); }

  shutdown() { this.sentry.close(DEFAULT_SHUTDOWN_TIMEOUT); }
}

class TelemetryRegistry {
  constructor(adapters) { this.adapters = [...adapters]; }

  captureMessage(message, userId) {
    for (const adapter of this.adapters) adapter.captureMessage(message, userId);
  }

  startSpan(name, fn) { return this.span(0, name, fn); }

  span(index, name, fn) {
    if (index === this.adapters.length) return fn();
    return this.adapters[index].startSpan(name, () => this.span(index + 1, name, fn));
  }

  shutdown() {
    for (const adapter of this.adapters) adapter.shutdown();
  }
}

module.exports = { SentryTelemetryAdapter, TelemetryRegistry };
