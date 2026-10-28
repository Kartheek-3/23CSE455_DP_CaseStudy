'use strict';
/**
 * Command: automation/alert actions. runAction(dictVars) executes the stored request.
 * Derived from mycodo/actions/base_action.py (AbstractFunctionAction.run_action), mycodo/actions/email.py
 * and mycodo/actions/output_on_off.py (ActionModule.run_action). The receivers (check_allowed_to_email +
 * send_email, DaemonControl.output_on_off + the Output table) and the daemon-side invoker (outside the
 * Part 1 scope) are in-memory stand-ins; action options are constructor arguments instead of DB rows.
 */

/** Append to dictVars.message; like Python's dict_vars['message'] += ..., a missing key is an error. */
function appendMessage(dictVars, text) {
  if (!('message' in dictVars)) throw new Error("KeyError: 'message'");
  dictVars.message += text;
}

/** Receiver stand-in for check_allowed_to_email() and send_email(). */
class EmailService {
  constructor(hourlyMax) {
    Object.assign(this, { hourlyMax, emailCount: 0, log: [] });
  }

  checkAllowed() {
    const allowed = this.emailCount < this.hourlyMax;
    this.emailCount += 1;
    return allowed;
  }

  sendEmail(recipients, message) {
    this.log.push(`send_email to=${recipients.join(';')} body=${message}`);
  }
}

/** Receiver stand-in for DaemonControl.output_on_off and the Output table lookup. */
class OutputControl {
  constructor(outputs) {
    Object.assign(this, { outputs, log: [] });
  }

  outputName(outputId) { return outputId in this.outputs ? this.outputs[outputId] : null; }

  outputOnOff(outputId, state, amount, outputChannel) {
    this.log.push(`output_on_off id=${outputId} state=${state} amount=${amount} channel=${outputChannel}`);
  }
}

/** Command interface. */
class AbstractFunctionAction {
  runAction(dictVars) { // eslint-disable-line no-unused-vars
    return undefined;
  }
}

class EmailAction extends AbstractFunctionAction {
  constructor(email, service) {
    super();
    Object.assign(this, { email, service });
  }

  runAction(dictVars) {
    const value = dictVars.value || {};
    const emailRecipients = 'email_address' in value
      ? value.email_address.split(';').filter((r) => r !== '') : this.email.split(',');
    if (emailRecipients.length === 0) {
      appendMessage(dictVars, ' Error: No recipients specified.');
      return dictVars;
    }
    let messageSend = 'message' in value ? value.message : false;
    if (this.service.checkAllowed()) {
      appendMessage(dictVars, ` Email '${this.email}'.`);
      if (!messageSend) messageSend = dictVars.message;
      this.service.sendEmail(emailRecipients, messageSend);
    }
    return dictVars;
  }
}

class OutputOnOffAction extends AbstractFunctionAction {
  constructor(outputDeviceId, outputChannel, state, duration, control) {
    super();
    Object.assign(this, { outputDeviceId, outputChannel, state, duration, control });
  }

  runAction(dictVars) {
    const value = dictVars.value || {};
    const outputId = 'output_id' in value ? value.output_id : this.outputDeviceId;
    const channel = 'channel' in value ? Number(value.channel) : this.outputChannel;
    const state = 'state' in value ? value.state : this.state;
    const duration = 'duration' in value ? Number(value.duration) : this.duration;
    const outputName = this.control.outputName(outputId);
    if (outputName === null) {
      appendMessage(dictVars, ` Error: Output with ID '${outputId}' not found.`);
      return dictVars;
    }
    appendMessage(dictVars, ` Turn output ${outputId} CH${channel} (${outputName}) ${state}`);
    if (state === 'on' && duration) appendMessage(dictVars, ` for ${duration} seconds`);
    appendMessage(dictVars, '.');
    this.control.outputOnOff(outputId, state, duration, channel);
    return dictVars;
  }
}

/** Invoker stand-in for the daemon's trigger_action(action_id, value). */
class ActionInvoker {
  constructor() {
    this.actions = new Map();
  }

  register(actionId, action) { this.actions.set(actionId, action); }

  triggerAction(actionId, dictVars) {
    if (!this.actions.has(actionId)) throw new Error(`Action with ID '${actionId}' not found`);
    return this.actions.get(actionId).runAction(dictVars);
  }
}

module.exports = { EmailService, OutputControl, AbstractFunctionAction, EmailAction, OutputOnOffAction, ActionInvoker };
