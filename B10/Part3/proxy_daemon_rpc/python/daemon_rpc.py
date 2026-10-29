"""Proxy: daemon RPC client.

Derived from mycodo/mycodo_client.py (DaemonControl: proxy, check_daemon, output_on, output_off,
output_state, output_on_off), which wraps a Pyro5.api.Proxy to the Mycodo daemon. The Pyro5 network
layer and the daemon (RealSubject, outside the Part 1 scope) are replaced by in-memory stand-ins;
`network` maps a URI to the daemon object registered there.
"""


class CommunicationError(Exception):
    """Stand-in for Pyro5.errors.CommunicationError."""


class RemoteTimeoutError(Exception):
    """Stand-in for Pyro5.errors.TimeoutError."""


class Daemon:
    """RealSubject stand-in for the Mycodo daemon; latency is simulated (no sleeping)."""

    def __init__(self, latency=0.0, health_message=''):
        self.latency, self.health_message, self.states = latency, health_message, {}

    def check_daemon(self):
        return self.health_message

    def output_on(self, output_id, amount, output_channel):
        self.states[(output_id, output_channel)] = 'on'
        return f'0 Output {output_id} CH{output_channel} ON' + (f' for {amount} s' if amount > 0 else '')

    def output_off(self, output_id, output_channel):
        self.states[(output_id, output_channel)] = 'off'
        return f'0 Output {output_id} CH{output_channel} OFF'

    def output_state(self, output_id, output_channel):
        return self.states.get((output_id, output_channel), 'off')


class RemoteProxy:
    """Stand-in for Pyro5.api.Proxy: forwards any attribute access to the daemon at the URI."""

    def __init__(self, uri, network):
        self.uri, self.network, self.timeout = uri, network, None

    def __getattr__(self, name):
        daemon = self.network.get(self.uri)
        if daemon is None:
            raise CommunicationError(f'cannot connect to {self.uri}')
        if daemon.latency > self.timeout:
            raise RemoteTimeoutError(f'call exceeded {self.timeout} s timeout')
        return getattr(daemon, name)


class DaemonControl:
    """Proxy: communicate with the daemon to execute commands or retrieve information."""

    def __init__(self, network, pyro_uri='PYRO:mycodo@localhost:9080', pyro_timeout=None):
        self.network, self.uri = network, pyro_uri
        self.pyro_timeout = pyro_timeout if pyro_timeout else 30

    def proxy(self, timeout=None):
        proxy = RemoteProxy(self.uri, self.network)
        proxy.timeout = timeout if timeout else self.pyro_timeout
        return proxy

    def check_daemon(self):
        proxy = self.proxy()
        old_timeout = proxy.timeout
        try:
            proxy.timeout = 10
            result = proxy.check_daemon()
            return result if result else 'GOOD'
        except RemoteTimeoutError as err:
            return f'Pyro5 TimeoutError: {err}'
        except CommunicationError as err:
            return f'Pyro5 Communication error: {err}'
        except Exception as err:
            return f'Pyro Exception: {err}'
        finally:
            proxy.timeout = old_timeout

    def output_on(self, output_id, amount=0.0, output_channel=None):
        return self.proxy().output_on(output_id, amount, output_channel)

    def output_off(self, output_id, output_channel=None):
        return self.proxy().output_off(output_id, output_channel)

    def output_state(self, output_id, output_channel):
        return self.proxy().output_state(output_id, output_channel)

    def output_on_off(self, output_id, state, amount=0.0, output_channel=None):
        """Turn an output on or off (local dispatch, no remote call for an invalid state)."""
        if state in ('on', '1', 'true'):
            return self.output_on(output_id, amount=amount, output_channel=output_channel)
        if state in ('off', '0', 'false'):
            return self.output_off(output_id, output_channel=output_channel)
        return f'1 state not "on", 1, True, "off", 0, or False. Found: "{state}"'
