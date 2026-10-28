import java.util.HashMap;
import java.util.Map;

/**
 * Proxy: daemon RPC client.
 * Derived from mycodo/mycodo_client.py (DaemonControl: proxy, check_daemon, output_on, output_off,
 * output_state, output_on_off), which wraps a Pyro5.api.Proxy to the Mycodo daemon. The Pyro5 network
 * layer and the daemon (RealSubject) are replaced by in-memory stand-ins; `network` maps a URI to the
 * daemon registered there. DaemonApi is the Subject interface that Java needs to type the forwarding.
 */
public class DaemonControl implements DaemonApi {
    private final Map<String, Daemon> network;
    private final String uri;
    private final double pyroTimeout;

    public DaemonControl(Map<String, Daemon> network, String pyroUri, Double pyroTimeout) {
        this.network = network;
        this.uri = pyroUri;
        this.pyroTimeout = pyroTimeout != null ? pyroTimeout : 30;
    }

    RemoteProxy proxy(Double timeout) {
        RemoteProxy proxy = new RemoteProxy(uri, network);
        proxy.timeout = timeout != null ? timeout : pyroTimeout;
        return proxy;
    }

    @Override
    public String checkDaemon() {
        RemoteProxy proxy = proxy(null);
        double oldTimeout = proxy.timeout;
        try {
            proxy.timeout = 10;
            String result = proxy.checkDaemon();
            return result.isEmpty() ? "GOOD" : result;
        } catch (RemoteTimeoutError e) {
            return "Pyro5 TimeoutError: " + e.getMessage();
        } catch (CommunicationError e) {
            return "Pyro5 Communication error: " + e.getMessage();
        } catch (RuntimeException e) {
            return "Pyro Exception: " + e.getMessage();
        } finally {
            proxy.timeout = oldTimeout;
        }
    }

    @Override
    public String outputOn(String outputId, double amount, int outputChannel) {
        return proxy(null).outputOn(outputId, amount, outputChannel);
    }

    @Override
    public String outputOff(String outputId, int outputChannel) {
        return proxy(null).outputOff(outputId, outputChannel);
    }

    @Override
    public String outputState(String outputId, int outputChannel) {
        return proxy(null).outputState(outputId, outputChannel);
    }

    /** Turn an output on or off (local dispatch, no remote call for an invalid state). */
    public String outputOnOff(String outputId, String state, double amount, int outputChannel) {
        switch (state) {
            case "on": case "1": case "true":
                return outputOn(outputId, amount, outputChannel);
            case "off": case "0": case "false":
                return outputOff(outputId, outputChannel);
            default:
                return "1 state not \"on\", 1, True, \"off\", 0, or False. Found: \"" + state + "\"";
        }
    }
}

/** Subject: the operations offered by the daemon (implicit in the Python source). */
interface DaemonApi {
    String checkDaemon();
    String outputOn(String outputId, double amount, int outputChannel);
    String outputOff(String outputId, int outputChannel);
    String outputState(String outputId, int outputChannel);
}

class CommunicationError extends RuntimeException {
    CommunicationError(String message) { super(message); }
}

class RemoteTimeoutError extends RuntimeException {
    RemoteTimeoutError(String message) { super(message); }
}

/** RealSubject stand-in for the Mycodo daemon; latency is simulated (no sleeping). */
class Daemon implements DaemonApi {
    final double latency;
    final String healthMessage;
    private final Map<String, String> states = new HashMap<>();

    Daemon(double latency, String healthMessage) {
        this.latency = latency;
        this.healthMessage = healthMessage;
    }

    public String checkDaemon() { return healthMessage; }

    public String outputOn(String outputId, double amount, int outputChannel) {
        states.put(outputId + "#" + outputChannel, "on");
        return "0 Output " + outputId + " CH" + outputChannel + " ON" + (amount > 0 ? " for " + amount + " s" : "");
    }

    public String outputOff(String outputId, int outputChannel) {
        states.put(outputId + "#" + outputChannel, "off");
        return "0 Output " + outputId + " CH" + outputChannel + " OFF";
    }

    public String outputState(String outputId, int outputChannel) {
        return states.getOrDefault(outputId + "#" + outputChannel, "off");
    }
}

/** Stand-in for Pyro5.api.Proxy: checks the connection, then forwards to the daemon at the URI. */
class RemoteProxy implements DaemonApi {
    private final String uri;
    private final Map<String, Daemon> network;
    double timeout;

    RemoteProxy(String uri, Map<String, Daemon> network) {
        this.uri = uri;
        this.network = network;
    }

    private Daemon daemon() {
        Daemon daemon = network.get(uri);
        if (daemon == null) throw new CommunicationError("cannot connect to " + uri);
        if (daemon.latency > timeout) throw new RemoteTimeoutError("call exceeded " + timeout + " s timeout");
        return daemon;
    }

    public String checkDaemon() { return daemon().checkDaemon(); }

    public String outputOn(String outputId, double amount, int outputChannel) {
        return daemon().outputOn(outputId, amount, outputChannel);
    }

    public String outputOff(String outputId, int outputChannel) { return daemon().outputOff(outputId, outputChannel); }

    public String outputState(String outputId, int outputChannel) { return daemon().outputState(outputId, outputChannel); }
}
