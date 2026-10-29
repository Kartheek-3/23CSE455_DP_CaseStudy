const NOOP = 'noop';

class RealAnalytics {
  track(event) { return 'real:track ' + event; }
  page(name) { return 'real:page ' + name; }
  identify(user) { return 'real:identify ' + user; }
}

class AnalyticsProxy {
  constructor(analytics) { this.analytics = analytics ?? null; }

  setAnalytics(analytics) {
    if (this.analytics) throw new Error('Analytics instance already exists.');
    this.analytics = analytics;
  }

  track(event) { return this.analytics?.track(event) ?? NOOP; }
  page(name) { return this.analytics?.page(name) ?? NOOP; }
  identify(user) { return this.analytics?.identify(user) ?? NOOP; }
}

module.exports = { AnalyticsProxy, RealAnalytics };
