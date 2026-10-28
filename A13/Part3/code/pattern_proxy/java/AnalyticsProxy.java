interface AnalyticsInstance {
    String track(String event);
    String page(String name);
    String identify(String user);
}

class RealAnalytics implements AnalyticsInstance {
    public String track(String event) { return "real:track " + event; }

    public String page(String name) { return "real:page " + name; }

    public String identify(String user) { return "real:identify " + user; }
}

public class AnalyticsProxy implements AnalyticsInstance {
    private static final String NOOP = "noop";
    private AnalyticsInstance analytics;

    public AnalyticsProxy() {}

    public void setAnalytics(AnalyticsInstance analytics) {
        if (this.analytics != null) throw new IllegalStateException("Analytics instance already exists.");
        this.analytics = analytics;
    }

    public String track(String event) {
        return analytics == null ? NOOP : analytics.track(event);
    }

    public String page(String name) {
        return analytics == null ? NOOP : analytics.page(name);
    }

    public String identify(String user) {
        return analytics == null ? NOOP : analytics.identify(user);
    }
}
