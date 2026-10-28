'use strict';
/**
 * Proxy: daemon RPC client.
 * Derived from mycodo/mycodo_client.py (DaemonControl: proxy, check_daemon, output_on, output_off,
 * output_state, output_on_off), which wraps a Pyro5.api.Proxy to the Mycodo daemon. The Pyro5 network
 * layer and the daemon (RealSubject) are replaced by in-memory stand-ins; `network` is a Map from a URI
 * to the daemon registered there.
 */

class CommunicationError extends Error {}
class RemoteTimeoutError extends Error {}

/** RealSubject stand-in for the Mycodo daemon; latency is simulated (no sleeping). */
class Daemon {
  constructor(latency = 0, healthMessage = '') {
    Object.assign(this, { latency, healthMessage, states: new Map() });
  }

  checkDaemon() { return this.healthMessage; }

  outputOn(outputId, amount, outputChannel) {
    this.states.set(`${outputId}#${outputChannel}`, 'on');
    const duration = amount > 0 ? ` for ${amount} s` : '';
    return `0 Output ${outputId} CH${outputChannel} ON${duration}`;
  }

  outputOff(outputId, outputChannel) {
    this.states.set(`${outputId}#${outputChannel}`, 'off');
    return `0 Output ${outputId} CH${outputChannel} OFF`;
  }

  outputState(outputId, outputChannel) {
    return this.states.get(`${outputId}#${outputChannel}`) || 'off';
  }
}

/** Stand-in for Pyro5.api.Proxy: returns an ES Proxy that checks the connection and forwards any method. */
class RemoteProxy {
  constructor(uri, network) {
    this.timeout = null;
    return new Proxy(this, {
      get(target, name) {
        if (name === 'timeout') return target.timeout;
        const daemon = network.get(uri);
        if (daemon === undefined) throw new CommunicationError(`cannot connect to ${uri}`);
        if (daemon.latency > target.timeout) throw new RemoteTimeoutError(`call exceeded ${target.timeout} s timeout`);
        return daemon[name].bind(daemon);
      },
    });
  }
}

/** Proxy: communicate with the daemon to execute commands or retrieve information. */
class DaemonControl {
  constructor(network, pyroUri = 'PYRO:mycodo@localhost:9080', pyroTimeout = null) {
    Object.assign(this, { network, uri: pyroUri, pyroTimeout: pyroTimeout || 30 });
  }

  proxy(timeout = null) {
    const proxy = new RemoteProxy(this.uri, this.network);
    proxy.timeout = timeout || this.pyroTimeout;
    return proxy;
  }

  checkDaemon() {
    const proxy = this.proxy();
    const oldTimeout = proxy.timeout;
    try {
      proxy.timeout = 10;
      const result = proxy.checkDaemon();
      return result || 'GOOD';
    } catch (err) {
      if (err instanceof RemoteTimeoutError) return `Pyro5 TimeoutError: ${err.message}`;
      if (err instanceof CommunicationError) return `Pyro5 Communication error: ${err.message}`;
      return `Pyro Exception: ${err.message}`;
    } finally {
      proxy.timeout = oldTimeout;
    }
  }

  outputOn(outputId, amount = 0, outputChannel = null) { return this.proxy().outputOn(outputId, amount, outputChannel); }

  outputOff(outputId, outputChannel = null) { return this.proxy().outputOff(outputId, outputChannel); }

  outputState(outputId, outputChannel) { return this.proxy().outputState(outputId, outputChannel); }

  /** Turn an output on or off (local dispatch, no remote call for an invalid state). */
  outputOnOff(outputId, state, amount = 0, outputChannel = null) {
    if (['on', '1', 'true'].includes(state)) return this.outputOn(outputId, amount, outputChannel);
    if (['off', '0', 'false'].includes(state)) return this.outputOff(outputId, outputChannel);
    return `1 state not "on", 1, True, "off", 0, or False. Found: "${state}"`;
  }
}

module.exports = { CommunicationError, RemoteTimeoutError, Daemon, RemoteProxy, DaemonControl };
