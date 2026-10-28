// Command: automation/alert actions. run_action(dict_vars) executes the stored request.
// Derived from mycodo/actions/base_action.py (AbstractFunctionAction.run_action), mycodo/actions/email.py
// and mycodo/actions/output_on_off.py (ActionModule.run_action). The receivers (check_allowed_to_email +
// send_email, DaemonControl.output_on_off + the Output table) and the daemon-side invoker (outside the
// Part 1 scope) are in-memory stand-ins; action options are constructor arguments instead of DB rows.
#pragma once
#include <map>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// The request: an optional message and a value map.
struct DictVars {
    bool has_message;
    std::string message;
    std::map<std::string, std::string> value;
    void append_message(const std::string& text) {
        if (!has_message) throw std::out_of_range("'message'");
        message += text;
    }
};

// Receiver stand-in for check_allowed_to_email() and send_email().
class EmailService {
public:
    explicit EmailService(int hourly_max) : hourly_max_(hourly_max) {}
    bool check_allowed() { return email_count_++ < hourly_max_; }
    void send_email(const std::vector<std::string>& recipients, const std::string& message) {
        std::string joined;
        for (const std::string& r : recipients) joined += (joined.empty() ? "" : ";") + r;
        log.push_back("send_email to=" + joined + " body=" + message);
    }
    std::vector<std::string> log;

private:
    int hourly_max_;
    int email_count_ = 0;
};

// Receiver stand-in for DaemonControl.output_on_off and the Output table lookup.
class OutputControl {
public:
    explicit OutputControl(std::map<std::string, std::string> outputs) : outputs_(std::move(outputs)) {}
    const std::string* output_name(const std::string& output_id) const {
        const auto found = outputs_.find(output_id);
        return found == outputs_.end() ? nullptr : &found->second;
    }
    void output_on_off(const std::string& output_id, const std::string& state, double amount, int output_channel) {
        std::ostringstream entry;
        entry << "output_on_off id=" << output_id << " state=" << state << " amount=" << amount << " channel=" << output_channel;
        log.push_back(entry.str());
    }
    std::vector<std::string> log;

private:
    std::map<std::string, std::string> outputs_;
};

// Command interface.
class AbstractFunctionAction {
public:
    virtual ~AbstractFunctionAction() = default;
    virtual DictVars& run_action(DictVars& dict_vars) = 0;
};

class EmailAction : public AbstractFunctionAction {
public:
    EmailAction(std::string email, EmailService& service) : email_(std::move(email)), service_(service) {}
    DictVars& run_action(DictVars& dict_vars) override {
        std::vector<std::string> email_recipients;
        const auto address = dict_vars.value.find("email_address");
        if (address != dict_vars.value.end()) {
            for (const std::string& r : split(address->second, ';')) if (!r.empty()) email_recipients.push_back(r);
        } else {
            email_recipients = split(email_, ',');
        }
        if (email_recipients.empty()) {
            dict_vars.append_message(" Error: No recipients specified.");
            return dict_vars;
        }
        const auto message = dict_vars.value.find("message");
        std::string message_send = message != dict_vars.value.end() ? message->second : "";
        if (service_.check_allowed()) {
            dict_vars.append_message(" Email '" + email_ + "'.");
            if (message_send.empty()) message_send = dict_vars.message;
            service_.send_email(email_recipients, message_send);
        }
        return dict_vars;
    }

private:
    // Like Python str.split(sep): "" -> [""], "a,"-> ["a", ""].
    static std::vector<std::string> split(const std::string& text, char sep) {
        std::vector<std::string> out(1);
        for (char ch : text) {
            if (ch == sep) out.emplace_back();
            else out.back() += ch;
        }
        return out;
    }
    std::string email_;
    EmailService& service_;
};

class OutputOnOffAction : public AbstractFunctionAction {
public:
    OutputOnOffAction(std::string output_device_id, int output_channel, std::string state, double duration, OutputControl& control)
        : output_device_id_(std::move(output_device_id)), output_channel_(output_channel), state_(std::move(state)),
          duration_(duration), control_(control) {}
    DictVars& run_action(DictVars& dict_vars) override {
        const auto& v = dict_vars.value;
        const std::string output_id = v.count("output_id") ? v.at("output_id") : output_device_id_;
        const int channel = v.count("channel") ? std::stoi(v.at("channel")) : output_channel_;
        const std::string state = v.count("state") ? v.at("state") : state_;
        const double duration = v.count("duration") ? std::stod(v.at("duration")) : duration_;
        const std::string* output_name = control_.output_name(output_id);
        if (!output_name) {
            dict_vars.append_message(" Error: Output with ID '" + output_id + "' not found.");
            return dict_vars;
        }
        std::ostringstream text;
        text << " Turn output " << output_id << " CH" << channel << " (" << *output_name << ") " << state;
        if (state == "on" && duration != 0) text << " for " << duration << " seconds";
        dict_vars.append_message(text.str() + ".");
        control_.output_on_off(output_id, state, duration, channel);
        return dict_vars;
    }

private:
    std::string output_device_id_;
    int output_channel_;
    std::string state_;
    double duration_;
    OutputControl& control_;
};

// Invoker stand-in for the daemon's trigger_action(action_id, value); owns the registered actions.
class ActionInvoker {
public:
    void register_action(const std::string& action_id, std::unique_ptr<AbstractFunctionAction> action) {
        actions_[action_id] = std::move(action);
    }
    DictVars& trigger_action(const std::string& action_id, DictVars& dict_vars) {
        const auto found = actions_.find(action_id);
        if (found == actions_.end()) throw std::out_of_range("Action with ID '" + action_id + "' not found");
        return found->second->run_action(dict_vars);
    }

private:
    std::map<std::string, std::unique_ptr<AbstractFunctionAction>> actions_;
};
