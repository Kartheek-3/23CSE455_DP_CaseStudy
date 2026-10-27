class HttpError extends Error {                  // TranslatedException (base): carries the HTTP status and a message
  constructor(status, message) { super(message); this.status = status; }
}
class BadRequest extends HttpError { constructor(m) { super(400, m); } }
class NotFound extends HttpError { constructor(m) { super(404, m); } }

class AccountService {                           // Raiser
  deposit(amount) {
    if (amount <= 0) throw new BadRequest('Deposit must be positive');
    return 'ok';
  }
  find(id) {
    if (id !== 1) throw new NotFound('Account not found');
    return 'account 1';
  }
  boom() { throw new Error('unexpected'); }
}

function translate(action) {                     // Translator: the boundary that turns exceptions into responses
  try {
    return '200 ' + action();
  } catch (e) {
    return e instanceof HttpError ? `${e.status} ${e.message}` : '500 Internal error';
  }
}

module.exports = { AccountService, translate };
