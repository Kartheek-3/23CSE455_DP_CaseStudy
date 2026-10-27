class Totp {
  constructor(provider) { this.provider = provider; }
  authenticate(code) { return this.provider(code); }
}
class Recovery {
  constructor(provider) { this.provider = provider; }
  authenticate(code) { return this.provider(code); }
}
class Login {
  constructor(strategy) { this.strategy = strategy; }
  authenticate(code) { return this.strategy.authenticate(code); }
}
module.exports = {Totp, Recovery, Login};
