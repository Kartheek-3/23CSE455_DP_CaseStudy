class ApiController {
  constructor(authenticate, limit = 2) {
    this.authenticate = authenticate;
    this.limit = limit;
    this.endpoints = new Map();
    this.calls = new Map();
  }

  register(endpoint) { this.endpoints.set(endpoint.name, endpoint); }

  handle(name, token, body) {
    const endpoint = this.endpoints.get(name);
    if (!endpoint) return { status: 404, text: 'no such endpoint' };
    const user = this.authenticate(token);
    if (endpoint.requireCredential && user == null) return { status: 401, text: 'credential required' };
    const actor = user ?? 'anon';
    const calls = this.calls.get(actor) ?? 0;
    if (calls >= this.limit) return { status: 429, text: 'rate limited' };
    this.calls.set(actor, calls + 1);
    return { status: 200, text: endpoint.execute(body, user) };
  }
}

module.exports = { ApiController };
