import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Command: automation/alert actions. run_action(dict_vars) executes the stored request.
 * Derived from mycodo/actions/base_action.py (AbstractFunctionAction.run_action), mycodo/actions/email.py
 * and mycodo/actions/output_on_off.py (ActionModule.run_action). The receivers (check_allowed_to_email +
 * send_email, DaemonControl.output_on_off + the Output table) and the daemon-side invoker (outside the
 * Part 1 scope) are in-memory stand-ins; action options are constructor arguments instead of DB rows.
 */
public abstract class AbstractFunctionAction {
    public abstract DictVars runAction(DictVars dictVars);
}

/** The request: an optional message (null = absent) and a value map. */
final class DictVars {
    String message;
    final Map<String, String> value;

    DictVars(String message, Map<String, String> value) {
        this.message = message;
        this.value = value;
    }

    void appendMessage(String text) {
        if (message == null) throw new NoSuchElementException("'message'");
        message += text;
    }
}

/** Receiver stand-in for check_allowed_to_email() and send_email(). */
class EmailService {
    private final int hourlyMax;
    private int emailCount = 0;
    final List<String> log = new ArrayList<>();

    EmailService(int hourlyMax) { this.hourlyMax = hourlyMax; }

    boolean checkAllowed() {
        boolean allowed = emailCount < hourlyMax;
        emailCount++;
        return allowed;
    }

    void sendEmail(List<String> recipients, String message) {
        log.add("send_email to=" + String.join(";", recipients) + " body=" + message);
    }
}

/** Receiver stand-in for DaemonControl.output_on_off and the Output table lookup. */
class OutputControl {
    private final Map<String, String> outputs;
    final List<String> log = new ArrayList<>();

    OutputControl(Map<String, String> outputs) { this.outputs = outputs; }

    String outputName(String outputId) { return outputs.get(outputId); }

    void outputOnOff(String outputId, String state, double amount, int outputChannel) {
        log.add("output_on_off id=" + outputId + " state=" + state + " amount=" + amount + " channel=" + outputChannel);
    }
}

class EmailAction extends AbstractFunctionAction {
    private final String email;
    private final EmailService service;

    EmailAction(String email, EmailService service) {
        this.email = email;
        this.service = service;
    }

    @Override
    public DictVars runAction(DictVars dictVars) {
        List<String> emailRecipients = new ArrayList<>();
        if (dictVars.value.containsKey("email_address")) {
            for (String r : dictVars.value.get("email_address").split(";")) if (!r.isEmpty()) emailRecipients.add(r);
        } else {
            emailRecipients.addAll(Arrays.asList(email.split(",", -1)));
        }
        if (emailRecipients.isEmpty()) {
            dictVars.appendMessage(" Error: No recipients specified.");
            return dictVars;
        }
        String messageSend = dictVars.value.get("message");
        if (service.checkAllowed()) {
            dictVars.appendMessage(" Email '" + email + "'.");
            if (messageSend == null || messageSend.isEmpty()) messageSend = dictVars.message;
            service.sendEmail(emailRecipients, messageSend);
        }
        return dictVars;
    }
}

class OutputOnOffAction extends AbstractFunctionAction {
    private final String outputDeviceId, state;
    private final int outputChannel;
    private final double duration;
    private final OutputControl control;

    OutputOnOffAction(String outputDeviceId, int outputChannel, String state, double duration, OutputControl control) {
        this.outputDeviceId = outputDeviceId;
        this.outputChannel = outputChannel;
        this.state = state;
        this.duration = duration;
        this.control = control;
    }

    @Override
    public DictVars runAction(DictVars dictVars) {
        Map<String, String> v = dictVars.value;
        String outputId = v.getOrDefault("output_id", outputDeviceId);
        int channel = v.containsKey("channel") ? Integer.parseInt(v.get("channel")) : outputChannel;
        String newState = v.getOrDefault("state", state);
        double newDuration = v.containsKey("duration") ? Double.parseDouble(v.get("duration")) : duration;
        String outputName = control.outputName(outputId);
        if (outputName == null) {
            dictVars.appendMessage(" Error: Output with ID '" + outputId + "' not found.");
            return dictVars;
        }
        dictVars.appendMessage(" Turn output " + outputId + " CH" + channel + " (" + outputName + ") " + newState);
        if (newState.equals("on") && newDuration != 0) dictVars.appendMessage(" for " + newDuration + " seconds");
        dictVars.appendMessage(".");
        control.outputOnOff(outputId, newState, newDuration, channel);
        return dictVars;
    }
}

/** Invoker stand-in for the daemon's trigger_action(action_id, value). */
class ActionInvoker {
    private final Map<String, AbstractFunctionAction> actions = new HashMap<>();

    void register(String actionId, AbstractFunctionAction action) { actions.put(actionId, action); }

    DictVars triggerAction(String actionId, DictVars dictVars) {
        AbstractFunctionAction action = actions.get(actionId);
        if (action == null) throw new NoSuchElementException("Action with ID '" + actionId + "' not found");
        return action.runAction(dictVars);
    }
}
