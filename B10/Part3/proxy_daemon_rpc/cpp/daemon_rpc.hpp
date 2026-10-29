// Proxy: daemon RPC client.
// Derived from mycodo/mycodo_client.py (DaemonControl: proxy, check_daemon, output_on, output_off,
// output_state, output_on_off), which wraps a Pyro5.api.Proxy to the Mycodo daemon. The Pyro5 network
// layer and the daemon (RealSubject) are replaced by in-memory stand-ins; `network` maps a URI to the
// daemon registered there (non-owning pointers). DaemonApi is the Subject interface C++ needs.
#pragma once
#include <map>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>

// Subject: the operations offered by the daemon (implicit in the Python source).
class DaemonApi {
public:
    virtual ~DaemonApi() = default;
    virtual std::string check_daemon() = 0;
    virtual std::string output_on(const std::string& output_id, double amount, int output_channel) = 0;
    virtual std::string output_off(const std::string& output_id, int output_channel) = 0;
    virtual std::string output_state(const std::string& output_id, int output_channel) = 0;
};

struct CommunicationError : std::runtime_error { using std::runtime_error::runtime_error; };
struct RemoteTimeoutError : std::runtime_error { using std::runtime_error::runtime_error; };

// RealSubject stand-in for the Mycodo daemon; latency is simulated (no sleeping).
class Daemon : public DaemonApi {
public:
    Daemon(double latency, std::string health_message) : latency(latency), health_message_(std::move(health_message)) {}
    std::string check_daemon() override { return health_message_; }
    std::string output_on(const std::string& output_id, double amount, int output_channel) override {
        states_[{output_id, output_channel}] = "on";
        std::ostringstream out;
        out << "0 Output " << output_id << " CH" << output_channel << " ON";
        if (amount > 0) out << " for " << amount << " s";
        return out.str();
    }
    std::string output_off(const std::string& output_id, int output_channel) override {
        states_[{output_id, output_channel}] = "off";
        return "0 Output " + output_id + " CH" + std::to_string(output_channel) + " OFF";
    }
    std::string output_state(const std::string& output_id, int output_channel) override {
        const auto found = states_.find({output_id, output_channel});
        return found == states_.end() ? "off" : found->second;
    }
    const double latency;

private:
    std::string health_message_;
    std::map<std::pair<std::string, int>, std::string> states_;
};

using Network = std::map<std::string, Daemon*>;

// Stand-in for Pyro5.api.Proxy: checks the connection, then forwards to the daemon at the URI.
class RemoteProxy : public DaemonApi {
public:
    RemoteProxy(std::string uri, const Network& network) : uri_(std::move(uri)), network_(network) {}
    std::string check_daemon() override { return daemon().check_daemon(); }
    std::string output_on(const std::string& id, double amount, int ch) override { return daemon().output_on(id, amount, ch); }
    std::string output_off(const std::string& id, int ch) override { return daemon().output_off(id, ch); }
    std::string output_state(const std::string& id, int ch) override { return daemon().output_state(id, ch); }
    double timeout = 0;

private:
    Daemon& daemon() const {
        const auto found = network_.find(uri_);
        if (found == network_.end()) throw CommunicationError("cannot connect to " + uri_);
        if (found->second->latency > timeout) {
            std::ostringstream message;
            message << "call exceeded " << timeout << " s timeout";
            throw RemoteTimeoutError(message.str());
        }
        return *found->second;
    }
    std::string uri_;
    const Network& network_;
};

// Proxy: communicate with the daemon to execute commands or retrieve information.
class DaemonControl : public DaemonApi {
public:
    DaemonControl(const Network& network, std::string pyro_uri, double pyro_timeout = 0)
        : network_(network), uri_(std::move(pyro_uri)), pyro_timeout_(pyro_timeout > 0 ? pyro_timeout : 30) {}

    std::unique_ptr<RemoteProxy> proxy(double timeout = 0) const {
        std::unique_ptr<RemoteProxy> proxy(new RemoteProxy(uri_, network_));
        proxy->timeout = timeout > 0 ? timeout : pyro_timeout_;
        return proxy;
    }
    std::string check_daemon() override {
        const std::unique_ptr<RemoteProxy> proxy = this->proxy();
        const double old_timeout = proxy->timeout;
        std::string result;
        try {
            proxy->timeout = 10;
            const std::string reply = proxy->check_daemon();
            result = reply.empty() ? "GOOD" : reply;
        } catch (const RemoteTimeoutError& e) {
            result = std::string("Pyro5 TimeoutError: ") + e.what();
        } catch (const CommunicationError& e) {
            result = std::string("Pyro5 Communication error: ") + e.what();
        } catch (const std::exception& e) {
            result = std::string("Pyro Exception: ") + e.what();
        }
        proxy->timeout = old_timeout;  // the Python "finally"
        return result;
    }
    std::string output_on(const std::string& id, double amount, int ch) override { return proxy()->output_on(id, amount, ch); }
    std::string output_off(const std::string& id, int ch) override { return proxy()->output_off(id, ch); }
    std::string output_state(const std::string& id, int ch) override { return proxy()->output_state(id, ch); }

    // Turn an output on or off (local dispatch, no remote call for an invalid state).
    std::string output_on_off(const std::string& id, const std::string& state, double amount, int ch) {
        if (state == "on" || state == "1" || state == "true") return output_on(id, amount, ch);
        if (state == "off" || state == "0" || state == "false") return output_off(id, ch);
        return "1 state not \"on\", 1, True, \"off\", 0, or False. Found: \"" + state + "\"";
    }

private:
    const Network& network_;
    std::string uri_;
    double pyro_timeout_;
};
