"""Command: automation/alert actions.

Derived from mycodo/actions/base_action.py (AbstractFunctionAction.run_action), mycodo/actions/email.py
and mycodo/actions/output_on_off.py (ActionModule.run_action). The receivers (check_allowed_to_email +
send_email, DaemonControl.output_on_off + the Output table) and the daemon-side invoker (outside the
Part 1 scope) are in-memory stand-ins; action options are constructor arguments instead of DB rows.
"""


class EmailService:
    """Receiver stand-in for check_allowed_to_email() and send_email()."""

    def __init__(self, hourly_max):
        self.hourly_max, self.email_count, self.log = hourly_max, 0, []

    def check_allowed(self):
        allowed = self.email_count < self.hourly_max
        self.email_count += 1
        return allowed

    def send_email(self, recipients, message):
        self.log.append(f"send_email to={';'.join(recipients)} body={message}")


class OutputControl:
    """Receiver stand-in for DaemonControl.output_on_off and the Output table lookup."""

    def __init__(self, outputs):
        self.outputs, self.log = outputs, []

    def output_name(self, output_id):
        return self.outputs.get(output_id)

    def output_on_off(self, output_id, state, amount, output_channel):
        self.log.append(f'output_on_off id={output_id} state={state} amount={amount} channel={output_channel}')


class AbstractFunctionAction:
    """Command: run_action(dict_vars) executes the stored request and returns dict_vars."""

    def run_action(self, dict_vars):
        pass


class EmailAction(AbstractFunctionAction):
    def __init__(self, email, service):
        self.email, self.service = email, service

    def run_action(self, dict_vars):
        value = dict_vars.get('value', {})
        if 'email_address' in value:
            email_recipients = [r for r in value['email_address'].split(';') if r]
        else:
            email_recipients = self.email.split(',')
        if not email_recipients:
            dict_vars['message'] += ' Error: No recipients specified.'
            return dict_vars
        message_send = value.get('message', False)
        if self.service.check_allowed():
            dict_vars['message'] += f" Email '{self.email}'."
            if not message_send:
                message_send = dict_vars['message']
            self.service.send_email(email_recipients, message_send)
        return dict_vars


class OutputOnOffAction(AbstractFunctionAction):
    def __init__(self, output_device_id, output_channel, state, duration, control):
        self.output_device_id, self.output_channel = output_device_id, output_channel
        self.state, self.duration, self.control = state, duration, control

    def run_action(self, dict_vars):
        value = dict_vars.get('value', {})
        output_id = value.get('output_id', self.output_device_id)
        channel = int(value['channel']) if 'channel' in value else self.output_channel
        state = value.get('state', self.state)
        duration = float(value['duration']) if 'duration' in value else self.duration
        output_name = self.control.output_name(output_id)
        if output_name is None:
            dict_vars['message'] += f" Error: Output with ID '{output_id}' not found."
            return dict_vars
        dict_vars['message'] += f' Turn output {output_id} CH{channel} ({output_name}) {state}'
        if state == 'on' and duration:
            dict_vars['message'] += f' for {duration} seconds'
        dict_vars['message'] += '.'
        self.control.output_on_off(output_id, state, duration, channel)
        return dict_vars


class ActionInvoker:
    """Invoker stand-in for the daemon's trigger_action(action_id, value)."""

    def __init__(self):
        self.actions = {}

    def register(self, action_id, action):
        self.actions[action_id] = action

    def trigger_action(self, action_id, dict_vars):
        if action_id not in self.actions:
            raise KeyError(f"Action with ID '{action_id}' not found")
        return self.actions[action_id].run_action(dict_vars)
